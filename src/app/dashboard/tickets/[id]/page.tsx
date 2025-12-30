"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Definimos los tipos
interface TicketDetail {
    id: number;
    titulo: string;
    descripcion: string;
    prioridad: string;
    estado: string;
    categoria: string;
    fecha_creacion: string;
    autor?: string;
    tecnico?: string;
}

interface Evidencia {
    id: number;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_mime: string;
}

export default function TicketDetailPage() {
    const router = useRouter();
    const params = useParams(); // 👈 Aquí capturamos el ID de la URL (ej: 1)
    const ticketId = params.id;

    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("sat_token");
        if (!token) {
            router.push("/");
            return;
        }

        // Cargamos Ticket y Evidencias en paralelo
        Promise.all([
            fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3000/api/tickets/${ticketId}/evidencia`, {
                headers: { Authorization: `Bearer ${token}` },
            })
        ])
            .then(async ([resTicket, resEvidence]) => {
                const dataTicket = await resTicket.json();
                const dataEvidence = await resEvidence.json();

                if (dataTicket.status === "success") setTicket(dataTicket.data);
                if (dataEvidence.status === "success") setEvidencias(dataEvidence.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));

    }, [ticketId, router]);

    // Helpers de color (Reutilizados)
    const getPriorityColor = (p: string) => {
        if (p === 'critica') return 'bg-red-600';
        if (p === 'alta') return 'bg-orange-500';
        if (p === 'media') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (!ticket) return <div className="p-8 text-center text-red-500">Ticket no encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-sm">#{ticket.id}</Badge>
                                <Badge className={getPriorityColor(ticket.prioridad)}>{ticket.prioridad.toUpperCase()}</Badge>
                                <Badge variant="secondary" className="uppercase">{ticket.estado.replace('_', ' ')}</Badge>
                            </div>
                            <CardTitle className="text-2xl text-blue-800">{ticket.titulo}</CardTitle>
                            <CardDescription className="mt-1">
                                Creado el {new Date(ticket.fecha_creacion).toLocaleDateString()} • Categoría: {ticket.categoria}
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <hr className="my-4"/>
                    {/* Descripción */}
                    <div className="bg-slate-50 p-4 rounded-md border">
                        <h3 className="font-semibold mb-2 text-gray-700">Descripción del Problema:</h3>
                        <p className="text-gray-800 whitespace-pre-wrap">{ticket.descripcion}</p>
                    </div>

                    {/* Información de Actores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-md">
                            <span className="text-xs text-gray-500 uppercase font-bold">Solicitante</span>
                            <p className="font-medium">{ticket.autor || "No disponible"}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <span className="text-xs text-gray-500 uppercase font-bold">Técnico Asignado</span>
                            <p className="font-medium">{ticket.tecnico || "Sin asignar"}</p>
                        </div>
                    </div>

                    {/* Sección de Evidencias */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            📎 Evidencias Adjuntas ({evidencias.length})
                        </h3>
                        {evidencias.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No hay archivos adjuntos.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {evidencias.map((ev) => (
                                    <a
                                        key={ev.id}
                                        href={`http://localhost:3000${ev.ruta_archivo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50 transition-colors group"
                                    >
                                        <span className="text-2xl">📄</span>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate group-hover:text-blue-700">
                                                {ev.nombre_archivo}
                                            </p>
                                            <p className="text-xs text-gray-400">Clic para ver</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}