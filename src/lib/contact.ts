export const EMAIL = "baltej.panagatla@gmail.com";
export const WHATSAPP_NUMBER = "917993969656";
export const WHATSAPP_DISPLAY = "+91 79939 69656";

export const mailLink = `mailto:${EMAIL}?subject=${encodeURIComponent("SANKET enquiry")}&body=${encodeURIComponent(
  "Hi,\n\nI'd like to see how SANKET could work for our business.\n\nCompany:\nWhat we sell:\nBiggest inventory challenge:\n\nThanks",
)}`;

export const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
