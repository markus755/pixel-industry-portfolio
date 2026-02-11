/**
 * Pre-Generated Audio Player
 * Lädt MP3s die beim Build generiert wurden
 * Exakt gleiches UI wie google-tts-player.js
 * WCAG 2.2 AA konform
 */

class PreGeneratedAudioPlayer {
    constructor() {
        // Status Tracking
        this.isPlaying = false;
        this.isExpanded = false;
        this.currentTime = 0;
        this.textContent = '';
        this.audioFileName = null;
        
        // Audio Element
        this.audioElement = null;
        
        // DOM Elements
        this.container = null;
        this.collapsedView = null;
        this.expandedView = null;
        this.playPauseBtn = null;
        this.progressBar = null;
        this.progressFill = null;
        this.progressIndicator = null;
        this.timeDisplay = null;
    }

    /**
     * Initialisiert den Player
     */
    init() {
        // Prüfen ob wir auf einer Projektseite sind
        const projectDetail = document.querySelector('#project-detail');
        if (!projectDetail) {
            console.log('Pre-Gen Audio Player: Keine Projektseite erkannt');
            return;
        }

        // Text extrahieren (für Hash-Berechnung)
        this.extractContent();
        
        // Nur erstellen wenn genug Text
        if (this.textContent.length < 100) {
            console.log('Pre-Gen Audio Player: Text zu kurz');
            return;
        }
        
        // Audio-Dateiname berechnen
        this.calculateAudioFileName();
        
        this.createPlayer();
        this.attachEventListeners();
        this.attachCleanupListeners();
    }

    /**
     * Extrahiert Text für Hash-Berechnung
     */
    extractContent() {
        let fullText = '';
        
        const headline = document.querySelector('.project-header h1');
        if (headline) {
            fullText += headline.textContent.trim() + '. ';
        }
        
        const columns = document.querySelectorAll('.project-column');
        columns.forEach(column => {
            const heading = column.querySelector('h2');
            if (heading) {
                fullText += heading.textContent.trim() + '. ';
            }
            
            const paragraphs = column.querySelectorAll('p');
            paragraphs.forEach(p => {
                fullText += p.textContent.trim() + ' ';
            });
        });
        
        this.textContent = fullText.trim();
    }

    /**
     * Berechnet Audio-Dateinamen mit Hash (MD5 - gleich wie Build-Script)
     */
    calculateAudioFileName() {
        // Einfache MD5-Hash Implementierung für Browser
        // MUSS identisch mit Node.js crypto.createHash('md5') sein!
        const hash = this.md5(this.textContent).substring(0, 8);
        
        // Dateiname aus URL ableiten
        const path = window.location.pathname;
        const fileName = path.split('/').pop().replace('.html', '');
        
        this.audioFileName = `${fileName}-${hash}.mp3`;
        console.log(`Pre-Gen Audio Player: ${this.audioFileName}`);
    }

    /**
     * MD5 Hash (Browser-kompatibel)
     * Muss gleiche Ergebnisse wie Node.js crypto.createHash('md5') liefern
     */
    md5(string) {
        function rotateLeft(value, shift) {
            return (value << shift) | (value >>> (32 - shift));
        }
        
        function addUnsigned(x, y) {
            const lsw = (x & 0xFFFF) + (y & 0xFFFF);
            const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }
        
        function md5cmn(q, a, b, x, s, t) {
            return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b);
        }
        
        function md5ff(a, b, c, d, x, s, t) {
            return md5cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        
        function md5gg(a, b, c, d, x, s, t) {
            return md5cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        
        function md5hh(a, b, c, d, x, s, t) {
            return md5cmn(b ^ c ^ d, a, b, x, s, t);
        }
        
        function md5ii(a, b, c, d, x, s, t) {
            return md5cmn(c ^ (b | (~d)), a, b, x, s, t);
        }
        
        function coreMD5(x) {
            let a = 0x67452301;
            let b = 0xEFCDAB89;
            let c = 0x98BADCFE;
            let d = 0x10325476;
            
            for (let i = 0; i < x.length; i += 16) {
                const olda = a, oldb = b, oldc = c, oldd = d;
                
                a = md5ff(a, b, c, d, x[i], 7, 0xD76AA478);
                d = md5ff(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
                c = md5ff(c, d, a, b, x[i + 2], 17, 0x242070DB);
                b = md5ff(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
                a = md5ff(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
                d = md5ff(d, a, b, c, x[i + 5], 12, 0x4787C62A);
                c = md5ff(c, d, a, b, x[i + 6], 17, 0xA8304613);
                b = md5ff(b, c, d, a, x[i + 7], 22, 0xFD469501);
                a = md5ff(a, b, c, d, x[i + 8], 7, 0x698098D8);
                d = md5ff(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
                c = md5ff(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
                b = md5ff(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
                a = md5ff(a, b, c, d, x[i + 12], 7, 0x6B901122);
                d = md5ff(d, a, b, c, x[i + 13], 12, 0xFD987193);
                c = md5ff(c, d, a, b, x[i + 14], 17, 0xA679438E);
                b = md5ff(b, c, d, a, x[i + 15], 22, 0x49B40821);
                
                a = md5gg(a, b, c, d, x[i + 1], 5, 0xF61E2562);
                d = md5gg(d, a, b, c, x[i + 6], 9, 0xC040B340);
                c = md5gg(c, d, a, b, x[i + 11], 14, 0x265E5A51);
                b = md5gg(b, c, d, a, x[i], 20, 0xE9B6C7AA);
                a = md5gg(a, b, c, d, x[i + 5], 5, 0xD62F105D);
                d = md5gg(d, a, b, c, x[i + 10], 9, 0x02441453);
                c = md5gg(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
                b = md5gg(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
                a = md5gg(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
                d = md5gg(d, a, b, c, x[i + 14], 9, 0xC33707D6);
                c = md5gg(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
                b = md5gg(b, c, d, a, x[i + 8], 20, 0x455A14ED);
                a = md5gg(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
                d = md5gg(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
                c = md5gg(c, d, a, b, x[i + 7], 14, 0x676F02D9);
                b = md5gg(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);
                
                a = md5hh(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
                d = md5hh(d, a, b, c, x[i + 8], 11, 0x8771F681);
                c = md5hh(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
                b = md5hh(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
                a = md5hh(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
                d = md5hh(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
                c = md5hh(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
                b = md5hh(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
                a = md5hh(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
                d = md5hh(d, a, b, c, x[i], 11, 0xEAA127FA);
                c = md5hh(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
                b = md5hh(b, c, d, a, x[i + 6], 23, 0x04881D05);
                a = md5hh(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
                d = md5hh(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
                c = md5hh(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
                b = md5hh(b, c, d, a, x[i + 2], 23, 0xC4AC5665);
                
                a = md5ii(a, b, c, d, x[i], 6, 0xF4292244);
                d = md5ii(d, a, b, c, x[i + 7], 10, 0x432AFF97);
                c = md5ii(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
                b = md5ii(b, c, d, a, x[i + 5], 21, 0xFC93A039);
                a = md5ii(a, b, c, d, x[i + 12], 6, 0x655B59C3);
                d = md5ii(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
                c = md5ii(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
                b = md5ii(b, c, d, a, x[i + 1], 21, 0x85845DD1);
                a = md5ii(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
                d = md5ii(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
                c = md5ii(c, d, a, b, x[i + 6], 15, 0xA3014314);
                b = md5ii(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
                a = md5ii(a, b, c, d, x[i + 4], 6, 0xF7537E82);
                d = md5ii(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
                c = md5ii(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
                b = md5ii(b, c, d, a, x[i + 9], 21, 0xEB86D391);
                
                a = addUnsigned(a, olda);
                b = addUnsigned(b, oldb);
                c = addUnsigned(c, oldc);
                d = addUnsigned(d, oldd);
            }
            
            return [a, b, c, d];
        }
        
        function convertToWordArray(string) {
            const wordArray = [];
            for (let i = 0; i < string.length * 8; i += 8) {
                wordArray[i >> 5] |= (string.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
            return wordArray;
        }
        
        function wordToHex(value) {
            let hex = '';
            for (let i = 0; i < 4; i++) {
                hex += ((value >> (i * 8 + 4)) & 0x0F).toString(16) + ((value >> (i * 8)) & 0x0F).toString(16);
            }
            return hex;
        }
        
        const x = convertToWordArray(string);
        const len = string.length * 8;
        
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        
        const result = coreMD5(x);
        return result.map(wordToHex).join('');
    }

    /**
     * Schätzt Dauer (wird durch echte Dauer ersetzt)
     */
    estimateDuration() {
        const words = this.textContent.split(/\s+/).length;
        const minutes = words / 150;
        return Math.ceil(minutes);
    }

    /**
     * Erstellt die Player-UI
     */
    createPlayer() {
        const estimatedDuration = this.estimateDuration();
        
        // Container
        this.container = document.createElement('div');
        this.container.className = 'audio-player pregen-audio-player';
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Audio-Player für Projektbeschreibung (Pre-Generated)');
        
        // Collapsed View
        this.collapsedView = document.createElement('button');
        this.collapsedView.className = 'audio-player-collapsed';
        this.collapsedView.setAttribute('aria-label', `Projektbeschreibung vorlesen, Dauer etwa ${estimatedDuration} Minuten`);
        this.collapsedView.innerHTML = `
            <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span class="duration-text">${estimatedDuration} min.</span>
        `;
        
        // Expanded View
        this.expandedView = document.createElement('div');
        this.expandedView.className = 'audio-player-expanded';
        this.expandedView.style.display = 'none';
        this.expandedView.innerHTML = `
            <button class="play-pause-btn" aria-label="Wiedergabe pausieren">
                <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg class="pause-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg class="loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
            <div class="progress-container">
                <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Fortschrittsbalken">
                    <div class="progress-fill"></div>
                    <div class="progress-indicator"></div>
                </div>
                <div class="time-display" aria-live="off">~${estimatedDuration}:00</div>
            </div>
        `;
        
        // Disclaimer
        const disclaimer = document.createElement('p');
        disclaimer.className = 'audio-player-disclaimer';
        disclaimer.innerHTML = '';
        
        // Zusammenbauen
        this.container.appendChild(this.collapsedView);
        this.container.appendChild(this.expandedView);
        this.container.appendChild(disclaimer);
        
        const projectHeader = document.querySelector('.project-header');
        if (projectHeader) {
            projectHeader.insertAdjacentElement('afterend', this.container);
        }
        
        // DOM-Referenzen
        this.playPauseBtn = this.expandedView.querySelector('.play-pause-btn');
        this.progressBar = this.expandedView.querySelector('.progress-bar');
        this.progressFill = this.expandedView.querySelector('.progress-fill');
        this.progressIndicator = this.expandedView.querySelector('.progress-indicator');
        this.timeDisplay = this.expandedView.querySelector('.time-display');
    }

    /**
     * Event-Listener
     */
    attachEventListeners() {
        // Collapsed → Expand & Load
        this.collapsedView.addEventListener('click', () => {
            this.expand();
            this.loadAndPlay();
        });
        
        // Play/Pause Toggle
        this.playPauseBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
            } else {
                if (this.audioElement) {
                    this.play();
                } else {
                    this.loadAndPlay();
                }
            }
        });
        
        // Tastatur-Steuerung
        document.addEventListener('keydown', (e) => {
            if (this.isExpanded && e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                
                if (this.isPlaying) {
                    this.pause();
                } else if (this.audioElement) {
                    this.play();
                } else {
                    this.loadAndPlay();
                }
            }
        });
    }

    /**
     * Cleanup bei Seitenverlassen
     */
    attachCleanupListeners() {
        window.addEventListener('beforeunload', () => {
            if (this.audioElement) {
                this.audioElement.pause();
            }
        });
        
        window.addEventListener('pagehide', () => {
            if (this.audioElement) {
                this.audioElement.pause();
            }
        });
    }

    /**
     * Expandiert Player
     */
    expand() {
        this.isExpanded = true;
        this.collapsedView.style.display = 'none';
        this.expandedView.style.display = 'flex';
    }

    /**
     * Lädt Pre-Generated Audio
     */
    async loadAndPlay() {
        this.showLoadingState();
        
        try {
            console.log(`Loading audio: /audio/${this.audioFileName}`);
            
            // Erstelle Audio Element
            this.audioElement = new Audio(`/audio/${this.audioFileName}`);
            
            // Audio Events
            this.audioElement.addEventListener('loadedmetadata', () => {
                console.log(`Audio loaded: ${Math.ceil(this.audioElement.duration)}s`);
                this.hideLoadingState();
            });
            
            this.audioElement.addEventListener('canplaythrough', () => {
                // Audio kann vollständig abgespielt werden
                this.updateTimeDisplay();
            });
            
            this.audioElement.addEventListener('timeupdate', () => {
                this.currentTime = this.audioElement.currentTime;
                this.updateProgress();
            });
            
            this.audioElement.addEventListener('ended', () => {
                this.onPlaybackEnd();
            });
            
            this.audioElement.addEventListener('error', (e) => {
                console.error('Audio Loading Error:', e);
                this.showError('Audio nicht gefunden');
            });
            
            // Starte Wiedergabe
            await this.audioElement.play();
            this.isPlaying = true;
            this.updatePlayPauseButton();
            
        } catch (error) {
            console.error('Playback Error:', error);
            this.showError('Wiedergabe fehlgeschlagen');
        }
    }

    /**
     * Startet Wiedergabe
     */
    play() {
        if (this.audioElement) {
            this.audioElement.play();
            this.isPlaying = true;
            this.updatePlayPauseButton();
        }
    }

    /**
     * Pausiert Wiedergabe
     */
    pause() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.updatePlayPauseButton();
        }
    }

    /**
     * Zeigt Loading-Status
     */
    showLoadingState() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        const loadingIcon = this.playPauseBtn.querySelector('.loading-icon');
        
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'none';
        loadingIcon.style.display = 'block';
        
        this.playPauseBtn.setAttribute('aria-label', 'Lädt Audio...');
        this.timeDisplay.textContent = 'Lädt...';
    }

    /**
     * Versteckt Loading-Status
     */
    hideLoadingState() {
        this.updatePlayPauseButton();
        this.updateTimeDisplay();
    }

    /**
     * Zeigt Fehler
     */
    showError(message) {
        const loadingIcon = this.playPauseBtn.querySelector('.loading-icon');
        loadingIcon.style.display = 'none';
        
        this.timeDisplay.textContent = message;
        this.updatePlayPauseButton();
    }

    /**
     * Aktualisiert Play/Pause Icon
     */
    updatePlayPauseButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        const loadingIcon = this.playPauseBtn.querySelector('.loading-icon');
        
        loadingIcon.style.display = 'none';
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            this.playPauseBtn.setAttribute('aria-label', 'Wiedergabe pausieren');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            this.playPauseBtn.setAttribute('aria-label', 'Wiedergabe fortsetzen');
        }
    }

    /**
     * Aktualisiert Progress Bar
     */
    updateProgress() {
        if (!this.audioElement) return;
        
        const percentage = (this.currentTime / this.audioElement.duration) * 100;
        
        this.progressFill.style.width = `${percentage}%`;
        this.progressIndicator.style.left = `${percentage}%`;
        
        this.progressBar.setAttribute('aria-valuenow', Math.round(percentage));
        
        // Zeit-Anzeige
        const remaining = this.audioElement.duration - this.currentTime;
        this.timeDisplay.textContent = `-${this.formatTime(remaining)}`;
    }

    /**
     * Aktualisiert Zeit-Anzeige mit echter Dauer
     */
    updateTimeDisplay() {
        if (this.audioElement && this.audioElement.duration) {
            const remaining = this.audioElement.duration - this.currentTime;
            this.timeDisplay.textContent = `-${this.formatTime(remaining)}`;
        }
    }

    /**
     * Callback bei Ende
     */
    onPlaybackEnd() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        
        // Nach 2 Sekunden zurück zu collapsed
        setTimeout(() => {
            this.collapse();
        }, 2000);
    }

    /**
     * Kollabiert Player
     */
    collapse() {
        this.isExpanded = false;
        this.expandedView.style.display = 'none';
        this.collapsedView.style.display = 'flex';
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        
        this.currentTime = 0;
        this.isPlaying = false;
    }

    /**
     * Formatiert Sekunden zu MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const player = new PreGeneratedAudioPlayer();
    player.init();
});