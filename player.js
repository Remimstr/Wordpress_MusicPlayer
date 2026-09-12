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


const tracklist = document.querySelector(".composer-tracklist");

const playButton = document.querySelector(".composer-player-play");
const prevButton = document.querySelector(".composer-player-prev");
const nextButton = document.querySelector(".composer-player-next");

const playerTitle = document.querySelector(".composer-player-title");
const playerStyle = document.querySelector(".composer-player-style");

const currentTimeElement =
  document.querySelector(".composer-current-time");

const durationElement =
  document.querySelector(".composer-duration");

const progress =
  document.querySelector(".composer-progress");


const audio = document.createElement("audio");

audio.preload = "metadata";

document.body.appendChild(audio);


let currentTrackIndex = 0;


/* =========================================================
   HELPERS
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
  if (!audio.duration) {
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
  if (!audio.duration) {
    return;
  }

  durationElement.textContent =
    formatTime(audio.duration);

  updateTrackDuration();
}


function updatePlayButton() {

  const icon =
    playButton.querySelector("img");

  icon.src =
    audio.paused
      ? icons.play
      : icons.pause;

  playButton.setAttribute(
    "aria-label",
    audio.paused ? "Play" : "Pause"
  );
}


/* =========================================================
   TRACK LIST
   ========================================================= */

function renderTracklist() {
  tracklist.innerHTML = "";

  tracks.forEach((track, index) => {

    const row = document.createElement("div");

    row.className = "composer-track";

    row.dataset.index = index;

    row.innerHTML = `
      <button
        class="composer-track-play"
        type="button"
        aria-label="Play ${track.title}"
      >
        <img src="${icons.play}" alt="">
      </button>

      <div class="composer-track-info">
        <div class="composer-track-title">
          ${track.title}
        </div>

        <div class="composer-track-style">
          ${track.style}
        </div>
      </div>

      <div class="composer-track-duration">
        —
      </div>
    `;

    row.addEventListener("click", () => {
      playTrack(index);
    });

    tracklist.appendChild(row);
  });
}


/* =========================================================
   TRACK STATE
   ========================================================= */

function updateTrackRows() {

  const rows =
    tracklist.querySelectorAll(".composer-track");

  rows.forEach((row, index) => {

    const button =
      row.querySelector(".composer-track-play");

    const isActive =
      index === currentTrackIndex;

    row.classList.toggle(
      "is-active",
      isActive
    );

    const icon =
      button.querySelector("img");

    if (isActive && !audio.paused) {

      icon.src = icons.pause;

      button.setAttribute(
        "aria-label",
        "Pause"
      );

    } else {

      icon.src = icons.play;

      button.setAttribute(
        "aria-label",
        `Play ${tracks[index].title}`
      );
    }
  });
}

function updateTrackDuration() {

  if (currentTrackIndex < 0) {
    return;
  }

  const rows =
    tracklist.querySelectorAll(".composer-track");

  const row =
    rows[currentTrackIndex];

  if (!row) {
    return;
  }

  const duration =
    row.querySelector(".composer-track-duration");

  duration.textContent =
    formatTime(audio.duration);
}


/* =========================================================
   LOAD / PLAY
   ========================================================= */

function loadTrack(index) {

  const track = tracks[index];

  currentTrackIndex = index;

  audio.src = track.url;

  playerTitle.textContent = track.title;
  playerStyle.textContent = track.style;

  currentTimeElement.textContent = "0:00";
  durationElement.textContent = "0:00";

  progress.value = 0;

  progress.style.setProperty(
    "--progress",
    "0%"
  );

  updateTrackRows();
}


function playTrack(index) {

  if (index === currentTrackIndex) {

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }

    return;
  }

  loadTrack(index);

  audio.play().catch((error) => {
    console.error(
      "Unable to play audio:",
      error
    );
  });
}


/* =========================================================
   PLAYER CONTROLS
   ========================================================= */

playButton.addEventListener("click", () => {

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});


prevButton.addEventListener("click", () => {

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
   SEEK
   ========================================================= */

progress.addEventListener("input", () => {

  if (!audio.duration) {
    return;
  }

  const percentage =
    Number(progress.value);

  audio.currentTime =
    (percentage / 100) * audio.duration;

  progress.style.setProperty(
    "--progress",
    `${percentage}%`
  );

  currentTimeElement.textContent =
    formatTime(audio.currentTime);
});


/* =========================================================
   AUDIO EVENTS
   ========================================================= */

audio.addEventListener("loadedmetadata", () => {
  updateDuration();
});


audio.addEventListener("timeupdate", () => {
  updateProgress();
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

  if (currentTrackIndex < tracks.length - 1) {

    playTrack(currentTrackIndex + 1);

  } else {

    updatePlayButton();
    updateTrackRows();
  }
});


/* =========================================================
   INITIALIZE
   ========================================================= */

// Select the first track by default,
// but don't automatically start playback.
loadTrack(0);
renderTracklist();
updateTrackRows();
updatePlayButton();
