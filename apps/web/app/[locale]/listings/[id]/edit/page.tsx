import { EditListingForm } from '@/components/listings/EditListingForm';

interface EditListingPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <EditListingForm listingId={id} />
    </div>
  );
}

export function generateMetadata() {
  return {
    title: 'Edit Listing - PairAgain',
    description: 'Update your listing or lost & found report on PairAgain.',
  };
}
