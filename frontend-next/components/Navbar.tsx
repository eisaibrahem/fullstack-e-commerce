"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, ClipboardList, LogOut, Shield } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/products" className="font-bold text-lg">
            E-Shop
          </Link>
          <Link href="/products" className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
            <Package className="w-4 h-4" />
            Products
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/cart" className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
              <Link href="/orders" className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                <ClipboardList className="w-4 h-4" />
                My Orders
              </Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin/products" className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-zinc-500">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Link href="/login" className="w-full h-full flex items-center justify-center">Login</Link>
              </Button>
              <Button size="sm" className="cursor-pointer">
                <Link href="/register" className="w-full h-full flex items-center justify-center">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
