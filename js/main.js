document.addEventListener('DOMContentLoaded', () => {
    console.log("ShotMarket Interactive Engine Loaded 🚀");

    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const navLinks = document.querySelector('.nav-links');
                if (navLinks) navLinks.classList.remove('active');

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const featureCards = document.querySelectorAll('.feature-card[data-feature-link]');

    featureCards.forEach(card => {
        const targetPage = card.getAttribute('data-feature-link');
        if (!targetPage) return;

        card.style.cursor = 'pointer';

        const navigateToFeature = (event) => {
            if (event) {
                event.preventDefault();
            }
            window.location.href = targetPage;
        };

        card.addEventListener('click', navigateToFeature);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigateToFeature();
            }
        });
    });

    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    const demoBtn = document.querySelector('.secondary-btn');
    if (demoBtn && demoBtn.textContent.includes('Live Demo')) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const gallerySection = document.querySelector('#gallery');
            if (gallerySection) {
                gallerySection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});