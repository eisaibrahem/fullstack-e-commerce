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

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, status, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [actionError, setActionError] = useState("");

  const [imageModalProduct, setImageModalProduct] = useState<{ id: number; name: string } | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    dispatch(fetchProducts());
  }, [dispatch, user]);

  if (user?.role !== "ADMIN") {
    return <div className="text-center py-12 text-red-500">Access denied. Admin only.</div>;
  }

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
      dispatch(fetchProducts());
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Delete image failed");
    } finally {
      setDeletingImageId(null);
    }
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

      <ProductsTable
        products={products}
        busyAction={actionStatus === "loading"}
        deletingImageId={deletingImageId}
        onEdit={(product) => { setEditingProduct(product); setActionError(""); setFormOpen(true); }}
        onUploadImage={(product) => setImageModalProduct({ id: product.id, name: product.name })}
        onDeleteImage={handleDeleteImage}
        onDelete={handleDelete}
      />

      {imageModalProduct && (
        <ImageUploadModal
          product={imageModalProduct}
          onClose={() => setImageModalProduct(null)}
          onUploaded={() => dispatch(fetchProducts())}
        />
      )}
    </div>
  );
}
