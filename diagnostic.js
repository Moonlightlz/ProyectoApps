#!/usr/bin/env node

/**
 * Script de diagnóstico para Pastelería D'Diego App
 * Ejecutar con: node diagnostic.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function checkCommand(command) {
  try {
    const result = execSync(`${command} --version`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim();
  } catch (error) {
    return null;
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  const color = exists ? colors.green : colors.red;
  log(`${status} ${description}: ${filePath}`, color);
  return exists;
}

function checkPackage(packageName) {
  const packagePath = path.join('node_modules', packageName);
  const exists = fs.existsSync(packagePath);
  const status = exists ? '✅' : '❌';
  const color = exists ? colors.green : colors.red;
  log(`${status} ${packageName}`, color);
  return exists;
}

console.log('🔍 Diagnóstico de Pastelería D\'Diego App\n');

// 1. Verificar herramientas del sistema
log('📋 Herramientas del Sistema:', colors.cyan);
const nodeVersion = checkCommand('node');
const npmVersion = checkCommand('npm');
const gitVersion = checkCommand('git');
const ionicVersion = checkCommand('ionic');
const javaVersion = checkCommand('java');

if (nodeVersion) log(`✅ Node.js: ${nodeVersion}`, colors.green);
else log('❌ Node.js: No encontrado', colors.red);

if (npmVersion) log(`✅ npm: ${npmVersion}`, colors.green);
else log('❌ npm: No encontrado', colors.red);

if (gitVersion) log(`✅ Git: ${gitVersion}`, colors.green);
else log('❌ Git: No encontrado', colors.red);

if (ionicVersion) log(`✅ Ionic CLI: ${ionicVersion}`, colors.green);
else log('❌ Ionic CLI: No encontrado (instalar con: npm install -g @ionic/cli)', colors.yellow);

if (javaVersion) log(`✅ Java: ${javaVersion}`, colors.green);
else log('⚠️  Java: No encontrado (requerido para Android)', colors.yellow);

// 2. Verificar archivos del proyecto
log('\n📁 Archivos del Proyecto:', colors.cyan);
checkFile('package.json', 'Configuración del proyecto');
checkFile('ionic.config.json', 'Configuración de Ionic');
checkFile('capacitor.config.ts', 'Configuración de Capacitor');
checkFile('src/main.ts', 'Archivo principal');
checkFile('angular.json', 'Configuración de Angular');

// 3. Verificar dependencias críticas
log('\n📦 Dependencias Críticas:', colors.cyan);
const criticalPackages = [
  '@ionic/angular',
  '@angular/core',
  '@capacitor/core',
  '@capacitor/cli',
  '@capacitor/camera',
  '@capacitor/filesystem',
  'firebase'
];

let missingPackages = [];
criticalPackages.forEach(pkg => {
  if (!checkPackage(pkg)) {
    missingPackages.push(pkg);
  }
});

// 4. Verificar configuración de Capacitor
log('\n⚡ Configuración de Capacitor:', colors.cyan);
try {
  const capacitorConfig = require('./capacitor.config.ts');
  log('✅ capacitor.config.ts se puede leer', colors.green);
} catch (error) {
  log('❌ Error leyendo capacitor.config.ts', colors.red);
}

checkFile('android/build.gradle', 'Proyecto Android');
checkFile('ios/App/App.xcodeproj', 'Proyecto iOS');

// 5. Verificar variables de entorno
log('\n🔧 Variables de Entorno:', colors.cyan);
const javaHome = process.env.JAVA_HOME;
if (javaHome) {
  log(`✅ JAVA_HOME: ${javaHome}`, colors.green);
} else {
  log('⚠️  JAVA_HOME: No configurado (requerido para Android)', colors.yellow);
}

// 6. Intentar comandos de diagnóstico
log('\n🏥 Diagnósticos Avanzados:', colors.cyan);

try {
  if (ionicVersion) {
    log('📊 Información de Ionic:', colors.blue);
    execSync('ionic info', { stdio: 'inherit' });
  }
} catch (error) {
  log('❌ Error ejecutando ionic info', colors.red);
}

try {
  log('\n🔍 Diagnóstico de Capacitor:', colors.blue);
  execSync('npx cap doctor', { stdio: 'inherit' });
} catch (error) {
  log('❌ Error ejecutando cap doctor', colors.red);
}

// 7. Recomendaciones
log('\n💡 Recomendaciones:', colors.cyan);

if (!nodeVersion || !npmVersion) {
  log('🔥 CRÍTICO: Instalar Node.js desde https://nodejs.org/', colors.red);
}

if (!ionicVersion) {
  log('📦 Instalar Ionic CLI: npm install -g @ionic/cli', colors.yellow);
}

if (missingPackages.length > 0) {
  log(`📦 Instalar dependencias faltantes: npm install ${missingPackages.join(' ')}`, colors.yellow);
}

if (!javaHome && !javaVersion) {
  log('☕ Para Android: Instalar Java 11+ y configurar JAVA_HOME', colors.yellow);
}

if (!fs.existsSync('node_modules')) {
  log('📦 Ejecutar: npm install', colors.yellow);
}

// 8. Comandos sugeridos para solucionar problemas
if (missingPackages.length > 0 || !fs.existsSync('node_modules')) {
  log('\n🔧 Comandos para Solucionar Problemas:', colors.cyan);
  log('rm -rf node_modules package-lock.json', colors.yellow);
  log('npm install', colors.yellow);
  if (missingPackages.length > 0) {
    log(`npm install ${missingPackages.join(' ')}`, colors.yellow);
  }
}

log('\n✨ Diagnóstico completado', colors.green);
log('📖 Para más ayuda, revisa README.md o QUICK-START.md', colors.blue);