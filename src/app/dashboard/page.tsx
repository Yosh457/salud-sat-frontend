"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 1. Definimos la estructura de los datos que vienen de la API (Stats)
interface StatItem {
    estado?: string;
    prioridad?: string;
    total: number;
}

interface DashboardStats {
    resumen_estados: StatItem[];
    alertas_prioridad: StatItem[];
    top_tecnicos: any[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ rut: string; rol: string; nombre: string } | null>(null);

    // Estado para guardar las estadísticas
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        // A. Verificación de Auth (Igual que antes)
        const token = localStorage.getItem("sat_token");
        if (!token) {
            router.push("/");
            return;
        }

        try {
            // 1. Decodificar Token (Solo para obtener ID y Rol inicial)
            const payload = JSON.parse(atob(token.split(".")[1]));

            // Estado inicial temporal (sin nombre aún)
            setUser({
                rut: payload.rut,
                rol: payload.rol,
                nombre: "Cargando..." // Placeholder mientras carga
            });

            // 2. Pedir datos reales del usuario a la API (UTF-8 Seguro)
            fetch("https://api-sat.mahosalud.cl/api/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(async (res) => {
                    if (res.ok) {
                        const dataUser = await res.json();
                        // Actualizamos el estado con el nombre correcto de la BD
                        setUser(prev => prev ? { ...prev, nombre: dataUser.data.nombre } : null);
                    }
                });

            // 3. Cargar Stats (Solo cargar stats si NO es funcionario)
            if (payload.rol !== 'funcionario') {
                fetchStats(token);
            } else {
                setLoadingStats(false);
            }

        } catch (e) {
            localStorage.removeItem("sat_token");
            router.push("/");
        }
    }, [router]);

    // Función asíncrona para pedir los números
    const fetchStats = async (token: string) => {
        try {
            const response = await fetch("https://api-sat.mahosalud.cl/api/stats/dashboard", {
                headers: {
                    "Authorization": `Bearer ${token}` // 👈 Importante: Enviar el token
                }
            });
            const result = await response.json();

            if (result.status === 'success') {
                setStats(result.data);
            }
        } catch (error) {
            console.error("Error cargando stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    // Función para descargar el Excel
    const handleDownloadReport = async () => {
        try {
            const token = localStorage.getItem("sat_token");
            const response = await fetch("https://api-sat.mahosalud.cl/api/reports/excel", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al generar reporte");

            // Truco para descargar archivo BLOB (Binary Large Object)
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_sat_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert("No se pudo descargar el reporte");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("sat_token");
        router.push("/");
    };

    // Helper para buscar un número específico en el array de respuesta
    // Ej: Buscar en resumen_estados donde estado sea 'pendiente'
    const getCount = (arr: StatItem[] | undefined, key: 'estado' | 'prioridad', value: string) => {
        if (!arr) return 0;
        const found = arr.find(item => item[key] === value);
        return found ? found.total : 0;
    };

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-700">SAT Salud</h2>
                    <p className="text-sm text-gray-500">Panel de Control</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start font-bold bg-blue-50 text-blue-700">
                        📊 Resumen
                    </Button>
                    {/* Botón Dinámico según Rol */}
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard/tickets")}>
                        {user.rol === 'admin' ? '🌍 Gestión Global' :
                            user.rol === 'tecnico' ? '📥 Bandeja de Casos' :
                                '🎫 Mis Solicitudes'}
                    </Button>

                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard/tickets/new")}>
                        ➕ Nuevo Ticket
                    </Button>
                    {/* 🆕 Botón de Reportes (Solo Admin) */}
                    {user.rol === 'admin' && (
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
                            onClick={handleDownloadReport}
                        >
                            📈 Descargar Reporte
                        </Button>
                    )}
                </nav>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Bienvenido, {user.nombre}
                        </h1>
                        <p className="text-gray-600">
                            RUT: {user.rut} | Rol: <span className="uppercase font-bold">{user.rol}</span>
                        </p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </header>

                {/* KPIs / Tarjetas de Estadísticas (Solo visibles para Admin y Técnico) */}
                {user.rol !== 'funcionario' ? (
                    <div className="grid gap-4 md:grid-cols-3">

                        {/* Tarjeta 1: Pendientes */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Tickets Pendientes
                                </CardTitle>
                                <span className="text-2xl">⏳</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {loadingStats ? "..." : getCount(stats?.resumen_estados, 'estado', 'pendiente')}
                                </div>
                                <p className="text-xs text-muted-foreground">Requieren atención inicial</p>
                            </CardContent>
                        </Card>

                        {/* Tarjeta 2: En Proceso */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    En Proceso
                                </CardTitle>
                                <span className="text-2xl">🔧</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {loadingStats ? "..." : getCount(stats?.resumen_estados, 'estado', 'en_proceso')}
                                </div>
                                <p className="text-xs text-muted-foreground">Están siendo atendidos</p>
                            </CardContent>
                        </Card>

                        {/* Tarjeta 3: Críticos (Alta Prioridad) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Prioridad Alta/Crítica
                                </CardTitle>
                                <span className="text-2xl">🚨</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {loadingStats ? "..." : (
                                        getCount(stats?.alertas_prioridad, 'prioridad', 'alta') +
                                        getCount(stats?.alertas_prioridad, 'prioridad', 'critica')
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Urgencias activas</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // Vista Dashboard Funcionario
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-800">Panel del Funcionario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                Desde aquí puedes revisar el estado de tus solicitudes o crear nuevos requerimientos técnicos.
                                Selecciona una opción del menú lateral para comenzar.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}