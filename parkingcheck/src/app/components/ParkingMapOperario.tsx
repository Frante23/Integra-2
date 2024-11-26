"use client";

import React, { useEffect, useState } from "react";

interface ParkingSpot {
  section: string;
  number: string;
  id: string;
}

const ParkingMapOperario = () => {
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    const fetchEstacionamientos = async () => {
      try {
        const responseParking = await fetch("/api/Get_Parking", { method: "GET" });
        if (!responseParking.ok) throw new Error(`Error HTTP: ${responseParking.status}`);
        const dataParking = await responseParking.json();
        setOcupados(dataParking.estacionamientos.Park || []);
      } catch (error) {
        console.error("Error al obtener los estacionamientos ocupados:", error);
      }
    };

    const fetchReservas = async () => {
      try {
        const responseReservas = await fetch("/api/reservas", { method: "GET" });
        if (!responseReservas.ok) throw new Error(`Error HTTP: ${responseReservas.status}`);
        const dataReservas = await responseReservas.json();
        setReservas(dataReservas);
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    };

    fetchEstacionamientos();
    fetchReservas();
  }, []);

  const isReserved = (spotId: string) => ocupados.includes(spotId);

  const getReservationInfo = (spotId: string) => {
    const reserva = reservas.find((reserva) => reserva.numero === spotId);
    return reserva
      ? `Usuario: ${reserva.id_usuario}, Fecha Reserva: ${new Date(reserva.fechaReserva).toLocaleString()}`
      : "Libre";
  };

  const ParkingSpot = ({ id, specialHeight }: { id: string; specialHeight?: string }) => (
    <div
      className={`parking-spot ${isReserved(id) ? "reserved" : ""}`}
      style={{
        height: specialHeight || "auto",
        border: "1px solid #ccc",
        margin: "5px",
        textAlign: "center",
        backgroundColor: isReserved(id) ? "red" : "green", // Rojo si está ocupado, verde si está libre
        color: "white",
        position: "relative",
      }}
    >
      {id}
      <div
        className="tooltip"
        style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#333",
          color: "#fff",
          padding: "5px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          zIndex: 10,
          visibility: "visible",
        }}
      >
        {getReservationInfo(id)}
      </div>
    </div>
  );

  return (
    <div className="centralReserve">
      <div className="parking-map">
        <div className="row">
          <div className="parking-lane" id="A">
            {Array.from({ length: 13 }, (_, i) => (
              <ParkingSpot key={`A-${i + 1}`} id={`A-${i + 1}`} specialHeight="5.6%" />
            ))}
          </div>
          <div className="empty-space"></div>
          <div className="parking-lane" id="B">
            {Array.from({ length: 13 }, (_, i) => (
              <ParkingSpot key={`B-${i + 1}`} id={`B-${i + 1}`} specialHeight="5.6%" />
            ))}
          </div>
          <div className="parking-lane" id="C">
            {Array.from({ length: 13 }, (_, i) => (
              <ParkingSpot key={`C-${i + 1}`} id={`C-${i + 1}`} specialHeight="5.6%" />
            ))}
          </div>
          <div className="empty-space"></div>
          <div className="parking-lane" id="D">
            {Array.from({ length: 11 }, (_, i) => (
              <ParkingSpot key={`D-${i + 1}`} id={`D-${i + 1}`} specialHeight="6.6%" />
            ))}
          </div>
          <div className="parking-lane" id="E">
            {Array.from({ length: 11 }, (_, i) => (
              <ParkingSpot key={`E-${i + 1}`} id={`E-${i + 1}`} specialHeight="6.6%" />
            ))}
          </div>
          <div className="empty-space"></div>
          <div className="parking-lane" id="F">
            {Array.from({ length: 13 }, (_, i) => (
              <ParkingSpot key={`F-${i + 1}`} id={`F-${i + 1}`} specialHeight="5.6%" />
            ))}
          </div>
          <div className="parking-lane" id="G">
            {Array.from({ length: 13 }, (_, i) => (
              <ParkingSpot key={`G-${i + 1}`} id={`G-${i + 1}`} specialHeight="5.6%" />
            ))}
          </div>
          <div className="empty-space"></div>
          <div className="parking-lane" id="H">
            {Array.from({ length: 12 }, (_, i) => (
              <ParkingSpot key={`H-${i + 1}`} id={`H-${i + 1}`} specialHeight="6.2%" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingMapOperario;
