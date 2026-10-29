/*-----------------------------------------------------------------------------------
    
Template Name: Renvia – Real Estate Group HTML5 Template
URI: https://nayonacademy.com/
Description: Renvia is a premium, modern and feature-rich Real Estate HTML5 Template designed for property agencies, real estate companies, builders, architects, residential & commercial listing platforms. It delivers a clean UI, elegant layout structure, powerful features, and smooth user experience to help you showcase properties professionally and convert more clients.
Author: Themeservices
Author URI: https://themeforest.net/user/themeservices
Version: 1.0 

    Note: This is Main Js file

-----------------------------------------------------------------------------------
    ===================
    Js INDEX
    ===================
    ## Main Menu
    ## Offcanvas Overlay
    ## Preloader
    ## Sticky
    ## Magnific-popup js
    ## Slick Slider
    ## Gsap
    ## Project JS
    ## Item Active JS
    ## Dynamic Background
    ## AOS Js
    ## Document Ready
    
-----------------------------------------------------------------------------------*/

(function($) {
    'use strict';

    //===== Main Menu

    function mainMenu() {
        
        var var_window = $(window),
        navContainer = $('.header-navigation'),
        navbarToggler = $('.navbar-toggler'),
        navMenu = $('.theme-nav-menu'),
        navMenuLi = $('.theme-nav-menu ul li ul li'),
        closeIcon = $('.navbar-close');

        navbarToggler.on('click', function() {
            navbarToggler.toggleClass('active');
            navMenu.toggleClass('menu-on');
        });

        closeIcon.on('click', function() {
            navMenu.removeClass('menu-on');
            navbarToggler.removeClass('active');
        });

        navMenu.find("li a").each(function() {
            if ($(this).children('.dd-trigger').length < 1) {
                if ($(this).next().length > 0) {
                    $(this).append('<span class="dd-trigger"><i class="far fa-angle-down"></i></span>')
                }
            }
        });

        navMenu.on('click', '.dd-trigger', function(e) {
            e.preventDefault();
            $(this).parent().parent().siblings().children('ul.sub-menu').slideUp();
            $(this).parent().next('ul.sub-menu').stop(true, true).slideToggle(350);
            $(this).toggleClass('sub-menu-open');
        });

    };

    //===== Offcanvas Overlay

    function offCanvas() {
        const $overlay = $(".offcanvas__overlay");
        const $toggler = $(".navbar-toggler");
        const $menu = $(".theme-nav-menu");
        $toggler.add($overlay).add(".navbar-close").on("click", function () {
            $overlay.toggleClass("overlay-open");
            if ($(this).is($overlay)) {
                $toggler.removeClass("active");
                $menu.removeClass("menu-on");
            }
        });
        $(window).on("resize", function () {
            if ($(window).width() > 991) $overlay.removeClass("overlay-open");
        });
    }
    function initOffcanvasPanel() {
		const overlay = $(".offcanvas__overlay");
		var panelIcon = $('.offcanvas-toggle'),
		panelClose = $('.panel-close-btn'),
		panelWrap = $('.renvia-offcanvas-panel');
		panelIcon.on('click', function (e) {
			e.preventDefault();
			overlay.addClass("overlay-open");
			panelWrap.addClass('panel-on');
		});
		panelClose.on('click', function (e) {
			e.preventDefault();
			overlay.removeClass("overlay-open");
			panelWrap.removeClass('panel-on');
		});
		overlay.on('click', function (e) {
			e.preventDefault();
			overlay.removeClass("overlay-open");
			panelWrap.removeClass('panel-on');
		});
	}
    //===== Windows load

    $(window).on('load', function(event) {
        //===== Preloader
        $('.preloader').delay(500).fadeOut(500);
    })

    
    //===== Magnific-popup js
    
    if ($('.video-popup').length){
        $('.video-popup').magnificPopup({
            type: 'iframe',
            removalDelay: 300,
            mainClass: 'mfp-fade'
        });
    }

    //===== Slick Slider
    if ($('.hero-slider').length) {
        var sliderDots = $('.hero-dots');
        $('.hero-slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 800,
            fade: true,
            appendDots: sliderDots,
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            autoplay: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>'
        });
    }
    if ($('.service-slider').length) {
        $('.service-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 4,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
                {
                    breakpoint: 1450,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2
                    }
                },
				{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
    if ($('.project-slider').length) {
        $('.project-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            variableWidth: true,
            centerMode: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
				{
                    breakpoint: 767,
                    settings: {
                        centerMode: false,
                        slidesToShow: 1,
                        variableWidth: false,
                    }
                }
            ]
        });
    }
    if ($('.projects-slider-two').length) {
        $('.projects-slider-two').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 4,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
                {
                    breakpoint: 1500,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2
                    }
                },
				{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
    if ($('.testimonial-slider').length) {
        var sliderArrows = $('.testimonial-arrows');
        $('.testimonial-slider').slick({
            dots: false,
            arrows: true,
            infinite: true,
            speed: 800,
            autoplay: true,
            appendArrows: sliderArrows,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
				{
                    breakpoint: 767,
                    settings: {
                        arrows: false,
                    }
                }
            ]
        });
    }
    if ($('.testimonial-slider-two').length) {
        var sliderDots = $('.testimonial-dots');
        $('.testimonial-slider-two').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 800,
            appendDots: sliderDots,
            autoplay: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
				{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
    if ($('.testimonial-slider-three').length) {
        $('.testimonial-slider-three').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
				{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
    if ($('.choose-slider').length) {
        var sliderArrows = $('.choose-arrows');
        $('.choose-slider').slick({
            dots: false,
            arrows: true,
            infinite: true,
            speed: 800,
            autoplay: true,
            appendArrows: sliderArrows,
            slidesToShow: 3,
            slidesToScroll: 1,
            prevArrow: '<div class="prev">Previews</div>',
            nextArrow: '<div class="next">Next</div>',
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
    if ($('.gallery-slider').length) {
        $('.gallery-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }
    if ($('.post-thumbnail-slider').length) {
        $('.post-thumbnail-slider').slick({
            dots: false,
            arrows: true,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>'
        });
    }
    if ($('.clients-slider').length) {
        $('.clients-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 6,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
            responsive: [
                {
                    breakpoint: 1450,
                    settings: {
                        slidesToShow: 4
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 570,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    // ===== Counter

	if ($('.counter').length) {
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					$(entry.target).counterUp({
						delay: 100,
						time: 4000
					});
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 1.0
		});
		$('.counter').each(function() {
			observer.observe(this);
		});
	}
    
    //===== Gasp 
    
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Gsap ScrollSmoother
    if (document.getElementById('smooth-wrapper') && document.getElementById('smooth-content')) {
        ScrollSmoother.create({
            smooth: 1,
            effects: true,
            smoothTouch: 0.1,
        });
    }

    //===== Modern Hero On-Scroll Banner Switching
    (function initHeroScrollSlider() {
        var $hero = $('.modern-hero-section');
        var $slides = $hero.find('.hero-slider-item');
        if (!$hero.length || !$slides.length) return;

        var currentIndex = 0;

        function switchSlide(index) {
            if (index === currentIndex && $slides.eq(index).hasClass('active')) return;
            currentIndex = index;

            $slides.each(function(i) {
                var isActive = (i === index);
                var $slide = $(this);
                $slide.toggleClass('active', isActive);
                if (isActive) {
                    var animElements = $slide.find('.banner-title, .banner-subtitle, .banner-actions, .hero-banner-building').get();
                    animElements.forEach(function(el) {
                        el.style.animation = 'none';
                        void el.offsetHeight; // force reflow
                        el.style.animation = '';
                    });
                }
            });
        }

        var pinDistance = function () {
            return window.innerWidth <= 767 ? 900 : 1500;
        };

        ScrollTrigger.create({
            trigger: '.modern-hero-section',
            start: 'top top',
            end: () => '+=' + pinDistance(),
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.3,
            onUpdate: function(self) {
                var p = self.progress; // 0.0 to 1.0
                var target = 0;
                if (p < 0.33) {
                    target = 0;
                } else if (p < 0.67) {
                    target = 1;
                } else {
                    target = 2;
                }
                switchSlide(target);
            }
        });

        ScrollTrigger.refresh();
    })();

    //===== Permanently Locked Floating Navbar (Locked on screen, not moving anywhere)
    (function initLockedNavbar() {
        const header = $('header.header-area');
        if (!header.length) return;

        function onScroll(y) {
            if (y > 20) {
                header.addClass('is-scrolled');
            } else {
                header.removeClass('is-scrolled');
            }
        }

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: function (self) {
                    onScroll(self.scroll());
                }
            });
        }

        $(window).on('scroll', function () {
            onScroll($(this).scrollTop());
        });

        const initialY = (typeof ScrollSmoother !== 'undefined' && ScrollSmoother.get()) 
            ? ScrollSmoother.get().scrollTop() 
            : $(window).scrollTop();
        onScroll(initialY);
    })();

    var carsModal = document.getElementById('airbnbCarsModal');
    if (carsModal) {
        carsModal.addEventListener('show.bs.modal', function () {
            var smoother = ScrollSmoother.get();
            if (smoother) {
                smoother.paused(true);
            }
        });
        carsModal.addEventListener('hidden.bs.modal', function () {
            var smoother = ScrollSmoother.get();
            if (smoother) {
                smoother.paused(false);
            }
        });
    }

    // Gsap SplitText

    if ($('.text-anm').length) {
		let staggerAmount = 0.02,
			translateYValue = 30,
			delayValue = .25,
			easeType = "power3.out",
			animatedTextElements = document.querySelectorAll('.text-anm');
		animatedTextElements.forEach((element) => {
			let animationSplitText = new SplitText(element, {
				type: "lines, words"
			});
			gsap.from(animationSplitText.words, {
				duration: 1.1,
				delay: delayValue,
				y: translateYValue,
				autoAlpha: 0,
				stagger: staggerAmount,
				ease: easeType,
				scrollTrigger: {
					trigger: element,
					start: "top 85%"
				},
			});
		});
	}

    // ScrollTrigger for Project Section Cards

    $(function () {
        var width = $(window).width();
        if (width <= 1199) return;
        if (!$(".renvia-project_one").length) return;
        if (window.__renviaProjectScrollTriggerInit) return;
        window.__renviaProjectScrollTriggerInit = true;

        // Pin 165px below viewport top so the sticky navbar (~95px) has generous luxury headroom (~70px)
        let pinTopOffset = 165;

        let cards = gsap.utils.toArray(".renvia-proiect-list .renvia-project-item");
        if (!cards.length) return;

        let $sec = $(".renvia-project_one");
        let $box = $(".renvia-project_one .renvia-content-box");

        function getStopViewportY() {
            let boxHeight = $box.outerHeight(true) || 415;
            let cardHeights = cards.map(c => $(c).outerHeight(true) || 330);
            let maxCompHeight = Math.max(boxHeight, ...cardHeights);
            // Stop level: curve bottom stays 35px below the lowest component (button/card)
            return pinTopOffset + maxCompHeight + 35;
        }

        ScrollTrigger.create({
            trigger: ".renvia-project_one .renvia-content-box",
            endTrigger: ".renvia-project_one",
            start: "top " + pinTopOffset + "px",
            end: () => "bottom " + (getStopViewportY() + 108) + "px",
            pin: ".renvia-project_one .renvia-content-box",
            pinSpacing: false,
            markers: false
        });

        cards.forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card,
                endTrigger: ".renvia-project_one",
                start: "top " + pinTopOffset + "px",
                end: () => "bottom " + (getStopViewportY() + 108) + "px",
                pin: true,
                pinSpacing: false,
                scrub: true,
                markers: false
            });
        });
    });

    //====== Pricing Js

    $("#pricingBox").change(function () {
        if ($(this).is(":checked")) {
            $(".price").each(function () {
                var yearPrice = $(this).data("year");
                $(this).html('<span class="currency">$</span>' + yearPrice + '<span class="duration">/Year</span>');
            });
        } else {
            $(".price").each(function () {
                var monthPrice = $(this).data("month");
                $(this).html('<span class="currency">$</span>' + monthPrice + '<span class="duration">/Month</span>');
            });
        }
    });

    //===== Nice select js
    
    if ($('select:not(.no-nice-select)').length){
        $('select:not(.no-nice-select)').niceSelect();
    }
    
    //===== Dynamic Background

    function dynamicBackground() {
        $('[data-src]').each(function () {
          var src = $(this).attr('data-src');
          $(this).css({
            'background-image': 'url(' + src + ')',
          });
        });
    }

    //===== Aos Animation

    AOS.init({
        offset: 0
    });

    //===== Projets en Vedette (Continuous Infinite Loop Curved Alignment)
    function initFeaturedArch() {
        const wrapper = document.querySelector('.featured-arch-wrapper');
        const container = document.querySelector('.featured-arch-container');
        const track = document.getElementById('featuredArchTrack');
        if (!wrapper || !track) return;

        const cards = track.querySelectorAll('.featured-arch-card');
        if (!cards.length) return;

        // Non-stopping continuous infinite stream (no hover pause)

        function updateWarp() {
            const stage = container || wrapper;
            const stageRect = stage.getBoundingClientRect();
            const centerX = stageRect.left + stageRect.width / 2;
            const halfWidth = stageRect.width / 2;
            if (halfWidth <= 0) return;

            // Curved alignment span
            const span = Math.min(halfWidth, 680) * 0.90;

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                // Normalized coordinate: 0 at center, -1 at left edge, +1 at right edge
                const normX = (cardCenterX - centerX) / span;
                
                // Clamped coordinate
                const u = Math.max(-1.3, Math.min(1.3, normX));
                const distSq = u * u; // 0 in center, 1 at edges

                // ALL CARDS ARE IDENTICAL IN SIZE (SIDES NEVER GET LONGER THAN OTHERS!)
                // Bounded curve elevation with generous headroom so tops are NEVER cropped:
                const curveFactor = Math.min(1.0, u * u);
                const translateY = -(curveFactor * 36); // graceful elevation on sides
                const rotateZ = u * 5.5; // tilt along curve tangent
                const rotateY = -u * 10; // amphitheater depth

                card.style.transform = `perspective(800px) translateY(${translateY.toFixed(1)}px) rotateZ(${rotateZ.toFixed(2)}deg) rotateY(${rotateY.toFixed(1)}deg)`;
            });
        }

        // Run continuously on each animation frame
        if (window.gsap && gsap.ticker) {
            gsap.ticker.add(updateWarp);
        } else {
            function loop() {
                updateWarp();
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        }
    }

//===== Minimalist Footer with Orange Glow Scroll Reveal
    function initMinimalistFooterReveal() {
        var $footer = $('#mainFooter');
        if (!$footer.length) return;

        // 1. Scroll-to-Top Button
        $('#scrollTopBtn').on('click', function(e) {
            e.preventDefault();
            if (typeof ScrollSmoother !== 'undefined') {
                var smoother = ScrollSmoother.get();
                if (smoother) {
                    smoother.scrollTo(0, true);
                    return;
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // 2. GSAP Orange Glow Scroll Reveal & Parallax
        if (window.gsap && window.ScrollTrigger) {
            var glow = document.getElementById('footerOrangeGlow');
            if (glow) {
                gsap.fromTo(
                    glow,
                    { scale: 0.8, opacity: 0.35, y: 60 },
                    {
                        scale: 1.15,
                        opacity: 1,
                        y: 0,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: '#mainFooter',
                            start: 'top 95%',
                            end: 'bottom bottom',
                            scrub: 1.2
                        }
                    }
                );
            }

            // Stagger reveal widgets smoothly
            var widgets = document.querySelectorAll('.footer-top-row .col-lg-4, .footer-top-row .col-lg-2, .footer-top-row .col-lg-3, .footer-bottom-bar');
            if (widgets.length) {
                gsap.fromTo(
                    widgets,
                    { y: 35, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.1,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: '#mainFooter',
                            start: 'top 85%'
                        }
                    }
                );
            }
        }
    }

    
    

    
    // ===== About Us (À Propos): Silky Smooth 3D Multi-Plane Parallax Animation =====
    function initFounderScrollPopout() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        var section = document.querySelector('.about-hero-showcase-section');
        if (!section) return;

        var stage = section.querySelector('.founder-card-stage');
        var bgFrame = section.querySelector('.founder-bg-frame');
        var fgFrame = section.querySelector('.founder-fg-frame');
        var bgImg = section.querySelector('.founder-bg-img');
        var fgImg = section.querySelector('.founder-fg-img');
        var glow = section.querySelector('.about-hero-showcase-glow');
        var bioSection = document.querySelector('.founder-bio-section');
        var infoBlock = document.querySelector('.founder-info-block');
        var infoName = document.querySelector('.founder-info-name');
        var infoRole = document.querySelector('.founder-info-role');
        var infoBio = document.querySelector('.founder-info-bio');

        if (!stage) return;

        // Ensure 100% full uncropped height
        if (bgFrame) bgFrame.style.height = '100%';

        // 1. Cinematic Entrance Animation (Page Load)
        var entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        gsap.set(stage, { opacity: 0, y: 45, scale: 0.95 });
        if (fgImg) gsap.set(fgImg, { opacity: 0, y: 25, scale: 0.98 });
        if (glow) gsap.set(glow, { opacity: 0 });

        entranceTl.to(stage, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out'
        }, 0.1);

        if (fgImg) {
            entranceTl.to(fgImg, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: 'power3.out',
                onComplete: function() {
                    gsap.set(fgImg, { clearProps: 'transform' });
                }
            }, 0.25);
        }

        if (glow) {
            entranceTl.to(glow, {
                opacity: 1,
                duration: 1.4,
                ease: 'power2.out'
            }, 0.3);
        }

        // 2. Continuous Silky Smooth 3D Multi-Plane Scroll Parallax (Restored, Fluid & Natural)
        // A. Entire Card Stage gentle floating elevation
        gsap.to(stage, {
            y: -55,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.8
            }
        });

        // B. 3D Stereoscopic Depth: Background office drifts slower, Fouad's cutout floats forward
        if (bgFrame) {
            gsap.to(bgFrame, {
                y: 40,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.8
                }
            });
        }

        if (fgFrame) {
            gsap.to(fgFrame, {
                y: -30,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.8
                }
            });
        }

        // 3. Founder Bio Section Parallax Reveal (When scrolling into the white section)
        if (infoBlock) {
            var bioTl = gsap.timeline({
                scrollTrigger: {
                    trigger: bioSection || infoBlock,
                    start: 'top 85%',
                    end: 'top 45%',
                    scrub: 0.8
                }
            });

            if (infoName) {
                bioTl.fromTo(infoName, 
                    { opacity: 0.3, y: 35, letterSpacing: '0.08em' },
                    { opacity: 1, y: 0, letterSpacing: '0.04em', ease: 'power2.out', duration: 1 }
                );
            }

            if (infoRole) {
                bioTl.fromTo(infoRole,
                    { opacity: 0.3, y: 25 },
                    { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 },
                    0.2
                );
            }

            if (infoBio) {
                bioTl.fromTo(infoBio,
                    { opacity: 0.4, y: 25 },
                    { opacity: 1, y: 0, ease: 'power2.out', duration: 0.9 },
                    0.35
                );
            }
        }

        // 4. Desktop Interactive 3D Cursor Hover Parallax (Separates Man PNG & Background)
        if (window.innerWidth > 991) {
            var isHover = false;
            var mouseX = 0, mouseY = 0;
            var currentRotX = 0, currentRotY = 0;
            var currentBgX = 0, currentBgY = 0;
            var currentFgX = 0, currentFgY = 0;
            var rafId = null;

            section.addEventListener('mouseenter', function() {
                isHover = true;
            });

            section.addEventListener('mousemove', function(e) {
                var r = stage.getBoundingClientRect();
                var relX = (e.clientX - r.left) / r.width - 0.5; // -0.5 to 0.5
                var relY = (e.clientY - r.top) / r.height - 0.5; // -0.5 to 0.5

                mouseX = Math.max(-1, Math.min(1, relX * 2)); // -1 to 1
                mouseY = Math.max(-1, Math.min(1, relY * 2)); // -1 to 1
                isHover = true;
                if (!rafId) rafId = requestAnimationFrame(animateCardTilt);
            });

            section.addEventListener('mouseleave', function() {
                isHover = false;
                mouseX = 0;
                mouseY = 0;
            });

            function animateCardTilt() {
                var targetRotX = -mouseY * 4.5; // Subtle luxury tilt degrees
                var targetRotY = mouseX * 5.0;

                currentRotX += (targetRotX - currentRotX) * 0.1;
                currentRotY += (targetRotY - currentRotY) * 0.1;

                stage.style.transform = 'perspective(1200px) rotateX(' + currentRotX.toFixed(2) + 'deg) rotateY(' + currentRotY.toFixed(2) + 'deg)';

                // Multi-Plane Separation while hovering (Pure Translation - NO Scale/Resizing):
                // 1. Background office drifts in opposition to cursor
                if (bgImg) {
                    var targetBgX = -mouseX * 16;
                    var targetBgY = -mouseY * 11;
                    currentBgX += (targetBgX - currentBgX) * 0.1;
                    currentBgY += (targetBgY - currentBgY) * 0.1;
                    bgImg.style.transform = 'translate(' + currentBgX.toFixed(1) + 'px, ' + currentBgY.toFixed(1) + 'px)';
                }

                // 2. Foreground PNG cutout (Fouad) moves forward and follows cursor with greater amplitude
                if (fgImg) {
                    var targetFgX = mouseX * 22;
                    var targetFgY = mouseY * 14;
                    currentFgX += (targetFgX - currentFgX) * 0.1;
                    currentFgY += (targetFgY - currentFgY) * 0.1;
                    fgImg.style.transform = 'translate(' + currentFgX.toFixed(1) + 'px, ' + currentFgY.toFixed(1) + 'px)';
                }

                if (isHover || Math.abs(currentRotX) > 0.02 || Math.abs(currentRotY) > 0.02 || Math.abs(currentFgX) > 0.02 || Math.abs(currentBgX) > 0.02) {
                    rafId = requestAnimationFrame(animateCardTilt);
                } else {
                    currentRotX = 0; currentRotY = 0;
                    currentBgX = 0; currentBgY = 0;
                    currentFgX = 0; currentFgY = 0;
                    stage.style.transform = 'none';
                    if (bgImg) bgImg.style.transform = 'none';
                    if (fgImg) fgImg.style.transform = 'none';
                    rafId = null;
                }
            }
        }
    }

    // ===== Steps Roadmap Parallax Scroll Animation =====
        // ===== Bento Grid Parallax Scroll Animation (Blocks Coming from Sides) =====
    
    
    // ===== 360 Ecosystem Roadmap Parallax Scroll & Line Drawing Animation =====
    // ===== 360 Ecosystem Roadmap Scroll-Driven Parallax & Ripped Line Drawing =====
        // ===== Editorial Luxury About Section (Notre Différence) - Animated When Reached Only =====
    function initEditorialAboutAnimation() {
        var aboutSec = document.querySelector('.editorial-about-section');
        if (!aboutSec) return;

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        var leftCard = aboutSec.querySelector('.editorial-card-left');
        var rightCard = aboutSec.querySelector('.editorial-card-right');
        var centerCol = aboutSec.querySelector('.editorial-center-col');
        var seal = aboutSec.querySelector('.editorial-spinning-seal');
        var sparkle = aboutSec.querySelector('.editorial-sparkle');
        var kicker = aboutSec.querySelector('.editorial-kicker');
        var title = aboutSec.querySelector('.editorial-title');
        var subtitle = aboutSec.querySelector('.editorial-subtitle');
        var desc = aboutSec.querySelector('.editorial-desc');
        var cta = aboutSec.querySelector('.editorial-cta');
        var prestigeStrip = aboutSec.querySelector('.editorial-prestige-strip');

        // Main entrance timeline - triggers strictly when user scrolls down and reaches this section
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: aboutSec,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });

        var isDesktop = window.innerWidth >= 992;

        if (isDesktop) {
            // Desktop 3-column reveal: left card slides from left, right card slides from right
            if (leftCard) {
                tl.fromTo(leftCard, 
                    { x: -90, opacity: 0, y: -25 },
                    { x: 0, opacity: 1, y: -25, duration: 1.05, ease: 'power3.out' },
                    0
                );
            }

            if (rightCard) {
                tl.fromTo(rightCard, 
                    { x: 90, opacity: 0, y: 35 },
                    { x: 0, opacity: 1, y: 35, duration: 1.05, ease: 'power3.out' },
                    0.08
                );
            }

            // Center Column elements stagger in gracefully
            var centerElements = [sparkle, kicker, title, subtitle, desc, cta].filter(Boolean);
            if (centerElements.length > 0) {
                tl.fromTo(centerElements,
                    { y: 35, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
                    0.15
                );
            }

            // Spinning seal badge pops in with celebratory bounce
            if (seal) {
                tl.fromTo(seal,
                    { scale: 0, opacity: 0, rotation: -90 },
                    { scale: 1, opacity: 1, rotation: 0, duration: 0.75, ease: 'back.out(2)' },
                    0.45
                );
            }

            // Architectural Parallax Depth while scrolling through the section (applied to inner frame to prevent transform collision)
            var leftFrame = leftCard ? leftCard.querySelector('.editorial-card-frame') : null;
            var rightFrame = rightCard ? rightCard.querySelector('.editorial-card-frame') : null;
            if (leftFrame) {
                gsap.to(leftFrame, {
                    y: 45,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: aboutSec,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.2
                    }
                });
            }
            if (rightFrame) {
                gsap.to(rightFrame, {
                    y: -45,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: aboutSec,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.2
                    }
                });
            }
        } else {
            // Mobile stacked reveal
            var allElements = [leftCard, centerCol, rightCard, prestigeStrip].filter(Boolean);
            tl.fromTo(allElements,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' },
                0
            );
            if (seal) {
                tl.fromTo(seal,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' },
                    0.4
                );
            }
        }
    }


    // ===== 360 Ecosystem Hero Banner: Entrance, Multi-Layer Parallax & Scroll Depth =====
    function initEcosystemHeroParallax() {
        var hero = document.querySelector('.ecosystem-hero');
        if (!hero) return;

        if (typeof gsap === 'undefined') return;

        var bgParallax = hero.querySelector('.ecosystem-hero-bg-parallax');
        var rings = hero.querySelector('.hero-360-rings');
        var orbCrimson = hero.querySelector('.hero-orb-crimson');
        var orbCyan = hero.querySelector('.hero-orb-cyan');
        var content = hero.querySelector('.ecosystem-hero-content');
        var badge = hero.querySelector('.hero-glow-badge');
        var title = hero.querySelector('.ecosystem-hero-title');
        var desc = hero.querySelector('.hero-desc');
        var chips = hero.querySelectorAll('.ecosystem-hero-chips .chip');

        // 1. Cinematic Entrance Animation (plays on page load)
        var entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Initial states
        if (bgParallax) gsap.set(bgParallax, { opacity: 0, scale: 0.95 });
        if (badge) gsap.set(badge, { opacity: 0, y: -25, scale: 0.92 });
        if (title) gsap.set(title, { opacity: 0, y: 35 });
        if (desc) gsap.set(desc, { opacity: 0, y: 25 });
        if (chips.length) gsap.set(chips, { opacity: 0, y: 20, scale: 0.9 });

        // Sequence
        if (bgParallax) {
            entranceTl.to(bgParallax, {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: 'power2.out'
            }, 0);
        }

        if (badge) {
            entranceTl.to(badge, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'back.out(1.5)'
            }, 0.15);
        }

        if (title) {
            entranceTl.to(title, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out'
            }, 0.25);
        }

        if (desc) {
            entranceTl.to(desc, {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: 'power2.out'
            }, 0.4);
        }

        if (chips.length) {
            entranceTl.to(chips, {
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.1,
                duration: 0.7,
                ease: 'back.out(1.5)'
            }, 0.5);
        }

        // 2. Scroll-Driven Multi-Layer Parallax (ScrollTrigger)
        // Keeps text 100% visible & readable during scrolling without fading out early!
        if (typeof ScrollTrigger !== 'undefined') {
            // Background deep parallax drift
            if (bgParallax) {
                gsap.to(bgParallax, {
                    yPercent: 25,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }

            // Badge parallax floating up
            if (badge) {
                gsap.to(badge, {
                    y: -50,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }

            // Title parallax
            if (title) {
                gsap.to(title, {
                    y: -35,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }

            // Description parallax
            if (desc) {
                gsap.to(desc, {
                    y: -25,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }

            // Chips parallax
            if (chips.length) {
                gsap.to(chips, {
                    y: -15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }

            // Content remains 100% fully visible while scrolling; only begins gentle fade as it exits the screen
            if (content) {
                gsap.to(content, {
                    opacity: 0.2,
                    ease: 'power1.in',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'bottom 60%',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                });
            }
        }

        // 3. Desktop Subtle Magnetic Mouse Parallax (Tilts ambient depth slightly)
        if (window.innerWidth > 991 && bgParallax) {
            var mouseX = 0, mouseY = 0;
            var currentX = 0, currentY = 0;
            var isHover = false;
            var mouseRaf = null;

            hero.addEventListener('mousemove', function(e) {
                var r = hero.getBoundingClientRect();
                mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1 to 1
                mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2; // -1 to 1
                isHover = true;
                if (!mouseRaf) mouseRaf = requestAnimationFrame(updateMouseParallax);
            });

            hero.addEventListener('mouseleave', function() {
                isHover = false;
                mouseX = 0;
                mouseY = 0;
            });

            function updateMouseParallax() {
                currentX += (mouseX - currentX) * 0.08;
                currentY += (mouseY - currentY) * 0.08;

                if (rings) {
                    rings.style.transform = 'translate(calc(-50% + ' + (currentX * 18) + 'px), calc(-50% + ' + (currentY * 18) + 'px))';
                }
                if (orbCrimson) {
                    orbCrimson.style.transform = 'translate(' + (currentX * -25) + 'px, ' + (currentY * -25) + 'px)';
                }
                if (orbCyan) {
                    orbCyan.style.transform = 'translate(' + (currentX * 25) + 'px, ' + (currentY * 25) + 'px)';
                }

                if (isHover || Math.abs(currentX) > 0.005 || Math.abs(currentY) > 0.005) {
                    mouseRaf = requestAnimationFrame(updateMouseParallax);
                } else {
                    mouseRaf = null;
                }
            }
        }
    }

    // ===== 360 Ecosystem Roadmap: Scroll-to-Reveal Expanding Cards & Progressive Road Line =====
    function initRoadmapParallaxAndDraw() {
        var roadmapSection = document.querySelector('#ecosysteme-roadmap');
        if (!roadmapSection) return;

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // 1. Drawing Road Line Animation: Progressively draws while scrolling
        var maskPath = roadmapSection.querySelector('.roadmap-mask-path');
        if (maskPath) {
            var pathLength = 3600;
            try {
                if (typeof maskPath.getTotalLength === 'function') {
                    var len = maskPath.getTotalLength();
                    if (len > 0) pathLength = Math.ceil(len) + 15;
                }
            } catch(e) {}

            gsap.set(maskPath, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength
            });

            gsap.to(maskPath, {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.roadmap-flow-container',
                    start: 'top 72%',
                    end: 'bottom 85%',
                    scrub: 0.8
                }
            });
        }

        // 2. Cards: Get bigger when scroll visibility reaches them
        var rows = roadmapSection.querySelectorAll('.roadmap-row');
        var isMobile = window.innerWidth < 768;
        var startScale = isMobile ? 0.90 : 0.84;
        var peakScale = isMobile ? 1.02 : 1.06;

        rows.forEach(function(row, index) {
            var card = row.querySelector('.pinned-card');
            if (!card) return;

            var targetRot = -3.5;
            if (card.classList.contains('tilt-right-1')) targetRot = 3.5;
            else if (card.classList.contains('tilt-left-2')) targetRot = -2.8;
            else if (card.classList.contains('tilt-right-2')) targetRot = 3.0;
            else if (card.classList.contains('tilt-left-3')) targetRot = -3.0;
            else if (card.classList.contains('tilt-right-3')) targetRot = 2.6;

            if (isMobile) targetRot = 0;

            // Scrubbed timeline: as scroll visibility reaches the card, it gets bigger!
            // Starts smaller, expands to big spotlight scale when scroll reaches it,
            // and gently settles when scrolled past.
            var tl = gsap.timeline({
                scrollTrigger: {
                    trigger: row,
                    start: 'top 95%',
                    end: 'bottom 15%',
                    scrub: 0.8
                }
            });

            tl.fromTo(card, 
                {
                    scale: startScale,
                    opacity: 0.55,
                    rotation: targetRot * 1.3
                },
                {
                    scale: peakScale,
                    opacity: 1,
                    rotation: targetRot,
                    ease: 'power2.out',
                    duration: 1
                }
            )
            .to(card, {
                scale: isMobile ? 0.98 : 0.96,
                opacity: 0.85,
                duration: 0.5,
                ease: 'power1.in'
            });
        });
    }

    // 3D Interactive Cursor Tilt for Benali Cars Banner Block (Follows cursor in place)
    function initBenaliCarsCursorTilt() {
        var wrapper = document.querySelector('.benali-cars-3d-wrapper');
        if (!wrapper) return;

        var maxTilt = 8; // responsive subtle luxury 3D tilt (degrees)
        var isHovered = false;
        var rafId = null;
        var targetRotX = 0;
        var targetRotY = 0;
        var currentRotX = 0;
        var currentRotY = 0;

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function animateTilt() {
            if (!isHovered && Math.abs(currentRotX) < 0.05 && Math.abs(currentRotY) < 0.05) {
                currentRotX = 0;
                currentRotY = 0;
                wrapper.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
                rafId = null;
                return;
            }

            currentRotX = lerp(currentRotX, targetRotX, 0.14);
            currentRotY = lerp(currentRotY, targetRotY, 0.14);

            wrapper.style.transform = 'perspective(1200px) rotateX(' + currentRotX.toFixed(2) + 'deg) rotateY(' + currentRotY.toFixed(2) + 'deg)';

            rafId = requestAnimationFrame(animateTilt);
        }

        wrapper.addEventListener('mouseenter', function() {
            isHovered = true;
            if (!rafId) rafId = requestAnimationFrame(animateTilt);
        });

        wrapper.addEventListener('mousemove', function(e) {
            var rect = wrapper.getBoundingClientRect();
            var x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            var y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

            x = Math.max(-1, Math.min(1, x));
            y = Math.max(-1, Math.min(1, y));

            targetRotX = -y * maxTilt;
            targetRotY = x * maxTilt;

            if (!rafId) rafId = requestAnimationFrame(animateTilt);
        });

        wrapper.addEventListener('mouseleave', function() {
            isHovered = false;
            targetRotX = 0;
            targetRotY = 0;
            if (!rafId) rafId = requestAnimationFrame(animateTilt);
        });
    }

    // 3-Column Cascading Parallax for Properties Listing
    function initPropertiesParallax() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        var section = document.querySelector('.properties-showcase-section');
        if (!section) return;

        var colLeft = section.querySelector('.prop-col-left');
        var colCenter = section.querySelector('.prop-col-center');
        var colRight = section.querySelector('.prop-col-right');
        if (!colCenter) return;

        ScrollTrigger.matchMedia({
            // Desktop (3 columns)
            "(min-width: 992px)": function() {
                if (colLeft) {
                    gsap.to(colLeft, {
                        y: -90,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.2
                        }
                    });
                }
                if (colCenter) {
                    gsap.to(colCenter, {
                        y: -260,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.2
                        }
                    });
                }
                if (colRight) {
                    gsap.to(colRight, {
                        y: -80,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.2
                        }
                    });
                }
            }
        });
    }

    // Document Ready

    $(function() {
        mainMenu();
        offCanvas();
        initOffcanvasPanel();
        dynamicBackground();
        initFeaturedArch();
        initMinimalistFooterReveal();
        if (typeof initFounderScrollPopout === 'function') initFounderScrollPopout();
        if (typeof initEditorialAboutAnimation === 'function') initEditorialAboutAnimation();
        if (typeof initEcosystemHeroParallax === 'function') initEcosystemHeroParallax();
        if (typeof initRoadmapParallaxAndDraw === 'function') initRoadmapParallaxAndDraw();
        if (typeof initBenaliCarsCursorTilt === 'function') initBenaliCarsCursorTilt();
        if (typeof initPropertiesParallax === 'function') initPropertiesParallax();
    });

})(window.jQuery);
