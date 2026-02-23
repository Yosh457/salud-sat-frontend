"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react"; // Iconos de Lucide

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForceChangePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verificar que el usuario viene con sesión iniciada
        const userStr = localStorage.getItem("sat_user");
        if (!userStr) {
            router.push("/");
            return;
        }
    }, [router]);

    // Validaciones en tiempo real
    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        match: password !== "" && password === confirm,
    };

    const isFormValid = Object.values(validations).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        const token = localStorage.getItem("sat_token");

        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ new_password: password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Actualizar el localstorage para quitar la bandera
                const user = JSON.parse(localStorage.getItem("sat_user") || "{}");
                user.cambio_clave_requerido = false;
                localStorage.setItem("sat_user", JSON.stringify(user));

                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Tu contraseña ha sido actualizada.',
                    confirmButtonColor: '#2563eb'
                }).then(() => {
                    router.push("/dashboard"); // Vamos al sistema!
                });
            } else {
                throw new Error(data.message || "Error al actualizar la contraseña");
            }
        } catch (error) {
            // Manejo seguro del error sin usar 'any'
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            Swal.fire("Error", errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const CheckItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
        <div className={`flex items-center gap-2 text-sm ${isValid ? 'text-green-600 font-medium' : 'text-red-500'}`}>
            {isValid ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-red-500" />}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Banner Amarillo (Exacto a tu diseño) */}
            <div className="w-full bg-yellow-100 border-b border-yellow-200 py-3 text-center text-yellow-800 font-medium text-sm">
                Por seguridad, debes cambiar tu contraseña ahora.
            </div>

            <div className="flex-1 flex items-center justify-center w-full px-4 mt-8">
                <Card className="w-full max-w-md shadow-xl bg-white border-t-4 border-t-blue-600">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-800">Cambio de Contraseña Obligatorio</CardTitle>
                        <CardDescription className="mt-2 text-gray-500">
                            Por seguridad, debes establecer una nueva contraseña.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus-visible:ring-blue-500"
                                />
                            </div>

                            {/* Checklist de Validaciones */}
                            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <CheckItem isValid={validations.length} text="Mínimo 8 caracteres" />
                                <CheckItem isValid={validations.uppercase} text="Al menos una letra mayúscula" />
                                <CheckItem isValid={validations.number} text="Al menos un número" />
                                <CheckItem isValid={validations.match} text="Las contraseñas coinciden" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="focus-visible:ring-blue-500"
                                />
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                disabled={!isFormValid || loading}
                            >
                                {loading ? "Guardando..." : "Establecer Contraseña"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}