import { Module } from '@nestjs/common';
import { FirebaseProvider } from './firebase-provider';
import { FirebaseService } from './firebase.service';

@Module({
    providers: [FirebaseProvider, FirebaseService],
    exports: [FirebaseProvider, FirebaseService],
})
export class FirebaseModule {}
