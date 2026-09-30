"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/productsSlice";
import { addToCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { ProductImage } from "@/components/ProductImage";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, status, error } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { status: cartStatus } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (product: { id: number; name: string; price: number }) => {
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  if (status === "rejected") {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Products
      </h1>
      {products.length === 0 ? (
        <p className="text-zinc-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                  Stock: {product.stock}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${Number(product.price).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                {isAuthenticated ? (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || cartStatus === "loading"}
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
