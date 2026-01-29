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
            }, 1000);
        }
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('functionalCookies', 'true');
    hideCookieBanner();
    initGoogleAnalytics();
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('functionalCookies', 'false');
    hideCookieBanner();
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