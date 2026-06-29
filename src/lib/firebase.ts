export interface CustomerAccount {
  name: string;
  phone: string;
  address: string;
}

// Validate Connection to our Backend and Firebase on startup
async function testConnection() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      if (data.databaseConnected) {
        console.log('Successfully connected to Firestore via Backend Service Account.');
      } else {
        console.warn('Backend is online but Firebase Admin SDK is not fully initialized.');
      }
    } else {
      console.error('Backend connection failed with status:', res.status);
    }
  } catch (error) {
    console.error('Failed to communicate with fullstack backend server.', error);
  }
}
testConnection();

/**
 * Save customer account to Firestore via Backend Proxy
 */
export async function saveCustomerToFirebase(customer: CustomerAccount): Promise<void> {
  const res = await fetch('/api/customers/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customer)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to save customer profile');
  }
}

/**
 * Get customer account from Firestore by phone number via Backend Proxy
 */
export async function getCustomerFromFirebase(phone: string): Promise<CustomerAccount | null> {
  const res = await fetch('/api/customers/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch customer profile');
  }

  const data = await res.json();
  if (data) {
    return {
      name: data.name,
      phone: data.phone,
      address: data.address
    };
  }
  return null;
}

/**
 * Send OTP to the customer via SMS or WhatsApp gateway on Backend
 */
export async function sendOtpToCustomer(phone: string, code: string, name: string, address: string): Promise<{ success: boolean; simulated?: boolean; message?: string }> {
  const res = await fetch('/api/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone, code, name, address })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to send OTP message');
  }

  return await res.json();
}
