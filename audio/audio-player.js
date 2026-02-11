/**
 * Minimalistischer Text-to-Speech Audio Player
 * pixel-industry by Markus Mueller
 * Design: Exakte Figma-Specs
 * WCAG 2.2 AA konform
 */

class AudioPlayer {
    constructor() {
        // Browser API Check
        this.synthesis = window.speechSynthesis;
        this.utterance = null;
        
        // Status Tracking
        this.isPlaying = false;
        this.isExpanded = false;
        this.currentTime = 0;
        this.totalDuration = 0;
        this.estimatedSeconds = 0;
        this.textContent = '';
        this.progressInterval = null;
        
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
     * Wird bei DOMContentLoaded aufgerufen
     */
    init() {
        // Feature-Detection: Ist Web Speech API verfügbar?
        if (!this.synthesis) {
            console.warn('Text-to-Speech nicht verfügbar in diesem Browser');
            return;
        }

        // Prüfen ob wir auf einer Projektseite sind
        const projectDetail = document.querySelector('#project-detail');
        if (!projectDetail) {
            console.log('Audio-Player: Keine Projektseite erkannt');
            return;
        }

        // Text extrahieren, Dauer berechnen, UI bauen
        this.extractContent();
        this.calculateDuration();
        
        // Nur erstellen wenn wir genug Text haben
        if (this.textContent.length < 100) {
            console.log('Audio-Player: Text zu kurz, Player wird nicht erstellt');
            return;
        }
        
        this.createPlayer();
        this.attachEventListeners();
        this.attachCleanupListeners();
    }

    /**
     * Cleanup-Listener für Seitenverlassen/Reload
     */
    attachCleanupListeners() {
        // Stoppe Audio bei Seitenverlassen
        window.addEventListener('beforeunload', () => {
            if (this.isPlaying) {
                this.synthesis.cancel();
            }
        });
        
        // Stoppe Audio bei Page Hide (Mobile Safari, Back-Button)
        window.addEventListener('pagehide', () => {
            if (this.isPlaying) {
                this.synthesis.cancel();
            }
        });
        
        // Stoppe Audio bei Visibility Change (Tab-Wechsel optional)
        // Auskommentiert, falls du willst dass es im Hintergrund weiterläuft
        // document.addEventListener('visibilitychange', () => {
        //     if (document.hidden && this.isPlaying) {
        //         this.pause();
        //     }
        // });
    }

    /**
     * Extrahiert relevanten Text von der Seite
     * Liest: Headline + Challenge + Solution
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
            // H2 (Challenge/Solution)
            const heading = column.querySelector('h2');
            if (heading) {
                fullText += heading.textContent.trim() + '. ';
            }
            
            // Alle Paragraphen
            const paragraphs = column.querySelectorAll('p');
            paragraphs.forEach(p => {
                fullText += p.textContent.trim() + ' ';
            });
        });
        
        this.textContent = fullText.trim();
        
        // Debug-Info
        const wordCount = this.textContent.split(/\s+/).length;
        console.log(`Audio-Player: ${wordCount} Wörter extrahiert`);
    }

    /**
     * Berechnet geschätzte Vorlesedauer
     * Basis: 150 Wörter/Minute Durchschnittsgeschwindigkeit
     */
    calculateDuration() {
        const words = this.textContent.split(/\s+/).length;
        const minutes = words / 150;
        this.totalDuration = Math.ceil(minutes);
        this.estimatedSeconds = Math.ceil(minutes * 60);
        
        console.log(`Audio-Player: Geschätzte Dauer ${this.totalDuration} Min. (${this.estimatedSeconds}s)`);
    }

    /**
     * Erstellt die Player-UI im DOM
     */
    createPlayer() {
        // Container
        this.container = document.createElement('div');
        this.container.className = 'audio-player';
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', 'Audio-Player für Projektbeschreibung');
        
        // Collapsed View (Initial) - Exakte Figma-Specs
        this.collapsedView = document.createElement('button');
        this.collapsedView.className = 'audio-player-collapsed';
        this.collapsedView.setAttribute('aria-label', `Projektbeschreibung vorlesen, Dauer etwa ${this.totalDuration} Minuten`);
        this.collapsedView.innerHTML = `
            <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
            <span class="duration-text">${this.totalDuration} min.</span>
        `;
        
        // Expanded View (Initial versteckt) - Exakte Figma-Specs
        this.expandedView = document.createElement('div');
        this.expandedView.className = 'audio-player-expanded';
        this.expandedView.style.display = 'none';
        this.expandedView.innerHTML = `
            <button class="play-pause-btn" aria-label="Wiedergabe pausieren">
                <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg class="pause-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="display:none;">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </button>
            <div class="progress-container">
                <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Fortschrittsbalken">
                    <div class="progress-fill"></div>
                    <div class="progress-indicator"></div>
                </div>
                <div class="time-display" aria-live="off">-${this.formatTime(this.estimatedSeconds)}</div>
            </div>
        `;
        
        // In DOM einfügen - direkt nach project-header
        this.container.appendChild(this.collapsedView);
        this.container.appendChild(this.expandedView);
        
        // Disclaimer-Text hinzufügen
        const disclaimer = document.createElement('p');
        disclaimer.className = 'audio-player-disclaimer';
        disclaimer.textContent = 'This audio version was generated using artificial means.';
        this.container.appendChild(disclaimer);
        
        const projectHeader = document.querySelector('.project-header');
        if (projectHeader) {
            projectHeader.insertAdjacentElement('afterend', this.container);
        } else {
            console.warn('Audio-Player: project-header nicht gefunden');
            return;
        }
        
        // DOM-Referenzen speichern
        this.playPauseBtn = this.expandedView.querySelector('.play-pause-btn');
        this.progressBar = this.expandedView.querySelector('.progress-bar');
        this.progressFill = this.expandedView.querySelector('.progress-fill');
        this.progressIndicator = this.expandedView.querySelector('.progress-indicator');
        this.timeDisplay = this.expandedView.querySelector('.time-display');
    }

    /**
     * Event-Listener anhängen
     */
    attachEventListeners() {
        // Collapsed → Expand & Play
        this.collapsedView.addEventListener('click', () => {
            this.expand();
            this.play();
        });
        
        // Play/Pause Toggle
        this.playPauseBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        });
        
        // Tastatur-Steuerung (Space-Taste)
        document.addEventListener('keydown', (e) => {
            if (this.isExpanded && e.code === 'Space') {
                // Nur wenn nicht in Input-Feld
                if (e.target === document.body) {
                    e.preventDefault();
                    if (this.isPlaying) {
                        this.pause();
                    } else {
                        this.play();
                    }
                }
            }
        });
    }

    /**
     * Expandiert Player (collapsed → expanded)
     */
    expand() {
        this.isExpanded = true;
        this.collapsedView.style.display = 'none';
        this.expandedView.style.display = 'flex';
    }

    /**
     * Startet Wiedergabe
     */
    play() {
        // WICHTIG: Browser-Workaround für Tab-Navigation
        // Speech Synthesis muss "aufgewärmt" werden bei Tastatur-Interaktion
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
        
        if (!this.utterance) {
            // Neue Utterance erstellen
            this.utterance = new SpeechSynthesisUtterance(this.textContent);
            this.utterance.lang = 'en-US'; // Englische Stimme für englischen Text
            this.utterance.rate = 0.95; // Leicht verlangsamt für bessere Verständlichkeit
            this.utterance.pitch = 1.0;
            
            // Events
            this.utterance.onend = () => {
                this.onPlaybackEnd();
            };
            
            this.utterance.onerror = (event) => {
                console.error('Speech Synthesis Fehler:', event);
                console.error('Event details:', event.error, event.charIndex);
                this.stop();
            };
            
            // Workaround: Cancel erst alte Queue, dann neu sprechen
            this.synthesis.cancel();
            
            // Kurze Verzögerung für Browser-Kompatibilität
            setTimeout(() => {
                this.synthesis.speak(this.utterance);
            }, 50);
        } else {
            // Resume bei Pause
            this.synthesis.resume();
        }
        
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.startProgressTracking();
    }

    /**
     * Pausiert Wiedergabe
     */
    pause() {
        this.synthesis.pause();
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.stopProgressTracking();
    }

    /**
     * Stoppt Wiedergabe komplett
     */
    stop() {
        this.synthesis.cancel();
        this.isPlaying = false;
        this.currentTime = 0;
        this.updatePlayPauseButton();
        this.stopProgressTracking();
        this.updateProgress();
        this.utterance = null;
    }

    /**
     * Callback wenn Wiedergabe zu Ende ist
     */
    onPlaybackEnd() {
        this.isPlaying = false;
        this.currentTime = this.estimatedSeconds;
        this.updateProgress();
        this.updatePlayPauseButton();
        this.stopProgressTracking();
        
        // Nach 2 Sekunden zurück zu collapsed
        setTimeout(() => {
            this.collapse();
        }, 2000);
    }

    /**
     * Kollabiert Player zurück zu Initial-Zustand
     */
    collapse() {
        this.isExpanded = false;
        this.expandedView.style.display = 'none';
        this.collapsedView.style.display = 'flex';
        this.currentTime = 0;
        this.utterance = null;
        this.updateProgress();
    }

    /**
     * Aktualisiert Play/Pause Icon
     */
    updatePlayPauseButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
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
     * Startet Progress-Tracking
     */
    startProgressTracking() {
        // Update alle 100ms
        this.progressInterval = setInterval(() => {
            this.currentTime += 0.1;
            
            // Stop bei geschätzter Endzeit
            if (this.currentTime >= this.estimatedSeconds) {
                this.currentTime = this.estimatedSeconds;
                this.stopProgressTracking();
            }
            
            this.updateProgress();
        }, 100);
    }

    /**
     * Stoppt Progress-Tracking
     */
    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    /**
     * Aktualisiert Progress Bar und Zeit-Anzeige
     */
    updateProgress() {
        const percentage = Math.min((this.currentTime / this.estimatedSeconds) * 100, 100);
        
        // Progress Fill aktualisieren
        this.progressFill.style.width = `${percentage}%`;
        
        // Progress Indicator (Punkt) aktualisieren
        this.progressIndicator.style.left = `${percentage}%`;
        
        // ARIA-Attribute aktualisieren
        this.progressBar.setAttribute('aria-valuenow', Math.round(percentage));
        
        // Zeit-Anzeige: Restzeit im Format "-1:32"
        const remainingSeconds = Math.max(0, this.estimatedSeconds - this.currentTime);
        this.timeDisplay.textContent = `-${this.formatTime(Math.ceil(remainingSeconds))}`;
    }

    /**
     * Formatiert Sekunden zu MM:SS
     * @param {number} seconds 
     * @returns {string} Formatierte Zeit
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// ===== INITIALISIERUNG =====
// Wird ausgeführt wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const player = new AudioPlayer();
    player.init();
});