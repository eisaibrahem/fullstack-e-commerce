"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductImage } from "@/components/ProductImage";
import { Spinner } from "@/components/Spinner";
import { Trash2, ImageIcon } from "lucide-react";
import type { Product } from "@/store/productsSlice";

interface ProductsTableProps {
  products: Product[];
  busyAction: boolean;
  deletingImageId: number | null;
  onEdit: (product: Product) => void;
  onUploadImage: (product: { id: number; name: string }) => void;
  onDeleteImage: (productId: number) => void;
  onDelete: (productId: number) => void;
}

export function ProductsTable({
  products,
  busyAction,
  deletingImageId,
  onEdit,
  onUploadImage,
  onDeleteImage,
  onDelete,
}: ProductsTableProps) {
  return (
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
                    <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onUploadImage(product)}>
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    {product.image && (
                      <Button variant="destructive" size="sm" onClick={() => onDeleteImage(product.id)} disabled={deletingImageId === product.id}>
                        {deletingImageId === product.id ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)} disabled={busyAction}>
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
  );
}
