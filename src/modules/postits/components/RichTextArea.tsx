import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RichTextAreaProps {
  html: string;
  onChange: (html: string) => void;
  onEditingChange?: (editing: boolean) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A small rich-text editor built on `contentEditable`. It is *uncontrolled*
 * on purpose: the DOM is the source of truth while typing, and we only push
 * HTML out on input. Re-binding innerHTML on every render (as a controlled
 * component would) moves the caret to the start after each keystroke.
 * External `html` changes are synced only while the editor is not focused.
 */
export function RichTextArea({
  html,
  onChange,
  onEditingChange,
  placeholder,
  className,
}: RichTextAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(
    () => html.replace(/<[^>]*>/g, "").trim().length === 0
  );

  // Set initial content once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.innerHTML = html;
      setEmpty((el.textContent || "").trim().length === 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external changes (e.g. restore) only when not actively editing.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerHTML !== html) {
      el.innerHTML = html;
      setEmpty((el.textContent || "").trim().length === 0);
    }
  }, [html]);

  function handleInput() {
    const el = ref.current;
    if (!el) return;
    setEmpty((el.textContent || "").trim().length === 0);
    onChange(el.innerHTML);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();
    // b / i / u are handled natively by contentEditable
    if (k === "t") {
      e.preventDefault();
      document.execCommand("strikeThrough");
    } else if (k === "l" && e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertUnorderedList");
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label="Contenido de la nota"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => onEditingChange?.(true)}
        onBlur={() => onEditingChange?.(false)}
        className="rich-note h-full w-full overflow-y-auto px-3 pb-2 outline-none"
      />
      {empty && placeholder && (
        <span className="text-ink/30 pointer-events-none absolute left-3 top-0 select-none">
          {placeholder}
        </span>
      )}
    </div>
  );
}
