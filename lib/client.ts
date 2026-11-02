"use client";

export function deviceId(): string {
  try {
    let id = localStorage.getItem("sm_device");
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "");
      localStorage.setItem("sm_device", id);
    }
    return id;
  } catch {
    return "nodevice" + Math.random().toString(36).slice(2, 12);
  }
}

export function saveLastCheck(id: string, thumb?: string | null) {
  try {
    localStorage.setItem("sm_last_check", id);
    if (thumb) localStorage.setItem(`sm_thumb_${id}`, thumb);
  } catch {}
}
export function lastCheck(): string | null {
  try {
    return localStorage.getItem("sm_last_check");
  } catch {
    return null;
  }
}
export function thumbFor(id: string): string | null {
  try {
    return localStorage.getItem(`sm_thumb_${id}`);
  } catch {
    return null;
  }
}
export function forgetLocal() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("sm_")) localStorage.removeItem(k);
  } catch {}
}

/** Downscale a photo in the browser: one copy for the label reader, one tiny thumbnail. */
export async function preparePhoto(file: File): Promise<{ data: string; mime: "image/jpeg"; thumb: string; preview: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("unreadable"));
      i.src = url;
    });
    const draw = (max: number, q: number) => {
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", q);
    };
    const big = draw(1600, 0.85);
    const preview = draw(900, 0.8);
    const thumb = draw(320, 0.7);
    return { data: big.split(",")[1], mime: "image/jpeg", thumb, preview };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
    });
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}
