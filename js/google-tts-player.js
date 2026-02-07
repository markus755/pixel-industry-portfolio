/**
 * Google Cloud TTS Audio Player (TEST VERSION)
 * pixel-industry by Markus Mueller
 * Nutzt Netlify Functions + Google Cloud TTS API
 * Design: Exakte Figma-Specs
 * WCAG 2.2 AA konform
 */

class GoogleTTSAudioPlayer {
    constructor() {
        // Status Tracking
        this.isPlaying = false;
        this.isExpanded = false;
        this.isLoading = false;
        this.currentTime = 0;
        this.totalDuration = 0;
        this.textContent = '';
        this.progressInterval = null;
        
        // Audio Element
        this.audioElement = null;
        this.audioUrl = null;
        
        // DOM Elements (später erstellt)
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
            console.log('Google TTS Player: Keine Projektseite erkannt');
            return;
        }

        // Text extrahieren und Dauer schätzen
        this.extractContent();
        this.estimateDuration();
        
        // Nur erstellen wenn genug Text
        if (this.textContent.length < 100) {
            console.log('Google TTS Player: Text zu kurz');
            return;
        }
        
        this.createPlayer();
        this.attachEventListeners();
        this.attachCleanupListeners();
    }

    /**
     * Extrahiert relevanten Text
     */
    extractContent() {
        let fullText = '';
        
        // Projekt-Headline
        const headline = document.querySelector('.project-header h1');
        if (headline) {
            fullText += headline.textContent.trim() + '. ';
        }
        
        // Challenge & Solution Spalten
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
        console.log(`Google TTS Player: ${this.textContent.split(/\s+/).length} Wörter extrahiert`);
    }

    /**
     * Schätzt Dauer (wird später durch echte Audio-Dauer ersetzt)
     */
    estimateDuration() {
        const words = this.textContent.split(/\s+/).length;
        const minutes = words / 150;
        this.totalDuration = Math.ceil(minutes);
    }

    /**
     * Erstellt die Player-UI
     */
    createPlayer() {
        // Container
        this.container = document.createElement('div');
        this.container.className = 'audio-player google-tts-player';
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Audio-Player für Projektbeschreibung (Google Cloud TTS)');
        
        // Collapsed View
        this.collapsedView = document.createElement('button');
        this.collapsedView.className = 'audio-player-collapsed';
        this.collapsedView.setAttribute('aria-label', `Projektbeschreibung vorlesen mit Google Stimme, Dauer etwa ${this.totalDuration} Minuten`);
        this.collapsedView.innerHTML = `
            <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span class="duration-text">${this.totalDuration} min.</span>
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
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            </button>
            <div class="progress-container">
                <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Fortschrittsbalken">
                    <div class="progress-fill"></div>
                    <div class="progress-indicator"></div>
                </div>
                <div class="time-display" aria-live="off">~${this.totalDuration}:00</div>
            </div>
        `;
        
        // Disclaimer
        const disclaimer = document.createElement('p');
        disclaimer.className = 'audio-player-disclaimer';
        disclaimer.innerHTML = 'This audio version was generated using <strong>Google Cloud TTS</strong> (Neural2-B).';
        
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
            if (this.isLoading) return; // Ignoriere während Loading
            
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
                if (this.isLoading) return;
                
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
            if (this.audioUrl) {
                URL.revokeObjectURL(this.audioUrl);
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
     * Lädt Audio von Google TTS und startet
     */
    async loadAndPlay() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            console.log('Google TTS: Starte Audio-Generierung...');
            
            // Rufe Netlify Function auf (wie in script.js)
            const response = await fetch('/.netlify/functions/google-tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: this.textContent })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Erstelle Audio Element (wie in script.js)
            const audioBlob = await response.blob();
            this.audioUrl = URL.createObjectURL(audioBlob);
            this.audioElement = new Audio(this.audioUrl);
            
            // Audio Events
            this.audioElement.addEventListener('loadedmetadata', () => {
                // Echte Dauer bekommen
                const durationSeconds = Math.ceil(this.audioElement.duration);
                console.log(`Google TTS: Audio geladen (${durationSeconds}s)`);
                
                // Aktualisiere Anzeige mit echter Dauer
                const mins = Math.floor(durationSeconds / 60);
                const secs = durationSeconds % 60;
                this.timeDisplay.textContent = `-${mins}:${secs.toString().padStart(2, '0')}`;
            });
            
            this.audioElement.addEventListener('timeupdate', () => {
                this.currentTime = this.audioElement.currentTime;
                this.updateProgress();
            });
            
            this.audioElement.addEventListener('ended', () => {
                this.onPlaybackEnd();
            });
            
            this.audioElement.addEventListener('error', (e) => {
                console.error('Audio Playback Error:', e);
                this.showError('Wiedergabe fehlgeschlagen');
            });
            
            // Starte Wiedergabe
            await this.audioElement.play();
            this.isLoading = false;
            this.isPlaying = true;
            this.updatePlayPauseButton();
            
        } catch (error) {
            console.error('Google TTS Fehler:', error);
            this.isLoading = false;
            this.showError('Laden fehlgeschlagen');
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
        
        this.playPauseBtn.setAttribute('aria-label', 'Lade Audio von Google...');
        this.timeDisplay.textContent = 'Lädt...';
    }

    /**
     * Zeigt Fehler
     */
    showError(message) {
        this.timeDisplay.textContent = message;
        this.playPauseBtn.disabled = false;
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
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
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
    const player = new GoogleTTSAudioPlayer();
    player.init();
});
