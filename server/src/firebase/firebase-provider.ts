import { PRODUCCION } from '@/utils/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

const pathBuscar = PRODUCCION ? 'firebase-credentials-prod.json' : 'firebase-credentials-dev.json';
let BUCKET_UTILIZAR = process.env.URL_BUCKET_FIREBASE || '';

export const firebaseCredentialPath = path.join(
  process.cwd(),
  pathBuscar,
);

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  useFactory: async (configService: ConfigService) => {
    console.log('firebaseCredentialPath', firebaseCredentialPath);
    const serviceAccount = firebaseCredentialPath;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined');
    }

    if(!BUCKET_UTILIZAR || BUCKET_UTILIZAR.length === 0){
      throw new Error('URL_BUCKET_FIREBASE is not defined');
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: BUCKET_UTILIZAR,
    });
  },
};

export const FirebaseProvider = firebaseProvider;
