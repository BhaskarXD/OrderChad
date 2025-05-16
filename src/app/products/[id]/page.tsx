'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Loader2, Edit, Trash2, AlertCircle, ShoppingBag, Star, StarHalf } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddReviewForm } from "@/components/AddReviewForm";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  stock: number;
  category: string;
  reviews: Review[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const productId = params?.id;

  // Check if user is manager or admin
  const isManager = session?.user?.role === 'MANAGER' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(data);
      
      // Check if user has purchased the product
      if (session?.user?.role === 'CUSTOMER') {
        const purchaseResponse = await fetch(`/api/orders/check-purchase?productId=${id}`);
        if (purchaseResponse.ok) {
          const { hasPurchased } = await purchaseResponse.json();
          setHasPurchased(hasPurchased);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
      setCheckingPurchase(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      toast.success('Added to cart');
      router.refresh();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleEdit = () => {
    if (productId) {
      router.push(`/products/edit/${productId}`);
    }
  };

  const handleDelete = async () => {
    if (!product || !productId) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      toast.success('Product deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative w-full shadow rounded-lg overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="w-full bg-gray-100 flex flex-col items-center justify-center py-8">
                <ShoppingBag size={64} className="text-gray-400 mb-2" />
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{product.category}</p>
                
                {/* Average Rating */}
                {product.reviews.length > 0 && (
                  <div className="mt-2 flex items-center">
                    {(() => {
                      const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
                      const fullStars = Math.floor(avgRating);
                      const hasHalfStar = avgRating - fullStars >= 0.5;
                      
                      return (
                        <>
                          <div className="flex text-yellow-400">
                            {[...Array(fullStars)].map((_, i) => (
                              <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
                            ))}
                            
                            {hasHalfStar && (
                              <StarHalf className="h-5 w-5 fill-current" />
                            )}
                            
                            {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                              <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {avgRating.toFixed(1)} ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              {isManager && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEdit}
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </div>
              )}
            </div>

            <p className="text-2xl font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-gray-600">{product.description}</p>

            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="flex-1"
              >
                {addingToCart ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              {product.stock > 0
                ? `${product.stock} items in stock`
                : 'Currently out of stock'}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            {isManager && (
              <p className="text-sm text-gray-500">
                {product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'} in total
              </p>
            )}
          </div>

          {/* Add review form for authenticated customers */}
          {session && session.user.role === 'CUSTOMER' && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>
                  {hasPurchased 
                    ? 'Share your experience with this product'
                    : 'You must purchase and receive this product before leaving a review'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasPurchased ? (
                  <AddReviewForm productId={product.id} onReviewAdded={() => fetchProduct(product.id)} />
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <p>You need to purchase and receive this product before you can leave a review.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {product.reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet</p>
          ) : (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {review.user.image && (
                        <img
                          src={review.user.image}
                          alt={review.user.name || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <CardTitle>{review.user.name || 'Anonymous'}</CardTitle>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-gray-600">{review.comment}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}