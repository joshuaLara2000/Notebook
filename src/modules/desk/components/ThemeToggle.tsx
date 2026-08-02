import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MOD_LABEL, useHotkeys } from "@/shared/hooks/useHotkeys";
import { useThemeStore } from "@/shared/theme/useThemeStore";

/** Alterna entre modo claro y oscuro (kawaii nocturno). */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === "dark";

  // Atajo: alternar tema (funciona incluso escribiendo).
  useHotkeys([
    { combo: "mod+shift+d", handler: toggle, allowInInput: true },
  ]);

  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-full"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={`${isDark ? "Modo claro" : "Modo oscuro"} (${MOD_LABEL}⇧D)`}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
