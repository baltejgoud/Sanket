import { Mail } from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";
import { mailLinkFor, whatsappLink } from "../lib/contact";
import { track } from "../lib/analytics";
import { useToolCopy } from "./toolCopy";

/**
 * "Send me this scenario": opens the visitor's own email or WhatsApp with the scenario they built
 * already written out. Nothing is sent from the page; they review and send it themselves.
 */
export function ScenarioShare({ tool, line }: { tool: "forecast" | "business_case"; line: string }) {
  const s = useToolCopy().share;
  const body = `${s.ask}\n• ${line}`;
  const sent = (channel: string) => () => track("contact_click", { channel, from: tool });
  return (
    <div className="scenario-share">
      <span>{s.title}</span>
      <a href={mailLinkFor(`Hi,\n\n${body}\n\nCompany:\nWhat we sell:\n\nThanks`)} onClick={sent("email")}>
        <Mail size={16} aria-hidden="true" />
        {s.email}
      </a>
      <a href={whatsappLink(`Hi SANKET, ${body}`)} target="_blank" rel="noreferrer" onClick={sent("whatsapp")}>
        <WhatsAppIcon size={16} />
        {s.whatsapp}
      </a>
    </div>
  );
}
