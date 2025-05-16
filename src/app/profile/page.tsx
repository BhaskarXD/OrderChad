'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-4">
          {session.user?.image && (
            <div className="flex items-center gap-4">
              <img
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="font-semibold">Name:</div>
            <div>{session.user?.name || 'Not provided'}</div>
            
            <div className="font-semibold">Email:</div>
            <div>{session.user?.email}</div>
            
            <div className="font-semibold">Role:</div>
            <div className="capitalize">{session.user?.role?.toLowerCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 