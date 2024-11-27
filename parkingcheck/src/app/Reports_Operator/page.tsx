"use client";

import { NavbarOperario } from '../components/NavBarOperario';
import { useEffect, useState } from 'react';

interface Report {
    _id: string;
    titulo: string;
    descripcion: string;
    usuarioID: string;
    fecha: string;
}

interface VipRequest {
    _id: string;
    user: string;
    tipo: string;
    servicio: string;
    mensaje: string;
    fechaEnvio: string;
    nombreUsuario: string;
    Estacionamiento?: {
      seccion?: string;
      numero?: string;
    };
  }
  

const ReportsOperatorPage = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [vipRequests, setVipRequests] = useState<VipRequest[]>([]);
    const [errorReports, setErrorReports] = useState<string | null>(null);
    const [errorVip, setErrorVip] = useState<string | null>(null);

    // Fetch reports
    const fetchReports = async () => {
        try {
            const response = await fetch("/api/show_Reports", { method: "POST" });
            if (!response.ok) throw new Error("Failed to fetch reports");
            const data = await response.json();
            setReports(data.reports);
        } catch (err: any) {
            setErrorReports(err.message);
        }
    };

    // Fetch VIP requests
    const fetchVipRequests = async () => {
        try {
            const response = await fetch("/api/auth/getVip", { method: "GET" });
            if (!response.ok) throw new Error("No se pudieron obtener las solicitudes VIP");
    
            const data = await response.json();
            setVipRequests(data.vipRequests);
        } catch (err: any) {
            setErrorVip(err.message);
        }
    };
    
    

    // Resolve VIP request
    const handleResolve = async (id: string, action: string) => {
        try {
            const response = await fetch(`/api/auth/updateVip`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action }),
            });
    
            if (!response.ok) {
                // Manejo de errores del servidor
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || "Error desconocido en el servidor");
            }
    
            const data = await response.json();
            alert(data.message);
    
            // Actualizar la lista de solicitudes
            await fetchVipRequests();
        } catch (err: any) {
            console.error("Error al resolver solicitud VIP:", err);
            setErrorVip(err.message);
        }
    };
    
    

    useEffect(() => {
        fetchReports();
        fetchVipRequests();
    }, []);


    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <NavbarOperario />

            {/* Reports */}
            <section className="mb-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Reportes Pendientes</h1>
                {errorReports ? (
                    <div className="text-red-600 text-center font-semibold">Error: {errorReports}</div>
                ) : (
                    <div className="space-y-6">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <div key={report._id} className="p-6 bg-white rounded-lg shadow-md">
                                    <h2 className="text-2xl font-semibold">{report.titulo}</h2>
                                    <p><strong>Usuario:</strong> {report.usuarioID}</p>
                                    <p><strong>Fecha:</strong> {new Date(report.fecha).toLocaleString()}</p>
                                    <p>{report.descripcion}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">No hay reportes pendientes.</p>
                        )}
                    </div>
                )}
            </section>

            {/* VIP Requests */}
            <section>
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Estacionamientos tomados y Solicitudes VIP</h1>
                {errorVip ? (
                    <div className="text-red-600 text-center font-semibold">Error: {errorVip}</div>
                ) : (
                    <div className="space-y-6">
                        {vipRequests.length > 0 ? (
                            vipRequests.map((request) => (
                                <div key={request._id} className="p-6 bg-white rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold">Usuario: {request.nombreUsuario}</h2>
                                    <p><strong>Servicio:</strong> {request.servicio}</p>
                                    <p><strong>Mensaje:</strong> {request.mensaje}</p>
                                    <p><strong>Fecha de Envío:</strong> {new Date(request.fechaEnvio).toLocaleString()}</p>
                                    {request.Estacionamiento && (
                                        <>
                                            <p><strong>Sección:</strong> {request.Estacionamiento.seccion}</p>
                                            <p><strong>Número:</strong> {request.Estacionamiento.numero}</p>
                                        </>
                                    )}
                                    <div className="mt-4 flex justify-end space-x-4">
                                        <button
                                            onClick={() => handleResolve(request._id, "solucionado")}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            Solucionado
                                        </button>
                                        <button
                                            onClick={() => handleResolve(request._id, "rechazado")}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Rechazado
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">No hay solicitudes VIP pendientes.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ReportsOperatorPage;