import { useState } from "react";
import { Pencil } from "lucide-react";

import { useAuthStore } from "@/platform/auth/store/useAuthStore";
import { updateDisplayName } from "@/platform/auth/services/updateDisplayName.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Elige el saludo según la hora del día.
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Saluda al usuario por su nombre; clic para editarlo en un diálogo.
export function Greeting() {
  const name = useAuthStore((s) => s.user?.name ?? "");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) setValue(name); // precarga el nombre actual al abrir
    setOpen(next);
  };

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await updateDisplayName(value);
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Editar tu nombre"
          className="group text-ink/80 pointer-events-auto flex items-center gap-2 text-3xl font-bold"
        >
          <span>
            {timeGreeting()}
            {name ? `, ${name}` : ""}
          </span>
          <Pencil className="text-ink/40 size-4 opacity-0 transition group-hover:opacity-100" />
        </button>
      </DialogTrigger>

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
  );
}
