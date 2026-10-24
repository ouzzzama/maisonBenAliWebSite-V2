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

    ScrollSmoother.create({
    smooth: 1,
    effects: true,
        smoothTouch: 0.1,
    });

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

        // Pin 120px below viewport top so the sticky navbar (~96px) does not hide the cards or title when scrolling up
        let pinTopOffset = 120;

        let cards = gsap.utils.toArray(".renvia-proiect-list .renvia-project-item");
        if (!cards.length) return;

        let stickDistance = 530;
        let lastCardST = ScrollTrigger.create({
            trigger: cards[cards.length - 1],
            start: "bottom bottom",
            markers: false
        });

        ScrollTrigger.create({
            trigger: ".renvia-project_one .renvia-content-box",
            start: "top " + pinTopOffset + "px",
            end: () => lastCardST.start + stickDistance,
            pin: ".renvia-project_one .renvia-content-box",
            pinSpacing: false,
            markers: false
        });

        cards.forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top " + pinTopOffset + "px",
                end: () => lastCardST.start + stickDistance,
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
    
    if ($('select').length){
        $('select').niceSelect();
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

    // Document Ready

    $(function() {
        mainMenu();
        offCanvas();
        initOffcanvasPanel();
        dynamicBackground();
        initFeaturedArch();
        initMinimalistFooterReveal();
    });

})(window.jQuery);
