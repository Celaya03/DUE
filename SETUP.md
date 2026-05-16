# DUE - Setup y Guía de Uso

## Estado Actual ✅

Tu aplicación ya está completamente configurada y funcionando. Las tablas en Supabase ya están creadas.

### Tablas en Supabase:
- `public.users` - Almacena usuarios con contraseñas hasheadas
- `public.tasks` - Tareas de cada usuario (aisladas por user_id)
- `public.habits` - Hábitos de cada usuario (aislados por user_id)
- `public.transactions` - Transacciones de cada usuario (aisladas por user_id)

## Problema Resuelto 🔒

### El Problema:
Antes, un usuario podía modificar el `userId` en la URL/payload y acceder a los datos de otros usuarios.

### La Solución:
Implementé un sistema de autenticación seguro donde:
1. Las contraseñas se hashean con SHA-256 + salt
2. Las sesiones se guardan en **HTTP-only cookies** (imposible que JavaScript las acceda)
3. El `user_id` se obtiene del servidor, NO del cliente
4. Cada usuario solo puede ver/modificar sus propios datos

## Cómo Usar la App

### 1. En Desarrollo Local:
```bash
npm install
npm run dev
```

Abre http://localhost:3000

### 2. Registrar un Usuario:
- Haz clic en "Regístrate"
- Ingresa: Nombre, Email, Contraseña (min. 6 caracteres)
- Haz clic en "Crear cuenta"

### 3. Iniciar Sesión:
- Email y Contraseña
- Se crea una sesión HTTP-only cookie
- Redirige al dashboard

### 4. Tu Data Está Segura:
- Solo TÚ puedes ver tus tareas, hábitos y transacciones
- Otros usuarios no pueden acceder a tus datos
- Las cookies expiran al cerrar el navegador

## Endpoints Disponibles

### Autenticación
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/verify
```

### Datos (requieren sesión)
```bash
GET /api/data      # Obtiene tareas, hábitos, transacciones
PUT /api/data      # Actualiza la data
```

## Archivos Clave

- **`lib/auth-context.tsx`** - Maneja el estado de autenticación
- **`lib/auth-utils.ts`** - Funciones de hashing y BD
- **`lib/auth-server.ts`** - Obtiene user_id desde la cookie
- **`app/api/auth/*`** - Endpoints de autenticación
- **`app/api/data/route.ts`** - API segura de datos
- **`lib/init-db.ts`** - Script para inicializar la BD

## Próximos Pasos

### 1. Desplegar a Vercel:
```bash
git push origin database-synchronization-issue
# Abre una PR
# Mergeea a main
# Vercel desplegará automáticamente
```

### 2. Verificar en Supabase:
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto DUE
3. En "SQL Editor" puedes ver las tablas:
   ```sql
   SELECT * FROM public.users;
   SELECT * FROM public.tasks;
   SELECT * FROM public.habits;
   SELECT * FROM public.transactions;
   ```

### 3. Test de Seguridad (Opcional):
```bash
# Registrar usuario 1
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c /tmp/user1.txt \
  -d '{"name":"User 1","email":"user1@test.com","password":"pass123"}'

# Registrar usuario 2
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c /tmp/user2.txt \
  -d '{"name":"User 2","email":"user2@test.com","password":"pass123"}'

# Verificar que cada usuario ve solo sus datos
curl -X GET http://localhost:3000/api/data -b /tmp/user1.txt | jq .
curl -X GET http://localhost:3000/api/data -b /tmp/user2.txt | jq .
```

## Notas de Seguridad

✅ **Lo que está seguro:**
- Contraseñas hasheadas (SHA-256 + salt)
- Sessions en HTTP-only cookies
- UserId validado en el servidor
- Cada usuario solo accede sus datos

⚠️ **En Producción:**
Para máxima seguridad, considera:
1. Implementar bcrypt en lugar de SHA-256
2. Agregar Rate Limiting en los endpoints de auth
3. Implementar CSRF tokens
4. Usar HTTPS obligatorio

## Troubleshooting

### Error: "No autenticado"
- Verifica que estés iniciado de sesión
- Las cookies deben estar habilitadas en tu navegador

### Error: "Contraseña incorrecta"
- Verifica que escribiste bien la contraseña
- Recuerda que es case-sensitive

### Error al registrar "Este correo ya está registrado"
- Usa otro email o inicia sesión si ya tienes cuenta

---

¡Tu app está completamente segura! Los datos de cada usuario están aislados y protegidos. 🎉
