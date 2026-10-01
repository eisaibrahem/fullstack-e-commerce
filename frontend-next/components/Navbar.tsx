"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, Package, ClipboardList, LogOut, Shield, User, Menu } from "lucide-react";

interface NavLinksProps {
  isAuthenticated: boolean;
  user: { email?: string; role?: string } | null;
  cartCount: number;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}

function NavLinks({ isAuthenticated, user, cartCount, variant, onNavigate }: NavLinksProps) {
  const linkClass =
    variant === "desktop"
      ? "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 flex items-center gap-1.5"
      : "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800";

  const cartBadge = (
    <span className="relative">
      <ShoppingCart className="w-4 h-4" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -inset-s-2 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </span>
  );

  return (
    <>
      <Link href="/products" onClick={onNavigate} className={linkClass}>
        <Package className="w-4 h-4" />
        Products
      </Link>
      {isAuthenticated && (
        <>
          <Link href="/cart" onClick={onNavigate} className={linkClass}>
            {cartBadge}
            Cart
          </Link>
          <Link href="/orders" onClick={onNavigate} className={linkClass}>
            <ClipboardList className="w-4 h-4" />
            My Orders
          </Link>
          <Link href="/profile" onClick={onNavigate} className={linkClass}>
            <User className="w-4 h-4" />
            Profile
          </Link>
        </>
      )}
      {user?.role === "ADMIN" && (
        <Link href="/admin/products" onClick={onNavigate} className={linkClass}>
          <Shield className="w-4 h-4" />
          Admin
        </Link>
      )}
    </>
  );
}

export function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    setTimeout(() => {
      setMenuOpen(false);
    }, 100);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    router.push("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-40 border-b bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/products" className="font-bold text-lg shrink-0">
            E-Shop
          </Link>
          <div className="hidden md:flex items-center gap-5">
            <NavLinks
              isAuthenticated={isAuthenticated}
              user={user}
              cartCount={cartCount}
              variant="desktop"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-zinc-500 hidden sm:block">{user?.email}</span>
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

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent dir="rtl" side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>
              <Link href="/products" onClick={closeMenu} className="font-bold text-lg">
                E-Shop
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-1">
            <NavLinks
              isAuthenticated={isAuthenticated}
              user={user}
              cartCount={cartCount}
              variant="mobile"
              onNavigate={closeMenu}
            />
          </div>

          <SheetFooter>
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-zinc-500 break-all">{user?.email}</span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    closeMenu();
                    router.push("/login");
                  }}
                >
                  Login
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    closeMenu();
                    router.push("/register");
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
