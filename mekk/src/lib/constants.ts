export const SITE = {
    name: 'Muhammed Mekky',
    title: 'Marketing Automation Strategist & Performance Trainer',
    tagline: 'CREATE. AUTOMATE. GROW.',
    subtitle: 'Build Smarter. Scale Faster.',
    email: 'Contact@muhammedmekky.com',
    url: 'https://muhammedmekky.com',
};

export const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About Me', href: '/about' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Lectures', href: '/lectures' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Consultation', href: '/book' },
    { label: 'Email Me', href: 'mailto:contact@muhammedmekky.com' },
    { label: 'WhatsApp', href: 'https://wa.me/201016629910' },
];

export const ABOUT = {
    sectionNumber: '01',
    sideLabel: 'The Strategy Behind The System',
    quote:
        'I help businesses and individuals build smarter, scalable systems — bridging marketing, technology, and people.',
    paragraphs: [
        'I am a marketing automation strategist and performance trainer who helps businesses and individuals build smarter, scalable systems.',
        'With years of experience across marketing, automation, and AI-driven workflows, I have empowered startups and teams to grow efficiently and work intelligently.',
        'I bring a unique mix of creative strategy, technical precision, and human-centered training — bridging the gap between marketing, technology, and people.',
        'Beyond building systems, I teach them. Through my workshops and lectures, I share practical frameworks for automating marketing, scaling performance, and integrating AI into real-world workflows.',
    ],
};

export const SERVICES = {
    sectionNumber: '02',
    sideLabel: 'What I Build',
    title: 'WHAT I CAN DO FOR YOU?',
    subtitle: 'I help teams design scalable systems and growth engines.',
    items: [
        {
            icon: '⚙️',
            title: 'AI & Automation',
            description:
                'Design intelligent workflows that eliminate repetitive tasks. From chatbots to full marketing-automation stacks, I build systems that work while you sleep.',
        },
        {
            icon: '📢',
            title: 'Digital Marketing',
            description:
                'Data-driven campaigns across paid, organic, and content channels. Strategy-first, metrics-obsessed, results-guaranteed.',
        },
        {
            icon: '🖥️',
            title: 'Web Design & Development',
            description:
                'Beautiful, high-performance websites that convert. From portfolios to e-commerce, every pixel is intentional.',
        },
        {
            icon: '👥',
            title: 'Automated Community Growth',
            description:
                'Build and nurture online communities using automated workflows that drive loyalty, word-of-mouth, and sustainable growth.',
        },
        {
            icon: '🔧',
            title: 'Team Enablement & Workflow',
            description:
                'Design internal tools, documentation, and SOPs that make your team 10x more productive.',
        },
        {
            icon: '🎓',
            title: 'Training & Workshops',
            description:
                'Hands-on sessions on AI, automation, Notion, and modern productivity. From startups to corporate teams.',
        },
    ],
};

export const STATS = [
    { number: 7, suffix: '+', label: 'Years of Experience' },
    { number: 284, suffix: '+', label: 'Completed Projects' },
    { number: 263, suffix: '+', label: 'Global Clients' },
    { number: 2400, suffix: '+', label: 'People Impacted' },
];

export const PROJECTS = {
    sectionNumber: '03',
    sideLabel: 'Selected Work',
    title: 'FEATURED PROJECTS',
    items: [
        {
            title: 'Ninja GenZ',
            slug: 'ninja-genz',
            category: 'Agency Management SaaS',
            description:
                'An all-in-one workspace and management platform built specifically for modern digital agencies.',
            longDescription: 'Ninja GenZ is a powerful, highly flexible agency management platform. Designed to be the central nervous system for creative and digital agencies, it offers dynamic workspaces, real-time collaboration, and complex task tracking in a minimal, intuitive interface. Just like Notion, it relies on a block-based concept and high-performance state synchronization.',
            image: '/images/projects/ninja-genz.webp',
            color: '#FF003C',
            tools: ['React 18', 'Zustand', 'WebSockets', 'Tailwind CSS'],
            results: ['Sub-10ms UI interactions', 'Flawless real-time block sync', 'Scalable component design'],
            liveUrl: 'https://ninjawy.vercel.app/auth',
        },
        {
            title: 'Greenschat AI',
            slug: 'greenschat',
            category: 'AI Integration',
            description:
                'A state-of-the-art AI chatbot utilizing RAG architecture to support dynamic customer inquiries.',
            longDescription: 'Greenschat is a paradigm shift in automated support. We engineered a full stack RAG (Retrieval-Augmented Generation) system integrated into a chat interface, providing accurate, contextual responses across the brand\'s knowledge base.',
            image: '/images/projects/greenschat.webp',
            color: '#2B9348',
            tools: ['React', 'Python', 'LangChain', 'OpenAI'],
            results: ['90% resolution rate via AI', 'Sub-second response latency', 'Full context-aware RAG pipeline'],
            liveUrl: 'http://greenschat.muhammedmekky.com/',
        },
        {
            title: 'Next Academy',
            slug: 'next-academy',
            category: 'EdTech Platform',
            description:
                'A comprehensive educational portal offering seamless course delivery and student management.',
            longDescription: 'Next Academy is a scalable EdTech platform with robust architecture. We implemented custom learning management features, intuitive dashboards, and smooth video playback systems to optimize the modern e-learning experience.',
            image: '/images/projects/next-academy.webp',
            color: '#0A2463',
            tools: ['Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
            results: ['Supports 5k+ concurrent students', 'HD video streaming integration', '99.9% uptime rating'],
            liveUrl: 'https://www.nextacademyedu.com/',
        },
        {
            title: 'Qudraat Shabab',
            slug: 'qudraat-shabab',
            category: 'Community Platform & Educational',
            description:
                'An empowering digital hub supporting youth initiatives and educational development.',
            longDescription: 'Qudraat Shabab connects aspiring youth with resources, events, and mentors. We built a fast, scalable web application tailored for accessibility and heavy content distribution to serve young communities effectively.',
            image: '/images/projects/qudraat-shabab.webp',
            color: '#FFB800',
            tools: ['React', 'Firebase', 'Material UI', 'Node.js'],
            results: ['10k+ active youth members', 'Accessible UI for diverse audiences', '40% increase in event registrations'],
            liveUrl: 'https://qudraat-shabab.web.app/',
        },
        {
            title: 'Mahmoud Bravo',
            slug: 'mahmoud-bravo',
            category: 'Coaching & Consulting',
            description:
                'A bold, modern personal brand platform for business coaching and thought leadership.',
            longDescription: 'The Mahmoud Bravo platform acts as a central hub for his courses, coaching services, and speaking engagements. The design uses strong contrast and authoritative typography to reflect his expertise in the market.',
            image: '/images/projects/mahmoud-bravo.webp',
            color: '#E63946',
            tools: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Stripe'],
            results: ['Seamless course enrollment flow', 'Modernized brand identity', 'High-ticket client close rate up 25%'],
            liveUrl: 'https://www.mahmoudbravo.com/',
        },
        {
            title: 'Mo7a Art',
            slug: 'mo7a-art',
            category: 'Digital Gallery',
            description:
                'A sprawling, immersive digital portfolio for contemporary artist Mohammed Moustafa Abdeldaiem.',
            longDescription: 'Mo7a Art is built like a cinematic walk-through of a gallery. The site embraces minimalism, large typography, and staggered image reveals to pace the user\'s journey through abstract and fine art collections.',
            image: '/images/projects/mo7a-art.webp',
            color: '#A68A61',
            tools: ['Figma', 'Next.js', 'GSAP', 'Vercel'],
            results: ['40% increase in portfolio views', 'Featured in design showcase', '3x more gallery inquiries'],
            liveUrl: 'https://artmo7.godaddysites.com/',
        },
        {
            title: 'Chef Ahmed Tarek',
            slug: 'chef-ahmed-tarek',
            category: 'Personal Brand',
            description:
                'A sophisticated culinary portfolio and booking system for private dining experiences.',
            longDescription: 'Chef Ahmed Tarek\'s brand demanded elegance. We created a visually striking, editorial-style website featuring smooth scroll animations and high-resolution photography, allowing clients to seamlessly browse menus and book private events.',
            image: '/images/projects/chef-ahmed-tarek.webp',
            color: '#73563F',
            tools: ['Next.js', 'GSAP', 'Figma', 'Vercel'],
            results: ['5x increase in private dining bookings', 'Average session duration of 4+ minutes', 'Zero bounce on mobile'],
            liveUrl: 'https://chef-ahmedtarek.godaddysites.com/',
        },
        {
            title: 'Forbed Online',
            slug: 'forbed-online',
            category: 'E-Commerce Redesign',
            description:
                'Premium online platform for luxury bedding and mattresses, completely reimagined for modern retail.',
            longDescription: 'Forbed needed a digital transformation to reflect their luxury brand positioning. We overhauled the shop experience with an immersive, intuitive interface focused on high-quality product visualization and a frictionless checkout flow.',
            image: '/images/projects/forbed-online.webp',
            color: '#4051B5',
            tools: ['Figma', 'Next.js', 'Shopify', 'React'],
            results: ['200% increase in lead generation', 'Bounce rate dropped by 45%', 'Brand perception improved significantly'],
            liveUrl: 'https://forbedonline.com/',
        },
        {
            title: 'Groovon',
            slug: 'groovon',
            category: 'Music Platform',
            description:
                'A sleek, modern music streaming interface designed for seamless audio discovery.',
            longDescription: 'Groovon is a conceptual music streaming application that prioritizes user experience above all. The design features a highly responsive UI with uninterrupted audio playback state management, leveraging modern React patterns to ensure smooth transitions between playlists and artist pages.',
            image: '/images/projects/groovon.webp',
            color: '#1DB954',
            tools: ['React', 'Next.js', 'Tailwind CSS', 'Redux'],
            results: ['Sub-100ms interface rendering', 'Persistent audio state architecture', 'High-engagement UI flow'],
            liveUrl: 'https://github.com/m2kky/Groovon',
        },
        {
            title: 'Green Studio Portfolio',
            slug: 'v0-green-studio',
            category: 'Agency Portfolio',
            description:
                'A sophisticated, AI-assisted portfolio design showcasing creative agency work.',
            longDescription: 'Green Studio needed a cutting-edge portfolio. By leveraging Next.js and Tailwind, we created a lightning-fast, visually arresting showcase that highlights continuous animations and a premium, dark-mode-first aesthetic.',
            image: '/images/projects/v0-green-studio.webp',
            color: '#10B981',
            tools: ['Next.js', 'React', 'Tailwind', 'Framer Motion'],
            results: ['Perfect Lighthouse score', 'Complex scroll-linked animations', 'Maximized conversion surface'],
            liveUrl: 'https://gs9agency.vercel.app/',
        },
        {
            title: 'Dietty Store',
            slug: 'dietty-store',
            category: 'Health E-Commerce',
            description:
                'Optimized online store scaling the sales of healthy food products and dietary supplements.',
            longDescription: 'Dietty Store required a hyper-optimized funnel. We redesigned their e-commerce experience to highlight nutritional facts cleanly, reducing friction to purchase and boosting mobile conversion rates significantly.',
            image: '/images/projects/dietty-store.webp',
            color: '#2A9D8F',
            tools: ['Shopify', 'Liquid', 'JavaScript', 'CSS3'],
            results: ['Cart abandonment reduced by 15%', 'Mobile conversion surged 40%', 'Streamlined checkout process'],
            liveUrl: 'https://diettystore.com/',
        },
        {
            title: 'Matrix Headphone',
            slug: 'matrix-headphone',
            category: 'E-Commerce Store',
            description:
                'High-conversion Shopify store designed for premium audio equipment and accessories.',
            longDescription: 'Matrix targets audiophiles requiring top-tier tech. We designed a moody, premium Shopify experience highlighting product specs through dynamic layouts, interactive media, and optimized performance for global selling.',
            image: '/images/projects/matrix-headphone.webp',
            color: '#1A1A1A',
            tools: ['Shopify', 'Liquid', 'Figma', 'Tailwind CSS'],
            results: ['Mobile-first responsive design', 'Under 2s load time', 'Increased checkout rates by 35%'],
            liveUrl: 'https://matrix-headphone.myshopify.com/password',
        },
        {
            title: 'Masko0on',
            slug: 'masko0on',
            category: 'Apparel Brand',
            description:
                'An edgy, streetwear-focused Shopify storefront built to handle high-traffic product drops.',
            longDescription: 'For Masko0on, brand identity is everything. The Shopify store was customized heavily to feature a dark-mode aesthetic, striking typography, and lightning-fast product pages designed specifically for rapid checkout.',
            image: '/images/projects/masko0on.webp',
            color: '#111111',
            tools: ['Shopify', 'Liquid', 'Figma', 'GSAP'],
            results: ['Handled 1k+ concurrent users on launch', 'Immersive dark-mode UX', 'Increased average order value'],
            liveUrl: 'https://masko0on.myshopify.com/',
        },
        {
            title: 'Ausraah',
            slug: 'ausraah',
            category: 'Web Application',
            description:
                'A dedicated community application bridging families through smart services and connection tools.',
            longDescription: 'Ausraah required a very specific UX designed for family units. We built a React-powered frontend with deep focus on mobile optimization, friendly interfaces, and real-time interaction capabilities.',
            image: '/images/projects/ausraah.webp',
            color: '#00B4D8',
            tools: ['React', 'Firebase', 'Tailwind CSS', 'PWA'],
            results: ['Mobile-first app experience', 'Real-time chatting capabilities', 'User-friendly family interfaces'],
            liveUrl: 'http://ausraah.vercel.app/',
        },
        {
            title: 'Radwa Muhammed',
            slug: 'radwa-muhammed',
            category: 'Personal Portfolio & E-Shop',
            description:
                'A vibrant showcase for a creative professional highlighting skills, projects, and personal voice.',
            longDescription: 'Radwa\'s portfolio needed to be as expressive as her work. We created a colorful, interactive experience that highlights her unique projects through custom animations and a highly personalized layout structure.',
            image: '/images/projects/radwa-muhammed.webp',
            color: '#D90429',
            tools: ['React', 'Framer Motion', 'Tailwind CSS', 'Vercel'],
            results: ['Bespoke interactive animations', 'Zero layout shifts', 'Award-winning design flow'],
            liveUrl: 'https://www.radwamuhammed.com/',
        },
        {
            title: 'Yara Fathy',
            slug: 'yara-fathy',
            category: 'Personal Site',
            description:
                'An elegant, sophisticated online presence for an elite makeup artist.',
            longDescription: 'Yara Fathy\'s website serves as a high-end booking portal and portfolio. The design leverages soft tones, parallax scrolling, and flawless image galleries to convey luxury and professionalism in the beauty industry.',
            image: '/images/projects/yara-fathy.webp',
            color: '#CDB4DB',
            tools: ['Next.js', 'Tailwind', 'GSAP', 'Booking API'],
            results: ['Automated booking integrations', 'Gallery load times under 1.5s', 'Premium brand positioning'],
            liveUrl: 'http://yarafathy.com/',
        },
        {
            title: 'Ramadan Majlis',
            slug: 'ramadan-majlis',
            category: 'Event Landing Page',
            description:
                'A seasonal, highly-engaging event platform created specifically for the holy month\'s activities.',
            longDescription: 'This sub-platform of Next Academy required a thematic design. We crafted an atmospheric, culturally resonant landing page that drove high registration numbers for daily webinars and community sessions.',
            image: '/images/projects/ramadan-majlis.webp',
            color: '#CA6702',
            tools: ['React', 'Tailwind', 'Framer Motion'],
            results: ['Over 10,000 seasonal signups', 'Thematic UI & UX design', 'High user retention rates'],
            liveUrl: 'https://ramadanmajlis.nextacademyedu.com/',
        },
        {
            title: 'Scarpe Handmade',
            slug: 'scarpe-handmade-marketing',
            category: 'Growth Marketing & CRO',
            description:
                'Full-funnel growth marketing and conversion rate optimization for a premium handcrafted leather shoe brand.',
            longDescription: 'Scarpe Handmade is a boutique leather footwear brand where every pair is handstitched by artisans. Our role was to engineer the entire growth engine — from performance marketing campaigns to CRO audits on the Shopify storefront, resulting in measurable revenue uplift and a stronger brand footprint.',
            image: '/images/projects/scarpe-handmade.webp',
            color: '#B55D2B',
            tools: ['Shopify', 'CRO', 'Performance Marketing', 'Data Analysis'],
            results: ['Revenue increased 60% in 3 months', 'Conversion rate doubled', 'ROAS of 5.2x on paid campaigns'],
            liveUrl: 'https://scarpehandmade.com/',
        },
    ],
};

export const CASE_STUDIES = {
    sectionNumber: '03.5',
    sideLabel: 'Deep Dives',
    title: 'CASE STUDIES',
    items: [
        {
            title: 'Automating a 6-Figure Agency',
            category: 'Efficiency',
            description: 'A deep dive into the systems and workflows that scaled a marketing agency by 300%.',
            image: '/images/projects/groovon.webp',
            slug: 'automating-agency',
            challenge: 'The agency was drowning in manual processes — client onboarding took 3 days, reporting was done in spreadsheets, and the team spent 60% of their time on repetitive tasks instead of creative strategy.',
            solution: 'We designed and implemented a full automation stack: automated client onboarding via Zapier + Notion, real-time reporting dashboards, AI-powered content scheduling, and a custom CRM workflow that reduced response time to under 1 hour.',
            results: ['300% revenue growth in 8 months', '60% reduction in operational overhead', 'Client onboarding time reduced from 3 days to 2 hours', 'Team freed up 25+ hours per week for creative work'],
        },
        {
            title: 'Global Community Growth',
            category: 'Engagement',
            description: 'How we built a community of 50k+ active members from scratch in 12 months.',
            image: '/images/projects/qudraat-shabab.webp',
            slug: 'community-growth',
            challenge: 'Starting from zero — no existing audience, no brand recognition, and a highly competitive niche. The goal was to build a thriving, engaged community that would become a self-sustaining growth engine.',
            solution: 'We implemented a three-phase strategy: Phase 1 was content seeding with high-value educational posts. Phase 2 was community activation through challenges and AMAs. Phase 3 was automated onboarding funnels that turned followers into active participants.',
            results: ['50k+ active members in 12 months', '85% monthly retention rate', 'Community-driven content generates 40% of all engagement', 'Zero paid acquisition — 100% organic growth'],
        },
    ],
};

export const TESTIMONIALS = [
    {
        quote:
            'Mekky transformed our entire marketing workflow. What used to take us days now runs on autopilot.',
        author: 'Ahmed K.',
        role: 'Startup Founder',
        rating: 5,
    },
    {
        quote:
            'His workshops are game-changers. The team went from zero to confident with AI tools in just two sessions.',
        author: 'Sara M.',
        role: 'Marketing Director',
        rating: 5,
    },
    {
        quote:
            'The website he built for us wasn\'t just beautiful — it actually converted. Our leads tripled in the first month.',
        author: 'Omar T.',
        role: 'E-Commerce Owner',
        rating: 5,
    },
];

export const LECTURES = [
    {
        title: 'Automate Your Life',
        slug: 'automate-your-life',
        description:
            'A practical workshop on automating repetitive tasks using AI and no-code tools.',
        longDescription: 'This hands-on workshop takes participants from zero automation to building their first complete workflow. We cover the automation mindset, tool selection (Zapier, n8n, Make), practical use cases for email, social media, and data entry, and how to think in systems rather than tasks. Participants leave with 3 working automations they built themselves.',
        image: '/images/lectures/automate.jpg',
        duration: '3 hours',
        videoId: '1SWrZsQLnVmMJAMziddPzlNlTBXXLIAsw',
        topics: ['Automation Mindset', 'Zapier & n8n Basics', 'Email Automation', 'Social Media Scheduling', 'Building Your First Workflow'],
    },
    {
        title: 'Build Your Brand Using ChatGPT',
        slug: 'build-your-brand-chatgpt',
        description:
            'How to leverage ChatGPT to build, position, and grow your personal brand from scratch.',
        longDescription: 'In this workshop, we break down the exact frameworks for using ChatGPT as your brand strategist, copywriter, and content machine. From defining your brand voice to generating months of content in hours — this session gives you the playbook that agencies charge thousands for. Live demonstrations, real brand case studies, and actionable templates included.',
        image: '/images/lectures/brand-chatgpt.jpg',
        duration: '2.5 hours',
        videoId: '1oPENQooS8S4hUWJL8F_Ehc9W1yxi6Gyh',
        topics: ['Brand Positioning with AI', 'Content Strategy Automation', 'Social Media Copy Generation', 'Personal Brand Framework', 'ChatGPT Prompt Templates'],
    },
    {
        title: 'The Power of Prompts: From Prompt to Profit',
        slug: 'power-of-prompts',
        description:
            'Turning AI prompts into real business value — from creative outputs to revenue-generating systems.',
        longDescription: 'Most people write prompts. Few people make money from them. This session bridges that gap. We explore how to turn prompt engineering into a professional skill — building prompt libraries, creating AI-powered products, selling prompt-based services, and integrating prompts into client workflows. Real monetization strategies, not theory.',
        image: '/images/lectures/prompt-profit.jpg',
        duration: '2 hours',
        videoId: '1uh5T8nWn0cXjheG1q7AayGoiyStdxSjx',
        topics: ['Prompt as a Skill', 'Monetization Strategies', 'AI Product Design', 'Prompt Libraries for Clients', 'Scaling with AI Services'],
    },
    {
        title: 'Promptology Unlocked',
        slug: 'promptology-unlocked',
        description:
            'Advanced prompt engineering — mastering the art and science of communicating with AI models.',
        longDescription: 'The advanced follow-up to our intro session. Promptology Unlocked goes deep into the science behind effective prompting — chain-of-thought reasoning, few-shot learning, structured outputs, system prompts, and model-specific optimization. Participants practice with real business scenarios and leave with a comprehensive personal prompt library ready for production use.',
        image: '/images/lectures/promptology.jpg',
        duration: '2.5 hours',
        videoId: '1jIzzjfgrGogtUDgwthevStdhV7jlDN4Q',
        topics: ['Advanced Prompt Patterns', 'Chain of Thought Reasoning', 'Few-Shot Learning', 'System Prompt Architecture', 'Building a Prompt Library'],
    },
    {
        title: 'Introduction to Notion',
        slug: 'introduction-to-notion',
        description:
            'From zero to productive — a hands-on session on building your second brain with Notion.',
        longDescription: 'Notion is the ultimate productivity tool — but only if you know how to use it right. This workshop covers the fundamentals of databases, templates, relations, and formulas. By the end, every participant has a fully functioning personal dashboard, task manager, and knowledge base. We build together, step by step, live.',
        image: '/images/lectures/notion.jpg',
        duration: '2.5 hours',
        videoId: '1o1dFPpcKdOFfTvwXtkmBLINrgch0fBl2',
        topics: ['Notion Fundamentals', 'Database Design', 'Templates & Relations', 'Personal Dashboard', 'Team Collaboration'],
    },
    {
        title: 'Portfolio That Converts',
        slug: 'portfolio-that-converts',
        description:
            'How to build a portfolio that doesn\'t just look good — it gets you hired and closes deals.',
        longDescription: 'Your portfolio is your most powerful sales tool. In this session, we dissect what makes portfolios convert — from the psychology of first impressions to the structure that guides visitors toward action. Case studies, before/after redesigns, and a live portfolio audit. Every participant leaves with a clear action plan to rebuild their portfolio for results.',
        image: '/images/lectures/portfolio-converts.jpg',
        duration: '2 hours',
        videoId: '1Wy1evc9IbgGd7BTylQtERVciCn-VKgxB',
        topics: ['Portfolio Psychology', 'Converting Structure', 'Case Study Storytelling', 'Visual Hierarchy', 'CTA Optimization'],
    },
];

export const BLOGS = {
    sectionNumber: '04',
    sideLabel: 'Latest Insights',
    title: 'THE BLOG.',
    items: [
        {
            title: 'The Future of Marketing Automation',
            slug: 'future-of-marketing-automation',
            date: 'Feb 15, 2026',
            excerpt: 'How AI is reshaping how we build systems and scale businesses.',
            image: '/images/blog/automation.jpg',
            content: [
                'Marketing automation is no longer about scheduling social media posts. In 2026, AI-driven systems are handling everything from initial lead qualification to personalized content creation at scale.',
                'The businesses that will win aren\'t the ones with the biggest budgets — they\'re the ones with the smartest systems. Systems that learn from every interaction, optimize in real-time, and free up humans to do what they do best: think creatively and build relationships.',
                'The key shift? Moving from rule-based automation ("if this, then that") to intelligence-based automation ("understand the context, then decide"). This is where tools like n8n, combined with language models, become game-changers.',
            ],
        },
        {
            title: 'Mastering Notion for Teams',
            slug: 'mastering-notion-for-teams',
            date: 'Jan 28, 2026',
            excerpt: 'A guide to building collaborative workspaces that actually work.',
            image: '/images/blog/notion.jpg',
            content: [
                'Most teams use Notion like a fancy notepad. They create pages, dump text, and wonder why nobody can find anything. The problem isn\'t the tool — it\'s the architecture.',
                'Great Notion workspaces are designed like databases, not documents. Every piece of information has a type, a status, and relationships to other pieces. When you get this right, Notion becomes your team\'s single source of truth.',
                'In this guide, I walk through the exact setup I use for teams of 5-50: a unified task database, linked project trackers, automated status updates, and a dashboard that shows everyone exactly what matters right now.',
            ],
        },
        {
            title: 'Why Most Startups Fail at Scaling',
            slug: 'why-startups-fail-scaling',
            date: 'Jan 10, 2026',
            excerpt: 'The common pitfalls and how to build a scalable foundation early on.',
            image: '/images/blog/scaling.jpg',
            content: [
                'Scaling isn\'t about doing more of what works. It\'s about building systems that can handle more without you doing more. Most founders learn this the hard way.',
                'The three scaling killers I see most often: 1) Founder dependency — everything requires the founder\'s approval. 2) Manual processes disguised as "personal touch." 3) Tool fragmentation — 15 different apps that don\'t talk to each other.',
                'The fix? Build your operating system before you need it. Document processes, automate the repetitive, and create decision frameworks that let your team move fast without breaking things.',
            ],
        },
    ]
};

export const SOCIAL_LINKS = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/muhammedmekky' },
    { label: 'GitHub', href: 'https://github.com/m2kky' },
    { label: 'Email', href: 'mailto:contact@muhammedmekky.com' },
    { label: 'Facebook', href: 'https://www.facebook.com/muhammedmekky' },
    { label: 'Instagram', href: 'https://www.instagram.com/muhammedm2kky' },
];

export const SEO = {
    title: 'Muhammed Mekky — Marketing Automation Strategist & Performance Trainer',
    description:
        'Build smarter, scale faster. Expert in Marketing Automation, AI Workflows, Web Design, and Shopify. Helping businesses leverage ChatGPT, n8n, and automation tools to scale without manual effort.',
    keywords: [
        // Personal Name & Brand (English)
        'Muhammed Mekky', 'Mohamed Mekky', 'Muhammed Eissa Mekky', 'Mohamed Eissa', 'Muhammed Hassan Mekky', 'Mohamed Eissa Hassan', 'Mekky',

        // Personal Name & Brand (Arabic)
        'محمد مكي', 'محمد عيسي مكي', 'محمد عيسي', 'محمد حسن مكي', 'محمد عيسي حسن', 'محمد عيسي حسن مكي', 'مكي',

        // English - Core
        'Marketing Automation Strategist', 'AI Workflows', 'Performance Trainer',
        'Web Design', 'Digital Marketing', 'Automation Expert', 'AI for Business',

        // English - AI & Tools
        'AI Tools', 'AI Tutorials', 'ChatGPT prompting', 'Midjourney prompts',
        'n8n workflows', 'Zapier automations', 'Notion templates', 'AI agents',

        // English - Dev & E-commerce
        'Web Development with AI', 'Shopify Expert', 'Shopify SEO', 'Automated Community Growth', 'SEO Optimization',

        // Arabic - Core
        'أتمتة التسويق', 'تسويق إلكتروني', 'تحسين محركات البحث SEO', 'تصميم مواقع',

        // Arabic - AI & Tools
        'ذكاء اصطناعي', 'أدوات الذكاء الاصطناعي', 'شروحات AI', 'كورسات ذكاء اصطناعي',
        'شات جي بي تي', 'ميدجورني', 'ادوات AI مجانية', 'تسويق بالذكاء الاصطناعي',
        'n8n عربي', 'Notion بالعربي', 'Zapier شروحات',

        // Arabic - Business & E-commerce
        'أتمتة العمليات', 'انشاء متجر شوبيفاي', 'تطوير ويب بالذكاء الاصطناعي', 'تطوير متاجر شوبيفاي'
    ],
    image: '/images/og-preview.png',
};
