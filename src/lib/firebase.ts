import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

// Initialize Firebase App
const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId from the config
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Successfully connected to Firestore');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    } else {
      console.log("Firestore connection initialized successfully");
    }
  }
}
testConnection();

export interface CustomerAccount {
  name: string;
  phone: string;
  address: string;
}

/**
 * Save customer account to Firestore
 */
export async function saveCustomerToFirebase(customer: CustomerAccount): Promise<void> {
  const docRef = doc(db, 'customers', customer.phone);
  await setDoc(docRef, {
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Get customer account from Firestore by phone number
 */
export async function getCustomerFromFirebase(phone: string): Promise<CustomerAccount | null> {
  const docRef = doc(db, 'customers', phone);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      name: data.name,
      phone: data.phone,
      address: data.address
    };
  }
  return null;
}
