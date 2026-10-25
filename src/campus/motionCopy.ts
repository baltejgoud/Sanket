import type { Lang } from '../i18n';

/** Short strings for the motion layer: cursor annotations and the contact clock. */
export const motionCopy: Record<Lang, { cursor: { open: string; copy: string; chat: string; write: string }; clock: string }> = {
  en: { cursor: { open: 'Open', copy: 'Copy', chat: 'Chat', write: 'Write' }, clock: 'Local time in India' },
  hi: { cursor: { open: 'खोलें', copy: 'कॉपी करें', chat: 'चैट करें', write: 'ईमेल लिखें' }, clock: 'भारत में अभी का समय' },
  te: { cursor: { open: 'తెరవండి', copy: 'కాపీ చేయండి', chat: 'చాట్ చేయండి', write: 'ఈమెయిల్ రాయండి' }, clock: 'భారతదేశంలో ప్రస్తుత సమయం' },
};
