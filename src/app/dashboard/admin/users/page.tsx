"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // Asegúrate de tenerlo instalado
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Tipos de datos
interface UsuarioLinked {
    id: number;
    rut: string;
    nombre_completo: string;
    email: string;
    rol: string;
    activo: number; // Viene como 1 o 0 de la BD
    fecha_creacion: string;
}

interface UsuarioGlobal {
    id: number;
    nombre_completo: string;
    rut: string;
    email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUsersPage() {
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<UsuarioLinked[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // --- CARGAR DATOS ---
    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        const token = localStorage.getItem("sat_token");
        try {
            const res = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === "success") {
                setUsuarios(data.data);
            } else {
                Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- ACCIÓN: VINCULAR NUEVO USUARIO ---
    const handleVincular = async () => {
        const token = localStorage.getItem("sat_token");

        // 1. Obtener usuarios globales disponibles
        let disponibles: UsuarioGlobal[] = [];
        try {
            const res = await fetch(`${API_URL}/api/users/disponibles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.status === 'success') disponibles = result.data;
        } catch (e) {
            Swal.fire("Error", "Error al conectar con Portal TICs", "error");
            return;
        }

        if (disponibles.length === 0) {
            Swal.fire("Información", "No hay nuevos funcionarios disponibles para vincular.", "info");
            return;
        }

        // 2. Construir HTML para el SweetAlert (Selects)
        const optionsHtml = disponibles.map(u =>
            `<option value="${u.id}">${u.nombre_completo} (${u.rut})</option>`
        ).join('');

        const { value: formValues } = await Swal.fire({
            title: 'Vincular Funcionario',
            html: `
                <div class="text-left mb-4">
                    <label class="block text-sm font-medium text-gray-700">Funcionario (Portal TICs)</label>
                    <select id="swal-user" class="w-full border border-gray-300 rounded p-2 mt-1">
                        ${optionsHtml}
                    </select>
                </div>
                <div class="text-left">
                    <label class="block text-sm font-medium text-gray-700">Rol en SAT</label>
                    <select id="swal-rol" class="w-full border border-gray-300 rounded p-2 mt-1">
                        <option value="funcionario">Funcionario (Usuario)</option>
                        <option value="tecnico">Técnico</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Otorgar Acceso',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    usuario_global_id: (document.getElementById('swal-user') as HTMLSelectElement).value,
                    rol: (document.getElementById('swal-rol') as HTMLSelectElement).value
                }
            }
        });

        if (formValues) {
            // 3. Enviar al Backend
            try {
                const res = await fetch(`${API_URL}/api/users/vincular`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formValues)
                });

                if (res.ok) {
                    Swal.fire("¡Éxito!", "Usuario vinculado correctamente.", "success");
                    fetchUsuarios(); // Recargar tabla
                } else {
                    Swal.fire("Error", "No se pudo vincular.", "error");
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    // --- ACCIÓN: CAMBIAR ESTADO/ROL ---
    const handleEditar = async (user: UsuarioLinked) => {
        const token = localStorage.getItem("sat_token");

        const { value: formValues } = await Swal.fire({
            title: `Editar: ${user.nombre_completo}`,
            html: `
                <div class="text-left mb-4">
                    <label class="block text-sm font-medium text-gray-700">Rol</label>
                    <select id="edit-rol" class="w-full border border-gray-300 rounded p-2 mt-1">
                        <option value="funcionario" ${user.rol === 'funcionario' ? 'selected' : ''}>Funcionario</option>
                        <option value="tecnico" ${user.rol === 'tecnico' ? 'selected' : ''}>Técnico</option>
                        <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                <div class="text-left">
                    <label class="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="edit-activo" class="w-full border border-gray-300 rounded p-2 mt-1">
                        <option value="1" ${user.activo ? 'selected' : ''}>Activo</option>
                        <option value="0" ${!user.activo ? 'selected' : ''}>Inactivo (Sin acceso)</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            preConfirm: () => {
                return {
                    rol: (document.getElementById('edit-rol') as HTMLSelectElement).value,
                    activo: (document.getElementById('edit-activo') as HTMLSelectElement).value
                }
            }
        });

        if (formValues) {
            try {
                await fetch(`${API_URL}/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formValues)
                });
                Swal.fire("Actualizado", "Permisos modificados.", "success");
                fetchUsuarios();
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Filtro de búsqueda local
    const filteredUsers = usuarios.filter(u =>
        u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                    <p className="text-gray-500">Administra el acceso al SAT (Vinculado a Portal TICs)</p>
                </div>
                <Button onClick={handleVincular} className="bg-blue-600 hover:bg-blue-700">
                    + Vincular Funcionario
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Usuarios con Acceso</CardTitle>
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="max-w-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre / RUT</TableHead>
                                <TableHead>Email (Portal)</TableHead>
                                <TableHead>Rol (Local)</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.nombre_completo}</div>
                                        <div className="text-xs text-gray-500">{user.rut}</div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.rol === 'admin' ? 'destructive' : user.rol === 'tecnico' ? 'default' : 'secondary'}>
                                            {user.rol.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.activo ? (
                                            <span className="text-green-600 font-bold text-xs">ACTIVO</span>
                                        ) : (
                                            <span className="text-red-500 font-bold text-xs">INACTIVO</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleEditar(user)}>
                                            Gestionar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}