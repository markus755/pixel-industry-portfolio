// === NAVIGATION ===
// Mobile Menu, Header-Scroll, Dark Mode Icons, Tab-Navigation (About-Seite)

// Flag: verhindert Header-Einblenden bei programmatischem Scroll (z.B. Tab-Wechsel)
let skipHeaderScrollUpdate = false;

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtns = document.querySelectorAll('.mobile-menu-btn');
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu a');

    mobileMenu.classList.toggle('active');

    const isActive = mobileMenu.classList.contains('active');

    mobileMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');

    menuBtns.forEach(btn => {
        btn.classList.toggle('active');
        btn.setAttribute('aria-expanded', isActive);
    });

    if (mobileMenuLinks && mobileMenuLinks.length > 0) {
        mobileMenuLinks.forEach(link => {
            link.tabIndex = isActive ? 0 : -1;
        });
    }

    // Focus management: isolate tab order to [hamburger] → [menu links] → [browser chrome]
    const skipLink = document.querySelector('.skip-link');
    const logoLink = document.querySelector('.logo-link');
    const mainContent = document.querySelector('main');
    const footerEl = document.getElementById('footer-placeholder');

    if (isActive) {
        if (skipLink) skipLink.setAttribute('tabindex', '-1');
        if (logoLink) logoLink.setAttribute('tabindex', '-1');
        if (mainContent) mainContent.setAttribute('inert', '');
        if (footerEl) footerEl.setAttribute('inert', '');
    } else {
        if (skipLink) skipLink.removeAttribute('tabindex');
        if (logoLink) logoLink.removeAttribute('tabindex');
        if (mainContent) mainContent.removeAttribute('inert');
        if (footerEl) footerEl.removeAttribute('inert');
    }

    document.body.style.overflow = isActive ? 'hidden' : '';
}

// Update Mobile Icons für Dark Mode
function updateMobileIconsForDarkMode(basePath) {
    const mobileLinkedinIcon = document.querySelector('.mobile-linkedin-icon');
    const mobileMailIcon = document.querySelector('.mobile-mail-icon');

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (mobileLinkedinIcon) {
        mobileLinkedinIcon.src = basePath + (isDarkMode ? 'images/linkedin_icon_mobile_white.svg' : 'images/linkedin_icon_mobile.svg');
    }

    if (mobileMailIcon) {
        mobileMailIcon.src = basePath + (isDarkMode ? 'images/mail_mobile_white.svg' : 'images/mail_mobile.svg');
    }

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            updateMobileIconsForDarkMode(basePath);
        });
    }
}

// Header Scroll Verhalten
function initHeaderScroll() {
    let lastScrollTop = 0;
    const scrollThreshold = 5;
    const header = document.querySelector('header');

    setTimeout(() => {
        const headerHeight = header.offsetHeight;

        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;

            if (skipHeaderScrollUpdate) {
                lastScrollTop = scrollTop;
                return;
            }

            if (scrollTop > headerHeight) {
                if (scrollTop > lastScrollTop + scrollThreshold) {
                    header.classList.add('header-hidden');
                    header.classList.add('header-sticky');
                } else if (scrollTop < lastScrollTop - scrollThreshold) {
                    header.classList.remove('header-hidden');
                    header.classList.add('header-sticky');
                }
            } else {
                header.classList.remove('header-hidden');
                header.classList.remove('header-sticky');
            }

            lastScrollTop = scrollTop;
        });
    }, 100);
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

    // Swipe-Geste auf dem Wrapper (Mobile)
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

        if (wrapperEl && activePanel) {
            wrapperEl.style.transition = 'none';
            wrapperEl.style.height = activePanel.offsetHeight + 'px';
            requestAnimationFrame(() => { wrapperEl.style.transition = ''; });
        }
    });

    // Track-Position und Indicator bei Resize neu berechnen
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

    const track = document.querySelector('.tab-panels-track');
    const wrapper = document.querySelector('.tab-panels-wrapper');
    if (track && wrapper) {
        track.style.transform = `translateX(${-activeIndex * wrapper.offsetWidth}px)`;
        if (targetPanel) wrapper.style.height = targetPanel.offsetHeight + 'px';
    }

    setTabIndicator(activeButton);

    // Nach Tab-Wechsel scrollen, damit Panel-Inhalt direkt unterhalb der sticky Tab-Leiste sichtbar ist
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
