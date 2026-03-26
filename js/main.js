// === KONFIGURATION ===
// Hier kannst du zentrale Links ändern
const CONFIG = {
        cvLink: '/cv_markus_mueller.pdf',
    email: 'mueller@pixel-industry.de',
    googleAnalyticsId: 'G-SFH038KZHN' // TODO: Replace with your actual GA4 ID
};

// Flag: verhindert Header-Einblenden bei programmatischem Scroll (z.B. Tab-Wechsel)
let skipHeaderScrollUpdate = false;

// Scroll-Position Management
function saveScrollPosition() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('portfolioScrollPos', scrollPos);
    console.log('Scroll position saved:', scrollPos);
}

function restoreScrollPosition() {
    const savedPos = sessionStorage.getItem('portfolioScrollPos');
    if (savedPos !== null) {
        console.log('Restoring scroll position:', savedPos);
        // Warte kurz bis Seite geladen ist
        setTimeout(() => {
            window.scrollTo({
                top: parseInt(savedPos),
                behavior: 'instant'
            });
            // Position nach Restore löschen
            sessionStorage.removeItem('portfolioScrollPos');
        }, 100);
    }
}

// Header und Footer laden
document.addEventListener('DOMContentLoaded', function() {
    // Prüfe ob wir in einem Unterordner sind
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
                
                // WICHTIG: Pfade im Header korrigieren NACHDEM er eingefügt wurde
                fixHeaderPaths(basePath);
                
                // Dark Mode Icon Swapping
                updateMobileIconsForDarkMode(basePath);
                
                // Skip-Link: Header beim Fokus einblenden, damit Navigation sichtbar ist
                // wenn Nutzer NICHT skippt (d.h. durch Header tabbt)
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
                
                // Warte kurz bis Header vollständig geladen ist
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
                
                // Footer-Links korrigieren
                fixFooterPaths(basePath);
                
                // Cookie Banner initialisieren (wird durch cookies.js bereitgestellt)
                if (typeof initCookieBanner === 'function') {
                    initCookieBanner();
                }
            }
        })
        .catch(error => console.error('Fehler beim Laden des Footers:', error));

    // Scroll-Animationen initialisieren nach kurzer Verzögerung
    setTimeout(initProjectAnimations, 250);

    // CTA Buttons mit Config-Links aktualisieren
    setTimeout(fixCtaButtons, 300);

    // Portfolio Items: Scroll-Position speichern vor Navigation
    setTimeout(initPortfolioLinks, 300);

    // Tab Navigation (About-Seite)
    initAboutTabs();
    
    // Initialize Google Analytics if consent given (wird durch cookies.js bereitgestellt)
    if (typeof initGoogleAnalytics === 'function') {
        initGoogleAnalytics();
    }
});

// Projekt-Animationen
function initProjectAnimations() {
    console.log('initProjectAnimations wird aufgerufen');
    
    const animatedElements = document.querySelectorAll('.animate-fade, .animate-slide-left, .animate-slide-right, .animate-slide-up');
    
    console.log('Gefundene animierte Elemente:', animatedElements.length);
    
    if (animatedElements.length === 0) {
        console.log('Keine Animationen auf dieser Seite');
        return; // Keine Animationen auf dieser Seite
    }

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('Element beobachtet:', entry.target.className, 'isIntersecting:', entry.isIntersecting);
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    console.log('visible Klasse hinzugefügt zu:', entry.target.className);
                }, 100);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
        
        // Prüfe ob Element bereits im Viewport
        const rect = el.getBoundingClientRect();
        console.log('Element Position:', el.className, 'top:', rect.top, 'viewport height:', window.innerHeight);
        
        if (rect.top < window.innerHeight * 0.8) {
            console.log('Element ist bereits im Viewport, Animation starten');
            setTimeout(() => {
                el.classList.add('visible');
            }, 200);
        }
    });
}

// Funktion um Header-Pfade zu korrigieren
function fixHeaderPaths(basePath) {
    console.log('Korrigiere Header-Pfade mit basePath:', basePath);
    
    // Logo (beide Instanzen: Header und Mobile Menu)
    const logoLinks = document.querySelectorAll('.logo-link');
    const logos = document.querySelectorAll('.logo');
    
    logoLinks.forEach(logoLink => {
        if (logoLink) {
            logoLink.href = basePath + 'index.html';
            console.log('Logo Link:', logoLink.href);
            
            // A11y: Wenn Logo per Tab fokussiert wird, Header einblenden und nach oben scrollen
            logoLink.addEventListener('focus', function() {
                const header = document.querySelector('header');
                if (header) {
                    // Header einblenden
                    header.classList.remove('header-hidden');
                    
                    // Nach oben scrollen damit Header und Logo sichtbar sind
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
    
    logos.forEach(logo => {
        if (logo) {
            logo.src = basePath + 'images/pixel_industry_logo.svg';
            console.log('Logo Src:', logo.src);
        }
    });
    
    // Desktop Navigation
    const navHome = document.querySelector('.nav-home');
    const navAbout = document.querySelector('.nav-about');
    const navContact = document.querySelector('.nav-contact');
    const cvLink = document.querySelector('.cv-link');
    if (navHome) navHome.href = basePath + 'index.html';
    if (navAbout) navAbout.href = basePath + 'about.html';
    if (navContact) navContact.href = basePath + 'contact.html';
    if (cvLink) cvLink.href = CONFIG.cvLink;

    // Active State Indicator - zeigt aktuelle Seite
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    // Work (index.html oder /) ist aktiv
    if (currentPage === 'index.html' || currentPage === '' || currentPath === '/') {
        if (navHome) navHome.classList.add('active');
    }

    // About ist aktiv
    if (currentPage === 'about.html') {
        if (navAbout) navAbout.classList.add('active');
    }

    // Contact ist aktiv
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
    
    // Mobile Menu Button
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.tabIndex = isMobile ? 0 : -1;
    }
    
    // Mobile Menu Links: nur erreichbar wenn Menü tatsächlich offen ist
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu a');
    if (mobileMenuLinks && mobileMenuLinks.length > 0) {
        mobileMenuLinks.forEach(link => {
            const isMenuOpen = mobileMenu && mobileMenu.classList.contains('active');
            link.tabIndex = isMenuOpen ? 0 : -1;
        });
    }

    // Bei Fenster-Resize aktualisieren
    window.addEventListener('resize', function() {
        const isMobileNow = window.innerWidth <= 768;
        if (mobileMenuBtn) {
            mobileMenuBtn.tabIndex = isMobileNow ? 0 : -1;
        }
        if (mobileMenuLinks && mobileMenuLinks.length > 0) {
            mobileMenuLinks.forEach(link => {
                const isMenuOpen = mobileMenu && mobileMenu.classList.contains('active');
                link.tabIndex = isMenuOpen ? 0 : -1;
            });
        }
    });
    
    // Fix cookies.js script path in header
    const cookiesScript = document.querySelector('script[src*="cookies.js"]');
    if (cookiesScript && basePath) {
        const currentSrc = cookiesScript.getAttribute('src');
        if (!currentSrc.startsWith('..') && basePath === '../') {
            cookiesScript.src = basePath + 'js/cookies.js';
            console.log('Cookies Script Src:', cookiesScript.src);
        }
    }
}

// Footer Pfade korrigieren
function fixFooterPaths(basePath) {
    console.log('Korrigiere Footer-Pfade mit basePath:', basePath);
    
    // Alle Links im Footer
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === 'imprint.html') {
            link.href = basePath + 'imprint.html';
            console.log('Imprint Link:', link.href);
        }
        
        if (href === 'privacy.html') {
            link.href = basePath + 'privacy.html';
            console.log('Privacy Link:', link.href);
        }
    });
    
    // Privacy Policy Link im Privacy Panel
    const privacyPolicyLink = document.querySelector('.privacy-box a[href*="privacy"]');
    if (privacyPolicyLink) {
        privacyPolicyLink.href = basePath + 'privacy.html';
        console.log('Privacy Policy Link im Panel:', privacyPolicyLink.href);
    }
}

// CTA Buttons mit Config-Links aktualisieren
function fixCtaButtons() {
    console.log('Aktualisiere CTA Buttons mit Config-Links');
    
    // Detect current page name for tracking
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';
    const isProjectPage = path.includes('/projects/');
    
    // Alle "Open CV" Buttons finden und aktualisieren
    const ctaButtons = document.querySelectorAll('.cta-button');
    console.log('Gefundene CTA Buttons:', ctaButtons.length);
    
    ctaButtons.forEach((button, index) => {
        const text = button.textContent.trim();
        console.log(`Button ${index}: "${text}"`);
        
        // CV Button
        if (text === 'Open CV') {
            button.href = CONFIG.cvLink;
            button.setAttribute('target', '_blank');
            button.setAttribute('rel', 'noopener noreferrer');
            
            // Add Google Analytics tracking with page name (wird durch cookies.js bereitgestellt)
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
            
            console.log('CV Button aktualisiert:', CONFIG.cvLink);
        }
        
        // Email Button
        if (text === 'Get in touch') {
            if (pageName === 'about' || isProjectPage) {
                button.href = isProjectPage ? '../contact.html' : 'contact.html';
            } else {
                button.href = 'mailto:' + CONFIG.email;
            }
            console.log('Email Button aktualisiert:', (pageName === 'about' || isProjectPage) ? 'contact.html' : CONFIG.email);
        }
    });
    
    // Header CV Link tracking
    const headerCVLink = document.querySelector('.cv-link');
    if (headerCVLink) {
        headerCVLink.addEventListener('click', function() {
            if (typeof trackCVClick === 'function') {
                trackCVClick('header', pageName);
            }
        });
    }
    
    // Mobile Menu CV Link tracking
    const mobileNavCV = document.querySelector('.mobile-nav-cv');
    if (mobileNavCV) {
        mobileNavCV.addEventListener('click', function() {
            if (typeof trackCVClick === 'function') {
                trackCVClick('mobile_menu', pageName);
            }
        });
    }
}

// Portfolio Links: Scroll-Position vor Navigation speichern
function initPortfolioLinks() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    console.log('Portfolio Items gefunden:', portfolioItems.length);
    
    portfolioItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Speichere Position vor Navigation
            saveScrollPosition();
        });
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtns = document.querySelectorAll('.mobile-menu-btn');
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu a');

    mobileMenu.classList.toggle('active');

    // Check if menu is now active
    const isActive = mobileMenu.classList.contains('active');

    // Sync aria-hidden on the menu container (inverse of aria-expanded)
    mobileMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');

    // Toggle active class on all menu buttons for animation
    menuBtns.forEach(btn => {
        btn.classList.toggle('active');
        btn.setAttribute('aria-expanded', isActive);
    });

    // Update tabindex für mobile menu links
    if (mobileMenuLinks && mobileMenuLinks.length > 0) {
        mobileMenuLinks.forEach(link => {
            link.tabIndex = isActive ? 0 : -1;
        });
    }

    // Focus management: isolate tab order to [hamburger] → [menu links] → [browser chrome]
    // when menu is open so Tab after the last link exits to browser chrome, not into page content.
    const skipLink = document.querySelector('.skip-link');
    const logoLink = document.querySelector('.logo-link');
    const mainContent = document.querySelector('main');
    const footerEl = document.getElementById('footer-placeholder');

    if (isActive) {
        // Remove background elements from tab order
        if (skipLink) skipLink.setAttribute('tabindex', '-1');
        if (logoLink) logoLink.setAttribute('tabindex', '-1');
        if (mainContent) mainContent.setAttribute('inert', '');
        if (footerEl) footerEl.setAttribute('inert', '');
    } else {
        // Restore tab order
        if (skipLink) skipLink.removeAttribute('tabindex');
        if (logoLink) logoLink.removeAttribute('tabindex');
        if (mainContent) mainContent.removeAttribute('inert');
        if (footerEl) footerEl.removeAttribute('inert');
    }

    // Body scroll verhindern wenn Menu offen ist
    document.body.style.overflow = isActive ? 'hidden' : '';
}

// Update Mobile Icons für Dark Mode
function updateMobileIconsForDarkMode(basePath) {
    const mobileLinkedinIcon = document.querySelector('.mobile-linkedin-icon');
    const mobileMailIcon = document.querySelector('.mobile-mail-icon');
    
    // Check if dark mode is enabled
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (mobileLinkedinIcon) {
        if (isDarkMode) {
            mobileLinkedinIcon.src = basePath + 'images/linkedin_icon_mobile_white.svg';
        } else {
            mobileLinkedinIcon.src = basePath + 'images/linkedin_icon_mobile.svg';
        }
    }
    
    if (mobileMailIcon) {
        if (isDarkMode) {
            mobileMailIcon.src = basePath + 'images/mail_mobile_white.svg';
        } else {
            mobileMailIcon.src = basePath + 'images/mail_mobile.svg';
        }
    }
    
    // Listen for dark mode changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            updateMobileIconsForDarkMode(basePath);
        });
    }
}

// Header Scroll Verhalten
function initHeaderScroll() {
    let lastScrollTop = 0;
    let scrollThreshold = 5;
    const header = document.querySelector('header');
    
    // Warte kurz, damit der Header vollständig geladen ist
    setTimeout(() => {
        const headerHeight = header.offsetHeight;
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Bei programmatischem Scroll (Tab-Wechsel) Header-Logik überspringen
            if (skipHeaderScrollUpdate) {
                lastScrollTop = scrollTop;
                return;
            }

            if (scrollTop > headerHeight) {
                if (scrollTop > lastScrollTop + scrollThreshold) {
                    // Runterscrollen - Header verstecken
                    header.classList.add('header-hidden');
                    header.classList.add('header-sticky');
                } else if (scrollTop < lastScrollTop - scrollThreshold) {
                    // Hochscrollen - Header zeigen
                    header.classList.remove('header-hidden');
                    header.classList.add('header-sticky');
                }
            } else {
                // Oben - Header normal
                header.classList.remove('header-hidden');
                header.classList.remove('header-sticky');
            }

            lastScrollTop = scrollTop;
        });
    }, 100);
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
            // tabindex="-1" sicherstellen (defensiv, falls nicht im HTML)
            target.setAttribute('tabindex', '-1');
            // Fokus setzen – das ist der entscheidende Schritt
            target.focus({ preventScroll: false });
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Tab Navigation für About-Seite
function initAboutTabs() {
    const tabButtons = document.querySelectorAll('[role="tab"]');
    if (tabButtons.length === 0) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });

    // Keyboard-Navigation (Pfeil-Tasten gemäß ARIA Tabs Pattern)
    tabButtons.forEach(button => {
        button.addEventListener('keydown', (e) => {
            const tabs = Array.from(tabButtons);
            const index = tabs.indexOf(button);
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = tabs[(index + 1) % tabs.length];
                next.focus();
                switchTab(next);
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = tabs[(index - 1 + tabs.length) % tabs.length];
                prev.focus();
                switchTab(prev);
            }
        });
    });

    // Swipe-Geste auf dem Wrapper (Mobile) – single listener, kein per-panel
    const wrapper = document.querySelector('.tab-panels-wrapper');
    if (wrapper) {
        let touchStartX = 0;
        let touchStartY = 0;

        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;

            const tabs = Array.from(tabButtons);
            const activeIndex = tabs.findIndex(btn => btn.getAttribute('aria-selected') === 'true');

            if (deltaX < 0) {
                const next = tabs[(activeIndex + 1) % tabs.length];
                if (next) switchTab(next);
            } else {
                const prev = tabs[(activeIndex - 1 + tabs.length) % tabs.length];
                if (prev) switchTab(prev);
            }
        }, { passive: true });
    }

    // Indicator und Wrapper-Höhe initial setzen (nach erstem Layout-Pass, ohne Transition)
    requestAnimationFrame(() => {
        const activeBtn = document.querySelector('[role="tab"][aria-selected="true"]');
        const indicator = document.querySelector('.tab-indicator');
        const wrapperEl = document.querySelector('.tab-panels-wrapper');
        const activePanel = document.querySelector('[role="tabpanel"][aria-hidden="false"]');

        if (activeBtn && indicator) {
            indicator.classList.add('no-transition');
            setTabIndicator(activeBtn);
            requestAnimationFrame(() => indicator.classList.remove('no-transition'));
        }

        // Wrapper-Höhe ohne Transition initialisieren
        if (wrapperEl && activePanel) {
            wrapperEl.style.transition = 'none';
            wrapperEl.style.height = activePanel.offsetHeight + 'px';
            requestAnimationFrame(() => { wrapperEl.style.transition = ''; });
        }
    });

    // Track-Position und Indicator bei Resize neu berechnen (Orientierungswechsel etc.)
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            const activeBtn = document.querySelector('[role="tab"][aria-selected="true"]');
            const track = document.querySelector('.tab-panels-track');
            const wrapperEl = document.querySelector('.tab-panels-wrapper');
            const activePanel = document.querySelector('[role="tabpanel"][aria-hidden="false"]');
            const tabs = Array.from(tabButtons);
            const idx = tabs.findIndex(btn => btn.getAttribute('aria-selected') === 'true');
            if (track && wrapperEl) {
                track.style.transition = 'none';
                wrapperEl.style.transition = 'none';
                track.style.transform = `translateX(${-idx * wrapperEl.offsetWidth}px)`;
                if (activePanel) wrapperEl.style.height = activePanel.offsetHeight + 'px';
                requestAnimationFrame(() => {
                    track.style.transition = '';
                    wrapperEl.style.transition = '';
                });
            }
            if (activeBtn) setTabIndicator(activeBtn);
        });
        const wrapperEl = document.querySelector('.tab-panels-wrapper');
        if (wrapperEl) ro.observe(wrapperEl);
    }
}

// Positioniert den gleitenden Unterstrich unter den aktiven Tab-Button
function setTabIndicator(activeButton) {
    const indicator = document.querySelector('.tab-indicator');
    if (!indicator || !activeButton) return;
    indicator.style.width = activeButton.offsetWidth + 'px';
    indicator.style.transform = `translateX(${activeButton.offsetLeft}px)`;
}

function switchTab(activeButton) {
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');
    const tabs = Array.from(tabButtons);
    const activeIndex = tabs.indexOf(activeButton);

    // ARIA-States aktualisieren
    tabButtons.forEach(btn => {
        btn.setAttribute('aria-selected', 'false');
        btn.classList.remove('tab-active');
        btn.setAttribute('tabindex', '-1');
    });
    panels.forEach(panel => panel.setAttribute('aria-hidden', 'true'));

    activeButton.setAttribute('aria-selected', 'true');
    activeButton.classList.add('tab-active');
    activeButton.setAttribute('tabindex', '0');

    const targetPanel = document.getElementById(activeButton.getAttribute('aria-controls'));
    if (targetPanel) targetPanel.setAttribute('aria-hidden', 'false');

    // Track verschieben – zeigt den Panel beim Index activeIndex
    const track = document.querySelector('.tab-panels-track');
    const wrapper = document.querySelector('.tab-panels-wrapper');
    if (track && wrapper) {
        track.style.transform = `translateX(${-activeIndex * wrapper.offsetWidth}px)`;
        // Wrapper-Höhe auf die Höhe des aktiven Panels setzen
        if (targetPanel) wrapper.style.height = targetPanel.offsetHeight + 'px';
    }

    // Indicator gleitet unter den neuen aktiven Tab
    setTabIndicator(activeButton);

    // Nach Tab-Wechsel scrollen, damit Panel-Inhalt direkt unterhalb der
    // sticky Tab-Leiste sichtbar ist – ohne den Header wieder einzublenden.
    const tabsSection = document.querySelector('.about-tabs');
    const tabNav = document.querySelector('.about-tab-nav');
    if (tabsSection && tabNav) {
        const stickyTop = parseInt(getComputedStyle(tabNav).top) || 0;
        const sectionAbsTop = tabsSection.getBoundingClientRect().top + window.scrollY;
        skipHeaderScrollUpdate = true;
        window.scrollTo({ top: sectionAbsTop - stickyTop, behavior: 'smooth' });
        setTimeout(() => { skipHeaderScrollUpdate = false; }, 600);
    }
}

// Smooth scroll - nur für echte Anker-Links, nicht für Platzhalter und nicht für Skip-Link
document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(anchor => {
    // Ignoriere Links die nur "#" sind (Platzhalter)
    if (anchor.getAttribute('href') === '#') {
        return;
    }
    
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});