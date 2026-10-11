import { describe, expect, it } from "vitest";
import {
  bookingConflicts,
  computeFreeSlots,
  intervalsOverlap,
  wallTimeToUtc,
} from "./availability";
import type { AvailabilitySlot, LessonBooking } from "./types";

describe("intervalsOverlap", () => {
  it("detects overlap", () => {
    const a0 = new Date("2026-10-12T14:00:00Z");
    const a1 = new Date("2026-10-12T15:00:00Z");
    const b0 = new Date("2026-10-12T14:30:00Z");
    const b1 = new Date("2026-10-12T15:30:00Z");
    expect(intervalsOverlap(a0, a1, b0, b1)).toBe(true);
  });

  it("allows adjacent slots", () => {
    const a0 = new Date("2026-10-12T14:00:00Z");
    const a1 = new Date("2026-10-12T15:00:00Z");
    const b0 = new Date("2026-10-12T15:00:00Z");
    const b1 = new Date("2026-10-12T16:00:00Z");
    expect(intervalsOverlap(a0, a1, b0, b1)).toBe(false);
  });
});

describe("bookingConflicts", () => {
  const existing: LessonBooking[] = [
    {
      id: "l1",
      studentId: "s1",
      teacherId: "t1",
      subjectId: "english",
      topic: "",
      startsAt: "2026-10-12T14:00:00.000Z",
      durationMinutes: 45,
      status: "confirmed",
      isTrial: false,
      recurringRule: null,
      dailyRoomUrl: null,
      dailyRoomName: null,
      summary: null,
      homework: null,
      unlockedGameIds: [],
      createdAt: "",
      updatedAt: "",
      cancelReason: null,
    },
  ];

  it("blocks overlapping booking", () => {
    expect(
      bookingConflicts(new Date("2026-10-12T14:20:00.000Z"), 45, existing)
    ).toBe(true);
  });

  it("ignores cancelled", () => {
    const cancelled = [{ ...existing[0], status: "cancelled" as const }];
    expect(
      bookingConflicts(new Date("2026-10-12T14:20:00.000Z"), 45, cancelled)
    ).toBe(false);
  });
});

describe("wallTimeToUtc / computeFreeSlots", () => {
  it("converts Berlin wall time roughly", () => {
    const d = wallTimeToUtc("2026-01-15", 16 * 60, "Europe/Berlin");
    expect(d).toBeTruthy();
    // Winter: UTC+1 → 15:00 UTC
    expect(d!.getUTCHours()).toBe(15);
  });

  it("skips booked slots", () => {
    const slots: AvailabilitySlot[] = [
      {
        id: "s1",
        teacherId: "t1",
        weekday: "thu",
        startMinutes: 15 * 60,
        endMinutes: 18 * 60,
        timezone: "Europe/Berlin",
      },
    ];
    // Find a Thursday from a fixed from-date
    const from = new Date("2026-10-15T08:00:00.000Z"); // Thursday
    const free = computeFreeSlots({
      teacherId: "t1",
      slots,
      exceptions: [],
      bookings: [
        {
          id: "l1",
          studentId: "s1",
          teacherId: "t1",
          subjectId: "math",
          topic: "",
          startsAt: "2026-10-15T13:00:00.000Z", // 15:00 Berlin CEST (UTC+2)
          durationMinutes: 45,
          status: "confirmed",
          isTrial: false,
          recurringRule: null,
          dailyRoomUrl: null,
          dailyRoomName: null,
          summary: null,
          homework: null,
          unlockedGameIds: [],
          createdAt: "",
          updatedAt: "",
          cancelReason: null,
        },
      ],
      from,
      daysAhead: 1,
      durationMinutes: 45,
      studentTimeZone: "Europe/Berlin",
    });
    expect(free.every((f) => f.startsAt !== "2026-10-15T13:00:00.000Z")).toBe(
      true
    );
  });
});
