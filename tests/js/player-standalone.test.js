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
  window.HTMLMediaElement.prototype.load = vi.fn();
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue();
  window.HTMLMediaElement.prototype.pause = vi.fn();

  const audio = document.querySelector(".composer-player-audio");
  return audio;
}

describe("player standalone / inline mode", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    mockAudio();

    delete window.ComposerPlayer;
    delete window.ComposerPlayerConfig;
    delete window.ComposerPlayerTracks;

    globalThis.ResizeObserver = class {
      observe() {}
      disconnect() {}
    };

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName, options) => {
        const element = originalCreateElement(tagName, options);

        if (tagName.toLowerCase() === "img") {
          Object.defineProperty(element, "complete", {
            configurable: true,
            value: true,
          });
        }

        return element;
      },
    );
  });

  it("loads inline tracks from window.ComposerPlayerConfig.tracks without calling fetch", async () => {
    document.body.innerHTML = `
      <div class="composer-player">
        <div class="composer-player-artwork">
          <div class="composer-player-artwork-content"></div>
        </div>
        <div class="composer-tracklist"></div>
      </div>
      <div id="composer-floating-player">
        <audio class="composer-player-audio"></audio>
        <button class="composer-player-previous"><img></button>
        <button class="composer-player-play"><img></button>
        <button class="composer-player-next"><img></button>
        <span class="composer-player-title"></span>
        <span class="composer-player-style"></span>
        <input class="composer-player-progress" type="range" value="0">
        <span class="composer-player-current-time"></span>
        <span class="composer-player-duration"></span>
      </div>
    `;

    mockAudio();

    window.ComposerPlayerConfig = {
      tracks,
    };

    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(document.querySelector(".composer-player-title").textContent).toBe(
        "Track One",
      );
    });

    expect(fetchSpy).not.toHaveBeenCalled();

    const audio = document.querySelector(".composer-player-audio");
    expect(audio.src).toContain("/track-one.mp3");

    const trackRows = document.querySelectorAll(".composer-track");
    expect(trackRows).toHaveLength(2);
  });

  it("loads inline tracks from window.ComposerPlayerTracks array directly", async () => {
    document.body.innerHTML = `
      <div class="composer-player">
        <div class="composer-player-artwork">
          <div class="composer-player-artwork-content"></div>
        </div>
        <div class="composer-tracklist"></div>
      </div>
      <div id="composer-floating-player">
        <audio class="composer-player-audio"></audio>
        <button class="composer-player-previous"><img></button>
        <button class="composer-player-play"><img></button>
        <button class="composer-player-next"><img></button>
        <span class="composer-player-title"></span>
        <span class="composer-player-style"></span>
        <input class="composer-player-progress" type="range" value="0">
        <span class="composer-player-current-time"></span>
        <span class="composer-player-duration"></span>
      </div>
    `;

    mockAudio();

    window.ComposerPlayerTracks = tracks;

    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(document.querySelector(".composer-player-title").textContent).toBe(
        "Track One",
      );
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.querySelectorAll(".composer-track")).toHaveLength(2);
  });

  it("automatically injects the floating player into document.body if missing", async () => {
    document.body.innerHTML = `
      <div class="composer-player">
        <div class="composer-player-artwork">
          <div class="composer-player-artwork-content"></div>
        </div>
        <div class="composer-tracklist"></div>
      </div>
    `;

    window.ComposerPlayerConfig = { tracks };

    await import("../../frontend/player.js");

    const floatingPlayer = document.getElementById("composer-floating-player");
    expect(floatingPlayer).not.toBeNull();
    expect(document.body.contains(floatingPlayer)).toBe(true);

    const audio = floatingPlayer.querySelector(".composer-player-audio");
    expect(audio).not.toBeNull();
    expect(
      floatingPlayer.querySelector(".composer-player-play"),
    ).not.toBeNull();
    expect(
      floatingPlayer.querySelector(".composer-player-previous"),
    ).not.toBeNull();
    expect(
      floatingPlayer.querySelector(".composer-player-next"),
    ).not.toBeNull();
  });

  it("automatically creates tracklist container if .composer-player is empty", async () => {
    document.body.innerHTML = `
      <div class="composer-player"></div>
    `;

    window.ComposerPlayerConfig = { tracks };

    await import("../../frontend/player.js");

    const tracklist = document.querySelector(".composer-tracklist");
    expect(tracklist).not.toBeNull();

    const artwork = document.querySelector(".composer-player-artwork");
    expect(artwork).not.toBeNull();

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".composer-track")).toHaveLength(2);
    });
  });

  it("uses built-in default SVG data URIs if no icons are provided", async () => {
    document.body.innerHTML = `
      <div class="composer-player"></div>
    `;

    window.ComposerPlayerConfig = { tracks };

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".composer-track")).toHaveLength(2);
    });

    const playBtn = document.querySelector(".composer-player-play img");
    expect(playBtn.src).toContain("data:image/svg+xml");

    const trackPlayBtn = document.querySelector(".composer-track-play img");
    expect(trackPlayBtn.src).toContain("data:image/svg+xml");
  });

  it("overrides default icons if custom icons are provided in window.ComposerPlayerConfig", async () => {
    document.body.innerHTML = `
      <div class="composer-player"></div>
    `;

    window.ComposerPlayerConfig = {
      tracks,
      icons: {
        play: "https://custom.icon/play.svg",
      },
    };

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".composer-track")).toHaveLength(2);
    });

    const playBtn = document.querySelector(".composer-player-play img");
    expect(playBtn.src).toBe("https://custom.icon/play.svg");
  });

  it("switches tracks, updates artwork, and applies gain when clicking a track row", async () => {
    document.body.innerHTML = `
      <div class="composer-player"></div>
    `;

    window.ComposerPlayerConfig = { tracks };

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".composer-track")).toHaveLength(2);
    });

    const rows = document.querySelectorAll(".composer-track");
    const audio = document.querySelector(".composer-player-audio");

    // Track 0 has gainDb: 0 -> volume = 1
    expect(audio.volume).toBe(1);

    // Click track 1 (gainDb: -3)
    rows[1].click();

    expect(document.querySelector(".composer-player-title").textContent).toBe(
      "Track Two",
    );
    expect(audio.volume).toBeCloseTo(10 ** (-3 / 20));

    await vi.waitFor(() => {
      const images = Array.from(
        document.querySelectorAll(".composer-player-artwork-image"),
      );
      expect(images.some((img) => img.src.includes("track-two.jpg"))).toBe(
        true,
      );
    });
  });

  it("advances with next and previous buttons", async () => {
    document.body.innerHTML = `
      <div class="composer-player"></div>
    `;

    window.ComposerPlayerConfig = { tracks };

    await import("../../frontend/player.js");

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".composer-track")).toHaveLength(2);
    });

    const nextBtn = document.querySelector(".composer-player-next");
    const prevBtn = document.querySelector(".composer-player-previous");

    nextBtn.click();
    expect(document.querySelector(".composer-player-title").textContent).toBe(
      "Track Two",
    );

    prevBtn.click();
    expect(document.querySelector(".composer-player-title").textContent).toBe(
      "Track One",
    );
  });
});
