import { ListingDetailPage } from '@/components/listings/ListingDetailPage';

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  return <ListingDetailPage listingId={id} />;
}
