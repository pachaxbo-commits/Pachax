/* =============================================== */
/* PACHAX — Interactions & Animations               */
/* =============================================== */

(function() {
    'use strict';

    // ── Header scroll behavior ──
    const header = document.getElementById('header');
    let lastScroll = 0;

    function handleHeaderScroll() {
        const scrollY = window.scrollY;
        header.classList.toggle('header--scrolled', scrollY > 60);
        lastScroll = scrollY;
    }

    // ── Mobile menu ──
    const burger = document.getElementById('burger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    function toggleMobileNav() {
        const isOpen = mobileNav.classList.toggle('active');
        burger.classList.toggle('active');
        burger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    burger.addEventListener('click', toggleMobileNav);

    // Close mobile nav on link click
    document.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) toggleMobileNav();
        });
    });

    // ── Smooth scroll for nav links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── Intersection Observer for scroll reveals ──
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── Animated counters ──
    let countersAnimated = false;
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
                animateBars();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const resultsSection = document.getElementById('resultados');
    if (resultsSection) counterObserver.observe(resultsSection);

    function animateCounters() {
        document.querySelectorAll('.counter').forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
                counter.textContent = Math.floor(target * eased);
                if (progress < 1) requestAnimationFrame(update);
                else counter.textContent = target;
            }

            requestAnimationFrame(update);
        });
    }

    function animateBars() {
        document.querySelectorAll('.result-card__bar-fill').forEach(bar => {
            setTimeout(() => bar.classList.add('animated'), 400);
        });
    }

    // ── Hero canvas — abstract gradient mesh animation ──
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h;
        let particles = [];
        let animId;
        const PARTICLE_COUNT = 50;

        function resize() {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.3 + 0.05,
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, w, h);

            // Connection lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        const alpha = (1 - dist / 200) * 0.06;
                        ctx.strokeStyle = `rgba(0,102,255,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,150,255,${p.opacity})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(drawParticles);
        }

        // Reduce motion preference
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
            resize();
            createParticles();
            drawParticles();
            window.addEventListener('resize', () => {
                resize();
                createParticles();
            });
        }
    }

    // ── Scroll listener (throttled) ──
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleHeaderScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // ── Initial triggers ──
    handleHeaderScroll();

})();
