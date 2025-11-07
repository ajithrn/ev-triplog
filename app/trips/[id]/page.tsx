import TripDetailsClient from './TripDetailsClient';

// For static export, we need to generate at least one static path
// The actual routing will be handled client-side
export async function generateStaticParams() {
  // Generate a placeholder path - actual IDs will be handled client-side
  return [{ id: 'placeholder' }];
}

export default function TripDetailsPage() {
  return <TripDetailsClient />;
}
