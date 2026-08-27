/* ============================================================
   Mina Agent Widget
   Appears once per browser session, 30s after the visit began
   (timer persists across page navigation within the same session).
   ============================================================ */
(function () {
    const START_KEY = 'mina_visit_start';
    const SHOWN_KEY = 'mina_agent_shown';
    const DELAY_MS = 30000;

    if (sessionStorage.getItem(SHOWN_KEY)) return; // already shown this session

    let start = sessionStorage.getItem(START_KEY);
    if (!start) {
        start = Date.now();
        sessionStorage.setItem(START_KEY, start);
    } else {
        start = parseInt(start, 10);
    }

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, DELAY_MS - elapsed);

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mina-agent-widget {
                position: fixed; bottom: 24px; right: 24px; z-index: 200;
                width: 300px;
                background: rgba(255,255,255,0.85);
                backdrop-filter: blur(18px) saturate(160%);
                -webkit-backdrop-filter: blur(18px) saturate(160%);
                border: 1px solid rgba(255,255,255,0.8);
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(17,17,17,0.18), 0 4px 14px rgba(17,17,17,0.08);
                padding: 18px 18px 16px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                color: #17171B;
                opacity: 0;
                transform: translateY(24px) scale(0.95);
                transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1);
            }
            .mina-agent-widget.show { opacity: 1; transform: translateY(0) scale(1); }
            .mina-agent-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
            .mina-agent-avatar {
                width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
                background: linear-gradient(135deg, #D9622B, #3B3776);
                display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 13px; color: #fff;
                box-shadow: 0 2px 8px rgba(17,17,17,0.12);
            }
            .mina-agent-text {
                font-size: 13px; line-height: 1.55; padding-top: 2px;
            }
            .mina-agent-close {
                position: absolute; top: 10px; right: 12px;
                background: none; border: none; cursor: pointer;
                font-size: 15px; color: rgba(23,23,27,0.35); line-height: 1;
                padding: 4px;
            }
            .mina-agent-close:hover { color: rgba(23,23,27,0.7); }
            .mina-agent-actions {
                display: flex; gap: 10px;
                position: relative;
            }
            .mina-agent-btn {
                display: inline-flex; align-items: center; justify-content: center;
                padding: 11px 16px; border-radius: 999px; border: none; cursor: pointer;
                font-size: 12.5px; font-weight: 700; font-family: inherit;
                transition: transform 0.15s ease, opacity 0.15s ease;
                text-decoration: none;
                flex: 1;
            }
            .mina-agent-btn.yes { background: #17171B; color: #F7F2E7; }
            .mina-agent-btn.yes:hover { transform: translateY(-1px); opacity: 0.85; }
            .mina-agent-btn.no {
                background: transparent; color: #17171B;
                border: 1.5px solid rgba(23,23,27,0.25);
                position: relative;
            }
            .mina-agent-btn.no.dodging { position: absolute; }

            @media (max-width: 480px) {
                .mina-agent-widget { left: 16px; right: 16px; width: auto; bottom: 16px; }
            }
        `;
        document.head.appendChild(style);
    }

    function buildWidget() {
        injectStyles();

        const wrap = document.createElement('div');
        wrap.className = 'mina-agent-widget';
        wrap.style.position = 'fixed';

        // figure out where "img/" resolves from (about.html and main.html are both at repo root)
        wrap.innerHTML = `
            <button class="mina-agent-close" aria-label="Close">×</button>
            <div class="mina-agent-top">
                <div class="mina-agent-avatar">M</div>
                <div class="mina-agent-text">Still exploring? Would you like to request an interview with Mina?</div>
            </div>
            <div class="mina-agent-actions">
                <a class="mina-agent-btn yes" id="minaAgentYes" href="main.html#contact">Yes</a>
                <button class="mina-agent-btn no" id="minaAgentNo" type="button">No</button>
            </div>
        `;

        document.body.appendChild(wrap);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => wrap.classList.add('show'));
        });

        wrap.querySelector('.mina-agent-close').addEventListener('click', () => {
            wrap.classList.remove('show');
            setTimeout(() => wrap.remove(), 400);
        });

        // "No" dodges the cursor so it's effectively unclickable
        const noBtn = wrap.querySelector('#minaAgentNo');
        const actions = wrap.querySelector('.mina-agent-actions');
        noBtn.addEventListener('mouseenter', () => {
            noBtn.classList.add('dodging');
            const bounds = actions.getBoundingClientRect();
            const btnW = noBtn.offsetWidth;
            const btnH = noBtn.offsetHeight;
            const maxX = Math.max(0, bounds.width - btnW);
            const maxY = Math.max(0, bounds.height - btnH + 30);
            noBtn.style.left = (Math.random() * maxX) + 'px';
            noBtn.style.top = (Math.random() * maxY - 15) + 'px';
        });
        noBtn.addEventListener('touchstart', (e) => {
            // mobile: no hover, so just nudge it away on tap-attempt too
            e.preventDefault();
            noBtn.dispatchEvent(new Event('mouseenter'));
        });

        sessionStorage.setItem(SHOWN_KEY, '1');
    }

    setTimeout(buildWidget, remaining);
})();
