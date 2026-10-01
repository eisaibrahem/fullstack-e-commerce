"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "@/store/productsSlice";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, ImageIcon, X } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { ProductImage } from "@/components/ProductImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, status, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [actionError, setActionError] = useState("");

  const [imageModal, setImageModal] = useState<{ productId: number; productName: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    dispatch(fetchProducts());
  }, [dispatch, user]);

  if (user?.role !== "ADMIN") {
    return <div className="text-center py-12 text-red-500">Access denied. Admin only.</div>;
  }

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setDescription("");
    setEditingId(null);
    setFormOpen(false);
    setActionStatus("idle");
    setActionError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus("loading");
    setActionError("");

    try {
      const data = { name, price: parseFloat(price), stock: parseInt(stock), description };
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, data })).unwrap();
      } else {
        await dispatch(createProduct(data)).unwrap();
      }
      resetForm();
    } catch (err: unknown) {
      setActionStatus("rejected");
      setActionError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (product: { id: number; name: string; price: number; stock: number; description?: string }) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setDescription(product.description || "");
    setFormOpen(true);
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

  const openImageModal = (product: { id: number; name: string }) => {
    setImageModal({ productId: product.id, productName: product.name });
    setImageFile(null);
    setImagePreview(null);
    setImageUploadStatus("idle");
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile || !imageModal) return;
    setImageUploadStatus("loading");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      await api(`/products/${imageModal.productId}/image`, {
        method: "POST",
        body: formData,
      });
      setImageModal(null);
      setImageFile(null);
      setImagePreview(null);
      dispatch(fetchProducts());
    } catch (err: unknown) {
      setImageUploadStatus("rejected");
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
          onClick={() => { resetForm(); setFormOpen(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {actionStatus === "rejected" && actionError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">{actionError}</div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the product details below." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            {actionStatus === "rejected" && actionError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{actionError}</div>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={actionStatus === "loading"} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                {actionStatus === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Saving...
                  </span>
                ) : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openImageModal(product)}>
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      {product.image && (
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteImage(product.id)} disabled={deletingImageId === product.id}>
                          {deletingImageId === product.id ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)} disabled={actionStatus === "loading"}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {imageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload Image — {imageModal.productName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setImageModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFileChange} />
              {imageUploadStatus === "rejected" && (
                <p className="text-sm text-red-600">Upload failed. Please try again.</p>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  onClick={handleUploadImage}
                  disabled={!imageFile || imageUploadStatus === "loading"}
                >
                  {imageUploadStatus === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="w-4 h-4" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setImageModal(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
