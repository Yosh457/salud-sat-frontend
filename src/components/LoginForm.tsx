"use client"; // Esto le dice a Next.js que este componente corre en el navegador (para usar hooks)

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation"; // Para redirigir después del login
import Image from "next/image"; // 👈 Importar Image

// Importamos tus componentes visuales (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// URL de la API (Manejada por variable de entorno)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no está definida. Revisa tu archivo .env");
}

// 1️⃣ Definimos el esquema de validación con Zod (Las reglas del juego)
// CAMBIO: Ahora validamos EMAIL en lugar de RUT para la integración con Portal TICs
const loginSchema = z.object({
    email: z.string().email("Ingresa un correo válido").min(1, "El correo es obligatorio"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

// Inferimos el tipo de datos a partir del esquema (TypeScript Magic ✨)
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null); // Para mostrar errores del backend (ej: Credenciales incorrectas)
    const [loading, setLoading] = useState(false); // Para deshabilitar el botón mientras carga

    // 2️⃣ Inicializamos el formulario con React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema), // Conectamos Zod con el formulario
    });

    // 3️⃣ Esta función se ejecuta SOLO si la validación visual pasa
    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        setError(null);

        try {
            // Llamada a tu Backend Node.js
            // CAMBIO: Enviamos el objeto con 'email' en lugar de 'rut'
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al iniciar sesión");
            }

            // ✅ ÉXITO
            console.log("Login exitoso:", result);

            // Guardamos el token en localStorage (Temporal, luego veremos cookies)
            localStorage.setItem("sat_token", result.token);
            // Guardamos datos básicos del usuario para usarlos inmediatamente
            localStorage.setItem("sat_user", JSON.stringify(result.user));

            // 👇 NUEVA LÓGICA DE INTERCEPCIÓN 👇
            // Verificamos si el Portal TICs nos pide forzar el cambio de clave
            if (result.user.cambio_clave_requerido === true || result.user.cambio_clave_requerido === 1) {
                console.log("🔒 Redirigiendo a cambio de clave obligatorio...");
                router.push("/cambiar-clave"); 
            } else {
                console.log("✅ Redirigiendo al dashboard...");
                router.push("/dashboard");
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido"); 
        } finally {
            setLoading(false); // Reactivamos el botón
        }
    };

    return (
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600 bg-white">
            <CardHeader className="text-center pb-2">
                {/* 👇 LOGO APS EN EL LOGIN */}
                <div className="flex justify-center mb-4">
                    <Image
                        src="/Logo_Red_APS.png"
                        alt="Red de Atención Primaria"
                        width={140}
                        height={140}
                        className="object-contain h-24 w-auto"
                        priority
                    />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-700">SAT Salud</CardTitle>
                <CardDescription>Sistema de Asistencia Técnica - Alto Hospicio</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {/* Mensaje de Error Global */}
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                            🚨 {error}
                        </div>
                    )}

                    {/* CAMBIO: Campo Email en lugar de RUT */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            placeholder="nombre.apellido@mahosalud.cl"
                            {...register("email")} // 👈 Conectamos el input con Hook Form
                        />
                        {/* Mensaje de error del campo */}
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Campo Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••"
                            {...register("password")}
                        />
                        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                </CardContent>

                <CardFooter className="mt-4">
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loading} // Deshabilitar si está cargando
                    >
                        {loading ? "Verificando Credenciales..." : "Ingresar al Sistema"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}