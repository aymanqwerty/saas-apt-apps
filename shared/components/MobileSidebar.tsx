"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { AppSidebar } from "@/shared/components/AppSidebar";

/**
 * Mobile nav for the admin (below `md`, where the fixed sidebar is hidden): a
 * hamburger on the left that opens the same `AppSidebar` in a drawer sliding in
 * from the left. Portalled to <body> so the Topbar's `backdrop-blur` doesn't
 * trap the fixed drawer inside it.
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close automatically after navigating to a new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const drawer = (
    <>
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        inert={!open}
        className={`bg-card fixed top-0 left-0 z-[70] h-full w-64 max-w-[82%] border-r shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:bg-muted absolute top-4 right-2 z-10 flex size-8 items-center justify-center rounded-lg"
        >
          <X className="size-5" />
        </button>
        <AppSidebar />
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-lg md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
