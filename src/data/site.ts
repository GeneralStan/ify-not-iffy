import { withBase } from '../lib/url';

/** Contact links. */
export const contact = {
  mail: 'mailto:stanleyulasika@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ifeanyiulasika',
  resume: withBase('/resume/ifeanyi-ulasika-resume.pdf'),
};

/**
 * Cal.com booking ("Let’s Chat"). The button opens the Cal.com modal (src/scripts/cal.ts); without
 * JS it is a plain link to the booking page.
 */
export const cal = {
  url: 'https://cal.com/ifeanyi-ulasika-uefzik/virtual-cofee',
  link: 'ifeanyi-ulasika-uefzik/virtual-cofee',
  namespace: 'virtual-cofee',
  config: { layout: 'week_view', useSlotsViewOnSmallScreen: 'true', theme: 'auto' },
};

export type PageId = 'work' | 'playground' | 'about';
