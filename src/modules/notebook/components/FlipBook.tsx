import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export interface FlipBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
}

interface FlipBookProps {
  pageIds: string[];
  renderPage: (id: string) => ReactNode;
  width: number;
  height: number;
  onFlip?: (index: number) => void;
}

const DURATION = 550; // ms; debe coincidir con la animación CSS
const PAGE_CLASS =
  "bg-paper absolute inset-0 overflow-hidden rounded-xl shadow-[0_18px_30px_rgba(0,0,0,.22)]";

/**
 * Libreta con volteo 3D propio (animación CSS). La hoja actual gira sobre el
 * lomo izquierdo revelando la de destino, con el mismo movimiento al avanzar y
 * al regresar (solo cambia la hoja destino). Reemplaza a react-pageflip.
 */
export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(
  ({ pageIds, renderPage, width, height, onFlip }, ref) => {
    const [shown, setShown] = useState(0);
    const [anim, setAnim] = useState<{ dir: "next" | "prev"; to: number } | null>(
      null
    );

    const onFlipRef = useRef(onFlip);
    onFlipRef.current = onFlip;
    // guarda para no confirmar dos veces (animationend + timeout de respaldo)
    const animRef = useRef(anim);
    animRef.current = anim;

    const commit = useCallback((i: number) => {
      setShown(i);
      onFlipRef.current?.(i);
    }, []);

    // notifica el índice inicial una vez
    useEffect(() => {
      onFlipRef.current?.(0);
    }, []);

    // acota el índice si se borran hojas
    useEffect(() => {
      if (shown > pageIds.length - 1) commit(Math.max(0, pageIds.length - 1));
    }, [pageIds.length, shown, commit]);

    // termina el volteo (confirma la hoja); idempotente
    const finish = useCallback(() => {
      const cur = animRef.current;
      if (!cur) return;
      animRef.current = null;
      commit(cur.to);
      setAnim(null);
    }, [commit]);

    // respaldo por si animationend no dispara (p. ej. pestaña oculta)
    useEffect(() => {
      if (!anim) return;
      const t = setTimeout(finish, DURATION + 80);
      return () => clearTimeout(t);
    }, [anim, finish]);

    useImperativeHandle(
      ref,
      () => ({
        flipNext: () => {
          if (!anim && shown < pageIds.length - 1)
            setAnim({ dir: "next", to: shown + 1 });
        },
        flipPrev: () => {
          if (!anim && shown > 0) setAnim({ dir: "prev", to: shown - 1 });
        },
        goTo: (i) => {
          if (anim || i === shown || i < 0 || i > pageIds.length - 1) return;
          if (i === shown + 1) setAnim({ dir: "next", to: i });
          else if (i === shown - 1) setAnim({ dir: "prev", to: i });
          else commit(i); // salto no adyacente: instantáneo
        },
        getIndex: () => shown,
      }),
      [anim, shown, pageIds.length, commit]
    );

    return (
      <div className="relative" style={{ width, height, perspective: 1800 }}>
        {anim ? (
          <>
            {/* hoja de abajo (queda fija mientras la otra gira encima):
                al avanzar es la destino que se revela; al regresar es la
                actual, que la hoja anterior va tapando al acomodarse. */}
            <div className={PAGE_CLASS}>
              {renderPage(pageIds[anim.dir === "next" ? anim.to : shown])}
            </div>
            {/* hoja que gira sobre el lomo izquierdo. Avanzar: la actual sube y
                se voltea hacia atrás (0→-180). Regresar: la anterior baja desde
                atrás y se acomoda (-180→0) — el movimiento inverso. El key
                fuerza una animación fresca en cada volteo. */}
            <div
              key={`${anim.dir}-${anim.to}`}
              className={cn(
                PAGE_CLASS,
                anim.dir === "next" ? "nb-flip-next" : "nb-flip-prev"
              )}
              style={{
                transformOrigin: "left center",
                backfaceVisibility: "hidden",
              }}
              onAnimationEnd={finish}
            >
              {renderPage(pageIds[anim.dir === "next" ? shown : anim.to])}
            </div>
          </>
        ) : (
          <div className={PAGE_CLASS}>{renderPage(pageIds[shown])}</div>
        )}
      </div>
    );
  }
);

FlipBook.displayName = "FlipBook";
