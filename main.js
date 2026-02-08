// Helper to stop media in a container securely without reloading iframes
function stopMediaInContainer(container) {
    if (!container) return;

    // 1. Stop Vimeo/YouTube via PostMessage (prevents heavy reload)
    var iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        if (iframe.contentWindow) {
            // Vimeo / generic pause command
            iframe.contentWindow.postMessage('{"method":"pause"}', '*');
        }
    });

    // 2. Stop HTML5 Videos
    var videos = container.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
    });
}

function openTab(tabName) {
    var motionSection = document.getElementById('motion-section');
    var editingSection = document.getElementById('editing-section');
    var motionTab = document.getElementById('tab-motion');
    var editingTab = document.getElementById('tab-editing');
    var stage = document.getElementById('stage');

    // Stop Phone videos if user switches List tabs
    stopMediaInContainer(stage);

    if (tabName === 'motion') {
        motionSection.classList.remove('hidden-section');
        motionSection.classList.add('active-section');
        editingSection.classList.remove('active-section');
        editingSection.classList.add('hidden-section');

        stopMediaInContainer(editingSection);

        motionTab.classList.add('active');
        motionTab.classList.remove('inactive');
        editingTab.classList.add('inactive');
        editingTab.classList.remove('active');
    } else {
        editingSection.classList.remove('hidden-section');
        editingSection.classList.add('active-section');
        motionSection.classList.remove('active-section');
        motionSection.classList.add('hidden-section');

        stopMediaInContainer(motionSection);

        editingTab.classList.add('active');
        editingTab.classList.remove('inactive');
        motionTab.classList.add('inactive');
        motionTab.classList.remove('active');
    }
}

// Scroll Button Logic
function scrollCarousel(direction) {
    // 1. Find which section is currently active
    var activeContainer = document.querySelector('.carousel-container.active-section');

    if (activeContainer) {
        // 2. Calculate scroll amount (approx width of one card + gap)
        // We can get exact width of the first card dynamically
        var card = activeContainer.querySelector('.video-card');
        var scrollAmount = card.offsetWidth + 40; // width + gap (40px defined in CSS)

        // 3. Scroll Left (-1) or Right (1)
        if (direction === 1) {
            activeContainer.scrollLeft += scrollAmount;
        } else {
            activeContainer.scrollLeft -= scrollAmount;
        }
    }
}






















// --- DATA ---
const data = {
    motion: [

        { title: "Ultimate Vehicle Protection", tag: "Wentworth", bg: "Images/video-thumb-wentworth.png", video: "https://player.vimeo.com/video/1151190493", hideText: true },

        // New items
        { title: "Motion Project 4", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1151190720", hideText: true },
        { title: "Motion Project 5", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279493", hideText: true },
        { title: "Motion Project 6", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279686", hideText: true },
        { title: "Motion Project 7", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279848", hideText: true },
        { title: "Motion Project 8", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1151190611", hideText: true },
        { title: "Motion Project 9", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1151190648", hideText: true },
        { title: "Motion Project 10", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1151190450", hideText: true },
        { title: "Motion Project 11", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1151190552", hideText: true },
        { title: "Motion Project 12", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101278368", hideText: true },
        { title: "Motion Project 13", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279459", hideText: true },
        { title: "Motion Project 14", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279529", hideText: true },
        { title: "Motion Project 15", tag: "Motion", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279657", hideText: true }
    ],
    editing: [

        // New items
        { title: "Video Edit 1", tag: "Reel", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1130993986", hideText: true },
        { title: "Video Edit 2", tag: "Reel", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1101279627", hideText: true },
        { title: "Video Edit 3", tag: "Reel", bg: "Images/radial.png", video: "https://player.vimeo.com/video/1155524407", hideText: true }
    ]
};

let currentCategory = 'motion';
let activeIndex = 1; // Start in middle

let cardElements = []; // Dynamic
const stage = document.getElementById('stage');

// --- INIT ---
initCarousel();

function initCarousel() {
    // Generate DOM elements primarily
    stage.innerHTML = ''; // Clear stage
    const items = data[currentCategory];

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'mango';
        card.id = `card-${index}`;
        card.onclick = () => handleClick(index);

        card.innerHTML = `
            <div class="phone-wrapper">
                <div class="phone-screen"></div>
            </div>
        `;
        stage.appendChild(card);
    });

    cardElements = Array.from(stage.querySelectorAll('.mango'));
    updateContent();
    updatePositions();
}


// --- LOGIC: RENDER ---
function updateContent() {
    const items = data[currentCategory];
    cardElements.forEach((card, index) => {
        const item = items[index];
        const screen = card.querySelector('.phone-screen');

        // Determine if it is Vimeo or standard video
        let mediaHtml = '';
        if (item.video.includes('vimeo')) {
            // scale significantly to ensure full height coverage (320x600 phone vs 9:16 video)
            // AUTO-PLAY OPTIMIZATION: Prepare with api=1 and player_id
            const uniqueId = `vimeo-player-${index}`;
            // We load it paused but ready (autopause=0 allows controlling multiple manually)
            const vimeoUrl = `${item.video}?api=1&player_id=${uniqueId}&title=0&byline=0&portrait=0&playsinline=0&autopause=0`;

            // Set opacity:0 instead of display:none to allow buffering in background
            mediaHtml = `<iframe id="${uniqueId}" src="${vimeoUrl}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" style="position:absolute; top:50%; left:50%; transform: translate(-50%, -50%) scale(1.15); width: 100%; height: 100%; opacity: 0; pointer-events: none; transition: opacity 0.2s;"></iframe>`;

            // Fetch Vimeo Thumbnail
            if (item.video.includes('player.vimeo.com/video/')) {
                const videoId = item.video.split('video/')[1].split('?')[0];
                fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.thumbnail_url) {
                            screen.style.backgroundImage = `url('${data.thumbnail_url}')`;
                        }
                    })
                    .catch(err => console.log('Vimeo thumb fetch error:', err));
            }
        } else {
            mediaHtml = `<video src="${item.video}" style="display:none;"></video>`;
        }

        const overlayStyle = item.hideText ? 'display: none;' : '';

        screen.innerHTML = `
            ${mediaHtml}
            <div class="swipe-overlay"></div>
            <div class="close-video" onclick="stopVideo(event, this)">✕</div>
            
            <!-- FULLSCREEN BUTTON (Mobile Only via CSS) -->
            <div class="fullscreen-btn" onclick="toggleFullscreen(event, this)">
                <i class="fas fa-expand"></i>
            </div>

            <!-- FULLSCREEN NAV BUTTONS -->
            <div class="fs-nav fs-prev" onclick="stopVideo(event, this); prevCard()">
                <i class="fas fa-chevron-left"></i>
            </div>
            <div class="fs-nav fs-next" onclick="stopVideo(event, this); nextCard()">
                <i class="fas fa-chevron-right"></i>
            </div>

            <div class="overlay-ui" style="${overlayStyle}">
                <div class="tag">${item.tag}</div>
                <div class="title">${item.title}</div>
            </div>
            <div class="play-btn" onclick="playVideo(event, this)"></div>
        `;
        screen.style.backgroundImage = `url('${item.bg}')`;
    });
}

// --- LOGIC: POSITION ENGINE ---
// --- LOGIC: POSITION ENGINE ---
function updatePositions() {
    const total = cardElements.length;
    cardElements.forEach((card, index) => {
        let pos = (index - activeIndex);

        // Handle wrapping for large datasets
        while (pos < -Math.floor(total / 2)) pos += total;
        while (pos > Math.floor(total / 2)) pos -= total;

        card.setAttribute('data-pos', pos);

        // Stop video if sliding away
        if (pos !== 0) {
            resetCardUI(card);

            // PRELOAD NEIGHBORS (Pos 1 and -1)
            // Ensure they are "wake" but hidden/paused to buffer
            const iframe = card.querySelector('iframe');
            if (Math.abs(pos) === 1 && iframe) {
                iframe.style.pointerEvents = "none";
                // Opacity is 0 from resetCardUI, but display is block (inherent from iframe tag style we set)
            }
        } else {
            // Autoplay active card if Stage is in view
            // if (window.isStageInView) {
            //     playCardInternal(card);
            // }
        }
    });
}

// --- VISIBILITY OBSERVER ---
// Track if the stage is currently visible in the viewport
window.isStageInView = false;
document.addEventListener("DOMContentLoaded", () => {
    const stageElement = document.getElementById('stage');
    if (stageElement) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                window.isStageInView = entry.isIntersecting;

                if (window.isStageInView) {
                    // Resumed view: Play active card
                    // const activeCard = document.querySelector('.mango[data-pos="0"]');
                    // if (activeCard) playCardInternal(activeCard);
                } else {
                    // Left view: Stop all
                    stopMediaInContainer(stageElement);
                    // Also reset UI overlays
                    const allCards = stageElement.querySelectorAll('.mango');
                    allCards.forEach(card => resetCardUI(card));
                }
            });
        }, { threshold: 0.6 }); // 60% visibility required
        observer.observe(stageElement);
    }
});

// --- NAVIGATION ACTIONS ---
function nextCard() {
    activeIndex = (activeIndex + 1) % cardElements.length;
    updatePositions();
}

function prevCard() {
    activeIndex = (activeIndex - 1 + cardElements.length) % cardElements.length;
    updatePositions();
}

function handleClick(index) {
    if (activeIndex === index) return;
    activeIndex = index;
    updatePositions();
}

function switchTab(cat, btn) {
    if (currentCategory === cat) return;

    // Stop videos in List sections
    stopMediaInContainer(document.getElementById('motion-section'));
    stopMediaInContainer(document.getElementById('editing-section'));


    // Tab UI - Scope to the current tab group only
    btn.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // Fade Animation
    stage.style.opacity = '0';
    setTimeout(() => {
        currentCategory = cat;
        activeIndex = 1;
        // Stop any playing videos in the stage only
        stage.querySelectorAll('video').forEach(v => { v.pause(); v.currentTime = 0; });
        stage.querySelectorAll('iframe').forEach(i => { i.src = i.src.replace('&autoplay=1', ''); i.style.display = 'none'; });

        initCarousel(); // Re-init DOM for new category length
        stage.style.opacity = '1';
    }, 400);
}

// --- VIDEO PLAYER (Internal Helper) ---
// --- VIDEO PLAYER (Internal Helper) ---
function playCardInternal(card) {
    if (!card) return;

    const screen = card.querySelector('.phone-screen');
    if (!screen) return;

    const video = screen.querySelector('video');
    const iframe = screen.querySelector('iframe');
    const overlay = screen.querySelector('.overlay-ui');
    const close = screen.querySelector('.close-video');
    const playBtn = card.querySelector('.play-btn');

    // Stop others just in case (though updatePositions handles it mostly)
    // stopMediaInContainer logic for other sections is fine here
    stopMediaInContainer(document.getElementById('motion-section'));
    stopMediaInContainer(document.getElementById('editing-section'));

    if (video) {
        video.style.display = 'block';
        if (video.paused) {
            video.play().catch(e => console.log("Autoplay blocked", e));
        }
    } else if (iframe) {
        // INSTANT PLAY via Message
        // Ensure it is visible
        iframe.style.opacity = '1';
        iframe.style.pointerEvents = "auto";
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage('{"method":"play"}', '*');
        }
    }

    if (overlay) overlay.style.opacity = '0';
    if (playBtn) playBtn.style.transform = 'translate(-50%, -50%) scale(0)';
    if (close) close.style.display = 'flex';
}

// --- VIDEO PLAYER (Public Event Handler) ---
function playVideo(e, btn) {
    const card = btn.closest('.mango');
    const index = parseInt(card.id.split('-')[1]);

    // If not valid active card, let it bubble to handleClick to just center it
    if (index !== activeIndex) return;

    e.stopPropagation();
    playCardInternal(card);
}

function stopVideo(e, btn) {
    e.stopPropagation();
    const screen = btn.parentElement;
    resetCardUI(screen.closest('.mango'));
}

function toggleFullscreen(e, btn) {
    e.stopPropagation();
    // We create a Fullscreen experience on the STAGE or BODY
    // But to keep the slider logic, we best fullscreen the #stage 
    const stage = document.getElementById('stage');

    if (!document.fullscreenElement) {
        if (stage.requestFullscreen) {
            stage.requestFullscreen();
        } else if (stage.webkitRequestFullscreen) { /* Safari */
            stage.webkitRequestFullscreen();
        } else if (stage.msRequestFullscreen) { /* IE11 */
            stage.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function resetCardUI(card) {
    const video = card.querySelector('video');
    const iframe = card.querySelector('iframe');
    const overlay = card.querySelector('.overlay-ui');
    const playBtn = card.querySelector('.play-btn');
    const close = card.querySelector('.close-video');

    if (video) {
        video.pause();
        video.currentTime = 0;
        setTimeout(() => { video.style.display = 'none'; }, 200);
    }
    if (iframe) {
        // INSTANT PAUSE via Message
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage('{"method":"pause"}', '*');
        }

        // Hide visually but keep loaded
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = "none";
    }

    if (overlay) overlay.style.opacity = '1';
    if (playBtn) playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
    if (close) close.style.display = 'none';
}

// --- SWIPE SUPPORT ---
let startX = 0;
let isDragging = false;
stage.addEventListener('mousedown', (e) => { startX = e.clientX; isDragging = true; });
stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; });

const handleSwipe = (endX) => {
    if (!isDragging) return;
    if (Math.abs(startX - endX) > 50) {
        if (startX - endX > 0) nextCard();
        else prevCard();
        isDragging = false;
    }
};

window.addEventListener('mouseup', (e) => { if (isDragging) { handleSwipe(e.clientX); isDragging = false; } });
window.addEventListener('touchend', (e) => { if (isDragging) { handleSwipe(e.changedTouches[0].clientX); isDragging = false; } });








// --- MODAL LOGIC ---
function setupModals() {
    const modal = document.getElementById('casestudy-modal');
    const closeBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');

    // DEFINE YOUR POPUP CONTENT HERE
    const projectContent = {
        // Social Media Creatives / UI
        "Adalyze": {
            title: "Adalyze",
            text: `<b>Project Type:</b> Initial Social Media Creatives<br><br>
<b>Problem:</b><br>
As a newly launched AI analytics platform, Adalyze needed clear and consistent social media creatives to introduce the product and communicate its value effectively to the audience.<br><br>
<b>Solution:</b><br>
Designed the initial set of social media creatives focused on clarity, brand consistency, and engagement. Simplified complex AI concepts into easy-to-understand visuals using bold typography, structured layouts, and UI-inspired elements, while creating promotional and educational creatives to establish a strong visual foundation for the brand.`
        },
        "Suggesto": {
            title: "Suggesto",
            text: `<b>Project Type:</b> Social Media Creatives<br><br>
<b>Problem:</b><br>
As a newly launched AI-powered movie recommendation app, Suggesto needed engaging social media creatives to clearly communicate its features and help users quickly understand how the app improves their movie-watching decisions.<br><br>
<b>Solution:</b><br>
Designed the initial set of social media creatives focused on clarity, engagement, and brand consistency. Visualized AI-driven recommendations using bold typography, vibrant layouts, and app-focused visuals, while creating promotional and feature-based creatives to establish a strong and recognizable social media presence.`
        },

        // Brand Brochures / Print
        "Red Hawk": {
            title: "Red Hawk",
            text: `<b>Project Type:</b> Corporate Brochure Design<br><br>
Designed a corporate brochure for Red Hawk, an end-to-end event production company, with a focus on presenting their services, process, and brand identity in a clear and professional format. The design approach emphasized clean layouts, strong visual hierarchy, and consistent brand colors to ensure easy readability and a premium corporate feel. Structured content to clearly showcase company overview, service offerings, and workflow while maintaining a cohesive and trustworthy brand presence.`
        },
        "Techades": {
            title: "Techades",
            text: `<b>Focus:</b> Information clarity & tech storytelling<br><br>
Designed a multi-page corporate brochure for a technology solutions company to communicate complex services in a clear and organized way. Focused on clean layouts, modular sections, and tech-inspired visuals to make information easy to scan while maintaining a modern and consistent brand identity.`
        },
        "Ahara": {
            title: "Ahara",
            text: `<b>Focus:</b> Educational clarity & visual calm<br><br>
Designed an educational nutrition booklet for a holistic wellness brand, focusing on clear content structure and easy readability. Used soft color palettes, balanced layouts, and supportive food imagery to simplify health information while maintaining a calm and trustworthy brand tone.`
        },
        "Peppel": {
            title: "Peppel",
            text: `<b>Focus:</b> User safety & visual hierarchy<br><br>
Designed safety-oriented print materials for Peppel’s industrial ladder products. The project focused on clearly communicating usage guidelines, warnings, and compliance information through a distinct visual hierarchy to ensure user safety and adherence to standards.`
        },

        // Logos
        "SpotmyPG": {
            title: "SpotmyPG",
            text: `<b>Focus:</b> Brand clarity & trust<br><br>
Developed a clean and reliable logo identity for a real estate accommodation platform, emphasizing simplicity and trust. The visual system uses minimal forms and a clear color palette to create a recognizable brand presence across digital and physical touchpoints.`
        },
        "Bitberry": {
            title: "Bitberry",
            text: `<b>Focus:</b> Modern tech identity & scalability<br><br>
Created a modern logo and visual identity for a technology and software brand, focusing on scalability and digital adaptability. Bold colors, clean geometry, and flexible logo variations were used to maintain consistency across products and platforms.`
        },
        "AYBA": {
            title: "AYBA",
            text: `<b>Focus:</b> Brand personality & product appeal<br><br>
Crafted a warm and approachable logo identity for a nourishing foods brand, highlighting freshness and authenticity. Organic shapes, earthy tones, and expressive typography were used to build strong product recognition and emotional connection.`
        },

        // Fallback
        "Default": {
            title: "Project Details",
            text: "More details about this project will be updated soon."
        }
    };

    function openModal(title, text) {
        modalTitle.innerText = title;
        modalText.innerHTML = text;

        // Ensure visible first (display: flex handled by class, but we need GSAP set)
        modal.classList.add('active');

        // creative GSAP animation
        // 1. Overlay Fade In
        gsap.fromTo(modal,
            { backgroundColor: "rgba(0, 0, 0, 0)" },
            { backgroundColor: "rgba(0, 0, 0, 0.8)", duration: 0.3 }
        );

        // 2. Content Pop Up (Elastic)
        const content = modal.querySelector('.modal-content');
        gsap.fromTo(content,
            {
                scale: 0.6,
                opacity: 0,
                y: 50,
                rotationX: 10
            },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.6,
                ease: "back.out(1.7)"
            }
        );
    }

    function closeModal() {
        const content = modal.querySelector('.modal-content');
        // Animate Out
        gsap.to(content, {
            scale: 0.8,
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: "power2.in"
        });

        gsap.to(modal, {
            backgroundColor: "rgba(0, 0, 0, 0)",
            duration: 0.3,
            delay: 0.1,
            onComplete: () => {
                modal.classList.remove('active');
                // Cleanup inline styles from GSAP to reset for next open
                gsap.set(modal, { clearProps: "all" });
                gsap.set(content, { clearProps: "all" });
            }
        });
    }

    if (closeBtn) {
        closeBtn.onclick = function () {
            closeModal();
        }
    }

    if (modal) {
        window.onclick = function (event) {
            if (event.target == modal) {
                closeModal();
            }
        }
    }

    // Helper to find project title from button context
    function getProjectTitle(btn) {
        let title = "";

        // 1. Try finding nearest header parent (for Section Headers)
        let parentHeader = btn.closest('.header') || btn.closest('section.header') || btn.closest('header.print-header');
        if (parentHeader) {
            let h1 = parentHeader.querySelector('h1');
            if (h1) title = h1.innerText.trim();
        }

        // 2. Try finding nearest portfolio item parent (for Logo Grid)
        if (!title) {
            let parentItem = btn.closest('.portfolio-content');
            if (parentItem) {
                let h3 = parentItem.querySelector('h3.portfolio-title');
                if (h3) title = h3.innerText.trim();
            }
        }

        return title;
    }

    // Attach click event to all "View Casestudy" buttons
    const allButtons = document.querySelectorAll('.btn, .case-study-btn');

    allButtons.forEach(btn => {
        // Check if it's a case study button
        const isCaseStudyBtn = btn.innerText.toLowerCase().includes('view casestudy') ||
            btn.classList.contains('case-study-btn');

        if (isCaseStudyBtn) {
            btn.onclick = function (e) {
                if (btn.tagName === 'A') e.preventDefault();

                let foundTitle = getProjectTitle(btn);
                let content = projectContent[foundTitle];

                if (content) {
                    openModal(content.title, content.text);
                } else {
                    // Fallback if title not found
                    openModal(foundTitle || projectContent["Default"].title, projectContent["Default"].text);
                }
            }
        }
    });

    // Disclaimer Popup Logic
    const disclaimerLink = document.getElementById('disclaimer-link');
    const disclaimerText = "This website is a personal portfolio created to showcase my skills, experience, and selected works. Some projects displayed are client work and are shown strictly for presentation and showcase purposes only. All rights to the designs, visuals, and brand assets belong to their respective owners. These works must not be copied, reused, redistributed, or used for commercial purposes under any circumstances. Any unauthorized use is strictly prohibited.";

    if (disclaimerLink) {
        disclaimerLink.addEventListener('click', function (e) {
            e.preventDefault();
            openModal("Portfolio Disclaimer", disclaimerText);
        });
    }

    // Privacy Policy Popup Logic
    const privacyLink = document.getElementById('privacy-link');
    const privacyText = "This website is a personal portfolio created to present my work, skills, and professional experience. No personal data is collected or stored through this website. If you choose to reach out via email or external platforms, your information is used only for direct professional communication. Any third-party links included on this site operate under their own privacy policies.";

    if (privacyLink) {
        privacyLink.addEventListener('click', function (e) {
            e.preventDefault();
            openModal("Privacy Policy", privacyText);
        });
    }

    // Terms of Use Popup Logic
    const termsLink = document.getElementById('terms-link');
    const termsText = "Accessing and using this website constitutes acceptance of these terms. All content, including design, code, and visuals, is the intellectual property of Sabarimani Puvi unless stated otherwise. This site is for personal portfolio and showcase purposes only. Unauthorized reproduction, distribution, or commercial use of any content is strictly prohibited. The website is provided 'as is' without warranties of any kind.";

    if (termsLink) {
        termsLink.addEventListener('click', function (e) {
            e.preventDefault();
            openModal("Terms of Use", termsText);
        });
    }

    // --- MOBILE MENU LOGIC (Premium 3D Flip Animation) ---
    const hamburger = document.querySelector('.hamburger');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenu = document.querySelector('.close-menu');
    const menuLinks = document.querySelectorAll('.mobile-nav a');
    const menuContainer = document.querySelector('.mobile-nav'); // The container to flip

    if (hamburger && menuOverlay && menuContainer) {
        // OPEN ANIMATION
        hamburger.addEventListener('click', () => {
            menuOverlay.classList.add('active'); // Ensure visiblity first

            const isMobile = window.innerWidth < 768;
            const rotateVal = isMobile ? 5 : 8;
            const yStart = 20;

            // Set Initial State for 3D
            gsap.set(menuOverlay, { opacity: 0 });
            gsap.set(menuContainer, {
                transformPerspective: 1200,
                transformOrigin: "top center",
                rotationX: rotateVal,
                y: yStart,
                scale: 0.98,
                opacity: 0
            });
            gsap.set(menuLinks, { opacity: 0, y: 25 });

            const tl = gsap.timeline();

            // 1. Overlay Fade In
            tl.to(menuOverlay, {
                opacity: 1,
                duration: 0.35
            })
                // 2. Container 3D Flip In
                .to(menuContainer, {
                    rotationX: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    duration: 0.75,
                    ease: "power4.out"
                }, "-=0.2") // Overlap slightly
                // 3. Links Stagger In
                .to(menuLinks, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: "power4.out"
                }, "-=0.5");
        });
    }

    function closeMobileMenu(e) {
        if (e) e.preventDefault();

        const isMobile = window.innerWidth < 768;
        const rotateVal = isMobile ? 5 : 8;

        const tl = gsap.timeline({
            onComplete: () => {
                menuOverlay.classList.remove('active');
                // Reset styles to avoid conflicts if reopened quickly without GSAP reset
                gsap.set(menuOverlay, { clearProps: "all" });
                gsap.set(menuContainer, { clearProps: "all" });
                gsap.set(menuLinks, { clearProps: "all" });
            }
        });

        // 1. Links Out (Reverse Stagger)
        // Convert NodeList to Array and reverse for "reverse order" staggering
        const linksReversed = Array.from(menuLinks).reverse();

        tl.to(linksReversed, {
            opacity: 0,
            y: -15,
            duration: 0.35,
            stagger: 0.06,
            ease: "power3.in"
        })
            // 2. Container Exit (Tilt Back)
            .to(menuContainer, {
                rotationX: rotateVal, // Tilt back
                y: -15,
                scale: 0.98,
                opacity: 0,
                transformPerspective: 1200, // Ensure perspective persists
                transformOrigin: "top center",
                duration: 0.55,
                ease: "power4.inOut"
            }, "-=0.1")
            // 3. Overlay Fade Out
            .to(menuOverlay, {
                opacity: 0,
                duration: 0.25
            }, "-=0.3");
    }

    if (closeMenu && menuOverlay) {
        closeMenu.addEventListener('click', closeMobileMenu);
    }

    // Close menu when a link is clicked
    // Close menu when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // 1. External Links (e.g. Resume) - Allow default behavior (new tab), just close menu
            if (href.includes('http') || !href.startsWith('#')) {
                // Call closeMobileMenu WITHOUT the event object so it doesn't preventDefault()
                closeMobileMenu();
                return;
            }

            // 2. Internal Anchors - Prevent default, close menu, then scroll
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Close the menu first
                closeMobileMenu();

                // Wait slightly for the menu close animation to play out, then scroll
                setTimeout(() => {
                    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
                        window.lenis.scrollTo(targetElement, { offset: 0, duration: 1.5 });
                    } else {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 600); // 600ms match duration of menu exit animation
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', setupModals);
// Also run immediately if loaded late
setupModals();

// --- INTRO LOADER LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    // Check if the loader element exists
    const loader = document.getElementById("intro-loader");
    if (loader) {
        // Wait for animations to finish (approx 3.5s total)
        setTimeout(() => {
            loader.classList.add("hidden"); // Slide loader UP
            document.body.classList.add("loaded"); // Trigger content slide UP from bottom
        }, 3500);
    }
});

// --- AUTO-PLAY PORTFOLIO VIDEOS (Desktop & Mobile) ---
// --- SCROLL-BASED VIDEO CONTROL (Play with Audio / Pause on Scroll) ---
// --- SCROLL-BASED VIDEO CONTROL (Play with Audio / Pause on Scroll) ---
function enableScrollVideoControl() {
    // Select all vimeo iframes specifically
    const frames = document.querySelectorAll('iframe[src*="vimeo"]');

    // 1. Initialize Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const iframe = entry.target;

            if (entry.isIntersecting) {
                // FORCE AUDIO ON + PLAY - DISABLED PER REQUEST
                // 1. Send Immediately
                // iframe.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*');
                // iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');

                // 2. Retry fast for reliability
                // let attempts = 0;
                // const interval = setInterval(() => {
                //    iframe.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*');
                //    iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
                //    attempts++;
                //    if (attempts > 3) clearInterval(interval);
                // }, 250);
            } else {
                // Pause when hidden
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
            }
        });
    }, {
        threshold: 0.15 // Trigger very fast (when 15% visible)
    });

    // 2. Setup Iframes
    frames.forEach((frame, index) => {
        let src = frame.getAttribute('src');

        // Add API parameter and unique player_id to enable robust postMessage control
        if (src && !src.includes('api=1')) {
            const connector = src.includes('?') ? '&' : '?';
            const playerId = `vimeoplayer_${index}`;
            // Use playsinline=1 heavily for mobile speed
            const newSrc = `${src}${connector}api=1&player_id=${playerId}&autoplay=0&muted=0&loop=1&playsinline=1`;

            frame.setAttribute('id', playerId);
            frame.setAttribute('src', newSrc);

            let allow = frame.getAttribute('allow') || "";
            if (!allow.includes('autoplay')) allow += "; autoplay";
            frame.setAttribute('allow', allow);

            observer.observe(frame);
        }
    });
}

// Global Interaction Listener to 'unlock' audio context permission
document.addEventListener('click', () => { }, { once: true });

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Start almost immediately
    setTimeout(enableScrollVideoControl, 100);
});

