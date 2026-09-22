"use client";

import { useEffect, useState } from "react";

/**
 * false no SSR e no primeiro render do cliente; true após o mount.
 * Evita mismatch de hidratação com o progresso salvo no localStorage.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
