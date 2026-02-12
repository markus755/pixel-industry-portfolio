/**
 * Pre-Generated Audio Player v2
 * Lädt MP3-Dateinamen direkt aus data-audio-file Attribut
 * Kein Hash-Berechnen mehr - 100% zuverlässig!
 * WCAG 2.2 AA konform
 */

class PreGeneratedAudioPlayer {
    constructor() {
        this.isPlaying = false;
        this.isExpanded = false;
        this.currentTime = 0;
        this.audioFileName = null;
        this.audioElement = null;
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
        const projectDetail = document.querySelector('#project-detail');
        if (!projectDetail) {
            console.log('Pre-Gen Audio Player: Keine Projektseite erkannt');
            return;
        }

        // Audio-Dateinamen direkt aus HTML lesen (gesetzt vom Build-Script)
        // <main id="project-detail" data-audio-file="crm_system-3a69b30d.mp3">
        this.audioFileName = projectDetail.getAttribute('data-audio-file');

        if (!this.audioFileName) {
            console.log('Pre-Gen Audio Player: Kein data-audio-file Attribut gefunden');
            return;
        }

        console.log(`Pre-Gen Audio Player: ${this.audioFileName}`);

        this.createPlayer();
        this.attachEventListeners();
        this.attachCleanupListeners();
    }

    /**
     * Erstellt die Player-UI
     */
    createPlayer() {
        // Container
        this.container = document.createElement('div');
        this.container.className = 'audio-player pregen-audio-player';
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Audio player for project description');

        // Collapsed View
        this.collapsedView = document.createElement('button');
        this.collapsedView.className = 'audio-player-collapsed';
        this.collapsedView.setAttribute('aria-label', 'Listen to project description');
        this.collapsedView.innerHTML = `
            <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span class="duration-text">Listen</span>
        `;

        // Expanded View
        this.expandedView = document.createElement('div');
        this.expandedView.className = 'audio-player-expanded';
        this.expandedView.style.display = 'none';
        this.expandedView.innerHTML = `
            <button class="play-pause-btn" aria-label="Pause playback">
                <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg class="pause-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none;" aria-hidden="true">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg class="loading-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none;" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
            <div class="progress-container">
                <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Playback progress">
                    <div class="progress-fill"></div>
                    <div class="progress-indicator"></div>
                </div>
                <div class="time-display" aria-live="off">Lädt...</div>
            </div>
        `;

        // Disclaimer
        const disclaimer = document.createElement('p');
        disclaimer.className = 'audio-player-disclaimer';
        disclaimer.innerHTML = 'This audio version was generated using <strong>Google Cloud TTS</strong> (Studio-Q).';

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
        // Collapsed → Expand & Play
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

        // Tastatur: Space = Play/Pause
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
            if (this.audioElement) this.audioElement.pause();
        });

        window.addEventListener('pagehide', () => {
            if (this.audioElement) this.audioElement.pause();
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
     * Lädt und spielt Pre-Generated Audio
     */
    async loadAndPlay() {
        this.showLoadingState();

        try {
            console.log(`Loading audio: /audio/${this.audioFileName}`);

            this.audioElement = new Audio(`/audio/${this.audioFileName}`);

            this.audioElement.addEventListener('loadedmetadata', () => {
                console.log(`Audio loaded: ${Math.ceil(this.audioElement.duration)}s`);
                this.hideLoadingState();
            });

            this.audioElement.addEventListener('canplaythrough', () => {
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

            await this.audioElement.play();
            this.isPlaying = true;
            this.updatePlayPauseButton();

        } catch (error) {
            console.error('Playback Error:', error);
            this.showError('Wiedergabe fehlgeschlagen');
        }
    }

    play() {
        if (this.audioElement) {
            this.audioElement.play();
            this.isPlaying = true;
            this.updatePlayPauseButton();
        }
    }

    pause() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.updatePlayPauseButton();
        }
    }

    showLoadingState() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        const loadingIcon = this.playPauseBtn.querySelector('.loading-icon');

        playIcon.style.display = 'none';
        pauseIcon.style.display = 'none';
        loadingIcon.style.display = 'block';

        this.playPauseBtn.setAttribute('aria-label', 'Loading audio...');
        this.timeDisplay.textContent = 'Lädt...';
    }

    hideLoadingState() {
        this.updatePlayPauseButton();
        this.updateTimeDisplay();
    }

    showError(message) {
        const loadingIcon = this.playPauseBtn.querySelector('.loading-icon');
        if (loadingIcon) loadingIcon.style.display = 'none';
        this.timeDisplay.textContent = message;
        this.updatePlayPauseButton();
    }

    updatePlayPauseButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        const loadingIcon = this.playPauseBtn.querySelector('.loading-icon');

        loadingIcon.style.display = 'none';

        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            this.playPauseBtn.setAttribute('aria-label', 'Pause playback');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            this.playPauseBtn.setAttribute('aria-label', 'Resume playback');
        }
    }

    updateProgress() {
        if (!this.audioElement) return;

        const percentage = (this.currentTime / this.audioElement.duration) * 100;

        this.progressFill.style.width = `${percentage}%`;
        this.progressIndicator.style.left = `${percentage}%`;
        this.progressBar.setAttribute('aria-valuenow', Math.round(percentage));

        const remaining = this.audioElement.duration - this.currentTime;
        this.timeDisplay.textContent = `-${this.formatTime(remaining)}`;
    }

    updateTimeDisplay() {
        if (this.audioElement && this.audioElement.duration) {
            const remaining = this.audioElement.duration - this.currentTime;
            this.timeDisplay.textContent = `-${this.formatTime(remaining)}`;
        }
    }

    onPlaybackEnd() {
        this.isPlaying = false;
        this.updatePlayPauseButton();

        setTimeout(() => {
            this.collapse();
        }, 2000);
    }

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