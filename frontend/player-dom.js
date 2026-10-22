export function ensurePlayerDom() {
  if (typeof document === "undefined") {
    return;
  }

  const player = document.querySelector(".composer-player");
  if (player) {
    if (!player.querySelector(".composer-player-artwork")) {
      const artwork = document.createElement("div");
      artwork.className = "composer-player-artwork";
      artwork.innerHTML = '<div class="composer-player-artwork-content"></div>';
      player.prepend(artwork);
    }

    if (!player.querySelector(".composer-tracklist")) {
      const tracklist = document.createElement("div");
      tracklist.className = "composer-tracklist";
      tracklist.setAttribute("aria-label", "Music");
      player.appendChild(tracklist);
    }
  }

  let floatingPlayer = document.getElementById("composer-floating-player");
  if (!floatingPlayer && document.body) {
    floatingPlayer = document.createElement("div");
    floatingPlayer.id = "composer-floating-player";
    floatingPlayer.innerHTML = `
      <div class="composer-player-inner">
        <div class="composer-player-controls">
          <button
            class="composer-player-button composer-player-previous"
            type="button"
            aria-label="Previous track"
          >
            <img src="" alt="">
          </button>

          <button
            class="composer-player-button composer-player-play"
            type="button"
            aria-label="Play"
          >
            <img src="" alt="">
          </button>

          <button
            class="composer-player-button composer-player-next"
            type="button"
            aria-label="Next track"
          >
            <img src="" alt="">
          </button>
        </div>

        <div class="composer-player-main">
          <div class="composer-player-heading">
            <span class="composer-player-title"></span>
            <span class="composer-player-style"></span>
          </div>

          <div class="composer-player-progress-row">
            <input
              class="composer-player-progress"
              type="range"
              min="0"
              max="100"
              value="0"
              step="0.1"
              aria-label="Track progress"
            >

            <div class="composer-player-time">
              <span class="composer-player-current-time">0:00</span>
              <span>/</span>
              <span class="composer-player-duration">0:00</span>
            </div>
          </div>
        </div>
      </div>

      <audio
        class="composer-player-audio"
        preload="metadata"
      ></audio>
    `;
    document.body.appendChild(floatingPlayer);
  }

  return floatingPlayer;
}
