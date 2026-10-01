"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "@/store/productsSlice";
import type { Product } from "@/store/productsSlice";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { Plus } from "lucide-react";
import { ProductFormDialog } from "./_components/ProductFormDialog";
import type { ProductFormValues } from "./_components/ProductFormDialog";
import { ProductsTable } from "./_components/ProductsTable";
import { ImageUploadModal } from "./_components/ImageUploadModal";
import { ProductFilters, defaultProductFilters } from "@/components/ProductFilters";
import type { ProductFiltersValue } from "@/components/ProductFilters";
import { ListPagination } from "@/components/ListPagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, meta, status, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [actionError, setActionError] = useState("");
  const [filters, setFilters] = useState<ProductFiltersValue>({ ...defaultProductFilters });
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebouncedValue(filters, 300);

  const [imageModalProduct, setImageModalProduct] = useState<{ id: number; name: string } | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    dispatch(fetchProducts({ page, filters: debouncedFilters }));
  }, [dispatch, user, page, debouncedFilters]);

  if (user?.role !== "ADMIN") {
    return <div className="text-center py-12 text-red-500">Access denied. Admin only.</div>;
  }

  const handleFiltersChange = (next: ProductFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const closeForm = () => {
    setEditingProduct(null);
    setFormOpen(false);
    setActionStatus("idle");
    setActionError("");
  };

  const handleSubmit = async (values: ProductFormValues) => {
    setActionStatus("loading");
    setActionError("");
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, data: values })).unwrap();
      } else {
        await dispatch(createProduct(values)).unwrap();
        setPage(1);
      }
      closeForm();
    } catch (err: unknown) {
      setActionStatus("rejected");
      setActionError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    setActionStatus("loading");
    try {
      await dispatch(deleteProduct(id)).unwrap();
    } catch (err: unknown) {
      setActionStatus("rejected");
      setActionError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionStatus("idle");
    }
  };

  const handleDeleteImage = async (productId: number) => {
    setDeletingImageId(productId);
    try {
      await api(`/products/${productId}/image`, { method: "DELETE" });
      dispatch(fetchProducts({ page, filters: debouncedFilters }));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Delete image failed");
    } finally {
      setDeletingImageId(null);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Products
        </h1>
        <Button
          onClick={() => { setEditingProduct(null); setActionError(""); setFormOpen(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {actionError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">{actionError}</div>
      )}

      <ProductFormDialog
        key={editingProduct?.id ?? "new"}
        open={formOpen}
        onOpenChange={(open) => { if (!open) closeForm(); }}
        initialProduct={editingProduct}
        saving={actionStatus === "loading"}
        error={actionStatus === "rejected" ? actionError : null}
        onSubmit={handleSubmit}
      />

      <ProductFilters value={filters} onChange={handleFiltersChange} />

      {products.length === 0 ? (
        <p className="text-zinc-500">
          {hasActiveFilters && meta?.total === 0
            ? "No products match your filters."
            : "No products yet."}
        </p>
      ) : (
        <div className={status === "loading" ? "opacity-60" : ""}>
          <ProductsTable
            products={products}
            busyAction={actionStatus === "loading"}
            deletingImageId={deletingImageId}
            onEdit={(product) => { setEditingProduct(product); setActionError(""); setFormOpen(true); }}
            onUploadImage={(product) => setImageModalProduct({ id: product.id, name: product.name })}
            onDeleteImage={handleDeleteImage}
            onDelete={handleDelete}
          />
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

      {imageModalProduct && (
        <ImageUploadModal
          product={imageModalProduct}
          onClose={() => setImageModalProduct(null)}
          onUploaded={() => dispatch(fetchProducts({ page, filters: debouncedFilters }))}
        />
      )}
    </div>
  );
}
