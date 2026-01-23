// Cookie Consent & Google Analytics 4 Integration
// With Privacy Settings Panel Support
// Measurement ID: G-SFH038KZHN

(function() {
    'use strict';
    
    const GA_MEASUREMENT_ID = 'G-SFH038KZHN';
    const CONSENT_KEY = 'pixel_industry_analytics_consent';
    
    // Track if GA is currently loaded
    let gaLoaded = false;
    
    // Temporary state for privacy settings panel
    let tempAnalyticsState = null;
    
    // ==========================================
    // LOAD MATERIAL ICONS (automatically)
    // ==========================================
    
    function loadMaterialIcons() {
        // Check if already loaded
        if (document.querySelector('link[href*="Material+Symbols+Outlined"]')) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0';
        document.head.appendChild(link);
    }
    
    // ==========================================
    // CONSENT MANAGEMENT
    // ==========================================
    
    function getConsent() {
        return localStorage.getItem(CONSENT_KEY);
    }
    
    function setConsent(value) {
        localStorage.setItem(CONSENT_KEY, value);
    }
    
    function resetConsent() {
        localStorage.removeItem(CONSENT_KEY);
    }
    
    // ==========================================
    // GOOGLE ANALYTICS
    // ==========================================
    
    function loadGoogleAnalytics() {
        if (gaLoaded) return;
        
        // Load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            'anonymize_ip': true
        });
        
        gaLoaded = true;
        console.log('Google Analytics loaded');
    }
    
    function disableGoogleAnalytics() {
        // Set opt-out cookie for GA
        window['ga-disable-' + GA_MEASUREMENT_ID] = true;
        
        // Remove GA cookies
        document.cookie.split(";").forEach(function(c) {
            if (c.trim().startsWith('_ga') || c.trim().startsWith('_gid')) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            }
        });
        
        console.log('Google Analytics disabled');
    }
    
    // ==========================================
    // COOKIE BANNER (First Visit)
    // ==========================================
    
    function showBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.display = 'block';
            setTimeout(() => {
                banner.classList.add('visible');
            }, 10);
        }
    }
    
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('visible');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    }
    
    function acceptCookies() {
        setConsent('accepted');
        hideBanner();
        loadGoogleAnalytics();
    }
    
    function denyCookies() {
        setConsent('denied');
        hideBanner();
        disableGoogleAnalytics();
    }
    
    // ==========================================
    // PRIVACY SETTINGS PANEL
    // ==========================================
    
    function openPrivacySettings() {
        const panel = document.getElementById('privacy-settings-panel');
        if (panel) {
            // Set initial toggle state based on current consent
            const consent = getConsent();
            tempAnalyticsState = (consent === 'accepted');
            updateToggleUI(tempAnalyticsState);
            
            panel.style.display = 'block';
            setTimeout(() => {
                panel.classList.add('visible');
            }, 10);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closePrivacySettings() {
        const panel = document.getElementById('privacy-settings-panel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => {
                panel.style.display = 'none';
            }, 400);
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
        
        // Reset temp state
        tempAnalyticsState = null;
    }
    
    function toggleAnalytics() {
        tempAnalyticsState = !tempAnalyticsState;
        updateToggleUI(tempAnalyticsState);
    }
    
    function updateToggleUI(isEnabled) {
        const toggleIcon = document.getElementById('analytics-toggle-icon');
        const toggleBtn = document.getElementById('analytics-toggle');
        
        if (toggleIcon && toggleBtn) {
            if (isEnabled) {
                toggleIcon.textContent = 'toggle_on';
                toggleBtn.classList.add('active');
            } else {
                toggleIcon.textContent = 'toggle_off';
                toggleBtn.classList.remove('active');
            }
        }
    }
    
    function cancelPrivacySettings() {
        closePrivacySettings();
    }
    
    function savePrivacySettings() {
        if (tempAnalyticsState) {
            setConsent('accepted');
            loadGoogleAnalytics();
        } else {
            setConsent('denied');
            disableGoogleAnalytics();
        }
        
        closePrivacySettings();
        
        // Optional: Show confirmation
        console.log('Privacy settings saved:', tempAnalyticsState ? 'Analytics enabled' : 'Analytics disabled');
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        // Load Material Icons for Privacy Settings Panel
        loadMaterialIcons();
        
        const consent = getConsent();
        
        if (consent === 'accepted') {
            loadGoogleAnalytics();
        } else if (consent === 'denied') {
            disableGoogleAnalytics();
        } else {
            // No choice yet - show banner
            showBanner();
        }
        
        // Add click handler for footer link
        const footerLinks = document.querySelectorAll('.privacy-settings-link');
        footerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openPrivacySettings();
            });
        });
    }
    
    // ==========================================
    // EXPOSE FUNCTIONS GLOBALLY
    // ==========================================
    
    window.acceptCookies = acceptCookies;
    window.denyCookies = denyCookies;
    window.openPrivacySettings = openPrivacySettings;
    window.closePrivacySettings = closePrivacySettings;
    window.toggleAnalytics = toggleAnalytics;
    window.cancelPrivacySettings = cancelPrivacySettings;
    window.savePrivacySettings = savePrivacySettings;
    
    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();