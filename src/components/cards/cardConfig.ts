export const CARD_WIDTH_MM = 85.6
export const CARD_HEIGHT_MM = 53.98

export type CardVariant = 'clients' | 'employees'

export const CARD_VARIANTS: Record<
  CardVariant,
  { backgroundSrc: string; logoSizeMm: number }
> = {
  clients: {
    backgroundSrc: '/images/front.jpg',
    logoSizeMm: 4
  },
  employees: {
    backgroundSrc: '/images/front.png',
    logoSizeMm: 6
  }
}
