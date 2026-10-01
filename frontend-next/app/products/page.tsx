"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/productsSlice";
import { addToCart } from "@/store/cartSlice";
import { Spinner } from "@/components/Spinner";
import { ProductCard } from "./_components/ProductCard";
import { ProductFilters, defaultProductFilters } from "@/components/ProductFilters";
import type { ProductFiltersValue } from "@/components/ProductFilters";
import { ListPagination } from "@/components/ListPagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, meta, status, error } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ProductFiltersValue>({ ...defaultProductFilters });
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebouncedValue(filters, 300);

  useEffect(() => {
    dispatch(fetchProducts({ page, filters: debouncedFilters }));
  }, [dispatch, page, debouncedFilters]);

  const handleFiltersChange = (next: ProductFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
    } finally {
      setAddingId(null);
    }
  };

  const isLoadingFirstPage = status === "loading" && products.length === 0;

  if (isLoadingFirstPage) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  if (status === "rejected") {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.inStockOnly ||
    filters.sort !== "newest";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Products
      </h1>
      <ProductFilters value={filters} onChange={handleFiltersChange} />

      {products.length === 0 ? (
        <p className="text-zinc-500">
          {hasActiveFilters && meta?.total === 0
            ? "No products match your filters."
            : "No products available."}
        </p>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${status === "loading" ? "opacity-60" : ""}`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canBuy={isAuthenticated}
              adding={addingId === product.id}
              onAdd={() => handleAddToCart(product.id)}
            />
          ))}
        </div>
      )}

      {meta && (
        <ListPagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          disabled={status === "loading"}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
