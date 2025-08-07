package main

import (
    "bufio"
    "fmt"
    "net"
    "os"
    "strings"
    "time"
)

func handleConnection(conn net.Conn) {
    defer conn.Close()
    conn.SetReadDeadline(time.Now().Add(2 * time.Second))

    remote := conn.RemoteAddr().String()
    fmt.Println("Bağlantı geldi:", remote)

    reader := bufio.NewReader(conn)

    command, err := reader.ReadString('\n')
    if err != nil {
        fmt.Println("Komut okunamadı:", err)
        return
    }
    command = strings.TrimSpace(command)
    fmt.Println("Komut:", command)

    for {
        line, err := reader.ReadString('\n')
        if err != nil {
            break
        }
        line = strings.TrimSpace(line)
        if line == "" {
            break
        }
        fmt.Println("Header:", line)
    }

    // Body okuma yok, direk index.html gönder
    indexHTML, err := os.ReadFile("index.html")
    if err != nil {
        fmt.Println("index.html okunamadı:", err)
        return
    }

    response := "ZG/1.0 200 OK\r\n" +
        "ZG-Power: MAXIMUM\r\n" +
        "\r\n" +
        string(indexHTML)

    _, err = conn.Write([]byte(response))
    if err != nil {
        fmt.Println("Cevap yazılamadı:", err)
    } else {
        fmt.Println("Cevap yollandı.")
    }
}

func main() {
    ln, err := net.Listen("tcp", ":6969")
    if err != nil {
        fmt.Println("Sunucu başlatılamadı:", err)
        return
    }

    fmt.Println("KENUTS SERVER 6969'da dinleniyor...")

    for {
        conn, err := ln.Accept()
        if err != nil {
            fmt.Println("Bağlantı hatası:", err)
            continue
        }
        go handleConnection(conn)
    }
}
