export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function getPreviousTrackIndex(currentIndex, trackCount) {
  if (trackCount <= 0) {
    return 0;
  }

  return currentIndex === 0
    ? trackCount - 1
    : currentIndex - 1;
}

export function getNextTrackIndex(currentIndex, trackCount) {
  if (trackCount <= 0) {
    return 0;
  }

  return currentIndex === trackCount - 1
    ? 0
    : currentIndex + 1;
}

export function getProgressPercentage(currentTime, duration) {
  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return 0;
  }

  return (currentTime / duration) * 100;
}