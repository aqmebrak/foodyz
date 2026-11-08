import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createFlan,
  createPastryLocation,
  deleteFlan,
  deletePastryLocation,
  updateFlan,
  uploadFlanPhoto,
} from "@/actions/flan";

vi.mock("@/lib/db", () => ({
  db: {
    flan: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    pastryLocation: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

const { db } = await import("@/lib/db");
const { put } = await import("@vercel/blob");

const validFlan = {
  name: "Flan nature",
  locationId: "loc-1",
  rating: 4,
  tried: true,
  triedAt: "2026-01-15",
  photoUrl: "https://example.com/photo.jpg",
  comment: "Great texture.",
};

const validLocation = {
  name: "Pâtisserie du Parc",
  mapsUrl: "https://maps.google.com/?q=45.75,4.85",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createFlan", () => {
  it("returns error for empty name", async () => {
    const result = await createFlan({ ...validFlan, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.flan.create).not.toHaveBeenCalled();
  });

  it("returns error for rating above 5", async () => {
    const result = await createFlan({ ...validFlan, rating: 6 });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.flan.create).not.toHaveBeenCalled();
  });

  it("returns error for missing locationId", async () => {
    const result = await createFlan({ ...validFlan, locationId: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.flan.create).not.toHaveBeenCalled();
  });

  it("creates with triedAt converted to a Date when tried", async () => {
    vi.mocked(db.flan.create).mockResolvedValueOnce({} as never);
    await createFlan(validFlan);
    expect(db.flan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Flan nature",
        locationId: "loc-1",
        rating: 4,
        tried: true,
        triedAt: new Date("2026-01-15"),
        photoUrl: "https://example.com/photo.jpg",
        comment: "Great texture.",
      }),
    });
  });

  it("stores triedAt as null when omitted", async () => {
    vi.mocked(db.flan.create).mockResolvedValueOnce({} as never);
    const { triedAt: _triedAt, ...rest } = validFlan;
    await createFlan(rest);
    expect(db.flan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ triedAt: null }),
    });
  });
});

describe("updateFlan", () => {
  it("calls db.flan.update with the given id", async () => {
    vi.mocked(db.flan.update).mockResolvedValueOnce({} as never);
    await updateFlan("flan-1", validFlan);
    expect(db.flan.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "flan-1" } })
    );
  });

  it("returns error on invalid data", async () => {
    const result = await updateFlan("flan-1", { ...validFlan, rating: -1 });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.flan.update).not.toHaveBeenCalled();
  });
});

describe("deleteFlan", () => {
  it("calls db.flan.delete with the given id", async () => {
    vi.mocked(db.flan.delete).mockResolvedValueOnce({} as never);
    await deleteFlan("flan-1");
    expect(db.flan.delete).toHaveBeenCalledWith({ where: { id: "flan-1" } });
  });
});

describe("createPastryLocation", () => {
  it("returns error for empty name", async () => {
    const result = await createPastryLocation({ ...validLocation, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.pastryLocation.create).not.toHaveBeenCalled();
  });

  it("returns error for an invalid URL", async () => {
    const result = await createPastryLocation({ ...validLocation, mapsUrl: "not-a-url" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.pastryLocation.create).not.toHaveBeenCalled();
  });

  it("creates and returns the new location on valid input", async () => {
    const mockLocation = { id: "loc-1", ...validLocation };
    vi.mocked(db.pastryLocation.create).mockResolvedValueOnce(mockLocation as never);
    const result = await createPastryLocation(validLocation);
    expect(result).toEqual({ location: mockLocation });
  });
});

describe("deletePastryLocation", () => {
  it("calls db.pastryLocation.delete with the given id", async () => {
    vi.mocked(db.pastryLocation.delete).mockResolvedValueOnce({} as never);
    await deletePastryLocation("loc-1");
    expect(db.pastryLocation.delete).toHaveBeenCalledWith({ where: { id: "loc-1" } });
  });
});

describe("uploadFlanPhoto", () => {
  it("returns error when no file is provided", async () => {
    const formData = new FormData();
    const result = await uploadFlanPhoto(formData);
    expect(result).toEqual({ error: "No file provided" });
    expect(put).not.toHaveBeenCalled();
  });

  it("uploads the file and returns its blob url", async () => {
    vi.mocked(put).mockResolvedValueOnce({ url: "https://blob.example.com/flans/photo.jpg" } as never);
    const formData = new FormData();
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    formData.set("file", file);

    const result = await uploadFlanPhoto(formData);
    expect(put).toHaveBeenCalledOnce();
    expect(result).toEqual({ url: "https://blob.example.com/flans/photo.jpg" });
  });
});
