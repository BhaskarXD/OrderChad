'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Mail, Phone } from 'lucide-react';

// Order status type
const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;

type OrderStatusType = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  status: OrderStatusType;
  total: number;
  createdAt: string;
  updatedAt: string;
  address: Address;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }[];
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<{[key: string]: boolean}>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isManager = session?.user?.role === 'MANAGER';

  // Redirect if not manager/admin
  if (session && session.user?.role !== 'MANAGER' && session.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdateStatus(prev => ({ ...prev, [orderId]: true }));
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as OrderStatusType }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdateStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
      
      {loading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">No orders found</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      Placed by {order.user.name || order.user.email} on {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Select 
                        defaultValue={order.status} 
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        disabled={updateStatus[order.id]}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrderStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p>${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin only customer details section */}
                {isManager && (
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {expandedOrder === order.id ? 'Hide Customer Details' : 'Show Customer Details'}
                    </Button>
                    
                    {expandedOrder === order.id && (
                      <div className="mt-4 border rounded-md p-4 bg-gray-50">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Customer:</p>
                            <p className="text-sm">{order.user.name || 'N/A'}</p>
                            
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Mail className="h-3 w-3" /> Email:
                            </p>
                            <p className="text-sm">{order.user.email || 'N/A'}</p>
                            
                            <p className="text-sm font-medium">User ID:</p>
                            <p className="text-sm text-gray-600">{order.user.id}</p>
                            
                            <p className="text-sm font-medium">Account Type:</p>
                            <p className="text-sm">{order.user.role}</p>
                          </div>
                          
                          {order.address && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Shipping Address:
                              </p>
                              <p className="text-sm">{order.address.street}</p>
                              <p className="text-sm">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                              <p className="text-sm">{order.address.country}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  View Order Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 