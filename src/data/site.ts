import { withBase } from '../lib/url';

/** Contact links. Placeholders until the real ones are known. */
export const contact = {
  mail: 'mailto:ify@example.com',
  linkedin: 'https://www.linkedin.com/in/placeholder',
  resume: withBase('/resume/ifeanyi-ulasika-resume.pdf'),
};

export type PageId = 'work' | 'playground' | 'about';
