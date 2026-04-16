// PhishGuard AI — Frontend Logic
const API = 'http://localhost:8080/api';

// ── Particle canvas ──────────────────────────────────
(function () {
  const c = document.getElementById('particles');
  const x = c.getContext('2d');
  let W, H, pts = [];
  const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 50; i++) pts.push({
    x: Math.random() * 2000, y: Math.random() * 2000,
    vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
    r: Math.random() * 1.5 + .4, a: Math.random() * .35 + .08
  });
  (function draw() {
    x.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      x.fillStyle = 'rgba(0,210,255,' + p.a + ')'; x.fill();
    });
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[j].x, pts[j].y);
          x.strokeStyle = 'rgba(0,210,255,' + (.07 * (1 - d / 120)) + ')';
          x.lineWidth = .5; x.stroke();
        }
      }
    requestAnimationFrame(draw);
  })();
  pts.forEach(p => { p.x = Math.random() * innerWidth; p.y = Math.random() * innerHeight; });
})();

// ── Tab switching ────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    btn.classList.add('active');

    const tab = document.getElementById('tab-' + btn.dataset.tab);
    tab.classList.add('active');

    if (btn.dataset.tab === 'history') loadHistory();
  });
});

// ── API health check ─────────────────────────────────
async function checkHealth() {
  const dot   = document.getElementById('apiDot');
  const txt   = document.getElementById('apiStatusText');
  const guide = document.getElementById('startupGuide');
  try {
    const r = await fetch(API + '/health', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      dot.className = 'dot online';
      txt.textContent = 'API ONLINE';
      guide.classList.add('hidden');
    } else throw new Error();
  } catch {
    dot.className = 'dot offline';
    txt.textContent = 'API OFFLINE';
    guide.classList.remove('hidden');
  }
}
checkHealth();
setInterval(checkHealth, 10000);

// ── Helpers ──────────────────────────────────────────
function fill(url) {
  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').focus();
}
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
let toastT;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.add('hidden'), 3200);
}

// ── Scan ─────────────────────────────────────────────
async function scanUrl() {
  const inp   = document.getElementById('urlInput');
  const url   = inp.value.trim();
  if (!url) { toast('Enter a URL first'); inp.focus(); return; }

  const btn   = document.getElementById('scanBtn');
  const btxt  = document.getElementById('btnText');
  const bspin = document.getElementById('btnSpinner');
  btn.disabled = true;
  btxt.classList.add('hidden');
  bspin.classList.remove('hidden');
  document.getElementById('resultBox').classList.add('hidden');

  try {
    const res = await fetch(API + '/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });
    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.error || 'Server error');
    }
    const data = await res.json();
    showResult(data);
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed') || msg === 'Load failed') {
      toast('Backend offline — run: mvn spring-boot:run');
    } else {
      toast('Error: ' + msg);
    }
  } finally {
    btn.disabled = false;
    btxt.classList.remove('hidden');
    bspin.classList.add('hidden');
  }
}

document.getElementById('urlInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') scanUrl();
});

// ── Show result ──────────────────────────────────────
function showResult(data) {
  var ICONS  = { SAFE: '🛡️', SUSPICIOUS: '⚡', MALICIOUS: '☠️' };
  var COLORS = { SAFE: '#00ff88', SUSPICIOUS: '#ffbb00', MALICIOUS: '#ff3366' };
  var color  = COLORS[data.verdict] || '#00d2ff';

  var card = document.getElementById('verdictCard');
  card.className = 'verdict-card ' + data.verdict;

  document.getElementById('vIcon').textContent = ICONS[data.verdict] || '🔍';
  var lbl = document.getElementById('vLabel');
  lbl.textContent = data.verdict;
  lbl.style.color = color;
  document.getElementById('vMsg').textContent = data.message;

  // Gauge arc (total path ≈ 157)
  var arc = Math.round((data.score / 100) * 157);
  var ga  = document.getElementById('gaugeArc');
  ga.style.strokeDasharray = arc + ' 157';
  ga.style.stroke = color;
  document.getElementById('gaugeNum').textContent = data.score;

  // Flags
  var fb = document.getElementById('flagsBox');
  var sb = document.getElementById('safeBox');
  var fl = document.getElementById('flagsList');
  fl.innerHTML = '';
  if (data.flags && data.flags.length) {
    fb.classList.remove('hidden');
    sb.classList.add('hidden');
    data.flags.forEach(function(f, i) {
      var chip = document.createElement('span');
      chip.className = 'flag-chip';
      chip.style.animationDelay = (i * .07) + 's';
      chip.textContent = f;
      fl.appendChild(chip);
    });
  } else {
    fb.classList.add('hidden');
    sb.classList.remove('hidden');
  }

  document.getElementById('resultBox').classList.remove('hidden');
  document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── History ──────────────────────────────────────────
async function loadHistory() {
  var body = document.getElementById('histBody');
  body.innerHTML = '<tr><td colspan="7" class="empty-row">Loading...</td></tr>';
  try {
    const [hr, sr] = await Promise.all([
      fetch(API + '/history'),
      fetch(API + '/stats')
    ]);
	if (!hr.ok || !sr.ok) {
	  throw new Error("API error");
	}

	const hist  = await hr.json();
	const stats = await sr.json();

    document.getElementById('sTot').textContent = stats.totalScans     != null ? stats.totalScans     : 0;
    document.getElementById('sMal').textContent = stats.maliciousCount  != null ? stats.maliciousCount  : 0;
    document.getElementById('sSus').textContent = stats.suspiciousCount != null ? stats.suspiciousCount : 0;
    document.getElementById('sSaf').textContent = stats.safeCount       != null ? stats.safeCount       : 0;

    if (!hist.length) {
      body.innerHTML = '<tr><td colspan="7" class="empty-row">No scans yet — scan a URL first!</td></tr>';
      return;
    }
    body.innerHTML = '';
    hist.forEach(function(row) {
      var sc = row.riskScore >= 60 ? '#ff3366' : row.riskScore >= 30 ? '#ffbb00' : '#00ff88';
      var dt = row.scannedAt ? new Date(row.scannedAt).toLocaleString() : '—';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + row.id + '</td>' +
        '<td class="url-td" title="' + esc(row.url) + '">' + esc(row.url) + '</td>' +
        '<td><span class="vpill ' + row.verdict + '">' + row.verdict + '</span></td>' +
        '<td style="color:' + sc + ';font-weight:bold">' + row.riskScore + '/100</td>' +
        '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#3a5a72;font-size:.68rem">' + esc(row.flaggedSignals || '—') + '</td>' +
        '<td style="color:#3a5a72;white-space:nowrap;font-size:.68rem">' + dt + '</td>' +
        '<td><button class="del-row-btn" onclick="delRow(' + row.id + ')">✕</button></td>';
      body.appendChild(tr);
    });
  } catch (e) {
    body.innerHTML = '<tr><td colspan="7" class="empty-row" style="color:#ff3366">Backend offline — start Spring Boot first.</td></tr>';
  }
}

async function delRow(id) {
  if (!confirm('Delete this record?')) return;
  try {
    await fetch(API + '/history/' + id, { method: 'DELETE' });
    toast('Deleted');
    loadHistory();
  } catch { toast('Delete failed'); }
}

// ── Admin ────────────────────────────────────────────
async function testHealth() {
  var out = document.getElementById('healthOut');
  out.textContent = 'Testing...';
  out.style.color = '#b8d8f0';
  try {
    const r = await fetch(API + '/health');
    const d = await r.json();
    out.textContent = JSON.stringify(d, null, 2);
    out.style.color = '#00ff88';
  } catch {
    out.textContent = 'Cannot reach backend\n\nFix:\n  cd backend/phishguard\n  mvn spring-boot:run';
    out.style.color = '#ff3366';
  }
}

async function clearAll() {
  if (!confirm('Delete ALL scan history permanently?')) return;
  var out = document.getElementById('clearOut');
  try {
    const r = await fetch(API + '/history', { method: 'DELETE' });
    const d = await r.json();
    out.textContent = JSON.stringify(d, null, 2);
    out.style.color = '#00ff88';
    toast('All records cleared');
  } catch {
    out.textContent = 'Failed';
    out.style.color = '#ff3366';
  }
}