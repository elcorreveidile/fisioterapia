# 🚀 Guía de despliegue en Vercel

Esta guía explica cómo desplegar Eje Fisioterapia en Vercel.

## Prerrequisitos

1. **Cuenta de Vercel**: https://vercel.com
2. **Cuenta de Neon** (base de datos): https://neon.tech
3. **Cuenta de Resend** (emails): https://resend.com
4. **Cuenta de GitHub**: https://github.com

## Paso 1: Preparar la base de datos en Neon

1. Crear un proyecto en Neon: https://neon.tech
2. Copiar el **Connection String**:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/database
   ```
3. Guardarlo para el paso 4

## Paso 2: Preparar Resend

1. Crear cuenta en Resend: https://resend.com
2. Ir a **API Keys** y crear una nueva key
3. Copiar la API key (empieza por `re_`)
4. Guardarla para el paso 4

## Paso 3: Generar secrets

Genera dos secrets seguros:

```bash
# Auth.js secret
openssl rand -base64 32

# Cron secret
openssl rand -base64 32
```

Guarda ambos para el paso 4.

## Paso 4: Conectar GitHub a Vercel

1. Ve a Vercel: https://vercel.com
2. Click **Add New Project**
3. **Import Git Repository**
4. Selecciona `elcorreveidile/fisioterapia`
5. Click **Import**

## Paso 5: Configurar variables de entorno

En Vercel, ve a **Settings → Environment Variables** y añade:

| Nombre | Valor | Referencia |
|--------|-------|------------|
| `DATABASE_URL` | Tu connection string de Neon | Paso 1 |
| `AUTH_SECRET` | El secret generado | Paso 3 |
| `RESEND_API_KEY` | Tu API key de Resend | Paso 2 |
| `CRON_SECRET` | El otro secret generado | Paso 3 |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.vercel.app` | (después del deploy) |

💾 **Activa "Include in preview deployments"** para poder probar en PRs.

## Paso 6: Primer despliegue

1. Click **Deploy**
2. Espera a que termine (≈2-3 minutos)
3. Vercel te asignará un dominio: `eje-fisioterapia-xxx.vercel.app`
4. Actualiza `NEXT_PUBLIC_APP_URL` con este dominio
5. Re-deploya para aplicar el cambio

## Paso 7: Sembrar la base de datos

Ahora necesitas sembrar los datos iniciales:

1. Instala las dependencias localmente:
   ```bash
   npm install
   ```

2. Configura tu `.env.local` con las mismas variables que en Vercel

3. Empuja el schema:
   ```bash
   npm run db:push
   ```

4. Siembra los datos:
   ```bash
   npm run db:seed
   ```

## Paso 8: Configurar Cron Jobs

1. En Vercel, ve a **Settings → Cron Jobs**
2. Añade un nuevo cron job:
   - **Path**: `/api/cron/reminders`
   - **Schedule**: `0 9 * * *` (todos los días a las 9:00)
   - **UTC**: Tu zona horaria (ej. `Europe/Madrid`)

3. Añade la variable `CRON_SECRET` (usaste el mismo del paso 3)

## Paso 9: Dominio personalizado (opcional)

1. Compra dominio: `eje-fisioterapia.com` (o similar)
2. En Vercel, ve a **Settings → Domains**
3. Añade tu dominio
4. Actualiza los DNS según indique Vercel
5. Espera la propagación DNS (≈24-48h)

## Paso 10: Verificar el despliegue

Accede a tu dominio y verifica:

- [ ] Home se carga correctamente
- [ ] El banner de demo aparece abajo
- [ ] Página de reservas funciona
- [ ] Login de admin funciona
- [ ] Panel de admin es accesible

**Credenciales admin:**
- Email: `admin@ejefisioterapia-demo.com`
- Password: `admin123`

## Troubleshooting

### Build falla
- Verifica que `DATABASE_URL` esté configurada
- Revisa los logs en Vercel

### Error de conexión a BD
- Verifica que `DATABASE_URL` sea correcta
- Comprueba que Neon no esté en pause

### Emails no llegan
- Verifica que `RESEND_API_KEY` sea válida
- Comprueba la carpeta de spam

### Cron job no ejecuta
- Verifica que `CRON_SECRET` sea el mismo en Vercel y en el código
- Revisa los logs de cron en Vercel

---

## Checklist post-despliegue

- [ ] Base de datos sembrada
- [ ] Admin funciona
- [ ] Reserva funciona (end-to-end)
- [ ] Recordatorios configurados
- [ ] Dominio personalizado (opcional)
- [ ] HTTPS redirige correctamente
- [ ] Emails llegan a la carpeta principal (no spam)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel o consulta la documentación:
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Resend: https://resend.com/docs

Buena suerte 🚀
