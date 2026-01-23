// === KONFIGURATION ===
// Hier kannst du zentrale Links ändern
const CONFIG = {
    cvLink: 'https://pixelindustry-my.sharepoint.com/:b:/g/personal/mueller_pixel-industry_de/IQCKhnvWmNR4R4VP2yiDYz0dATEzXS2l7o5YwwvfKttRozI?e=Q1pLEg',
    email: 'mueller@pixel-industry.de'
};

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
            }
        })
        .catch(error => console.error('Fehler beim Laden des Footers:', error));

    // Scroll-Animationen initialisieren nach kurzer Verzögerung
    setTimeout(initProjectAnimations, 250);
    
    // CTA Buttons mit Config-Links aktualisieren
    setTimeout(fixCtaButtons, 300);
    
    // Portfolio Items: Scroll-Position speichern vor Navigation
    setTimeout(initPortfolioLinks, 300);
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
    const navContact = document.querySelector('.nav-contact');
    const cvLink = document.querySelector('.cv-link');
    if (navHome) navHome.href = basePath + 'index.html';
    if (navContact) navContact.href = basePath + 'contact.html';
    if (cvLink) cvLink.href = CONFIG.cvLink;
    
    // Header Icons
    const linkedinIcon = document.querySelector('.linkedin-icon');
    const mailIcon = document.querySelector('.mail-icon');
    if (linkedinIcon) {
        linkedinIcon.src = basePath + 'images/linkedin_icon.svg';
        console.log('LinkedIn Icon:', linkedinIcon.src);
    }
    if (mailIcon) {
        mailIcon.src = basePath + 'images/mail.svg';
        console.log('Mail Icon:', mailIcon.src);
    }
    
    // Mobile Menu Icons
    const mobileLinkedinIcon = document.querySelector('.mobile-linkedin-icon');
    const mobileMailIcon = document.querySelector('.mobile-mail-icon');
    if (mobileLinkedinIcon) {
        mobileLinkedinIcon.src = basePath + 'images/linkedin_icon_mobile.svg';
        console.log('Mobile LinkedIn Icon:', mobileLinkedinIcon.src);
    }
    if (mobileMailIcon) {
        mobileMailIcon.src = basePath + 'images/mail_mobile.svg';
        console.log('Mobile Mail Icon:', mobileMailIcon.src);
    }
    
    // Mobile Menu
    const mobileNavHome = document.querySelector('.mobile-nav-home');
    const mobileNavContact = document.querySelector('.mobile-nav-contact');
    const mobileNavCv = document.querySelector('.mobile-nav-cv');
    if (mobileNavHome) mobileNavHome.href = basePath + 'index.html';
    if (mobileNavContact) mobileNavContact.href = basePath + 'contact.html';
    if (mobileNavCv) mobileNavCv.href = CONFIG.cvLink;
}

// Footer Pfade korrigieren - UPDATED
function fixFooterPaths(basePath) {
    console.log('Korrigiere Footer-Pfade mit basePath:', basePath);
    
    // Footer Links
    const footerLinks = document.querySelectorAll('footer a');
    
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Imprint Link
        if (href && href.includes('imprint')) {
            link.href = basePath + 'imprint.html';
            console.log('Imprint Link:', link.href);
        }
        
        // Privacy Policy Link
        if (href && href.includes('privacy')) {
            link.href = basePath + 'privacy.html';
            console.log('Privacy Policy Link:', link.href);
        }
    });
}

// CTA Buttons mit Config-Links aktualisieren
function fixCtaButtons() {
    console.log('Aktualisiere CTA Buttons mit Config-Links');
    
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
            console.log('CV Button aktualisiert:', CONFIG.cvLink);
        }
        
        // Email Button
        if (text === 'Start a project') {
            button.href = 'mailto:' + CONFIG.email;
            console.log('Email Button aktualisiert:', CONFIG.email);
        }
    });
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
    
    console.log('Toggle called, found buttons:', menuBtns.length);
    
    mobileMenu.classList.toggle('active');
    
    // Toggle active class on all menu buttons for animation
    menuBtns.forEach((btn, index) => {
        btn.classList.toggle('active');
        console.log(`Button ${index} is now active:`, btn.classList.contains('active'));
    });
    
    // Body scroll verhindern wenn Menu offen ist
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
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

// Cookie Funktionen
function acceptCookies() {
    document.querySelector('.cookie-banner').style.display = 'none';
}

function declineCookies() {
    document.querySelector('.cookie-banner').style.display = 'none';
}

// Smooth scroll - nur für echte Anker-Links, nicht für Platzhalter
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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