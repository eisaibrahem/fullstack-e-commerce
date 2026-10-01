"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, ClipboardList, LogOut, Shield, User } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

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
                <span className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -inset-s-2 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </span>
                Cart
              </Link>
              <Link href="/orders" className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                <ClipboardList className="w-4 h-4" />
                My Orders
              </Link>
              <Link href="/profile" className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                <User className="w-4 h-4" />
                Profile
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
