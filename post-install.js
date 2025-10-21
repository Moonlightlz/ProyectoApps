#!/usr/bin/env node

/**
 * Script de verificación post-instalación
 * Se ejecuta automáticamente después de npm install
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Dependencias críticas que deben estar presentes
const criticalDependencies = [
  '@capacitor/core',
  '@capacitor/cli', 
  '@capacitor/camera',
  '@capacitor/filesystem',
  '@capacitor/app',
  '@capacitor/haptics',
  '@capacitor/keyboard',
  '@capacitor/status-bar',
  '@ionic/angular',
  '@angular/core',
  'firebase'
];

console.log('\n🔍 Verificando instalación post-npm install...\n');

let missingDependencies = [];
let hasErrors = false;

// Verificar cada dependencia crítica
criticalDependencies.forEach(dep => {
  const depPath = path.join('node_modules', dep);
  if (fs.existsSync(depPath)) {
    log(`✅ ${dep}`, colors.green);
  } else {
    log(`❌ ${dep} - FALTANTE`, colors.red);
    missingDependencies.push(dep);
    hasErrors = true;
  }
});

// Si hay dependencias faltantes, intentar instalarlas
if (missingDependencies.length > 0) {
  log(`\n⚠️  Encontradas ${missingDependencies.length} dependencias faltantes`, colors.yellow);
  log('🔧 Intentando instalar dependencias faltantes...', colors.blue);
  
  try {
    const installCommand = `npm install ${missingDependencies.join(' ')}`;
    log(`Ejecutando: ${installCommand}`, colors.cyan);
    execSync(installCommand, { stdio: 'inherit' });
    
    log('\n✅ Dependencias faltantes instaladas exitosamente', colors.green);
    hasErrors = false;
  } catch (error) {
    log('\n❌ Error instalando dependencias faltantes', colors.red);
    log('Por favor ejecuta manualmente:', colors.yellow);
    log(`npm install ${missingDependencies.join(' ')}`, colors.cyan);
    hasErrors = true;
  }
}

// Verificar archivos de configuración críticos
const criticalFiles = [
  'ionic.config.json',
  'capacitor.config.ts',
  'angular.json',
  'src/main.ts'
];

log('\n📁 Verificando archivos de configuración:', colors.cyan);
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log(`✅ ${file}`, colors.green);
  } else {
    log(`❌ ${file} - FALTANTE`, colors.red);
    hasErrors = true;
  }
});

// Resultado final
if (!hasErrors) {
  log('\n🎉 ¡Instalación verificada correctamente!', colors.green);
  log('✨ El proyecto está listo para usar', colors.blue);
  log('\n📝 Próximos pasos:', colors.cyan);
  log('   • Para desarrollo: ionic serve', colors.reset);
  log('   • Para diagnóstico: npm run doctor', colors.reset);
  log('   • Para ayuda: ver README.md', colors.reset);
} else {
  log('\n⚠️  Se encontraron problemas en la instalación', colors.yellow);
  log('🔧 Comandos sugeridos para solucionarlo:', colors.blue);
  log('   npm run fix', colors.cyan);
  log('   npm run doctor', colors.cyan);
  log('   node setup.js', colors.cyan);
}

console.log(''); // Línea en blanco final