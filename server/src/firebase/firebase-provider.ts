import { ENTORNO, PRODUCCION } from '@/utils/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
import {URL_BUCKET_FIREBASE_DEV, URL_BUCKET_FIREBASE_PROD } from './constantsFirebase';

const pathBuscar = PRODUCCION ? 'firebase-credentials-prod.json' : 'firebase-credentials-dev.json';
let BUCKET_UTILIZAR = PRODUCCION ? URL_BUCKET_FIREBASE_PROD : URL_BUCKET_FIREBASE_DEV;

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

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: BUCKET_UTILIZAR,
    });
  },
};

export const FirebaseProvider = firebaseProvider;
