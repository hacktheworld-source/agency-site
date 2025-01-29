export class PageTransition {
    constructor() {
        this.DEBUG = true;
        this.overlay = this.createOverlay();
        this.isTransitioning = false;
        this.initializeListeners();
        if (this.DEBUG) console.log('PageTransition initialized');
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    initializeListeners() {
        document.addEventListener('click', (e) => {
            // Only handle internal links
            const link = e.target.closest('a');
            if (!link || !this.isInternalLink(link)) return;

            e.preventDefault();
            this.navigateTo(link.href);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.navigateTo(window.location.href, true);
        });
    }

    isInternalLink(link) {
        const currentOrigin = window.location.origin;
        const linkOrigin = new URL(link.href).origin;
        
        return (
            linkOrigin === currentOrigin && 
            !link.hasAttribute('download') && 
            !link.target &&
            !link.href.includes('#')
        );
    }

    async navigateTo(url, isBackForward = false) {
        if (this.DEBUG) console.log('Navigating to:', url);
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Clean up immediately before any transition starts
        if (window.globeInstance) {
            window.globeInstance.destroy();
            window.globeInstance = null;
        }

        // Start transition
        document.documentElement.classList.add('is-transitioning');
        this.overlay.classList.add('is-visible');

        try {
            // Scroll to top before transition
            window.scrollTo(0, 0);
            
            // Clean up old observers and instances
            this.cleanup();
            
            if (this.DEBUG) console.log('Fetching page:', url);
            const response = await fetch(url);
            const html = await response.text();

            // Add artificial delay for development
            if (this.DEBUG) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const parser = new DOMParser();
            const newDocument = parser.parseFromString(html, 'text/html');

            // Update the page content
            const newMain = newDocument.querySelector('main');
            const currentMain = document.querySelector('main');
            
            // Update title
            document.title = newDocument.title;

            // Update URL
            if (!isBackForward) {
                window.history.pushState({}, '', url);
            }

            // Swap content
            await this.animateContentSwap(currentMain, newMain);

            // Update active states in navigation
            this.updateActiveNavLinks(url);

            // Initialize new intersection observer
            window.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        window.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });

            // Observe all animated elements
            const animatedElements = document.querySelectorAll('.fade-in, .scale-in, .slide-in, .challenge-category');
            animatedElements.forEach(el => {
                el.classList.remove('visible');
                if (window.observer) {
                    window.observer.observe(el);
                }
            });

            // Reinitialize other scripts
            this.reinitializeScripts();

            // After new content is injected
            if (window.initializeHandlers) {
                window.initializeHandlers();
            }

        } catch (error) {
            console.error('Navigation error:', error);
            if (this.DEBUG) console.log('Navigation failed:', error);
        } finally {
            // End transition
            this.overlay.classList.remove('is-visible');
            document.documentElement.classList.remove('is-transitioning');
            this.isTransitioning = false;
        }
    }

    async animateContentSwap(currentMain, newMain) {
        // Fade out current content
        await this.animate(currentMain, [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(20px)' }
        ], 300);

        // Replace content
        currentMain.innerHTML = newMain.innerHTML;

        // Fade in new content
        await this.animate(currentMain, [
            { opacity: 0, transform: 'translateY(-20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], 300);
    }

    animate(element, keyframes, duration) {
        const animation = element.animate(keyframes, {
            duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        return animation.finished;
    }

    updateActiveNavLinks(url) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.href === url);
        });
    }

    reinitializeScripts() {
        // Reinitialize globe if on homepage
        const globeContainer = document.querySelector('.globe-container');
        if (globeContainer && !window.matchMedia('(max-width: 768px)').matches) {
            // First, clean up any existing globe instance
            if (window.globeInstance) {
                window.globeInstance.destroy();
                window.globeInstance = null;
            }
            
            // Clear container
            while (globeContainer.firstChild) {
                globeContainer.removeChild(globeContainer.firstChild);
            }
            
            // Create new globe instance
            import('./globe.js').then(module => {
                if (!window.globeInstance) { // Prevent double initialization
                    window.globeInstance = new module.default(globeContainer);
                }
            }).catch(error => {
                console.error('Failed to load globe:', error);
            });
        }

        // Reinitialize hero form
        const heroForm = document.getElementById('heroForm');
        if (heroForm) {
            heroForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const emailInput = heroForm.querySelector('input[type="email"]');
                if (!emailInput) {
                    window.location.href = '/contact.html';
                    return;
                }

                if (!emailInput.checkValidity()) {
                    return;
                }

                const redirectUrl = `/contact.html${emailInput.value ? `?email=${encodeURIComponent(emailInput.value)}` : ''}`;
                window.location.href = redirectUrl;
            });
        }

        // Reinitialize forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
        });

        // Reinitialize counter animation if on homepage
        const counter = document.getElementById('companies-counter');
        const heroStat = document.querySelector('.hero-stat');
        if (counter && heroStat) {
            heroStat.classList.add('visible');
            this.animateCounter(counter, 133, 2000);
        }

        // Reinitialize contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';

                try {
                    const formData = new FormData(contactForm);
                    const response = await fetch(contactForm.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Show success message modal
                        const successMessage = document.getElementById('successMessage');
                        if (successMessage) {
                            successMessage.classList.add('active');
                            // Add click event to close button if it exists
                            const closeButton = successMessage.querySelector('.button');
                            if (closeButton) {
                                closeButton.addEventListener('click', () => {
                                    successMessage.classList.remove('active');
                                });
                            }
                        }
                        contactForm.reset();
                    } else {
                        throw new Error(result.message || 'Submission failed');
                    }
                } catch (error) {
                    alert(`Error: ${error.message}`);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            });
        }
    }

    // Add counter animation method
    animateCounter(element, target, duration = 2000) {
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

    cleanup() {
        // Clean up any existing globe instances
        if (window.globeInstance) {
            window.globeInstance.destroy();
            window.globeInstance = null;
        }
        
        // Remove any existing overlays
        document.querySelectorAll('.page-transition-overlay').forEach(overlay => {
            if (overlay !== this.overlay) overlay.remove();
        });
        
        // Clean up any open modals
        document.querySelectorAll('.success-message').forEach(modal => {
            modal.classList.remove('active');
        });

        // Disconnect old observer
        if (window.observer) {
            window.observer.disconnect();
        }
    }
} 