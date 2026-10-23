import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useCopy } from "../copy";
import { useContactLinks } from "../lib/contact";
import { useMedia } from "../lib/motion";
import { palette } from "../lib/paletteBus";
import { WhatsAppIcon } from "./Icons";

/**
 * Phones: once the hero's buttons have scrolled away, the next step stays one tap away.
 * Hidden again at Contact, where the full options are on screen.
 */
export function Dock() {
  const phone = useMedia("(max-width: 699px)");
  const c = useCopy();
  const links = useContactLinks();
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    if (!phone) return;
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    if (!hero || !contact) return;
    // The hero counts as on screen while it fills more than the top 40% of the viewport.
    const a = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), { rootMargin: "-40% 0px 0px 0px" });
    const b = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { rootMargin: "0px 0px -15% 0px" });
    a.observe(hero);
    b.observe(contact);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, [phone]);

  if (!phone) return null;
  const shown = pastHero && !atContact;
  return (
    <nav className={`dock ${shown ? "" : "is-hidden"}`} aria-label={c.nav.dock} aria-hidden={!shown} {...(shown ? {} : { inert: "" })}>
      <a className="dock-talk" href={links.wa} target="_blank" rel="noreferrer">
        <WhatsAppIcon size={18} />
        {c.nav.talk}
      </a>
      <button className="dock-jump" onClick={() => palette.open()}>
        <Search size={18} aria-hidden="true" />
        <span>{c.nav.jump}</span>
      </button>
    </nav>
  );
}
