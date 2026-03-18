/**
 * Cookie & Privacy Management
 * Handles: Cookie Banner, Google Analytics, Contentsquare, Privacy Settings Panel
 * Dependencies: Needs CONFIG.googleAnalyticsId from main.js (optional)
 */

// ============================================================
// GOOGLE ANALYTICS
// ============================================================

function initGoogleAnalytics() {
    // Only load if CONFIG.googleAnalyticsId is defined and valid
    if (
        typeof CONFIG !== 'undefined' &&
        CONFIG.googleAnalyticsId &&
        CONFIG.googleAnalyticsId !== 'G-XXXXXXXXXX'
    ) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
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
    if (typeof CONFIG !== 'undefined' && CONFIG.googleAnalyticsId && window.gtag) {
        window[`ga-disable-${CONFIG.googleAnalyticsId}`] = true;
        console.log('Google Analytics disabled');
    }

    // Remove GA cookies
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_ga') || name.startsWith('_gid')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    });
}

// ============================================================
// CONTENTSQUARE
// ============================================================

/**
 * Loads the Contentsquare script dynamically.
 * Must only be called after explicit user consent.
 */
function initContentsquare() {
    // Prevent loading the script twice
    if (document.querySelector('script[src*="contentsquare.net"]')) {
        console.log('Contentsquare already loaded');
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://t.contentsquare.net/uxa/af0bfc5b39917.js';
    document.head.appendChild(script);

    console.log('Contentsquare initialized');
}

/**
 * Disables Contentsquare tracking and removes its cookies.
 * Uses the official CS opt-out mechanism where available.
 */
function disableContentsquare() {
    // Official Contentsquare opt-out flag
    window._uxa = window._uxa || [];
    window._uxa.push(['optout']);

    // Remove known Contentsquare cookies
    // CS typically uses cookies starting with _cs_ or cs_
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_cs') || name.startsWith('cs_')) {
            // Delete for current domain and root path
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        }
    });

    console.log('Contentsquare disabled');
}

// ============================================================
// COOKIE BANNER
// ============================================================

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

                setupCookieBannerKeyboardNav(cookieBanner);
            }, 1000);
        } else if (cookieConsent === 'accepted') {
            // Consent already given – initialize trackers silently
            initGoogleAnalytics();
            initContentsquare();
        }
    }
}

// Keyboard navigation for cookie banner
function setupCookieBannerKeyboardNav(banner) {
    banner.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();

            const acceptBtn = banner.querySelector('.cookie-btn-accept');
            const declineBtn = banner.querySelector('.cookie-btn-decline');

            if (document.activeElement === acceptBtn) {
                if (declineBtn) declineBtn.focus();
            } else {
                if (acceptBtn) acceptBtn.focus();
            }
        }

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            lastInteractionWasKeyboard = true;

            if (document.activeElement.classList.contains('cookie-btn-accept')) {
                acceptCookies();
            } else if (document.activeElement.classList.contains('cookie-btn-decline')) {
                declineCookies();
            }
        }
    });
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('functionalCookies', 'true');
    hideCookieBanner();
    initGoogleAnalytics();
    initContentsquare();
    returnFocusAfterBanner();
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('functionalCookies', 'false');
    hideCookieBanner();
    disableGoogleAnalytics();
    disableContentsquare();
    returnFocusAfterBanner();
}

// Track whether last interaction was via keyboard (for focus management)
let lastInteractionWasKeyboard = false;

function returnFocusAfterBanner() {
    if (lastInteractionWasKeyboard) {
        setTimeout(() => {
            const logo = document.querySelector('.logo-link');
            if (logo && typeof logo.focus === 'function') {
                logo.focus();
            }
        }, 100);
    }
    lastInteractionWasKeyboard = false;
}

function hideCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        cookieBanner.classList.remove('visible');
    }
}

// ============================================================
// PRIVACY SETTINGS PANEL
// ============================================================

function openPrivacySettings() {
    const panel = document.getElementById('privacy-settings-panel');
    if (!panel) return;

    panel.classList.add('visible');
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () => {
        return Array.from(
            panel.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])')
        ).filter(el => !el.disabled && el.offsetParent !== null && panel.contains(el));
    };

    const focusableElements = getFocusableElements();
    if (focusableElements[0]) {
        setTimeout(() => {
            try { focusableElements[0].focus(); } catch (e) { /* noop */ }
        }, 100);
    }

    // Focus trap
    const handleTab = (e) => {
        if (e.key !== 'Tab') return;

        const current = getFocusableElements();
        const first = current[0];
        const last = current[current.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closePrivacySettings();
            document.removeEventListener('keydown', handleTab);
            document.removeEventListener('keydown', handleEscape);
        }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);

    panel._handleTab = handleTab;
    panel._handleEscape = handleEscape;

    // Load saved settings into toggle
    const functionalCookies = localStorage.getItem('functionalCookies') === 'true';
    const toggle = document.getElementById('analytics-toggle');
    const icon = document.getElementById('analytics-toggle-icon');

    if (toggle) {
        toggle.dataset.originalState = functionalCookies ? 'true' : 'false';

        if (functionalCookies && icon) {
            toggle.classList.add('active');
            icon.src = 'images/toggle_on.svg';
            icon.alt = 'Toggle on';
        } else if (icon) {
            toggle.classList.remove('active');
            icon.src = 'images/toggle_off.svg';
            icon.alt = 'Toggle off';
        }
    }

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.disabled = true;
}

function closePrivacySettings() {
    const panel = document.getElementById('privacy-settings-panel');
    if (!panel) return;

    panel.classList.remove('visible');
    document.body.style.overflow = '';

    if (panel._handleTab) {
        document.removeEventListener('keydown', panel._handleTab);
        panel._handleTab = null;
    }
    if (panel._handleEscape) {
        document.removeEventListener('keydown', panel._handleEscape);
        panel._handleEscape = null;
    }

    // Return focus to Privacy Settings trigger button
    const privacySettingsBtn = document.getElementById('open-privacy-settings-btn');
    if (privacySettingsBtn) {
        setTimeout(() => privacySettingsBtn.focus(), 100);
    }
}

function toggleAnalytics() {
    const toggle = document.getElementById('analytics-toggle');
    const icon = document.getElementById('analytics-toggle-icon');
    const saveBtn = document.getElementById('save-btn');

    if (!toggle || !icon || !saveBtn) return;

    toggle.classList.toggle('active');

    if (toggle.classList.contains('active')) {
        icon.src = 'images/toggle_on.svg';
        icon.alt = 'Toggle on';
    } else {
        icon.src = 'images/toggle_off.svg';
        icon.alt = 'Toggle off';
    }

    const currentState = toggle.classList.contains('active') ? 'true' : 'false';
    const originalState = toggle.dataset.originalState || 'false';
    saveBtn.disabled = (currentState === originalState);
}

function savePrivacySettings() {
    const toggle = document.getElementById('analytics-toggle');
    if (!toggle) return;

    const analyticsEnabled = toggle.classList.contains('active');

    localStorage.setItem('functionalCookies', analyticsEnabled.toString());
    localStorage.setItem('cookieConsent', 'custom');

    if (analyticsEnabled) {
        initGoogleAnalytics();
        initContentsquare();
    } else {
        disableGoogleAnalytics();
        disableContentsquare();
    }

    closePrivacySettings();
    hideCookieBanner();
}

// ============================================================
// ANALYTICS EVENT TRACKING
// ============================================================

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