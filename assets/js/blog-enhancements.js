/* ============================================================
   Blog Enhancements: reading progress, copy buttons, tag filter
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Reading progress bar ---------- */
    function initReadingProgress() {
        var bar = document.querySelector('.reading-progress');
        if (!bar) return;
        var article = document.querySelector('.article-content, .article-body, main, body');
        var ticking = false;

        function update() {
            var docH = document.documentElement.scrollHeight - window.innerHeight;
            if (docH <= 0) { bar.style.width = '0%'; return; }
            var pct = Math.min(100, Math.max(0, (window.scrollY / docH) * 100));
            bar.style.width = pct.toFixed(2) + '%';
            ticking = false;
        }
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
    }

    /* ---------- Inject copy buttons ---------- */
    var COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    function attachCopyButtons() {
        var blocks = document.querySelectorAll('.code-block');
        blocks.forEach(function (block) {
            if (block.querySelector('.code-copy')) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'code-copy';
            btn.setAttribute('aria-label', 'Copy code to clipboard');
            btn.innerHTML = COPY_SVG + '<span class="label">Copy</span>';

            btn.addEventListener('click', function () {
                var codeEl = block.querySelector('code');
                if (!codeEl) return;
                var text = codeEl.textContent || '';
                var done = function () {
                    btn.classList.add('is-copied');
                    btn.innerHTML = CHECK_SVG + '<span class="label">Copied</span>';
                    setTimeout(function () {
                        btn.classList.remove('is-copied');
                        btn.innerHTML = COPY_SVG + '<span class="label">Copy</span>';
                    }, 1800);
                };
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }
                function fallbackCopy() {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'absolute';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
                    document.body.removeChild(ta);
                }
            });
            block.appendChild(btn);
        });
    }

    /* ---------- Tag filter on /blog/ index ---------- */
    function initTagFilter() {
        var container = document.querySelector('.tag-filter');
        if (!container) return;
        var items = Array.prototype.slice.call(document.querySelectorAll('.article-item'));
        if (!items.length) return;

        // Build category counts
        var counts = {};
        items.forEach(function (it) {
            var cat = (it.getAttribute('data-category') || '').trim();
            if (!cat) return;
            counts[cat] = (counts[cat] || 0) + 1;
        });

        // Friendly label map (snake/kebab → Title Case)
        function pretty(cat) {
            return cat.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        }

        // Render: "All" chip first, then each category chip
        var html = ['<span class="tag-filter-label">Filter:</span>'];
        html.push('<button type="button" class="tag-chip is-active" data-filter="all">' +
                  'all <span class="count">' + items.length + '</span></button>');
        Object.keys(counts).sort().forEach(function (cat) {
            html.push('<button type="button" class="tag-chip" data-filter="' + cat + '">' +
                      pretty(cat) + ' <span class="count">' + counts[cat] + '</span></button>');
        });
        container.innerHTML = html.join('');

        // Add no-results message (only if not already present in this container)
        var noResults = document.getElementById('filterNoResults');
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'filterNoResults';
            noResults.className = 'no-results';
            noResults.textContent = '// no articles in this category';
            // Insert into articlesContainer parent so it sits below the grid
            var grid = document.getElementById('articlesContainer');
            if (grid && grid.parentNode) grid.parentNode.appendChild(noResults);
        }

        function apply(filter) {
            var visible = 0;
            items.forEach(function (it) {
                var cat = (it.getAttribute('data-category') || '').trim();
                var show = (filter === 'all') || (cat === filter);
                it.classList.toggle('is-hidden', !show);
                if (show) visible++;
            });
            if (noResults) noResults.classList.toggle('is-shown', visible === 0);
        }

        container.addEventListener('click', function (e) {
            var btn = e.target.closest('.tag-chip');
            if (!btn) return;
            container.querySelectorAll('.tag-chip').forEach(function (c) { c.classList.remove('is-active'); });
            btn.classList.add('is-active');
            apply(btn.getAttribute('data-filter') || 'all');
        });

        // Allow deep-link via #category=... hash
        var initial = 'all';
        var m = /(?:^|[?#&])category=([^&]+)/.exec(location.hash + location.search);
        if (m) {
            var want = decodeURIComponent(m[1]);
            var match = container.querySelector('.tag-chip[data-filter="' + CSS.escape(want) + '"]');
            if (match) {
                container.querySelectorAll('.tag-chip').forEach(function (c) { c.classList.remove('is-active'); });
                match.classList.add('is-active');
                initial = want;
            }
        }
        apply(initial);
    }

    /* ---------- Init ---------- */
    function init() {
        attachCopyButtons();
        initReadingProgress();
        initTagFilter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
