document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const ctaButton = document.querySelector('.cta-button');

    function showPage(pageId) {
        // Hides all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Deactivates all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Shows the target page
        const targetPage = document.querySelector(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Activates the corresponding nav link
        const targetLink = document.querySelector(`a[href="${pageId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // Events listener for main navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior
            const targetPageId = link.getAttribute('href');
            showPage(targetPageId);
        });
    });

    // Events the listener for the (Start a Safe Session) button on the home page
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const targetPageId = '#' + ctaButton.getAttribute('data-target');
            showPage(targetPageId);
        });
    }

    // Shows the home page by default on load
    showPage('#home');
});