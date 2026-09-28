/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  updateMediaSession,
  initializeMediaSession,
} from "../../frontend/media-session.js";

describe("updateMediaSession", () => {
  beforeEach(() => {
    navigator.mediaSession = {
      metadata: null,
    };

    global.MediaMetadata = vi.fn(function (options) {
      return options;
    });
  });

  it("sets track title, artist, album, and artwork", () => {
    const track = {
      title: "Flidais' Grove",
      image: {
        url: "/images/flidais.jpg",
        type: "image/jpeg",
      },
    };

    updateMediaSession(track);

    expect(MediaMetadata).toHaveBeenCalledWith({
      title: "Flidais' Grove",
      artist: "Remi Marchand",
      album: "Original Music",
      artwork: [
        {
          src: "/images/flidais.jpg",
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });

    expect(navigator.mediaSession.metadata).toEqual({
      title: "Flidais' Grove",
      artist: "Remi Marchand",
      album: "Original Music",
      artwork: [
        {
          src: "/images/flidais.jpg",
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });
  });

  it("works without artwork", () => {
    const track = {
      title: "Stack o Bot",
    };

    updateMediaSession(track);

    expect(MediaMetadata).toHaveBeenCalledWith({
      title: "Stack o Bot",
      artist: "Remi Marchand",
      album: "Original Music",
      artwork: [],
    });
  });

  it("uses the track artwork MIME type when provided", () => {
    const track = {
      title: "Stack o Bot",
      image: {
        url: "/images/stack-o-bot.png",
        type: "image/png",
      },
    };

    updateMediaSession(track);

    expect(MediaMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        artwork: [
          {
            src: "/images/stack-o-bot.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      })
    );
  });

  it("does nothing when Media Session is unavailable", () => {
    delete navigator.mediaSession;

    expect(() =>
      updateMediaSession({
        title: "Flidais' Grove",
      })
    ).not.toThrow();
  });
});

describe("initializeMediaSession", () => {
  let audio;
  let handlers;

  beforeEach(() => {
    handlers = {};

    navigator.mediaSession = {
      metadata: null,
      playbackState: "none",
      setActionHandler: vi.fn((action, handler) => {
        handlers[action] = handler;
      }),
    };

    audio = document.createElement("audio");

    // jsdom doesn't implement the actual media playback API.
    vi.spyOn(audio, "pause").mockImplementation(() => {});
  });

  it("registers media session action handlers", () => {
    const playTrack = vi.fn();

    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 1,
      getTrackCount: () => 3,
      playTrack,
      getPreviousTrackIndex: () => 0,
      getNextTrackIndex: () => 2,
    });

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith(
      "play",
      expect.any(Function)
    );

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith(
      "pause",
      expect.any(Function)
    );

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith(
      "previoustrack",
      expect.any(Function)
    );

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith(
      "nexttrack",
      expect.any(Function)
    );
  });

  it("plays the current track from the media session", () => {
    const playTrack = vi.fn();

    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 1,
      getTrackCount: () => 3,
      playTrack,
      getPreviousTrackIndex: () => 0,
      getNextTrackIndex: () => 2,
    });

    handlers.play();

    expect(playTrack).toHaveBeenCalledWith(1);
  });

  it("pauses the audio from the media session", () => {
    const playTrack = vi.fn();

    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 1,
      getTrackCount: () => 3,
      playTrack,
      getPreviousTrackIndex: () => 0,
      getNextTrackIndex: () => 2,
    });

    handlers.pause();

    expect(audio.pause).toHaveBeenCalled();
  });

  it("plays the previous track", () => {
    const playTrack = vi.fn();

    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 2,
      getTrackCount: () => 4,
      playTrack,
      getPreviousTrackIndex: () => 1,
      getNextTrackIndex: () => 3,
    });

    handlers.previoustrack();

    expect(playTrack).toHaveBeenCalledWith(1);
  });

  it("plays the next track", () => {
    const playTrack = vi.fn();

    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 1,
      getTrackCount: () => 4,
      playTrack,
      getPreviousTrackIndex: () => 0,
      getNextTrackIndex: () => 2,
    });

    handlers.nexttrack();

    expect(playTrack).toHaveBeenCalledWith(2);
  });

  it("sets playback state to playing", () => {
    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 0,
      getTrackCount: () => 1,
      playTrack: vi.fn(),
      getPreviousTrackIndex: () => 0,
      getNextTrackIndex: () => 0,
    });

    audio.dispatchEvent(new Event("play"));

    expect(navigator.mediaSession.playbackState).toBe("playing");
  });

  it("sets playback state to paused", () => {
    initializeMediaSession({
      audio,
      getCurrentTrackIndex: () => 0,
      getTrackCount: () => 1,
      playTrack: vi.fn(),
      getPreviousTrackIndex: () => 0,
      getNextTrackIndex: () => 0,
    });

    audio.dispatchEvent(new Event("pause"));

    expect(navigator.mediaSession.playbackState).toBe("paused");
  });
});