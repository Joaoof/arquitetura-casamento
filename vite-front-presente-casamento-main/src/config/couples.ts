export type CoupleConfig = {
  slug: string;
  names: string;
  weddingDateLabel: string;
  weddingDateISO: string;
  cityLabel: string;
};

export const DEFAULT_COUPLE_SLUG = 'luis-natiele';

const COUPLES: Record<string, CoupleConfig> = {
  [DEFAULT_COUPLE_SLUG]: {
    slug: DEFAULT_COUPLE_SLUG,
    names: 'Luís & Natiele',
    weddingDateLabel: '25 de Julho de 2026',
    weddingDateISO: '2026-07-25T18:00:00',
    cityLabel: 'Araguaína, TO',
  },
};

export const getCoupleConfig = (slug?: string): CoupleConfig => {
  if (!slug) return COUPLES[DEFAULT_COUPLE_SLUG];

  return COUPLES[slug] ?? {
    ...COUPLES[DEFAULT_COUPLE_SLUG],
    slug,
  };
};

export const normalizeCoupleSlug = (slug?: string): string => {
  if (!slug?.trim()) return DEFAULT_COUPLE_SLUG;
  return slug.toLowerCase();
};
