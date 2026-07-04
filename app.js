/* ===================================================================
   NovAI Announcer
   =================================================================== */

const CONFIG = {
  DATA_URL: "./announcement.json",
  POLL_INTERVAL_MS: 30000,
  TYPE_SPEED_MS: 22,
};

const els = {
  card: document.getElementById("novaiCard"),
  titleLine: document.getElementById("titleLine"),
  messageText: document.getElementById("messageText"),
  cursor: document.getElementById("cursor"),
  timestamp: document.getElementById("timestamp"),
};

let lastRenderedId = null;
let typingToken = 0;

function relativeTime(isoString) {
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return "";

  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 30) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

async function typeText(text) {
  const myToken = ++typingToken;

  els.messageText.textContent = "";
  els.cursor.classList.remove("hidden");

  for (let i = 0; i < text.length; i++) {
    if (myToken !== typingToken) return;

    els.messageText.textContent += text[i];
    await new Promise((r) => setTimeout(r, CONFIG.TYPE_SPEED_MS));
  }

  if (myToken === typingToken) {
    els.cursor.classList.add("hidden");
  }
}

function render(data) {
  els.titleLine.textContent = data.title || "";
  els.timestamp.textContent = relativeTime(data.timestamp);

  typeText(data.message || "");
}

async function checkForUpdate() {
  try {
    const res = await fetch(`${CONFIG.DATA_URL}?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.id !== lastRenderedId) {
      lastRenderedId = data.id;
      render(data);
    } else {
      els.timestamp.textContent = relativeTime(data.timestamp);
    }
  } catch (err) {
    console.warn("NovAI: fetch failed", err);

    if (lastRenderedId === null) {
      els.titleLine.textContent = "Connection issue";
      els.messageText.textContent =
        "Could not load the latest announcement.";
      els.cursor.classList.add("hidden");
      els.timestamp.textContent = "";
    }
  }
}

checkForUpdate();
setInterval(checkForUpdate, CONFIG.POLL_INTERVAL_MS);
