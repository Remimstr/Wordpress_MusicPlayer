import { formatStyle } from "./player-state.js";

export function renderTracklist(
  tracklist,
  tracks,
  icons,
  currentTrackIndex,
  audio,
  playTrack
) {
  tracklist.innerHTML = "";

  tracks.forEach((track, index) => {
    const row = document.createElement("div");

    row.className = "composer-track";
    row.dataset.trackIndex = index;

    row.innerHTML = `
      <button
        class="composer-track-play composer-player-button"
        type="button"
        aria-label="Play ${track.title}"
      >
        <img src="${icons.play}" alt="">
      </button>

      <div class="composer-track-info">
        <span class="composer-track-title">
          ${track.title}
        </span>

        <span class="composer-track-style">
          ${formatStyle(track.style)}
        </span>
      </div>

      <span class="composer-track-duration">
        0:00
      </span>
    `;

    row.addEventListener("click", () => {
      if (index === currentTrackIndex) {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      } else {
        playTrack(index);
      }
    });

    tracklist.appendChild(row);
  });
}