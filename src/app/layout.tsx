import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Usamos Inter igual que en tu HTML
import { MainHeader } from "@/components/MainHeader"; // Importamos la cabecera
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | SAT Salud",
    default: "SAT Salud - Alto Hospicio",
  },
  description: "Sistema de Asistencia Técnica del Departamento de Salud",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Estructura Flex para Sticky Footer (Igual a tu Flask base.html) */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-100`}>

        {/* 1. Cabecera (Se auto-oculta en Login) */}
        <MainHeader />

        {/* 2. Contenido Principal */}
        {/* CAMBIO: Agregamos "flex flex-col" aquí para que los hijos (dashboard) puedan usar flex-1 */}
        <main className="w-full flex-grow flex flex-col relative">
          {children}
        </main>

        {/* 3. Pie de Página Institucional (Color #275c80) */}
        <footer className="w-full text-white text-center p-4 mt-auto" style={{ backgroundColor: '#275c80' }}>
          <p className="text-sm">
            Desarrollado por la <strong>Unidad de TICs</strong> del Departamento de Salud de la Municipalidad de Alto Hospicio
          </p>
        </footer>

      </body>
    </html>
  );
}