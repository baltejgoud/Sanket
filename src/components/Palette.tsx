import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, CornerDownLeft, LayoutList, Search, Wrench, Zap } from "lucide-react";
import { paletteCopy } from "./paletteCopy";
import { useContactLinks } from "../lib/contact";
import { buildCommands, rankCommands, type Command, type Group } from "../lib/commands";
import type { Lang } from "../i18n";
import "../styles/palette.css";

const GROUPS: Group[] = ["chapters", "tools", "actions"];
const ICONS = { chapters: LayoutList, tools: Wrench, actions: Zap };

/**
 * ⌘K palette. A modal dialog holding an ARIA 1.2 combobox over a grouped listbox: the page behind
 * is inert, arrows move the active option, Enter runs it, Escape closes. `onClose(ran)` tells the
 * opener whether a command ran (then focus belongs to the command's target, not the opener).
 */
export default function Palette({ lang, setLang, explore, onClose }: { lang: Lang; setLang: (l: Lang) => void; explore?: () => void; onClose: (ran: boolean) => void }) {
  const copy = paletteCopy[lang];
  const links = useContactLinks();
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = useId().replace(/:/g, "");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const ran = useRef<Command | null>(null);

  const all = useMemo(() => buildCommands({ copy, lang, setLang, links, explore }), [copy, lang, setLang, links, explore]);
  const results = useMemo(() => rankCommands(all, query), [all, query]);
  // While searching, show the best match first regardless of group; otherwise group the list.
  const grouped = useMemo(
    () => (query.trim() ? [{ group: null as Group | null, items: results }] : GROUPS.map(group => ({ group, items: results.filter(c => c.group === group) }))),
    [results, query],
  );
  const flat = grouped.flatMap(g => g.items);
  const current = flat[Math.min(active, flat.length - 1)];
  const optionId = (c: Command) => `${uid}-${c.id}`;

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (current) document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    ran.current = c;
    dialog.current?.close();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = flat.length;
    if (!n) return;
    if (e.key === "ArrowDown") setActive(i => (i + 1) % n);
    else if (e.key === "ArrowUp") setActive(i => (i - 1 + n) % n);
    else if (e.key === "PageDown") setActive(i => Math.min(n - 1, i + 5));
    else if (e.key === "PageUp") setActive(i => Math.max(0, i - 5));
    else if (e.key === "Enter") run(current);
    else return;
    e.preventDefault();
  };

  return (
    <dialog
      ref={dialog}
      className="palette"
      aria-labelledby={`${uid}-label`}
      onClose={() => {
        const c = ran.current;
        onClose(!!c);
        // Run after the dialog has gone, so the page is no longer inert when it scrolls or focuses.
        if (c) requestAnimationFrame(() => c.run());
      }}
      onClick={e => e.target === dialog.current && dialog.current?.close()}
    >
      <div className="palette-field">
        <Search size={18} aria-hidden="true" />
        <label id={`${uid}-label`} htmlFor={`${uid}-input`} className="sr-only">
          {copy.label}
        </label>
        <input
          id={`${uid}-input`}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={current ? optionId(current) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={copy.placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKey}
        />
        <kbd aria-hidden="true">Esc</kbd>
      </div>
      <div id={`${uid}-list`} role="listbox" aria-label={copy.label} className="palette-list" data-lenis-prevent>
        {grouped.map(({ group, items }) =>
          items.length ? (
            <div key={group ?? "results"} role="group" aria-labelledby={group ? `${uid}-g-${group}` : undefined} aria-label={group ? undefined : copy.label}>
              {group && (
                <p id={`${uid}-g-${group}`} role="presentation" className="palette-group mono">
                  {copy.groups[group]}
                </p>
              )}
              {items.map(c => {
                const Icon = ICONS[c.group];
                const on = c === current;
                return (
                  <div
                    key={c.id}
                    id={optionId(c)}
                    role="option"
                    aria-selected={on}
                    className={`palette-option ${on ? "is-active" : ""}`}
                    onPointerMove={() => !on && setActive(flat.indexOf(c))}
                    onClick={() => run(c)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="palette-label">{c.label}</span>
                    {c.hint && <span className="palette-hint mono">{c.hint}</span>}
                    {on ? <CornerDownLeft size={15} aria-hidden="true" className="palette-enter" /> : <ArrowRight size={15} aria-hidden="true" className="palette-arrow" />}
                  </div>
                );
              })}
            </div>
          ) : null,
        )}
        {!flat.length && <p className="palette-empty">{copy.empty}</p>}
      </div>
      <p className="palette-keys mono" aria-hidden="true">
        {copy.keys}
      </p>
      <p className="sr-only" role="status">
        {query.trim() ? copy.results(flat.length) : ""}
      </p>
    </dialog>
  );
}
