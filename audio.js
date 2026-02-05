// Audio Manager for Tetris
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.muted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;

        // Initialize AudioContext singleton (starts minimal)
        this.audioContext = null;

        // List of generic background music (Excluding 12 and 16)
        this.musicTracks = [
            './sounds/music_1.mp3',
            './sounds/music_2.mp3',
            './sounds/music_3.mp3',
            './sounds/music_4.mp3',
            './sounds/music_5.mp3',
            './sounds/music_6.mp3',
            './sounds/music_7.mp3',
            './sounds/music_8.mp3',
            './sounds/music_9.mp3',
            './sounds/music_10.mp3',
            './sounds/music_11.mp3',
            './sounds/music_13.mp3',
            './sounds/music_14.mp3',
            './sounds/music_15.mp3'
        ];

        // Special Tracks
        this.bossTrack = './sounds/music_16.mp3'; // Level 10, 20, 30...
        this.gameOverTrack = './sounds/music_12.mp3'; // Game Over
    }

    // Initialize AudioContext on user interaction
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(e => console.log("Audio resume failed:", e));
        }
    }

    // Load random background music (Standard levels)
    loadRandomMusic() {
        const randomIndex = Math.floor(Math.random() * this.musicTracks.length);
        const selectedTrack = this.musicTracks[randomIndex];
        this.loadMusic(selectedTrack);
        this.playMusic(); // Ensure it starts playing
    }

    // Play Boss Music (Level 10, 20...)
    playBossMusic() {
        this.loadMusic(this.bossTrack);
        this.playMusic();
    }

    // Play Game Over Music
    playGameOverMusic() {
        this.loadMusic(this.gameOverTrack);
        if (this.music) {
            this.music.loop = false; // Only play once (optional, but usually better for Game Over)
        }
        this.playMusic();
    }

    // Load specific background music
    loadMusic(src) {
        if (this.music) {
            this.music.pause();
        }
        this.music = new Audio(src);
        this.music.loop = true;
        this.music.volume = this.musicVolume;

        // Auto-play next random track when current ends (Only if looping is false or manual sequence)
        // For standard music, it loops. if we disable loop for gameover, it stops.
        this.music.addEventListener('ended', () => {
            if (src !== this.gameOverTrack) {
                this.loadRandomMusic();
            }
        });
    }

    // Play background music
    playMusic() {
        this.initAudioContext(); // Ensure context is ready
        if (this.music && !this.muted) {
            this.music.play().catch(e => console.log('Music play failed:', e));
        }
    }

    // Stop background music
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    // Create sound effect using Web Audio API (Optimized)
    createBeep(frequency, duration, volume = 0.3) {
        if (this.muted) return;
        this.initAudioContext();

        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'square'; // Chiptune style

            gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.error("Audio error:", e);
        }
    }

    // Sound effects
    playLand() {
        this.createBeep(150, 0.05, 0.2);
    }

    playSingle() {
        this.createBeep(400, 0.1, 0.3);
    }

    playDouble() {
        this.createBeep(400, 0.08, 0.3);
        setTimeout(() => this.createBeep(500, 0.08, 0.3), 80);
    }

    playTriple() {
        this.createBeep(400, 0.06, 0.3);
        setTimeout(() => this.createBeep(500, 0.06, 0.3), 60);
        setTimeout(() => this.createBeep(600, 0.06, 0.3), 120);
    }

    playTetris() {
        this.createBeep(600, 0.05, 0.4);
        setTimeout(() => this.createBeep(700, 0.05, 0.4), 50);
        setTimeout(() => this.createBeep(800, 0.05, 0.4), 100);
        setTimeout(() => this.createBeep(1000, 0.15, 0.5), 150);
    }

    playCombo(level) {
        const basePitch = 600;
        const pitch = basePitch + (level * 100);
        this.createBeep(pitch, 0.1, 0.4);
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
        return this.muted;
    }
}

// Create global audio manager
const audioManager = new AudioManager();

// Load random music on page load
audioManager.loadRandomMusic();

// Add interaction listener to unlock audio on first click
document.addEventListener('click', function () {
    audioManager.initAudioContext();
}, { once: true });
