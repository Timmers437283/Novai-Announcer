/* ===================================================================
   NovAI Announcer
   - Polls announcements.json on an interval
   - Only replays the "typing" animation when the id actually changes
   - Falls back gracefully (keeps last known message) if a fetch fails
   =================================================================== */

const CONFIG = {
  DATA_URL: "./announcements.json",
  POLL_INTERVAL_MS: 30000, // check for updates every 30s
  TYPE_SPEED_MS: 22,       // ms per character in the typewriter effect
};

const els = {
  card: document.getElementById("novaiCard"),
  statusDot: document.getElementById("statusDot"),
  newFlag: document.getElementById("newFlag"),
  titleLine: document.getElementById("titleLine"),
  messageText: document.getElementById("messageText"),
  cursor: document.getElementById("cursor"),
  timestamp: document.getElementById("timestamp"),
};

let lastRenderedId = null;
let typingToken = 0; // guards against overlapping typewriter animations

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

function setStatus(online) {
  els.statusDot.classList.toggle("offline", !online);
}

async function typeText(text) {
  const myToken = ++typingToken;
  els.messageText.textContent = "";
  els.cursor.classList.remove("hidden");
  for (let i = 0; i < text.length; i++) {
    if (myToken !== typingToken) return; // a newer message started rendering, abandon this one
    els.messageText.textContent += text[i];
    await new Promise((r) => setTimeout(r, CONFIG.TYPE_SPEED_MS));
  }
  if (myToken === typingToken) els.cursor.classList.add("hidden");
}

function flashNewFlag() {
  els.newFlag.classList.add("show");
  setTimeout(() => els.newFlag.classList.remove("show"), 4000);
}

function renderStatic(data) {
  els.titleLine.textContent = data.title || "";
  els.messageText.textContent = data.message || "";
  els.cursor.classList.add("hidden");
  els.timestamp.textContent = relativeTime(data.timestamp);
}

function renderAnimated(data) {
  els.titleLine.textContent = data.title || "";
  typeText(data.message || "");
  els.timestamp.textContent = relativeTime(data.timestamp);
  flashNewFlag();
}

async function checkForUpdate(isFirstLoad) {
  try {
    const res = await fetch(`${CONFIG.DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setStatus(true);

    if (data.id !== lastRenderedId) {
      lastRenderedId = data.id;
      if (isFirstLoad) {
        renderAnimated(data); // animate once on first load too, feels alive
      } else {
        renderAnimated(data);
      }
    } else {
      // no change, just keep the timestamp fresh (e.g. "2 min ago" -> "3 min ago")
      els.timestamp.textContent = relativeTime(data.timestamp);
    }
  } catch (err) {
    console.warn("NovAI: could not fetch announcements.json", err);
    setStatus(false);
    if (isFirstLoad) {
      els.titleLine.textContent = "Connection issue";
      els.messageText.textContent = "Could not load the latest announcement.";
      els.cursor.classList.add("hidden");
      els.timestamp.textContent = "";
    }
  }
}

// initial load
checkForUpdate(true);

// keep polling for updates
setInterval(() => checkForUpdate(false), CONFIG.POLL_INTERVAL_MS);
