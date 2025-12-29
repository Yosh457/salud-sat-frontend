import { LoginForm } from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      {/* Simplemente renderizamos nuestro componente inteligente */}
      <LoginForm />
      
      <p className="mt-8 text-sm text-gray-500">
        © 2025 Unidad de TICs - Departamento de Salud
      </p>
    </main>
  );
}