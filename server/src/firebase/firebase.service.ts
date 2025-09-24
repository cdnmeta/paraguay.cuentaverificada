import { HttpException, Inject, Injectable } from '@nestjs/common';
import { app,auth } from 'firebase-admin';
Injectable();
export class FirebaseService {
  db: FirebaseFirestore.Firestore;
  storage: any;
  auth: auth.Auth;
  constructor(@Inject('FIREBASE_APP') private readonly firebaseApp: app.App) {
    this.db = firebaseApp.firestore();
    this.storage = firebaseApp.storage().bucket();
    this.auth = firebaseApp.auth();
  }

  async subirArchivoPrivado(
    buffer: Buffer,
    ruta: string,
    contentType = "application/octet-stream"
  ) {
    const archivoRef = this.storage.file(ruta);

  await archivoRef.save(buffer, {
    metadata: {
      contentType,
    },
  });

  return ruta; // solo retornás el path
};

  async createUser(userData: { email: string; password: string; displayName?: string,emailVerified?:boolean }) {
    try {
      const userRecord = await this.auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: userData.emailVerified ?? false,
      });
      return userRecord;
    } catch (error) {
      throw error;
    }
  }

  async eliminarArchivo(ruta: string): Promise<void> {
    try {
      const archivoRef = this.storage.file(ruta);
      await archivoRef.delete();
    } catch (error) {
      console.error('Error eliminando archivo de Firebase:', error);
      throw error;
    }
  }

  async verificarExistenciaArchivo(ruta: string): Promise<boolean> {
    try {
      const archivoRef = this.storage.file(ruta);
      const [exists] = await archivoRef.exists();
      return exists;
    } catch (error) {
      console.error('Error verificando existencia de archivo:', error);
      return false;
    }
  }

  verifyIdToken = async (token: string) => {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new HttpException('Token firebase inválido', 401);
    }
  };
}
