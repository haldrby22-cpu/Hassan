import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farshout.talabat',
  appName: 'طلبات فرشوط',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
