#!/usr/bin/env node

/**
 * Script de configuración automática para Pastelería D'Diego App
 * Ejecutar con: node setup.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍰 Configurando Pastelería D\'Diego App...\n');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function runCommand(command, description) {
  log(`\n📦 ${description}...`, colors.blue);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completado`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Error en: ${description}`, colors.red);
    log(`Comando: ${command}`, colors.yellow);
    return false;
  }
}

function checkPrerequisites() {
  log('🔍 Verificando prerrequisitos...', colors.cyan);
  
  const checks = [
    { cmd: 'node', name: 'Node.js', required: true },
    { cmd: 'npm', name: 'npm', required: true },
    { cmd: 'git', name: 'Git', required: true },
    { cmd: 'java', name: 'Java', required: false },
    { cmd: 'ionic', name: 'Ionic CLI', required: false }
  ];

  let allRequired = true;
  let suggestions = [];

  checks.forEach(check => {
    const installed = checkCommand(check.cmd);
    const status = installed ? '✅' : '❌';
    const color = installed ? colors.green : (check.required ? colors.red : colors.yellow);
    
    log(`${status} ${check.name}`, color);
    
    if (!installed && check.required) {
      allRequired = false;
    }
    
    if (!installed) {
      switch (check.cmd) {
        case 'node':
          suggestions.push('Instala Node.js desde: https://nodejs.org/');
          break;
        case 'git':
          suggestions.push('Instala Git desde: https://git-scm.com/');
          break;
        case 'java':
          suggestions.push('Instala Java 11+ desde: https://adoptium.net/ (requerido para Android)');
          break;
        case 'ionic':
          suggestions.push('Se instalará automáticamente: npm install -g @ionic/cli');
          break;
      }
    }
  });

  if (!allRequired) {
    log('\n❌ Faltan prerrequisitos obligatorios:', colors.red);
    suggestions.forEach(suggestion => log(`   ${suggestion}`, colors.yellow));
    process.exit(1);
  }

  if (suggestions.length > 0) {
    log('\n⚠️  Recomendaciones:', colors.yellow);
    suggestions.forEach(suggestion => log(`   ${suggestion}`, colors.yellow));
  }

  return true;
}

function installDependencies() {
  log('\n🚀 Iniciando instalación...', colors.magenta);

  // Verificar si Ionic CLI está instalado globalmente
  if (!checkCommand('ionic')) {
    if (!runCommand('npm install -g @ionic/cli', 'Instalando Ionic CLI globalmente')) {
      log('⚠️  No se pudo instalar Ionic CLI globalmente. Continuando...', colors.yellow);
    }
  }

  // Instalar dependencias del proyecto
  if (!runCommand('npm install', 'Instalando dependencias del proyecto')) {
    log('❌ Error instalando dependencias. Intentando limpiar caché...', colors.red);
    
    // Limpiar e intentar de nuevo
    runCommand('npm cache clean --force', 'Limpiando caché de npm');
    
    if (fs.existsSync('node_modules')) {
      log('🗑️  Eliminando node_modules...', colors.yellow);
      fs.rmSync('node_modules', { recursive: true, force: true });
    }
    
    if (fs.existsSync('package-lock.json')) {
      log('🗑️  Eliminando package-lock.json...', colors.yellow);
      fs.unlinkSync('package-lock.json');
    }
    
    if (!runCommand('npm install', 'Reinstalando dependencias')) {
      log('❌ No se pudieron instalar las dependencias', colors.red);
      process.exit(1);
    }
  }

  // Verificar que los módulos de Capacitor están instalados
  const capacitorModules = ['@capacitor/core', '@capacitor/cli', '@capacitor/camera', '@capacitor/filesystem'];
  const missingModules = [];

  capacitorModules.forEach(module => {
    if (!fs.existsSync(path.join('node_modules', module))) {
      missingModules.push(module);
    }
  });

  if (missingModules.length > 0) {
    log(`\n📦 Instalando módulos faltantes de Capacitor: ${missingModules.join(', ')}`, colors.blue);
    runCommand(`npm install ${missingModules.join(' ')}`, 'Instalando módulos de Capacitor');
  }
}

function runDiagnostics() {
  log('\n🔍 Ejecutando diagnósticos...', colors.cyan);
  
  // Información de Ionic
  if (checkCommand('ionic')) {
    runCommand('ionic info', 'Información del entorno Ionic');
  }
  
  // Diagnóstico de Capacitor
  if (checkCommand('npx')) {
    runCommand('npx cap doctor', 'Diagnóstico de Capacitor');
  }
}

function createLocalConfig() {
  log('\n⚙️  Creando configuración local...', colors.blue);
  
  // Crear archivo .env de ejemplo si no existe
  const envExample = `# Configuración de Firebase
# Solicitar estas credenciales al desarrollador principal

FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Configuración de desarrollo
IONIC_ENV=development
`;

  if (!fs.existsSync('.env.example')) {
    fs.writeFileSync('.env.example', envExample);
    log('✅ Creado .env.example', colors.green);
  }

  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envExample);
    log('✅ Creado .env (recuerda configurar las credenciales reales)', colors.yellow);
  }
}

function showNextSteps() {
  log('\n🎉 ¡Configuración completada!', colors.green);
  log('\n📋 Próximos pasos:', colors.cyan);
  log('   1. Configura las credenciales de Firebase en el archivo .env', colors.reset);
  log('   2. Para desarrollo web: ionic serve', colors.reset);
  log('   3. Para Android: ionic capacitor add android', colors.reset);
  log('   4. Para iOS: ionic capacitor add ios (solo Mac)', colors.reset);
  log('\n📚 Documentación completa en README.md', colors.blue);
  log('❓ ¿Problemas? Revisa la sección "Problemas Conocidos" en README.md', colors.yellow);
}

// Ejecutar configuración
async function main() {
  try {
    checkPrerequisites();
    installDependencies();
    createLocalConfig();
    runDiagnostics();
    showNextSteps();
  } catch (error) {
    log(`\n❌ Error durante la configuración: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();