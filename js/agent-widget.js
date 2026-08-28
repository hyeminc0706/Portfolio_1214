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

            .mina-404-toast {
                position: fixed; bottom: 24px; right: 24px; z-index: 210;
                max-width: 280px;
                background: #17171B; color: #F7F2E7;
                border-radius: 14px;
                padding: 14px 16px;
                font-size: 12.5px; line-height: 1.6; font-weight: 600;
                box-shadow: 0 20px 50px rgba(17,17,17,0.3);
                opacity: 0; transform: translateY(12px) scale(0.96);
                transition: opacity 0.35s ease, transform 0.35s ease;
            }
            .mina-404-toast.show { opacity: 1; transform: translateY(0) scale(1); }
            .mina-404-toast .code { color: #FF8A6B; font-weight: 800; margin-right: 4px; }
            .mina-404-toast button {
                margin-top: 10px; width: 100%;
                background: rgba(255,255,255,0.12); color: #F7F2E7;
                border: none; border-radius: 999px;
                padding: 8px 12px; font-size: 11.5px; font-weight: 700;
                cursor: pointer; font-family: inherit;
            }
            .mina-404-toast button:hover { background: rgba(255,255,255,0.2); }

            @media (max-width: 480px) {
                .mina-404-toast { left: 16px; right: 16px; max-width: none; bottom: 100px; }
            }

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
                <div class="mina-agent-text">Still here? Mina's already down the road — an interview could be next.<br><span style="opacity:0.7; font-size:12px;">아직 머무르고 계신가요? 미나는 이미 다음 걸음을 내딛고 있어요 — 다음은 인터뷰일 수도 있죠.</span></div>
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

        // "No" goes straight to the witty error toast (no dodging here — that's the intro's trick)
        const noBtn = wrap.querySelector('#minaAgentNo');

        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
            show404Toast();
        });

        function show404Toast() {
            const existing = document.querySelector('.mina-404-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'mina-404-toast';
            toast.innerHTML = `
                <span class="code">Error 404:</span>Option not found. Mina is too valuable to pass up. Try again?
                <button type="button">Try Again</button>
            `;
            document.body.appendChild(toast);
            requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

            const dismiss = () => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 350);
            };
            toast.querySelector('button').addEventListener('click', dismiss);
            setTimeout(dismiss, 5000);
        }

        sessionStorage.setItem(SHOWN_KEY, '1');
    }

    setTimeout(buildWidget, remaining);
})();
