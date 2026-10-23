import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "../i18n";
import { explore } from "../lib/paletteBus";
import { useField } from "../field/bridge";

const Explore = lazy(() => import("./Explore"));

/**
 * Opens explore mode on request (hero, dock, palette) while the field runs, and returns focus to
 * whatever opened it. Its own component, so the field booting re-renders this, not the page.
 */
export function ExploreHost({ lang }: { lang: Lang }) {
  const field = useField();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(
    () =>
      explore.onOpen(() => {
        opener.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }),
    [],
  );
  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }, []);
  return <Suspense fallback={null}>{open && field && <Explore lang={lang} onClose={close} />}</Suspense>;
}
