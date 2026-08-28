/* ============================================================
   Minari Interview Popup
   Appears once per browser session, 60s after the visit began
   (timer persists across page navigation within the same session).
   ============================================================ */
(function () {
    const START_KEY = 'mina_visit_start';
    const SHOWN_KEY = 'mina_agent_shown';
    const DELAY_MS = 60000;

    if (sessionStorage.getItem(SHOWN_KEY)) return; // already shown this session — never again this session

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
            .minari-popup-overlay {
                position: fixed; inset: 0; z-index: 300;
                background: rgba(23,23,27,0.35);
                backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center;
                padding: 24px;
                opacity: 0;
                transition: opacity 0.4s ease;
            }
            .minari-popup-overlay.show { opacity: 1; }

            .minari-popup-card {
                width: 100%; max-width: 420px;
                background: #fff;
                border-radius: 24px;
                padding: 28px 26px 24px;
                box-shadow: 0 30px 70px rgba(17,17,17,0.3);
                transform: translateY(20px) scale(0.96);
                transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
            }
            .minari-popup-overlay.show .minari-popup-card { transform: translateY(0) scale(1); }

            .minari-popup-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
            .minari-popup-avatar {
                width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
                border: 1.5px solid rgba(23,23,27,0.08);
            }
            .minari-popup-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .minari-popup-who { line-height: 1.35; }
            .minari-popup-name { font-size: 14px; font-weight: 700; color: #17171B; }
            .minari-popup-status { font-size: 11.5px; color: #2E9B5C; }

            .minari-popup-close {
                position: absolute; top: 16px; right: 18px;
                background: none; border: none; cursor: pointer;
                font-size: 18px; color: rgba(23,23,27,0.35); line-height: 1;
            }
            .minari-popup-close:hover { color: rgba(23,23,27,0.7); }

            .minari-popup-text {
                font-size: 15px; line-height: 1.6; color: #17171B;
                margin-bottom: 22px;
            }

            .minari-popup-actions { display: flex; gap: 10px; }
            .minari-popup-btn {
                flex: 1;
                padding: 12px 16px; border-radius: 999px; border: none; cursor: pointer;
                font-size: 13.5px; font-weight: 700; font-family: inherit;
                transition: transform 0.15s ease, opacity 0.15s ease;
            }
            .minari-popup-btn.primary { background: #17171B; color: #fff; }
            .minari-popup-btn.primary:hover { transform: translateY(-1px); opacity: 0.85; }
            .minari-popup-btn.secondary { background: #F2F0EA; color: #17171B; }
            .minari-popup-btn.secondary:hover { background: #E9E6DD; }

            .minari-popup-form { display: none; flex-direction: column; gap: 10px; }
            .minari-popup-form.show { display: flex; }
            .minari-popup-form label { font-size: 12px; font-weight: 700; color: #17171B; margin-top: 4px; }
            .minari-popup-form input {
                width: 100%; padding: 11px 13px; border-radius: 10px;
                border: 1.5px solid rgba(23,23,27,0.15);
                font-family: inherit; font-size: 13.5px;
            }
            .minari-popup-form input:focus { outline: none; border-color: #17171B; }
            .minari-popup-form .minari-popup-submit {
                margin-top: 10px;
                padding: 13px 16px; border-radius: 999px; border: none; cursor: pointer;
                background: #17171B; color: #fff;
                font-size: 13.5px; font-weight: 700; font-family: inherit;
            }
            .minari-popup-submit:hover { opacity: 0.85; }

            .minari-popup-success {
                display: none;
                text-align: center;
                font-size: 14.5px; line-height: 1.6;
                padding: 10px 0 4px;
            }
            .minari-popup-success.show { display: block; }

            @media (max-width: 480px) {
                .minari-popup-card { padding: 24px 20px 20px; }
            }
        `;
        document.head.appendChild(style);
    }

    function buildPopup() {
        injectStyles();

        const overlay = document.createElement('div');
        overlay.className = 'minari-popup-overlay';

        overlay.innerHTML = `
            <div class="minari-popup-card" style="position:relative;">
                <button class="minari-popup-close" id="minariPopupClose" aria-label="Close">×</button>
                <div class="minari-popup-header">
                    <div class="minari-popup-avatar"><img src="img/minari-face.png" alt="Minari"></div>
                    <div class="minari-popup-who">
                        <div class="minari-popup-name">Minari</div>
                        <div class="minari-popup-status">● Online</div>
                    </div>
                </div>

                <div id="minariPopupStep1">
                    <div class="minari-popup-text">It's Minari again! Would you like to request an interview with Mina?</div>
                    <div class="minari-popup-actions">
                        <button class="minari-popup-btn primary" id="minariYes">Yes</button>
                        <button class="minari-popup-btn secondary" id="minariNo">No</button>
                    </div>
                </div>

                <div id="minariPopupNo" style="display:none;">
                    <div class="minari-popup-text">She might look entry-level, but Mina brings real, hands-on experience to the table. Want to reconsider?</div>
                    <div class="minari-popup-actions">
                        <button class="minari-popup-btn primary" id="minariReconsider">Okay, let's do it</button>
                        <button class="minari-popup-btn secondary" id="minariClose2">Maybe later</button>
                    </div>
                </div>

                <div id="minariPopupYes" style="display:none;">
                    <div class="minari-popup-text" style="margin-bottom:14px;">Great! Leave your name and email, and Mina will get back to you.</div>
                    <form class="minari-popup-form show" id="minariForm">
                        <input type="hidden" name="access_key" value="6f06663e-1ad9-4078-b679-90cc1be89fd0" />
                        <input type="hidden" name="subject" value="Interview request from portfolio popup" />
                        <label for="minariName">Name</label>
                        <input type="text" id="minariName" name="name" placeholder="Your name" required />
                        <label for="minariEmail">Email</label>
                        <input type="email" id="minariEmail" name="email" placeholder="you@company.com" required />
                        <button type="submit" class="minari-popup-submit">Send Request</button>
                    </form>
                    <div class="minari-popup-success" id="minariSuccess">Thank you! Mina will be in touch soon. 🎉</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('show')));

        function closePopup() {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 400);
        }

        overlay.querySelector('#minariPopupClose').addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });

        const step1 = overlay.querySelector('#minariPopupStep1');
        const stepNo = overlay.querySelector('#minariPopupNo');
        const stepYes = overlay.querySelector('#minariPopupYes');

        overlay.querySelector('#minariYes').addEventListener('click', () => {
            step1.style.display = 'none';
            stepYes.style.display = 'block';
        });

        overlay.querySelector('#minariNo').addEventListener('click', () => {
            step1.style.display = 'none';
            stepNo.style.display = 'block';
        });

        overlay.querySelector('#minariReconsider').addEventListener('click', () => {
            stepNo.style.display = 'none';
            stepYes.style.display = 'block';
        });

        overlay.querySelector('#minariClose2').addEventListener('click', closePopup);

        const form = overlay.querySelector('#minariForm');
        const successMsg = overlay.querySelector('#minariSuccess');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.minari-popup-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
            try {
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(Object.fromEntries(new FormData(form)))
                });
                form.classList.remove('show');
                form.style.display = 'none';
                successMsg.classList.add('show');
                setTimeout(closePopup, 2600);
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Request';
            }
        });

        sessionStorage.setItem(SHOWN_KEY, '1');
    }

    setTimeout(buildPopup, remaining);
})();
