import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FirebaseAdmin = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FirebaseAdmin,
  useFactory: () => {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    return admin.app();
  },
};

