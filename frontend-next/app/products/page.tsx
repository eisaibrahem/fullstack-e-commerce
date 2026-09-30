"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    api<Product[]>("/products")
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(addItem({ productId: product.id, name: product.name, price: product.price }));
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading products...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {products.length === 0 ? (
        <p className="text-zinc-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>Stock: {product.stock}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                {isAuthenticated ? (
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                ) : (
                  <p className="text-sm text-zinc-500 w-full text-center">Login to add to cart</p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
