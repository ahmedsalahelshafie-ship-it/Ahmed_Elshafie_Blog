// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);

// Update button emoji based on current theme
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Tab switching
const articlesSection = document.getElementById('articles-section');
const categoriesSection = document.getElementById('categories-section');
const featuredSection = document.getElementById('featured-section');
const podcastsSection = document.getElementById('podcasts-section');
const aboutSection = document.getElementById('about-section');
const articlesSearchWrap = document.getElementById('articles-search-wrap');
const articlesFilterBar = document.getElementById('articles-filter-bar');

function showTab(tab) {
    const isHome = tab === 'home';
    const isArticles = tab === 'articles';
    const isPodcasts = tab === 'podcasts';
    const isAbout = tab === 'about';

    featuredSection.style.display = isHome ? '' : 'none';
    categoriesSection.style.display = isArticles ? '' : 'none';
    articlesSection.style.display = (isHome || isArticles) ? '' : 'none';
    articlesSearchWrap.style.display = isArticles ? '' : 'none';
    if (articlesFilterBar) articlesFilterBar.style.display = isArticles ? '' : 'none';
    podcastsSection.style.display = isPodcasts ? '' : 'none';
    aboutSection.style.display = isAbout ? '' : 'none';

    // Home: show only first 10 article cards; Articles: show all
    const allCards = document.querySelectorAll('.articles-column .article-card');
    allCards.forEach((card, i) => {
        card.style.display = (isHome && i >= 5) ? 'none' : '';
    });
}

// Active category link
const categoryLinks = document.querySelectorAll('.category-link');
categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        categoryLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab || 'articles';
        showTab(tab);
    });
});

// Article card click animation
const articleCards = document.querySelectorAll('.article-card');
articleCards.forEach(card => {
    card.addEventListener('click', function() {
        console.log('Article clicked:', this.querySelector('.card-title').textContent);
        // Add your navigation logic here
    });
});

// Category cards click
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        console.log('Category clicked:', this.querySelector('h3').textContent);
        // Add your navigation logic here
    });
});


// Add scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
document.querySelectorAll('.article-card, .category-card, .sidebar-widget').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ── Content Search ───────────────────────────────────────────────────
let contentDB = null;

async function loadContentDB() {
    if (contentDB) return contentDB;
    const res = await fetch('data/content.jsonl');
    const text = await res.text();
    contentDB = text.trim().split('\n').map(line => JSON.parse(line));
    return contentDB;
}

function searchContent(query, type) {
    const q = query.toLowerCase().trim();
    if (!q || !contentDB) return [];
    return contentDB.filter(item => {
        if (item.type !== type) return false;
        const haystack = [
            item.title,
            item.excerpt || item.description || '',
            ...(item.tags || []),
            item.category || ''
        ].join(' ').toLowerCase();
        return q.split(/\s+/).every(word => haystack.includes(word));
    });
}

function makeListenBtn(audioSrc) {
    const btn = document.createElement('button');
    btn.className = 'search-result-podcast-btn';
    btn.textContent = '\u25B6 Listen';
    const audio = document.createElement('audio');
    audio.src = audioSrc;
    audio.preload = 'none';
    btn._audio = audio;
    btn.addEventListener('click', () => {
        document.querySelectorAll('.search-result-podcast-btn.playing').forEach(b => {
            if (b !== btn) {
                b.textContent = '\u25B6 Listen';
                b.classList.remove('playing');
                if (b._audio) b._audio.pause();
            }
        });
        if (audio.paused) {
            audio.play();
            btn.textContent = '\u23F8 Pause';
            btn.classList.add('playing');
            audio.onended = () => {
                btn.textContent = '\u25B6 Listen';
                btn.classList.remove('playing');
            };
        } else {
            audio.pause();
            btn.textContent = '\u25B6 Listen';
            btn.classList.remove('playing');
        }
    });
    return btn;
}

function buildResultCard(item) {
    const isArticle = item.type === 'article';

    const card = document.createElement('div');
    card.className = 'search-result-card';

    const tag = document.createElement('span');
    tag.className = 'search-result-tag';
    tag.textContent = isArticle ? item.category : ('Episode ' + item.episode);
    card.appendChild(tag);

    if (isArticle) {
        const link = document.createElement('a');
        link.className = 'search-result-title';
        link.href = item.url;
        link.textContent = item.title;
        card.appendChild(link);
    } else {
        const titleEl = document.createElement('span');
        titleEl.className = 'search-result-title';
        titleEl.style.cursor = 'default';
        titleEl.textContent = item.title;
        card.appendChild(titleEl);
    }

    const excerpt = document.createElement('p');
    excerpt.className = 'search-result-excerpt';
    excerpt.textContent = isArticle ? item.excerpt : item.description;
    card.appendChild(excerpt);

    const meta = document.createElement('div');
    meta.className = 'search-result-meta';

    const timeEl = document.createElement('span');
    timeEl.textContent = isArticle ? item.readTime : item.duration;
    meta.appendChild(timeEl);

    const dot = document.createElement('span');
    dot.textContent = '\u2022';
    meta.appendChild(dot);

    const dateEl = document.createElement('span');
    dateEl.textContent = item.date;
    meta.appendChild(dateEl);

    const audioSrc = isArticle ? item.podcast : item.audio;
    if (audioSrc) {
        meta.appendChild(makeListenBtn(audioSrc));
    }

    if (!isArticle && item.articleUrl) {
        const readLink = document.createElement('a');
        readLink.href = item.articleUrl;
        readLink.textContent = 'Read article';
        readLink.style.color = 'var(--accent-primary)';
        readLink.style.fontSize = '0.8rem';
        readLink.style.fontWeight = '600';
        meta.appendChild(readLink);
    }

    card.appendChild(meta);
    return card;
}

function renderSearchResults(results, container, type) {
    while (container.firstChild) container.removeChild(container.firstChild);
    if (results.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'search-no-results';
        msg.textContent = 'No ' + type + 's found. Try different keywords.';
        container.appendChild(msg);
        return;
    }
    results.forEach(item => container.appendChild(buildResultCard(item)));
}

function setupSearch(inputId, resultsId, defaultId, type) {
    const input = document.getElementById(inputId);
    const resultsEl = document.getElementById(resultsId);
    const defaultEl = document.getElementById(defaultId);
    if (!input || !resultsEl) return;

    input.addEventListener('input', async () => {
        await loadContentDB();
        const q = input.value.trim();

        if (!q) {
            resultsEl.style.display = 'none';
            while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild);
            if (defaultEl) defaultEl.style.display = '';
            const col = input.closest('.articles-column');
            if (col) col.querySelectorAll('.article-card').forEach(c => { c.style.display = ''; });
            if (type === 'podcast') {
                const grid = document.getElementById('podcasts-default-grid');
                if (grid) grid.querySelectorAll('.podcast-card').forEach(c => { c.style.display = ''; });
            }
            return;
        }

        const results = searchContent(q, type);
        renderSearchResults(results, resultsEl, type);
        resultsEl.style.display = 'flex';
        if (defaultEl) defaultEl.style.display = 'none';

        const col = input.closest('.articles-column');
        if (col) col.querySelectorAll('.article-card').forEach(c => { c.style.display = 'none'; });
        if (type === 'podcast') {
            const grid = document.getElementById('podcasts-default-grid');
            if (grid) grid.querySelectorAll('.podcast-card').forEach(c => { c.style.display = 'none'; });
        }
    });
}

// Category icons map (category name → emoji)
const CATEGORY_ICONS = {
    'Wireless Systems':      '📡',
    'Wireless':              '📶',
    'Signal Processing':     '〰️',
    'WiFi':                  '🛜',
    'Deep Learning':         '🧠',
    'Machine Learning':      '🤖',
    'Mathematics':           '📐',
    'Statistics':            '📊',
    'Statistics & Estimation': '📊',
    'Physics & Technology':  '⚛️',
    'Personal Growth':       '🌱',
    'Wireless History':      '🕰️',
    'Wireless Technology':   '📻',
};

function buildCategoryGrid(db) {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    // Count articles per category
    const counts = {};
    db.forEach(item => {
        if (item.type !== 'article') return;
        counts[item.category] = (counts[item.category] || 0) + 1;
    });

    // Sort by count desc, take top 5
    const top5 = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    while (grid.firstChild) grid.removeChild(grid.firstChild);

    top5.forEach(([cat, count]) => {
        const card = document.createElement('div');
        card.className = 'category-card';

        const icon = document.createElement('div');
        icon.className = 'category-icon';
        icon.textContent = CATEGORY_ICONS[cat] || '📁';
        card.appendChild(icon);

        const title = document.createElement('h3');
        title.textContent = cat;
        card.appendChild(title);

        const sub = document.createElement('p');
        sub.textContent = count + (count === 1 ? ' article' : ' articles');
        card.appendChild(sub);

        // Click → switch to Articles tab and filter by category
        card.addEventListener('click', () => {
            // Activate Articles tab
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-tab="articles"]').classList.add('active');
            showTab('articles');

            // Fill search input and trigger search
            const input = document.getElementById('articles-search');
            if (input) {
                input.value = cat;
                input.dispatchEvent(new Event('input'));
                input.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        grid.appendChild(card);
    });
}

// ── Article filter bar (category chips + sort) ────────────────────────
let activeCategory = 'All';
let activeSort = 'default';
let originalCardOrder = null;

function getCardDate(card) {
    const spans = card.querySelectorAll('.card-meta span');
    for (const s of spans) {
        const d = new Date(s.textContent.trim());
        if (!isNaN(d)) return d;
    }
    return new Date(0);
}

function applyFilterAndSort() {
    const col = document.querySelector('.articles-column');
    const cards = Array.from(col.querySelectorAll('.article-card'));

    // Restore original order first
    if (originalCardOrder) {
        originalCardOrder.forEach(c => col.appendChild(c));
    }

    // Sort
    const sorted = Array.from(col.querySelectorAll('.article-card'));
    if (activeSort === 'newest') {
        sorted.sort((a, b) => getCardDate(b) - getCardDate(a));
    } else if (activeSort === 'oldest') {
        sorted.sort((a, b) => getCardDate(a) - getCardDate(b));
    }
    sorted.forEach(c => col.appendChild(c));

    // Filter by category
    col.querySelectorAll('.article-card').forEach(card => {
        const tag = card.querySelector('.card-tag');
        const cat = tag ? tag.textContent.trim() : '';
        card.style.display = (activeCategory === 'All' || cat === activeCategory) ? '' : 'none';
    });
}

function buildFilterBar() {
    const bar = document.getElementById('articles-filter-bar');
    const chipsEl = document.getElementById('category-chips');
    if (!bar || !chipsEl) return;

    // Store original card order once
    const col = document.querySelector('.articles-column');
    originalCardOrder = Array.from(col.querySelectorAll('.article-card'));

    // Build unique categories from cards (preserve card order)
    const seen = new Set();
    const cats = ['All'];
    originalCardOrder.forEach(card => {
        const tag = card.querySelector('.card-tag');
        const cat = tag ? tag.textContent.trim() : '';
        if (cat && !seen.has(cat)) { seen.add(cat); cats.push(cat); }
    });

    while (chipsEl.firstChild) chipsEl.removeChild(chipsEl.firstChild);
    cats.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = 'category-chip' + (cat === 'All' ? ' active' : '');
        chip.textContent = cat;
        chip.addEventListener('click', () => {
            activeCategory = cat;
            chipsEl.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyFilterAndSort();
        });
        chipsEl.appendChild(chip);
    });

    // Sort buttons
    bar.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeSort = btn.dataset.sort;
            bar.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilterAndSort();
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    showTab('home');
    setupSearch('articles-search', 'articles-search-results', 'articles-default-heading', 'article');
    setupSearch('podcasts-search', 'podcasts-search-results', 'podcasts-default-grid', 'podcast');
    // Build filter bar from DOM immediately — does not need JSONL
    buildFilterBar();
    // Load JSONL for search, category grid, and podcast search
    try {
        await loadContentDB();
        buildCategoryGrid(contentDB);
    } catch (e) {
        console.warn('Could not load content.jsonl — search and category grid unavailable.', e);
    }
});
// ─────────────────────────────────────────────────────────────────────

// Sidebar podcast play/pause toggle
function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function initSidebarPodcast(item) {
    const audio = item.querySelector('.sidebar-podcast-audio');
    const fill  = item.querySelector('.sidebar-podcast-progress-fill');
    const bar   = item.querySelector('.sidebar-podcast-progress-bar');
    const cur   = item.querySelector('.sidebar-time-current');
    const tot   = item.querySelector('.sidebar-time-total');
    if (!audio || audio._initialized) return;
    audio._initialized = true;

    audio.addEventListener('loadedmetadata', () => {
        tot.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        fill.style.width = pct + '%';
        cur.textContent = formatTime(audio.currentTime);
    });

    bar.addEventListener('click', e => {
        const rect = bar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    });
}

function toggleSidebarAudio(btn) {
    const item = btn.closest('.sidebar-podcast-item');
    const audio = item.querySelector('.sidebar-podcast-audio');
    initSidebarPodcast(item);

    // Pause any other playing sidebar audio
    document.querySelectorAll('.sidebar-podcast-audio').forEach(a => {
        if (a !== audio && !a.paused) {
            a.pause();
            const b = a.closest('.sidebar-podcast-item').querySelector('.sidebar-play-btn');
            b.textContent = '▶ Play';
            b.classList.remove('playing');
        }
    });

    if (audio.paused) {
        audio.play();
        btn.textContent = '⏸ Pause';
        btn.classList.add('playing');
    } else {
        audio.pause();
        btn.textContent = '▶ Play';
        btn.classList.remove('playing');
    }

    audio.addEventListener('ended', () => {
        btn.textContent = '▶ Play';
        btn.classList.remove('playing');
        item.querySelector('.sidebar-podcast-progress-fill').style.width = '0%';
        item.querySelector('.sidebar-time-current').textContent = '0:00';
    }, { once: true });
}

// GoatCounter visitor counter (uses count.js built-in API to avoid CORS issues)
var _gcTimer = setInterval(function() {
    if (window.goatcounter && window.goatcounter.visit_count) {
        clearInterval(_gcTimer);
        window.goatcounter.visit_count({append: '#visitor-counter'});
    }
}, 100);

console.log('🚀 WirelessHub loaded successfully!');
