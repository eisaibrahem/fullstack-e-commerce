"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "@/store/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { ProductImage } from "@/components/ProductImage";

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, status, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [actionError, setActionError] = useState("");

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
    setImage("");
    setEditingId(null);
    setShowForm(false);
    setActionStatus("idle");
    setActionError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus("loading");
    setActionError("");

    try {
      const data = { name, price: parseFloat(price), stock: parseInt(stock), image: image || undefined };
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

  const handleEdit = (product: { id: number; name: string; price: number; stock: number; image?: string }) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImage(product.image || "");
    setShowForm(true);
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
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {actionStatus === "rejected" && actionError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">{actionError}</div>
      )}

      {showForm && (
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input id="image" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={actionStatus === "loading"} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                  {actionStatus === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="w-4 h-4" />
                      Saving...
                    </span>
                  ) : editingId ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
