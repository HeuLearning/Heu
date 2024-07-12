import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error(error);
      return;
    }

    if (!user) {
      router.push('/api/auth/login');
    }
  }, [user, isLoading, error, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {/* Rest of your component */}
    </div>
  );
}