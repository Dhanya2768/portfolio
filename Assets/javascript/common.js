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
       5b. MCA Status Badge Toggle (Completed / Pursuing)
    ----------------------------------------- */
    var mcaStatusBtn = document.getElementById('mcaStatusBtn');
    var mcaStatusText = document.getElementById('mcaStatusText');

    if (mcaStatusBtn && mcaStatusText) {
        mcaStatusBtn.addEventListener('click', function () {
            var isPursuing = mcaStatusBtn.classList.contains('is-pursuing');
            if (isPursuing) {
                mcaStatusBtn.classList.remove('is-pursuing');
                mcaStatusBtn.classList.add('is-completed');
                mcaStatusText.textContent = 'Status: Completed';
                mcaStatusBtn.setAttribute('title', 'Status is Completed. Click to switch to Pursuing.');
            } else {
                mcaStatusBtn.classList.remove('is-completed');
                mcaStatusBtn.classList.add('is-pursuing');
                mcaStatusText.textContent = 'Status: Pursuing';
                mcaStatusBtn.setAttribute('title', 'Status is Pursuing. Click to switch to Completed.');
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
    var projectModalLiveBtn = document.getElementById('projectModalLiveBtn');

    if (projectModal && projectModalClose) {
        var PROJECT_DATA = {
            'real-estate': {
                title: 'Real Estate Website (Hilltop)',
                category: 'Python • Django • MySQL',
                inquiryTopic: 'Real Estate Website',
                technologies: ['Python', 'Django', 'MySQL'],
                coreFeatures: [
                    'Property Listings',
                    'Buyer Dashboard',
                    'Seller Dashboard',
                    'Property Details',
                    'Purchase Offers',
                    'Property Transfers'
                ],
                screens: [
                    {
                        src: 'Assets/image/hilltop-home.jpg',
                        alt: 'Hilltop Real Estate landing page showing luxury modern villa showcase, verified listings banner, and 5-angle inspection feature',
                        title: 'Landing Page & Public Discovery Portal',
                        thumbLabel: 'Landing Page',
                        description: 'Modern luxury property discovery portal welcoming prospective buyers and certified sellers with verified ownership guarantees, 5-angle inspection highlights, and transparent bidding workflows.',
                        features: [
                            'Property Listings: Hero discovery showcase with prominent "Explore Properties" and "List as Seller" call-to-actions',
                            'Property Details: Curated modern luxury villa showcase with real-time verified ownership badges',
                            'Buyer Dashboard & Seller Dashboard: Streamlined navigation with role-based registration portals',
                            'Property Transfers & Trust Pillars: 100% Verified Listings, 5-Angle Photo Inspection, Direct Seller Negotiations, and Instant Digital Transfers'
                        ],
                        tags: ['Python', 'Django', 'MySQL', 'Property Listings', 'Property Details'],
                        archNotes: 'Built on Django MTV pattern. The public catalog view connects to relational MySQL database queries with responsive CSS Grid presentation and dynamic search filters.'
                    },
                    {
                        src: 'Assets/image/hilltop-seller-dashboard.png',
                        alt: 'Hilltop Seller Dashboard displaying listed properties count, action cards, and property inventory table with View Angles button',
                        title: 'Certified Seller Dashboard & Inventory Management',
                        thumbLabel: 'Seller Portal',
                        description: 'Dedicated management console for certified property owners to monitor active inventory, evaluate incoming buyer purchase offers, and execute legal property title transfers.',
                        features: [
                            'Seller Dashboard: Live KPI metrics tracking My Listed Properties (2), Pending Buyer Offers (0), and Properties Transferred (2)',
                            'Property Listings: Recent Property Listings table detailing thumbnail, location (Kottayam, Ramapuram), category (3BHK, 2BHK), total land sqft, and listing price',
                            'Property Details & Inspection: "View Angles" multi-angle image verification ensuring complete 5-angle photo inspection before publication',
                            'Property Transfers & Offers: Quick workflow shortcuts for Upload Listing, Review Buyer Offers, Complete Title Transfers, and Sold History'
                        ],
                        tags: ['Python', 'Django', 'MySQL', 'Seller Dashboard', 'Property Transfers'],
                        archNotes: 'Role-restricted Django view utilizing Django authentication sessions. MySQL queries filter property records by authenticated seller ID with automated deal status updates.'
                    },
                    {
                        src: 'Assets/image/hilltop-buyer-offers.png',
                        alt: 'Hilltop Buyer Purchase Offers page displaying request tracking table with list price, buyer offer, transferred status, paid badge, and View Title button',
                        title: 'Buyer Purchase Offers & Bidding Tracking',
                        thumbLabel: 'Buyer Offers',
                        description: 'Transparent buyer negotiation desk where prospective homeowners track offer submissions, price counter-negotiations, seller approval status, and completed payments.',
                        features: [
                            'Buyer Dashboard: Dedicated purchase offers desk for registered buyers to track transaction progress',
                            'Purchase Offers: Side-by-side price comparison showing original List Price alongside Buyer Offer (e.g. $7,500,000 offer on $8,000,000 listing)',
                            'Property Details: Sequential negotiation ledger tracking Request #, assigned Seller (Vivek, Alan, Gouri), Property ID, and Location',
                            'Property Transfers: Real-time deal milestone tracking with verified "Transferred" seller status, "Paid" badges, and direct "View Title" digital deed access'
                        ],
                        tags: ['Python', 'Django', 'MySQL', 'Buyer Dashboard', 'Purchase Offers'],
                        archNotes: 'Implements a multi-stage transaction state machine linking buyer requests to property listings, tracking negotiation status, approval workflow, and payment settlement.'
                    },
                    {
                        src: 'Assets/image/hilltop-buyer-properties.png',
                        alt: 'Hilltop My Owned Properties page showing ownership transferred table with land sqft, building area, floor counts, seller attribution, and transferred title badge',
                        title: 'My Owned Properties & Digital Title Transfers',
                        thumbLabel: 'Title Transfers',
                        description: 'Official digital property vault displaying all real estate assets successfully acquired and legally transferred to the buyer\'s name.',
                        features: [
                            'Property Transfers: Official digital ownership ledger displaying "Ownership Transferred" status and title confirmation',
                            'Property Details: Comprehensive land & building specifications: BHK category, Total Land sqft, Building Area (sqft), and Floor counts',
                            'Buyer Dashboard: Verified property vault linking buyer records with registered seller attribution (Vivek #5, Alan #1, Gouri #4)',
                            'Purchase Offers Settlement: Audited final acquisition price and immutable digital title status confirmation for every acquired asset'
                        ],
                        tags: ['Python', 'Django', 'MySQL', 'Property Transfers', 'Property Details'],
                        archNotes: 'Retrieves completed ownership records via relational SQL joins between users, properties, and transfer receipts, ensuring permanent immutable records.'
                    }
                ]
            },
            'pharmacy': {
                title: 'AI-Based Pharmacy Management System',
                category: 'PHP • MySQL • Smart Pricing AI • B2B Procurement',
                inquiryTopic: 'AI-Based Pharmacy Management System',
                technologies: ['PHP', 'MySQL', 'Smart Pricing AI', 'B2B Procurement'],
                coreFeatures: [
                    'Admin Dashboard',
                    'Pharmacist Dashboard',
                    'Supplier Management',
                    'Medicine Inventory',
                    'Smart Pricing',
                    'Stock Alerts',
                    'Supplier Price Comparison',
                    'Purchase Management'
                ],
                screens: [
                    {
                        src: 'Assets/image/pharmacy-1-landing.jpg',
                        alt: 'AI PharmaCare landing page showing SaaS portal, AI Dynamic Price & Expiry Audit, and unified login options',
                        title: 'AI PharmaCare Landing Page & SaaS Ecosystem',
                        thumbLabel: 'Portal SaaS',
                        description: 'Unified healthcare platform connecting hospital administrators, licensed pharmacists, and medical suppliers with AI inventory intelligence, automated prescription depletion, and B2B rate negotiations.',
                        features: [
                            'Admin Dashboard & Portal Routing: Dedicated entry points for Pharmacist Join, Supplier Join, and Admin Unified Login',
                            'Pharmacist Dashboard & Stock Depletion: Automated prescription depletion workflow connecting dispensary with central stock',
                            'Smart Pricing AI Engine: AI Dynamic Price & Expiry Audit module continuously monitoring market health trends and optimal margins',
                            'Supplier Management & B2B Procurement: Modern healthcare SaaS ecosystem facilitating multi-tier supplier communications'
                        ],
                        tags: ['PHP', 'MySQL', 'Smart Pricing AI', 'B2B Procurement'],
                        archNotes: 'Engineered using modular PHP with session-based role verification routing users to Admin, Dispensary, or Supplier portals.'
                    },
                    {
                        src: 'Assets/image/pharmacy-2-admin.png',
                        alt: 'PharmaAdmin System Administrator Dashboard displaying critical stock alerts, inventory metrics, and quotation settlements',
                        title: 'PharmaAdmin System Administrator Dashboard',
                        thumbLabel: 'Admin Hub',
                        description: 'Central administrative command console monitoring dispensary stock units, AI risk models, supplier quotation settlements, and critical restock alerts.',
                        features: [
                            'Admin Dashboard: Real-time command center tracking stock units, AI risk models, and settlement metrics',
                            'Medicine Inventory: Master inventory tracker monitoring 10 formulations and 672 active stock units across dispensary batches',
                            'Stock Alerts: Critical Stock Alert banner (e.g. Vitamin B Complex down to 4 units) with one-click restock request',
                            'Purchase Management & Settlements: Direct authorization ledger for ₹3,398.00 vendor disbursements and pending approvals'
                        ],
                        tags: ['PHP', 'MySQL', 'Admin Dashboard', 'Medicine Inventory', 'Stock Alerts'],
                        archNotes: 'Executes aggregated SQL queries calculating inventory volume, low-stock threshold triggers, and authorized vendor payment settlements.'
                    },
                    {
                        src: 'Assets/image/pharmacy-3-dispensary.jpg',
                        alt: 'PharmaCare Dispensary and Live Prescribing POS showing therapeutic categories, medicine catalog, and prescription cart',
                        title: 'PharmaCare Dispensary & Live Prescribing POS',
                        thumbLabel: 'Dispensary POS',
                        description: 'Pharmacist point-of-sale interface for searching therapeutic categories, checking real-time batch stock, and compiling customer prescription bills.',
                        features: [
                            'Pharmacist Dashboard: Comprehensive clinical POS interface for licensed dispensary staff',
                            'Medicine Inventory: Real-time catalog displaying medicine strength (500mg, 10ml), batch expiry dates, and live remaining units',
                            'Smart Pricing: Dynamic unit pricing (₹18.48, ₹9.98, ₹20.17) and live calculation of prescription grand totals',
                            'Stock Alerts & Prescribing: Instant stock availability verification during customer bill formulation'
                        ],
                        tags: ['PHP', 'MySQL', 'Pharmacist Dashboard', 'Medicine Inventory', 'Smart Pricing'],
                        archNotes: 'Utilizes atomic MySQL database transactions to deduct dispensed quantities from inventory upon order confirmation, preventing concurrent race conditions.'
                    },
                    {
                        src: 'Assets/image/pharmacy-4-alert.png',
                        alt: 'Stock Running Out Alert modal displaying inventory stock threshold warning for Vitamin B Complex with 4 units remaining',
                        title: 'Critical Stock Running Out Alert & Auto-Restock Modal',
                        thumbLabel: 'Stock Alerts',
                        description: 'Automated AI threshold warning notifying dispensary managers when critical medicines fall below safe reserve levels, enabling instant procurement reorders.',
                        features: [
                            'Stock Alerts: Automated threshold warning triggered when stock falls to 4 units with prominent visual warning',
                            'Purchase Management: Actionable clinical restock dispatch with direct "Request Medicine" one-click workflow',
                            'Smart Pricing Protection: Safeguards patient care continuity by eliminating dispensary stockout risk',
                            'Supplier Management Integration: Automatically dispatches restock demand to registered pharmaceutical suppliers'
                        ],
                        tags: ['PHP', 'MySQL', 'Stock Alerts', 'Purchase Management', 'Smart Pricing AI'],
                        archNotes: 'Automated inventory monitoring compares current stock against minimum safe thresholds, triggering administrative modal popups and restock workflows.'
                    },
                    {
                        src: 'Assets/image/pharmacy-5-broadcast.jpg',
                        alt: 'PharmaAdmin Broadcast Medicine Request to Suppliers interface showing multi-supplier quotation tracking and payment confirmation',
                        title: 'Hospital Procurement & Supplier Bidding Broadcast',
                        thumbLabel: 'Bidding Broadcast',
                        description: 'Hospital supply chain desk allowing administrators to broadcast batch restock requests to competing pharmaceutical suppliers and evaluate quotes.',
                        features: [
                            'Purchase Management: Multi-supplier broadcast request form specifying medicine name, quantity (50 units), and target dates',
                            'Supplier Price Comparison: Side-by-side quotation aggregator highlighting lowest available vendor rates (₹17.50/unit)',
                            'Supplier Management: Direct collaboration portal connecting hospital procurement with verified external distributors',
                            'Admin Dashboard Integration: Live state machine tracking requisitions from "Pending Quotes" through "Completed" payments'
                        ],
                        tags: ['PHP', 'MySQL', 'Supplier Price Comparison', 'Purchase Management', 'Supplier Management'],
                        archNotes: 'Binds hospital procurement requests to external vendor bids in MySQL with a state machine (Pending Quotes → Reviewing → Awarded & Paid).'
                    },
                    {
                        src: 'Assets/image/pharmacy-6-quotations.png',
                        alt: 'PharmaSupplier Incoming Medicine Requests and Quotations interface showing bidding offer details and awarded contract status',
                        title: 'PharmaSupplier Incoming Demands & Quotation Submission',
                        thumbLabel: 'Supplier Bidding',
                        description: 'Supplier vendor portal where approved pharmaceutical distributors review incoming hospital restock demands and submit competitive rate and expiry quotes.',
                        features: [
                            'Supplier Management: Dedicated distributor portal for approved vendors to inspect hospital restock tenders',
                            'Supplier Price Comparison: Competitive bidding desk allowing suppliers to submit unit rates (₹20.00) and batch numbers',
                            'Purchase Management Contracts: Automated contract award tracking with "Awarded & Paid" confirmation',
                            'Medicine Inventory Fulfillment: Direct batch supply dispatch against hospital restock requirements (50 units)'
                        ],
                        tags: ['PHP', 'MySQL', 'Supplier Management', 'Supplier Price Comparison', 'B2B Procurement'],
                        archNotes: 'Allows multi-tenant supplier accounts to submit sealed bids stored with unit price and expiry dates for algorithmic hospital admin evaluation.'
                    },
                    {
                        src: 'Assets/image/pharmacy-7-supplier-hub.jpg',
                        alt: 'PharmaSupplier Supplier Operations Hub dashboard showing active demands, settled revenue of ₹1,648.00, and recent proposals ledger',
                        title: 'PharmaSupplier Operations Hub & Performance Metrics',
                        thumbLabel: 'Supplier Hub',
                        description: 'Comprehensive distributor operations dashboard displaying active demands, proposal audit history, catalog inventory, and settled contract revenue.',
                        features: [
                            'Supplier Management: Live distributor KPI dashboard tracking Active Demands (7), My Catalog (1), and Quotes in Review (0)',
                            'Purchase Management & Settlements: Audited revenue ledger showing ₹1,648.00 settled across paid hospital procurement orders',
                            'Supplier Price Comparison History: Proposals audit ledger tracking awarded and closed competitive tenders',
                            'Medicine Inventory Catalog: Supplier-managed pharmaceutical inventory and verified partner governance'
                        ],
                        tags: ['PHP', 'MySQL', 'Supplier Management', 'Purchase Management', 'B2B Procurement'],
                        archNotes: 'Calculates aggregate vendor revenue, active inquiry counts, and bid success ratios via relational MySQL JOINs between suppliers, bids, and payment records.'
                    }
                ]
            },
            'hotel': {
                title: 'Online Hotel Management System (Hotel Paradise)',
                category: 'HTML • CSS • JavaScript • PHP • MySQL',
                inquiryTopic: 'Online Hotel Management System',
                technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
                coreFeatures: [
                    'Hotel Management',
                    'Reservation Management',
                    'Customer Records',
                    'Admin Panel'
                ],
                screens: [
                    {
                        src: 'Assets/image/hotel-1-landing.jpg',
                        alt: 'Hotel Paradise 5-Star Luxury Resort landing page showing hero banner, suites showcase, and reservation navigation',
                        title: 'Hotel Paradise Landing Page & Luxury Resort Showcase',
                        thumbLabel: 'Resort Portal',
                        description: 'Modern 5-star luxury resort discovery portal welcoming prospective guests with riverfront suite showcases, amenities exploration, and seamless direct booking workflows.',
                        features: [
                            'Hotel Management: Hero showcase highlighting 5-Star Luxury Resort & Suites with "Explore Suites" and "Reserve Your Stay" CTAs',
                            'Reservation Management: Integrated navigation linking directly to live booking engine and user booking lookups',
                            'Customer Records: Streamlined guest authentication with role-based "Sign In" and "My Bookings" portals',
                            'Admin Panel: Staff administration gateway for managing hospitality services and accommodations'
                        ],
                        tags: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'Hotel Management'],
                        archNotes: 'Built with semantic HTML5 and modern CSS3 flex/grid layouts. Direct call-to-action buttons route guests to dynamic PHP booking and authentication modules.'
                    },
                    {
                        src: 'Assets/image/hotel-2-admin.png',
                        alt: 'Hotel Paradise Staff Administration Dashboard showing Reservation Oversight, total bookings, occupied suites, and occupancy rate',
                        title: 'Staff Administration & Reservation Oversight Dashboard',
                        thumbLabel: 'Admin Panel',
                        description: 'Central staff operations console managing real-time guest arrivals, room allocations, monthly occupancy analytics, and check-out releases.',
                        features: [
                            'Admin Panel: Comprehensive staff console tracking Total Bookings (2), Occupied Suites (2/6), and Occupancy Rate (33%)',
                            'Reservation Management: Live reservations ledger with Booking Ref (#HP-00001, #HP-00002), Assigned Room, and monthly check-in filtering',
                            'Customer Records: Detailed guest records tracking guest name, email, phone number, and scheduled check-in/out dates',
                            'Hotel Management: One-click "Release Room" action triggering room turnover workflows and updating live suite inventory'
                        ],
                        tags: ['PHP', 'MySQL', 'Admin Panel', 'Reservation Management', 'Occupancy Metrics'],
                        archNotes: 'Queries relational MySQL database tables to calculate real-time occupancy rates, display active reservations, and execute immediate room release updates.'
                    },
                    {
                        src: 'Assets/image/hotel-3-booking.jpg',
                        alt: 'Hotel Paradise Reserve Your Stay page showing suite category selection, stay dates, and live reservation summary',
                        title: 'Guest Suite Selection & Live Availability Booking Engine',
                        thumbLabel: 'Suite Booking',
                        description: 'Interactive reservation engine allowing guests to choose suite categories, verify live pricing per night, select stay dates, and view transparent cost summaries.',
                        features: [
                            'Reservation Management: Multi-tier suite selection featuring Executive Single ($50/night), Deluxe Riverview ($90/night), and Presidential Suite ($150/night)',
                            'Hotel Management: Dynamic pricing calculation compiling room rates, length of stay, and inclusive resort fee policies',
                            'Customer Records: Interactive stay summary compiling assigned room numbers (#201) and transparent total calculations ($90.00)',
                            'Admin Panel Sync: Real-time calendar availability preventing double-booking and syncing with staff oversight tables'
                        ],
                        tags: ['PHP', 'MySQL', 'JavaScript DOM', 'Booking Engine', 'Dynamic Pricing'],
                        archNotes: 'Employs JavaScript DOM state management and asynchronous PHP validation to check room availability before writing reservations to MySQL.'
                    },
                    {
                        src: 'Assets/image/hotel-4-records.jpg',
                        alt: 'Hotel Paradise Manage Your Reservations page showing guest lookup search desk and active reservation records table',
                        title: 'Manage Your Reservations & Guest Lookup Desk',
                        thumbLabel: 'Guest Records',
                        description: 'Dedicated guest self-service portal to search bookings by name and phone number, inspect reservation vouchers, and manage active booking cancellations.',
                        features: [
                            'Customer Records: Dual-field lookup desk searching records by Guest Name and registered Phone Number',
                            'Reservation Management: Tabulated records displaying Ref #, Suite category, Check-In, Check-Out, and assigned guest identity',
                            'Hotel Management: Instant "Cancel" booking action enabling verified guests to release held reservations with immediate inventory restoration',
                            'Admin Panel Synchrony: Guest modifications immediately reflect across the staff administration dashboard'
                        ],
                        tags: ['PHP', 'MySQL', 'Customer Records', 'Reservation Lookup', 'CRUD Operations'],
                        archNotes: 'Implements parameterized MySQL SELECT and UPDATE queries matching guest credentials, providing secure self-service modification without authentication hurdles.'
                    }
                ]
            },
            'portfolio': {
                title: 'Personal Developer Portfolio Website',
                category: 'Web Development • Personal Portfolio Website',
                inquiryTopic: 'Personal Developer Portfolio Website',
                liveUrl: 'https://dhanyaorg.netlify.app',
                technologies: ['HTML5', 'CSS3', 'JavaScript'],
                coreFeatures: [
                    'Modern homepage with personal introduction',
                    'About Me page',
                    'Education timeline',
                    'Certifications showcase',
                    'Technical Skills page',
                    'Projects showcase',
                    'Contact page with form validation',
                    'Resume download functionality',
                    'Dark and Light theme toggle',
                    'Fully responsive layout'
                ],
                screens: [
                    {
                        src: 'Assets/image/portfolio-home.png',
                        alt: 'Personal Developer Portfolio Website homepage live preview at dhanyaorg.netlify.app',
                        title: 'dhanyaorg.netlify.app — Personal Developer Portfolio Homepage',
                        thumbLabel: 'Live Homepage',
                        description: 'A modern, responsive personal developer portfolio website designed to showcase my profile, educational background, technical skills, certifications, and development projects. It helps visitors explore my work, view my resume, and connect with me.',
                        features: [
                            'Modern homepage with personal introduction & framed developer profile photograph',
                            'About Me page with technical interests and career objective highlights',
                            'Education timeline with vertical animated connecting lines and degree milestones',
                            'Certifications showcase with authentic document previews and image lightbox viewer',
                            'Technical Skills page displaying programming languages, frameworks, and tools with official logos',
                            'Projects showcase with interactive 2×2 screenshot grids and deep-dive modals',
                            'Contact page with client-side form validation, individual field errors, and mailto handoff',
                            'Resume download functionality linking to downloadable PDF curriculum vitae',
                            'Dark and Light theme toggle with automatic persistence and zero-flicker bootstrap',
                            'Fully responsive layout optimized for desktop, tablet, and mobile displays'
                        ],
                        tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Glassmorphism', 'Personal Portfolio'],
                        archNotes: 'Engineered as a clean, performant static web application using semantic HTML5, modular CSS custom properties, and vanilla JavaScript. Features dual-theme persistence in localStorage, accessible ARIA attributes, and zero external build dependencies.'
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
                var allTags = (project.technologies || []).slice();
                (screen.tags || []).forEach(function (t) {
                    if (allTags.indexOf(t) === -1) {
                        allTags.push(t);
                    }
                });
                allTags.forEach(function (tag) {
                    var span = document.createElement('span');
                    span.className = 'tag tag--tech';
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
            if (projectModalLiveBtn) {
                if (project.liveUrl) {
                    projectModalLiveBtn.href = project.liveUrl;
                    projectModalLiveBtn.classList.remove('is-hidden');
                    if (projectModalInquiryBtn) {
                        projectModalInquiryBtn.className = 'btn btn-outline';
                    }
                } else {
                    projectModalLiveBtn.classList.add('is-hidden');
                    if (projectModalInquiryBtn) {
                        projectModalInquiryBtn.className = 'btn btn-primary';
                    }
                }
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

