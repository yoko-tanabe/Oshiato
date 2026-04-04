import SpotDetail from '@/components/spot/SpotDetail/SpotDetail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params;

  return <SpotDetail spotId={id} />;
}
