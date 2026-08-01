import { Bold, Italic, List, Strikethrough, Underline } from "lucide-react";

const BUTTONS = [
  { cmd: "bold", icon: Bold, label: "Negrita (Ctrl+B)" },
  { cmd: "italic", icon: Italic, label: "Cursiva (Ctrl+I)" },
  { cmd: "underline", icon: Underline, label: "Subrayado (Ctrl+U)" },
  { cmd: "strikeThrough", icon: Strikethrough, label: "Tachado (Ctrl+T)" },
  { cmd: "insertUnorderedList", icon: List, label: "Lista (Ctrl+Shift+L)" },
] as const;

/**
 * Formatting bar for the focused note. `onMouseDown preventDefault` keeps the
 * caret in the editor so `execCommand` applies to the current selection.
 */
export function RichToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1">
      {BUTTONS.map(({ cmd, icon: Icon, label }) => (
        <button
          key={cmd}
          type="button"
          title={label}
          aria-label={label}
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand(cmd);
          }}
          className="text-ink/60 hover:bg-black/10 hover:text-ink grid size-6 place-items-center rounded transition"
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
