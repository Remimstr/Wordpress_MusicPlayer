/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const tracks = [
  {
    title: "Track One",
    style: "Orchestral",
    url: "/track-one.mp3",
    image: {
      url: "/track-one.jpg",
      alt: "Track One artwork",
      caption: "Track One caption",
    },
  },
  {
    title: "Track Two",
    style: "Electronic",
    url: "/track-two.mp3",
    image: {
      url: "/track-two.jpg",
      alt: "Track Two artwork",
      caption: "Track Two caption",
    },
  },
];

function mockAudio() {
  const audio = document.querySelector(".composer-player-audio");

  vi.spyOn(audio, "load").mockImplementation(() => {});
  vi.spyOn(audio, "play").mockResolvedValue();
  vi.spyOn(audio, "pause").mockImplementation(() => {});

  return audio;
}

describe("player", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    document.body.innerHTML = `
      <div class="composer-player">
        <div class="composer-player-artwork">
          <div class="composer-player-artwork-image-container-a">
            <img class="composer-player-artwork-image">
            <div class="composer-player-artwork-caption"></div>
          </div>

          <div class="composer-player-artwork-image-container-b">
            <img class="composer-player-artwork-image">
            <div class="composer-player-artwork-caption"></div>
          </div>
        </div>

        <div id="composer-floating-player">
          <audio class="composer-player-audio"></audio>
          <div class="composer-tracklist"></div>

          <button class="composer-player-previous">
            <img>
          </button>

          <button class="composer-player-play">
            <img>
          </button>

          <button class="composer-player-next">
            <img>
          </button>

          <span class="composer-player-title"></span>
          <span class="composer-player-style"></span>

          <input
            class="composer-player-progress"
            type="range"
            value="0"
          >

          <span class="composer-player-current-time"></span>
          <span class="composer-player-duration"></span>
        </div>
      </div>
    `;

    window.ComposerPlayer = {
      tracksUrl: "/wp-json/composer-player/v1/tracks",
      icons: {
        play: "/play.svg",
        pause: "/pause.svg",
        skipBack: "/skip-back.svg",
        skipForward: "/skip-forward.svg",
      },
    };

    globalThis.ResizeObserver = class {
      observe() {}
      disconnect() {}
    };

    mockAudio();
  });

  it("loads the first track", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    expect(audio.src).toContain("/track-one.mp3");

    expect(
      document.querySelector(".composer-player-style").textContent
    ).toContain("Orchestral");
  });

  it("loads and plays a selected track", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const rows = document.querySelectorAll(".composer-track");

    const audio = document.querySelector(".composer-player-audio");

    rows[1].click();

    expect(audio.src).toContain("/track-two.mp3");

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track Two");

    expect(
      document.querySelector(".composer-player-style").textContent
    ).toContain("Electronic");

    expect(audio.play).toHaveBeenCalled();
  });

  it("pauses the player from a non-first track", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");
    const rows = document.querySelectorAll(".composer-track");
    const playButton = document.querySelector(".composer-player-play");

    rows[1].click();

    expect(audio.src).toContain("/track-two.mp3");

    Object.defineProperty(audio, "paused", {
      configurable: true,
      value: false,
    });

    playButton.click();

    expect(audio.pause).toHaveBeenCalled();
  });

  it("plays the first track when it is selected after another track", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");
    const rows = document.querySelectorAll(".composer-track");

    rows[1].click();

    expect(audio.src).toContain("/track-two.mp3");

    rows[0].click();

    expect(audio.src).toContain("/track-one.mp3");

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track One");

    expect(audio.play).toHaveBeenCalled();
  });

  it("toggles play and pause from the play button", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");
    const playButton = document.querySelector(".composer-player-play");

    playButton.click();

    expect(audio.play).toHaveBeenCalled();

    Object.defineProperty(audio, "paused", {
      configurable: true,
      value: false,
    });

    playButton.click();

    expect(audio.pause).toHaveBeenCalled();
  });

  it("pauses the player from a non-first track", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");
    const rows = document.querySelectorAll(".composer-track");
    const playButton = document.querySelector(".composer-player-play");

    rows[1].click();

    expect(audio.src).toContain("/track-two.mp3");

    Object.defineProperty(audio, "paused", {
      configurable: true,
      value: false,
    });

    playButton.click();

    expect(audio.pause).toHaveBeenCalled();
  });

  it("navigates between tracks with previous and next buttons", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    const previousButton = document.querySelector(
      ".composer-player-previous"
    );
    const nextButton = document.querySelector(".composer-player-next");

    nextButton.click();

    expect(audio.src).toContain("/track-two.mp3");

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track Two");

    previousButton.click();

    expect(audio.src).toContain("/track-one.mp3");

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track One");
  });

  it("advances to the next track when the current track ends", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    audio.dispatchEvent(new Event("ended"));

    expect(audio.src).toContain("/track-two.mp3");

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track Two");

    expect(audio.play).toHaveBeenCalled();
  });

  it("resets the final track when it ends", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    const rows = document.querySelectorAll(".composer-track");

    rows[1].click();

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track Two");
    });

    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      writable: true,
      value: 42,
    });

    audio.dispatchEvent(new Event("ended"));

    expect(audio.currentTime).toBe(0);

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track Two");

    expect(
      document.querySelector(".composer-player-current-time").textContent
    ).toBe("0:00");
  });

  it("seeks when the progress slider changes", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");
    const progress = document.querySelector(".composer-player-progress");

    Object.defineProperty(audio, "duration", {
      configurable: true,
      value: 200,
    });

    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      writable: true,
      value: 0,
    });

    progress.value = "50";
    progress.dispatchEvent(new Event("input"));

    expect(audio.currentTime).toBe(100);

    expect(
      document.querySelector(".composer-player-current-time").textContent
    ).toBe("1:40");
  });

  it("handles a failed tracks request", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Could not load tracks:",
        expect.any(Error)
      );
    });

    expect(
      document.querySelector(".composer-tracklist").children.length
    ).toBe(0);
  });

  it("plays the track selected from the tracklist", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");
    const rows = document.querySelectorAll(".composer-track");

    rows[1].click();

    expect(audio.src).toContain("/track-two.mp3");

    expect(
      document.querySelector(".composer-player-title").textContent
    ).toBe("Track Two");

    expect(
      document.querySelector(".composer-player-style").textContent
    ).toContain("Electronic");

    expect(audio.play).toHaveBeenCalled();
  });

  it("crossfades artwork between tracks", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    const artworkGroupA = document.querySelector(
      ".composer-player-artwork-image-container-a"
    );

    const artworkGroupB = document.querySelector(
      ".composer-player-artwork-image-container-b"
    );

    const artworkImageA = artworkGroupA.querySelector(
      ".composer-player-artwork-image"
    );

    const artworkImageB = artworkGroupB.querySelector(
      ".composer-player-artwork-image"
    );

    const artworkCaptionA = artworkGroupA.querySelector(
      ".composer-player-artwork-caption"
    );

    const artworkCaptionB = artworkGroupB.querySelector(
      ".composer-player-artwork-caption"
    );

    const rows = document.querySelectorAll(".composer-track");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    // The first updateArtwork() call switches from the
    // initial A group to B.
    expect(artworkGroupB.classList.contains("is-active")).toBe(true);
    expect(artworkGroupA.classList.contains("is-active")).toBe(false);

    expect(artworkImageB.src).toContain("/track-one.jpg");
    expect(artworkImageB.alt).toBe("Track One artwork");
    expect(artworkCaptionB.innerHTML).toBe("Track One caption");

    rows[1].click();

    expect(artworkGroupA.classList.contains("is-active")).toBe(true);
    expect(artworkGroupB.classList.contains("is-active")).toBe(false);

    expect(artworkImageA.src).toContain("/track-two.jpg");
    expect(artworkImageA.alt).toBe("Track Two artwork");
    expect(artworkCaptionA.innerHTML).toBe("Track Two caption");

    rows[0].click();

    expect(artworkGroupB.classList.contains("is-active")).toBe(true);
    expect(artworkGroupA.classList.contains("is-active")).toBe(false);

    expect(artworkImageB.src).toContain("/track-one.jpg");
    expect(artworkImageB.alt).toBe("Track One artwork");
    expect(artworkCaptionB.innerHTML).toBe("Track One caption");
  });

    it("handles a track without artwork", async () => {
    const tracksWithoutArtwork = [
      {
        title: "Track Without Artwork",
        style: "Ambient",
        url: "/track-no-artwork.mp3",
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracksWithoutArtwork),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track Without Artwork");
    });

    const artwork = document.querySelector(".composer-player-artwork");

    const artworkGroupA = document.querySelector(
      ".composer-player-artwork-image-container-a"
    );

    const artworkGroupB = document.querySelector(
      ".composer-player-artwork-image-container-b"
    );

    const artworkImageA = artworkGroupA.querySelector(
      ".composer-player-artwork-image"
    );

    const artworkImageB = artworkGroupB.querySelector(
      ".composer-player-artwork-image"
    );

    const artworkCaptionA = artworkGroupA.querySelector(
      ".composer-player-artwork-caption"
    );

    const artworkCaptionB = artworkGroupB.querySelector(
      ".composer-player-artwork-caption"
    );

    expect(artwork.hidden).toBe(false);
    expect(artwork.classList.contains("is-placeholder")).toBe(true);

    expect(artworkGroupA.hidden).toBe(true);
    expect(artworkGroupB.hidden).toBe(true);

    expect(artworkImageA.getAttribute("src")).toBe(null);
    expect(artworkImageB.getAttribute("src")).toBe(null);

    expect(artworkCaptionA.innerHTML).toBe("");
    expect(artworkCaptionB.innerHTML).toBe("");
  });

  it("alternates artwork groups across consecutive track changes", async () => {
    const threeTracks = [
      ...tracks,
      {
        title: "Track Three",
        style: "Ambient",
        url: "/track-three.mp3",
        image: {
          url: "/track-three.jpg",
          alt: "Track Three artwork",
          caption: "Track Three caption",
        },
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(threeTracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const rows = document.querySelectorAll(".composer-track");

    const artworkGroupA = document.querySelector(
      ".composer-player-artwork-image-container-a"
    );

    const artworkGroupB = document.querySelector(
      ".composer-player-artwork-image-container-b"
    );

    // First track uses B.
    expect(artworkGroupB.classList.contains("is-active")).toBe(true);
    expect(artworkGroupA.classList.contains("is-active")).toBe(false);

    // Second track switches to A.
    rows[1].click();

    expect(artworkGroupA.classList.contains("is-active")).toBe(true);
    expect(artworkGroupB.classList.contains("is-active")).toBe(false);

    // Third track switches back to B.
    rows[2].click();

    expect(artworkGroupB.classList.contains("is-active")).toBe(true);
    expect(artworkGroupA.classList.contains("is-active")).toBe(false);
  });

  it("does not switch artwork groups when the active track is selected again", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const rows = document.querySelectorAll(".composer-track");

    const artworkGroupA = document.querySelector(
      ".composer-player-artwork-image-container-a"
    );

    const artworkGroupB = document.querySelector(
      ".composer-player-artwork-image-container-b"
    );

    const audio = document.querySelector(".composer-player-audio");

    // Track One initially uses B.
    expect(artworkGroupB.classList.contains("is-active")).toBe(true);
    expect(artworkGroupA.classList.contains("is-active")).toBe(false);

    const loadCallCount = audio.load.mock.calls.length;

    // Select the already-active track again.
    rows[0].click();

    // Artwork should remain on B.
    expect(artworkGroupB.classList.contains("is-active")).toBe(true);
    expect(artworkGroupA.classList.contains("is-active")).toBe(false);

    // Selecting the active track should not reload the audio either.
    expect(audio.load).toHaveBeenCalledTimes(loadCallCount);
  });
});