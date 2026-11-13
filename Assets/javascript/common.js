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
       2. Active Navigation Link Highlighting & Scrollspy
    ----------------------------------------- */
    var navLinks = navMenu ? navMenu.querySelectorAll('a:not(.nav-btn)') : [];
    var pageSections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        if (!pageSections.length || !navLinks.length) return;
        var scrollPos = window.scrollY + 140;
        var currentSectionId = '';

        pageSections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (!currentSectionId && window.scrollY < 200 && pageSections[0]) {
            currentSectionId = pageSections[0].getAttribute('id');
        }

        if (currentSectionId) {
            navLinks.forEach(function (link) {
                var href = link.getAttribute('href') || '';
                var hash = href.indexOf('#') !== -1 ? href.substring(href.indexOf('#') + 1) : '';
                if (hash === currentSectionId) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else if (href.indexOf('#') !== -1) {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // Project inquiry trigger handler
    document.querySelectorAll('[data-inquiry-project]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var projectName = btn.getAttribute('data-inquiry-project');
            var subjectInput = document.getElementById('subject');
            if (subjectInput && projectName) {
                subjectInput.value = 'Inquiry regarding ' + projectName;
            }
        });
    });

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
       4. Contact Form Validation & Netlify Forms Submission
    ----------------------------------------- */
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        var nameInput = document.getElementById('senderName');
        var emailInput = document.getElementById('senderEmail');
        var subjectInput = document.getElementById('subject');
        var messageInput = document.getElementById('message');
        var feedbackEl = document.getElementById('formFeedback');
        var submitBtn = contactForm.querySelector('button[type="submit"]');

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

            // Disable submit button & show sending state
            var originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.setAttribute('aria-busy', 'true');
                submitBtn.innerHTML = '<span>Sending...</span>';
            }

            if (feedbackEl) {
                feedbackEl.textContent = 'Sending your message...';
                feedbackEl.className = 'form-feedback';
            }

            // Prepare Form Data for Netlify Forms POST
            var formData = new FormData(contactForm);
            formData.set('form-name', contactForm.getAttribute('name') || 'contact');

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function (response) {
                if (response.ok) {
                    if (feedbackEl) {
                        feedbackEl.textContent = '✓ Thank you! Your message has been sent successfully. I will get back to you soon.';
                        feedbackEl.className = 'form-feedback is-success';
                    }
                    contactForm.reset();
                } else {
                    throw new Error('Netlify form submission failed (Status ' + response.status + ')');
                }
            })
            .catch(function () {
                // Graceful fallback for local development or connection failures:
                var mailSubject = encodeURIComponent(subjectVal);
                var mailBody = encodeURIComponent(
                    'Name: ' + nameVal + '\n' +
                    'Email: ' + emailVal + '\n\n' +
                    messageVal
                );
                if (feedbackEl) {
                    feedbackEl.innerHTML = 'Form submitted. If not redirected on Netlify, <a href="mailto:dhanyabiju7007@gmail.com?subject=' + mailSubject + '&body=' + mailBody + '" style="text-decoration:underline;color:inherit;font-weight:600;">click here to send via email</a>.';
                    feedbackEl.className = 'form-feedback is-success';
                }
            })
            .finally(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.innerHTML = originalBtnContent;
                }
            });
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

