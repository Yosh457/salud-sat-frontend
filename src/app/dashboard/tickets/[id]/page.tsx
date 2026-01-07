"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TicketHistory } from "@/components/TicketHistory";
import Swal from "sweetalert2";

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
    tecnico_id?: number; // Necesitamos el ID para saber quien está seleccionado
    tecnico?: string;
    usuario_id: number;
}

interface Evidencia {
    id: number;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_mime: string;
}

interface Usuario {
    id: number;
    nombre_completo: string;
    rol: string;
}

export default function TicketDetailPage() {
    const router = useRouter();
    const params = useParams(); // 👈 Aquí capturamos el ID de la URL (ej: 1)
    const ticketId = params.id;

    // Estados de datos
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [historial, setHistorial] = useState<any[]>([]); // 👈 Estado Historial
    const [tecnicos, setTecnicos] = useState<Usuario[]>([]); // Lista para el select
    const [currentUser, setCurrentUser] = useState<{ id: number; rol: string } | null>(null); // Para permisos

    // Estado de carga
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estados del formulario de gestión
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedTech, setSelectedTech] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("sat_token");
        if (!token) {
            router.push("/");
            return;
        }

        // Decodificar rol del usuario actual
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setCurrentUser({ id: payload.id, rol: payload.rol });
        } catch (e) {
            console.error("Error leyendo token", e);
        }

        // Cargar datos iniciales
        const fetchData = async () => {
            try {
                // 1. Cargar Ticket, Evidencias e Historial en paralelo
                const [resTicket, resEvidence, resHistory] = await Promise.all([
                    fetch(`https://api-sat.mahosalud.cl/api/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`https://api-sat.mahosalud.cl/api/tickets/${ticketId}/evidencia`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`https://api-sat.mahosalud.cl/api/tickets/${ticketId}/historial`, { headers: { Authorization: `Bearer ${token}` } }) // 👈 Petición Historial
                ]);

                const dataTicket = await resTicket.json();
                const dataEvidence = await resEvidence.json();
                const dataHistory = await resHistory.json(); // 👈 Data Historial

                if (dataTicket.status === "success") {
                    const t = dataTicket.data;
                    setTicket(t);
                    // Inicializar los selects con los valores actuales del ticket
                    setSelectedStatus(t.estado || "");
                    setSelectedTech(t.tecnico_id ? t.tecnico_id.toString() : "0");
                }
                if (dataEvidence.status === "success") setEvidencias(dataEvidence.data);
                if (dataHistory.status === "success") setHistorial(dataHistory.data); // 👈 Setear Historial

                // 2. Si NO es funcionario, cargar lista de técnicos para asignar
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.rol !== 'funcionario') {
                    const resTechs = await fetch(`https://api-sat.mahosalud.cl/api/users/tecnicos`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const dataTechs = await resTechs.json();
                    if (dataTechs.status === "success") setTecnicos(dataTechs.data);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ticketId, router]);

    // Función para guardar cambios (Estado o Técnico)
    const handleUpdate = async (overrideStatus?: string, overrideTech?: number) => {
        setSaving(true);
        const token = localStorage.getItem("sat_token");

        try {
            const body = {
                estado: overrideStatus || selectedStatus,
                tecnico_id: overrideTech !== undefined ? overrideTech : (selectedTech !== "0" ? parseInt(selectedTech) : null)
            };

            const response = await fetch(`https://api-sat.mahosalud.cl/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                // Mostrar alerta de éxito
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El ticket se ha actualizado correctamente.',
                    icon: 'success',
                    timer: 2000, // Se cierra solo en 2 segundos
                    showConfirmButton: false
                });
                window.location.reload();
            } else { // Para errores
                Swal.fire('Error', 'No se pudo actualizar el ticket', 'error');
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setSaving(false);
        }
    };

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
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Encabezado con botón Volver */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-700">Detalle de Solicitud</h2>
                <Button variant="outline" onClick={() => router.back()}>Volver al listado</Button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA: Detalles del Ticket (2/3 del ancho) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">#{ticket.id}</Badge>
                                <Badge className={getPriorityColor(ticket.prioridad)}>
                                    {ticket.prioridad?.toUpperCase() || "SIN PRIORIDAD"}
                                </Badge>
                                <Badge variant="secondary" className="uppercase">
                                    {ticket.estado?.replace('_', ' ') || "SIN ESTADO"}
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl text-blue-800">{ticket.titulo}</CardTitle>
                            <CardDescription>
                                Creado el {new Date(ticket.fecha_creacion).toLocaleDateString()} • Categoría: {ticket.categoria}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Descripción */}
                            <div className="bg-slate-50 p-4 rounded-md border">
                                <h3 className="font-semibold mb-2 text-gray-700">Descripción:</h3>
                                <p className="text-gray-800 whitespace-pre-wrap">{ticket.descripcion}</p>
                            </div>

                            {/* Información de Contacto */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border rounded">
                                    <span className="text-xs text-gray-500 font-bold block">SOLICITANTE</span>
                                    <span>{ticket.autor || "No registrado"}</span>
                                </div>
                                <div className="p-3 border rounded">
                                    <span className="text-xs text-gray-500 font-bold block">TÉCNICO ACTUAL</span>
                                    <span>{ticket.tecnico || "Sin asignar"}</span>
                                </div>
                            </div>

                            {/* Evidencias */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">📎 Evidencias ({evidencias.length})</h3>
                                {evidencias.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No hay archivos adjuntos.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {evidencias.map((ev) => (
                                            <a
                                                key={ev.id}
                                                href={`https://api-sat.mahosalud.cl${ev.ruta_archivo}`}
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
                    {/* 👇 AQUÍ RENDERIZAMOS EL HISTORIAL (Línea de Tiempo) 👇 */}
                    <TicketHistory historial={historial} />
                </div>

                {/* COLUMNA DERECHA: Panel de Gestión */}
                <div className="lg:col-span-1">
                    {/* VISTA ADMIN */}
                    {currentUser?.rol === 'admin' && (
                        <Card className="border-blue-200 shadow-md">
                            <CardHeader className="bg-blue-50 border-b border-blue-100">
                                <CardTitle className="text-lg text-blue-800">🛠️ Panel de Gestión</CardTitle>
                                <CardDescription>Acciones de soporte técnico</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">

                                {/* Selector de Técnico */}
                                <div className="space-y-2">
                                    <Label>Asignar Técnico</Label>
                                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar técnico" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">-- Sin Asignar --</SelectItem>
                                            {tecnicos.map(t => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.nombre_completo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Botón Guardar - Ahora llamamos handleUpdate SIN pasar estado */}
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                                    onClick={() => handleUpdate(undefined)} // Undefined estado = Backend decide
                                    disabled={saving}
                                >
                                    {saving ? "Guardando..." : "Guardar Asignación"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* VISTA TÉCNICO: Tomar o Resolver */}
                    {currentUser?.rol === 'tecnico' && (
                        <Card className="border-green-200 shadow-md">
                            <CardHeader className="bg-green-50 border-b border-green-100">
                                <CardTitle className="text-lg text-green-800">🛠️ Acciones Técnicas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {/* Si no es mio y no tiene técnico -> Lo tomo */}
                                {ticket.tecnico_id !== currentUser.id && ticket.tecnico_id === null ? (
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={() => handleUpdate(undefined, currentUser.id)} // Me asigno, estado auto
                                        disabled={saving}
                                    >
                                        ✋ Tomar este Caso
                                    </Button>
                                ) : ticket.tecnico_id === currentUser.id ? (
                                    /* Si es mio -> Lo resuelvo */
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">Ticket asignado a ti.</p>
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={() => handleUpdate('resuelto')} // Fuerzo estado resuelto
                                            disabled={saving || ticket.estado === 'resuelto'}
                                        >
                                            ✅ Marcar como Resuelto
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-500">Este ticket pertenece a otro técnico.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* VISTA FUNCIONARIO */}
                    {currentUser?.rol === 'funcionario' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-600">Estado del Caso</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">
                                    Tu solicitud está siendo gestionada por el equipo de TICs. Recibirás actualizaciones cuando cambie el estado.
                                </p>
                                <Button variant="outline" className="w-full" disabled>
                                    Contactar Soporte
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    );
}