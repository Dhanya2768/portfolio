(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -----------------------------------------
       0. Theme Toggle (Light / Dark Mode)
    ----------------------------------------- */
    var themeToggle = document.getElementById('themeToggle');
    var savedTheme = localStorage.getItem('portfolio-theme');

    if (!savedTheme) {
        savedTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', savedTheme);

    function updateThemeToggleAria(theme) {
        if (!themeToggle) return;
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }

    updateThemeToggleAria(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            var nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('portfolio-theme', nextTheme);
            updateThemeToggleAria(nextTheme);
        });
    }

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem('portfolio-theme')) {
                var autoTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', autoTheme);
                updateThemeToggleAria(autoTheme);
            }
        });
    }

    /* -----------------------------------------
       1. Mobile Navigation Hamburger Drawer
    ----------------------------------------- */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    function closeMenu() {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isOpen));
            navMenu.classList.toggle('is-open', !isOpen);
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', function (event) {
            if (!navMenu.classList.contains('is-open')) return;
            if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
                closeMenu();
                navToggle.focus();
            }
        });
    }

    /* -----------------------------------------
       2. Active Navigation Link Highlighting
    ----------------------------------------- */
    var pathSegments = window.location.pathname.split('/');
    var currentPage = pathSegments[pathSegments.length - 1] || 'index.html';

    if (navMenu) {
        navMenu.querySelectorAll('a:not(.nav-btn)').forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /* -----------------------------------------
       3. Back-to-Top Button
    ----------------------------------------- */
    var backToTopBtn = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (!backToTopBtn) return;
        if (window.scrollY > 280) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    }

    if (backToTopBtn) {
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        toggleBackToTop();

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    /* -----------------------------------------
       4. Contact Form Validation & Mailto Handoff
    ----------------------------------------- */
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        var nameInput = document.getElementById('senderName');
        var emailInput = document.getElementById('senderEmail');
        var subjectInput = document.getElementById('subject');
        var messageInput = document.getElementById('message');
        var feedbackEl = document.getElementById('formFeedback');

        // Pre-fill subject if navigated from a project card (?project=...)
        var params = new URLSearchParams(window.location.search);
        var projectTopic = params.get('project');
        if (projectTopic && subjectInput && !subjectInput.value) {
            subjectInput.value = 'Inquiry regarding ' + projectTopic;
        }

        function setFieldError(input, errorId, message) {
            var errorEl = document.getElementById(errorId);
            if (!input || !errorEl) return;
            errorEl.textContent = message;
            input.setAttribute('aria-invalid', message ? 'true' : 'false');
        }

        function isValidEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            var nameVal = nameInput.value.trim();
            var emailVal = emailInput.value.trim();
            var subjectVal = subjectInput.value.trim();
            var messageVal = messageInput.value.trim();

            var hasError = false;

            if (nameVal.length < 2) {
                setFieldError(nameInput, 'nameError', 'Please enter your name (at least 2 characters).');
                hasError = true;
            } else {
                setFieldError(nameInput, 'nameError', '');
            }

            if (!isValidEmail(emailVal)) {
                setFieldError(emailInput, 'emailError', 'Please enter a valid email address.');
                hasError = true;
            } else {
                setFieldError(emailInput, 'emailError', '');
            }

            if (subjectVal.length < 3) {
                setFieldError(subjectInput, 'subjectError', 'Please enter a brief subject.');
                hasError = true;
            } else {
                setFieldError(subjectInput, 'subjectError', '');
            }

            if (messageVal.length < 10) {
                setFieldError(messageInput, 'messageError', 'Please enter a message (at least 10 characters).');
                hasError = true;
            } else {
                setFieldError(messageInput, 'messageError', '');
            }

            if (hasError) {
                if (feedbackEl) {
                    feedbackEl.textContent = 'Please fix the highlighted fields above before sending.';
                    feedbackEl.className = 'form-feedback is-error';
                }
                return;
            }

            var mailSubject = encodeURIComponent(subjectVal);
            var mailBody = encodeURIComponent(
                'Name: ' + nameVal + '\n' +
                'Email: ' + emailVal + '\n\n' +
                messageVal
            );

            if (feedbackEl) {
                feedbackEl.textContent = 'Validation passed. Opening your email client to send this message to dhanyabiju7007@gmail.com...';
                feedbackEl.className = 'form-feedback is-success';
            }

            window.location.href = 'mailto:dhanyabiju7007@gmail.com?subject=' + mailSubject + '&body=' + mailBody;
        });
    }

    /* -----------------------------------------
       5. Photo Lightbox Modal (Campus Photos)
    ----------------------------------------- */
    var photoModal = document.getElementById('photoModal');
    var modalImg = document.getElementById('modalPhoto');
    var modalTitle = document.getElementById('modalTitle');
    var modalCaption = document.getElementById('modalCaption');
    var modalClose = document.getElementById('modalClose');

    if (photoModal && modalImg && modalClose) {
        var triggerButtons = document.querySelectorAll('[data-photo-src]');
        var lastFocusedElement = null;

        function openModal(btn) {
            var src = btn.getAttribute('data-photo-src');
            var title = btn.getAttribute('data-photo-title') || 'Campus Photograph';
            var caption = btn.getAttribute('data-photo-caption') || '';
            var alt = btn.getAttribute('data-photo-alt') || title;

            modalImg.src = src;
            modalImg.alt = alt;
            if (modalTitle) modalTitle.textContent = title;
            if (modalCaption) modalCaption.textContent = caption;

            lastFocusedElement = btn;
            photoModal.classList.add('is-open');
            photoModal.setAttribute('aria-hidden', 'false');
            modalClose.focus();
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            photoModal.classList.remove('is-open');
            photoModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }

        triggerButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                openModal(btn);
            });
        });

        modalClose.addEventListener('click', closeModal);

        photoModal.addEventListener('click', function (e) {
            if (e.target === photoModal || e.target.classList.contains('photo-modal-backdrop')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && photoModal.classList.contains('is-open')) {
                closeModal();
            }
        });
    }
})();

