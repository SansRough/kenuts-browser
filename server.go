package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"
	"github.com/fsnotify/fsnotify"
)

var watcher *fsnotify.Watcher

// Simple logger interface for dependency inversion
type Logger interface {
	Infof(format string, v ...interface{})
	Errorf(format string, v ...interface{})
}

// StdLogger implements Logger using fmt.Println
type StdLogger struct{}

func (l *StdLogger) Infof(format string, v ...interface{})  { fmt.Printf("INFO: "+format+"\n", v...) }
func (l *StdLogger) Errorf(format string, v ...interface{}) { fmt.Printf("ERROR: "+format+"\n", v...) }

// FileSystem abstracts file access so we can mock it in tests
type FileSystem interface {
	ReadFile(path string) ([]byte, error)
}

// OSFileSystem reads
type OSFileSystem struct{}

func (fs *OSFileSystem) ReadFile(path string) ([]byte, error) { return os.ReadFile(path) }

// Config holds server configuration
type Config struct {
	Addr            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	MaxHeaderLines  int
	IndexFile       string
	ShutdownTimeout time.Duration
}

// Server represents the KENUTS server (SOLID - S, O)
type Server struct {
	cfg     Config
	ln      net.Listener
	fs      FileSystem
	logger  Logger
	index   []byte // cached index.html
	mu      sync.RWMutex
	closing chan struct{}
}

// NewServer constructs a Server instance
func NewServer(cfg Config, fs FileSystem, logger Logger) *Server {
	if fs == nil {
		fs = &OSFileSystem{}
	}
	if logger == nil {
		logger = &StdLogger{}
	}
	return &Server{cfg: cfg, fs: fs, logger: logger, closing: make(chan struct{})}
}

// loadIndex reads and caches the index file. Returns descriptive error if missing
func (s *Server) loadIndex() error {
	data, err := s.fs.ReadFile(s.cfg.IndexFile)
	if err != nil {
		return fmt.Errorf("read index file: %w", err)
	}
	// Basic validation
	if len(data) == 0 {
		return errors.New("index file is empty")
	}
	// Cache
	s.mu.Lock()
	s.index = data
	s.mu.Unlock()
	return nil
}

// Start begins listening and accepting connections
func (s *Server) Start(ctx context.Context) error {
	ln, err := net.Listen("tcp", s.cfg.Addr)
	if err != nil {
		return err
	}
	s.ln = ln
	go s.acceptLoop(ctx)
	return nil
}

func (s *Server) acceptLoop(ctx context.Context) {
	s.logger.Infof("KENUTS server listening on %s", s.cfg.Addr)
	for {
		select {
		case <-ctx.Done():
			s.logger.Infof("shutting down accept loop")
			return
		case <-s.closing:
			s.logger.Infof("server closing")
			return
		default:
			// continue to accept
		}

		conn, err := s.ln.Accept()
		if err != nil {
			// If listener closed, exit
			if ne, ok := err.(net.Error); ok && ne.Temporary() {
				s.logger.Errorf("temporary accept error: %v", err)
				time.Sleep(100 * time.Millisecond)
				continue
			}
			s.logger.Errorf("accept error: %v", err)
			return
		}
		// Per-connection goroutine
		go s.handleConnection(conn)
	}
}

// Stop initiates graceful shutdown
func (s *Server) Stop() {
	close(s.closing)
	if s.ln != nil {
		s.ln.Close()
	}
}

// handleConnection is small and testable. It adheres to timeouts and validates input.
func (s *Server) handleConnection(conn net.Conn) {
	defer conn.Close()
	remote := conn.RemoteAddr().String()
	s.logger.Infof("connection from: %s", remote)
	// set read deadline
	conn.SetReadDeadline(time.Now().Add(s.cfg.ReadTimeout))
	reader := bufio.NewReader(conn)

	// Read request line (e.g., "GET / HTTP/1.1" in this simple protocol)
	requestLine, err := readLine(reader)
	if err != nil {
		s.logger.Errorf("read request line: %v", err)
		return
	}
	requestLine = strings.TrimSpace(requestLine)
	if requestLine == "" {
		s.logger.Errorf("empty request line from %s", remote)
		return
	}
	// Simple parsing: method and path
    parts := strings.SplitN(requestLine, " ", 3)
    if len(parts) < 1 {
        s.logger.Errorf("malformed request line: %q", requestLine)
        return
    }

    var method string
    var path string

    if strings.ToUpper(parts[0]) == "KENUTS" && len(parts) >= 2 {
        method = strings.ToUpper(parts[1])
        if len(parts) >= 3 {
            path = parts[2]
        } else {
            path = "/"
        }
    } else {
        method = strings.ToUpper(parts[0])
        if len(parts) >= 2 {
            path = parts[1]
        } else {
            path = "/"
        }
    }

    // Read headers up to configured limit
    headers, err := readHeaders(reader, s.cfg.MaxHeaderLines)
    if err != nil {
        s.logger.Errorf("read headers: %v", err)
        return
    }
    _ = headers

    // Prepare response based on method/path
    if method != "GET" && method != "HEAD" {
        writeSimpleResponse(conn, s.cfg.WriteTimeout, "ZG/1.0 405 Method Not Allowed", "Method Not Allowed")
        return
    }

	// serve index for root or any path (original behavior)
	s.mu.RLock()
	body := make([]byte, len(s.index))
	copy(body, s.index)
	s.mu.RUnlock()

	headersOut := []string{
		"ZG/1.0 200 OK",
		"ZG-Power: MAXIMUM",
		fmt.Sprintf("Content-Length: %d", len(body)),
		"Content-Type: text/html; charset=utf-8",
	}
	resp := strings.Join(headersOut, "\r\n") + "\r\n\r\n"

	conn.SetWriteDeadline(time.Now().Add(s.cfg.WriteTimeout))
	if _, err := io.WriteString(conn, resp); err != nil {
		s.logger.Errorf("write headers: %v", err)
		return
	}
	if _, err := conn.Write(body); err != nil {
		s.logger.Errorf("write body: %v", err)
		return
	}
	// success
	s.logger.Infof("responded 200 OK to %s %s", remote, path)
}

// Helper: readLine returns a single line without trailing CR/LF
func readLine(r *bufio.Reader) (string, error) {
	line, err := r.ReadString('\n')
	if err != nil {
		return "", err
	}
	return strings.TrimRight(line, "\r\n"), nil
}

// Helper: readHeaders reads up to maxLines header lines and returns as map
func readHeaders(r *bufio.Reader, maxLines int) (map[string]string, error) {
	headers := make(map[string]string)
	for i := 0; i < maxLines; i++ {
		line, err := readLine(r)
		if err != nil {
			return nil, err
		}
		line = strings.TrimSpace(line)
		if line == "" {
			return headers, nil // end of headers
		}
		// Split into key: value
		if idx := strings.Index(line, ":"); idx > 0 {
			k := strings.TrimSpace(line[:idx])
			v := strings.TrimSpace(line[idx+1:])
			headers[strings.ToLower(k)] = v
		} else {
			// malformed header, ignore but continue
		}
	}
	return nil, errors.New("too many header lines")
}

// Helper: writeSimpleResponse writes a minimal text response with a status line and body
func writeSimpleResponse(conn net.Conn, timeout time.Duration, statusLine, body string) {
	conn.SetWriteDeadline(time.Now().Add(timeout))
	resp := statusLine + "\r\n\r\n" + body
	conn.Write([]byte(resp))
}

func (s *Server) watchIndex() error {
    var err error
    watcher, err = fsnotify.NewWatcher()
    if err != nil {
        return err
    }
    go func() {
        for {
            select {
            case event := <-watcher.Events:
                if event.Op&fsnotify.Write == fsnotify.Write {
                    s.logger.Infof("index.html değişti, reload ediliyor")
                    if err := s.loadIndex(); err != nil {
                        s.logger.Errorf("index reload hatası: %v", err)
                    }
                }
            case err := <-watcher.Errors:
                s.logger.Errorf("watcher error: %v", err)
            }
        }
    }()
    return watcher.Add(s.cfg.IndexFile)
}

func main() {
	cfg := Config{
		Addr:            ":6969",
		ReadTimeout:     5 * time.Second,
		WriteTimeout:    5 * time.Second,
		MaxHeaderLines:  200,
		IndexFile:       filepath.Join(".", "index.html"),
		ShutdownTimeout: 5 * time.Second,
	}

	logger := &StdLogger{}
	srv := NewServer(cfg, nil, logger)
	if err := srv.loadIndex(); err != nil {
		logger.Errorf("failed to load index: %v", err)
		os.Exit(1)
	}

	// watchIndex çağrısı main'de olmalı
	if err := srv.watchIndex(); err != nil {
		logger.Errorf("watchIndex error: %v", err)
		os.Exit(1)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	if err := srv.Start(ctx); err != nil {
		logger.Errorf("start server: %v", err)
		os.Exit(1)
	}

	<-ctx.Done()
	logger.Infof("shutdown requested")

	srv.Stop()
	time.Sleep(cfg.ShutdownTimeout)
	logger.Infof("server stopped")
}

