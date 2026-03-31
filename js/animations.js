// === ANIMATIONEN & SCROLL-POSITION ===
// IntersectionObserver für Fade-Animationen, Scroll-Position Management, Portfolio-Links

// Scroll-Position speichern (vor Navigation zu Projektseite)
function saveScrollPosition() {
    const scrollPos = window.scrollY;
    sessionStorage.setItem('portfolioScrollPos', scrollPos);
}

// Scroll-Position wiederherstellen (nach Rückkehr zur Startseite)
function restoreScrollPosition() {
    const savedPos = sessionStorage.getItem('portfolioScrollPos');
    if (savedPos !== null) {
        setTimeout(() => {
            window.scrollTo({
                top: parseInt(savedPos),
                behavior: 'instant'
            });
            sessionStorage.removeItem('portfolioScrollPos');
        }, 100);
    }
}

// Projekt-Animationen via IntersectionObserver
function initProjectAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fade, .animate-slide-left, .animate-slide-right, .animate-slide-up');

    if (animatedElements.length === 0) return;

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            setTimeout(() => {
                el.classList.add('visible');
            }, 200);
        }
    });
}

// Portfolio Links: Scroll-Position vor Navigation speichern
function initPortfolioLinks() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('click', function() {
            saveScrollPosition();
        });
    });
}
