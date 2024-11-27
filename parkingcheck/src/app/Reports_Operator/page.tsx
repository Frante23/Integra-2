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

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = async () => {
        try {
            const response = await fetch("/api/show_Reports", { method: "POST" });
            if (!response.ok) {
                throw new Error("Failed to fetch reports");
            }

            const text = await response.text();
            const data = JSON.parse(text);
            setReports(data.reports);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {}
            <NavbarOperario />

            {}
            <div className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Reportes Pendientes
                </h1>
                {error ? (
                    <div className="text-red-600 text-center font-semibold">
                        Error: {error}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <div
                                    key={report._id}
                                    className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {report.titulo}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        <strong>Usuario ID:</strong> {report.usuarioID}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        <strong>Fecha:</strong>{" "}
                                        {new Date(report.fecha).toLocaleString()}
                                    </p>
                                    <p className="mt-4 text-gray-700">
                                        <strong>Descripción:</strong> {report.descripcion}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">
                                No hay reportes por solucionar.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
