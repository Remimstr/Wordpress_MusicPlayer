import {
  formatStyle,
  formatTime,
  getPreviousTrackIndex,
  getNextTrackIndex,
  getProgressPercentage,
} from "./player-state.js";
import { renderTracklist } from "./player-render.js";

let tracks = [];

const config = window.ComposerPlayer || {};
const icons = config.icons || {};

const audio = document.querySelector(".composer-player-audio");
const tracklist = document.querySelector(".composer-tracklist");
const player = document.querySelector(".composer-player");
const artwork = document.querySelector(".composer-player-artwork");
const artworkContent = document.querySelector(
  ".composer-player-artwork-content"
);
const previousButton = document.querySelector(".composer-player-previous");
const playButton = document.querySelector(".composer-player-play");
const nextButton = document.querySelector(".composer-player-next");
const playerTitle = document.querySelector(".composer-player-title");
const playerStyle = document.querySelector(".composer-player-style");
const progress = document.querySelector(".composer-player-progress");
const currentTimeElement = document.querySelector(
  ".composer-player-current-time"
);
const durationElement = document.querySelector(
  ".composer-player-duration"
);

const floatingPlayer = document.getElementById(
  "composer-floating-player"
);

let currentTrackIndex = 0;

let audioContext;
let gainNode;

function initializeAudioGain() {
  audioContext = new AudioContext();

  const source = audioContext.createMediaElementSource(audio);

  gainNode = audioContext.createGain();

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
}

function dbToLinearGain(db) {
  return 10 ** (db / 20);
}

function setTrackGain(track) {
    const gainDb = Number(track.gainDb ?? 0);
    const gain = dbToLinearGain(gainDb);
    const now = audioContext.currentTime;

    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setTargetAtTime(gain, now, 0.01);
}

function setButtonIcon(button, src) {
  const icon = button.querySelector("img");

  if (!icon) {
    return;
  }

  icon.src = src;
}

function initializePlayerIcons() {
  setButtonIcon(previousButton, icons.skipBack);
  setButtonIcon(playButton, icons.play);
  setButtonIcon(nextButton, icons.skipForward);
}

function updateProgress() {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
    progress.value = 0;
    progress.style.setProperty("--progress", "0%");
    currentTimeElement.textContent = "0:00";
    return;
  }

  const percentage = getProgressPercentage(
    audio.currentTime,
    audio.duration
  );

  progress.value = percentage;
  progress.style.setProperty("--progress", `${percentage}%`);
  currentTimeElement.textContent = formatTime(audio.currentTime);
}

function updateDuration() {
  if (!Number.isFinite(audio.duration)) {
    durationElement.textContent = "0:00";
    return;
  }

  durationElement.textContent = formatTime(audio.duration);
}

function updatePlayButton() {
  const icon = playButton.querySelector("img");

  if (!icon) {
    return;
  }

  if (audio.paused) {
    setButtonIcon(playButton, icons.play);
    playButton.setAttribute("aria-label", "Play");
  } else {
    setButtonIcon(playButton, icons.pause);
    playButton.setAttribute("aria-label", "Pause");
  }
}

function updateTrackRows() {
  const rows = tracklist.querySelectorAll(".composer-track");

  rows.forEach((row, index) => {
    const icon = row.querySelector(".composer-track-play img");
    const isActive = index === currentTrackIndex;

    row.classList.toggle("is-active", isActive);

    if (!icon) {
      return;
    }

    if (isActive && !audio.paused) {
      icon.src = icons.pause;
    } else {
      icon.src = icons.play;
    }
  });
}

function updateArtwork(track) {
  if (!artwork || !artworkContent || !player) {
    return;
  }

  if (!track.image || !track.image.url) {
    artworkContent.innerHTML = "";

    artwork.hidden = false;
    artwork.classList.add("is-placeholder");
    player.classList.add("has-artwork");

    return;
  }

  const currentGroup = artworkContent.querySelector(
    ".composer-player-artwork-image-container"
  );

  const incomingGroup = document.createElement("div");
  incomingGroup.className =
    "composer-player-artwork-image-container is-entering";

  const image = document.createElement("img");
  image.className = "composer-player-artwork-image";
  image.src = track.image.url;
  image.alt = track.image.alt || "";

  const caption = document.createElement("div");
  caption.className = "composer-player-artwork-caption";
  caption.innerHTML = track.image.caption || "";

  incomingGroup.appendChild(image);
  incomingGroup.appendChild(caption);
  artworkContent.appendChild(incomingGroup);

  artwork.hidden = false;
  artwork.classList.remove("is-placeholder");
  player.classList.add("has-artwork");

  const showIncoming = () => {
    // Force the initial opacity: 0 state to be committed first.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incomingGroup.classList.remove("is-entering");
        incomingGroup.classList.add("is-active");

        if (!currentGroup) {
          return;
        }

        currentGroup.classList.remove("is-active");
        currentGroup.classList.add("is-exiting");

        let cleanedUp = false;

        const cleanup = () => {
          if (cleanedUp) {
            return;
          }

          cleanedUp = true;
          currentGroup.remove();
        };

        currentGroup.addEventListener("transitionend", cleanup, {
          once: true,
        });

      // Fallback for browsers that fail to fire transitionend.
      setTimeout(cleanup, 700);
    });
  });
};

  if (image.complete) {
    showIncoming();
  } else {
    image.addEventListener("load", showIncoming, { once: true });
    image.addEventListener("error", showIncoming, { once: true });
  }
}

function preloadArtwork(tracks) {
  tracks.forEach((track) => {
    if (!track.image || !track.image.url) {
      return;
    }

    const image = new Image();
    image.src = track.image.url;
  });
}

function loadTrackDurations() {
  tracks.forEach((track, index) => {
    const metadataAudio = new Audio();

    metadataAudio.preload = "metadata";

    metadataAudio.addEventListener("loadedmetadata", () => {
      const row = tracklist.querySelector(
        `.composer-track[data-track-index="${index}"]`
      );

      if (!row) {
        return;
      }

      const durationElement = row.querySelector(
        ".composer-track-duration"
      );

      if (durationElement) {
        durationElement.textContent = formatTime(metadataAudio.duration);
      }
    });

    metadataAudio.addEventListener("error", () => {
      console.warn(`Unable to load duration for "${track.title}"`);
    });

    metadataAudio.src = track.url;
  });
}

function loadTrack(index) {
  if (!tracks[index]) {
    return;
  }

  currentTrackIndex = index;

  const track = tracks[index];

  setTrackGain(track);

  audio.src = track.url;
  audio.load();

  playerTitle.textContent = track.title;
  playerStyle.textContent = `—\u00A0\u00A0${formatStyle(track.style)}`;

  updateArtwork(track);

  progress.value = 0;
  progress.style.setProperty("--progress", "0%");
  currentTimeElement.textContent = "0:00";
  durationElement.textContent = "0:00";

  updateTrackRows();
}

async function playTrack(index) {
  if (!tracks[index]) {
    return;
  }

  if (index !== currentTrackIndex) {
    loadTrack(index);
  }

  try {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    await audio.play();

    setButtonIcon(playButton, icons.pause);
    playButton.setAttribute("aria-label", "Pause");
  } catch (error) {
    console.error("Unable to play audio:", error);
    updatePlayButton();
    updateTrackRows();
  }
}

export function initializePlayer() {
  if (floatingPlayer) {
    const updatePlayerHeight = () => {
      const height = floatingPlayer.getBoundingClientRect().height;

      document.documentElement.style.setProperty(
        "--composer-player-height",
        `${height}px`
      );
    };

    updatePlayerHeight();

    new ResizeObserver(updatePlayerHeight).observe(floatingPlayer);
  }

  initializePlayerIcons();
  initializeAudioGain();

  fetch(config.tracksUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load tracks: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      tracks = data;

      preloadArtwork(tracks);

      renderTracklist(
        tracklist,
        tracks,
        icons,
        () => currentTrackIndex,
        audio,
        playTrack
      );

      loadTrack(0);
      loadTrackDurations();
      updateTrackRows();
      updatePlayButton();
    })
    .catch((error) => {
      console.error("Could not load tracks:", error);
    });

  playButton.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        await audio.play();
      } catch (error) {
        console.error("Unable to play audio:", error);
      }
    } else {
      audio.pause();
    }
  });

  previousButton.addEventListener("click", () => {
    const previousIndex = getPreviousTrackIndex(
      currentTrackIndex,
      tracks.length
    );

    playTrack(previousIndex);
  });

  nextButton.addEventListener("click", () => {
    const nextIndex = getNextTrackIndex(
      currentTrackIndex,
      tracks.length
    );

    playTrack(nextIndex);
  });

  progress.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) {
      return;
    }

    const percentage = Number(progress.value) / 100;

    audio.currentTime = percentage * audio.duration;

    progress.style.setProperty("--progress", `${progress.value}%`);
    currentTimeElement.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("timeupdate", () => {
    updateProgress();
  });

  audio.addEventListener("loadedmetadata", () => {
    updateDuration();
  });

  audio.addEventListener("play", () => {
    updatePlayButton();
    updateTrackRows();
  });

  audio.addEventListener("pause", () => {
    updatePlayButton();
    updateTrackRows();
  });

  audio.addEventListener("ended", () => {
    if (currentTrackIndex === tracks.length - 1) {
      audio.currentTime = 0;

      progress.value = 0;
      progress.style.setProperty("--progress", "0%");
      currentTimeElement.textContent = "0:00";

      updatePlayButton();
      updateTrackRows();

      return;
    }

    playTrack(currentTrackIndex + 1);
  });
}

initializePlayer();