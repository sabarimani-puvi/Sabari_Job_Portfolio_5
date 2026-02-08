
// --- LENIS SMOOTH SCROLL SETUP ---
// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

// Mobile optimization (lighter scroll)
if (window.innerWidth < 768) {
    lenis.options.duration = 0.8;
    lenis.options.smoothTouch = true;
}

// INTEGRATE LENIS WITH GSAP SCROLLTRIGGER
// 1. Update ScrollTrigger on Lenis scroll event
lenis.on('scroll', ScrollTrigger.update);

// 2. Add Lenis's requestAnimationFrame to GSAP's ticker
// This ensures they are perfectly synced and don't fight for the main thread
gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // lenis requires time in milliseconds
});

// 3. Disable GSAP's internal lag smoothing to prevent jumpiness during heavy scrolls
gsap.ticker.lagSmoothing(0);


// --- GSAP ANIMATIONS ---
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // Helper for mobile responsive values
    const isMobile = window.innerWidth <= 768;

    // 1. Headings / Titles
    // opacity: 0 -> 1, y: 40 -> 0 (mobile 20), duration 1s, ease: power4.out
    const headings = document.querySelectorAll("h1, h2, .title, .toc-title");
    headings.forEach(h => {
        gsap.from(h, {
            scrollTrigger: {
                trigger: h,
                start: "top 90%", // Trigger when top of element hits 90% of viewport height
                toggleActions: "play none none none",
                once: true
            },
            y: isMobile ? 20 : 40,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        });
    });

    // 2. Paragraph text
    // opacity: 0 -> 1, y: 25 -> 0 (mobile 15), duration 0.8s
    const paragraphs = document.querySelectorAll("p, .subtitle");
    paragraphs.forEach(p => {
        gsap.from(p, {
            scrollTrigger: {
                trigger: p,
                start: "top 92%",
                toggleActions: "play none none none",
                once: true
            },
            y: isMobile ? 15 : 25,
            opacity: 0,
            duration: 0.8,
            ease: "power4.out"
        });
    });

    // 3. Portfolio cards / grid items (Staggered)
    // opacity: 0 -> 1, y: 50 -> 0 (mobile 25), duration 1s, stagger 0.12s
    const gridContainers = [
        { selector: ".toc-grid", item: ".toc-item" },
        { selector: ".software-grid", item: ".software-item" },
        // Portfolio Grids (using layout-container logic)
        { selector: ".quad-grid", item: ".box" },
        { selector: ".bottom-section", item: ".box" },
        { selector: ".brochure-display-container2", item: ".brochure-img" },
        { selector: ".brochure-display-container1", item: ".brochure-single-image" },
        { selector: ".chure-grid-container", item: ".chure-item-wrapper" },
        // Carousel Items
        { selector: ".caro-main-wrapper", item: ".caro-item-row" },
        // Portfolio standalone boxes (top-section box) - USE SCOPE TO AVOID DOUBLE TARGETING
        { selector: ".top-section", item: ":scope > .box" },

        // MISSING SECTIONS ADDED HERE:
        // Marketing Flyers
        { selector: ".flyer-gallery-grid", item: ".flyer-item" },
        // Digital eBooks
        { selector: ".ebook-grid-wrapper", item: ".ebook-grid-item" },
        // UI Design Assets - Corrected Selector
        { selector: ".ui-masonry-wrapper", item: ".ui-image-card" },
        // Print Collaterals
        { selector: ".print-grid-wrapper", item: ".print-grid-item, .print-left-stack img, .print-center-stack img" }
    ];

    gridContainers.forEach(grid => {
        const container = document.querySelector(grid.selector);
        // Only run if the container exists; some might be multiple or shared
        const containers = document.querySelectorAll(grid.selector);

        containers.forEach(cont => {
            const items = cont.querySelectorAll(grid.item);
            if (items.length > 0) {
                gsap.from(items, {
                    scrollTrigger: {
                        trigger: cont,
                        start: "top 85%",
                        toggleActions: "play none none none",
                        once: true
                    },
                    y: isMobile ? 25 : 50,
                    // opacity: 0, // Removed to ensure visibility
                    duration: 1,
                    stagger: 0.12,
                    ease: "power4.out"
                });
            }
        });
    });

    // Logo Section Specific Animation (With Opacity)
    // We treat this separately to ensure opacity reveal works, as requested "not working".
    const logoColumns = document.querySelectorAll(".logo-portfolio-column");
    if (logoColumns.length > 0) {
        gsap.from(logoColumns, {
            scrollTrigger: {
                trigger: ".logo-portfolio-container",
                start: "top 85%",
                toggleActions: "play none none none",
                once: true
            },
            y: isMobile ? 25 : 50,
            opacity: 0, // Ensure strictly hidden initially
            duration: 1,
            stagger: 0.2, // Slightly slower stagger for logos
            ease: "power4.out"
        });
    }

    // Footer CTA Animation (Impressive Creative Type)
    // Scale up + Slide Up + Fade In with a 'Back' ease for impact
    const ctaBox = document.querySelector(".cta-box");
    if (ctaBox) {
        gsap.from(ctaBox, {
            scrollTrigger: {
                trigger: ctaBox,
                start: "top 85%",
                toggleActions: "play none none none",
                once: true
            },
            y: 60,
            scale: 0.9,
            opacity: 0,
            duration: 1.2,
            ease: "back.out(1.4)" // The "pop" effect
        });
    }

    // 3b. Black Banners & Buttons Animation
    const bannersAndButtons = document.querySelectorAll(".branded-header-section, .section-divider, .btn");
    if (bannersAndButtons.length > 0) {
        bannersAndButtons.forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", // Trigger slightly earlier for banners
                    toggleActions: "play none none none",
                    once: true
                },
                y: isMobile ? 20 : 30, // Slight slide up
                opacity: 0, // Fade in
                duration: 1,
                ease: "power3.out"
            });
        });
    }

    // 4. Images (Simple reveal + small zoom)
    // We target images inside the boxes we just animated.
    // FIX: Removed opacity:0 here because the parent container (.box) is already handling the fade-in.
    // This prevents potential conflicts where the image stays invisible if triggers don't align perfectly.
    // UPDATED SELECTOR FOR NEW SECTIONS
    const revealImages = document.querySelectorAll(`
        .box img, 
        .chure-img, 
        .brochure-img, 
        .brochure-single-image, 
        .caro-img-part img, 
        .card, 
        .logo-portfolio-column img,
        .flyer-item img,
        .ebook-grid-item img,
        .ui-image-card img,
        .print-grid-item img,
        .print-left-stack img,
        .print-center-stack img
    `);

    revealImages.forEach(img => {
        if (isMobile) {
            // Mobile: Simple Slide Up + Fade (No Scaling/Parallax)
            gsap.from(img, {
                scrollTrigger: {
                    trigger: img,
                    start: "top 90%",
                    toggleActions: "play none none none",
                    once: true
                },
                y: 25,
                opacity: 0,
                scale: 1, // Disable zoom
                duration: 0.8,
                stagger: 0.12,
                ease: "power2.out"
            });
        } else {
            // Desktop: Premium Scale Reveal
            gsap.from(img, {
                scrollTrigger: {
                    trigger: img,
                    start: "top 90%",
                    toggleActions: "play none none none",
                    once: true
                },
                scale: 1.08,
                duration: 1.2,
                ease: "power2.out"
            });
        }
    });

    // CRITICAL FIX: Refresh ScrollTrigger when all images are loaded
    // Large images can shift layout, causing triggers to be in the wrong place initiate.
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });

});
