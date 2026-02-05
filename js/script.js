document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        html.classList.add('dark');
    }

    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // --- 2. Mobile Menu ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    mobileBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');
        } else {
            mobileMenu.classList.add('translate-x-full');
            mobileMenu.classList.remove('translate-x-0');
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            mobileMenu.classList.add('translate-x-full');
            mobileMenu.classList.remove('translate-x-0');
        });
    });

    // --- 3. Scroll Reveal Animation ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // --- 4. Portfolio Filtering ---
    const filterBtns = document.querySelectorAll('.portfolio-filter');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            filterBtns.forEach(b => {
                b.classList.remove('bg-primary-500', 'text-white', 'shadow-premium', 'scale-105');
                b.classList.add('bg-gray-50', 'dark:bg-[#272727]', 'text-gray-500', 'dark:text-gray-400', 'hover:bg-white', 'dark:hover:bg-gray-800');
            });
            btn.classList.remove('bg-gray-50', 'dark:bg-[#272727]', 'text-gray-500', 'dark:text-gray-400', 'hover:bg-white', 'dark:hover:bg-gray-800');
            btn.classList.add('bg-primary-500', 'text-white', 'shadow-premium', 'scale-105');

            const category = btn.getAttribute('data-filter');

            projectItems.forEach(item => {
                const itemCat = item.getAttribute('data-category');
                if (category === 'All' || itemCat.includes(category)) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });

    // --- 5. Contact Form Mock ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                alert('Thank you! Your message has been received.');
                contactForm.reset();
                btn.innerText = 'Message Sent';
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // --- 6. Chat Widget Mock ---
    const toggleChat = document.getElementById('toggle-chat');
    const closeChat = document.getElementById('close-chat');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');
    let isChatOpen = false;

    const toggleChatWindow = () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.remove('opacity-0', 'scale-95', 'translate-y-4', 'pointer-events-none', 'h-0', 'mb-0');
            chatWindow.classList.add('opacity-100', 'scale-100', 'translate-y-0');
            toggleChat.classList.add('rotate-90', 'bg-gray-200', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-white');
            toggleChat.classList.remove('bg-primary-500', 'text-white', 'animate-bounce-slow');
            // Change icon to X
            toggleChat.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
            lucide.createIcons();
        } else {
            chatWindow.classList.add('opacity-0', 'scale-95', 'translate-y-4', 'pointer-events-none', 'h-0', 'mb-0');
            chatWindow.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
            toggleChat.classList.remove('rotate-90', 'bg-gray-200', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-white');
            toggleChat.classList.add('bg-primary-500', 'text-white', 'animate-bounce-slow');
            toggleChat.innerHTML = '<i data-lucide="message-circle" class="w-7 h-7"></i>';
            lucide.createIcons();
        }
    };

    toggleChat.addEventListener('click', toggleChatWindow);
    closeChat.addEventListener('click', toggleChatWindow);

    const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add User Message
        const userDiv = document.createElement('div');
        userDiv.className = 'flex justify-end';
        userDiv.innerHTML = `<div class="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed bg-primary-500 text-white rounded-br-none">${text}</div>`;
        chatMessages.appendChild(userDiv);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Fake AI Response (Static Demo)
        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.className = 'flex justify-start';
            botDiv.innerHTML = `<div class="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm">
                Thanks for reaching out! Since this is a portfolio demo, I can't browse the web live, but I'd love to help you with KDP Services via the contact form!
            </div>`;
            chatMessages.appendChild(botDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    };

    sendChat.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // --- 7. Header Scroll Effect ---
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('bg-white/90', 'dark:bg-gray-900/90', 'backdrop-blur-md', 'shadow-sm', 'dark:border-b', 'dark:border-gray-800', 'py-3');
            header.classList.remove('bg-transparent', 'py-5');
        } else {
            header.classList.remove('bg-white/90', 'dark:bg-gray-900/90', 'backdrop-blur-md', 'shadow-sm', 'dark:border-b', 'dark:border-gray-800', 'py-3');
            header.classList.add('bg-transparent', 'py-5');
        }
    });

    // --- 8. Copyright Year ---
    document.getElementById('year').textContent = new Date().getFullYear();
});