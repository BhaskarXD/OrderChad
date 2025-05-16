'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import GoogleButton from '@/components/auth/GoogleButton';
import { ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role || 'CUSTOMER';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              OrderChad
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md" />
            ) : session ? (
              <div className="flex items-center gap-4">
                <Link href="/cart" className="text-gray-600 hover:text-gray-900">
                  <ShoppingCart size={20} />
                </Link>
                {(userRole === 'CUSTOMER') && <Button variant="outline" size="sm" asChild>
                  <Link href="/orders">Orders</Link>
                </Button>}
                
                {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/products/create">Add Product</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/orders/manage">Manage Orders</Link>
                    </Button>
                  </div>
                )}
                
                <Link 
                  href="/profile"
                  className="text-sm text-gray-600 hover:text-gray-900 flex flex-col items-end"
                >
                  <span className="font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userRole}
                  </span>
                </Link>
                
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 