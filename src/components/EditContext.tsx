import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE = "portfolio-edits";

// Editing is enabled on all environments including the live site
const EDITABLE = true;

type Edits = Record<string, string>;

interface EditContextType {
  editing: boolean;
  edits: Edits;
  setEdit: (id: string, value: string) => void;
  toggleEdit: () => void;
}

const EditContext = createContext<EditContextType | null>(null);

export function EditProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<Edits>(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      return raw ? (JSON.parse(raw) as Edits) : {};
    } catch {
      return {};
    }
  });

  function setEdit(id: string, value: string) {
    setEdits((current) => {
      const next = { ...current, [id]: value };
      try {
        localStorage.setItem(STORAGE, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <EditContext.Provider
      value={{
        editing,
        edits,
        setEdit,
        toggleEdit: () => setEditing((c) => !c),
      }}
    >
      {children}
      {EDITABLE && (
        <button
          type="button"
          className={editing ? "edit-toggle is-on" : "edit-toggle"}
          aria-pressed={editing}
          onClick={() => setEditing((c) => !c)}
        >
          {editing ? "Done" : "Edit"}
        </button>
      )}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error("useEdit must be used within EditProvider");
  return ctx;
}

export function Editable({
  id,
  as: Tag = "p",
  className,
  text,
  children,
}: {
  id: string;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "dd" | "dt" | "li" | "div";
  className?: string;
  text?: string;
  children?: ReactNode;
}) {
  const { editing, edits, setEdit } = useEdit();
  const value = edits[id] ?? text ?? "";
  const defaultChildren = children ?? value;

  if (!editing) {
    return <Tag className={className}>{defaultChildren}</Tag>;
  }

  return (
    <Tag
      className={className ? `${className} is-editing` : "is-editing"}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      defaultValue={value}
      onInput={(event) => {
        setEdit(id, event.currentTarget.textContent ?? "");
      }}
    />
  );
}