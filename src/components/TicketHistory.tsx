import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistorialItem {
    id: number;
    accion: string;
    detalle: string;
    fecha: string;
    usuario: string; // Nombre del quien hizo la acción
}

interface TicketHistoryProps {
    historial: HistorialItem[];
}

export function TicketHistory({ historial }: TicketHistoryProps) {

    // Si no hay historial, no mostramos nada (o un mensaje vacío)
    if (!historial || historial.length === 0) return null;

    // Helper para iconos y colores según la acción
    const getActionStyle = (accion: string) => {
        switch (accion) {
            case 'CREADO': return { icon: '✨', color: 'bg-blue-100 text-blue-600 border-blue-200' };
            case 'ASIGNADO': return { icon: '👤', color: 'bg-purple-100 text-purple-600 border-purple-200' };
            case 'ACTUALIZADO': return { icon: '🔄', color: 'bg-orange-100 text-orange-600 border-orange-200' };
            case 'EVIDENCIA': return { icon: '📎', color: 'bg-gray-100 text-gray-600 border-gray-200' };
            case 'RESUELTO': return { icon: '✅', color: 'bg-green-100 text-green-600 border-green-200' };
            default: return { icon: '📝', color: 'bg-slate-100 text-slate-600 border-slate-200' };
        }
    };

    return (
        <Card className="mt-6 border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                    ⏳ Historial de Actividad
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-2">
                    {historial.map((h, index) => {
                        const style = getActionStyle(h.accion);
                        return (
                            <div key={h.id || index} className="relative pl-8">
                                {/* Icono circular en la línea de tiempo */}
                                <span className={`absolute -left-[13px] top-0 h-7 w-7 rounded-full border-2 flex items-center justify-center text-sm shadow-sm ${style.color} bg-white`}>
                                    {style.icon}
                                </span>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 bg-white p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            {h.accion}
                                        </p>
                                        <p className="text-sm text-slate-600 mt-1">{h.detalle}</p>
                                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                            <span>Realizado por:</span>
                                            <span className="font-medium text-slate-600">{h.usuario || "Sistema"}</span>
                                        </p>
                                    </div>
                                    <time className="text-xs text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                        {new Date(h.fecha).toLocaleString("es-CL", {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </time>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}