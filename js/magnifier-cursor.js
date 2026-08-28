/* ============================================================
   Magnifying-glass cursor effect
   Replaces the default cursor with a circular lens that shows
   a zoomed view of whatever is underneath it.
   ============================================================ */
(function () {
    if ('ontouchstart' in window) return; // skip on touch devices — no real cursor there

    const LENS_SIZE = 130;
    const ZOOM = 2;

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            body.mina-magnifier-active { cursor: none; }
            body.mina-magnifier-active a,
            body.mina-magnifier-active button { cursor: none; }

            #mina-lens {
                position: fixed;
                width: ${LENS_SIZE}px; height: ${LENS_SIZE}px;
                border-radius: 50%;
                border: 2px solid rgba(17,17,17,0.25);
                box-shadow: 0 12px 30px rgba(17,17,17,0.25), inset 0 0 0 1px rgba(255,255,255,0.6);
                overflow: hidden;
                pointer-events: none;
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.2s ease;
                background: #fff;
            }
            #mina-lens.show { opacity: 1; }
            #mina-lens-inner {
                position: absolute;
                top: 0; left: 0;
                transform-origin: 0 0;
                pointer-events: none;
            }
            #mina-lens-inner * { pointer-events: none !important; }
            #mina-lens-dot {
                position: fixed;
                width: 6px; height: 6px; border-radius: 50%;
                background: rgba(17,17,17,0.6);
                pointer-events: none;
                z-index: 100000;
                transform: translate(-50%, -50%);
            }
        `;
        document.head.appendChild(style);
    }

    function stripScripts(node) {
        node.querySelectorAll('script').forEach(s => s.remove());
        // avoid duplicate id collisions being weird in devtools; keep as-is otherwise (visual only)
        return node;
    }

    function init() {
        injectStyles();
        document.body.classList.add('mina-magnifier-active');

        const lens = document.createElement('div');
        lens.id = 'mina-lens';
        const inner = document.createElement('div');
        inner.id = 'mina-lens-inner';
        lens.appendChild(inner);
        document.body.appendChild(lens);

        const dot = document.createElement('div');
        dot.id = 'mina-lens-dot';
        document.body.appendChild(dot);

        function rebuildClone() {
            inner.innerHTML = '';
            const clone = stripScripts(document.body.cloneNode(true));
            clone.classList.remove('mina-magnifier-active');
            clone.style.margin = '0';
            clone.style.width = document.documentElement.scrollWidth + 'px';
            clone.style.minHeight = document.documentElement.scrollHeight + 'px';
            clone.style.transform = `scale(${ZOOM})`;
            clone.style.transformOrigin = '0 0';
            // remove the lens/dot from the clone so it doesn't recurse
            const cloneLens = clone.querySelector('#mina-lens');
            if (cloneLens) cloneLens.remove();
            const cloneDot = clone.querySelector('#mina-lens-dot');
            if (cloneDot) cloneDot.remove();
            inner.appendChild(clone);
        }

        rebuildClone();
        // Keep the zoomed snapshot reasonably fresh without doing it on every frame
        let rebuildTimer = setInterval(rebuildClone, 4000);
        window.addEventListener('resize', rebuildClone);

        let visible = false;
        document.addEventListener('mousemove', (e) => {
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            const pageX = e.clientX + scrollX;
            const pageY = e.clientY + scrollY;

            lens.style.left = (e.clientX - LENS_SIZE / 2) + 'px';
            lens.style.top = (e.clientY - LENS_SIZE / 2) + 'px';
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';

            inner.style.left = (-(pageX * ZOOM) + LENS_SIZE / 2) + 'px';
            inner.style.top = (-(pageY * ZOOM) + LENS_SIZE / 2) + 'px';

            if (!visible) {
                visible = true;
                lens.classList.add('show');
            }
        });

        document.addEventListener('mouseleave', () => {
            visible = false;
            lens.classList.remove('show');
        });

        window.addEventListener('beforeunload', () => clearInterval(rebuildTimer));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
