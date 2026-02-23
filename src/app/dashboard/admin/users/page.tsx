"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ====================
// Tipos
// ====================
interface UsuarioLinked {
    id: number;
    rut: string;
    nombre_completo: string;
    email: string;
    rol: "funcionario" | "tecnico" | "admin";
    activo: 0 | 1;
    fecha_creacion: string;
}

interface UsuarioGlobal {
    id: number;
    nombre_completo: string;
    rut: string;
    email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ====================
// Componente
// ====================
export default function AdminUsersPage() {
    const [usuarios, setUsuarios] = useState<UsuarioLinked[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // ====================
    // Cargar usuarios
    // ====================
    const fetchUsuarios = async () => {
        const token = localStorage.getItem("sat_token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === "success") {
                setUsuarios(data.data);
            }
        } catch {
            Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // ====================
    // Vincular usuario
    // ====================
    const handleVincular = async () => {
        const token = localStorage.getItem("sat_token");
        if (!token) return;

        let disponibles: UsuarioGlobal[] = [];
        try {
            const res = await fetch(`${API_URL}/api/users/disponibles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.status === "success") disponibles = result.data;
        } catch {
            Swal.fire("Error", "Error al conectar con Portal TICs", "error");
            return;
        }

        if (disponibles.length === 0) {
            Swal.fire("Info", "No hay funcionarios disponibles para vincular", "info");
            return;
        }

        const optionsHtml = disponibles.map(u =>
            `<option value="${u.id}">${u.nombre_completo} (${u.rut})</option>`
        ).join("");

        const { value: formValues } = await Swal.fire({
            title: "Vincular Funcionario",
            html: `
                <label class="block text-left text-sm mb-1">Funcionario</label>
                <select id="swal-user" class="swal2-input">${optionsHtml}</select>
                <label class="block text-left text-sm mt-3 mb-1">Rol</label>
                <select id="swal-rol" class="swal2-input">
                    <option value="funcionario">Funcionario</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: "Otorgar Acceso",
            preConfirm: () => ({
                usuario_global_id: (document.getElementById("swal-user") as HTMLSelectElement).value,
                rol: (document.getElementById("swal-rol") as HTMLSelectElement).value
            })
        });

        if (!formValues) return;

        await fetch(`${API_URL}/api/users/vincular`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formValues)
        });

        Swal.fire("Éxito", "Usuario vinculado correctamente", "success");
        fetchUsuarios();
    };

    // ====================
    // Toggle estado
    // ====================
    const handleToggleEstado = async (user: UsuarioLinked) => {
        const token = localStorage.getItem("sat_token");
        if (!token) return;

        const nuevoEstado = user.activo === 1 ? 0 : 1;

        const confirm = await Swal.fire({
            title: nuevoEstado ? "¿Activar acceso?" : "¿Desactivar acceso?",
            text: user.nombre_completo,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: nuevoEstado ? "#10b981" : "#ef4444",
            confirmButtonText: "Confirmar"
        });

        if (!confirm.isConfirmed) return;

        await fetch(`${API_URL}/api/users/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        setUsuarios(prev =>
            prev.map(u => u.id === user.id ? { ...u, activo: nuevoEstado } : u)
        );

        Swal.fire({
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
            icon: "success",
            title: nuevoEstado ? "Usuario activado" : "Usuario desactivado"
        });
    };

    // ====================
    // Editar rol
    // ====================
    const handleEditarRol = async (user: UsuarioLinked) => {
        const token = localStorage.getItem("sat_token");
        if (!token) return;

        const { value: nuevoRol } = await Swal.fire({
            title: "Cambiar Rol",
            input: "select",
            inputOptions: {
                funcionario: "Funcionario",
                tecnico: "Técnico",
                admin: "Administrador"
            },
            inputValue: user.rol,
            showCancelButton: true
        });

        if (!nuevoRol || nuevoRol === user.rol) return;

        await fetch(`${API_URL}/api/users/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ rol: nuevoRol })
        });

        setUsuarios(prev =>
            prev.map(u => u.id === user.id ? { ...u, rol: nuevoRol } : u)
        );

        Swal.fire("Actualizado", "Rol modificado correctamente", "success");
    };

    const filteredUsers = usuarios.filter(u =>
        u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ====================
    // UI
    // ====================
    return (
        <div className="flex-1 bg-gray-100 p-8">
            <div className="flex justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                    <p className="text-gray-500">Control de acceso SAT</p>
                </div>
                <Button onClick={handleVincular}>+ Vincular Funcionario</Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row justify-between">
                    <CardTitle>Usuarios</CardTitle>
                    <Input
                        placeholder="Buscar..."
                        className="max-w-xs"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Funcionario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">Cargando...</TableCell>
                                </TableRow>
                            ) : filteredUsers.map(user => (
                                <TableRow key={user.id} className={!user.activo ? "opacity-60" : ""}>
                                    <TableCell>
                                        <div className="font-medium">{user.nombre_completo}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer"
                                            onClick={() => handleEditarRol(user)}
                                        >
                                            {user.rol.toUpperCase()} ✏️
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            onClick={() => handleToggleEstado(user)}
                                            className={`relative inline-flex h-6 w-11 rounded-full transition
                                                ${user.activo ? "bg-green-500" : "bg-gray-300"}`}
                                        >
                                            <span className={`inline-block h-4 w-4 bg-white rounded-full transform transition
                                                ${user.activo ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
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