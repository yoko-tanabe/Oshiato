import OshiSpotList from '@/components/oshi/OshiSpotList/OshiSpotList';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <OshiSpotList oshiId={id} />;
}
