# Sistema de Publicaciones - UtalcaMarket

## Configuración de la Base de Datos

### 1. Ejecutar el Script SQL en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Copia y pega el contenido del archivo `database/supabase_setup.sql`
4. Haz clic en **Run** para ejecutar el script

Este script creará:

- Tabla `publications` con todas las columnas necesarias
- Índices para mejor performance
- Políticas de seguridad (RLS) para proteger los datos
- Trigger para actualizar automáticamente `updated_at`

### 2. Verificar la Configuración

Después de ejecutar el script, verifica que:

- La tabla `publications` existe en **Table Editor**
- Las políticas RLS están activas en **Authentication > Policies**
- Los usuarios pueden crear y ver publicaciones

## Funcionalidades Implementadas

### ✅ Formulario de Creación

- **Título**: Campo obligatorio (máx. 100 caracteres)
- **Descripción**: Campo obligatorio (máx. 500 caracteres)
- **Precio**: Campo numérico obligatorio (debe ser > 0)
- **Categoría**: Selector con opciones predefinidas

### ✅ Lista de Publicaciones

- **Vista "Todas"**: Muestra todas las publicaciones de todos los usuarios
- **Vista "Mis Publicaciones"**: Muestra solo las publicaciones del usuario actual
- **Refresh**: Pull-to-refresh para actualizar la lista
- **Estado vacío**: Mensaje cuando no hay publicaciones

### ✅ Características Técnicas

- **Persistencia**: Datos guardados en Supabase
- **Seguridad**: RLS habilitado, usuarios solo pueden modificar sus publicaciones
- **Validación**: Validación tanto en frontend como base de datos
- **UX**: Indicadores de carga, mensajes de error y éxito

## Estructura de Archivos

```
├── types/
│   └── publication.ts          # Tipos TypeScript
├── services/
│   └── publicationService.ts   # Lógica de negocio y API calls
├── components/
│   ├── CreatePublicationForm.tsx  # Formulario de creación
│   └── PublicationsList.tsx       # Lista de publicaciones
├── app/(tabs)/
│   └── publications.tsx           # Pantalla principal
└── database/
    └── supabase_setup.sql         # Script de configuración DB
```

## Uso de la Aplicación

1. **Crear Publicación**:
   - Ve a la pestaña "Publicaciones"
   - Toca el botón "+ Crear"
   - Completa el formulario
   - Toca "Crear Publicación"

2. **Ver Publicaciones**:
   - **Tab "Todas"**: Ve todas las publicaciones
   - **Tab "Mis Publicaciones"**: Ve solo tus publicaciones
   - **Pull-to-refresh**: Actualiza la lista

3. **Categorías Disponibles**:
   - Electrónicos
   - Libros
   - Ropa
   - Hogar
   - Deportes
   - Otros

## Próximas Funcionalidades (Futuras)

- [ ] Editar publicaciones existentes
- [ ] Eliminar publicaciones
- [ ] Subir imágenes
- [ ] Búsqueda y filtros
- [ ] Sistema de favoritos
- [ ] Chat entre usuarios
- [ ] Notificaciones push

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Verifica que `.env.local` tenga las variables correctas
- Asegúrate de que las variables empiecen con `EXPO_PUBLIC_`

### Error: "relation publications does not exist"

- Ejecuta el script SQL en Supabase
- Verifica que la tabla fue creada correctamente

### Error de permisos RLS

- Verifica que las políticas RLS están configuradas
- Asegúrate de que el usuario esté autenticado
