import { languages, type Lang } from "../i18n";
import type { PaletteCopy } from "../components/paletteCopy";
import { scrollToId } from "./motion";
import { prefs } from "./prefs";
import { EMAIL } from "./contact";
import { toast } from "../components/Toast";

export type Group = "chapters" | "tools" | "actions";

export interface Command {
  id: string;
  group: Group;
  label: string;
  /** right-aligned detail: a section number or the current state */
  hint?: string;
  /** English search words, matched in every language */
  keywords: string;
  run: () => void;
}

/* ---------- matching ---------- */

const norm = (s: string) => s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

/** Label start, then a word in the label, then a keyword, then any substring; ties keep the list order. */
export function rankCommands(list: Command[], query: string) {
  const q = norm(query.trim());
  if (!q) return list;
  const wordStart = new RegExp(`(^|[\\s·:/-])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const score = (c: Command) => {
    const label = norm(c.label);
    const keywords = norm(c.keywords);
    if (label.startsWith(q)) return 4;
    if (wordStart.test(label)) return 3;
    if (wordStart.test(keywords)) return 2;
    return label.includes(q) || keywords.includes(q) ? 1 : 0;
  };
  return list
    .map((c, i) => ({ c, i, s: score(c) }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map(r => r.c);
}

/* ---------- the commands ---------- */

/** Scroll to a section, then move focus there (to its heading, or to `focus` inside it) for keyboard users. */
export function goTo(id: string, focus?: string) {
  scrollToId(id);
  const section = document.getElementById(id);
  const target = (focus ? section?.querySelector<HTMLElement>(focus) : section?.querySelector<HTMLElement>("h1, h2, h3")) ?? section;
  if (!target) return;
  if (!focus && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

const CHAPTERS: [string, string, string][] = [
  ["top", "00", "start home hero top stock what sells"],
  ["signal", "01", "signal signals weather trends demand"],
  ["problems", "01·2", "problems cost guessing stockout overstock pain"],
  ["forecast", "02", "forecast how it works steps"],
  ["command", "02·2", "try forecast sandbox demo chart monday"],
  ["decide", "03", "decide decisions order move transfer mark down markdown"],
  ["industries", "04", "industries industry apparel electronics pharma grocery fmcg workspace"],
  ["integrations", "04·2", "integrations connectors tally sap shopify zoho erp"],
  ["roi", "05", "roi proof business case savings return"],
  ["stories", "05·2", "stories failures public examples evidence"],
  ["security", "05·3", "security privacy data trust"],
  ["contact", "06", "contact talk whatsapp email"],
];

export interface CommandContext {
  copy: PaletteCopy;
  lang: Lang;
  setLang: (l: Lang) => void;
  links: { wa: string; mail: string };
  /** present when the stage can be explored (WebGL) */
  explore?: () => void;
}

export function buildCommands({ copy, lang, setLang, links, explore }: CommandContext): Command[] {
  const calm = prefs.get() === "calm";
  const chapters: Command[] = CHAPTERS.map(([id, n, keywords]) => ({
    id: `chapter-${id}`,
    group: "chapters",
    label: copy.chapters[id],
    hint: n,
    keywords,
    run: () => goTo(id),
  }));
  const tools: Command[] = [
    { id: "tool-roi", group: "tools", label: copy.tools.roi, keywords: "roi calculator savings money estimate return", run: () => goTo("roi", ".roi-controls button") },
    { id: "tool-sandbox", group: "tools", label: copy.tools.sandbox, keywords: "sandbox forecast try demo scenario chart", run: () => goTo("command", ".sandbox .seg button") },
    { id: "tool-connectors", group: "tools", label: copy.tools.connectors, keywords: "search integrations connectors tally sap shopify", run: () => goTo("integrations", "input") },
    { id: "tool-stories", group: "tools", label: copy.tools.stories, keywords: "stories failures examples evidence", run: () => goTo("stories") },
    { id: "tool-film", group: "tools", label: copy.tools.film, keywords: "film video watch play", run: () => goTo("command", ".film-play, .film video") },
  ];
  const actions: Command[] = [
    ...languages.map(l => ({
      id: `lang-${l.code}`,
      group: "actions" as const,
      label: l.name,
      hint: l.code === lang ? "✓" : undefined,
      keywords: `language ${{ en: "english", hi: "hindi", te: "telugu" }[l.code]}`,
      run: () => setLang(l.code),
    })),
    {
      id: "motion",
      group: "actions",
      label: calm ? copy.actions.play : copy.actions.pause,
      keywords: "motion animation pause play stop calm reduce accessibility",
      run: () => prefs.setMotion(calm ? "full" : "calm"),
    },
    ...(explore ? [{ id: "explore", group: "actions" as const, label: copy.actions.explore, keywords: "explore 3d warehouse field ar vr place desk spatial", run: explore }] : []),
    {
      id: "whatsapp",
      group: "actions",
      label: copy.actions.whatsapp,
      keywords: "whatsapp chat message contact talk",
      run: () => window.open(links.wa, "_blank", "noopener,noreferrer"),
    },
    { id: "email", group: "actions", label: copy.actions.email, keywords: "email mail contact write", run: () => (location.href = links.mail) },
    {
      id: "copy-email",
      group: "actions",
      label: copy.actions.copy,
      hint: EMAIL,
      keywords: "copy email address clipboard",
      run: () =>
        navigator.clipboard.writeText(EMAIL).then(
          () => toast(copy.actions.copied),
          () => toast(`${copy.actions.copyFail} ${EMAIL}`),
        ),
    },
  ];
  return [...chapters, ...tools, ...actions];
}
