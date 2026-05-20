import UserProfile from '@/components/user/UserProfile/UserProfile';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: Props) {
  const { id } = await params;
  return <UserProfile userId={id} />;
}
