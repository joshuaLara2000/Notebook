import { useState } from "react";
import { ChevronDown, LogOut, Pencil } from "lucide-react";

import { useAuthStore } from "@/platform/auth/store/useAuthStore";
import { updateDisplayName } from "@/platform/auth/services/updateDisplayName.service";
import { logoutUser } from "@/platform/auth/services/logoutUser.service";
import { useBoardStore } from "@/modules/desk/store/useBoardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Elige el saludo según la hora del día.
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Emojis tiernos; se elige uno al azar en cada carga.
const CUTE_EMOJIS = [
  "✨", "🌸", "💜", "🌟", "🍀", "🦋", "🌈", "🧸", "🍡", "🌼", "💫", "🐣", "🌷",
  "⭐️", "🫧", "🌻", "🩷", "🐝",
];
const randomEmoji = () =>
  CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)];

// Barra izquierda: saludo por nombre + menú de cuenta (editar nombre / salir).
export function AccountMenu() {
  const name = useAuthStore((s) => s.user?.name ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  // Emoji fijo por sesión; cambia al recargar/entrar.
  const [emoji] = useState(randomEmoji);

  const openNameDialog = () => {
    setValue(name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await updateDisplayName(value);
    setSaving(false);
    setDialogOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    useBoardStore.getState().reset();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-ink/80 hover:text-ink flex items-center gap-1.5 text-2xl font-bold transition"
          >
            <span>
              {timeGreeting()}
              {name ? `, ${name}` : ""} {emoji}
            </span>
            <ChevronDown className="text-ink/40 size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={openNameDialog}>
            <Pencil className="size-4" /> Editar nombre
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem data-variant="destructive" onSelect={handleLogout}>
            <LogOut className="size-4" /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tu nombre</DialogTitle>
            <DialogDescription>
              Así te saludaremos al entrar a tu libreta.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="display-name">Nombre</Label>
            <Input
              id="display-name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
              }}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving || !value.trim()}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
