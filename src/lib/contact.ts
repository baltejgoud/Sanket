import { useT } from "../i18n";
import { useCopy } from "../copy";
import { contextLines, useVisit, type VisitItem } from "./visit";

export const EMAIL = "baltej.panagatla@gmail.com";
export const WHATSAPP_NUMBER = "917993969656";
export const WHATSAPP_DISPLAY = "+91 79939 69656";

const MAIL_INTRO = "Hi,\n\nI'd like to see how SANKET could work for our business.";
const MAIL_FORM = "Company:\nWhat we sell:\nBiggest inventory challenge:\n\nThanks";

export const mailLinkFor = (body: string) => `mailto:${EMAIL}?subject=${encodeURIComponent("SANKET enquiry")}&body=${encodeURIComponent(body)}`;

export const mailLink = mailLinkFor(`${MAIL_INTRO}\n\n${MAIL_FORM}`);

export const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/** WhatsApp and email links whose messages mention what the visitor explored (see visit.ts). */
export function contactLinks(waMessage: string, lead: string, items: VisitItem[]) {
  const ctx = items.length ? `${lead}\n${contextLines(items)}` : "";
  return {
    wa: whatsappLink(ctx ? `${waMessage}\n\n${ctx}` : waMessage),
    mail: mailLinkFor(ctx ? `${MAIL_INTRO}\n\n${ctx}\n\n${MAIL_FORM}` : `${MAIL_INTRO}\n\n${MAIL_FORM}`),
  };
}

export function useContactLinks() {
  const t = useT();
  const c = useCopy();
  return contactLinks(t.cta.waMessage, c.contact.lead, useVisit());
}
