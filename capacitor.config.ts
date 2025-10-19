import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pasteleria.diego',
  appName: 'Pastelería D\'Diego',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ff6b9d",
      showSpinner: false
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#ff6b9d"
    }
  }
};

export default config;
