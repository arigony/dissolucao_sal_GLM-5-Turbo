/* ==========================================================
   DISSOLUÇÃO DE SAIS EM ÁGUA — Script Principal
   ========================================================== */

// ===== UTILIDADES =====
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function rand(min, max) { return Math.random() * (max - min) + min; }

// ===== CONFIGURAÇÃO DE CANVAS RESPONSIVO =====
function setupCanvas(canvas, aspectRatio) {
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = Math.round(w * aspectRatio);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w, h };
}

// ===== NAVEGAÇÃO =====
(function initNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const allLinks = links.querySelectorAll('a');

    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
    });

    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Scroll spy
    const sections = document.querySelectorAll('section, header');
    const navItems = allLinks;
    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navItems.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
})();

// ===== BARRA DE PROGRESSO DE SCROLL =====
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.getElementById('scrollProgress').style.width = pct + '%';
}, { passive: true });

// ===== ANIMAÇÕES DE REVELAÇÃO (SCROLL) =====
(function initReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ===== PARTÍCULAS DO HERO =====
(function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    let { ctx, w, h } = setupCanvas(canvas, 0.85);
    let particles = [];
    const colors = ['#2dd4a0', '#f97316', '#f59e0b', '#22c55e', '#fb923c'];

    function createParticles() {
        particles = [];
        const count = Math.min(60, Math.floor((w * h) / 3000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: rand(0, w), y: rand(0, h),
                vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
                r: rand(3, 8),
                color: colors[Math.floor(rand(0, colors.length))],
                type: Math.random() > 0.5 ? 'Na+' : 'Cl-',
                alpha: rand(0.3, 0.7)
            });
        }
    }
    createParticles();

    function drawHero() {
        ctx.clearRect(0, 0, w, h);

        // Conexões
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.strokeStyle = `rgba(45,212,160,${0.08 * (1 - dist / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Partículas
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;

            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            // Rótulo do íon
            if (p.r > 5) {
                ctx.fillStyle = '#080d0b';
                ctx.font = `bold ${Math.round(p.r * 1.1)}px "Space Grotesk"`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.type, p.x, p.y + 0.5);
            }
            ctx.globalAlpha = 1;
        });

        requestAnimationFrame(drawHero);
    }
    drawHero();

    window.addEventListener('resize', () => {
        ({ ctx, w, h } = setupCanvas(canvas, 0.85));
        createParticles();
    });
})();


// ===== ANIMAÇÃO DIDÁTICA =====
(function initDidaticAnimation() {
    const canvas = document.getElementById('didaticCanvas');
    let { ctx, w, h } = setupCanvas(canvas, 0.56);
    const cx = () => w / 2;
    const cy = () => h / 2;

    // Definição dos passos
    const steps = [
        { title: 'Cristal Iônico de NaCl', desc: 'O cloreto de sódio (NaCl) forma um cristal iônico tridimensional, onde íons Na⁺ (verde) e Cl⁻ (laranja) se alternam, unidos por forças eletrostáticas (ligação iônica).' },
        { title: 'Contato com a Água', desc: 'Quando o cristal entra em contato com a água, as moléculas de H₂O (vermelho = oxigênio, branco = hidrogênio) se aproximam da superfície do cristal.' },
        { title: 'Interação Polar', desc: 'A água é polar: o oxigênio (δ⁻) atrai o Na⁺, enquanto os hidrogênios (δ⁺) atraem o Cl⁻. As moléculas se orientam ao redor dos íons da superfície.' },
        { title: 'Dissociação Iônica', desc: 'As interações água-íon superam as forças do cristal. Os íons começam a se separar da estrutura, puxados pelas moléculas de água ao seu redor.' },
        { title: 'Hidratação Completa', desc: 'Cada íon liberado fica cercado por uma camada de hidratação — moléculas de água orientadas que estabilizam o íon em solução. O processo continua até a dissolução completa ou saturação.' }
    ];

    // Criar íons do cristal
    const rows = 4, cols = 4, spacing = 32;
    let ions = [];
    let waterMols = [];
    let currentStep = 0;
    let progress = 0; // 0 a 1 dentro do passo atual
    let playing = false;
    let animId = null;

    function buildIons() {
        ions = [];
        const offsetX = cx() - (cols - 1) * spacing / 2;
        const offsetY = cy() - (rows - 1) * spacing / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const homeX = offsetX + c * spacing;
                const homeY = offsetY + r * spacing;
                const distFromCenter = Math.sqrt(
                    Math.pow(c - (cols - 1) / 2, 2) + Math.pow(r - (rows - 1) / 2, 2)
                );
                const angle = Math.atan2(homeY - cy(), homeX - cx());
                ions.push({
                    homeX, homeY, x: homeX, y: homeY,
                    type: (r + c) % 2 === 0 ? 'Na+' : 'Cl-',
                    distFromCenter,
                    detachAngle: angle + rand(-0.4, 0.4),
                    detachDist: 80 + rand(20, 60),
                    detached: false
                });
            }
        }
        // Ordenar por distância do centro (mais externos primeiro)
        ions.sort((a, b) => b.distFromCenter - a.distFromCenter);
    }

    function buildWater() {
        waterMols = [];
        const count = 28;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = 90 + rand(0, 30);
            waterMols.push({
                angle,
                radius: r,
                targetIon: null,
                x: 0, y: 0,
                orientAngle: 0
            });
        }
    }

    buildIons();
    buildWater();

    // Desenhar íon
    function drawIon(x, y, type, radius, alpha) {
        radius = Math.max(2, radius);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = type === 'Na+' ? '#2dd4a0' : '#f97316';
        ctx.fill();
        // Brilho
        const g = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        g.addColorStop(0, 'rgba(255,255,255,0.25)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fill();
        // Rótulo
        if (radius > 7) {
            ctx.fillStyle = '#080d0b';
            ctx.font = `bold ${Math.round(radius * 0.95)}px "Space Grotesk"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(type, x, y + 0.5);
        }
        ctx.globalAlpha = 1;
    }

    // Desenhar ligação
    function drawBond(x1, y1, x2, y2, alpha) {
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = '#a3b8ad';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    // Desenhar molécula de água
    function drawWater(x, y, angle, scale, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        // Oxigênio
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Hidrogênios
        ctx.beginPath();
        ctx.arc(-5.5, -4.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#e4ede8';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5.5, -4.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#e4ede8';
        ctx.fill();

        // Ligações
        ctx.strokeStyle = 'rgba(228,237,232,0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-5.5, -4.5);
        ctx.moveTo(0, 0); ctx.lineTo(5.5, -4.5);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function render() {
        ctx.clearRect(0, 0, w, h);

        // Fundo sutil
        const bg = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), Math.max(w, h) * 0.6);
        bg.addColorStop(0, 'rgba(45,212,160,0.03)');
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const globalProgress = currentStep + progress; // 0 a 5

        // Calcular estados dos íons
        const maxDetachProgress = 3.5; // íons começam a se soltar a partir do passo 2.5
        ions.forEach((ion, idx) => {
            // Cada íon tem um threshold baseado na posição (externos primeiro)
            const threshold = 2.2 + (idx / ions.length) * 1.8;
            if (globalProgress > threshold) {
                ion.detached = true;
                const t = clamp((globalProgress - threshold) / 1.2, 0, 1);
                const et = easeInOut(t);
                ion.x = lerp(ion.homeX, ion.homeX + Math.cos(ion.detachAngle) * ion.detachDist, et);
                ion.y = lerp(ion.homeY, ion.homeY + Math.sin(ion.detachAngle) * ion.detachDist, et);
            } else {
                ion.detached = false;
                ion.x = ion.homeX;
                ion.y = ion.homeY;
            }
        });

        // Ligações entre íons do cristal
        for (let i = 0; i < ions.length; i++) {
            for (let j = i + 1; j < ions.length; j++) {
                if (!ions[i].detached && !ions[j].detached) {
                    const dx = ions[i].homeX - ions[j].homeX;
                    const dy = ions[i].homeY - ions[j].homeY;
                    if (Math.sqrt(dx * dx + dy * dy) < spacing * 1.5) {
                        drawBond(ions[i].x, ions[i].y, ions[j].x, ions[j].y, 1);
                    }
                }
            }
        }

        // Moléculas de água
        const waterAlpha = clamp((globalProgress - 0.5) / 0.5, 0, 1);
        if (waterAlpha > 0) {
            waterMols.forEach((wm, i) => {
                const targetIdx = i % ions.length;
                const ion = ions[targetIdx];
                if (ion.detached) {
                    // Orbitar o íon destacado
                    const orbitR = 18;
                    const orbitAngle = wm.angle + globalProgress * 0.5;
                    wm.x = ion.x + Math.cos(orbitAngle) * orbitR;
                    wm.y = ion.y + Math.sin(orbitAngle) * orbitR;
                    wm.orientAngle = orbitAngle + (ion.type === 'Na+' ? Math.PI : 0);
                } else {
                    // Posicionar ao redor do cristal
                    const r = wm.radius + Math.sin(globalProgress * 2 + i) * 8;
                    wm.x = cx() + Math.cos(wm.angle + globalProgress * 0.15) * r;
                    wm.y = cy() + Math.sin(wm.angle + globalProgress * 0.15) * r;
                    wm.orientAngle = wm.angle + globalProgress * 0.3;
                }
                drawWater(wm.x, wm.y, wm.orientAngle, 1, waterAlpha * 0.85);
            });
        }

        // Íons
        ions.forEach(ion => {
            drawIon(ion.x, ion.y, ion.type, 11, 1);
        });

        // Rótulos de polaridade (passo 2+)
        if (globalProgress > 1.8) {
            const labelAlpha = clamp((globalProgress - 1.8) / 0.5, 0, 1);
            ctx.globalAlpha = labelAlpha * 0.9;
            ctx.font = 'bold 11px "Space Grotesk"';
            ctx.textAlign = 'center';
            // Mostrar δ+ e δ- em algumas moléculas
            for (let i = 0; i < Math.min(6, waterMols.length); i++) {
                const wm = waterMols[i];
                // δ- no oxigênio
                ctx.fillStyle = '#ef4444';
                ctx.fillText('δ-', wm.x + 10, wm.y - 6);
                // δ+ nos hidrogênios
                ctx.fillStyle = '#e4ede8';
                ctx.fillText('δ+', wm.x - 10, wm.y - 12);
            }
            ctx.globalAlpha = 1;
        }
    }

    function animate() {
        if (playing) {
            progress += 0.003;
            if (progress >= 1) {
                progress = 0;
                currentStep++;
                if (currentStep >= steps.length) {
                    currentStep = steps.length - 1;
                    progress = 1;
                    playing = false;
                    updatePlayBtn();
                }
                updateStepUI();
            }
        }
        render();
        animId = requestAnimationFrame(animate);
    }

    function updateStepUI() {
        const step = steps[Math.min(currentStep, steps.length - 1)];
        document.getElementById('animStepTitle').textContent = step.title;
        document.getElementById('animStepDesc').textContent = step.desc;
        // Dots
        document.querySelectorAll('#animDots .dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentStep);
        });
    }

    function updatePlayBtn() {
        const btn = document.getElementById('animPlay');
        btn.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }

    // Criar dots
    const dotsEl = document.getElementById('animDots');
    steps.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Etapa ${i + 1}`);
        dot.addEventListener('click', () => {
            currentStep = i;
            progress = 0;
            playing = false;
            updatePlayBtn();
            updateStepUI();
        });
        dotsEl.appendChild(dot);
    });

    document.getElementById('animPlay').addEventListener('click', () => {
        if (currentStep >= steps.length - 1 && progress >= 1) {
            currentStep = 0;
            progress = 0;
            buildIons();
            buildWater();
        }
        playing = !playing;
        updatePlayBtn();
    });

    document.getElementById('animNext').addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            progress = 0;
            updateStepUI();
        }
    });

    document.getElementById('animPrev').addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            progress = 0;
            updateStepUI();
        }
    });

    animate();

    window.addEventListener('resize', () => {
        ({ ctx, w, h } = setupCanvas(canvas, 0.56));
        buildIons();
        buildWater();
    });
})();


// ===== SIMULAÇÃO INTERATIVA =====
(function initSimulation() {
    const beakerCanvas = document.getElementById('beakerCanvas');
    const graphCanvas = document.getElementById('graphCanvas');
    let bkr, grf; // {ctx, w, h}

    // Estado da simulação
    let state = {
        temperature: 25,
        saltAdded: 20,
        stirring: 50,
        dissolved: 0,
        running: false,
        time: 0,
        dataPoints: [],
        ions: [],
        saltCrystals: [],
        lastTimestamp: 0
    };

    function getSolubility(tempC) {
        // NaCl: ~35.7g a 0°C, ~39.2g a 100°C (aproximação linear)
        return 35.7 + (tempC / 100) * 3.5;
    }

    function resizeCanvases() {
        bkr = setupCanvas(beakerCanvas, 0.9);
        grf = setupCanvas(graphCanvas, 0.5);
    }
    resizeCanvases();

    // Controles
    const tempSlider = document.getElementById('tempSlider');
    const saltSlider = document.getElementById('saltSlider');
    const stirSlider = document.getElementById('stirSlider');

    tempSlider.addEventListener('input', () => {
        state.temperature = +tempSlider.value;
        document.getElementById('tempValue').textContent = state.temperature + ' °C';
        document.getElementById('statSolubility').textContent = getSolubility(state.temperature).toFixed(1) + ' g';
    });
    saltSlider.addEventListener('input', () => {
        state.saltAdded = +saltSlider.value;
        document.getElementById('saltValue').textContent = state.saltAdded + ' g';
        if (!state.running) {
            document.getElementById('statUndissolved').textContent = state.saltAdded.toFixed(1) + ' g';
        }
    });
    stirSlider.addEventListener('input', () => {
        state.stirring = +stirSlider.value;
        document.getElementById('stirValue').textContent = state.stirring + ' %';
    });

    // Botões
    document.getElementById('simStart').addEventListener('click', () => {
        if (state.running) {
            state.running = false;
            document.getElementById('simStart').innerHTML = '<i class="fa-solid fa-play"></i> Continuar';
        } else {
            state.running = true;
            document.getElementById('simStart').innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
            state.lastTimestamp = performance.now();
        }
    });

    document.getElementById('simReset').addEventListener('click', () => {
        state.dissolved = 0;
        state.running = false;
        state.time = 0;
        state.dataPoints = [];
        state.ions = [];
        state.saltCrystals = [];
        document.getElementById('simStart').innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
        updateStats();
    });

    function updateStats() {
        const sol = getSolubility(state.temperature);
        const undissolved = Math.max(0, state.saltAdded - state.dissolved);
        const sat = sol > 0 ? (state.dissolved / sol) * 100 : 0;
        document.getElementById('statDissolved').textContent = state.dissolved.toFixed(1) + ' g';
        document.getElementById('statUndissolved').textContent = undissolved.toFixed(1) + ' g';
        document.getElementById('statSolubility').textContent = sol.toFixed(1) + ' g';
        document.getElementById('statSaturation').textContent = Math.min(100, sat).toFixed(0) + ' %';
    }

    // Criar íons visuais
    function syncIons() {
        const targetCount = Math.floor(state.dissolved * 2.5); // ~2.5 íons por grama
        while (state.ions.length < targetCount) {
            const beakerLeft = bkr.w * 0.2;
            const beakerRight = bkr.w * 0.8;
            const beakerTop = bkr.h * 0.15;
            const beakerBottom = bkr.h * 0.85;
            state.ions.push({
                x: rand(beakerLeft + 10, beakerRight - 10),
                y: rand(beakerTop + 10, beakerBottom - 10),
                vx: rand(-0.5, 0.5),
                vy: rand(-0.5, 0.5),
                type: Math.random() > 0.5 ? 'Na+' : 'Cl-',
                r: rand(4, 7)
            });
        }
        while (state.ions.length > targetCount) {
            state.ions.pop();
        }

        // Cristais de sal não dissolvidos
        const undissolved = Math.max(0, state.saltAdded - state.dissolved);
        const targetCrystals = Math.floor(undissolved * 1.2);
        while (state.saltCrystals.length < targetCrystals) {
            state.saltCrystals.push({
                x: rand(bkr.w * 0.3, bkr.w * 0.7),
                y: rand(bkr.h * 0.72, bkr.h * 0.82),
                size: rand(3, 6),
                alpha: rand(0.4, 0.8)
            });
        }
        while (state.saltCrystals.length > targetCrystals) {
            state.saltCrystals.pop();
        }
    }

    // Desenhar béquer
    function drawBeaker() {
        const { ctx, w, h } = bkr;
        ctx.clearRect(0, 0, w, h);

        // Fundo
        ctx.fillStyle = '#050907';
        ctx.fillRect(0, 0, w, h);

        const bl = w * 0.18, br = w * 0.82;
        const bt = h * 0.12, bb = h * 0.88;
        const bw = br - bl, bh = bb - bt;

        // Água
        const waterTop = bt + bh * 0.08;
        const waterGrad = ctx.createLinearGradient(0, waterTop, 0, bb);
        waterGrad.addColorStop(0, 'rgba(30,120,180,0.25)');
        waterGrad.addColorStop(1, 'rgba(20,80,140,0.4)');
        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        // Ondulação da superfície
        const waveAmp = 2 + state.stirring * 0.04;
        ctx.moveTo(bl, waterTop);
        for (let x = bl; x <= br; x += 2) {
            const wave = Math.sin((x * 0.05) + state.time * (2 + state.stirring * 0.05)) * waveAmp;
            ctx.lineTo(x, waterTop + wave);
        }
        ctx.lineTo(br, bb);
        ctx.lineTo(bl, bb);
        ctx.closePath();
        ctx.fill();

        // Cristais de sal no fundo
        state.saltCrystals.forEach(c => {
            ctx.globalAlpha = c.alpha;
            ctx.fillStyle = 'rgba(220,230,240,0.7)';
            ctx.fillRect(c.x - c.size / 2, c.y - c.size / 2, c.size, c.size);
        });
        ctx.globalAlpha = 1;

        // Íons dissolvidos
        state.ions.forEach(ion => {
            // Movimento browniano
            const speed = 0.3 + (state.temperature / 100) * 0.8 + (state.stirring / 100) * 1.5;
            // Agitação circular
            if (state.stirring > 0 && state.running) {
                const centerX = (bl + br) / 2;
                const centerY = (waterTop + bb) / 2;
                const dx = ion.x - centerX;
                const dy = ion.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                ion.vx += (-dy / dist) * state.stirring * 0.002;
                ion.vy += (dx / dist) * state.stirring * 0.002;
            }

            ion.vx += rand(-0.15, 0.15) * speed;
            ion.vy += rand(-0.15, 0.15) * speed;
            ion.vx *= 0.95;
            ion.vy *= 0.95;
            ion.x += ion.vx;
            ion.y += ion.vy;

            // Confinar ao béquer
            const margin = 8;
            if (ion.x < bl + margin) { ion.x = bl + margin; ion.vx *= -0.5; }
            if (ion.x > br - margin) { ion.x = br - margin; ion.vx *= -0.5; }
            if (ion.y < waterTop + margin) { ion.y = waterTop + margin; ion.vy *= -0.5; }
            if (ion.y > bb - margin) { ion.y = bb - margin; ion.vy *= -0.5; }

            ctx.beginPath();
            ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI * 2);
            ctx.fillStyle = ion.type === 'Na+' ? '#2dd4a0' : '#f97316';
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Contorno do béquer
        ctx.strokeStyle = 'rgba(163,184,173,0.5)';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(bl - 6, bt);
        ctx.lineTo(bl, bt);
        ctx.lineTo(bl, bb);
        ctx.lineTo(br, bb);
        ctx.lineTo(br, bt);
        ctx.lineTo(br + 6, bt);
        ctx.stroke();

        // Marcações do béquer
        ctx.strokeStyle = 'rgba(163,184,173,0.2)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            const y = bt + bh * (i / 5);
            ctx.beginPath();
            ctx.moveTo(bl, y);
            ctx.lineTo(bl + 15, y);
            ctx.stroke();
        }

        // Rótulo
        ctx.fillStyle = 'rgba(163,184,173,0.5)';
        ctx.font = '12px "Space Grotesk"';
        ctx.textAlign = 'left';
        ctx.fillText('NaCl (aq)', bl + 4, bt + 18);
    }

    // Desenhar gráfico
    function drawGraph() {
        const { ctx, w, h } = grf;
        ctx.clearRect(0, 0, w, h);

        // Fundo
        ctx.fillStyle = '#0a0f0d';
        ctx.fillRect(0, 0, w, h);

        const pad = { top: 25, right: 25, bottom: 40, left: 55 };
        const gw = w - pad.left - pad.right;
        const gh = h - pad.top - pad.bottom;
        const sol = getSolubility(state.temperature);
        const maxY = Math.max(50, state.saltAdded + 5, sol + 5);
        const maxTime = Math.max(30, state.time + 5);

        // Grid
        ctx.strokeStyle = 'rgba(163,184,173,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + gh * (i / 5);
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(pad.left + gw, y);
            ctx.stroke();
        }
        for (let i = 0; i <= 5; i++) {
            const x = pad.left + gw * (i / 5);
            ctx.beginPath();
            ctx.moveTo(x, pad.top);
            ctx.lineTo(x, pad.top + gh);
            ctx.stroke();
        }

        // Eixos
        ctx.strokeStyle = 'rgba(163,184,173,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, pad.top + gh);
        ctx.lineTo(pad.left + gw, pad.top + gh);
        ctx.stroke();

        // Rótulos dos eixos
        ctx.fillStyle = 'rgba(163,184,173,0.6)';
        ctx.font = '11px "Space Grotesk"';
        ctx.textAlign = 'center';
        ctx.fillText('Tempo (s)', pad.left + gw / 2, h - 6);

        ctx.save();
        ctx.translate(14, pad.top + gh / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Massa dissolvida (g)', 0, 0);
        ctx.restore();

        // Valores do eixo Y
        ctx.textAlign = 'right';
        ctx.font = '10px "JetBrains Mono"';
        for (let i = 0; i <= 5; i++) {
            const val = maxY * (1 - i / 5);
            const y = pad.top + gh * (i / 5);
            ctx.fillText(val.toFixed(0), pad.left - 8, y + 3);
        }

        // Valores do eixo X
        ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            const val = maxTime * (i / 5);
            const x = pad.left + gw * (i / 5);
            ctx.fillText(val.toFixed(0), x, pad.top + gh + 18);
        }

        // Linha de solubilidade (tracejada)
        const solY = pad.top + gh * (1 - sol / maxY);
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pad.left, solY);
        ctx.lineTo(pad.left + gw, solY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rótulo da linha de solubilidade
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px "Space Grotesk"';
        ctx.textAlign = 'left';
        ctx.fillText('Limite: ' + sol.toFixed(1) + ' g', pad.left + gw - 100, solY - 6);

        // Curva de dissolução
        if (state.dataPoints.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#2dd4a0';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            state.dataPoints.forEach((pt, i) => {
                const x = pad.left + (pt.time / maxTime) * gw;
                const y = pad.top + gh * (1 - pt.dissolved / maxY);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Ponto atual
            const last = state.dataPoints[state.dataPoints.length - 1];
            const lx = pad.left + (last.time / maxTime) * gw;
            const ly = pad.top + gh * (1 - last.dissolved / maxY);
            ctx.beginPath();
            ctx.arc(lx, ly, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#2dd4a0';
            ctx.fill();
            // Brilho
            ctx.beginPath();
            ctx.arc(lx, ly, 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(45,212,160,0.15)';
            ctx.fill();
        }
    }

    // Loop principal da simulação
    function simLoop(timestamp) {
        if (state.running) {
            const dt = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05);
            state.lastTimestamp = timestamp;
            state.time += dt;

            const sol = getSolubility(state.temperature);
            const undissolved = Math.max(0, state.saltAdded - state.dissolved);

            if (undissolved > 0.01) {
                const tempFactor = 1 + (state.temperature / 100) * 2;
                const stirFactor = 0.15 + (state.stirring / 100) * 2.85;
                const concFactor = Math.max(0, 1 - state.dissolved / sol);
                const rate = 0.6 * tempFactor * stirFactor * concFactor;
                const amount = Math.min(rate * dt, undissolved, Math.max(0, sol - state.dissolved));
                state.dissolved = Math.min(state.dissolved + amount, sol, state.saltAdded);
            }

            // Registrar dados para gráfico (~2 pontos por segundo)
            if (state.dataPoints.length === 0 || state.time - state.dataPoints[state.dataPoints.length - 1].time > 0.5) {
                state.dataPoints.push({ time: state.time, dissolved: state.dissolved });
            }

            syncIons();
            updateStats();
        }

        drawBeaker();
        drawGraph();
        requestAnimationFrame(simLoop);
    }

    requestAnimationFrame(simLoop);
    updateStats();

    window.addEventListener('resize', () => {
        resizeCanvases();
        syncIons();
    });
})();


// ===== QUIZ FORMATIVO =====
(function initQuiz() {
    const questions = [
        {
            q: 'Qual tipo de ligação química mantém os íons unidos no cristal de NaCl?',
            opts: ['Ligação covalente', 'Ligação iônica', 'Ligação metálica', 'Ligação de hidrogênio'],
            correct: 1,
            feedback: 'O NaCl é formado por ligação iônica: o sódio (Na) doa um elétron para o cloro (Cl), formando Na⁺ e Cl⁻ que se atraem eletrostaticamente no retículo cristalino.'
        },
        {
            q: 'O que acontece quando o NaCl é colocado em água?',
            opts: [
                'Os íons se fundem formando novas moléculas',
                'O sal desaparece sem alteração molecular',
                'Os íons Na⁺ e Cl⁻ se separam e ficam cercados por moléculas de água',
                'O NaCl reage com a água formando ácido e base'
            ],
            correct: 2,
            feedback: 'Ocorre a dissociação iônica: os íons Na⁺ e Cl⁻ se separam do cristal e cada um fica envolto por moléculas de água (hidratação). Não há reação química — o processo é físico.'
        },
        {
            q: 'O que é uma "camada de hidratação"?',
            opts: [
                'Uma camada de gelo que se forma ao redor do sal',
                'O conjunto de moléculas de água que cercam um íon em solução',
                'Uma reação química entre o sal e a água',
                'A parte sólida do sal que não se dissolve'
            ],
            correct: 1,
            feedback: 'A camada de hidratação (esfera de solvatação) é formada por moléculas de água orientadas: o oxigênio (δ⁻) próximo ao Na⁺ e os hidrogênios (δ⁺) próximos ao Cl⁻, estabilizando os íons em solução.'
        },
        {
            q: 'Como a temperatura afeta a solubilidade do NaCl em água?',
            opts: [
                'Aumenta drasticamente com a temperatura',
                'Diminui com o aumento da temperatura',
                'Quase não muda — o NaCl tem solubilidade pouco sensível à temperatura',
                'A solubilidade é exatamente a mesma em qualquer temperatura'
            ],
            correct: 2,
            feedback: 'Diferente de muitos sais (como KNO₃), o NaCl tem curva de solubilidade quase plana: varia apenas de ~35,7 g/100g H₂O (0 °C) a ~39,2 g/100g H₂O (100 °C). Essa é uma característica notável do cloreto de sódio.'
        },
        {
            q: 'Quando uma solução atinge o ponto de saturação, o que ocorre ao adicionar mais sal?',
            opts: [
                'Todo o sal adicional se dissolve lentamente',
                'O sal adicional não se dissolve e permanece no fundo',
                'A água evapora para acomodar mais sal',
                'O sal se transforma em gás'
            ],
            correct: 1,
            feedback: 'Na saturação, a solução já dissolveu a quantidade máxima de soluto possível naquela temperatura. Qualquer sal adicional permanece sólido no fundo do recipiente, sem se dissolver.'
        },
        {
            q: 'Qual propriedade da água é essencial para a dissolução do NaCl?',
            opts: [
                'Sua cor transparente',
                'Sua polaridade',
                'Sua densidade',
                'Seu ponto de ebulição elevado'
            ],
            correct: 1,
            feedback: 'A polaridade da água — com polo positivo nos hidrogênios (δ⁺) e polo negativo no oxigênio (δ⁻) — é a propriedade fundamental que permite as interações eletrostáticas com os íons Na⁺ e Cl⁻, viabilizando a dissolução.'
        }
    ];

    let currentQ = 0;
    let score = 0;
    let answers = [];

    const container = document.getElementById('quizContainer');
    const questionEl = document.getElementById('quizQuestion');
    const optionsEl = document.getElementById('quizOptions');
    const feedbackEl = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('quizNext');
    const progressFill = document.getElementById('quizProgressFill');
    const counterEl = document.getElementById('quizCounter');
    const resultEl = document.getElementById('quizResult');

    function renderQuestion() {
        const q = questions[currentQ];
        questionEl.textContent = q.q;
        counterEl.textContent = `Questão ${currentQ + 1} de ${questions.length}`;
        progressFill.style.width = ((currentQ) / questions.length * 100) + '%';

        optionsEl.innerHTML = '';
        feedbackEl.classList.add('hidden');
        nextBtn.classList.add('hidden');

        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.addEventListener('click', () => selectAnswer(i));
            optionsEl.appendChild(btn);
        });
    }

    function selectAnswer(idx) {
        const q = questions[currentQ];
        const buttons = optionsEl.querySelectorAll('.quiz-option');
        const isCorrect = idx === q.correct;

        // Desabilitar todas as opções
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.correct) btn.classList.add('correct');
            if (i === idx && !isCorrect) btn.classList.add('incorrect');
            btn.setAttribute('aria-checked', i === idx ? 'true' : 'false');
        });

        // Feedback
        feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct-fb' : 'incorrect-fb');
        feedbackEl.innerHTML = `<strong>${isCorrect ? 'Correto!' : 'Incorreto.'}</strong> ${q.feedback}`;
        feedbackEl.classList.remove('hidden');

        if (isCorrect) score++;
        answers.push({ question: currentQ, selected: idx, correct: isCorrect });

        // Botão próxima
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = currentQ < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado';
        nextBtn.innerHTML = currentQ < questions.length - 1
            ? 'Próxima Questão <i class="fa-solid fa-arrow-right"></i>'
            : 'Ver Resultado <i class="fa-solid fa-trophy"></i>';
    }

    nextBtn.addEventListener('click', () => {
        currentQ++;
        if (currentQ < questions.length) {
            renderQuestion();
        } else {
            showResult();
        }
    });

    function showResult() {
        container.classList.add('hidden');
        resultEl.classList.remove('hidden');
        progressFill.style.width = '100%';

        const pct = score / questions.length;
        const iconEl = document.getElementById('resultIcon');
        const titleEl = document.getElementById('resultTitle');
        const descEl = document.getElementById('resultDesc');
        const numEl = document.getElementById('resultNumber');
        const breakdownEl = document.getElementById('resultBreakdown');

        numEl.textContent = score;

        if (pct >= 0.83) {
            iconEl.className = 'result-icon great';
            iconEl.innerHTML = '<i class="fa-solid fa-award"></i>';
            titleEl.textContent = 'Excelente!';
            descEl.textContent = 'Você demonstrou ótima compreensão do processo de dissolução de sais em água.';
        } else if (pct >= 0.5) {
            iconEl.className = 'result-icon good';
            iconEl.innerHTML = '<i class="fa-solid fa-star-half-stroke"></i>';
            titleEl.textContent = 'Bom resultado!';
            descEl.textContent = 'Você tem uma base sólida, mas pode revisar alguns conceitos para aprimorar seu entendimento.';
        } else {
            iconEl.className = 'result-icon low';
            iconEl.innerHTML = '<i class="fa-solid fa-book-open"></i>';
            titleEl.textContent = 'Continue estudando!';
            descEl.textContent = 'Releia os conceitos acima e tente novamente. A prática leva à maestria!';
        }

        breakdownEl.innerHTML = '';
        answers.forEach((a, i) => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `<i class="fa-solid ${a.correct ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                <span>Q${i + 1}: ${questions[i].q.substring(0, 60)}${questions[i].q.length > 60 ? '...' : ''}</span>`;
            breakdownEl.appendChild(div);
        });
    }

    document.getElementById('quizRetry').addEventListener('click', () => {
        currentQ = 0;
        score = 0;
        answers = [];
        resultEl.classList.add('hidden');
        container.classList.remove('hidden');
        renderQuestion();
    });

    renderQuestion();
})();