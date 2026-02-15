# CLAUDE.md — Ahmed Elshafie Blog

## Project Overview

A static HTML/CSS/JS blog for **Ahmed Elshafie**, a Wireless Systems Engineer at Apple and IEEE Senior Member. The blog is called **WirelessHub** and covers wireless communications, signal processing, WiFi, 5G/LTE, deep learning, and mathematics.

## Repository Structure

```
Ahmed_Elshafie_Blog/
├── index.html              # Main homepage — tab-based layout (Articles / Podcasts / About)
├── theme.md                # Layout and color scheme reference/ideas
├── LICENSE
├── CLAUDE.md
├── data/
│   └── content.jsonl       # Source of truth for all articles and podcasts (search database)
├── podcasts/               # Audio files (.wav)
│   └── e1_{podcast_name}.wav
├── Articles/               # Individual article HTML files (25 articles)
│   ├── *.html              # One file per article
│   ├── Images/             # Article images
│   ├── article.html        # Article template/boilerplate
│   ├── article-styles.css  # Shared styles for article pages
│   ├── index.html          # Articles section index
│   ├── script.js           # Article page JS
│   └── styles.css          # Article page styles
└── UI/                     # Shared UI assets for the homepage
    ├── styles.css          # Main homepage stylesheet
    └── script.js           # Homepage JS (tabs, dark mode, search, podcast players)
```

## Tech Stack

- **Pure static HTML/CSS/JS** — no build tools, no frameworks, no npm
- **Fonts**: Inter (headings/body) + JetBrains Mono (code) via Google Fonts
- **No external JS frameworks** — vanilla JS only
- **Data**: `data/content.jsonl` loaded via `fetch()` at runtime for search

## Navigation / Tab System

The header has four top-level tabs handled by `UI/script.js` (`showTab()`):

| Tab | `data-tab` | Shows | Notes |
|-----|-----------|-------|-------|
| **Home** (default) | `home` | `#featured-section` + `#articles-section` (first 5 cards only) | No search, no categories |
| **Articles** | `articles` | `#categories-section` + `#articles-search-wrap` + `#articles-filter-bar` + `#articles-section` (all cards) | Full search + filter |
| **Podcasts** | `podcasts` | `#podcasts-section` | |
| **About** | `about` | `#about-section` | |

Each `<a>` in `.nav-categories` has a `data-tab` attribute that drives `showTab()`. `showTab('home')` is called on `DOMContentLoaded` to set the correct initial state.

## Content Database (`data/content.jsonl`)

Every article and podcast has one JSON line. This is the **single source of truth** for search.

### Article entry fields
```json
{
  "type": "article",
  "title": "...",
  "excerpt": "...",
  "url": "Articles/<slug>.html",
  "category": "...",
  "tags": ["tag1", "tag2"],
  "date": "Mon DD, YYYY",
  "readTime": "X min read",
  "podcast": "podcasts/<file>.wav"   // optional — only if a podcast exists for this article
}
```

### Podcast entry fields
```json
{
  "type": "podcast",
  "title": "...",
  "description": "...",
  "audio": "podcasts/<file>.wav",
  "articleUrl": "Articles/<slug>.html",
  "episode": 1,
  "tags": ["tag1"],
  "date": "Mon DD, YYYY",
  "duration": "MM:SS"
}
```

## Adding New Content

### Rules for `data/content.jsonl`
- One JSON object per line — **never** use multiline JSON
- `"type"` must be exactly `"article"` or `"podcast"`
- All file paths are **relative to the repo root** (e.g. `"Articles/foo.html"`, `"podcasts/foo.wav"`)
- Tags should be lowercase, short, and reuse existing terms where possible
- When a podcast is linked to an article, **both** entries must reference each other:
  - Article entry: add `"podcast": "podcasts/<file>.wav"`
  - Podcast entry: `"articleUrl": "Articles/<slug>.html"`
- Do not leave trailing commas or add a closing `]` — it is **not** a JSON array

### Adding a New Article (checklist)
1. Create `Articles/<slug>.html` using `Articles/article.html` as the template
2. Add `<link rel="stylesheet" href="../Articles/article-styles.css">` and `<script src="../Articles/script.js">` (paths relative to the file)
3. Add a `<div class="article-card">` in `index.html` inside `.articles-column` (insert at the top for newest-first ordering)
4. Append a new line to `data/content.jsonl` with `"type":"article"` and all required fields
5. If a podcast exists for this article, add `"podcast":"podcasts/<file>.wav"` to the JSONL entry and follow the podcast checklist below

### Adding a New Podcast (checklist)
1. Place the `.wav` (or `.mp3`) file in `podcasts/`
2. Add a `.podcast-card` block inside `<div class="podcasts-grid" id="podcasts-default-grid">` in `index.html`
3. Add a `.sidebar-podcast-item` block inside `.sidebar-podcast-list` in the sidebar (increment the number badge)
4. Append a new line to `data/content.jsonl` with `"type":"podcast"` and all required fields
5. If linked to an article, update that article's JSONL entry to include `"podcast":"podcasts/<file>.wav"`

### Updating the JSONL Database
- To edit metadata (title, tags, date, etc.) — edit the matching line in `data/content.jsonl` directly
- The search index updates automatically at runtime — no rebuild step needed
- Keep entries in the same order as they appear in `index.html` (newest first) for consistency

### Article Card Structure (index.html)
```html
<div class="article-card">
    <div class="card-tag <category-class>"><Category Label></div>
    <h3 class="card-title"><a href="Articles/<slug>.html">Title</a></h3>
    <p class="card-excerpt">Short description.</p>
    <div class="card-meta">
        <span>X min read</span>
        <span>•</span>
        <span>Mon DD, YYYY</span>
    </div>
</div>
```

### Podcast Card Structure (index.html — inside `#podcasts-default-grid`)
```html
<div class="podcast-card">
    <div class="podcast-episode-badge">Episode N</div>
    <h3 class="podcast-title">Title</h3>
    <p class="podcast-desc">Description.</p>
    <audio class="podcast-player" controls>
        <source src="podcasts/<file>.wav" type="audio/wav">
    </audio>
    <a href="Articles/<slug>.html" class="podcast-article-link">Read the article →</a>
</div>
```

### Sidebar Podcast Item Structure
```html
<div class="sidebar-podcast-item">
    <div class="sidebar-podcast-meta">
        <span class="sidebar-podcast-num">N</span>
        <span class="sidebar-podcast-title">Title</span>
    </div>
    <audio class="sidebar-podcast-audio" src="podcasts/<file>.wav" preload="none"></audio>
    <div class="sidebar-podcast-actions">
        <button class="sidebar-play-btn" onclick="toggleSidebarAudio(this)">▶ Play</button>
    </div>
    <div class="sidebar-podcast-progress-wrap">
        <div class="sidebar-podcast-progress-bar">
            <div class="sidebar-podcast-progress-fill"></div>
        </div>
        <div class="sidebar-podcast-time">
            <span class="sidebar-time-current">0:00</span>
            <span class="sidebar-time-total">--:--</span>
        </div>
    </div>
</div>
```

### Category Tag CSS Classes
- `wireless` — general wireless / signal processing / technology
- `wifi` — WiFi-specific articles
- `bluetooth` — Bluetooth articles
- `security` — security topics
- `troubleshooting` — troubleshooting guides
- `iot` — IoT / smart home

## Articles Tab — Filter Bar

Below the search box, the Articles tab has:
- **Category chips** (`#category-chips`) — built from DOM card tags at `DOMContentLoaded`, one chip per unique category + "All". Click to filter visible cards.
- **Sort buttons** (`.sort-btn`) — Default (DOM order) / Newest / Oldest, sorted by parsing the date span inside `.card-meta`.

Both are inside `#articles-filter-bar` and hidden on the Home tab.

## Featured Article

`#featured-section` — a dark hero card linking to "What Really Happens Between Transmission and Reception?" with `Articles/Images/Wireless_communcation_system.png`. Shown only on the **Home** tab, placed above the articles list.

## Sidebar Widgets

| Widget | Status |
|--------|--------|
| 🎙 Podcasts to Listen To | Active — up to 10 items, play/pause + progress bar |
| 📬 Weekly Newsletter | "Coming Soon" placeholder |
| 📚 Good Reads | Active — 6 curated article links |

## Search System

- Search bars live inside the **Articles** and **Podcasts** tab sections
- On input, `UI/script.js` fetches `data/content.jsonl` (once, cached), filters by `type`, and matches all query words against title + excerpt/description + tags + category
- Results are rendered using safe DOM methods (no `innerHTML` with dynamic data)
- If an article result has a linked podcast, a **▶ Listen** button appears inline
- Clearing the search restores the default article/podcast cards

## Design System

- **Layout**: Articles column (2fr) + sticky sidebar (1fr); tabs hide/show full sections
- **Light theme**: Background `#ffffff`, Primary `#3b82f6`, Accent `#8b5cf6`, Text `#0f172a`
- **Dark theme**: Background `#0f172a`, Primary `#60a5fa`, Accent `#a78bfa`, Text `#f1f5f9`
- **Headings**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)
- **Cards**: Subtle shadows, hover lift (`translateY(-5px)`), rounded corners (15px)

## Key UI Features

- **Dark mode toggle** — `#themeToggle`, persisted in `localStorage`, handled by `UI/script.js`
- **Tab navigation** — Articles / Podcasts / About; active state on `.category-link`
- **Podcast players** — sidebar mini-player (play/pause, progress bar, scrub, time); full player in Podcasts tab
- **Search** — live keyword search from JSONL database in Articles and Podcasts tabs
- **Newsletter** — "Coming Soon" state (no form yet)

## Existing Articles (25 total, as of Feb 2026)

| Slug | Title |
|------|-------|
| `wireless-transmission-reception` | What Really Happens Between Transmission and Reception? 🎙 |
| `fft-everyday-life` | Beauty of FFT in Everyday Life |
| `wireless-evolution-siso-mimo` | From SISO to MIMO |
| `alamouti-coding` | The Trick That Doubles Reliability |
| `adaptive-modulation-coding` | How AMC Keeps Links Alive |
| `channel-state-information-reality` | What Happens Between "Knowing the Channel" and Actually Using It? |
| `multi-link-operation-wifi` | Multi-Link Operation in Wi-Fi |
| `preamble-puncturing-wifi` | Preamble Puncturing in Wi-Fi |
| `resource-units-wifi` | Resource Units and Distributed Resource Units in Wi-Fi |
| `deep-learning-activation-functions` | The Design That Made Deep Learning Practical |
| `gps-relativity` | How Relativity Keeps GPS Accurate |
| `bayesian-estimation-crlb` | Guessing Within Limits |
| `keep-learning-when-behind` | Why You Should Keep Learning Even When You Feel Behind |
| `eigenvalues-eigenvectors-everyday-life` | Appreciating Eigenvalues and Eigenvectors in Everyday Life |
| `expectation-maximization-algorithm` | The Algorithm That Detects Hidden Data |
| `music-algorithm` | The Magic Behind MUSIC |
| `maximum-likelihood-estimation` | The Hidden Power Behind Smart Decisions |
| `angular-bins-mimo-systems` | Angular Bins in MIMO Systems |
| `automatic-gain-control` | Automatic Gain Control |
| `awgn-ultimate-limit` | The AWGN Channel: The Ultimate Benchmark |
| `breaking-ofdm-orthogonality` | Breaking OFDM Orthogonality |
| `coherence-wireless-communications` | Coherence in Wireless Communications |
| `evm-modern-wireless-systems` | Error Vector Magnitude in Modern Wireless Systems |
| `quantum-wireless-communication` | Quantum Wireless Communication |
| `redundancy-versions-harq` | Redundancy Versions in HARQ |

🎙 = has a linked podcast episode

## Existing Podcasts (2 total, as of Feb 2026)

| Episode | File | Linked Article |
|---------|------|----------------|
| 1 | `e1_wireless_channel.wav` | `wireless-transmission-reception` |
| 1 | `e2_snr_in_real_life.wav` | `snr-in-real-life` |