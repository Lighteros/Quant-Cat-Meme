(() => {
  const DESK = {
    ca: "0xb573953fdf84906c041e8a2b8343989d97e738b7",
    pair: "0x1E46DBB1E9d0A908848D8757e565A1B0618aE590",
  };

  const dexBase = "https://dexscreener.com/ethereum";
  const dexUrl = DESK.pair ? `${dexBase}/${DESK.pair}` : dexBase;
  const uniUrl = DESK.ca
    ? `https://app.uniswap.org/swap?chain=ethereum&outputCurrency=${DESK.ca}`
    : "https://app.uniswap.org/swap?chain=ethereum";

  const setHref = (id, href) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  };
  setHref("buy", uniUrl);
  setHref("dex", dexUrl);
  setHref("dex-open", dexUrl);
  setHref("dex-dock", dexUrl);
  setHref("uni-dock", uniUrl);

  const frame = document.getElementById("dex-frame");
  if (frame) {
    frame.src = `${dexUrl}?embed=1&loadChartSettings=0&trades=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15`;
  }
  const label = document.getElementById("dex-label");
  if (label) label.textContent = DESK.pair ? `dexscreener.com/ethereum/${DESK.pair}` : "dexscreener.com/ethereum";

  const caEl = document.getElementById("ca");
  const copyBtn = document.getElementById("copy");
  if (DESK.ca && caEl && copyBtn) {
    caEl.textContent = DESK.ca;
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(DESK.ca);
        copyBtn.textContent = "Copied";
        copyBtn.classList.add("ok");
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("ok");
        }, 1400);
      } catch {
        copyBtn.textContent = "Failed";
      }
    });
  }

  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".toggle");
  const links = document.getElementById("links");
  const onScroll = () => nav.classList.toggle("stuck", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  toggle?.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const sheen = document.getElementById("sheen");
  window.addEventListener(
    "pointermove",
    (e) => {
      sheen?.style.setProperty("--mx", `${e.clientX}px`);
      sheen?.style.setProperty("--my", `${e.clientY}px`);
    },
    { passive: true }
  );

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("on");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const canvas = document.getElementById("tape");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const candles = [];
  const nodes = [];
  let w = 0;
  let h = 0;
  let last = 0;

  const resize = () => {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const spawnCandle = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    candles.push({
      x: Math.random() * vw,
      y: vh * (0.18 + Math.random() * 0.7),
      body: 18 + Math.random() * 54,
      wick: 10 + Math.random() * 28,
      w: 3 + Math.random() * 4,
      up: Math.random() > 0.48,
      a: 0,
      life: 0,
      max: 220 + Math.random() * 260,
    });
  };

  for (let i = 0; i < 28; i += 1) spawnCandle();
  for (let i = 0; i < 36; i += 1) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    });
  }

  const draw = (t) => {
    if (t - last > 90 && candles.length < 42) {
      spawnCandle();
      last = t;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > window.innerWidth) n.vx *= -1;
      if (n.y < 0 || n.y > window.innerHeight) n.vy *= -1;
    });

    ctx.lineWidth = 0.6;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          ctx.strokeStyle = `rgba(232,234,239,${(1 - d / 140) * 0.12})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach((n) => {
      ctx.fillStyle = "rgba(232,234,239,0.28)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = candles.length - 1; i >= 0; i -= 1) {
      const c = candles[i];
      c.life += 1;
      c.a = c.life < 30 ? c.life / 30 : c.life > c.max - 40 ? (c.max - c.life) / 40 : 1;
      if (c.life > c.max) {
        candles.splice(i, 1);
        continue;
      }
      const color = c.up ? `rgba(220,224,232,${0.16 * c.a})` : `rgba(140,146,156,${0.14 * c.a})`;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - c.wick);
      ctx.lineTo(c.x, c.y + c.body + c.wick);
      ctx.stroke();
      ctx.fillRect(c.x - c.w / 2, c.y, c.w, c.body);
    }

    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();
