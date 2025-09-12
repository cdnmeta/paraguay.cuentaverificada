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

  verifyIdToken = async (token: string) => {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new HttpException('Token firebase inválido', 401);
    }
  };
}
