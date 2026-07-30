'use client';

import dynamic from 'next/dynamic';

const HeroEditor = dynamic(() => import('@/app/components/HeroEditor'), { ssr: false });

export default function EditPage() {
  return <HeroEditor />;
}
