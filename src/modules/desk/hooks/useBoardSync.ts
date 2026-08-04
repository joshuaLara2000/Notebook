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
      // Si la carga falla, NO hidratamos con vacío ni activamos el guardado:
      // una carga fallida nunca debe terminar borrando el tablero en la nube.
      const data = await loadBoard().catch((e) => {
        console.error("useBoardSync: carga del tablero falló, sync abortada", e);
        return null;
      });
      if (!data) return;

      useBoardStore.getState().hydrate(data);
      hydratedRef.current = true;
      // No se empuja ningún estado inicial: el primer guardado ocurre solo
      // cuando el usuario hace un cambio real (con debounce). Así, iniciar
      // sesión jamás dispara un borrado destructivo.
      unsubscribe = useBoardStore.subscribe((state) => {
        if (!hydratedRef.current) return;
        // Defensa extra: no guardar si la sesión ya cambió (evita carreras al
        // cerrar sesión, cuando reset() vacía el store).
        if (useAuthStore.getState().user?.id !== userId) return;
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
