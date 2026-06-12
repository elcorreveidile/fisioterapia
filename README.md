# Eje Fisioterapia — Demo web para clínicas de fisioterapia

**[Inferencial]** Clínica ficticia creada como pieza de portfolio para Por 2 Duros. No es un negocio real: todos los datos (personas, direcciones, colegiados, teléfonos) son inventados.

## Características

- **Motor de reservas** con disponibilidad en tiempo real
- **Anti-solapamiento** garantizado a nivel de base de datos (exclusion constraint)
- **Pautas de ejercicios** para pacientes (acceso tokenizado sin login)
- **Bonos** de 5 y 10 sesiones con descuento
- **Recordatorios automáticos** 24h antes (Vercel Cron)
- **Panel /admin** con agenda, pacientes, servicios y ejercicios
- **Auth.js** para autenticación del admin

## Stack técnico

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Neon** (Postgres serverless) + **Drizzle ORM**
- **Auth.js** para autenticación
- **Resend** para emails
- **Vercel** para despliegue

## Instalación local

```bash
# 1. Clonar el repo
git clone https://github.com/elcorreveidile/fisioterapia.git
cd fisioterapia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales reales

# 4. Crear base de datos en Neon
# Y copiar el connection string en DATABASE_URL

# 5. Generar AUTH_SECRET
openssl rand -base64 32
# Copiar el resultado en AUTH_SECRET

# 6. Push del schema a la base de datos
npm run db:push

# 7. Sembrar datos de prueba
npm run db:seed

# 8. Arrancar en local
npm run dev
```

## Variables de entorno

```bash
DATABASE_URL="postgresql://user:password@host/database"
AUTH_SECRET="your-auth-secret-here"
RESEND_API_KEY="re_your_resend_api_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Usuario admin demo

Tras ejecutar `npm run db:seed`:

- **Email:** admin@ejefisioterapia-demo.com
- **Contraseña:** admin123
- **Panel:** http://localhost:3000/admin

⚠️ **CAMBIAR CONTRASEÑA EN PRODUCCIÓN**

## Scripts disponibles

```bash
npm run dev          # Arrancar desarrollo
npm run build        # Build de producción
npm start            # Arrancar producción
npm run db:generate  # Generar migraciones
npm run db:migrate   # Ejecutar migraciones
npm run db:push      # Push directo del schema (dev)
npm run db:studio    # Abrir Drizzle Studio
npm run db:seed      # Sembrar datos de prueba
```

## Checklist para adaptar a cliente real

Cuando una clínica real compre esta solución:

1. **Sustituir marca:**
   - [ ] Nombre de la clínica
   - [ ] Colores (paleta en `globals.css`)
   - [ ] Tipografías
   - [ ] Logo/símbolo
   - [ ] Textos de todas las páginas

2. **Sustituir datos:**
   - [ ] Dirección real
   - [ ] Teléfono(s)
   - [ ] Email
   - [ ] Números de colegiado de los fisioterapeutas
   - [ ] Nombres, biografías y fotos del equipo

3. **Ajustes legales:**
   - [ ] Aviso legal: CIF, domicilio, titular
   - [ ] Política de privacidad: protección de datos de salud (RGPD)
   - [ ] Política de cookies
   - [ ] Consentimiento explícito para datos de categoría especial

4. **Tarifas:**
   - [ ] Ajustar precios según mercado local
   - [ ] Configurar servicios y duraciones reales
   - [ ] Ajustar descuentos de bonos

5. **Dominio y hosting:**
   - [ ] Comprar dominio real
   - [ ] Conectar a Vercel
   - [ ] Configurar variables de entorno de producción
   - [ ] Configurar Resend con email real
   - [ ] Configurar Vercel Cron para recordatorios

6. **Pago online (v2):**
   - [ ] Integrar Stripe para pago online
   - [ ] Añadir webhook de Stripe para confirmación de pago
   - [ ] Actualizar flujos de bonos

## Estado actual del proyecto

- ✅ Stack configurado (Next.js 15, Drizzle, Auth.js)
- ✅ Esquema de base de datos completo
- ✅ Auth.js configurado para /admin
- ✅ Páginas públicas: Home, Servicios, Tarifas, Método, Contacto, Legal
- ✅ Motor de reservas (Server Actions, UI de 5 pasos)
- ✅ Sistema de pautas de ejercicios (/pauta/[token])
- ✅ Panel /admin básico (login, dashboard, sidebar)
- ⏳ Integración real con base de datos en reservas
- ⏳ Funcionalidades avanzadas del panel (agenda, pacientes, ejercicios)
- ⏳ Emails de confirmación y recordatorios
- ⏳ Exclusion constraint en Postgres

## Desarrollo

Para ver el progreso actual, ejecuta:

```bash
npm run dev
```

Y navega a:
- http://localhost:3000 — Home pública
- http://localhost:3000/admin — Panel de administración (requiere login)

## Licencia

Este proyecto es una demo comercial propiedad de Por 2 Duros. No puede ser redistribuido ni usado sin permiso explícito.

---

**Por 2 Duros** · Desarrollo web a medida para sanitarios
