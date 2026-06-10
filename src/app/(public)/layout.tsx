import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UTMCapture } from "@/components/shared/UTMCapture";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <UTMCapture />
      </Suspense>
      <main>{children}</main>
      <Footer />
    </>
  );
}
