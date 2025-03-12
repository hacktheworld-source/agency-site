// Mobile Menu
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

// Toggle mobile menu
mobileMenuToggle?.addEventListener('click', () => {
    const isOpening = !mobileMenuToggle.classList.contains('active');
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    toggleMobileMenu(isOpening);
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks?.classList.contains('active') && 
        !e.target.closest('.main-nav')) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        toggleMobileMenu(false);
    }
});

// Form Handling
const contactForm = document.getElementById('contactForm');
const heroForm = document.getElementById('heroForm');
const successMessage = document.getElementById('successMessage');

// Debug mode
const DEBUG = false;

// Debug alert helper
function debugAlert(message) {
    if (DEBUG) {
        alert(message);
    }
}

// Debug logging helper with stack trace
function debugLog(message, data = null) {
    const stack = new Error().stack;
    console.log('🔍 Debug:', message);
    console.log('📍 Location:', stack.split('\n')[2].trim());
    if (data) {
        console.log('📦 Data:', data);
    }
}

// Error logging helper with full details
function errorLog(message, error = null) {
    console.error('❌ Error:', message);
    if (error) {
        console.error('🔍 Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        if (error.response) {
            console.error('🌐 Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: Object.fromEntries(error.response.headers.entries())
            });
        }
    }
    console.error('📍 Location:', new Error().stack.split('\n')[2].trim());
}

// Hero form handler - only redirects to contact page
if (heroForm) {
    debugAlert('Hero form found');
    heroForm.addEventListener('submit', (e) => {
        debugAlert('Hero form submitted');
        e.preventDefault();
        
        const emailInput = heroForm.querySelector('input[type="email"]');
        if (!emailInput) {
            debugAlert('Email input not found');
            window.location.href = '/contact.html';
            return;
        }

        if (!emailInput.checkValidity()) {
            debugAlert('Email validation failed');
            return;
        }

        const redirectUrl = `/contact.html${emailInput.value ? `?email=${encodeURIComponent(emailInput.value)}` : ''}`;
        debugAlert('Redirecting to: ' + redirectUrl);
        window.location.href = redirectUrl;
    });
}

// Contact form handler - CONSOLIDATED SINGLE HANDLER
if (contactForm) {
    debugAlert('Contact form found');
    let submitCount = 0;
    
    // Add event listener for success message close button
    if (successMessage) {
        const closeButton = successMessage.querySelector('.button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                successMessage.style.display = 'none';
            });
        }
    }
    
    contactForm.addEventListener('submit', async (e) => {
        debugAlert('Contact form submitted');
        e.preventDefault();
        
        // Track submission count
        submitCount++;
        console.log('Submit attempt #' + submitCount + ' at ' + new Date().toISOString());

        if (!contactForm.checkValidity()) {
            debugAlert('Form validation failed');
            return;
        }
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        
        // Get form data
        const formData = new FormData(contactForm);
        
        // Add submission count to form data for tracking
        formData.append('submit_count', submitCount);
        formData.append('client_timestamp', new Date().toISOString());
        
        try {
            debugAlert('Sending form data');
            
            // EXPLICITLY use contact-handler.php instead of form action
            const response = await fetch('contact-handler.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            debugAlert('Response status: ' + response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            debugAlert('Response: ' + JSON.stringify(result));

            if (result.success) {
                // Show success message
                if (successMessage) {
                    successMessage.style.display = 'flex';
                }
                contactForm.reset();
            } else {
                throw new Error(result.message || 'Server indicated failure');
            }
        } catch (error) {
            debugAlert('Error: ' + error.message);
            alert(`Error: ${error.message || 'There was an error sending your message. Please try again or contact us directly.'}`);
            console.error('Error:', error);
        } finally {
            // Always reset button state
            submitButton.classList.remove('loading');
        }
    });
}

// Success message handling
function showSuccessMessage(message) {
    if (!successMessage) return;
    
    const content = successMessage.querySelector('.success-content');
    if (content) {
        const messageText = content.querySelector('p');
        if (messageText) {
            messageText.textContent = message;
        }
        successMessage.classList.add('active');
        
        // Add click event listener to close button
        const closeButton = content.querySelector('.button');
        if (closeButton) {
            closeButton.addEventListener('click', closeSuccessMessage, { once: true });
        }
    }
}

function closeSuccessMessage() {
    if (successMessage) {
        successMessage.classList.remove('active');
    }
}

function showErrorMessage(message) {
    alert(message);
}

// Optimized Counter Animation
function animateCounter(element, target, duration = 2000) {
    if (!element) return;
    
    const start = performance.now();
    let lastValue = 0;
    let frame;
    
    const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.round(target * (1 - Math.pow(1 - progress, 4)));
        if (currentValue !== lastValue) {
            element.textContent = currentValue;
            lastValue = currentValue;
        }
        
        if (progress < 1) {
            frame = requestAnimationFrame(update);
        }
    };
    
    frame = requestAnimationFrame(update);
}

// Optimized Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    rootMargin: '50px',
    threshold: 0.1
});
/*
// Reviews scroll animation
function initializeReviewsAnimation() {
    const reviewCards = document.querySelectorAll('.review-card');
    if (!reviewCards.length) return;

    const reviewsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Only show one review at a time
                reviewCards.forEach(card => {
                    if (card !== entry.target) {
                        card.classList.remove('visible');
                    }
                });
            }
        });
    }, {
        threshold: 0.5, // Show when card is 50% visible
        rootMargin: '-10% 0px -10% 0px' // Adds a bit of buffer
    });

    reviewCards.forEach(card => reviewsObserver.observe(card));
}
    */

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize counter immediately - COMMENTED OUT
    /*
    const counter = document.getElementById('companies-counter');
    const heroStat = document.querySelector('.hero-stat');
    if (counter && heroStat) {
        heroStat.classList.add('visible');
        animateCounter(counter, 133, 2000);
    }
    */
    
    // Initialize all animations immediately
    const animatedElements = document.querySelectorAll('.fade-in, .scale-in, .slide-in, .challenge-category');
    animatedElements.forEach(el => observer.observe(el));

    // initializeReviewsAnimation();
});

// Add smooth header transition
function handleHeaderScroll() {
    const header = document.querySelector('.site-header');
    const scrolled = window.scrollY > 20;
    
    requestAnimationFrame(() => {
        header.classList.toggle('scrolled', scrolled);
    });
}

// Add scroll listener with passive flag for better performance
window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// Initialize header state on load
document.addEventListener('DOMContentLoaded', handleHeaderScroll);

// Add email parameter handler for contact page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the contact page
    const contactEmailInput = document.querySelector('#email');
    if (contactEmailInput) {
        // Get email from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) {
            // Pre-fill the email field
            contactEmailInput.value = decodeURIComponent(email);
        }
    }
});

// Performance optimizations for mobile
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Optimize scroll performance
let scrollTimeout;
function optimizedScroll() {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(() => {
        handleHeaderScroll();
    });
}

// Use optimized scroll handler
window.addEventListener('scroll', optimizedScroll, { passive: true });

// Optimize mobile menu transitions
if (isMobile) {
    const menuItems = document.querySelectorAll('.nav-links a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close menu after click on mobile
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });
}

// Add touch event handling for mobile menu
if (isMobile && mobileMenuToggle) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const swipeDistance = touchEndX - touchStartX;
        
        if (navLinks.classList.contains('active') && swipeDistance > swipeThreshold) {
            // Swipe right to close menu
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
        }
    }
}

// Handle mobile menu state
function toggleMobileMenu(isOpen) {
    if (isOpen) {
        body.classList.add('menu-open');
        // Small delay to ensure the transition is visible
        setTimeout(() => {
            body.classList.add('menu-active');
        }, 50);
    } else {
        body.classList.remove('menu-active');
        // Remove menu-open after transition
        setTimeout(() => {
            body.classList.remove('menu-open');
        }, 300);
    }
}

// Remove any mobile-specific form handlers
const mobileHandlers = document.querySelectorAll('[data-mobile-handler]');
mobileHandlers.forEach(handler => handler.remove());
