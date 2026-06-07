import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.theexchange.app',
  appName: 'The Exchange',
  webDir: 'public',
  server: {
      url: 'https://the-exchange-backup--studio-3125423928-66163.europe-west4.hosted.app',
      cleartext: false
      }
};

export default config;
