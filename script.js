// Kenuts Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Kenuts website loaded successfully!');
    
    // Add some interactive elements
    initializeInteractivity();
    
    // Add a dynamic timestamp
    addTimestamp();
    
    // Add click effects to list items
    addListItemEffects();
    
    // Add konami code easter egg
    addKonamiCode();
});

function initializeInteractivity() {
    // Add a floating button for fun
    const floatingBtn = document.createElement('div');
    floatingBtn.innerHTML = '🌟';
    floatingBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    floatingBtn.addEventListener('click', function() {
        showRandomMessage();
    });
    
    floatingBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(360deg)';
    });
    
    floatingBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
    
    document.body.appendChild(floatingBtn);
}

function addTimestamp() {
    const timestamp = document.createElement('div');
    timestamp.className = 'kenuts-info';
    timestamp.innerHTML = `
        <h3>Kenuts Protocol Active</h3>
        <p>Connected at: <strong>${new Date().toLocaleString()}</strong></p>
        <p>Protocol: <span class="highlight">KENUTS v1.0</span></p>
        <p>Status: <span style="color: #28a745;">🟢 Online</span></p>
    `;
    
    // Insert after the header
    const header = document.querySelector('header');
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(timestamp, header.nextSibling);
    }
}

function addListItemEffects() {
    const listItems = document.querySelectorAll('li');
    listItems.forEach(function(item, index) {
        item.addEventListener('click', function() {
            this.style.background = 'linear-gradient(120deg, #a8edea 0%, #fed6e3 100%)';
            this.style.padding = '5px 10px';
            this.style.borderRadius = '5px';
            this.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                this.style.background = '';
                this.style.padding = '';
            }, 2000);
        });
        
        // Add a slight delay for each item
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

function showRandomMessage() {
    const messages = [
        "🎉 Kenuts protocol is awesome!",
        "🚀 You're browsing the future!",
        "💫 Welcome to the Kenuts dimension!",
        "⚡ Lightning fast protocol!",
        "🌟 Stars align for Kenuts!",
        "🔥 This site is on fire!",
        "🌈 Colorful browsing experience!",
        "🎯 Direct hit to your browser!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Create a toast notification
    const toast = document.createElement('div');
    toast.textContent = randomMessage;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        transform: translateX(300px);
        transition: transform 0.3s ease;
        font-weight: bold;
    `;
    
    document.body.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(300px)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function addKonamiCode() {
    let konamiSequence = [];
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiSequence.push(e.code);
        
        if (konamiSequence.length > konamiCode.length) {
            konamiSequence.shift();
        }
        
        if (JSON.stringify(konamiSequence) === JSON.stringify(konamiCode)) {
            triggerEasterEgg();
            konamiSequence = [];
        }
    });
}

function triggerEasterEgg() {
    // Create confetti effect
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 20);
    }
    
    // Change the title temporarily
    const originalTitle = document.title;
    document.title = "🎉 KONAMI CODE ACTIVATED! 🎉";
    
    setTimeout(() => {
        document.title = originalTitle;
    }, 5000);
    
    // Show special message
    const easterEggMsg = document.createElement('div');
    easterEggMsg.innerHTML = `
        <h2>🎉 EASTER EGG UNLOCKED! 🎉</h2>
        <p>Congratulations! You found the Konami Code!</p>
        <p><strong>KENUTS PROTOCOL POWER LEVEL: OVER 9000!</strong></p>
    `;
    easterEggMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
        background-size: 400% 400%;
        animation: rainbow 2s ease infinite;
        color: white;
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(easterEggMsg);
    
    setTimeout(() => {
        document.body.removeChild(easterEggMsg);
        document.head.removeChild(style);
    }, 5000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.textContent = ['🎉', '🎊', '⭐', '🌟', '💫', '✨'][Math.floor(Math.random() * 6)];
    confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}%;
        font-size: ${Math.random() * 20 + 10}px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${Math.random() * 3 + 2}s linear forwards;
    `;
    
    const fallKeyframes = `
        @keyframes fall {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(${window.innerHeight + 100}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    
    if (!document.querySelector('#fall-animation')) {
        const style = document.createElement('style');
        style.id = 'fall-animation';
        style.textContent = fallKeyframes;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 5000);
}

// Add a console message for developers
console.log(`
    ╔══════════════════════════════════════╗
    ║          KENUTS PROTOCOL             ║
    ║      Welcome to the future of        ║
    ║         web browsing!                ║
    ║                                      ║
    ║  Try the Konami Code: ↑↑↓↓←→←→BA      ║
    ╚══════════════════════════════════════╝
`);