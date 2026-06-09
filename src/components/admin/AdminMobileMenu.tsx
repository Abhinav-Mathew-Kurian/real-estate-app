"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./AdminSidebar";

export function AdminMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-mist transition-colors"
        aria-label="Open navigation menu"
        render={<button />}
      >
        <Menu className="w-5 h-5 text-ink" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-60 bg-forest border-r-0 [&>button]:text-cream/50 [&>button]:hover:text-cream">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
