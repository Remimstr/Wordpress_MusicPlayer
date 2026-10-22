export function updateMediaSession(track) {
  if (!("mediaSession" in navigator)) {
    return;
  }

  const artwork = track.image?.url
    ? [
        {
          src: track.image.url,
          sizes: "512x512",
          type: track.image.type || "image/jpeg",
        },
      ]
    : [];

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: "Remi Marchand",
    album: "Original Music",
    artwork,
  });
}

export function initializeMediaSession({
  audio,
  getCurrentTrackIndex,
  getTrackCount,
  playTrack,
  getPreviousTrackIndex,
  getNextTrackIndex,
}) {
  if (!("mediaSession" in navigator)) {
    return;
  }

  navigator.mediaSession.setActionHandler("play", () => {
    playTrack(getCurrentTrackIndex());
  });

  navigator.mediaSession.setActionHandler("pause", () => {
    audio.pause();
  });

  navigator.mediaSession.setActionHandler("previoustrack", () => {
    const previousIndex = getPreviousTrackIndex(
      getCurrentTrackIndex(),
      getTrackCount(),
    );

    playTrack(previousIndex);
  });

  navigator.mediaSession.setActionHandler("nexttrack", () => {
    const nextIndex = getNextTrackIndex(
      getCurrentTrackIndex(),
      getTrackCount(),
    );

    playTrack(nextIndex);
  });

  audio.addEventListener("play", () => {
    navigator.mediaSession.playbackState = "playing";
  });

  audio.addEventListener("pause", () => {
    navigator.mediaSession.playbackState = "paused";
  });
}
