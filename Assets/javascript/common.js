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

    /* -----------------------------------------
       6. Project Details & Screenshot Lightbox Modal
    ----------------------------------------- */
    var projectModal = document.getElementById('projectModal');
    var projectModalTitle = document.getElementById('projectModalTitle');
    var projectModalCategory = document.getElementById('projectModalCategory');
    var projectModalClose = document.getElementById('projectModalClose');
    var projectModalImg = document.getElementById('projectModalImg');
    var projectNavPrev = document.getElementById('projectNavPrev');
    var projectNavNext = document.getElementById('projectNavNext');
    var projectThumbs = document.getElementById('projectThumbs');
    var projectScreenTitle = document.getElementById('projectScreenTitle');
    var projectScreenCounter = document.getElementById('projectScreenCounter');
    var projectScreenDesc = document.getElementById('projectScreenDesc');
    var projectKeyFeatures = document.getElementById('projectKeyFeatures');
    var projectTechTags = document.getElementById('projectTechTags');
    var projectArchNotes = document.getElementById('projectArchNotes');
    var projectModalInquiryBtn = document.getElementById('projectModalInquiryBtn');

    if (projectModal && projectModalClose) {
        var PROJECT_DATA = {
            'real-estate': {
                title: 'Real Estate Website (Hilltop)',
                category: 'Django • Python • MySQL',
                inquiryTopic: 'Real Estate Website',
                screens: [
                    {
                        src: 'Assets/image/hilltop-home.jpg',
                        alt: 'Hilltop Real Estate landing page showing luxury modern villa showcase, verified listings banner, and 5-angle inspection feature',
                        title: 'Landing Page & Public Discovery Portal',
                        thumbLabel: 'Landing Page',
                        description: 'Modern luxury property discovery portal welcoming prospective buyers and certified sellers with verified ownership guarantees, 5-angle inspection highlights, and transparent bidding workflows.',
                        features: [
                            'Hero discovery showcase with prominent "Explore Properties" and "List as Seller" call-to-actions',
                            'Curated modern luxury villa showcase with real-time verified ownership badges',
                            'Core trust pillars: 100% Verified Listings, 5-Angle Photo Inspection, Direct Seller Negotiations, and Instant Digital Transfers',
                            'Streamlined navigation with user authentication and role-based registration portals'
                        ],
                        tags: ['Python', 'Django', 'MySQL', 'HTML5', 'CSS3'],
                        archNotes: 'Built on Django MTV pattern. The public catalog view connects to relational MySQL database queries with responsive CSS Grid presentation and dynamic search filters.'
                    },
                    {
                        src: 'Assets/image/hilltop-seller-dashboard.png',
                        alt: 'Hilltop Seller Dashboard displaying listed properties count, action cards, and property inventory table with View Angles button',
                        title: 'Certified Seller Dashboard & Inventory Management',
                        thumbLabel: 'Seller Portal',
                        description: 'Dedicated management console for certified property owners to monitor active inventory, evaluate incoming buyer purchase offers, and execute legal property title transfers.',
                        features: [
                            'Live KPI metrics tracking My Listed Properties (2), Pending Buyer Offers (0), and Properties Transferred (2)',
                            'Quick workflow shortcuts: Upload Listing, Review Buyer Offers, Complete Title Transfers, and Sold History',
                            'Recent Property Listings table detailing thumbnail, location (Kottayam, Ramapuram), category (3BHK, 2BHK), total land sqft, building area, and listing price',
                            '"View Angles" multi-angle image verification ensuring complete 5-angle photo inspection before publication'
                        ],
                        tags: ['Django Auth', 'Role-Based Access', 'MySQL Foreign Keys', 'Multi-Angle Media'],
                        archNotes: 'Role-restricted Django view utilizing Django authentication sessions. MySQL queries filter property records by authenticated seller ID with automated deal status updates.'
                    },
                    {
                        src: 'Assets/image/hilltop-buyer-offers.png',
                        alt: 'Hilltop Buyer Purchase Offers page displaying request tracking table with list price, buyer offer, transferred status, paid badge, and View Title button',
                        title: 'Buyer Purchase Offers & Bidding Tracking',
                        thumbLabel: 'Buyer Offers',
                        description: 'Transparent buyer negotiation desk where prospective homeowners track offer submissions, price counter-negotiations, seller approval status, and completed payments.',
                        features: [
                            'Sequential negotiation ledger tracking Request #, assigned Seller (Vivek, Alan, Gouri), Property ID, and Location',
                            'Side-by-side price comparison showing original List Price alongside Buyer Offer (e.g. $7,500,000 offer on $8,000,000 listing)',
                            'Real-time deal milestone tracking with verified "Transferred" seller status and "Paid" settlement badges',
                            'Direct "View Title" action enabling buyers to inspect certified digital title deeds upon payment completion'
                        ],
                        tags: ['Offer State Machine', 'Payment Tracking', 'Django Models', 'MySQL Transactions'],
                        archNotes: 'Implements a multi-stage transaction state machine linking buyer requests to property listings, tracking negotiation status, approval workflow, and payment settlement.'
                    },
                    {
                        src: 'Assets/image/hilltop-buyer-properties.png',
                        alt: 'Hilltop My Owned Properties page showing ownership transferred table with land sqft, building area, floor counts, seller attribution, and transferred title badge',
                        title: 'My Owned Properties & Digital Title Transfers',
                        thumbLabel: 'Title Transfers',
                        description: 'Official digital property vault displaying all real estate assets successfully acquired and legally transferred to the buyer\'s name.',
                        features: [
                            'Certified ownership ledger displaying official "Ownership Transferred" status',
                            'Detailed architectural & land specifications: BHK category, Total Land sqft, Building Area (sqft), and Number of Floors',
                            'Verified seller provenance showing registered seller name and Seller ID attribution (e.g. Vivek #5, Alan #1, Gouri #4)',
                            'Audited final acquisition price and digital title status confirmation for every asset'
                        ],
                        tags: ['Digital Title Transfer', 'MySQL Relational Joins', 'Property Ledger', 'Django Views'],
                        archNotes: 'Retrieves completed ownership records via relational SQL joins between users, properties, and transfer receipts, ensuring permanent immutable records.'
                    }
                ]
            },
            'pharmacy': {
                title: 'AI-Based Pharmacy Management System',
                category: 'PHP • MySQL • Smart Pricing AI',
                inquiryTopic: 'AI-Based Pharmacy Management System',
                screens: [
                    {
                        src: 'Assets/image/project-pharmacy.svg',
                        alt: 'AI-Based Pharmacy Management System diagram and architecture',
                        title: 'Operations Dashboard & AI Smart Pricing Engine',
                        thumbLabel: 'Architecture',
                        description: 'Web-based pharmacy management platform streamlining pharmaceutical stock, billing, supplier interactions, and algorithmic medicine pricing.',
                        features: [
                            'AI Smart Pricing module adjusting prices based on demand velocity, batch costs, and expiry proximity',
                            'Automated inventory monitoring with re-order thresholds and low-stock alerts',
                            'Point-of-Sale (POS) counter with automated tax calculation, invoice printing, and prescription logs',
                            'Supplier directory and purchase order management with batch code tracking'
                        ],
                        tags: ['PHP', 'MySQL', 'Smart Pricing AI', 'Inventory Management'],
                        archNotes: 'Built with PHP and MySQL relational schemas. Smart pricing algorithm balances profit margins with expiry risk to maximize inventory turnover.'
                    }
                ]
            },
            'hotel': {
                title: 'Online Hotel Management System',
                category: 'PHP • MySQL • HTML • CSS • JS',
                inquiryTopic: 'Online Hotel Management System',
                screens: [
                    {
                        src: 'Assets/image/project-hotel.svg',
                        alt: 'Online Hotel Management System user interface and architecture overview',
                        title: 'Hotel Reservations & Guest Management Panel',
                        thumbLabel: 'System Overview',
                        description: 'Comprehensive hospitality web application managing real-time room bookings, customer check-in/out records, and hotel administration.',
                        features: [
                            'Dynamic room reservation calendar preventing overlapping bookings',
                            'Categorized room inventory (Deluxe, Suite, Standard) with pricing and amenities',
                            'Guest check-in and check-out ledger with ID verification and stay history',
                            'Billing and payment folio generation for rooms and hotel services'
                        ],
                        tags: ['PHP', 'MySQL', 'JavaScript', 'HTML5/CSS3'],
                        archNotes: 'Developed with vanilla PHP and MySQL database handling CRUD operations, sanitized SQL queries, and administrative reporting.'
                    }
                ]
            }
        };

        var currentProjectKey = null;
        var currentScreenIndex = 0;
        var lastProjectFocusedElement = null;

        function renderProjectScreen(screenIndex) {
            var project = PROJECT_DATA[currentProjectKey];
            if (!project || !project.screens || !project.screens[screenIndex]) return;

            currentScreenIndex = screenIndex;
            var screen = project.screens[screenIndex];
            var totalScreens = project.screens.length;

            if (projectModalImg) {
                projectModalImg.src = screen.src;
                projectModalImg.alt = screen.alt || screen.title;
            }

            if (projectScreenTitle) projectScreenTitle.textContent = screen.title;
            if (projectScreenCounter) {
                projectScreenCounter.textContent = (screenIndex + 1) + ' of ' + totalScreens;
            }
            if (projectScreenDesc) projectScreenDesc.textContent = screen.description;

            // Render key features
            if (projectKeyFeatures) {
                projectKeyFeatures.innerHTML = '';
                (screen.features || []).forEach(function (feat) {
                    var li = document.createElement('li');
                    li.textContent = feat;
                    projectKeyFeatures.appendChild(li);
                });
            }

            // Render tags
            if (projectTechTags) {
                projectTechTags.innerHTML = '';
                (screen.tags || []).forEach(function (tag) {
                    var span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = tag;
                    projectTechTags.appendChild(span);
                });
            }

            // Architecture notes
            if (projectArchNotes) {
                projectArchNotes.textContent = screen.archNotes || '';
            }

            // Update navigation arrows visibility
            if (projectNavPrev && projectNavNext) {
                if (totalScreens > 1) {
                    projectNavPrev.classList.remove('is-hidden');
                    projectNavNext.classList.remove('is-hidden');
                } else {
                    projectNavPrev.classList.add('is-hidden');
                    projectNavNext.classList.add('is-hidden');
                }
            }

            // Update active thumbnail
            if (projectThumbs) {
                var thumbButtons = projectThumbs.querySelectorAll('.project-thumb-btn');
                thumbButtons.forEach(function (btn, idx) {
                    if (idx === screenIndex) {
                        btn.classList.add('is-active');
                        btn.setAttribute('aria-selected', 'true');
                    } else {
                        btn.classList.remove('is-active');
                        btn.setAttribute('aria-selected', 'false');
                    }
                });
            }
        }

        function openProjectModal(projectKey, screenIndex, triggerEl) {
            var project = PROJECT_DATA[projectKey];
            if (!project) return;

            currentProjectKey = projectKey;
            lastProjectFocusedElement = triggerEl || null;

            if (projectModalTitle) projectModalTitle.textContent = project.title;
            if (projectModalCategory) projectModalCategory.textContent = project.category;
            if (projectModalInquiryBtn) {
                projectModalInquiryBtn.href = 'contacts.html?project=' + encodeURIComponent(project.inquiryTopic);
            }

            // Build thumbnail strip
            if (projectThumbs) {
                projectThumbs.innerHTML = '';
                if (project.screens.length > 1) {
                    projectThumbs.classList.remove('is-hidden');
                    project.screens.forEach(function (scr, idx) {
                        var btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'project-thumb-btn' + (idx === screenIndex ? ' is-active' : '');
                        btn.setAttribute('role', 'tab');
                        btn.setAttribute('aria-selected', idx === screenIndex ? 'true' : 'false');
                        btn.setAttribute('aria-label', 'View ' + (scr.thumbLabel || scr.title));

                        var img = document.createElement('img');
                        img.src = scr.src;
                        img.alt = scr.thumbLabel || scr.title;
                        img.className = 'project-thumb-img';

                        var span = document.createElement('span');
                        span.className = 'project-thumb-text';
                        span.textContent = scr.thumbLabel || ('Screen ' + (idx + 1));

                        btn.appendChild(img);
                        btn.appendChild(span);

                        btn.addEventListener('click', function () {
                            renderProjectScreen(idx);
                        });

                        projectThumbs.appendChild(btn);
                    });
                } else {
                    projectThumbs.classList.add('is-hidden');
                }
            }

            renderProjectScreen(screenIndex || 0);

            projectModal.classList.add('is-open');
            projectModal.setAttribute('aria-hidden', 'false');
            projectModalClose.focus();
            document.body.style.overflow = 'hidden';
        }

        function closeProjectModal() {
            projectModal.classList.remove('is-open');
            projectModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastProjectFocusedElement) {
                lastProjectFocusedElement.focus();
            }
        }

        // Attach event listeners to project trigger buttons and grid tiles
        document.querySelectorAll('.project-details-btn, .preview-grid-tile').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var projectKey = btn.getAttribute('data-project');
                var screenIdx = parseInt(btn.getAttribute('data-screen-index'), 10) || 0;
                if (projectKey) {
                    openProjectModal(projectKey, screenIdx, btn);
                }
            });
        });

        if (projectNavPrev) {
            projectNavPrev.addEventListener('click', function () {
                var project = PROJECT_DATA[currentProjectKey];
                if (!project) return;
                var prevIdx = (currentScreenIndex - 1 + project.screens.length) % project.screens.length;
                renderProjectScreen(prevIdx);
            });
        }

        if (projectNavNext) {
            projectNavNext.addEventListener('click', function () {
                var project = PROJECT_DATA[currentProjectKey];
                if (!project) return;
                var nextIdx = (currentScreenIndex + 1) % project.screens.length;
                renderProjectScreen(nextIdx);
            });
        }

        projectModalClose.addEventListener('click', closeProjectModal);

        projectModal.addEventListener('click', function (e) {
            if (e.target === projectModal || e.target.classList.contains('project-modal-backdrop')) {
                closeProjectModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!projectModal.classList.contains('is-open')) return;

            if (e.key === 'Escape') {
                closeProjectModal();
            } else if (e.key === 'ArrowLeft') {
                var project = PROJECT_DATA[currentProjectKey];
                if (project && project.screens.length > 1) {
                    var prevIdx = (currentScreenIndex - 1 + project.screens.length) % project.screens.length;
                    renderProjectScreen(prevIdx);
                }
            } else if (e.key === 'ArrowRight') {
                var proj = PROJECT_DATA[currentProjectKey];
                if (proj && proj.screens.length > 1) {
                    var nextIdx = (currentScreenIndex + 1) % proj.screens.length;
                    renderProjectScreen(nextIdx);
                }
            }
        });
    }

    /* -----------------------------------------
       7. Certificate Lightbox Modal (Large View)
    ----------------------------------------- */
    var certModal = document.getElementById('certModal');
    var certModalTitle = document.getElementById('certModalTitle');
    var certModalBadge = document.getElementById('certModalBadge');
    var certModalClose = document.getElementById('certModalClose');
    var certModalImg = document.getElementById('certModalImg');
    var certModalIssuer = document.getElementById('certModalIssuer');
    var certModalYear = document.getElementById('certModalYear');
    var certModalDesc = document.getElementById('certModalDesc');
    var certModalOpenOriginal = document.getElementById('certModalOpenOriginal');

    if (certModal && certModalClose && certModalImg) {
        var lastCertFocusedElement = null;

        function openCertModal(btn) {
            var src = btn.getAttribute('data-cert-src');
            var title = btn.getAttribute('data-cert-title') || 'Certificate';
            var issuer = btn.getAttribute('data-cert-issuer') || '';
            var year = btn.getAttribute('data-cert-year') || '';
            var type = btn.getAttribute('data-cert-type') || 'Certification';
            var desc = btn.getAttribute('data-cert-desc') || '';

            certModalImg.src = src;
            certModalImg.alt = title + ' - ' + issuer;
            if (certModalTitle) certModalTitle.textContent = title;
            if (certModalBadge) certModalBadge.textContent = type;
            if (certModalIssuer) certModalIssuer.textContent = issuer;
            if (certModalYear) certModalYear.textContent = year;
            if (certModalDesc) certModalDesc.textContent = desc;
            if (certModalOpenOriginal) certModalOpenOriginal.href = src;

            lastCertFocusedElement = btn;
            certModal.classList.add('is-open');
            certModal.setAttribute('aria-hidden', 'false');
            certModalClose.focus();
            document.body.style.overflow = 'hidden';
        }

        function closeCertModal() {
            certModal.classList.remove('is-open');
            certModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastCertFocusedElement) {
                lastCertFocusedElement.focus();
            }
        }

        document.querySelectorAll('.cert-preview-btn, .cert-view-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openCertModal(btn);
            });
        });

        certModalClose.addEventListener('click', closeCertModal);

        certModal.addEventListener('click', function (e) {
            if (e.target === certModal || e.target.classList.contains('cert-modal-backdrop')) {
                closeCertModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && certModal.classList.contains('is-open')) {
                closeCertModal();
            }
        });
    }
})();

