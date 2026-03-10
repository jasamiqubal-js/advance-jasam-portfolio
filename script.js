/* ============================================================
   Jasam Miah Portfolio - script.js
   All features: Preloader, Cursor, Particles, Typing,
   Stats, Skills, Projects, Testimonials, Chatbot,
   Contact Form (Formspree), Resume Modal, Confetti,
   WhatsApp, Dark/Light Mode, Easter Egg
   ============================================================ */

// ==================== PRELOADER ====================
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    }, 1800);
});

// ==================== AOS INIT ====================
AOS.init({ duration: 800, once: true, offset: 80, easing: 'ease-out' });


// ==================== CUSTOM CURSOR ====================
(function() {
    if (window.innerWidth <= 768) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    (function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, input, textarea, .project-card, .skill-card, .filter-btn, .suggestion-btn, .stat-card').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

    document.addEventListener('mousedown', () => { dot.classList.add('clicking'); ring.classList.add('clicking'); });
    document.addEventListener('mouseup', () => { dot.classList.remove('clicking'); ring.classList.remove('clicking'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ==================== SCROLL PROGRESS ====================
window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const el = document.getElementById('scrollProgress');
    if (el) el.style.width = (winScroll / height * 100) + '%';
});

// ==================== NAVBAR SCROLL ====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('show', window.scrollY > 300);
});

// ==================== ACTIVE NAV LINK ====================
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id'); });
    navLinkItems.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
});

// ==================== HAMBURGER MENU ====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });
}

navLinkItems.forEach(l => l.addEventListener('click', () => {
    if (hamburger) hamburger.classList.remove('active');
    if (navLinks) navLinks.classList.remove('active');
    document.body.style.overflow = 'auto';
}));

document.addEventListener('click', e => {
    if (hamburger && navLinks && !hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ==================== DARK / LIGHT MODE ====================
const themeToggle = document.getElementById('themeToggle');
let isDark = true;

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    isDark = false;
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        isDark = !isDark;
        themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ==================== TYPING ANIMATION ====================
const roles = ['Web Developer 💻', 'CS Student 🎓', 'UI/UX Designer 🎨', 'Freelancer 🚀', 'Problem Solver 🧠'];
let ri = 0, ci = 0, deleting = false;
const roleEl = document.getElementById('dynamic-role');

function typeRole() {
    if (!roleEl) return;
    const current = roles[ri];
    if (!deleting) {
        roleEl.textContent = current.slice(0, ++ci);
        if (ci === current.length) { deleting = true; setTimeout(typeRole, 2000); return; }
    } else {
        roleEl.textContent = current.slice(0, --ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(typeRole, deleting ? 60 : 110);
}
setTimeout(typeRole, 1000);

// ==================== STATS COUNTER ====================
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const start = performance.now();
    const duration = 2000;
    (function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + (target >= 100 ? '+' : '');
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target + (target >= 100 ? '+' : '');
    })(start);
}

const statsSection = document.querySelector('.stats-section');
let counterDone = false;
if (statsSection) {
    new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !counterDone) {
                document.querySelectorAll('.stat-number').forEach(animateCounter);
                counterDone = true;
            }
        });
    }, { threshold: 0.3 }).observe(statsSection);
}

// ==================== SKILL BARS ====================
const skillsSection = document.querySelector('.skills-section');
let skillsDone = false;
if (skillsSection) {
    new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !skillsDone) {
                document.querySelectorAll('.skill-progress').forEach(bar => {
                    bar.style.width = bar.dataset.progress + '%';
                });
                skillsDone = true;
            }
        });
    }, { threshold: 0.3 }).observe(skillsSection);
}

// ==================== PROJECT FILTER ====================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.dataset.filter;
        document.querySelectorAll('.project-card').forEach(card => {
            const cats = card.dataset.category || '';
            const show = filter === 'all' || cats.includes(filter);
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = show ? '1' : '0.2';
            card.style.transform = show ? '' : 'scale(0.92)';
            card.style.pointerEvents = show ? 'all' : 'none';
        });
    });
});

// ==================== 3D CARD TILT ====================
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ==================== TESTIMONIALS ====================
let currentTestimonial = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('testimonialDots');

if (dotsContainer) {
    testimonialCards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToTestimonial(i));
        dotsContainer.appendChild(dot);
    });
}

function goToTestimonial(i) {
    testimonialCards[currentTestimonial].classList.remove('active');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (dots[currentTestimonial]) dots[currentTestimonial].classList.remove('active');
    currentTestimonial = (i + testimonialCards.length) % testimonialCards.length;
    testimonialCards[currentTestimonial].classList.add('active');
    if (dots[currentTestimonial]) dots[currentTestimonial].classList.add('active');
}

const prevBtn = document.getElementById('prevTestimonial');
const nextBtn = document.getElementById('nextTestimonial');
if (prevBtn) prevBtn.addEventListener('click', () => goToTestimonial(currentTestimonial - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToTestimonial(currentTestimonial + 1));
setInterval(() => goToTestimonial(currentTestimonial + 1), 5000);

// ==================== AI CHATBOT ====================
const chatbotKnowledge = {
    skills: "Jasam এর skills:\n• HTML5 (95%) — Semantic, accessible markup\n• CSS3 (90%) — Animations, Flexbox, Grid\n• JavaScript (85%) — ES6+, DOM, APIs\n• Photoshop (80%) — Photo editing & design\n• Graphic Design (82%) — Visual branding",
    projects: "Jasam এর projects:\n🌐 Personal Portfolio — Responsive portfolio\n🛠️ Web Dev Practice Platform — Code editor with AI\n🔐 Modern Login System — Beautiful auth UI\n✈️ Travel Blog — Stunning blog platform\n\nProjects section এ দেখো!",
    contact: "Jasam কে contact করো:\n📧 Email: jasamiqubal@gmail.com\n📍 Location: Dhaka, Bangladesh\n💼 Status: Open for freelance!\n\nContact form এ message পাঠাও!",
    hire: "Jasam এখন freelance এর জন্য available! 🎉\n\nHe can help with:\n• Custom websites & landing pages\n• UI/UX design\n• Frontend development\n• Graphic design & Photoshop\n\nEmail: jasamiqubal@gmail.com",
    about: "Jasam Miah হলো একজন passionate web developer and CS student from Dhaka, Bangladesh.\n\n🎓 CS Student (2023–Present)\n💻 Freelance developer (2024–Present)\n🚀 Coding since 2021\n\nHe loves creating beautiful digital experiences!",
    experience: "Jasam এর journey:\n📅 2024–Present — Freelance Web Developer\n📅 2023–Present — CS Student\n📅 2022 — Started web development\n📅 2021 — First line of code!\n\n4+ years of coding passion 🔥",
    resume: "Resume দেখতে navbar এর Resume button এ click করো! 📄 Download option ও আছে।",
    boss: "My boss is Jasam Miah — a very talented developer! 😄",
    brother: "His brother's name is Jisan Miah.",
};

function getBotResponse(input) {
    const q = input.toLowerCase();
    if (q.match(/^(hi|hello|hey|hii|helo|hlw|salam|assalamu)/)) {
        return "Hello! 👋 Great to meet you! I'm Jasam's AI assistant.\n\nWhat would you like to know? Ask me about his skills, projects, or how to hire him!";
    }
    if (q.includes('thank') || q.includes('thanks') || q.includes('tnx') || q.includes('great') || q.includes('awesome')) {
        return "You're welcome! 😊 Jasam would be happy to hear that! Feel free to ask anything else.";
    }
    if (q.includes('skill') || q.includes('html') || q.includes('css') || q.includes('js') || q.includes('photoshop') || q.includes('graphic') || q.includes('know') || q.includes('technology')) {
        return chatbotKnowledge.skills;
    }
    if (q.includes('project') || q.includes('portfolio') || q.includes('built') || q.includes('made') || q.includes('work')) {
        return chatbotKnowledge.projects;
    }
    if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('message') || q.includes('phone')) {
        return chatbotKnowledge.contact;
    }
    if (q.includes('hire') || q.includes('available') || q.includes('freelance') || q.includes('price') || q.includes('cost') || q.includes('rate')) {
        return chatbotKnowledge.hire;
    }
    if (q.includes('about') || q.includes('who') || q.includes('jasam') || q.includes('tell me')) {
        return chatbotKnowledge.about;
    }
    if (q.includes('experience') || q.includes('journey') || q.includes('year') || q.includes('when') || q.includes('history')) {
        return chatbotKnowledge.experience;
    }
    if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
        return chatbotKnowledge.resume;
    }
    if (q.includes('boss')) return chatbotKnowledge.boss;
    if (q.includes('brother') || q.includes('jisan')) return chatbotKnowledge.brother;
    if (q.includes('location') || q.includes('dhaka') || q.includes('bangladesh') || q.includes('where')) {
        return "Jasam is based in Dhaka, Bangladesh 🇧🇩\nHe works remotely with clients worldwide!";
    }
    return "That's a great question! 🤔 Try asking me about:\n\n• Skills — What he knows\n• Projects — What he's built\n• Contact — How to reach him\n• Hire him — Work together\n• About — Who he is";
}

function formatBotMessage(text) {
    return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function addChatMessage(content, isUser) {
    const msgs = document.getElementById('chatbotMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chatbot-message ' + (isUser ? 'user' : 'bot');
    if (isUser) {
        div.style.flexDirection = 'row-reverse';
        div.innerHTML = `<div class="message-avatar" style="background:#444"><i class="fas fa-user"></i></div><div class="message-content"><p>${content}</p></div>`;
    } else {
        div.innerHTML = `<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>${formatBotMessage(content)}</p></div>`;
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function showTypingIndicator() {
    const msgs = document.getElementById('chatbotMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chatbot-message bot'; div.id = 'typingIndicator';
    div.innerHTML = `<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><div class="chatbot-typing"><span></span><span></span><span></span></div></div>`;
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}

function sendChatMessage(text) {
    const input = document.getElementById('chatbotInput');
    const msg = text || (input ? input.value.trim() : '');
    if (!msg) return;
    if (input) input.value = '';
    addChatMessage(msg, true);
    showTypingIndicator();
    setTimeout(() => {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
        addChatMessage(getBotResponse(msg), false);
    }, 800 + Math.random() * 500);
}

function toggleChatbotWidget(open) {
    const widget = document.getElementById('chatbotWidget');
    if (!widget) return;
    widget.style.display = open ? 'flex' : 'none';
    widget.classList.toggle('active', open);
}

const openBtn = document.getElementById('openChatbot');
const closeBtn = document.getElementById('closeChatbot');
const fabBtn = document.getElementById('chatbotFab');
const sendBtn = document.getElementById('sendChatMessage');
const chatInput = document.getElementById('chatbotInput');

if (openBtn) openBtn.addEventListener('click', () => toggleChatbotWidget(true));
if (fabBtn) fabBtn.addEventListener('click', () => toggleChatbotWidget(true));
if (closeBtn) closeBtn.addEventListener('click', () => toggleChatbotWidget(false));
if (sendBtn) sendBtn.addEventListener('click', () => sendChatMessage());
if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        sendChatMessage(this.textContent.replace(/[🚀💼📞💰]/g, '').trim());
    });
});

// ==================== CONTACT FORM (Formspree) ====================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('.btn-submit');
        const msgDiv = document.getElementById('formMessage');
        const formData = new FormData(this);
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        if (msgDiv) msgDiv.textContent = '';

        try {
            const response = await fetch('https://formspree.io/f/mreqdllw', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                if (msgDiv) {
                    msgDiv.style.cssText = 'background:rgba(74,222,128,0.1);border:1px solid #4ade80;color:#4ade80;padding:15px;border-radius:10px;margin-top:15px;';
                    msgDiv.textContent = "✅ Message sent! I'll get back to you soon.";
                }
                this.reset();
                triggerConfetti();
            } else {
                const data = await response.json();
                if (msgDiv) {
                    msgDiv.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#ef4444;padding:15px;border-radius:10px;margin-top:15px;';
                    msgDiv.textContent = '✗ ' + (data.errors ? data.errors.map(er => er.message).join(', ') : 'Something went wrong.');
                }
            }
        } catch (err) {
            if (msgDiv) {
                msgDiv.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#ef4444;padding:15px;border-radius:10px;margin-top:15px;';
                msgDiv.textContent = '✗ Network error! Please try again.';
            }
        }

        btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
        setTimeout(() => { if (msgDiv) { msgDiv.textContent = ''; msgDiv.style.cssText = ''; } }, 5000);
    });
}

// ==================== CONFETTI ====================
function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#FF6B35', '#FFA94D', '#4ade80', '#60a5fa', '#f472b6', '#facc15'];
    const pieces = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width, y: -20,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 10
    }));
    let frame;
    (function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.rotation += p.rotV; p.vy += 0.1;
            if (p.y < canvas.height + 20) alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        if (alive) frame = requestAnimationFrame(animate);
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); cancelAnimationFrame(frame); }
    })();
}

const hireBtn = document.getElementById('hireBtn');
if (hireBtn) {
    hireBtn.addEventListener('click', e => {
        e.preventDefault();
        triggerConfetti();
        document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    });
}

// ==================== RESUME MODAL ====================
const resumeModal = document.getElementById('resumeModal');
const resumeNavBtn = document.getElementById('resumeNavBtn');
const resumeModalClose = document.getElementById('resumeModalClose');

function openResume() { if (resumeModal) resumeModal.classList.add('active'); }
function closeResume() { if (resumeModal) resumeModal.classList.remove('active'); }

if (resumeNavBtn) resumeNavBtn.addEventListener('click', e => { e.preventDefault(); openResume(); });
if (resumeModalClose) resumeModalClose.addEventListener('click', closeResume);
if (resumeModal) {
    resumeModal.addEventListener('click', e => { if (e.target === resumeModal) closeResume(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeResume(); });

// ==================== BACK TO TOP ====================
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ==================== EASTER EGG (Konami Code) ====================
let konamiCode = [];
const konamiPattern = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
document.addEventListener('keydown', e => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    if (konamiCode.join('') === konamiPattern.join('')) {
        triggerConfetti();
        setTimeout(() => alert('🎉 You found the Easter Egg! You\'re awesome! 🚀'), 500);
    }
});

// ==================== CONSOLE MESSAGE ====================
console.log('%c👋 Hi there! Welcome to Jasam\'s Portfolio!', 'color:#FF6B35;font-size:20px;font-weight:bold;');
console.log('%cLooking for a developer? Let\'s connect! 🚀', 'color:#FFA94D;font-size:16px;');
console.log('%cEmail: jasamiqubal@gmail.com', 'color:#00D9FF;font-size:14px;');
console.log('%c💡 Try the Konami Code: ↑↑↓↓←→←→BA', 'color:#667eea;font-size:12px;font-style:italic;');
// ===== CONTACT FORM ANIMATIONS (SAFE VERSION) =====

// Staggered entrance
const cFormAnim = document.getElementById('contactForm');
if (cFormAnim) {
    new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { threshold: 0.2 }).observe(cFormAnim);
}

// Character counter for textarea
const msgArea = document.getElementById('message');
if (msgArea) {
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.textContent = '0 / 500';
    msgArea.parentElement.appendChild(counter);
    msgArea.addEventListener('input', () => {
        const len = msgArea.value.length;
        counter.textContent = `${len} / 500`;
        counter.className = 'char-counter';
        if (len > 400) counter.classList.add('warning');
        if (len > 480) counter.classList.add('danger');
        if (len > 500) msgArea.value = msgArea.value.slice(0, 500);
    });
}

// Shake on empty fields
const cFormInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
cFormInputs.forEach(field => {
    field.addEventListener('blur', () => {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
            group.classList.add('error');
            setTimeout(() => group.classList.remove('error'), 500);
        }
    });
});
// ==================== PARTICLES ====================
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: { value: 90, density: { enable: true, value_area: 900 } },
            color: { value: '#FF6B35' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 5, random: true },
            line_linked: {
                enable: true, distance: 150,
                color: '#FF6B35', opacity: 0.15, width: 1
            },
            move: { enable: true, speed: 3.5, random: true, out_mode: 'out' }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' }
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 0.3 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}