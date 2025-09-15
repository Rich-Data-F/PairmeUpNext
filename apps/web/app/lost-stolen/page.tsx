import { LostStolenPage } from '@/components/lost-found/LostStolenPage';

export default function LostStolen() {
  return <LostStolenPage />;
}

export function generateMetadata() {
  return {
    title: 'Lost & Found Registry - EarbudHub',
    description: 'Report lost or stolen earbuds and help recover them through our secure registry.',
  };
}
