'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Prisma } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShoppingCart, Package, Users, Star } from 'lucide-react';

// Define the ProductCategory type
type ProductCategory = 'ELECTRONICS' | 'CLOTHING' | 'FOOD' | 'BOOKS' | 'OTHER';
const ProductCategory = {
  ELECTRONICS: 'ELECTRONICS',
  CLOTHING: 'CLOTHING',
  FOOD: 'FOOD',
  BOOKS: 'BOOKS',
  OTHER: 'OTHER'
} as const;

interface Product {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  stock: number;
  category: ProductCategory;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchProducts();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, session, status]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setAddingToCart(productId);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // You can add a success notification here if you want
        console.log('Product added to cart');
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Not authenticated - show landing page
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">OrderChad</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your Ultimate Retail Inventory & Order Management Solution. 
              Streamline your retail operations with our comprehensive platform.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <ShoppingBag size={40} className="text-blue-500" />
                </div>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Easily manage your product catalog with powerful tools for adding, 
                  updating, and organizing your inventory.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <ShoppingCart size={40} className="text-green-500" />
                </div>
                <CardTitle>Order Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Streamline the entire order fulfillment process from placement 
                  to delivery and manage returns efficiently.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Package size={40} className="text-purple-500" />
                </div>
                <CardTitle>Inventory Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Keep track of stock levels in real-time, get alerts for low stock, 
                  and generate comprehensive inventory reports.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Star size={40} className="text-yellow-500" />
                </div>
                <CardTitle>Customer Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Collect and manage customer reviews and ratings to improve 
                  your products and services.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to optimize your retail business?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of retailers who use OrderChad to streamline their operations.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/register">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user - show products
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Catalog</h1>
          <p className="text-lg text-gray-600">Browse our collection of products</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(ProductCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center">No products found</div>
          ) : (
            products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  {product.image ? (
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative h-48 w-full mb-4 overflow-hidden rounded-md">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </Link>
                  ) : (
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative h-48 w-full mb-4 bg-gray-100 rounded-md flex items-center justify-center">
                        <div className="text-gray-400 flex flex-col items-center justify-center">
                          <ShoppingBag size={32} />
                          <p className="text-sm mt-2">No image available</p>
                        </div>
                      </div>
                    </Link>
                  )}
                  <p className="text-gray-600 line-clamp-2">{product.description}</p>
                  <p className="text-lg font-semibold mt-2">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href={`/products/${product.id}`}>View Details</Link>
                  </Button>
                  {product.stock > 0 && (
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => addToCart(product.id)}
                      disabled={addingToCart === product.id}
                    >
                      {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
