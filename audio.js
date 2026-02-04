// Audio Manager for Tetris
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.muted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;

        // List of available background music
        this.musicTracks = [
            '../sounds/(16-Bit Cover) Daft PunkJulian Casablancas - Instant Crush [Sega GenesisMegadrive].mp3',
            '../sounds/(8-Bit Cover) Adolescent\'s Orquesta - Virgen (NES 2A03 - MMC5).mp3',
            '../sounds/(8-Bit Cover) Ice Cube - It Was A Good Day (2A03 - N163).mp3',
            '../sounds/(8-Bit Cover) Miranda! - Don (NES 2A03).mp3',
            '../sounds/(8-Bit Cover) Selena - Amor Prohibido (NES 2A03).mp3',
            '../sounds/(Cover 8-Bit)  Chayanne - Torero [NES  Famicom].mp3',
            '../sounds/(Cover 8-Bit) Canserbero - Es Épico (Beat) (NES 2A03 - MMC5).mp3',
            '../sounds/(Cover 8-Bit) Flans - Las mil y una noches  En El Boulevard [Commodore 64].mp3',
            '../sounds/(Cover 8-Bit) Los Tigres del Norte - La mesa del Rincón [Nintendo Gameboy].mp3',
            '../sounds/Chiptune Loop for Shep.mp3',
            '../sounds/El Triste 8 bits  16 Bits  - Mexican Bit.mp3',
            '../sounds/La Gata Bajo La Lluvia 8bits - Mexican Bit.mp3',
            '../sounds/No Hay Novedad cover 8-16 bits - Mexican Bit.mp3',
            '../sounds/Tragos De Amargo Licor 8bits16bits -Mexican Bit.mp3',
            '../sounds/Tus Jefes No Me Quieren  8bits16bits - Mexican Bit.mp3',
            '../sounds/Vete Ya 8bits  16bits - Mexican Bit.mp3'
        ];
    }

    // Load random background music
    loadRandomMusic() {
        const randomIndex = Math.floor(Math.random() * this.musicTracks.length);
        const selectedTrack = this.musicTracks[randomIndex];
        this.loadMusic(selectedTrack);
    }

    // Load specific background music
    loadMusic(src) {
        if (this.music) {
            this.music.pause();
        }
        this.music = new Audio(src);
        this.music.loop = true;
        this.music.volume = this.musicVolume;

        // Auto-play next random track when current ends (if not looping)
        this.music.addEventListener('ended', () => {
            this.loadRandomMusic();
            this.playMusic();
        });
    }

    // Play background music
    playMusic() {
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

    // Create sound effect using Web Audio API
    createBeep(frequency, duration, volume = 0.3) {
        if (this.muted) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square'; // Chiptune style

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    // Sound effects
    playLand() {
        // Quick low beep for landing
        this.createBeep(150, 0.05, 0.2);
    }

    playSingle() {
        // Single line clear
        this.createBeep(400, 0.1, 0.3);
    }

    playDouble() {
        // Double line clear - two quick beeps
        this.createBeep(400, 0.08, 0.3);
        setTimeout(() => this.createBeep(500, 0.08, 0.3), 80);
    }

    playTriple() {
        // Triple line clear - three quick beeps
        this.createBeep(400, 0.06, 0.3);
        setTimeout(() => this.createBeep(500, 0.06, 0.3), 60);
        setTimeout(() => this.createBeep(600, 0.06, 0.3), 120);
    }

    playTetris() {
        // Tetris - epic sound
        this.createBeep(600, 0.05, 0.4);
        setTimeout(() => this.createBeep(700, 0.05, 0.4), 50);
        setTimeout(() => this.createBeep(800, 0.05, 0.4), 100);
        setTimeout(() => this.createBeep(1000, 0.15, 0.5), 150);
    }

    playCombo(level) {
        // Combo sound - pitch increases with combo level
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
