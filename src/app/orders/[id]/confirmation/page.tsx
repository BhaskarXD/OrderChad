'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Check, Truck, Package, CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address;
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = params?.id;

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mt-2">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Order #{order.id.slice(-8)}</span>
              <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                {order.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Order Date:</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Total Amount:</p>
              <p className="font-medium">${order.total.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Order Items */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Address */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{order.address.street}</p>
                  <p>
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p>{order.address.country}</p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-col gap-2">
              <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-blue-700">
                    {new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })} - {new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              
              {/* Order Tracking Timeline */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Order Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="rounded-full p-1 bg-green-100 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="w-px h-6 bg-gray-200 mt-1"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`rounded-full p-1 ${
                          order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                            <Package className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="w-px h-6 bg-gray-200 mt-1"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Processing</p>
                        <p className="text-xs text-gray-500">
                          {order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' 
                            ? 'Your order is being prepared'
                            : 'Pending'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`rounded-full p-1 ${
                          order.status === 'SHIPPED' || order.status === 'DELIVERED' 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                            <Truck className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="w-px h-6 bg-gray-200 mt-1"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Shipped</p>
                        <p className="text-xs text-gray-500">
                          {order.status === 'SHIPPED' 
                            ? `Shipped on ${formatDate(order.updatedAt)}`
                            : order.status === 'DELIVERED'
                              ? 'Shipped'
                              : 'Pending'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`rounded-full p-1 ${
                          order.status === 'DELIVERED' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {order.status === 'DELIVERED' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-gray-500">
                          {order.status === 'DELIVERED' 
                            ? `Delivered on ${formatDate(order.updatedAt)}`
                            : 'Pending'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push('/orders')}>
            View All Orders
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
} 