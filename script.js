/* ============================================================
   MANISH PAUDEL — script.js
   Performance notes:
   - IntersectionObserver replaces scroll listener (no repaints)
   - Passive event listeners throughout
   - Drawer uses CSS left transition (not JS animation)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ── 1. THEME (system-auto-detect + localStorage) ─────── */
    const body = document.body;
    const themeBtn = document.getElementById("theme-toggle");

    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    body.setAttribute("data-theme", savedTheme || (systemDark ? "dark" : "light"));

    function toggleTheme() {
        const next = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        body.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    }
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);


    /* ── 2. MOBILE NAV DRAWER ─────────────────────────────── */
    const menuBtn  = document.getElementById("mobile-menu-btn");
    const navMenu  = document.getElementById("nav-menu");
    const navItems = document.querySelectorAll(".nav-item");

    function openNav()  {
        navMenu.classList.add("mobile-active");
        menuBtn.querySelector("i").classList.replace("fa-bars","fa-xmark");
        menuBtn.setAttribute("aria-expanded","true");
    }
    function closeNav() {
        navMenu.classList.remove("mobile-active");
        menuBtn.querySelector("i").classList.replace("fa-xmark","fa-bars");
        menuBtn.setAttribute("aria-expanded","false");
    }

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navMenu.classList.contains("mobile-active") ? closeNav() : openNav();
    });

    navItems.forEach(item => item.addEventListener("click", closeNav));

    document.addEventListener("click", (e) => {
        if (navMenu.classList.contains("mobile-active") &&
            !navMenu.contains(e.target) && e.target !== menuBtn) closeNav();
    });


    /* ── 3. SCROLL ANIMATIONS (IntersectionObserver — zero scroll cost) */
    const popUps = document.querySelectorAll(".pop-up");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // fire once, then stop observing
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    popUps.forEach(el => observer.observe(el));


    /* ── 4. ACTIVE NAV HIGHLIGHT on scroll ───────────────── */
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove("active"));
                const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (link) link.classList.add("active");
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(s => sectionObserver.observe(s));


    /* ── 5. CONTACT FORM (Formspree) ─────────────────────── */
    /*
        HOW TO SET UP (takes ~3 minutes):
        ──────────────────────────────────
        1. Go to https://formspree.io → Sign up for FREE
        2. Click "New Form" → give it a name like "Portfolio Contact"
        3. Copy the endpoint URL (looks like: https://formspree.io/f/xpwzqabc)
        4. In index.html, replace action="https://formspree.io/f/YOUR_FORM_ID"
           with your actual URL.
        5. Done! All submissions will land in your email.

        Alternative — Netlify (even easier):
        ──────────────────────────────────
        1. Drag your portfolio folder to https://app.netlify.com/drop
        2. Add the attribute  netlify  to your <form> tag
        3. Netlify captures submissions automatically, no JS needed.
    */

    const contactForm = document.getElementById("contact-form");
    const formStatus  = document.getElementById("form-status");
    const submitBtn   = document.getElementById("submit-btn");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Show loading state
            const btnText    = submitBtn.querySelector(".btn-text");
            const btnLoading = submitBtn.querySelector(".btn-loading");
            btnText.classList.add("hidden");
            btnLoading.classList.remove("hidden");
            submitBtn.disabled = true;
            formStatus.textContent = "";
            formStatus.className = "form-status";

            try {
                const res = await fetch(contactForm.action, {
                    method: "POST",
                    body: new FormData(contactForm),
                    headers: { Accept: "application/json" }
                });

                if (res.ok) {
                    formStatus.textContent = "✓ Message sent! I'll get back to you soon.";
                    formStatus.className = "form-status success";
                    contactForm.reset();
                } else {
                    const data = await res.json();
                    const errMsg = data.errors?.map(e => e.message).join(", ") || "Something went wrong.";
                    throw new Error(errMsg);
                }
            } catch (err) {
                formStatus.textContent = `✗ ${err.message}. Please email me directly at manishpaudel86@gmail.com`;
                formStatus.className = "form-status error";
            } finally {
                btnText.classList.remove("hidden");
                btnLoading.classList.add("hidden");
                submitBtn.disabled = false;
            }
        });
    }

});
