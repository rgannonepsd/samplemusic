// Grab elements
const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("playPause");
const back10Btn = document.getElementById("back10");
const fwd10Btn = document.getElementById("fwd10");
const seek = document.getElementById("seek");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const muteBtn = document.getElementById("mute");

// Utility: format seconds as M:SS
function toTimeString(secs) {
  if (!Number.isFinite(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// When metadata is loaded, we know the duration
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = toTimeString(audio.duration);
  seek.max = audio.duration || 0;
});

// Update timeline as audio plays
audio.addEventListener("timeupdate", () => {
  seek.value = audio.currentTime;
  currentTimeEl.textContent = toTimeString(audio.currentTime);
});

// Handle play/pause button & ended state
playPauseBtn.addEventListener("click", togglePlay);
audio.addEventListener("ended", () => {
  playPauseBtn.textContent = "▶️"; // reset to play icon
  playPauseBtn.setAttribute("aria-label", "Play");
});

function togglePlay() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "⏸️";
    playPauseBtn.setAttribute("aria-label", "Pause");
  } else {
    audio.pause();
    playPauseBtn.textContent = "▶️";
    playPauseBtn.setAttribute("aria-label", "Play");
  }
}

// Seek: while dragging (input) and on release (change)
seek.addEventListener("input", () => {
  // Update current time text live during drag
  currentTimeEl.textContent = toTimeString(+seek.value);
});
seek.addEventListener("change", () => {
  audio.currentTime = +seek.value;
});

// Skip buttons
back10Btn.addEventListener("click", () => {
  audio.currentTime = Math.max(0, audio.currentTime - 10);
});
fwd10Btn.addEventListener("click", () => {
  audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10);
});

// Volume + mute
volume.addEventListener("input", () => {
  audio.volume = +volume.value; // range 0..1
  if (audio.volume === 0) { audio.muted = true; muteBtn.textContent = "🔇"; }
  else { audio.muted = false; muteBtn.textContent = "🔊"; }
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? "🔇" : "🔊";
});

// Good default volume
audio.volume = +volume.value;

// Keyboard shortcuts (focus anywhere on page)
window.addEventListener("keydown", (e) => {
  // Avoid interfering with range sliders when they’re focused
  const isOnInput = document.activeElement === seek || document.activeElement === volume;
  switch (e.key) {
    case " ":
      if (!isOnInput) { e.preventDefault(); togglePlay(); }
      break;
    case "ArrowLeft":
      if (!isOnInput) { e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5); }
      break;
    case "ArrowRight":
      if (!isOnInput) { e.preventDefault(); audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 5); }
      break;
    case "ArrowUp":
      if (!isOnInput) {
        e.preventDefault();
        volume.value = Math.min(1, +volume.value + 0.05).toFixed(2);
        audio.volume = +volume.value;
        if (audio.volume > 0) { audio.muted = false; muteBtn.textContent = "🔊"; }
      }
      break;
    case "ArrowDown":
      if (!isOnInput) {
        e.preventDefault();
        volume.value = Math.max(0, +volume.value - 0.05).toFixed(2);
        audio.volume = +volume.value;
        if (audio.volume === 0) { audio.muted = true; muteBtn.textContent = "🔇"; }
      }
      break;
    case "m":
    case "M":
      if (!isOnInput) { e.preventDefault(); muteBtn.click(); }
      break;
  }
});
