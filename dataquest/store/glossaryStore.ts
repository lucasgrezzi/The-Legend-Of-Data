import { create } from "zustand";

/** Abre o Bestiário de Palavras de qualquer tela (o diálogo fica montado no layout) */
interface GlossaryState {
  open: boolean;
  /** Palavra para mostrar em destaque ao abrir */
  focus: string | null;
  show: (focus?: string) => void;
  close: () => void;
}

export const useGlossary = create<GlossaryState>()((set) => ({
  open: false,
  focus: null,
  show: (focus) => set({ open: true, focus: focus ?? null }),
  close: () => set({ open: false, focus: null }),
}));
