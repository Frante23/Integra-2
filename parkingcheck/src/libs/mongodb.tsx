import mongoose from 'mongoose';

const uri = process.env.CLUSTER;

let isConnected: boolean = false; 

export async function run() {
  if (isConnected) {
    console.log('Reutilizando la conexión existente con MongoDB');
    return mongoose; 
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: "ParkingCheck", 
    });
      
    isConnected = true;
    console.log('Conectado a MongoDB');
    return mongoose;
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    throw error; 
  }
}
