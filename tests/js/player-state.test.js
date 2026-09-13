import { describe, expect, it } from "vitest";

import {
  formatTime,
  getPreviousTrackIndex,
  getNextTrackIndex,
  getProgressPercentage,
} from "../../frontend/player-state.js";

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats seconds with zero padding", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("formats longer durations", () => {
    expect(formatTime(125)).toBe("2:05");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(65.9)).toBe("1:05");
  });

  it("returns zero for non-finite values", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
  });
});

describe("getPreviousTrackIndex", () => {
  it("moves to the previous track", () => {
    expect(getPreviousTrackIndex(2, 5)).toBe(1);
  });

  it("wraps from the first track to the last", () => {
    expect(getPreviousTrackIndex(0, 5)).toBe(4);
  });

  it("handles an empty track list", () => {
    expect(getPreviousTrackIndex(0, 0)).toBe(0);
  });
});

describe("getNextTrackIndex", () => {
  it("moves to the next track", () => {
    expect(getNextTrackIndex(2, 5)).toBe(3);
  });

  it("wraps from the last track to the first", () => {
    expect(getNextTrackIndex(4, 5)).toBe(0);
  });

  it("handles an empty track list", () => {
    expect(getNextTrackIndex(0, 0)).toBe(0);
  });
});

describe("getProgressPercentage", () => {
  it("calculates the progress percentage", () => {
    expect(getProgressPercentage(30, 120)).toBe(25);
  });

  it("returns zero when duration is zero", () => {
    expect(getProgressPercentage(30, 0)).toBe(0);
  });

  it("returns zero for a non-finite duration", () => {
    expect(getProgressPercentage(30, NaN)).toBe(0);
    expect(getProgressPercentage(30, Infinity)).toBe(0);
  });
});

describe("formatStyle", () => {
  it("replaces commas with separators", () => {
    expect(formatStyle("Cinematic, Orchestral, Fantasy"))
      .toBe("Cinematic · Orchestral · Fantasy");
  });

  it("trims whitespace around values", () => {
    expect(formatStyle("Cinematic,Orchestral, Fantasy"))
      .toBe("Cinematic · Orchestral · Fantasy");
  });

  it("handles a single value", () => {
    expect(formatStyle("Cinematic"))
      .toBe("Cinematic");
  });
});