import { languages, type Lang } from "../i18n";
import type { PaletteCopy } from "../components/paletteCopy";
import { focusSection, scrollToId } from "./kinetic";
import { prefs } from "./prefs";
import { EMAIL } from "./contact";
import { toast } from "../components/Toast";
import { storyCopy } from "../campus/storyCopy";

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

/** Scroll to a section, then move focus to its heading for keyboard users. */
export function goTo(id: string) {
  scrollToId(id);
  focusSection(id);
}

/** Opens a tool dialog: 0 forecast, 1 business case, 2 connections. */
const openTool = (tool: number) => window.dispatchEvent(new CustomEvent("sanket:tool", { detail: tool }));

/** The story's six chapters in page order, numbered as their eyebrows are. */
const CHAPTERS: [id: string, keywords: string][] = [
  ["signal", "start home hero top idea stock what sells"],
  ["warehouse", "warehouse shelves stock inventory racks"],
  ["problems", "problems cost guessing stockout overstock pain"],
  ["forecast", "forecast what we do solution plan order transfer markdown"],
  ["decide", "how it works decide decisions approve move dispatch"],
  ["contact", "contact talk whatsapp email faq"],
];

export interface CommandContext {
  copy: PaletteCopy;
  lang: Lang;
  setLang: (l: Lang) => void;
  links: { wa: string; mail: string };
}

export function buildCommands({ copy, lang, setLang, links }: CommandContext): Command[] {
  const calm = prefs.get() === "calm";
  const story = storyCopy[lang];
  const chapters: Command[] = CHAPTERS.map(([id, keywords], i) => ({ id: `chapter-${id}`, group: "chapters", label: story.chapters[i], hint: `0${i + 1}`, keywords, run: () => goTo(id) }));
  const tools: Command[] = [
    { id: "tool-sandbox", group: "tools", label: story.tools[0], keywords: "sandbox forecast try demo scenario chart", run: () => openTool(0) },
    { id: "tool-roi", group: "tools", label: story.tools[1], keywords: "roi calculator savings money estimate return business case", run: () => openTool(1) },
    { id: "tool-connectors", group: "tools", label: story.tools[2], keywords: "search integrations connectors tally sap shopify industries", run: () => openTool(2) },
    { id: "tool-stories", group: "tools", label: copy.tools.stories, keywords: "stories failures examples evidence", run: () => openTool(1) },
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
