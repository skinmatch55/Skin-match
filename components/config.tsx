"use client";
import * as React from "react";

export interface PublicConfig {
  google: boolean;
  ai: boolean;
  auth: boolean;
}
const Ctx = React.createContext<PublicConfig>({ google: false, ai: false, auth: false });

export function ConfigProvider({ value, children }: { value: PublicConfig; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useConfig() {
  return React.useContext(Ctx);
}
