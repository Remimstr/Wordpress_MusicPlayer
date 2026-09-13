/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const tracks = [
  {
    title: "Track One",
    style: "Orchestral",
    url: "/track-one.mp3",
  },
  {
    title: "Track Two",
    style: "Electronic",
    url: "/track-two.mp3",
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
    ).toBe("· Orchestral");
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
    ).toBe("· Electronic");

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
    ).toBe("· Electronic");

    expect(audio.play).toHaveBeenCalled();
  });
});