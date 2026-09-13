/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from "vitest";
import { renderTracklist } from "../../frontend/player-render.js";

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

describe("renderTracklist", () => {
  it("renders track titles and styles", () => {
    const tracklist = document.createElement("div");

    renderTracklist(
      tracklist,
      tracks,
      {
        play: "/play.svg",
      },
      0,
      {
        paused: true,
        play: vi.fn(),
        pause: vi.fn(),
      },
      vi.fn()
    );

    const rows = tracklist.querySelectorAll(".composer-track");

    expect(rows).toHaveLength(2);

    expect(
      rows[0].querySelector(".composer-track-title").textContent.trim()
    ).toBe("Track One");

    expect(
      rows[0].querySelector(".composer-track-style").textContent.trim()
    ).toBe("Orchestral");

    expect(
      rows[1].querySelector(".composer-track-title").textContent.trim()
    ).toBe("Track Two");

    expect(
      rows[1].querySelector(".composer-track-style").textContent.trim()
    ).toBe("Electronic");
  });
});