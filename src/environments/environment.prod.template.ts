// Template para environment de producción
// Copia este archivo a environment.prod.ts y reemplaza los valores
// NUNCA commitees environment.prod.ts con datos reales

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
  }
};