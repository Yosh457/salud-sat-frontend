"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ rut: string; rol: string; nombre: string; } | null>(null);

    useEffect(() => {
        // 1. Verificar si hay token
        const token = localStorage.getItem("sat_token");

        if (!token) {
            router.push("/"); // Si no hay token, volver al login
            return;
        }

        // 2. Decodificar el token (de forma básica para obtener datos visuales)
        // Nota: La seguridad real la pone el Backend al validar el token en cada petición.
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({ rut: payload.rut, rol: payload.rol, nombre: payload.nombre });
        } catch (e) {
            localStorage.removeItem("sat_token");
            router.push("/");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("sat_token");
        router.push("/");
    };

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* SIDEBAR (Barra Lateral) - Pronto la moveremos a un componente separado */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-700">SAT Salud</h2>
                    <p className="text-sm text-gray-500">Panel de Control</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start font-bold bg-blue-50 text-blue-700">
                        📊 Resumen
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        🎫 Mis Tickets
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        ➕ Nuevo Ticket
                    </Button>
                    {user.rol === 'admin' && (
                        <Button variant="ghost" className="w-full justify-start text-purple-600">
                            👥 Usuarios (Admin)
                        </Button>
                    )}
                </nav>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user.nombre}</h1>
                        <p className="text-gray-600">RUT: {user.rut} | Rol: <span className="uppercase font-bold">{user.rol}</span></p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </header>

                {/* Área de trabajo (Aquí irán las tablas y gráficos) */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-gray-500">Tickets Pendientes</h3>
                        <p className="text-3xl font-bold text-orange-500">3</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-gray-500">En Proceso</h3>
                        <p className="text-3xl font-bold text-blue-500">2</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-gray-500">Resueltos (Mes)</h3>
                        <p className="text-3xl font-bold text-green-500">15</p>
                    </div>
                </div>
            </main>
        </div>
    );
}