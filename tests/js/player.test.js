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
    gainDb: 0,
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
    gainDb: -3,
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
          <div class="composer-player-artwork-content"></div>
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

    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);

      if (tagName.toLowerCase() === "img") {
        Object.defineProperty(element, "complete", {
          configurable: true,
          value: true,
        });
      }

      return element;
    });
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

  it("applies unity gain to a track with 0 dB gain", async () => {
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

    expect(audio.volume).toBe(1);
  });

  it("converts track gain from dB to linear volume", async () => {
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

    expect(audio.volume).toBeCloseTo(10 ** (-3 / 20));
  });

  it("clamps positive track gain to 0 dB", async () => {
    const boostedTrack = {
      ...tracks[0],
      gainDb: 6,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([boostedTrack]),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    expect(audio.volume).toBe(1);
  });

  it("defaults missing track gain to 0 dB", async () => {
    const trackWithoutGain = {
      ...tracks[0],
    };

    delete trackWithoutGain.gainDb;

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([trackWithoutGain]),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    expect(audio.volume).toBe(1);
  });

  it("clamps track attenuation to -12 dB", async () => {
    const quietTrack = {
      ...tracks[0],
      gainDb: -20,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([quietTrack]),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const audio = document.querySelector(".composer-player-audio");

    expect(audio.volume).toBeCloseTo(10 ** (-12 / 20));
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

    const artworkContent = document.querySelector(
      ".composer-player-artwork-content"
    );

    const rows = document.querySelectorAll(".composer-track");

    await vi.waitFor(() => {
      expect(
        artworkContent.querySelector(
          ".composer-player-artwork-image-container.is-active"
        )
      ).not.toBeNull();
    });

    const firstGroup = artworkContent.querySelector(
      ".composer-player-artwork-image-container"
    );

    expect(firstGroup.querySelector("img").src).toContain("track-one.jpg");
    expect(firstGroup.querySelector("img").alt).toBe("Track One artwork");
    expect(
      firstGroup.querySelector(".composer-player-artwork-caption").innerHTML
    ).toBe("Track One caption");

    rows[1].click();

    const incomingGroup = artworkContent.querySelector(
      ".composer-player-artwork-image-container.is-entering"
    );

    expect(incomingGroup).not.toBeNull();
    expect(incomingGroup.querySelector("img").src).toContain(
      "track-two.jpg"
    );
    expect(incomingGroup.querySelector("img").alt).toBe("Track Two artwork");
    expect(
      incomingGroup.querySelector(".composer-player-artwork-caption").innerHTML
    ).toBe("Track Two caption");

    expect(
      artworkContent.querySelectorAll(
        ".composer-player-artwork-image-container"
      )
    ).toHaveLength(2);

    await vi.waitFor(() => {
      expect(incomingGroup.classList.contains("is-active")).toBe(true);
      expect(firstGroup.classList.contains("is-exiting")).toBe(true);
    });

    firstGroup.dispatchEvent(new Event("transitionend"));

    await vi.waitFor(() => {
      expect(
        artworkContent.querySelectorAll(
          ".composer-player-artwork-image-container"
        )
      ).toHaveLength(1);
    });

    expect(
      artworkContent.querySelector(
        ".composer-player-artwork-image-container.is-active"
      )
    ).toBe(incomingGroup);
  });

  it("handles a track without artwork", async () => {
    const trackWithoutArtwork = {
      ...tracks[0],
      image: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([trackWithoutArtwork]),
    });

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(
        document.querySelector(".composer-player-title").textContent
      ).toBe("Track One");
    });

    const artwork = document.querySelector(".composer-player-artwork");
    const artworkContent = document.querySelector(
      ".composer-player-artwork-content"
    );

    expect(artwork.hidden).toBe(false);
    expect(artwork.classList.contains("is-placeholder")).toBe(true);

    expect(
      artworkContent.querySelectorAll(
        ".composer-player-artwork-image-container"
      )
    ).toHaveLength(0);
  });

  it("replaces the previous artwork when changing tracks", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    const artworkContent = document.querySelector(
      ".composer-player-artwork-content"
    );

    const rows = document.querySelectorAll(".composer-track");

    await vi.waitFor(() => {
      expect(
        artworkContent.querySelector(
          ".composer-player-artwork-image-container.is-active"
        )
      ).not.toBeNull();
    });

    const firstGroup = artworkContent.querySelector(
      ".composer-player-artwork-image-container"
    );

    rows[1].click();

    const secondGroup = artworkContent.querySelector(
      ".composer-player-artwork-image-container.is-entering"
    );

    await vi.waitFor(() => {
      expect(secondGroup.classList.contains("is-active")).toBe(true);
      expect(firstGroup.classList.contains("is-exiting")).toBe(true);
    });

    firstGroup.dispatchEvent(new Event("transitionend"));

    await vi.waitFor(() => {
      expect(
        artworkContent.querySelectorAll(
          ".composer-player-artwork-image-container"
        )
      ).toHaveLength(1);
    });

    expect(
      artworkContent.querySelector(
        ".composer-player-artwork-image-container"
      )
    ).toBe(secondGroup);

    expect(secondGroup.querySelector("img").src).toContain("track-two.jpg");
  });

  it("does not change artwork when the active track is selected again", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tracks),
    });

    await import("../../frontend/player.js");

    const artworkContent = document.querySelector(
      ".composer-player-artwork-content"
    );

    const rows = document.querySelectorAll(".composer-track");
    const audio = document.querySelector(".composer-player-audio");

    await vi.waitFor(() => {
      expect(
        artworkContent.querySelector(
          ".composer-player-artwork-image-container.is-active"
        )
      ).not.toBeNull();
    });

    const initialGroup = artworkContent.querySelector(
      ".composer-player-artwork-image-container"
    );

    const initialLoadCallCount = audio.load.mock.calls.length;

    rows[0].click();

    expect(
      artworkContent.querySelectorAll(
        ".composer-player-artwork-image-container"
      )
    ).toHaveLength(1);

    expect(
      artworkContent.querySelector(
        ".composer-player-artwork-image-container"
      )
    ).toBe(initialGroup);

    expect(audio.load).toHaveBeenCalledTimes(initialLoadCallCount);
  });
});