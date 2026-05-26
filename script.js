/**
 * Octobot Interactive Script
 * Handles: Canvas Particle System, Pupil Tracking, Click Explosion, Intersection Observers, Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. CANVAS PARTICLE SYSTEM (Undersea Bubbles & Cyber Ink)
    // -----------------------------------------------------------------
    const canvas = document.getElementById('bubble-canvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const inkParticles = [];

    // Bubble Class
    class Bubble {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // Start at random height initially
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.radius = Math.random() * 4 + 1;
            this.speed = Math.random() * 1.2 + 0.4;
            this.opacity = Math.random() * 0.25 + 0.05;
            this.wobble = Math.random() * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.005;
        }

        update() {
            this.y -= this.speed;
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.3;

            if (this.y < -10) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 254, ${this.opacity})`;
            ctx.shadowBlur = this.radius > 3 ? 4 : 0;
            ctx.shadowColor = '#00f2fe';
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
        }
    }

    // Ink/Spark Particle Class (Spawned on Click)
    class InkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.radius = Math.random() * 5 + 2;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.gravity = 0.05;
            this.friction = 0.96;
            this.opacity = 1;
            this.fadeSpeed = Math.random() * 0.02 + 0.015;
            this.color = color;
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= this.fadeSpeed;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace('opacity', this.opacity.toFixed(2));
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color.includes('254') ? '#00f2fe' : '#7f00ff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Initialize Bubbles
    const maxBubbles = Math.min(60, Math.floor(width / 25));
    for (let i = 0; i < maxBubbles; i++) {
        particles.push(new Bubble());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw standard bubbles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw click ink particles
        for (let i = inkParticles.length - 1; i >= 0; i--) {
            const p = inkParticles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0) {
                inkParticles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    animate();

    // -----------------------------------------------------------------
    // 2. PUPIL MOUSE-TRACKING
    // -----------------------------------------------------------------
    const pupils = document.querySelectorAll('.pupil');
    const octopusSvg = document.getElementById('interactive-octopus');

    window.addEventListener('mousemove', (e) => {
        pupils.forEach(pupil => {
            // Find center of pupil's parent (the eye) relative to viewport
            const eyeBound = pupil.parentElement.getBoundingClientRect();
            const eyeCenterX = eyeBound.left + eyeBound.width / 2;
            const eyeCenterY = eyeBound.top + eyeBound.height / 2;

            // Calculate angle and distance
            const dx = e.clientX - eyeCenterX;
            const dy = e.clientY - eyeCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Limit movement range of pupil
            const maxLimit = 4; 
            const moveX = (dx / distance) * Math.min(distance * 0.05, maxLimit);
            const moveY = (dy / distance) * Math.min(distance * 0.05, maxLimit);

            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    // Reset pupil position when mouse leaves window
    document.addEventListener('mouseleave', () => {
        pupils.forEach(pupil => {
            pupil.style.transform = 'translate(0px, 0px)';
        });
    });

    // -----------------------------------------------------------------
    // 3. DIGITAL INK EXPLOSION ON CLICK
    // -----------------------------------------------------------------
    const inkColors = [
        'rgba(0, 242, 254, opacity)',  // Cyan
        'rgba(79, 172, 254, opacity)',  // Blue
        'rgba(127, 0, 255, opacity)',  // Purple
        'rgba(255, 0, 127, opacity)'   // Pink
    ];

    octopusSvg.addEventListener('click', (e) => {
        // Find click coordinate
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Visual wiggle feedback on body
        const headGroup = octopusSvg.querySelector('.octopus-body-group');
        headGroup.style.transition = 'none';
        headGroup.style.transform = 'scale(0.9) translateY(5px)';
        
        setTimeout(() => {
            headGroup.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            headGroup.style.transform = '';
        }, 100);

        // Spawn particles
        for (let i = 0; i < 45; i++) {
            const randomColor = inkColors[Math.floor(Math.random() * inkColors.length)];
            inkParticles.push(new InkParticle(clickX, clickY, randomColor));
        }

        // Change mouth shape momentarily to happy/excited
        const mouth = octopusSvg.querySelector('.octo-mouth');
        mouth.setAttribute('d', 'M 190 193 Q 200 205 210 193');
        mouth.style.strokeWidth = '3px';
        
        setTimeout(() => {
            mouth.setAttribute('d', 'M 192 191 Q 200 193 208 191');
            mouth.style.strokeWidth = '2px';
        }, 1500);
    });

    // -----------------------------------------------------------------
    // 4. NAVIGATION DECORATION ON SCROLL
    // -----------------------------------------------------------------
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // -----------------------------------------------------------------
    // 5. MOBILE MENU TOGGLE
    // -----------------------------------------------------------------
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });

    // -----------------------------------------------------------------
    // 6. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // -----------------------------------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animates once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => revealObserver.observe(el));

    // -----------------------------------------------------------------
    // 7. CONTACT FORM SUBMISSION SIMULATION
    // -----------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = contactForm.querySelector('.btn-submit');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable submission button
        submitBtn.disabled = true;
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Encrypting transmission...</span>`;
        
        formFeedback.className = 'form-feedback';
        formFeedback.textContent = '';

        setTimeout(() => {
            submitBtn.innerHTML = `<span>Securing channel...</span>`;
            
            setTimeout(() => {
                // Success feedback
                formFeedback.className = 'form-feedback success';
                formFeedback.textContent = 'TRANSMISSION SECURED. Agent initialized and message relayed successfully.';
                
                // Clear Form
                contactForm.reset();
                
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
                
                // Spawn a few celebratory particles on the canvas at the button center
                const btnRect = submitBtn.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                const btnCenterX = btnRect.left + btnRect.width / 2 - canvasRect.left;
                const btnCenterY = btnRect.top + btnRect.height / 2 - canvasRect.top;
                
                for (let i = 0; i < 20; i++) {
                    const randomColor = inkColors[Math.floor(Math.random() * inkColors.length)];
                    inkParticles.push(new InkParticle(btnCenterX, btnCenterY, randomColor));
                }
            }, 1200);
        }, 1000);
    });
});
