/**
 * page-init.js
 * Standard page initialization for traditional multi-page navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page initialized');
    
    // Initialize header scroll behavior
    initializeHeaderScroll();
    
    // Initialize form handling
    initializeForms();
    
    // Initialize animations
    initializeAnimations();
    
    // Theme diagnostics (one-time check)
    console.log('Theme Diagnostics:', {
        currentTheme: document.documentElement.getAttribute('data-theme'),
        savedTheme: localStorage.getItem('theme'),
        systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
    });
    
    // Add debug reset button (only in development)
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        addThemeResetButton();
    }
});

/**
 * Initialize header scroll behavior
 */
function initializeHeaderScroll() {
    const header = document.querySelector('.site-header');
    
    function handleScroll() {
        const scrolled = window.scrollY > 20;
        header.classList.toggle('scrolled', scrolled);
    }
    
    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Initialize form handling
 */
function initializeForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showSuccessMessage('Message sent! We\'ll be in touch soon.');
                    contactForm.reset();
                } else {
                    showErrorMessage('There was an error submitting your message. Please try again.');
                }
            } catch (error) {
                showErrorMessage('Connection error. Please check your internet and try again.');
                console.error('Form submission error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }
        });
    }
    
    // Hero email form
    const heroForm = document.getElementById('heroForm');
    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = heroForm.querySelector('input[type="email"]').value;
            if (email) {
                // Store email or redirect to contact page
                window.location.href = `/contact.html?email=${encodeURIComponent(email)}`;
            }
        });
    }
}

/**
 * Initialize animations
 */
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });
    
    // Observe animation elements
    const animatedElements = document.querySelectorAll('.fade-in, .scale-in, .slide-in, .challenge-category');
    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        const messageText = successMessage.querySelector('p');
        if (messageText) {
            messageText.textContent = message;
        }
        successMessage.classList.add('active');
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    alert(message); // Simple fallback
}

/**
 * Close success message
 */
function closeSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.remove('active');
    }
}

// Separate function for the reset button to keep code organized
function addThemeResetButton() {
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Theme';
    resetButton.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 9999;
        padding: 8px 12px;
        background: #444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: none;
    `;
    
    // Show/hide with Alt+R
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 'r') {
            resetButton.style.display = resetButton.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    resetButton.addEventListener('click', function() {
        if (typeof window.resetThemePreference === 'function') {
            window.resetThemePreference();
            console.log('Theme reset to system preference');
        }
    });
    
    document.body.appendChild(resetButton);
} 