"use client";
import * as React from "react";
import { api, deviceId } from "@/lib/client";

/** After Google sign-in (?claim=1): attach this device's free checks, save attribution, track signup. */
export function ClaimOnLoad() {
  React.useEffect(() => {
    const u = new URL(location.href);
    if (u.searchParams.get("claim") !== "1") return;
    api("/api/claim", { method: "POST", body: JSON.stringify({ deviceId: deviceId() }) });
    u.searchParams.delete("claim");
    history.replaceState(null, "", u.pathname + (u.search || "") + u.hash);
  }, []);
  return null;
}
