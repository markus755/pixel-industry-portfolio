// Header und Footer laden
document.addEventListener('DOMContentLoaded', function() {
    // Prüfe ob wir in einem Unterordner sind
    const path = window.location.pathname;
    const isInProjects = path.includes('/projects/');
    const basePath = isInProjects ? '../' : '';
    
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
            }
        })
        .catch(error => console.error('Fehler beim Laden des Footers:', error));
});

// Funktion um Header-Pfade zu korrigieren
function fixHeaderPaths(basePath) {
    console.log('Korrigiere Header-Pfade mit basePath:', basePath);
    
    // Logo
    const logoLink = document.querySelector('.logo-link');
    const logo = document.querySelector('.logo');
    if (logoLink) {
        logoLink.href = basePath + 'index.html';
        console.log('Logo Link:', logoLink.href);
    }
    if (logo) {
        logo.src = basePath + 'images/pixel_industry_logo.svg';
        console.log('Logo Src:', logo.src);
    }
    
    // Desktop Navigation
    const navHome = document.querySelector('.nav-home');
    const navContact = document.querySelector('.nav-contact');
    const cvLink = document.querySelector('.cv-link');
    if (navHome) navHome.href = basePath + 'index.html';
    if (navContact) navContact.href = basePath + 'contact.html';
    if (cvLink) cvLink.href = basePath + 'cv.html';
    
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
    
    // Mobile Menu
    const mobileNavHome = document.querySelector('.mobile-nav-home');
    const mobileNavContact = document.querySelector('.mobile-nav-contact');
    const mobileNavCv = document.querySelector('.mobile-nav-cv');
    if (mobileNavHome) mobileNavHome.href = basePath + 'index.html';
    if (mobileNavContact) mobileNavContact.href = basePath + 'contact.html';
    if (mobileNavCv) mobileNavCv.href = basePath + 'cv.html';
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    // Body scroll verhindern wenn Menu offen ist
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});