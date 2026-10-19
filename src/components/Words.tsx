import { Fragment, type ElementType, type ReactNode } from "react";
import { useReveal } from "../lib/motion";

/**
 * Splits text into masked words for the reveal system. Words, not letters,
 * so Devanagari and Telugu conjuncts are never broken apart.
 */
export function Words({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={`words ${className ?? ""}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word" aria-hidden="true">
            <span style={{ ["--i" as string]: start + i }}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** A heading whose words rise from masks when its chapter enters. */
export function RevealHeading({
  as: Tag = "h2",
  lines,
  className,
  id,
  accentLine,
}: {
  as?: ElementType;
  lines: string[];
  className?: string;
  id?: string;
  accentLine?: number;
}) {
  const ref = useReveal<HTMLElement>(0.2);
  let count = 0;
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, n) => {
        const node: ReactNode = (
          <span key={n} className={`line ${n === accentLine ? "accent-line" : ""}`}>
            <Words text={line} start={count} />
          </span>
        );
        count += line.split(/\s+/).length;
        return node;
      })}
    </Tag>
  );
}
