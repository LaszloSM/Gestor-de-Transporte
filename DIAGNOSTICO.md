# DIAGNÓSTICO DE CARGA

## 1️⃣ Para verificar qué está pasando:

### Opción A: En el navegador
1. Abre **F12** (DevTools)
2. Ve a la pestaña **Console**
3. Dime qué mensajes ves (especialmente los con emoji)

### Opción B: Mensajes esperados
Si todo funciona correctamente, deberías ver:
```
🔐 Inicializando estado de autenticación...
ℹ️ No hay sesión activa
```

Luego aparecerá la página de **Login**

## 2️⃣ Si ves error de "Cannot read property 'auth'"
- Significa que Supabase no se inicializó correctamente
- Verifica el `.env.local` tenga las dos líneas

## 3️⃣ Si ves error sobre "PERMISSIONS[...]"
- Significa que `userProfile?.role` es undefined al inicio
- Es normal, pero estamos filtrando para evitarlo

## 4️⃣ Comandos para reiniciar:

```bash
# Limpia cache
rm -rf node_modules/.vite

# Reinicia servidor
npm run dev
```

## 5️⃣ Alternativa: Versión ultra-simplificada

Si todo sigue sin funcionar, podemos crear una versión más simple de App.jsx que:
- No cargue perfil automáticamente
- Muestre login primero
- Cargue datos bajo demanda
