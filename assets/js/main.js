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

    
    //====== Sticky Header 
    
    $(document).ready(function () {
        function initStickyHeader(headerSelector) {
            const header = $(headerSelector);
            $(window).on('scroll', function () {
                const currentScroll = $(this).scrollTop();
                if (currentScroll > 100) {
                    if (!header.hasClass('sticky')) {
                        header.addClass('sticky');
                    }
                } else {
                    if (header.hasClass('sticky')) {
                        header.removeClass('sticky');
                    }
                }
            });
        }
        initStickyHeader('header');
    });

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
			translateYValue = 40,
			delayValue = .2,
			easeType = "power3.out",
			animatedTextElements = document.querySelectorAll('.text-anm');
		animatedTextElements.forEach((element) => {
			let animationSplitText = new SplitText(element, {
				type: "lines, words"
			});
			gsap.from(animationSplitText.words, {
				duration: 1.2,
				delay: delayValue,
				y: translateYValue,
				autoAlpha: 0,
				stagger: staggerAmount,
				ease: easeType,
				scrollTrigger: {
					trigger: element,
					start: "top 90%"
				},
			});
		});
	}

    // ScrollTrigger for Project Section Cards

    $(function () {
        var width = $(window).width();
        if (width <= 991) return;
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
            // Pin the card
            ScrollTrigger.create({
                trigger: card,
                start: "top " + pinTopOffset + "px",
                end: () => lastCardST.start + stickDistance,
                pin: true,
                pinSpacing: false,
                markers: false
            });
            
            // Add a scale down effect as the next card scrolls over it (except for the last card)
            if (index < cards.length - 1) {
                gsap.to(card, {
                    scale: 0.92,
                    opacity: 0.5,
                    ease: "none",
                    scrollTrigger: {
                        trigger: card,
                        start: "top " + pinTopOffset + "px",
                        end: "+=" + stickDistance,
                        scrub: true
                    }
                });
            }
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
        offset: 50,
        duration: 800,
        easing: 'ease-out-cubic',
        once: true
    });

    // Document Ready

    $(function() {
        mainMenu();
        offCanvas();
        initOffcanvasPanel();
        dynamicBackground();
    });

})(window.jQuery);