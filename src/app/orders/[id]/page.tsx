'use client';

import { useState, useEffect, use, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Truck, ArrowLeft, Package, CheckCircle, Clock, AlertCircle, XCircle, MapPin, CalendarDays, List, Box, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    description: string;
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

interface TrackingEventDetails {
  orderNumber?: string;
  paymentStatus?: string;
  totalAmount?: string;
  warehouse?: string;
  estimatedTime?: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
  deliveryTime?: string;
  signature?: string;
  cancellationDate?: string;
  refundStatus?: string;
}

interface TrackingEvent {
  status: string;
  date: string;
  description: string;
  active: boolean;
  icon: ReactNode;
  details?: Partial<TrackingEventDetails>;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'tracking' | 'items'>('summary');
  const { id: orderId } = use(params);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab === 'tracking' || tab === 'summary' || tab === 'items') {
      setActiveTab(tab);
    }
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusPercentage = (status: string) => {
    switch (status) {
      case 'PENDING': return 25;
      case 'PROCESSING': return 50;
      case 'SHIPPED': return 75;
      case 'DELIVERED': return 100;
      case 'CANCELLED': return 0;
      default: return 0;
    }
  };

  const getEstimatedDeliveryDate = (order: Order) => {
    if (order.status === 'SHIPPED') {
      // Estimate 3 days from shipment date
      return new Date(new Date(order.updatedAt).setDate(new Date(order.updatedAt).getDate() + 3));
    } else if (order.status === 'DELIVERED') {
      return new Date(order.updatedAt);
    } else {
      // Estimate 5-7 days from order placement
      const minDate = new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5));
      const maxDate = new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 7));
      return { minDate, maxDate };
    }
  };

  // Helper function to safely format delivery date based on order status
  const formatDeliveryDate = (order: Order) => {
    const estimatedDelivery = getEstimatedDeliveryDate(order);
    
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return (estimatedDelivery as Date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      const { minDate, maxDate } = estimatedDelivery as { minDate: Date, maxDate: Date };
      return `${minDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-5 w-5" />;
      case 'PROCESSING': return <Package className="h-5 w-5" />;
      case 'SHIPPED': return <Truck className="h-5 w-5" />;
      case 'DELIVERED': return <CheckCircle className="h-5 w-5" />;
      case 'CANCELLED': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getTrackingEvents = (order: Order): TrackingEvent[] => {
    const events: TrackingEvent[] = [
      {
        status: 'Order Placed',
        date: order.createdAt,
        description: 'Your order has been received and payment confirmed.',
        active: true,
        icon: <ShoppingBag className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`
        } as TrackingEventDetails
      }
    ];

    // Conditionally add processing event
    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        status: 'Processing',
        date: new Date(new Date(order.createdAt).getTime() + 12 * 60 * 60 * 1000).toISOString(),
        description: 'Your order is being prepared and packaged for shipping.',
        active: true,
        icon: <Package className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          warehouse: 'Main Distribution Center',
          estimatedTime: '1-2 business days'
        } as TrackingEventDetails
      });
    } else {
      events.push({
        status: 'Processing',
        date: '',
        description: 'Your order will be prepared and packaged for shipping.',
        active: false,
        icon: <Package className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          warehouse: 'Main Distribution Center',
          estimatedTime: '1-2 business days'
        } as TrackingEventDetails
      });
    }

    // Conditionally add shipped event
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        status: 'Shipped',
        date: order.status === 'SHIPPED' ? order.updatedAt : new Date(new Date(order.updatedAt).getTime() - 36 * 60 * 60 * 1000).toISOString(),
        description: 'Your order has been shipped and is on its way to you.',
        active: true,
        icon: <Truck className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          carrier: 'Standard Shipping',
          trackingNumber: `TRK${order.id.slice(-6).toUpperCase()}`,
          estimatedDelivery: formatDeliveryDate(order)
        } as TrackingEventDetails
      });
    } else {
      events.push({
        status: 'Shipped',
        date: '',
        description: 'Your order will be shipped once processing is complete.',
        active: false,
        icon: <Truck className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          carrier: 'Standard Shipping',
          estimatedDelivery: formatDeliveryDate(order)
        } as TrackingEventDetails
      });
    }

    // Conditionally add delivered event
    if (order.status === 'DELIVERED') {
      events.push({
        status: 'Delivered',
        date: order.updatedAt,
        description: 'Your order has been delivered to the destination address.',
        active: true,
        icon: <CheckCircle className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          deliveryAddress: `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.postalCode}`,
          deliveryTime: formatDate(order.updatedAt),
          signature: 'Not required'
        } as TrackingEventDetails
      });
    } else if (order.status === 'CANCELLED') {
      events.push({
        status: 'Cancelled',
        date: order.updatedAt,
        description: 'Your order has been cancelled and will not be processed.',
        active: true,
        icon: <XCircle className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          cancellationDate: formatDate(order.updatedAt),
          refundStatus: 'Processing'
        } as TrackingEventDetails
      });
    } else {
      events.push({
        status: 'Delivery',
        date: '',
        description: 'Expected delivery: ' + formatDeliveryDate(order),
        active: false,
        icon: <CheckCircle className="h-5 w-5" />,
        details: {
          orderNumber: order.id.slice(-8),
          paymentStatus: 'Confirmed',
          totalAmount: `$${order.total.toFixed(2)}`,
          estimatedDelivery: formatDeliveryDate(order),
          deliveryAddress: `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.postalCode}`
        } as TrackingEventDetails
      });
    }

    return events;
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
        <div className="mb-8">
          <button 
            onClick={() => router.push('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id.slice(-8)}
            </h1>
            <span 
              className={`text-sm py-1 px-3 rounded-full ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('summary')}
          >
            <span className="flex items-center gap-1">
              <List className="h-4 w-4" /> Summary
            </span>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'tracking' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tracking')}
          >
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4" /> Tracking
            </span>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'items' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('items')}
          >
            <span className="flex items-center gap-1">
              <Box className="h-4 w-4" /> Items
            </span>
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between pb-4 border-b">
                      <h3 className="font-medium">Order Status</h3>
                      <span className={`py-1 px-3 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex justify-between pb-4 border-b">
                      <h3 className="font-medium">Order Date</h3>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b">
                      <h3 className="font-medium">Total Items</h3>
                      <span>{order.items.length} items</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b">
                      <h3 className="font-medium">Total Amount</h3>
                      <span className="font-bold">${order.total.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b">
                      <h3 className="font-medium">Shipping Address</h3>
                      <div className="text-right">
                        <p>{order.address.street}</p>
                        <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                        <p>{order.address.country}</p>
                      </div>
                    </div>

                    {order.status !== 'CANCELLED' && (
                      <div className="flex justify-between">
                        <h3 className="font-medium">Estimated Delivery</h3>
                        <div className="text-right">
                          {order.status === 'DELIVERED' ? (
                            <p>Delivered on {formatDate(order.updatedAt)}</p>
                          ) : order.status === 'SHIPPED' ? (
                            <p>Expected by {formatDeliveryDate(order)}</p>
                          ) : (
                            <p>
                              {formatDeliveryDate(order)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tracking Summary */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${order.status === 'CANCELLED' ? 'bg-red-600' : 'bg-blue-600'}`} 
                        style={{ width: `${getStatusPercentage(order.status)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {order.status === 'PENDING' && 'Order Received'}
                        {order.status === 'PROCESSING' && 'Order Being Prepared'}
                        {order.status === 'SHIPPED' && 'Order In Transit'}
                        {order.status === 'DELIVERED' && 'Order Delivered'}
                        {order.status === 'CANCELLED' && 'Order Cancelled'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('tracking')}
                      className="w-full mt-4 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm flex items-center justify-center gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      View Detailed Tracking
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div>
            {/* Status Overview Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Shipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${order.status === 'CANCELLED' ? 'bg-red-600' : 'bg-blue-600'}`} 
                      style={{ width: `${getStatusPercentage(order.status)}%` }}
                    ></div>
                  </div>
                  
                  {/* Status Labels */}
                  <div className="grid grid-cols-4 text-center text-xs">
                    <div className={order.status !== 'CANCELLED' ? 'text-blue-600 font-medium' : 'text-gray-400'}>Order Placed</div>
                    <div className={order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'text-blue-600 font-medium' : 'text-gray-400'}>Processing</div>
                    <div className={order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'text-blue-600 font-medium' : 'text-gray-400'}>Shipped</div>
                    <div className={order.status === 'DELIVERED' ? 'text-blue-600 font-medium' : 'text-gray-400'}>Delivered</div>
                  </div>
                  
                  {/* Current Status Box */}
                  <div className={`p-4 rounded-lg mt-4 ${
                    order.status === 'CANCELLED' 
                      ? 'bg-red-50 text-red-800' 
                      : order.status === 'DELIVERED' 
                        ? 'bg-green-50 text-green-800'
                        : 'bg-blue-50 text-blue-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      {order.status === 'CANCELLED' ? (
                        <XCircle className="h-6 w-6 mt-1" />
                      ) : order.status === 'DELIVERED' ? (
                        <CheckCircle className="h-6 w-6 mt-1" />
                      ) : order.status === 'SHIPPED' ? (
                        <Truck className="h-6 w-6 mt-1" />
                      ) : (
                        <Package className="h-6 w-6 mt-1" />
                      )}
                      
                      <div>
                        <h3 className="font-bold">
                          {order.status === 'PENDING' && 'Order Received'}
                          {order.status === 'PROCESSING' && 'Order Being Prepared'}
                          {order.status === 'SHIPPED' && 'Order In Transit'}
                          {order.status === 'DELIVERED' && 'Order Delivered'}
                          {order.status === 'CANCELLED' && 'Order Cancelled'}
                        </h3>
                        <p>
                          {order.status === 'PENDING' && 'Your order has been received and is awaiting processing.'}
                          {order.status === 'PROCESSING' && 'Your order is being prepared and packaged for shipping.'}
                          {order.status === 'SHIPPED' && 'Your order is on its way to the delivery address.'}
                          {order.status === 'DELIVERED' && 'Your order has been delivered to the destination address.'}
                          {order.status === 'CANCELLED' && 'Your order has been cancelled and will not be processed.'}
                        </p>
                        
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                          <div className="mt-2 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <p className="text-sm">
                              {order.status === 'SHIPPED' ? (
                                <>Expected delivery: {formatDeliveryDate(order)}</>
                              ) : (
                                <>Estimated delivery: {formatDeliveryDate(order)}</>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {order.status === 'DELIVERED' && (
                          <div className="mt-2 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <p className="text-sm">Delivered on: {formatDate(order.updatedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed Tracking Timeline */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {getTrackingEvents(order).map((event, index, array) => (
                    <div key={event.status} className="relative flex items-start">
                      {/* Vertical line connecting timeline items */}
                      {index < array.length - 1 && (
                        <div className="absolute top-7 left-4 w-0.5 h-full -ml-px bg-gray-200"></div>
                      )}
                      
                      {/* Status icon */}
                      <div className={`relative z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                        event.active 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {event.icon}
                      </div>
                      
                      {/* Event details */}
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${event.active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {event.status}
                          </p>
                          {event.date && (
                            <p className="text-xs text-gray-500">
                              {formatDate(event.date)}
                            </p>
                          )}
                        </div>
                        <p className={`mt-1 text-sm ${event.active ? 'text-gray-600' : 'text-gray-400'}`}>
                          {event.description}
                        </p>
                        
                        {/* Add additional status-specific details */}
                        {event.status === 'Shipped' && event.active && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-xs font-medium text-gray-500">Shipping Details</p>
                            <div className="mt-1 flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-600">Standard Shipping</p>
                            </div>
                            {order.status === 'SHIPPED' && (
                              <div className="mt-2 flex items-center space-x-2">
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  Expected delivery: {formatDeliveryDate(order)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {event.status === 'Delivered' && event.active && (
                          <div className="mt-2 p-3 bg-green-50 rounded-md">
                            <p className="text-xs font-medium text-green-800">Delivery Confirmation</p>
                            <div className="mt-1 flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <p className="text-sm text-green-700">Delivered to: {order.address.street}, {order.address.city}</p>
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <CalendarDays className="h-4 w-4 text-green-600" />
                              <p className="text-sm text-green-700">
                                Delivered on: {formatDate(order.updatedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {event.status === 'Cancelled' && event.active && (
                          <div className="mt-2 p-3 bg-red-50 rounded-md">
                            <p className="text-xs font-medium text-red-800">Cancellation Details</p>
                            <div className="mt-1 flex items-center space-x-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <p className="text-sm text-red-700">
                                Order cancelled on: {formatDate(order.updatedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Shipping Address */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                  <p>{order.address.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-20 h-20 flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {item.product.description}
                      </p>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/orders')}
          >
            Back to Orders
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
} 