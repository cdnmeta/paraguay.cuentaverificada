import { PRODUCCION } from '@/utils/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { config } from 'process';

const pathBuscar = PRODUCCION ? 'firebase-credentials-prod.json' : 'firebase-credentials-dev.json';


export const firebaseCredentialPath = path.join(
  process.cwd(),
  pathBuscar,
);

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  useFactory: async (configService: ConfigService) => {
    console.log('firebaseCredentialPath', firebaseCredentialPath);
    let BUCKET_UTILIZAR = configService.get<string>('URL_BUCKET_FIREBASE'); 
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
  inject: [ConfigService],
};

export const FirebaseProvider = firebaseProvider;
