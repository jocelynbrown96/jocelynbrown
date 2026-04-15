document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    /* -------------------------------------------------------
       ELEMENTS
    ------------------------------------------------------- */
    const introOverlay = document.getElementById("intro-overlay");
    const transformBtn = document.getElementById("transform-btn");

    const angelSong = document.getElementById("angelSong");
    const devilSong = document.getElementById("devilSong");

    const modeToggle = document.getElementById("mode-toggle");

    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");

    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const isMobile = window.innerWidth < 768;

    /* -------------------------------------------------------
       CANVAS SETUP
    ------------------------------------------------------- */
    let width, height;
    let hearts = [];
    let glitterParticles = [];
    let glitterActive = false;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Throttled resize for performance
    let resizeTimeout = null;
    window.addEventListener("resize", () => {
        if (resizeTimeout) return;
        resizeTimeout = setTimeout(() => {
            resizeTimeout = null;
            resizeCanvas();
            initHearts();
        }, 150);
    });

    resizeCanvas();

    /* -------------------------------------------------------
       BACKGROUND FLOATING HEARTS
    ------------------------------------------------------- */
    function initHearts() {
        hearts = [];
        const count = isMobile ? 30 : 60;
        for (let i = 0; i < count; i++) {
            hearts.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 6 + 4,
                speed: Math.random() * 0.3 + 0.1,
            });
        }
    }

    initHearts();

    /* -------------------------------------------------------
       GLITTER STORM (MIXED PARTICLES)
    ------------------------------------------------------- */
    function triggerGlitterStorm() {
        glitterActive = true;
        glitterParticles = [];

        const count = isMobile ? 160 : 350; // fewer on mobile
        for (let i = 0; i < count; i++) {
            const shape = ["circle", "star", "heart"][Math.floor(Math.random() * 3)];
            const color =
                Math.random() < 0.5
                    ? "rgba(255,154,213,0.9)"   // pink
                    : "rgba(179,124,255,0.9)";  // purple

            glitterParticles.push({
                x: width / 2,
                y: height / 2,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.5) * 14,
                size: Math.random() * 6 + 3,
                shape,
                color,
                life: Math.random() * 40 + 40,
            });
        }

        setTimeout(() => {
            glitterActive = false;

            if (introOverlay) {
                introOverlay.classList.add("hidden");
                // Let CSS handle display/opacity/pointer-events
            }

            switchToAngel(); // Start in Angel Mode
        }, 1000);
    }

    function drawGlitterParticle(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.shape === "star") {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(
                    Math.cos((18 + i * 72) * Math.PI / 180) * p.size,
                    -Math.sin((18 + i * 72) * Math.PI / 180) * p.size
                );
                ctx.lineTo(
                    Math.cos((54 + i * 72) * Math.PI / 180) * (p.size / 2),
                    -Math.sin((54 + i * 72) * Math.PI / 180) * (p.size / 2)
                );
            }
            ctx.closePath();
            ctx.fill();
        } else if (p.shape === "heart") {
            ctx.beginPath();
            const s = p.size / 2;
            ctx.moveTo(0, s);
            ctx.bezierCurveTo(s, s, s, -s / 2, 0, -s);
            ctx.bezierCurveTo(-s, -s / 2, -s, s, 0, s);
            ctx.fill();
        }

        ctx.restore();
    }

    /* -------------------------------------------------------
       MAIN DRAW LOOP
    ------------------------------------------------------- */
    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Background hearts
        const isAngel = body.classList.contains("world-angel");
        const heartColor = isAngel
            ? "rgba(255,154,213,0.7)"
            : "rgba(179,124,255,0.8)";

        ctx.fillStyle = heartColor;
        hearts.forEach((h) => {
            h.y -= h.speed;
            if (h.y < -10) h.y = height + 10;

            ctx.beginPath();
            ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Glitter storm
        if (glitterActive) {
            glitterParticles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 1;
                drawGlitterParticle(p);
            });
            glitterParticles = glitterParticles.filter((p) => p.life > 0);
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    /* -------------------------------------------------------
       AUDIO HELPERS
    ------------------------------------------------------- */
    function stopAudio(audio) {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    }

    function playAudio(audio) {
        if (!audio) return;
        audio.volume = 0.8;
        audio.play().catch(() => {});
    }

    function switchToAngel() {
        body.classList.add("world-angel");
        body.classList.remove("world-devil");
        stopAudio(devilSong);
        playAudio(angelSong);
    }

    function switchToDevil() {
        body.classList.add("world-devil");
        body.classList.remove("world-angel");
        stopAudio(angelSong);
        playAudio(devilSong);
    }

    /* -------------------------------------------------------
       TRANSFORM BUTTON
    ------------------------------------------------------- */
    if (transformBtn) {
        transformBtn.addEventListener("click", () => {
            triggerGlitterStorm();
        }, { passive: true });
    }

    /* -------------------------------------------------------
       MODE TOGGLE
    ------------------------------------------------------- */
    if (modeToggle) {
        modeToggle.addEventListener("click", () => {
            const isAngel = body.classList.contains("world-angel");
            if (isAngel) {
                switchToDevil();
            } else {
                switchToAngel();
            }
        });
    }

    /* -------------------------------------------------------
       SMOOTH SCROLL NAV
    ------------------------------------------------------- */
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
});


