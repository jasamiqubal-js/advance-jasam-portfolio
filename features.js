/* ============================================================
   FEATURES ADDITION — features.js
   Add <script src="features.js"></script> before </body>
   ALSO add <link rel="stylesheet" href="features.css"> in <head>

   Features:
   1. Real AI Chatbot (Claude API via Netlify Function)
   2. Project Case Study Modal
   3. Mouse Sparkle Trail
   4. Multi-language EN/BN Toggle
   5. Animated Skills Radar Chart
   6. Toast Notification System
   ============================================================ */

// ==================== 1. TOAST NOTIFICATION SYSTEM ====================
// Usage: showToast('Message', 'success' | 'error' | 'info' | 'warning')

window.showToast = function(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-check-circle',
        error:   'fa-times-circle',
        info:    'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    setTimeout(() => removeToast(toast), duration);
};

function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
}

// Hook toasts into existing site events
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle toast
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('light-mode');
            showToast(isDark ? '☀️ Light mode activated' : '🌙 Dark mode activated', 'info', 2000);
        });
    }

    // Contact form toast override
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            setTimeout(() => {
                const formMsg = document.getElementById('formMessage');
                if (formMsg && formMsg.textContent.includes('✅')) {
                    showToast('✅ Message sent successfully!', 'success');
                }
            }, 2500);
        });
    }

    // Chatbot open toast (first time only)
    const chatFab = document.getElementById('chatbotFab');
    let chatOpened = false;
    if (chatFab) {
        chatFab.addEventListener('click', () => {
            if (!chatOpened) {
                showToast('🤖 AI Chatbot is now powered by Claude!', 'info', 3000);
                chatOpened = true;
            }
        });
    }

    // Copy email on click
    document.querySelectorAll('a[href^="mailto"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const email = link.href.replace('mailto:', '');
            navigator.clipboard?.writeText(email).then(() => {
                showToast(`📋 Email copied: ${email}`, 'success', 2500);
            }).catch(() => {});
        });
    });
});


// ==================== 2. REAL AI CHATBOT (Claude API) ====================
// Replaces the old getBotResponse function
// Uses Netlify Function proxy to keep API key secure

async function getAIChatbotResponse(userMessage, history = []) {
    try {
        // Try Netlify Function proxy first (secure)
        const res = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, history })
        });

        if (res.ok) {
            const data = await res.json();
            return data.reply || 'Sorry, something went wrong.';
        }

        // Fallback: direct API (only if you set ANTHROPIC_API_KEY in window)
        if (window.ANTHROPIC_KEY) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': window.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 400,
                    system: `You are Jasam Miah's friendly portfolio AI assistant. Keep replies concise (max 3-4 sentences).
Jasam is a passionate web developer & CS student from Dhaka, Bangladesh.
Skills: HTML5 (95%), CSS3 (90%), JavaScript (85%), Photoshop (80%), Graphic Design (82%).
Projects: Personal Portfolio, Web Dev Practice Platform, Modern Login System, Travel Blog, Verification Login System.
Email: jasamiqubal@gmail.com | Open for freelance.
Always be warm, helpful, and encourage visitors to hire or contact Jasam.`,
                    messages: [...history.slice(-6), { role: 'user', content: userMessage }]
                })
            });
            const data = await response.json();
            return data.content?.[0]?.text || 'Sorry, something went wrong.';
        }

        // Final fallback to rule-based
        return getFallbackResponse(userMessage);

    } catch (err) {
        return getFallbackResponse(userMessage);
    }
}

// Keep old rule-based as fallback
function getFallbackResponse(input) {
    const q = input.toLowerCase();
    if (q.match(/^(hi|hello|hey|hii|salam)/)) return "Hello! 👋 I'm Jasam's AI assistant. Ask me about his skills, projects, or how to hire him!";
    if (q.includes('skill') || q.includes('html') || q.includes('css') || q.includes('javascript')) return "Jasam's top skills: HTML5 (95%), CSS3 (90%), JavaScript (85%), Photoshop (80%), Graphic Design (82%). 💪";
    if (q.includes('project') || q.includes('work')) return "Jasam has built a portfolio site, web dev practice platform, login systems, and a travel blog! Check the Projects section. 🚀";
    if (q.includes('contact') || q.includes('hire') || q.includes('email')) return "Reach Jasam at jasamiqubal@gmail.com — he's open for freelance projects! 📧";
    if (q.includes('about') || q.includes('who')) return "Jasam Miah is a web developer & CS student from Dhaka, Bangladesh. Coding since 2021, freelancing since 2024! 🇧🇩";
    return "Great question! Ask me about Jasam's skills, projects, experience, or how to contact him. 😊";
}

// Patch the chatbot to use AI
(function patchChatbot() {
    const sendBtn = document.getElementById('sendChatMessage');
    const chatInput = document.getElementById('chatbotInput');
    if (!sendBtn || !chatInput) return;

    const chatHistory = [];

    async function sendAIMessage(text) {
        const msgs = document.getElementById('chatbotMessages');
        const input = document.getElementById('chatbotInput');
        const msg = text || (input ? input.value.trim() : '');
        if (!msg) return;
        if (input) input.value = '';

        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'chatbot-message user';
        userDiv.style.flexDirection = 'row-reverse';
        userDiv.innerHTML = `<div class="message-avatar" style="background:#444"><i class="fas fa-user"></i></div><div class="message-content"><p>${msg}</p></div>`;
        msgs.appendChild(userDiv);
        msgs.scrollTop = msgs.scrollHeight;

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot';
        typingDiv.id = 'aiTyping';
        typingDiv.innerHTML = `<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><div class="chatbot-typing"><span></span><span></span><span></span></div></div>`;
        msgs.appendChild(typingDiv);
        msgs.scrollTop = msgs.scrollHeight;

        chatHistory.push({ role: 'user', content: msg });

        const reply = await getAIChatbotResponse(msg, chatHistory);
        chatHistory.push({ role: 'assistant', content: reply });

        const typing = document.getElementById('aiTyping');
        if (typing) typing.remove();

        const botDiv = document.createElement('div');
        botDiv.className = 'chatbot-message bot';
        botDiv.innerHTML = `<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>${reply.replace(/\n/g, '<br>')}</p></div>`;
        msgs.appendChild(botDiv);
        msgs.scrollTop = msgs.scrollHeight;
    }

    // Remove old event listeners by cloning
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    const newInput = chatInput.cloneNode(true);
    chatInput.parentNode.replaceChild(newInput, chatInput);

    newSendBtn.addEventListener('click', () => sendAIMessage());
    newInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendAIMessage(); });

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            sendAIMessage(this.textContent.replace(/[🚀💼📞💰]/g, '').trim());
        });
    });
})();


// ==================== 3. MOUSE SPARKLE TRAIL ====================
(function initSparkle() {
    if (window.innerWidth <= 768) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'sparkleCanvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const sparkles = [];
    const colors = ['#FF6B35','#FFA94D','#FFD700','#FF8C42','#fff','#60a5fa','#f472b6'];
    let mouseX = 0, mouseY = 0, lastX = 0, lastY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const dist = Math.hypot(mouseX - lastX, mouseY - lastY);
        if (dist < 6) return;
        lastX = mouseX; lastY = mouseY;

        const count = Math.min(3, Math.floor(dist / 8) + 1);
        for (let i = 0; i < count; i++) {
            sparkles.push({
                x: mouseX + (Math.random() - 0.5) * 10,
                y: mouseY + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3 - 1.5,
                size: Math.random() * 5 + 2,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.5 ? 'star' : 'circle',
                rotation: Math.random() * Math.PI * 2,
                rotV: (Math.random() - 0.5) * 0.2
            });
        }
    });

    function drawStar(ctx, x, y, size, rotation) {
        const spikes = 4;
        const outerR = size;
        const innerR = size * 0.4;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI / spikes) + rotation;
            i === 0 ? ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
                     : ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        }
        ctx.closePath();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.08;
            s.alpha -= 0.025;
            s.rotation += s.rotV;
            if (s.alpha <= 0) { sparkles.splice(i, 1); continue; }

            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = s.color;

            if (s.shape === 'star') {
                drawStar(ctx, s.x, s.y, s.size, s.rotation);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        requestAnimationFrame(animate);
    }
    animate();
})();


// ==================== 4. MULTI-LANGUAGE EN/BN TOGGLE ====================
(function initLangToggle() {
    const translations = {
        en: {
            'nav-home': 'Home',
            'nav-about': 'About',
            'nav-projects': 'Projects',
            'nav-skills': 'Skills',
            'nav-contact': 'Contact',
            'hero-badge-text': 'Available for Freelance',
            'hero-name-prefix': "Hi! I'm",
            'hero-desc': 'Aspiring Web Developer & Computer Science Student passionate about creating beautiful, functional, and user-centered digital experiences.',
            'btn-view-work': 'View My Work',
            'btn-hire-me': 'Hire Me 🎉',
            'about-tag': 'Get To Know Me',
            'about-title': 'About',
            'about-subtitle': 'My journey in web development and beyond',
            'about-p1': "I'm a passionate web developer and computer science student with a keen eye for creating beautiful, functional, and user-centered digital experiences.",
            'about-p2': "I specialize in frontend development with expertise in HTML, CSS, JavaScript, and modern design tools. I love turning complex problems into simple, beautiful designs.",
            'about-p3': "When I'm not coding, you'll find me exploring new technologies or enjoying a good cup of coffee while reading tech blogs.",
            'about-edu-title': 'Education',
            'about-edu': 'Computer Science Student',
            'about-loc-title': 'Location',
            'about-loc': 'Dhaka, Bangladesh',
            'skills-tag': 'What I Do Best',
            'skills-title': 'My',
            'skills-subtitle': 'Technologies and tools I work with',
            'projects-tag': 'My Work',
            'projects-title': 'Featured',
            'projects-subtitle': 'Some of my recent work and case studies',
            'contact-tag': 'Get In Touch',
            'contact-title': "Let's Work",
            'contact-subtitle': 'Have a project in mind? Let\'s make it happen!',
            'footer-copy': '© 2026 Jasam Miah. All rights reserved.',
            'stat-projects': 'Projects Completed',
            'stat-group': 'Group Work',
            'stat-exp': 'Years Experience',
            'lang-btn': '🌐 বাংলা',
        },
        bn: {
            'nav-home': 'হোম',
            'nav-about': 'পরিচয়',
            'nav-projects': 'প্রজেক্ট',
            'nav-skills': 'দক্ষতা',
            'nav-contact': 'যোগাযোগ',
            'hero-badge-text': 'ফ্রিল্যান্সের জন্য উপলব্ধ',
            'hero-name-prefix': 'হ্যালো! আমি',
            'hero-desc': 'একজন উৎসাহী ওয়েব ডেভেলপার এবং কম্পিউটার সায়েন্সের ছাত্র — সুন্দর ও কার্যকরী ডিজিটাল অভিজ্ঞতা তৈরি করতে ভালোবাসি।',
            'btn-view-work': 'আমার কাজ দেখুন',
            'btn-hire-me': 'নিয়োগ করুন 🎉',
            'about-tag': 'আমাকে জানুন',
            'about-title': 'পরিচয়',
            'about-subtitle': 'ওয়েব ডেভেলপমেন্টে আমার যাত্রা',
            'about-p1': 'আমি একজন উৎসাহী ওয়েব ডেভেলপার এবং কম্পিউটার সায়েন্সের ছাত্র। সুন্দর ও ব্যবহারকারীবান্ধব ডিজিটাল অভিজ্ঞতা তৈরি করা আমার লক্ষ্য।',
            'about-p2': 'HTML, CSS, JavaScript এবং আধুনিক ডিজাইন টুলসে আমার দক্ষতা রয়েছে। জটিল সমস্যাকে সহজ ও সুন্দর ডিজাইনে রূপান্তর করতে ভালোবাসি।',
            'about-p3': 'কোডিংয়ের বাইরে নতুন প্রযুক্তি এক্সপ্লোর করা এবং টেক ব্লগ পড়তে পছন্দ করি।',
            'about-edu-title': 'শিক্ষা',
            'about-edu': 'কম্পিউটার সায়েন্স ছাত্র',
            'about-loc-title': 'অবস্থান',
            'about-loc': 'ঢাকা, বাংলাদেশ',
            'skills-tag': 'আমি যা করি',
            'skills-title': 'আমার',
            'skills-subtitle': 'প্রযুক্তি ও টুলস যা আমি ব্যবহার করি',
            'projects-tag': 'আমার কাজ',
            'projects-title': 'বিশেষ',
            'projects-subtitle': 'আমার সাম্প্রতিক কিছু প্রজেক্ট',
            'contact-tag': 'যোগাযোগ করুন',
            'contact-title': 'একসাথে',
            'contact-subtitle': 'কোনো প্রজেক্ট মাথায় আছে? চলুন শুরু করি!',
            'footer-copy': '© ২০২৬ জাসাম মিয়া। সর্বস্বত্ব সংরক্ষিত।',
            'stat-projects': 'প্রজেক্ট সম্পন্ন',
            'stat-group': 'দলীয় কাজ',
            'stat-exp': 'বছরের অভিজ্ঞতা',
            'lang-btn': '🌐 English',
        }
    };

    let currentLang = localStorage.getItem('portfolioLang') || 'en';

    function applyTranslation(lang) {
        const t = translations[lang];
        if (!t) return;

        // Nav links
        const navLinks = document.querySelectorAll('.nav-link');
        const navKeys = ['nav-home','nav-about','nav-projects','nav-skills','nav-contact'];
        navLinks.forEach((l, i) => { if (navKeys[i]) l.textContent = t[navKeys[i]]; });

        // Hero badge
        const badge = document.querySelector('.hero-badge');
        if (badge) badge.innerHTML = `<i class="fas fa-circle pulse"></i> ${t['hero-badge-text']}`;

        // Hero title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.innerHTML = `${t['hero-name-prefix']} <span class="gradient-text">Jasam Miah</span>`;

        // Hero description
        const heroDesc = document.querySelector('.hero-description');
        if (heroDesc) heroDesc.textContent = t['hero-desc'];

        // Hero buttons
        const btnWork = document.querySelector('.hero-buttons .btn-primary span');
        const btnHire = document.querySelector('.hero-buttons .btn-secondary span');
        if (btnWork) btnWork.textContent = t['btn-view-work'];
        if (btnHire) btnHire.textContent = t['btn-hire-me'];

        // About section
        const aboutTag = document.querySelector('.about-section .section-tag');
        if (aboutTag) aboutTag.textContent = t['about-tag'];

        const aboutTitle = document.querySelector('.about-section .section-title');
        if (aboutTitle) aboutTitle.innerHTML = `${t['about-title']} <span class="gradient-text">Me</span>`;

        const aboutSub = document.querySelector('.about-section .section-subtitle');
        if (aboutSub) aboutSub.textContent = t['about-subtitle'];

        // About paragraphs
        const aboutPs = document.querySelectorAll('.about-text > p');
        if (aboutPs[0]) aboutPs[0].textContent = t['about-p1'];
        if (aboutPs[1]) aboutPs[1].textContent = t['about-p2'];
        if (aboutPs[2]) aboutPs[2].textContent = t['about-p3'];

        // Highlights
        const hlItems = document.querySelectorAll('.highlight-item');
        if (hlItems[0]) { hlItems[0].querySelector('h4').textContent = t['about-edu-title']; hlItems[0].querySelector('p').textContent = t['about-edu']; }
        if (hlItems[1]) { hlItems[1].querySelector('h4').textContent = t['about-loc-title']; hlItems[1].querySelector('p').textContent = t['about-loc']; }

        // Stats
        const statLabels = document.querySelectorAll('.stat-label');
        if (statLabels[0]) statLabels[0].textContent = t['stat-projects'];
        if (statLabels[1]) statLabels[1].textContent = t['stat-group'];
        if (statLabels[2]) statLabels[2].textContent = t['stat-exp'];

        // Skills section
        const skillTag = document.querySelector('.skills-section .section-tag');
        if (skillTag) skillTag.textContent = t['skills-tag'];
        const skillTitle = document.querySelector('.skills-section .section-title');
        if (skillTitle) skillTitle.innerHTML = `${t['skills-title']} <span class="gradient-text">Skills</span>`;
        const skillSub = document.querySelector('.skills-section .section-subtitle');
        if (skillSub) skillSub.textContent = t['skills-subtitle'];

        // Projects
        const projTag = document.querySelector('.projects-section .section-tag');
        if (projTag) projTag.textContent = t['projects-tag'];
        const projTitle = document.querySelector('.projects-section .section-title');
        if (projTitle) projTitle.innerHTML = `${t['projects-title']} <span class="gradient-text">Projects</span>`;
        const projSub = document.querySelector('.projects-section .section-subtitle');
        if (projSub) projSub.textContent = t['projects-subtitle'];

        // Contact
        const conTag = document.querySelector('.contact-section .section-tag');
        if (conTag) conTag.textContent = t['contact-tag'];
        const conTitle = document.querySelector('.contact-section .section-title');
        if (conTitle) conTitle.innerHTML = `${t['contact-title']} <span class="gradient-text">Together</span>`;
        const conSub = document.querySelector('.contact-section .section-subtitle');
        if (conSub) conSub.textContent = t['contact-subtitle'];

        // Footer
        const footerCopy = document.querySelector('.footer-bottom p:first-child');
        if (footerCopy) footerCopy.textContent = t['footer-copy'];

        // Lang button
        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) langBtn.innerHTML = `${t['lang-btn']}`;

        // HTML lang attribute
        document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';

        currentLang = lang;
        localStorage.setItem('portfolioLang', lang);
    }

    // Create language button and inject into navbar
    function createLangBtn() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        const btn = document.createElement('button');
        btn.id = 'langToggleBtn';
        btn.className = 'lang-toggle';
        btn.innerHTML = translations[currentLang === 'en' ? 'bn' : 'en']['lang-btn'] || '🌐 বাংলা';
        btn.setAttribute('aria-label', 'Toggle language');

        // Insert before hamburger
        const hamburger = navActions.querySelector('.hamburger');
        navActions.insertBefore(btn, hamburger || null);

        btn.addEventListener('click', () => {
            const nextLang = currentLang === 'en' ? 'bn' : 'en';
            applyTranslation(nextLang);
            const langName = nextLang === 'bn' ? 'বাংলা' : 'English';
            showToast(`🌐 Language changed to ${langName}`, 'info', 2500);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        createLangBtn();
        if (currentLang !== 'en') applyTranslation(currentLang);
        else {
            const langBtn = document.getElementById('langToggleBtn');
            if (langBtn) langBtn.innerHTML = '🌐 বাংলা';
        }
    });
})();


// ==================== 5. ANIMATED SKILLS RADAR CHART ====================
(function initRadarChart() {
    const skills = [
        { label: 'HTML5',           value: 95, color: '#E44D26' },
        { label: 'CSS3',            value: 90, color: '#264DE4' },
        { label: 'JavaScript',      value: 85, color: '#F7DF1E' },
        { label: 'Photoshop',       value: 80, color: '#31A8FF' },
        { label: 'Graphic Design',  value: 82, color: '#FF6B35' },
    ];

    function injectRadarSection() {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return;

        const section = document.createElement('div');
        section.className = 'radar-section';
        section.setAttribute('data-aos', 'fade-up');
        section.innerHTML = `
            <div class="container">
                <div class="radar-wrapper">
                    <canvas id="radarCanvas" width="500" height="500"></canvas>
                    <div class="radar-legend" id="radarLegend"></div>
                </div>
            </div>
        `;
        skillsSection.after(section);

        // Populate legend
        const legend = document.getElementById('radarLegend');
        skills.forEach(s => {
            const item = document.createElement('div');
            item.className = 'radar-legend-item';
            item.innerHTML = `<div class="radar-legend-dot" style="background:${s.color}"></div><span>${s.label} — ${s.value}%</span>`;
            legend.appendChild(item);
        });

        // Draw radar chart
        drawRadar();
    }

    function drawRadar() {
        const canvas = document.getElementById('radarCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        const maxR = Math.min(W, H) * 0.38;
        const levels = 5;
        const n = skills.length;

        function getPoint(index, fraction, offset = -Math.PI / 2) {
            const angle = (index / n) * Math.PI * 2 + offset;
            return {
                x: cx + Math.cos(angle) * maxR * fraction,
                y: cy + Math.sin(angle) * maxR * fraction
            };
        }

        let progress = 0;
        const duration = 1800;
        const startTime = performance.now();

        function frame(now) {
            const elapsed = now - startTime;
            progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            ctx.clearRect(0, 0, W, H);

            // Background grid rings
            for (let l = 1; l <= levels; l++) {
                const f = l / levels;
                ctx.beginPath();
                for (let i = 0; i < n; i++) {
                    const p = getPoint(i, f);
                    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();
                ctx.strokeStyle = 'rgba(255,107,53,0.12)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,107,53,0.03)';
                ctx.fill();
            }

            // Axes
            skills.forEach((_, i) => {
                const p = getPoint(i, 1);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = 'rgba(255,107,53,0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Data polygon (animated)
            ctx.beginPath();
            skills.forEach((s, i) => {
                const p = getPoint(i, (s.value / 100) * eased);
                i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
            grad.addColorStop(0, 'rgba(255,107,53,0.55)');
            grad.addColorStop(1, 'rgba(255,169,77,0.18)');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#FF6B35';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#FF6B35';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Data points
            skills.forEach((s, i) => {
                const p = getPoint(i, (s.value / 100) * eased);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = s.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Labels
            ctx.shadowBlur = 0;
            skills.forEach((s, i) => {
                const p = getPoint(i, 1.18);
                ctx.font = 'bold 13px Work Sans, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(s.label, p.x, p.y);
            });

            if (progress < 1) requestAnimationFrame(frame);
        }

        // Animate when in view
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    requestAnimationFrame(frame);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(canvas.closest('.radar-section') || canvas);
    }

    document.addEventListener('DOMContentLoaded', injectRadarSection);
})();


// ==================== 6. PROJECT CASE STUDY MODAL ====================
(function initCaseStudyModal() {
    const caseStudies = {
        'personal-portfolio': {
            title: 'Personal Portfolio',
            image: 'port.png',
            tags: ['HTML', 'CSS', 'JavaScript'],
            overview: 'A modern, responsive personal portfolio showcasing my journey as a web developer. Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, just clean code.',
            challenge: 'Creating a visually stunning site without heavy frameworks while maintaining excellent performance and smooth animations across all devices.',
            solution: 'Used CSS custom properties for theming, IntersectionObserver for scroll animations, and hand-crafted every interaction for maximum control.',
            tech: ['HTML5', 'CSS3', 'JavaScript', 'Particles.js', 'AOS Library', 'Formspree', 'Netlify'],
            highlights: [{ num: '95+', label: 'Lighthouse Score' }, { num: '100%', label: 'Responsive' }, { num: '6+', label: 'Animations' }],
            liveUrl: 'https://jasam-com.netlify.app/',
        },
        'web-dev-platform': {
            title: 'Web Dev Practice Platform',
            image: 'web.png',
            tags: ['React', 'JavaScript', 'API'],
            overview: 'An interactive web development practice platform featuring a live code editor with instant preview and an integrated AI chatbot to help developers learn and debug.',
            challenge: 'Building a real-time code editor that renders HTML/CSS/JS instantly in a sandboxed iframe without any server-side processing.',
            solution: 'Used iframes with srcdoc for sandboxed code execution, integrated an AI chatbot API for contextual help, and built the UI with React for fast state updates.',
            tech: ['React', 'JavaScript', 'CodeMirror', 'AI API', 'CSS3', 'Netlify'],
            highlights: [{ num: 'Live', label: 'Code Preview' }, { num: 'AI', label: 'Chatbot' }, { num: '3', label: 'Supported Langs' }],
            liveUrl: 'https://undefined71-com.netlify.app/',
        },
        'modern-login': {
            title: 'Modern Login System',
            image: 'log.png',
            tags: ['UI/UX', 'CSS', 'Auth'],
            overview: 'A sleek, secure authentication interface with beautiful glassmorphism design, smooth micro-animations, and a polished user experience that makes logging in delightful.',
            challenge: 'Creating a login system that feels modern and trustworthy while remaining accessible and performant across all screen sizes.',
            solution: 'Applied glassmorphism effects with CSS backdrop-filter, added input validation with real-time feedback, and used GSAP for buttery smooth transitions.',
            tech: ['HTML5', 'CSS3', 'JavaScript', 'CSS Animations', 'Form Validation'],
            highlights: [{ num: 'Glass', label: 'UI Design' }, { num: '100%', label: 'Accessible' }, { num: '60fps', label: 'Animations' }],
            liveUrl: 'https://undefined-web-com.netlify.app/',
        },
        'travel-blog': {
            title: 'Travel Blog Platform',
            image: 'blog.png',
            tags: ['HTML', 'CSS', 'Blog'],
            overview: 'A fully responsive travel blog platform with stunning hero images, article cards, dark mode support, and an elegant reading experience optimized for all devices.',
            challenge: 'Designing a content-heavy blog that still feels light, fast, and visually stunning without overwhelming the reader.',
            solution: 'Used a clean editorial layout with generous whitespace, optimized all images with lazy loading, and implemented a smooth dark mode toggle with CSS variables.',
            tech: ['HTML5', 'CSS3', 'JavaScript', 'CSS Grid', 'Dark Mode', 'Netlify'],
            highlights: [{ num: 'Fast', label: 'Load Time' }, { num: 'Dark', label: 'Mode' }, { num: '100%', label: 'Responsive' }],
            liveUrl: 'https://blogingwebsite55.netlify.app/',
        },
        'team-blog': {
            title: 'Team Blog Website',
            image: 'image copy.png',
            tags: ['UI/UX', 'CSS', 'Team'],
            overview: 'A collaborative team blog website built with Team Hexa, featuring a modern layout, author profiles, categorized articles, and seamless navigation.',
            challenge: 'Coordinating a multi-author blog design that maintains consistent styling while allowing each team member\'s content to shine.',
            solution: 'Created a shared design system with CSS components, standardized author card layouts, and built reusable article templates for consistency.',
            tech: ['HTML5', 'CSS3', 'JavaScript', 'Netlify', 'Responsive Design'],
            highlights: [{ num: 'Team', label: 'Collaboration' }, { num: 'Multi', label: 'Author' }, { num: 'Modern', label: 'Design' }],
            liveUrl: 'https://team-hexa-blog-website.netlify.app/',
        },
    };

    // Create modal HTML
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'caseModal';
        modal.className = 'case-modal';
        modal.innerHTML = `
            <div class="case-modal-box">
                <div class="case-modal-hero">
                    <img id="caseHeroImg" src="" alt="">
                    <button class="case-modal-close-btn" id="caseModalClose"><i class="fas fa-times"></i></button>
                    <div class="case-modal-hero-overlay">
                        <div class="case-hero-title">
                            <h2 id="caseTitleText"></h2>
                            <div class="case-hero-tags" id="caseHeroTags"></div>
                        </div>
                    </div>
                </div>
                <div class="case-modal-body">
                    <div class="case-section">
                        <h4><i class="fas fa-eye"></i> Overview</h4>
                        <p id="caseOverview"></p>
                    </div>
                    <div class="case-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> The Challenge</h4>
                        <p id="caseChallenge"></p>
                    </div>
                    <div class="case-section">
                        <h4><i class="fas fa-lightbulb"></i> The Solution</h4>
                        <p id="caseSolution"></p>
                    </div>
                    <div class="case-section">
                        <h4><i class="fas fa-code"></i> Tech Stack</h4>
                        <div class="case-tech-grid" id="caseTech"></div>
                    </div>
                    <div class="case-section">
                        <h4><i class="fas fa-chart-bar"></i> Highlights</h4>
                        <div class="case-highlights" id="caseHighlights"></div>
                    </div>
                </div>
                <div class="case-modal-footer">
                    <button class="btn btn-secondary" id="caseModalCloseFooter" style="padding:12px 28px;">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <a id="caseLiveLink" href="#" target="_blank" class="btn btn-primary" style="padding:12px 28px;">
                        <span>Live Project</span><i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('caseModalClose').addEventListener('click', closeCase);
        document.getElementById('caseModalCloseFooter').addEventListener('click', closeCase);
        modal.addEventListener('click', e => { if (e.target === modal) closeCase(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });
    }

    function openCase(key) {
        const data = caseStudies[key];
        if (!data) return;

        document.getElementById('caseHeroImg').src = data.image;
        document.getElementById('caseTitleText').textContent = data.title;

        const tagsEl = document.getElementById('caseHeroTags');
        tagsEl.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');

        document.getElementById('caseOverview').textContent = data.overview;
        document.getElementById('caseChallenge').textContent = data.challenge;
        document.getElementById('caseSolution').textContent = data.solution;

        const techEl = document.getElementById('caseTech');
        techEl.innerHTML = data.tech.map(t => `<div class="case-tech-badge">${t}</div>`).join('');

        const hlEl = document.getElementById('caseHighlights');
        hlEl.innerHTML = data.highlights.map(h => `
            <div class="case-highlight-card">
                <div class="num">${h.num}</div>
                <div class="label">${h.label}</div>
            </div>
        `).join('');

        document.getElementById('caseLiveLink').href = data.liveUrl;

        const modal = document.getElementById('caseModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCase() {
        const modal = document.getElementById('caseModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Add "View Case Study" buttons to each project card
    function addCaseButtons() {
        const projectMap = [
            { title: 'Team Blog', key: 'team-blog' },
            { title: 'Personal Portfolio', key: 'personal-portfolio' },
            { title: 'Web Dev Practice', key: 'web-dev-platform' },
            { title: 'Modern Login', key: 'modern-login' },
            { title: 'Travel Blog', key: 'travel-blog' },
            { title: 'Varification', key: 'modern-login' },
        ];

        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
            const info = card.querySelector('.project-info');
            if (!info) return;
            const key = projectMap[i] ? projectMap[i].key : 'personal-portfolio';
            const btn = document.createElement('button');
            btn.className = 'view-case-btn';
            btn.innerHTML = `<i class="fas fa-folder-open"></i> View Case Study`;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openCase(key);
            });
            info.appendChild(btn);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        createModal();
        addCaseButtons();
    });
})();