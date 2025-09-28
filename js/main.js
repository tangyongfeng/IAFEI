// IAFEI Website JavaScript - Enhanced Mobile Support

document.addEventListener('DOMContentLoaded', function() {
    initMobileNavigation();
    initSmoothScrolling();
    initScrollEffects();
    initContactForm();
    initAnimations();
    initTouchInteractions();
    initPerformanceOptimizations();
    
    // I18n system is initialized automatically by i18n.js
    // Wait for it to complete before binding additional events
    setTimeout(() => {
        if (window.i18n && typeof window.i18n.rebindLanguageSelector === 'function') {
            window.i18n.rebindLanguageSelector();
        }
    }, 100);
});

// Mobile Navigation System
function initMobileNavigation() {
    const nav = document.querySelector('.navbar');
    const navContainer = document.querySelector('.nav-container');
    const navMenu = document.querySelector('.nav-menu');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<span class="menu-icon">☰</span>';
    mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    
    // Insert mobile button
    const logo = document.querySelector('.logo');
    navContainer.insertBefore(mobileMenuBtn, navMenu);
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        const isOpen = navMenu.classList.contains('mobile-menu-open');
        
        navMenu.classList.toggle('mobile-menu-open');
        this.setAttribute('aria-expanded', !isOpen);
        this.querySelector('.menu-icon').innerHTML = !isOpen ? '✕' : '☰';
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = !isOpen ? 'hidden' : '';
        
        // Add backdrop
        if (!isOpen) {
            const backdrop = document.createElement('div');
            backdrop.className = 'mobile-menu-backdrop';
            backdrop.addEventListener('click', closeMobileMenu);
            document.body.appendChild(backdrop);
        } else {
            const backdrop = document.querySelector('.mobile-menu-backdrop');
            if (backdrop) backdrop.remove();
        }
    });
    
    // Close mobile menu function
    function closeMobileMenu() {
        navMenu.classList.remove('mobile-menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.querySelector('.menu-icon').innerHTML = '☰';
        document.body.style.overflow = '';
        
        const backdrop = document.querySelector('.mobile-menu-backdrop');
        if (backdrop) backdrop.remove();
    }
    
    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Handle dropdown menus on mobile
    const dropdownItems = document.querySelectorAll('.nav-item');
    dropdownItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            const link = item.querySelector('.nav-link');
            
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('dropdown-mobile-open');
                    
                    // Close other dropdowns
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherDropdown = otherItem.querySelector('.dropdown');
                            if (otherDropdown) {
                                otherDropdown.classList.remove('dropdown-mobile-open');
                            }
                        }
                    });
                }
            });
        }
    });
}

// Enhanced Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = window.innerWidth <= 768 ? 70 : 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Advanced Scroll Effects
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Navbar style changes
            if (scrollTop > 100) {
                navbar.style.backgroundColor = 'rgba(0, 51, 102, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.backgroundColor = '#003366';
                navbar.style.backdropFilter = 'none';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
            
            // Hide/show navbar on mobile when scrolling
            if (window.innerWidth <= 768) {
                if (scrollTop > lastScrollTop && scrollTop > 150) {
                    // Scrolling down - hide navbar
                    navbar.style.transform = 'translateY(-100%)';
                    navbar.style.transition = 'transform 0.3s ease-in-out';
                } else {
                    // Scrolling up - show navbar
                    navbar.style.transform = 'translateY(0)';
                    navbar.style.transition = 'transform 0.3s ease-in-out';
                }
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        }, 10);
    }, { passive: true });
}

// Enhanced Contact Form
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    
    // Add enhanced input interactions
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Enhanced focus styles
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('field-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('field-focused');
        });
        
        // Auto-resize textarea on mobile
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        }
    });
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            showFormMessage('Thank you for your message! We will get back to you within 24-48 hours.', 'success');
            this.reset();
            
            // Reset textarea height
            const textarea = this.querySelector('textarea');
            if (textarea) {
                textarea.style.height = 'auto';
            }
        } else {
            showFormMessage('Please fill in all required fields correctly.', 'error');
            
            // Focus first invalid field
            const firstInvalid = this.querySelector('.field-error');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    const type = field.getAttribute('type');
    
    // Remove previous error
    field.classList.remove('field-error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (value && type === 'email' && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('field-error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormMessage(message, type) {
    // Remove existing messages
    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <span class="message-text">${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove
    setTimeout(() => {
        messageDiv.classList.add('fade-out');
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Enhanced Animations
function initAnimations() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Special handling for counters
                    if (entry.target.classList.contains('stat-number')) {
                        animateCounter(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.card, .timeline-item, .stat-item, .member-card, .news-card, .publication-card');
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    if (isNaN(target)) return;
    
    const duration = 2000;
    const start = performance.now();
    const suffix = element.textContent.includes('+') ? '+' : '';
    
    function updateCounter(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(target * progress);
        
        element.textContent = current.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Touch Interactions
function initTouchInteractions() {
    // Add touch feedback to buttons and cards
    const touchElements = document.querySelectorAll('.btn-primary, .btn-secondary, .card, .member-card, .news-card');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });
    });
    
    // Improve dropdown behavior on touch
    const dropdownTriggers = document.querySelectorAll('.nav-item');
    dropdownTriggers.forEach(trigger => {
        const dropdown = trigger.querySelector('.dropdown');
        if (dropdown && window.innerWidth > 768) {
            trigger.addEventListener('touchstart', function(e) {
                e.preventDefault();
                
                // Close other dropdowns
                dropdownTriggers.forEach(other => {
                    if (other !== trigger) {
                        other.querySelector('.dropdown')?.classList.remove('dropdown-touch-open');
                    }
                });
                
                dropdown.classList.toggle('dropdown-touch-open');
            }, { passive: false });
        }
    });
    
    // Close dropdowns when touching outside
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.nav-item')) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('dropdown-touch-open');
            });
        }
    });
}

// Performance Optimizations
function initPerformanceOptimizations() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Trigger custom resize event
            window.dispatchEvent(new CustomEvent('debouncedResize'));
        }, 250);
    });
    
    // Optimize scroll performance
    let scrollTicking = false;
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
    
    // Initialize mobile developer toolbar
    initMobileDevToolbar();
}

// Mobile Developer Toolbar
function initMobileDevToolbar() {
    // Only show on mobile devices
    if (window.innerWidth > 768) return;
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-dev-toggle';
    toggleBtn.innerHTML = '🔧';
    toggleBtn.setAttribute('aria-label', 'Toggle Developer Toolbar');
    document.body.appendChild(toggleBtn);
    
    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'mobile-dev-toolbar';
    toolbar.innerHTML = `
        <div class="dev-info">
            <span>Mobile Dev Mode</span>
            <span id="devTime"></span>
        </div>
        <div class="dev-metrics">
            <div class="dev-metric">
                <div>Screen</div>
                <div id="devScreen">${window.innerWidth}×${window.innerHeight}</div>
            </div>
            <div class="dev-metric">
                <div>Viewport</div>
                <div id="devViewport">${window.innerWidth}×${window.innerHeight}</div>
            </div>
            <div class="dev-metric">
                <div>DPR</div>
                <div id="devDPR">${window.devicePixelRatio}</div>
            </div>
            <div class="dev-metric">
                <div>Touch</div>
                <div id="devTouch">${'ontouchstart' in window ? 'Yes' : 'No'}</div>
            </div>
        </div>
        <div class="dev-actions">
            <button class="dev-btn" onclick="window.location.href='mobile-test.html'">Test Page</button>
            <button class="dev-btn" onclick="toggleGridOverlay()">Grid</button>
            <button class="dev-btn" onclick="testResponsive()">Responsive</button>
            <button class="dev-btn" onclick="testPerformance()">Performance</button>
        </div>
    `;
    document.body.appendChild(toolbar);
    
    // Toggle functionality
    let isOpen = false;
    toggleBtn.addEventListener('click', function() {
        isOpen = !isOpen;
        toolbar.classList.toggle('show', isOpen);
        toggleBtn.classList.toggle('active', isOpen);
        toggleBtn.innerHTML = isOpen ? '✕' : '🔧';
    });
    
    // Update metrics
    function updateMetrics() {
        const now = new Date();
        document.getElementById('devTime').textContent = now.toLocaleTimeString();
        document.getElementById('devScreen').textContent = `${screen.width}×${screen.height}`;
        document.getElementById('devViewport').textContent = `${window.innerWidth}×${window.innerHeight}`;
    }
    
    // Update metrics every second
    setInterval(updateMetrics, 1000);
    
    // Update on resize
    window.addEventListener('resize', updateMetrics);
}

// Grid overlay for testing
function toggleGridOverlay() {
    let overlay = document.getElementById('grid-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'grid-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 9998;
            background-image: 
                linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.remove();
    }
}

// Test responsive breakpoints
function testResponsive() {
    const breakpoints = [320, 480, 768, 1024, 1200];
    let currentIndex = 0;
    
    const testBreakpoint = () => {
        if (currentIndex < breakpoints.length) {
            console.log(`Testing breakpoint: ${breakpoints[currentIndex]}px`);
            // This would work in a real device testing environment
            currentIndex++;
            setTimeout(testBreakpoint, 1000);
        }
    };
    
    testBreakpoint();
}

// Performance testing
function testPerformance() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        const domReady = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        
        console.log('Performance Metrics:');
        console.log(`Page Load: ${loadTime}ms`);
        console.log(`DOM Ready: ${domReady}ms`);
        console.log(`Memory: ${navigator.deviceMemory || 'Unknown'} GB`);
        console.log(`Connection: ${navigator.connection?.effectiveType || 'Unknown'}`);
        
        alert(`Page Load: ${loadTime}ms\nDOM Ready: ${domReady}ms`);
    }
}
