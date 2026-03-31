// === KONFIGURATION ===
// Hier kannst du zentrale Links ändern
const CONFIG = {
    cvLink: '/cv_markus_mueller.pdf',
    email: 'mueller@pixel-industry.de',
    googleAnalyticsId: 'G-SFH038KZHN'
};

// Header und Footer laden
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const isInProjects = path.includes('/projects/');
    const basePath = isInProjects ? '../' : '';

    // Scroll-Position wiederherstellen wenn auf index.html
    if (path.includes('index.html') || path.endsWith('/')) {
        restoreScrollPosition();
    }

    // Header laden
    fetch(basePath + 'header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Header konnte nicht geladen werden: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;

                fixHeaderPaths(basePath);
                updateMobileIconsForDarkMode(basePath);

                // Skip-Link: Header beim Fokus einblenden
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.addEventListener('focus', function() {
                        const header = document.querySelector('header');
                        if (header) {
                            header.classList.remove('header-hidden');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                        }
                    });
                }

                setTimeout(() => {
                    initHeaderScroll();
                }, 100);
            }
        })
        .catch(error => console.error('Fehler beim Laden des Headers:', error));

    // Footer laden
    fetch(basePath + 'footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Footer konnte nicht geladen werden: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;

                fixFooterPaths(basePath);

                if (typeof initCookieBanner === 'function') {
                    initCookieBanner();
                }
            }
        })
        .catch(error => console.error('Fehler beim Laden des Footers:', error));

    setTimeout(initProjectAnimations, 250);
    setTimeout(fixCtaButtons, 300);
    setTimeout(initPortfolioLinks, 300);

    initAboutTabs();

    if (typeof initGoogleAnalytics === 'function') {
        initGoogleAnalytics();
    }
});

// Header-Pfade korrigieren
function fixHeaderPaths(basePath) {
    const logoLinks = document.querySelectorAll('.logo-link');
    const logos = document.querySelectorAll('.logo');

    logoLinks.forEach(logoLink => {
        if (logoLink) {
            logoLink.href = basePath + 'index.html';

            logoLink.addEventListener('focus', function() {
                const header = document.querySelector('header');
                if (header) {
                    header.classList.remove('header-hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    });

    logos.forEach(logo => {
        if (logo) logo.src = basePath + 'images/pixel_industry_logo.svg';
    });

    const navHome = document.querySelector('.nav-home');
    const navAbout = document.querySelector('.nav-about');
    const navContact = document.querySelector('.nav-contact');
    const cvLink = document.querySelector('.cv-link');
    if (navHome) navHome.href = basePath + 'index.html';
    if (navAbout) navAbout.href = basePath + 'about.html';
    if (navContact) navContact.href = basePath + 'contact.html';
    if (cvLink) cvLink.href = CONFIG.cvLink;

    // Active State
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    if (currentPage === 'index.html' || currentPage === '' || currentPath === '/') {
        if (navHome) navHome.classList.add('active');
    }
    if (currentPage === 'about.html') {
        if (navAbout) navAbout.classList.add('active');
    }
    if (currentPage === 'contact.html') {
        if (navContact) navContact.classList.add('active');
    }

    // Mobile Menu
    const mobileNavHome = document.querySelector('.mobile-nav-home');
    const mobileNavAbout = document.querySelector('.mobile-nav-about');
    const mobileNavContact = document.querySelector('.mobile-nav-contact');
    const mobileNavCv = document.querySelector('.mobile-nav-cv');
    if (mobileNavHome) mobileNavHome.href = basePath + 'index.html';
    if (mobileNavAbout) mobileNavAbout.href = basePath + 'about.html';
    if (mobileNavContact) mobileNavContact.href = basePath + 'contact.html';
    if (mobileNavCv) mobileNavCv.href = CONFIG.cvLink;

    // Tab-Navigation: Mobile Menu aus Tab-Reihenfolge auf Desktop nehmen
    const isMobile = window.innerWidth <= 768;
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu a');

    if (mobileMenuBtn) mobileMenuBtn.tabIndex = isMobile ? 0 : -1;

    if (mobileMenuLinks && mobileMenuLinks.length > 0) {
        mobileMenuLinks.forEach(link => {
            link.tabIndex = (mobileMenu && mobileMenu.classList.contains('active')) ? 0 : -1;
        });
    }

    window.addEventListener('resize', function() {
        const isMobileNow = window.innerWidth <= 768;
        if (mobileMenuBtn) mobileMenuBtn.tabIndex = isMobileNow ? 0 : -1;
        if (mobileMenuLinks && mobileMenuLinks.length > 0) {
            mobileMenuLinks.forEach(link => {
                link.tabIndex = (mobileMenu && mobileMenu.classList.contains('active')) ? 0 : -1;
            });
        }
    });
}

// Footer-Pfade korrigieren
function fixFooterPaths(basePath) {
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === 'imprint.html') link.href = basePath + 'imprint.html';
        if (href === 'privacy.html') link.href = basePath + 'privacy.html';
    });

    const privacyPolicyLink = document.querySelector('.privacy-box a[href*="privacy"]');
    if (privacyPolicyLink) privacyPolicyLink.href = basePath + 'privacy.html';

    // Toggle-Icons im Privacy Panel: relative Pfade auf Projektseiten korrigieren
    const toggleIcons = document.querySelectorAll('#privacy-settings-panel img.toggle-icon');
    toggleIcons.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('/') && !src.startsWith('http')) {
            img.src = basePath + src;
        }
    });
}

// CTA Buttons mit Config-Links aktualisieren
function fixCtaButtons() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';
    const isProjectPage = path.includes('/projects/');

    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach((button) => {
        const text = button.textContent.trim();

        if (text === 'Open CV') {
            button.href = CONFIG.cvLink;
            button.setAttribute('target', '_blank');
            button.setAttribute('rel', 'noopener noreferrer');
            button.addEventListener('click', function() {
                if (typeof trackCVClick === 'function') {
                    if (isProjectPage) {
                        trackCVClick('project_page', pageName);
                    } else if (pageName === 'about') {
                        trackCVClick('about_page', pageName);
                    } else {
                        trackCVClick('other_page', pageName);
                    }
                }
            });
        }

        if (text === 'Get in touch') {
            if (pageName === 'about' || isProjectPage) {
                button.href = isProjectPage ? '../contact.html' : 'contact.html';
            } else {
                button.href = 'mailto:' + CONFIG.email;
            }
        }
    });

    const headerCVLink = document.querySelector('.cv-link');
    if (headerCVLink) {
        headerCVLink.addEventListener('click', function() {
            if (typeof trackCVClick === 'function') trackCVClick('header', pageName);
        });
    }

    const mobileNavCV = document.querySelector('.mobile-nav-cv');
    if (mobileNavCV) {
        mobileNavCV.addEventListener('click', function() {
            if (typeof trackCVClick === 'function') trackCVClick('mobile_menu', pageName);
        });
    }
}

// Skip-Link: Fokus auf Sprungziel setzen beim Klick/Enter
// Muss VOR dem allgemeinen Smooth-Scroll stehen, damit kein Konflikt entsteht
const skipLink = document.querySelector('.skip-link');
if (skipLink) {
    skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: false });
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Smooth scroll für Anker-Links
document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(anchor => {
    if (anchor.getAttribute('href') === '#') return;
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
