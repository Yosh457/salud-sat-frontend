import { LoginForm } from "@/components/LoginForm";

export default function Home() {
  return (
    // CAMBIO: Quitamos "min-h-screen" y usamos "flex-grow h-full"
    // Esto hace que ocupe solo el espacio disponible entre el header (si hubiera) y el footer
    <div className="flex flex-col items-center justify-center p-4 h-full flex-grow py-20">
      <LoginForm />
      {/* Eliminado el texto de copyright duplicado */}
    </div>
  );
}