"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Definimos la estructura exacta de tu Ticket
interface Ticket {
    id: number;
    titulo: string;
    prioridad: string;
    estado: string;
    categoria: string;
    fecha_creacion: string;
    autor?: string; // Solo viene si eres admin/tecnico
}

export default function TicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("sat_token");
        if (!token) {
            router.push("/");
            return;
        }
        fetchTickets(token);
    }, [router]);

    const fetchTickets = async (token: string) => {
        try {
            const response = await fetch("https://api-sat.mahosalud.cl/api/tickets", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (result.status === "success") {
                setTickets(result.data);
            }
        } catch (error) {
            console.error("Error al cargar tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper para color de Prioridad
    const getPriorityColor = (prioridad: string) => {
        switch (prioridad) {
            case "critica": return "bg-red-600 hover:bg-red-700"; // Rojo intenso
            case "alta": return "bg-orange-500 hover:bg-orange-600"; // Naranja
            case "media": return "bg-yellow-500 hover:bg-yellow-600"; // Amarillo
            default: return "bg-blue-500 hover:bg-blue-600"; // Azul (Baja)
        }
    };

    // Helper para color de Estado
    const getStatusColor = (estado: string) => {
        switch (estado) {
            case "pendiente": return "bg-gray-500";
            case "en_proceso": return "bg-blue-600";
            case "resuelto": return "bg-green-600";
            case "cerrado": return "bg-black";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de Tickets</h1>
                    <p className="text-gray-500">Listado completo de requerimientos</p>
                </div>
                <Button onClick={() => router.push("/dashboard")}>Volver al Panel</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tickets Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-4">Cargando tickets...</p>
                    ) : tickets.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">No hay tickets registrados.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Asunto</TableHead>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{ticket.titulo}</span>
                                                <span className="text-xs text-gray-500">{ticket.categoria}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPriorityColor(ticket.prioridad)}>
                                                {ticket.prioridad ? ticket.prioridad.toUpperCase() : "S/P"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(ticket.estado)}>
                                                {ticket.estado ? ticket.estado.replace("_", " ").toUpperCase() : "S/E"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(ticket.fecha_creacion).toLocaleDateString("es-CL")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                                            >
                                                Ver Detalle
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}