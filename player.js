const tracks = [
  {
    title: "Flidais' Grove",
    style: "Ambient · Orchestral",
    url: "https://remimarchand.ca/wp-content/uploads/2026/09/Flidais-Grove-Master-1.mp3"
  },
  {
    title: "Facing the Gods' Wrath",
    style: "Cinematic · Action",
    url: "https://remimarchand.ca/wp-content/uploads/2026/09/Facing-the-Gods-Wrath-Master-1.mp3"
  },
  {
    title: "Fall Game",
    style: "8-bit · Catchy",
    url: "https://remimarchand.ca/wp-content/uploads/2026/09/Fall-Game-Master.mp3"
  },
  {
    title: "Sewer Crawl",
    style: "Ambient · Tension",
    url: "https://remimarchand.ca/wp-content/uploads/2026/09/12-MCA-Brief-Ambient_Tension-Master-FO-1.mp3"
  },
  {
    title: "Wobbly Wacoon",
    style: "Whimsical · Playful",
    url: "https://remimarchand.ca/wp-content/uploads/2026/09/Wobbly-Wacoon-Master.mp3"
  }
];


const icons = {
  play: "icons/play.svg",
  pause: "icons/pause.svg",
  skipBack: "icons/skip-back.svg",
  skipForward: "icons/skip-forward.svg"
};


const player = document.querySelector(".composer-floating-player");
const audio = document.querySelector(".composer-player-audio");

const tracklist = document.querySelector(".composer-tracklist");

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


let currentTrackIndex = 0;


/* =========================================================
   Helpers
   ========================================================= */

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}


function updateProgress() {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
    progress.value = 0;
    progress.style.setProperty("--progress", "0%");
    currentTimeElement.textContent = "0:00";
    return;
  }

  const percentage =
    (audio.currentTime / audio.duration) * 100;

  progress.value = percentage;

  progress.style.setProperty(
    "--progress",
    `${percentage}%`
  );

  currentTimeElement.textContent =
    formatTime(audio.currentTime);
}


function updateDuration() {
  if (!Number.isFinite(audio.duration)) {
    durationElement.textContent = "0:00";
    return;
  }

  durationElement.textContent =
    formatTime(audio.duration);
}


function updatePlayButton() {
  const icon = playButton.querySelector("img");

  if (!icon) {
    return;
  }

  if (audio.paused) {
    icon.src = icons.play;
    playButton.setAttribute("aria-label", "Play");
  } else {
    icon.src = icons.pause;
    playButton.setAttribute("aria-label", "Pause");
  }
}


/* =========================================================
   Track List
   ========================================================= */

function renderTracklist() {
  tracklist.innerHTML = "";

  tracks.forEach((track, index) => {
    const row = document.createElement("div");

    row.className = "composer-track";
    row.dataset.trackIndex = index;

    row.innerHTML = `
      <button
        class="composer-track-play"
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
          ${track.style}
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


function updateTrackRows() {
  const rows = tracklist.querySelectorAll(".composer-track");

  rows.forEach((row, index) => {
    const icon = row.querySelector(".composer-track-play img");

    const isActive =
      index === currentTrackIndex;

    row.classList.toggle(
      "is-active",
      isActive
    );

    if (isActive && !audio.paused) {
      icon.src = icons.pause;
    } else {
      icon.src = icons.play;
    }
  });
}


function updateTrackDuration() {
  const rows = tracklist.querySelectorAll(".composer-track");

  rows.forEach((row, index) => {
    const durationElement =
      row.querySelector(".composer-track-duration");

    if (index === currentTrackIndex) {
      durationElement.textContent =
        formatTime(audio.duration);
    }
  });
}


/* =========================================================
   Loading / Playback
   ========================================================= */

function loadTrack(index) {
  if (!tracks[index]) {
    return;
  }

  currentTrackIndex = index;

  const track = tracks[index];

  audio.src = track.url;
  audio.load();

  playerTitle.textContent = track.title;
  playerStyle.textContent = `· ${track.style}`;

  progress.value = 0;
  progress.style.setProperty("--progress", "0%");

  currentTimeElement.textContent = "0:00";
  durationElement.textContent = "0:00";

  updateTrackRows();
  updatePlayButton();
}


function playTrack(index) {
  if (index !== currentTrackIndex) {
    loadTrack(index);
  }

  audio.play().catch((error) => {
    console.error("Unable to play audio:", error);
  });
}


/* =========================================================
   Transport Controls
   ========================================================= */

playButton.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch((error) => {
      console.error("Unable to play audio:", error);
    });
  } else {
    audio.pause();
  }
});


previousButton.addEventListener("click", () => {
  const previousIndex =
    currentTrackIndex === 0
      ? tracks.length - 1
      : currentTrackIndex - 1;

  playTrack(previousIndex);
});


nextButton.addEventListener("click", () => {
  const nextIndex =
    currentTrackIndex === tracks.length - 1
      ? 0
      : currentTrackIndex + 1;

  playTrack(nextIndex);
});


/* =========================================================
   Seeking
   ========================================================= */

progress.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) {
    return;
  }

  const percentage =
    Number(progress.value) / 100;

  audio.currentTime =
    percentage * audio.duration;

  progress.style.setProperty(
    "--progress",
    `${progress.value}%`
  );

  currentTimeElement.textContent =
    formatTime(audio.currentTime);
});


/* =========================================================
   Audio Events
   ========================================================= */

audio.addEventListener("timeupdate", () => {
  updateProgress();
});


audio.addEventListener("loadedmetadata", () => {
  updateDuration();
  updateTrackDuration();
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


/* =========================================================
   Initialization
   ========================================================= */

renderTracklist();
loadTrack(0);
updateTrackRows();
updatePlayButton();