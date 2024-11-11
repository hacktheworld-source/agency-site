// Mobile Menu
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

// Toggle mobile menu
mobileMenuToggle?.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    body.classList.toggle('menu-open');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks?.classList.contains('active') && 
        !e.target.closest('.main-nav')) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
    }
});

// Close mobile menu when clicking on a link
navLinks?.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
    }
});

// Prevent mobile menu from staying open on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        mobileMenuToggle?.classList.remove('active');
        navLinks?.classList.remove('active');
        body.classList.remove('menu-open');
    }
});

// Form Validation and Submission
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset previous errors
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        
        // Validate form
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.parentElement.classList.add('error');
            }
            
            // Email validation
            if (field.type === 'email' && !validateEmail(field.value)) {
                isValid = false;
                field.parentElement.classList.add('error');
            }
        });
        
        if (!isValid) return;
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        
        try {
            // Simulate form submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            successMessage.classList.add('active');
            contactForm.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error sending your message. Please try again.');
            
        } finally {
            submitButton.classList.remove('loading');
        }
    });
}

// Email validation helper
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Close success message
function closeSuccessMessage() {
    successMessage.classList.remove('active');
}

// Close success message when clicking outside
successMessage?.addEventListener('click', (e) => {
    if (e.target === successMessage) {
        closeSuccessMessage();
    }
});

// Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optionally unobserve after animation
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Helper function to add animation classes and observe elements
function initializeAnimations() {
    // Hero sections
    document.querySelectorAll('.hero, .services-hero, .about-hero, .contact-hero').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Service cards with staggered delay
    document.querySelectorAll('.service-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        el.classList.add('scale-in');
        observer.observe(el);
    });

    // Process steps with alternating animations
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.add(index % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // Feature cards
    document.querySelectorAll('.feature-card, .value-card, .tech-item').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        el.classList.add('scale-in');
        observer.observe(el);
    });

    // About cards
    document.querySelectorAll('.about-card').forEach((el, index) => {
        el.classList.add(index % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        observer.observe(el);
    });

    // Contact form and info cards
    const contactForm = document.querySelector('.contact-form-wrapper');
    if (contactForm) {
        contactForm.classList.add('slide-in-left');
        observer.observe(contactForm);
    }

    document.querySelectorAll('.info-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        el.classList.add('slide-in-right');
        observer.observe(el);
    });

    // CTA sections
    document.querySelectorAll('.cta-section').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Reinitialize animations when navigating back
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initializeAnimations();
    }
});

// Success Message Demo
function showSuccessDemo() {
    const successMessage = document.querySelector('.success-message');
    successMessage.classList.add('active');
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        successMessage.classList.remove('active');
    }, 3000);
}

// Close success message when clicking outside
document.addEventListener('click', (e) => {
    const successMessage = document.querySelector('.success-message');
    if (e.target === successMessage) {
        successMessage.classList.remove('active');
    }
});

// Add header scroll effect
function handleHeaderScroll() {
    const header = document.querySelector('.site-header');
    const scrolled = window.scrollY > 20;
    header.classList.toggle('scrolled', scrolled);
}

window.addEventListener('scroll', handleHeaderScroll);

// Optimized counter animation
function animateCounter(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();
    
    // Simplified easing
    const easeOutQuart = t => 1 - (--t) * t * t * t;
    
    let frame;
    const update = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
            const value = Math.round(target * easeOutQuart(progress));
            element.textContent = value;
            frame = requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    };
    
    frame = requestAnimationFrame(update);
    
    // Cleanup function
    return () => {
        if (frame) {
            cancelAnimationFrame(frame);
        }
    };
}

// Initialize counter and fade-in when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const counter = document.getElementById('companies-counter');
    const heroStat = document.querySelector('.hero-stat');
    
    if (counter && heroStat) {
        // Start fade-in and counter immediately
        heroStat.classList.add('visible');
        animateCounter(counter, 133, 2000);
    }
});

// Add this to your existing animation initialization
function initializeChallengeAnimations() {
    const categories = document.querySelectorAll('.challenge-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    categories.forEach(category => {
        observer.observe(category);
    });
}

// Add to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    initializeChallengeAnimations();
});

// Handle hero form submission
const heroForm = document.getElementById('heroForm');
if (heroForm) {
    console.log('Hero form found:', heroForm); // Debug log
    heroForm.addEventListener('submit', async (e) => {
        console.log('Hero form submitted'); // Debug log
        e.preventDefault();
        
        const submitButton = heroForm.querySelector('button');
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(heroForm);
            const response = await fetch('submit-hero.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage("Thanks! We'll be in touch shortly.");
                heroForm.reset();
            } else {
                throw new Error(result.message || 'Something went wrong');
            }
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
} else {
    console.log('Hero form not found'); // Debug log
}

// Handle contact form submission
const contactFormHandler = document.getElementById('contactForm');
if (contactFormHandler) {
    contactFormHandler.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = contactFormHandler.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(contactFormHandler);
            const response = await fetch(contactFormHandler.action, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage("Message sent! We'll respond within 1 hour.");
                contactFormHandler.reset();
            } else {
                throw new Error(result.message || 'Something went wrong');
            }
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// Helper functions for success/error messages
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const messageText = successMessage.querySelector('p');
    messageText.textContent = message;
    successMessage.classList.add('active');
}

function showErrorMessage(message) {
    alert(message); // You might want to create a better error UI
}
