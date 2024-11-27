"use client";

import React, { useEffect, useState } from "react";

const ParkingMap = ({ isVip }: { isVip: boolean }) => {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [occupiedSpots, setOccupiedSpots] = useState<string[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false); 
  const [dateTime, setDateTime] = useState<string>("");

  const allSpots = [
    ...Array.from({ length: 13 }, (_, i) => `A-${i + 1}`),
    ...Array.from({ length: 13 }, (_, i) => `B-${i + 1}`),
    ...Array.from({ length: 13 }, (_, i) => `C-${i + 1}`),
    ...Array.from({ length: 11 }, (_, i) => `D-${i + 1}`),
    ...Array.from({ length: 11 }, (_, i) => `E-${i + 1}`),
    ...Array.from({ length: 13 }, (_, i) => `F-${i + 1}`),
    ...Array.from({ length: 13 }, (_, i) => `G-${i + 1}`),
    ...Array.from({ length: 12 }, (_, i) => `H-${i + 1}`),
  ];
  
  const getRandomSpot = () => {
    return allSpots[Math.floor(Math.random() * allSpots.length)];
  };
  useEffect(() => {
    const storedSpot = localStorage.getItem("selectedSpot");

    if (storedSpot) {
      setSelectedSpot(storedSpot);
    } else if (!isVip) {
      const randomSpot = getRandomSpot();
      setSelectedSpot(randomSpot);
      localStorage.setItem("selectedSpot", randomSpot);

    }
  }, [isVip]);

  useEffect(() => {
    const fetchOccupiedSpots = async () => {
      try {
        const response = await fetch("/api/auth/reserva");
        const data = await response.json();
        if (response.ok) {
          setOccupiedSpots(data.estacionamientos.Park);
        }
      } catch (error) {
        console.error("Error fetching occupied spots:", error);
      }
    };

    fetchOccupiedSpots();
  }, []);



  const handleSpotClick = (spotId: string) => {
    if (isVip) {
      const newSpot = selectedSpot === spotId ? null : spotId;
      setSelectedSpot(newSpot);

      if (newSpot) {
        localStorage.setItem("selectedSpot", newSpot);
      } else {
        localStorage.removeItem("selectedSpot");
      }
    }
  };

  const handleFormSubmit = async () => {
    if (!selectedSpot || !dateTime) {
      alert("Debe seleccionar un estacionamiento y una fecha/hora.");
      return;
    }

    try {
      const response = await fetch("/api/auth/reserva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Park: selectedSpot,
          DateTime: dateTime,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Reserva confirmada");
        setShowForm(false);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      alert("Error al realizar la solicitud.");
    }
  };




  const ParkingSpot = ({ id, specialHeight }: { id: string; specialHeight?: string }) => (
    <div
      className={`parking-spot ${selectedSpot === id ? "selected" : ""} ${
        occupiedSpots.includes(id) ? "used" : ""
      }`}
      onClick={() => handleSpotClick(id)}
      style={{
        position: "relative",
        height: specialHeight || "auto",
        border: "1px solid #ccc",
        margin: "5px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      {id}
    </div>
  );

  const reserveParkingSpot = async (spot: string) => {
    if (!spot) return;
  
    try {
      const response = await fetch("/api/auth/reserva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Park: spot }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log("Estacionamiento reservado:", data.park);
      } else {
        if (data.status === "occupied") {
          if (!isVip) {
            alert("Estacionamiento ocupado");
             const randomSpot = getRandomSpot();
            setSelectedSpot(randomSpot);
            localStorage.setItem("selectedSpot", randomSpot);
          } else {
            alert("Estacionamiento ocupado");
          }
        } else {
          console.error("Error reservando estacionamiento:", data.message);
          if (!isVip) {
            const newRandomSpot = getRandomSpot();
            setSelectedSpot(newRandomSpot);
            localStorage.setItem("selectedSpot", newRandomSpot);
          }
        }
      }
    }catch (error) {
      console.error("Error al conectar con la API:", error);
    }
  };
  

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
      {selectedSpot && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Confirmar Selección
          </button>
        </div>
      )}

      {showForm && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <h3 style={{ textAlign: "center", color: "#333" }}>Confirmar Reserva</h3>
          <p style={{ textAlign: "center", marginBottom: "10px", color: "#555" }}>
            Estacionamiento seleccionado: <strong>{selectedSpot}</strong>
          </p>
          <label style={{ display: "block", marginBottom: "10px", color: "#555" }}>
            Fecha y hora:
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </label>
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button
              onClick={handleFormSubmit}
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                marginRight: "10px",
                cursor: "pointer",
              }}
            >
              Reservar
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;