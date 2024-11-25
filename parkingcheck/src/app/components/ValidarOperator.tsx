'use client';
import React, { useState } from "react";

export const ValidarOperador = () => {
    const [vehiculo, setVehiculo] = useState(null);
    const [error, setError] = useState("");

    const handleFetchVehiculo = async (e) => {
        e.preventDefault(); // Evitar que el formulario recargue la página
        setError(""); // Limpiar errores previos

        const placa = e.target.Placa.value;

        if (!placa) {
            setError("Por favor ingrese una placa válida.");
            return;
        }

        try {
            const response = await fetch(`https://api.example.com/vehiculos?placa=${placa}`); // URL de tu API
            if (!response.ok) {
                throw new Error("Vehículo no encontrado.");
            }

            const data = await response.json();
            setVehiculo(data);
        } catch (err) {
            setVehiculo(null);
            setError(err.message || "Error al obtener los datos del vehículo.");
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleFetchVehiculo}>
                <input 
                    type="text" 
                    name="Placa" 
                    id="Placa" 
                    placeholder="Ingrese la placa del vehículo" 
                    required 
                />
                <div className="w-[90%] font-bold p-3 text-lg mt-5 border-0 rounded-full cursor-pointer bg-[#D9D9D9] text-black">
                    <button 
                        className="relative w-full flex justify-center items-center" 
                        type="submit"
                    >
                        Validar
                    </button>
                </div>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            {vehiculo && (
                <div className="mt-5">
                    <h2 className="font-bold text-lg">Datos del Vehículo:</h2>
                    <p><strong>Placa:</strong> {vehiculo.placa}</p>
                    <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                    {vehiculo.imagen && (
                        <img 
                            src={vehiculo.imagen} 
                            alt={`Imagen de ${vehiculo.modelo}`} 
                            className="mt-3 w-full max-w-sm" 
                        />
                    )}
                </div>
            )}
        </div>
    );
};
