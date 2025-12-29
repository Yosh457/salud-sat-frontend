import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      {/* Tarjeta de Login usando componentes de Shadcn */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-700">SAT Salud</CardTitle>
          <CardDescription>
            Sistema de Asistencia Técnica - Alto Hospicio
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rut">RUT Funcionario</Label>
            <Input id="rut" type="text" placeholder="12.345.678-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••" />
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Ingresar al Sistema
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-sm text-gray-500">
        © 2025 Unidad de TICs - Departamento de Salud
      </p>
    </main>
  );
}