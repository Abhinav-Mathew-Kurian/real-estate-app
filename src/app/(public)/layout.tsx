import { Suspense } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { UTMCapture } from "@/components/public/UTMCapture";

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
