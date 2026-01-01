import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 👇 Asegúrate de que la ruta coincide con el nombre de tu archivo. 
// Si llamaste al archivo CartContext.tsx, el import es así:
import { CartProvider } from "@/context/CartProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Burgos Food PWA",
  description: "Comida casera directa del NAS",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* 👇 Aquí aplicamos las fuentes Geist correctamente */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 👇 El Provider abraza a los hijos AQUÍ, dentro del return */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
