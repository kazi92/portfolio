/**
 * Premium Portfolio Interactivity Script - Kazi Haque
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- UTILITIES ---
    const select = (selector, all = false) => {
        return all ? document.querySelectorAll(selector) : document.querySelector(selector);
    };

    // --- CUSTOM CURSOR ---
    const cursorFollower = select('#cursorFollower');
    const cursorDot = select('#cursorDot');
    
    let mouseX = 0, mouseY = 0; // Actual mouse position
    let followerX = 0, followerY = 0; // Interpolated follower position
    const lerpFactor = 0.15; // Speed of follower (lower is smoother/lagger)

    if (window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediately move the small dot
            if (cursorDot) {
                cursorDot.style.left = `${mouseX}px`;
                cursorDot.style.top = `${mouseY}px`;
            }
        });

        // Smooth follower animation loop
        const updateCursor = () => {
            if (cursorFollower) {
                followerX += (mouseX - followerX) * lerpFactor;
                followerY += (mouseY - followerY) * lerpFactor;
                cursorFollower.style.left = `${followerX}px`;
                cursorFollower.style.top = `${followerY}px`;
            }
            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        // Hover expansions
        const hoverables = select('a, button, input, textarea, select, .tab-btn, .filter-btn, #emailCopyBtn, .speaker-badge', true);
        hoverables.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursorFollower?.classList.add('cursor-hovered');
                cursorDot?.classList.add('cursor-hovered');
            });
            item.addEventListener('mouseleave', () => {
                cursorFollower?.classList.remove('cursor-hovered');
                cursorDot?.classList.remove('cursor-hovered');
            });
        });

        // Click animations
        document.addEventListener('mousedown', () => {
            cursorFollower?.classList.add('cursor-clicked');
        });
        document.addEventListener('mouseup', () => {
            cursorFollower?.classList.remove('cursor-clicked');
        });
    }

    // --- CANVAS PARTICLES ---
    const canvas = select('#particleCanvas');
    let initParticles = null; // Declare in DOMContentLoaded scope for external accessibility

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Handle resize
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (typeof initParticles === 'function') initParticles();
        };

        // Track mouse on canvas area
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Check boundaries
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Check mouse collision / repulsion
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius && mouse.x !== null) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push away gently
                    this.x -= dx / distance * force * 2;
                    this.y -= dy / distance * force * 2;
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        initParticles = () => {
            particles = [];
            // Scale number of particles based on screen width
            const count = Math.min(Math.floor((canvas.width * canvas.height) / 16000), 85);
            
            // Get active colors based on theme and mode
            const theme = document.documentElement.dataset.theme || 'midnight';
            const isLight = document.documentElement.getAttribute('data-theme-mode') === 'light';
            
            let particleColor = 'rgba(229, 193, 88, 0.12)'; // Gold theme particles (dark)
            if (isLight) {
                particleColor = 'rgba(180, 140, 30, 0.08)'; // Gold theme particles (light)
            }
            
            if (theme === 'emerald') {
                particleColor = isLight ? 'rgba(12, 140, 80, 0.07)' : 'rgba(16, 185, 129, 0.10)';
            } else if (theme === 'crimson') {
                particleColor = isLight ? 'rgba(20, 110, 180, 0.07)' : 'rgba(59, 130, 246, 0.10)';
            }

            for (let i = 0; i < count; i++) {
                let size = (Math.random() * 2) + 0.8;
                let x = (Math.random() * (innerWidth - size * 2) + size);
                let y = (Math.random() * (innerHeight - size * 2) + size);
                let directionX = (Math.random() * 0.35) - 0.175;
                let directionY = (Math.random() * 0.35) - 0.175;

                particles.push(new Particle(x, y, directionX, directionY, size, particleColor));
            }
        };

        const connectParticles = () => {
            const theme = document.documentElement.dataset.theme || 'midnight';
            const isLight = document.documentElement.getAttribute('data-theme-mode') === 'light';
            
            let lineColor = 'rgba(229, 193, 88, 0.03)'; // Gold theme lines (dark)
            if (isLight) {
                lineColor = 'rgba(180, 140, 30, 0.025)'; // Gold theme lines (light)
            }
            
            if (theme === 'emerald') {
                lineColor = isLight ? 'rgba(12, 140, 80, 0.02)' : 'rgba(16, 185, 129, 0.025)';
            } else if (theme === 'crimson') {
                lineColor = isLight ? 'rgba(20, 110, 180, 0.02)' : 'rgba(59, 130, 246, 0.025)';
            }

            let maxDistance = 115;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        let alpha = (1 - (distance / maxDistance)) * 0.35;
                        ctx.strokeStyle = lineColor.replace('0.03', alpha.toFixed(3)).replace('0.025', alpha.toFixed(3)).replace('0.02', alpha.toFixed(3));
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => p.update());
            connectParticles();
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    // --- HERO TYPING ANIMATION ---
    const typingText = select('#typingText');
    if (typingText) {
        const phrases = ["AI Product Leader.", "B2B SaaS Co-Founder.", "DevRel GTM Advisor.", "Community Mentor."];
        let phraseIdx = 0;
        let letterIdx = 0;
        let currentPhrase = '';
        let isDeleting = false;

        const type = () => {
            const fullPhrase = phrases[phraseIdx];
            
            if (isDeleting) {
                currentPhrase = fullPhrase.substring(0, letterIdx - 1);
                letterIdx--;
            } else {
                currentPhrase = fullPhrase.substring(0, letterIdx + 1);
                letterIdx++;
            }

            typingText.textContent = currentPhrase;

            let typingSpeed = 90;
            if (isDeleting) typingSpeed /= 2;

            if (!isDeleting && currentPhrase === fullPhrase) {
                typingSpeed = 2200; // Stay typed longer
                isDeleting = true;
            } else if (isDeleting && currentPhrase === '') {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typingSpeed = 400; // Brief pause before starting next
            }

            setTimeout(type, typingSpeed);
        };

        setTimeout(type, 1000);
    }

    // --- THEME SWITCHER CONTROLS ---
    const themeBtn = select('#themeBtn');
    const themeDropdown = select('#themeDropdown');
    const themeOpts = select('.theme-opt', true);
    const modeToggleBtn = select('#modeToggle');

    // Load theme & mode preferences
    const currentSavedTheme = localStorage.getItem('portfolio-theme') || 'midnight';
    const currentSavedMode = localStorage.getItem('portfolio-theme-mode') || 'dark';

    document.documentElement.setAttribute('data-theme', currentSavedTheme);
    document.documentElement.setAttribute('data-theme-mode', currentSavedMode);

    themeOpts.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === currentSavedTheme);
    });

    // Theme Switcher Toggle (Gold/Emerald/Digital)
    if (themeBtn && themeDropdown) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            themeDropdown.classList.remove('show');
        });

        themeOpts.forEach(opt => {
            opt.addEventListener('click', () => {
                const themeVal = opt.dataset.theme;
                document.documentElement.setAttribute('data-theme', themeVal);
                localStorage.setItem('portfolio-theme', themeVal);

                themeOpts.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                // Re-initialize canvas particles to adjust color bounds
                if (canvas && typeof initParticles === 'function') {
                    initParticles();
                }
            });
        });
    }

    // Mode Toggle (Light/Dark)
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', () => {
            const currentMode = document.documentElement.getAttribute('data-theme-mode');
            const newMode = currentMode === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme-mode', newMode);
            localStorage.setItem('portfolio-theme-mode', newMode);

            // Re-initialize canvas particles to adjust color bounds and opacity for light mode
            if (canvas && typeof initParticles === 'function') {
                initParticles();
            }
        });
    }

    // --- MOBILE MENU ---
    const menuToggle = select('#menuToggle');
    const navMenu = select('#navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu on clicking navigation links
        select('.nav-link', true).forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- ACTIVE SECTION HIGHLIGHTING (SCROLLSPY) ---
    const sections = select('section', true);
    const navLinks = select('.nav-link', true);
    const header = select('.header');

    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 130;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.section === currentSectionId);
            });
        }
    });

    // --- INTERACTIVE TABS ---
    const tabBtns = select('.tab-btn', true);
    const tabPanes = select('.tab-pane', true);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabTargetId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = select(`#tab-${tabTargetId}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // --- PROJECT GRID FILTERS ---
    const filterBtns = select('.filter-btn', true);
    const projectCards = select('.project-card', true);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const category = card.dataset.category;
                
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hide');
                    card.classList.add('show');
                } else {
                    card.classList.remove('show');
                    card.classList.add('hide');
                }
            });
        });
    });

    // --- TOAST NOTIFICATIONS TRIGGER ---
    const toastContainer = select('#toastContainer');

    const showToast = (message, type = 'success') => {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast glass-panel';
        
        toast.innerHTML = `
            <svg class="toast-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove after 3.5s
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    };

    // --- COPY EMAIL TO CLIPBOARD ---
    const emailBtn = select('#emailCopyBtn');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailBtn.getAttribute('href').replace('mailto:', '');
            
            navigator.clipboard.writeText(email).then(() => {
                showToast("Email address copied to clipboard!");
            }).catch(err => {
                console.error('Could not copy email: ', err);
            });
        });
    }

    // --- CONTACT FORM VALIDATION & SIMULATION ---
    const contactForm = select('#contactForm');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');

        // Clear error states on input/focus
        inputs.forEach(input => {
            const parent = input.parentElement;
            input.addEventListener('focus', () => {
                parent.classList.remove('invalid');
            });
            input.addEventListener('input', () => {
                parent.classList.remove('invalid');
            });
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isFormValid = true;

            inputs.forEach(input => {
                const parent = input.parentElement;
                
                if (!input.value.trim()) {
                    parent.classList.add('invalid');
                    isFormValid = false;
                } else if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        parent.classList.add('invalid');
                        isFormValid = false;
                    }
                } else {
                    parent.classList.remove('invalid');
                }
            });

            if (isFormValid) {
                showToast("Inquiry sent successfully! Kazi will review and respond soon.");
                contactForm.reset();
                
                inputs.forEach(input => {
                    input.blur();
                });
            }
        });
    }

    // --- 3D TILT EFFECT ON AVATAR ---
    const avatarCard = select('#avatarCard');
    if (avatarCard) {
        const handleTilt = (e) => {
            const cardRect = avatarCard.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;
            
            const mouseX = e.clientX - cardRect.left - cardWidth / 2;
            const mouseY = e.clientY - cardRect.top - cardHeight / 2;
            
            const tiltX = (mouseY / (cardHeight / 2)) * -10;
            const tiltY = (mouseX / (cardWidth / 2)) * 10;
            
            avatarCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
        };

        const resetTilt = () => {
            avatarCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        };

        avatarCard.addEventListener('mousemove', handleTilt);
        avatarCard.addEventListener('mouseleave', resetTilt);
    }
});
