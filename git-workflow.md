# 🔄 Flujo de Trabajo Git Colaborativo

## Comandos Básicos Diarios

### 1. Crear nueva rama para trabajar
```bash
git checkout -b feature/nombre-funcionalidad
```

### 2. Verificar en qué rama estás
```bash
git branch
```

### 3. Cambiar de rama
```bash
git checkout nombre-rama
```

### 4. Actualizar rama main
```bash
git checkout main
git pull origin main
```

### 5. Actualizar tu rama con cambios de main
```bash
git checkout tu-rama
git merge main
```

### 6. Guardar cambios
```bash
git add .
git commit -m "tipo: descripción del cambio"
```

### 7. Subir rama al repositorio
```bash
git push origin tu-rama
```

### 8. Ver estado actual
```bash
git status
```

### 9. Ver historial de commits
```bash
git log --oneline
```

## Tipos de Commit (Conventional Commits)

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan funcionalidad)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

## Flujo Recomendado

1. **Antes de empezar a trabajar:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/mi-nueva-funcionalidad
   ```

2. **Durante el desarrollo:**
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad X"
   git push origin feature/mi-nueva-funcionalidad
   ```

3. **Antes de crear PR:**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/mi-nueva-funcionalidad
   git merge main
   # Resolver conflictos si los hay
   git push origin feature/mi-nueva-funcionalidad
   ```

4. **Crear Pull Request en GitHub**

5. **Después del merge:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/mi-nueva-funcionalidad
   ```

## ⚠️ Reglas Importantes

- ❌ **NUNCA** hagas `git push origin main` directamente
- ✅ **SIEMPRE** trabaja en ramas separadas
- ✅ **SIEMPRE** actualiza main antes de crear nueva rama
- ✅ **SIEMPRE** haz pull request para mergear a main
- ✅ **SIEMPRE** usa mensajes de commit descriptivos

## 🆘 Comandos de Emergencia

### Deshacer último commit (pero mantener cambios)
```bash
git reset --soft HEAD~1
```

### Ver diferencias antes de commit
```bash
git diff
```

### Guardar cambios temporalmente
```bash
git stash
git stash pop
```

### Ver ramas remotas
```bash
git branch -r
```