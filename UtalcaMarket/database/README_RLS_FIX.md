# Solución para el problema de perfiles en conversaciones

## Problema
Las políticas RLS (Row Level Security) de Supabase están bloqueando la lectura de perfiles de otros usuarios, incluso cuando tienes una conversación con ellos.

## Error
```
PGRST116: Cannot coerce the result to a single JSON object
```

## Solución

### Opción 1: Crear función RPC (RECOMENDADA)

Ejecuta el SQL en `database/get_user_profile_function.sql` en el SQL Editor de Supabase.

Esta función:
- ✅ Bypasea las políticas RLS usando `SECURITY DEFINER`
- ✅ Solo expone información pública (id, email, full_name, avatar_url)
- ✅ Es segura porque no revela información sensible

### Opción 2: Modificar políticas RLS

Alternativa: Crear una política que permita leer perfiles de usuarios con los que tienes conversaciones:

```sql
-- Política para leer perfiles de usuarios en tus conversaciones
CREATE POLICY "Users can view profiles of conversation participants"
ON profiles FOR SELECT
USING (
  id IN (
    SELECT participant_1_id FROM conversations 
    WHERE participant_2_id = auth.uid()
    UNION
    SELECT participant_2_id FROM conversations 
    WHERE participant_1_id = auth.uid()
  )
);
```

## Pasos para aplicar

1. Ve a Supabase Dashboard
2. Selecciona tu proyecto
3. Ve a SQL Editor
4. Ejecuta el SQL de la Opción 1 o la Opción 2
5. Recarga la app

## Verificación

Después de aplicar la solución, deberías ver en los logs:

```
✅ Perfil obtenido vía RPC: { id: '...', full_name: 'Tomás Valenzuela Vergara', avatar_url: 'https://...' }
```

Y la app debería mostrar correctamente:
- ✅ Nombre del usuario en el header del chat
- ✅ Foto de perfil del usuario
- ✅ Placeholder con iniciales si no hay foto
