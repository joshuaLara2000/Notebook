import { useEffect, useRef } from "react";

import { supabase } from "@/platform/supabase/client";
import { useAuthStore } from "@/platform/auth/store/useAuthStore";
import { loadBoard, saveBoard } from "@/platform/supabase/board.repository";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";

// Al iniciar sesión: carga el tablero del usuario y luego guarda cada cambio
// (con debounce). Es la puente entre el store local y Supabase.
export function useBoardSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!supabase || !userId) return;
    hydratedRef.current = false;
    let unsubscribe: (() => void) | undefined;
    let timer: number | undefined;

    void (async () => {
      const data = await loadBoard();
      useBoardStore.getState().hydrate(data);
      hydratedRef.current = true;
      // empuja el estado inicial (refleja el default si el remoto estaba vacío)
      const st = useBoardStore.getState();
      void saveBoard(userId, {
        pages: st.pages,
        postits: st.postits,
        stickers: st.stickers,
        notebookStyle: st.notebookStyle,
      });
      // guarda cada cambio posterior, con debounce
      unsubscribe = useBoardStore.subscribe((state) => {
        if (!hydratedRef.current) return;
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => void saveBoard(userId, state), 800);
      });
    })();

    return () => {
      unsubscribe?.();
      if (timer) window.clearTimeout(timer);
    };
  }, [userId]);
}
