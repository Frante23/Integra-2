import mongoose, { Schema, Document } from 'mongoose';

export interface INotificacion extends Document {
  user: mongoose.Schema.Types.ObjectId;                // ID del usuario
  tipo: string;                                        // Tipo de la notificación (e.g., "solicitud")
  servicio: string;                                    // Servicio solicitado por el usuario
  mensaje: string;                                     // Mensaje asociado a la notificación
  fechaEnvio: Date;                                    // Fecha de envío de la notificación
  nombreUsuario: string;                               // Nombre del usuario que solicita el servicio
  Estacionamiento?: {                                  
    seccion: string;
    numero: string;
  };
}

const notificacionSchema = new Schema<INotificacion>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, required: true },
    servicio: { type: String, required: true },
    mensaje: { type: String, required: true },
    fechaEnvio: { type: Date, default: Date.now, required: true },
    nombreUsuario: { type: String, required: true },
    Estacionamiento: {
      seccion: { type: String },
      numero: { type: String },
    },
  },
  {
    collection: 'Notificaciones',
    timestamps: true,
  }
);

const Notificacion =
  mongoose.models.Notificacion || mongoose.model<INotificacion>('Notificacion', notificacionSchema);

export default Notificacion;
