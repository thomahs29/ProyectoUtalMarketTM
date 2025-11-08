-- Función RPC para obtener perfiles de otros usuarios
-- Esta función bypasea las políticas RLS para permitir ver perfiles
-- de usuarios con los que tienes conversaciones

CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Esto hace que la función se ejecute con permisos del dueño, no del usuario
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url
  FROM profiles p
  WHERE p.id = user_id;
END;
$$;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- Comentario explicando la función
COMMENT ON FUNCTION get_user_profile IS 'Obtiene el perfil público de un usuario. Usado para mostrar información de otros usuarios en conversaciones.';
