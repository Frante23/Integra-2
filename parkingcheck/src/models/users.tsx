import mongoose, { Schema, Document } from 'mongoose';
import { vehicleSchema, IVehicle } from './vehicle';

export interface IUser extends Document {
  UserName: string;
  UserEmail: string;
  UserPass: string;
  Vehiculos?: IVehicle[]; 
  url: string;
  vip: boolean;
  incumplimientos: number; 
  penalizadoHasta?: Date; 
}

// Definición del esquema del usuario
const userSchema = new Schema<IUser>({
  UserName: { type: String, required: true },
  UserEmail: { type: String, required: true, unique: true },
  UserPass: { type: String, required: true },
  Vehiculos: [vehicleSchema],
  url: {type: String, required: false},
  vip: {type: Boolean, required: false, default: false},
  incumplimientos: { type: Number, default: 0 },
  penalizadoHasta: { type: Date, default: null },
}, {
  collection: 'usuarios',
  timestamps: true,
});


const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 

export default User;