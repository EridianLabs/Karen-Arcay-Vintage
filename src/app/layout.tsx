import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karen Arcay Vintage – Vintage Clothing & Accessories | UK",
  description:
    "UK-based vintage clothing, accessories and collectables. Value-priced, easy returns. Karen Arcay Vintage – karenarcayvintage.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
