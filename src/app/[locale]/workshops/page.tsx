import React from 'react';
import { getLocale } from 'next-intl/server';
import { CatalogPage, type CatalogCard } from '@/components/pages/catalog-page';

const WORKSHOP_CARDS: CatalogCard[] = [
  {
    id: 'ws-1',
    title: 'Leadership In Tech Teams',
    kind: 'Workshop',
    category: 'LEADERSHIP',
    enrolled: '1.4k',
    rating: '4.8',
    instructor: 'James Sara',
    schedule: 'Nov 04',
    price: '1600 EGP',
    href: '/en/programs',
  },
  {
    id: 'ws-2',
    title: 'Strategic Marketing Sprint',
    kind: 'Workshop',
    category: 'MARKETING',
    enrolled: '2.1k',
    rating: '4.7',
    instructor: 'Nadine Adel',
    schedule: 'Nov 12',
    price: '1400 EGP',
    href: '/en/programs',
  },
  {
    id: 'ws-3',
    title: 'Finance for Product Managers',
    kind: 'Workshop',
    category: 'FINANCE',
    enrolled: '1.1k',
    rating: '4.6',
    instructor: 'Yasser Omar',
    schedule: 'Nov 19',
    price: '1300 EGP',
    href: '/en/programs',
  },
  {
    id: 'ws-4',
    title: 'Consultative B2B Sales',
    kind: 'Workshop',
    category: 'SALES',
    enrolled: '980',
    rating: '4.9',
    instructor: 'Maha Kamal',
    schedule: 'Nov 27',
    price: '1500 EGP',
    href: '/en/programs',
  },
];

export default async function WorkshopsPage() {
  const locale = await getLocale();
  const cards = WORKSHOP_CARDS.map((item) => ({ ...item, href: `/${locale}/programs` }));

  return (
    <CatalogPage
      locale={locale}
      eyebrow="Hands-on Workshops"
      title="Live Workshops For Fast Skill Growth"
      subtitle="Short, intensive, instructor-led sessions focused on practical execution for teams and professionals."
      cards={cards}
    />
  );
}
