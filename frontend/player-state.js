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

  return currentIndex === 0 ? trackCount - 1 : currentIndex - 1;
}

export function getNextTrackIndex(currentIndex, trackCount) {
  if (trackCount <= 0) {
    return 0;
  }

  return currentIndex === trackCount - 1 ? 0 : currentIndex + 1;
}

export function getProgressPercentage(currentTime, duration) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return (currentTime / duration) * 100;
}

export function formatStyle(style) {
  return style
    .split(",")
    .map((value) => value.trim())
    .join(" · ");
}

export function safeEncodeUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    return encodeURI(decodeURI(url));
  } catch {
    return encodeURI(url);
  }
}
