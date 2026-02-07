/**
 * Cookie & Privacy Management
 * Handles: Cookie Banner, Google Analytics, Privacy Settings Panel
 * Dependencies: Needs CONFIG.googleAnalyticsId from main.js
 */

// Google Analytics Functions
function initGoogleAnalytics() {
    const functionalCookies = localStorage.getItem('functionalCookies') === 'true';
    
    if (functionalCookies && CONFIG.googleAnalyticsId !== 'G-XXXXXXXXXX') {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.googleAnalyticsId}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', CONFIG.googleAnalyticsId, {
            'anonymize_ip': true
        });
        
        console.log('Google Analytics initialized');
    } else {
        console.log('Google Analytics disabled - no consent or invalid ID');
    }
}

function disableGoogleAnalytics() {
    // Disable Google Analytics
    if (window.gtag) {
        window[`ga-disable-${CONFIG.googleAnalyticsId}`] = true;
        console.log('Google Analytics disabled');
    }
    
    // Remove GA cookies
    const gaCookies = document.cookie.split(';').filter(cookie => 
        cookie.trim().startsWith('_ga') || cookie.trim().startsWith('_gid')
    );
    
    gaCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
}

// Cookie Banner Funktionen
function initCookieBanner() {
    const cookieConsent = localStorage.getItem('cookieConsent');
    const cookieBanner = document.getElementById('cookie-banner');
    
    if (cookieBanner) {
        if (!cookieConsent) {
            // Show banner after short delay
            setTimeout(() => {
                cookieBanner.classList.add('visible');
                
                // Focus first button (Accept) for accessibility
                const acceptBtn = cookieBanner.querySelector('.cookie-btn-accept');
                if (acceptBtn) {
                    setTimeout(() => {
                        acceptBtn.focus();
                    }, 100);
                }
                
                // Add keyboard navigation support
                setupCookieBannerKeyboardNav(cookieBanner);
            }, 1000);
        }
    }
}

// Keyboard Navigation für Cookie Banner
function setupCookieBannerKeyboardNav(banner) {
    const buttons = banner.querySelectorAll('.cookie-btn');
    
    // Tab zwischen Accept/Decline
    banner.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            const acceptBtn = banner.querySelector('.cookie-btn-accept');
            const declineBtn = banner.querySelector('.cookie-btn-decline');
            
            if (document.activeElement === acceptBtn) {
                declineBtn.focus();
            } else {
                acceptBtn.focus();
            }
        }
        
        // Enter/Space aktiviert fokussierten Button
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            
            // Merke dass Tastatur genutzt wurde
            lastInteractionWasKeyboard = true;
            
            if (document.activeElement.classList.contains('cookie-btn-accept')) {
                acceptCookies();
            } else if (document.activeElement.classList.contains('cookie-btn-decline')) {
                declineCookies();
            }
        }
    });
    
    // Track Maus-Klicks (setzen Flag NICHT)
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Bei Maus-Klick bleibt lastInteractionWasKeyboard = false
            // onclick handler in HTML wird trotzdem ausgeführt
        });
    });
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('functionalCookies', 'true');
    hideCookieBanner();
    initGoogleAnalytics();
    
    // Fokus zurück nur bei Tastatur-Navigation
    returnFocusAfterBanner();
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('functionalCookies', 'false');
    hideCookieBanner();
    
    // Fokus zurück nur bei Tastatur-Navigation
    returnFocusAfterBanner();
}

// Track ob letzte Interaktion per Tastatur war
let lastInteractionWasKeyboard = false;

function returnFocusAfterBanner() {
    // Nur fokussieren wenn User Tastatur nutzt
    if (lastInteractionWasKeyboard) {
        setTimeout(() => {
            const logo = document.querySelector('.logo-link');
            if (logo && typeof logo.focus === 'function') {
                logo.focus();
            }
        }, 100);
    }
    // Reset flag
    lastInteractionWasKeyboard = false;
}

function hideCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        cookieBanner.classList.remove('visible');
    }
}

// Privacy Settings Panel Functions
function openPrivacySettings() {
    const panel = document.getElementById('privacy-settings-panel');
    if (panel) {
        panel.classList.add('visible');
        document.body.style.overflow = 'hidden';
        
        // Get all ACTUALLY focusable elements (not disabled, not hidden)
        const getFocusableElements = () => {
            const elements = Array.from(panel.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])'));
            // Filter out disabled buttons and elements outside the panel
            return elements.filter(el => {
                return !el.disabled && 
                       el.offsetParent !== null && // Element is visible
                       panel.contains(el); // Element is inside panel
            });
        };
        
        // Focus first element (close button)
        const focusableElements = getFocusableElements();
        const firstFocusable = focusableElements[0];
        
        if (firstFocusable && typeof firstFocusable.focus === 'function') {
            setTimeout(() => {
                try {
                    firstFocusable.focus();
                } catch (e) {
                    console.log('Could not focus first element:', e);
                }
            }, 100);
        }
        
        // Focus Trap - Tab bleibt im Panel gefangen
        const handleTab = (e) => {
            if (e.key === 'Tab') {
                // Re-get focusable elements (in case Save button became enabled/disabled)
                const currentFocusable = getFocusableElements();
                const firstElement = currentFocusable[0];
                const lastElement = currentFocusable[currentFocusable.length - 1];
                
                if (e.shiftKey) {
                    // Shift + Tab (rückwärts)
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab (vorwärts)
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        // ESC key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closePrivacySettings();
                document.removeEventListener('keydown', handleTab);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleTab);
        document.addEventListener('keydown', handleEscape);
        
        // Store handlers so we can remove them later
        panel.dataset.trapActive = 'true';
        panel._handleTab = handleTab;
        panel._handleEscape = handleEscape;
        
        // Load saved settings
        const functionalCookies = localStorage.getItem('functionalCookies') === 'true';
        const toggle = document.getElementById('analytics-toggle');
        const icon = document.getElementById('analytics-toggle-icon');
        
        // Store original state for comparison
        if (toggle) {
            toggle.dataset.originalState = functionalCookies ? 'true' : 'false';
        }
        
        if (functionalCookies && toggle && icon) {
            toggle.classList.add('active');
            icon.src = 'images/toggle_on.svg';
            icon.alt = 'Toggle on';
        } else if (toggle && icon) {
            toggle.classList.remove('active');
            icon.src = 'images/toggle_off.svg';
            icon.alt = 'Toggle off';
        }
        
        // Reset save button to disabled
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
        }
    }
}

function closePrivacySettings() {
    const panel = document.getElementById('privacy-settings-panel');
    if (panel) {
        panel.classList.remove('visible');
        document.body.style.overflow = '';
        
        // Remove focus trap event listeners
        if (panel._handleTab) {
            document.removeEventListener('keydown', panel._handleTab);
            panel._handleTab = null;
        }
        if (panel._handleEscape) {
            document.removeEventListener('keydown', panel._handleEscape);
            panel._handleEscape = null;
        }
        panel.dataset.trapActive = 'false';
        
        // Return focus to Privacy Settings link
        const privacySettingsLink = document.querySelector('a[onclick*="openPrivacySettings"]');
        if (privacySettingsLink && typeof privacySettingsLink.focus === 'function') {
            setTimeout(() => {
                privacySettingsLink.focus();
                
                // Add one-time Tab handler to jump to logo
                const handleNextTab = (e) => {
                    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === privacySettingsLink) {
                        e.preventDefault();
                        
                        // Scroll to top and focus logo
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                        
                        const logoLink = document.querySelector('.logo-link');
                        if (logoLink) {
                            setTimeout(() => {
                                logoLink.focus();
                            }, 300);
                        }
                        
                        // Remove this listener after use
                        document.removeEventListener('keydown', handleNextTab);
                    }
                };
                
                document.addEventListener('keydown', handleNextTab);
                
                // Clean up if user doesn't press Tab (e.g., clicks somewhere)
                setTimeout(() => {
                    document.removeEventListener('keydown', handleNextTab);
                }, 5000);
            }, 100);
        }
    }
}

function toggleAnalytics() {
    const toggle = document.getElementById('analytics-toggle');
    const icon = document.getElementById('analytics-toggle-icon');
    const saveBtn = document.getElementById('save-btn');
    
    if (toggle && icon && saveBtn) {
        toggle.classList.toggle('active');
        
        if (toggle.classList.contains('active')) {
            icon.src = 'images/toggle_on.svg';
            icon.alt = 'Toggle on';
        } else {
            icon.src = 'images/toggle_off.svg';
            icon.alt = 'Toggle off';
        }
        
        // Check if current state differs from original state
        const currentState = toggle.classList.contains('active') ? 'true' : 'false';
        const originalState = toggle.dataset.originalState || 'false';
        
        // Enable save button only if state has changed
        saveBtn.disabled = (currentState === originalState);
    }
}

function savePrivacySettings() {
    const toggle = document.getElementById('analytics-toggle');
    if (toggle) {
        const analyticsEnabled = toggle.classList.contains('active');
        
        localStorage.setItem('functionalCookies', analyticsEnabled.toString());
        localStorage.setItem('cookieConsent', 'custom');
        
        if (analyticsEnabled) {
            // Enable Google Analytics
            initGoogleAnalytics();
        } else {
            // Disable Google Analytics
            disableGoogleAnalytics();
        }
        
        closePrivacySettings();
        hideCookieBanner();
    }
}

// Track CV clicks with Google Analytics
function trackCVClick(origin, pageName) {
    if (window.gtag && typeof window.gtag === 'function') {
        gtag('event', 'cv_view', {
            'button_origin': origin,
            'page_name': pageName
        });
        console.log(`GA Event tracked: cv_view from ${origin} on page ${pageName}`);
    } else {
        console.log(`GA not loaded - would track: cv_view from ${origin} on page ${pageName}`);
    }
}