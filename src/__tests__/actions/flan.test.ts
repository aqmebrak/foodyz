import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createFlan,
  createPastryLocation,
  deleteFlan,
  deletePastryLocation,
  getPastryLocationsWithFlans,
  updateFlan,
  updatePastryLocationUrl,
  uploadFlanPhoto,
} from "@/actions/flan";
import { expandMapsShortUrl } from "@/lib/maps-url";

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
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

const { db } = await import("@/lib/db");
const { revalidatePath } = await import("next/cache");
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
    expect(revalidatePath).toHaveBeenCalledWith("/flans");
    expect(revalidatePath).toHaveBeenCalledWith("/flan");
  });

  it("returns error for an empty id without touching the db", async () => {
    const result = await deleteFlan("");
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.flan.delete).not.toHaveBeenCalled();
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
    expect(revalidatePath).toHaveBeenCalledWith("/flans");
    expect(revalidatePath).toHaveBeenCalledWith("/flan");
  });

  it("expands a short link before storing it", async () => {
    const full = "https://www.google.com/maps/place/X/@45.7,4.8,17z/data=!3d45.7578!4d4.832";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: full } })).mockResolvedValueOnce(new Response(null, { status: 200 }))
    );
    vi.mocked(db.pastryLocation.create).mockResolvedValueOnce({} as never);
    await createPastryLocation({ name: "X", mapsUrl: "https://maps.app.goo.gl/abc" });
    expect(db.pastryLocation.create).toHaveBeenCalledWith({
      data: { name: "X", mapsUrl: full },
    });
    vi.unstubAllGlobals();
  });

  it("does not fetch for non-short URLs", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    vi.mocked(db.pastryLocation.create).mockResolvedValueOnce({} as never);
    await createPastryLocation(validLocation);
    expect(f).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("deletePastryLocation", () => {
  it("calls db.pastryLocation.delete with the given id", async () => {
    vi.mocked(db.pastryLocation.delete).mockResolvedValueOnce({} as never);
    await deletePastryLocation("loc-1");
    expect(db.pastryLocation.delete).toHaveBeenCalledWith({ where: { id: "loc-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/flans");
    expect(revalidatePath).toHaveBeenCalledWith("/flan");
  });

  it("returns error for an empty id without touching the db", async () => {
    const result = await deletePastryLocation("");
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.pastryLocation.delete).not.toHaveBeenCalled();
  });
});

describe("getPastryLocationsWithFlans", () => {
  it("lists shops by name with their flans", async () => {
    vi.mocked(db.pastryLocation.findMany).mockResolvedValueOnce([] as never);
    await getPastryLocationsWithFlans();
    expect(db.pastryLocation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: "asc" },
        include: { flans: expect.objectContaining({ orderBy: { name: "asc" } }) },
      }),
    );
  });
});

describe("updatePastryLocationUrl", () => {
  const url = "https://www.google.com/maps/place/X/@1,2,17z/data=!3d1.5!4d2.5";

  beforeEach(() => {
    vi.mocked(db.pastryLocation.update).mockReset();
    vi.mocked(revalidatePath).mockClear();
  });

  it("saves the trimmed URL and revalidates the map and shop pages", async () => {
    vi.mocked(db.pastryLocation.update).mockResolvedValueOnce({ id: "loc-1", mapsUrl: url } as never);
    const result = await updatePastryLocationUrl("loc-1", `  ${url}  `);
    expect(db.pastryLocation.update).toHaveBeenCalledWith({
      where: { id: "loc-1" },
      data: { mapsUrl: url },
    });
    expect(result).toEqual({ location: { id: "loc-1", mapsUrl: url } });
    for (const path of ["/flans", "/flan", "/shops"]) {
      expect(revalidatePath).toHaveBeenCalledWith(path);
    }
  });

  it("expands a short link before saving", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: url } }))
        .mockResolvedValueOnce(new Response(null, { status: 200 })),
    );
    vi.mocked(db.pastryLocation.update).mockResolvedValueOnce({ id: "loc-1", mapsUrl: url } as never);
    await updatePastryLocationUrl("loc-1", "https://maps.app.goo.gl/abc");
    expect(db.pastryLocation.update).toHaveBeenCalledWith({
      where: { id: "loc-1" },
      data: { mapsUrl: url },
    });
    vi.unstubAllGlobals();
  });

  it("rejects an invalid URL or empty id without touching the db", async () => {
    expect(await updatePastryLocationUrl("loc-1", "not a url")).toEqual({ error: expect.any(String) });
    expect(await updatePastryLocationUrl("", url)).toEqual({ error: expect.any(String) });
    expect(db.pastryLocation.update).not.toHaveBeenCalled();
  });

  it("returns an error when the shop no longer exists", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(db.pastryLocation.update).mockRejectedValueOnce(new Error("P2025"));
    expect(await updatePastryLocationUrl("gone", url)).toEqual({ error: expect.any(String) });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("expandMapsShortUrl", () => {
  const short = "https://maps.app.goo.gl/abc";
  const full = "https://www.google.com/maps/place/X/@1,2,17z/data=!3d1!4d2";
  const redirect = (location: string) =>
    new Response(null, { status: 302, headers: { location } });

  it("follows one hop", async () => {
    const f = vi.fn().mockResolvedValueOnce(redirect(full)).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", f);
    expect(await expandMapsShortUrl(short)).toBe(full);
    expect(f.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
    vi.unstubAllGlobals();
  });

  it("follows two hops", async () => {
    const mid = "https://goo.gl/maps/zzz";
    const f = vi.fn().mockResolvedValueOnce(redirect(mid)).mockResolvedValueOnce(redirect(full)).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", f);
    expect(await expandMapsShortUrl(short)).toBe(full);
    vi.unstubAllGlobals();
  });

  it("stops after 3 hops", async () => {
    const f = vi.fn().mockImplementation(async () => redirect("https://goo.gl/maps/loop"));
    vi.stubGlobal("fetch", f);
    await expandMapsShortUrl(short);
    expect(f).toHaveBeenCalledTimes(3);
    vi.unstubAllGlobals();
  });

  it("does not follow a non-Google redirect target", async () => {
    const f = vi.fn().mockResolvedValue(redirect("https://evil.example.com/x"));
    vi.stubGlobal("fetch", f);
    expect(await expandMapsShortUrl(short)).toBe(short);
    expect(f).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("does not follow a non-https redirect target", async () => {
    const f = vi.fn().mockResolvedValue(redirect("http://www.google.com/maps"));
    vi.stubGlobal("fetch", f);
    expect(await expandMapsShortUrl(short)).toBe(short);
    expect(f).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("never fetches a host outside the allowlist", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(await expandMapsShortUrl("https://evil.example.com/x")).toBe("https://evil.example.com/x");
    expect(f).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("returns the original URL on fetch error or timeout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError")));
    expect(await expandMapsShortUrl(short)).toBe(short);
    vi.unstubAllGlobals();
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
