"use client"; // Necesario para leer la URL actual

import { usePathname } from "next/navigation";
import Image from "next/image";

export function MainHeader() {
    const pathname = usePathname();

    // Si estamos en la raíz (Login), no mostramos la cabecera
    if (pathname === "/") {
        return null;
    }

    return (
        <header className="w-full bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                {/* Logo Red APS (Izquierda) */}
                <div className="relative w-32 h-16 sm:w-40 sm:h-20">
                    <Image
                        src="/Logo_Red_APS.png"
                        alt="Logo Red de Atención Primaria"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>

                {/* Logo Municipalidad (Derecha) */}
                <div className="relative w-32 h-16 sm:w-40 sm:h-20">
                    <Image
                        src="/logoMaho.png"
                        alt="Logo Municipalidad Alto Hospicio"
                        fill
                        className="object-contain object-right"
                        priority
                    />
                </div>
            </div>
        </header>
    );
}