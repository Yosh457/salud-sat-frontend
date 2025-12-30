"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form"; // 👈 Importamos Controller
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// 1. Esquema de Validación
const ticketSchema = z.object({
    titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
    descripcion: z.string().min(10, "Describe el problema con más detalle"),
    categoria: z.string().min(1, "Selecciona una categoría"),
    prioridad: z.string().min(1, "Selecciona una prioridad"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    // 🆕 Estado para el archivo adjunto
    const [file, setFile] = useState<File | null>(null);

    const {
        register,
        control, // 👈 Necesario para el Select
        handleSubmit,
        formState: { errors },
    } = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            prioridad: "media", // Valor por defecto
        }
    });

    const onSubmit = async (data: TicketFormValues) => {
        setLoading(true);
        const token = localStorage.getItem("sat_token");

        try {
            // Paso 1: Crear el ticket
            const response = await fetch("http://localhost:3000/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                const newTicketId = result.ticketId; // Obtenemos el ID del ticket recién creado

                // PASO 2: Subir Evidencia (Solo si el usuario seleccionó un archivo)
                if (file && newTicketId) {
                    const formData = new FormData();
                    formData.append("evidencia", file); // Debe coincidir con upload.single('evidencia') en backend

                    // Llamada al endpoint de subida
                    await fetch(`http://localhost:3000/api/tickets/${newTicketId}/evidencia`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            // NOTA: No agregar "Content-Type" manual, fetch lo hace automático para FormData
                        },
                        body: formData,
                    });
                }

                alert("Ticket creado exitosamente");
                router.push("/dashboard/tickets"); // Volver al listado
            } else {
                alert(result.message || "Error al crear el ticket");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-blue-700">Nuevo Ticket de Soporte</CardTitle>
                    <CardDescription>
                        Describe tu problema detalladamente para que un técnico pueda ayudarte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Título */}
                        <div className="space-y-2">
                            <Label htmlFor="titulo">Asunto / Título</Label>
                            <Input
                                id="titulo"
                                placeholder="Ej: Impresora no enciende en Farmacia"
                                {...register("titulo")}
                            />
                            {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo.message}</p>}
                        </div>

                        {/* Categoría (Select Controlado) */}
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Controller
                                name="categoria"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo de problema" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Hardware">Hardware (PC, Impresora)</SelectItem>
                                            <SelectItem value="Software">Software / Programas</SelectItem>
                                            <SelectItem value="Redes">Internet / Red</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.categoria && <p className="text-red-500 text-xs">{errors.categoria.message}</p>}
                        </div>

                        {/* Prioridad (Select Controlado) */}
                        <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <Controller
                                name="prioridad"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Nivel de Urgencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="baja">Baja (Puede esperar)</SelectItem>
                                            <SelectItem value="media">Media (Normal)</SelectItem>
                                            <SelectItem value="alta">Alta (Urgente)</SelectItem>
                                            <SelectItem value="critica">Crítica (Detiene la operación)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.prioridad && <p className="text-red-500 text-xs">{errors.prioridad.message}</p>}
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción Detallada</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Explica qué estabas haciendo cuando ocurrió el error..."
                                className="min-h-[120px]"
                                {...register("descripcion")}
                            />
                            {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion.message}</p>}
                        </div>

                        {/* 🆕 Evidencia (Opcional) */}
                        <div className="space-y-2 p-4 bg-slate-50 border rounded-md border-dashed border-gray-300">
                            <Label htmlFor="evidencia" className="font-semibold text-gray-700">
                                📎 Adjuntar Evidencia (Opcional)
                            </Label>
                            <Input
                                id="evidencia"
                                type="file"
                                accept="image/*,application/pdf"
                                className="mt-2 bg-white cursor-pointer"
                                onChange={(e) => {
                                    const selectedFile = e.target.files?.[0];
                                    if (selectedFile) setFile(selectedFile);
                                }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Formatos: JPG, PNG, PDF. (Máx 5MB)
                            </p>
                        </div>

                        {/* Botones de Acción Responsive */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? "Enviando..." : "Crear Solicitud"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}