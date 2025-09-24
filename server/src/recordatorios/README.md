# Recordatorios API Documentation

## Descripción
API para gestionar recordatorios de usuarios con soporte para múltiples imágenes almacenadas en Firebase Storage. Todos los endpoints requieren autenticación JWT y los usuarios solo pueden gestionar sus propios recordatorios.

## Seguridad
- **Autenticación JWT requerida** en todos los endpoints
- **Validación de propiedad**: Los usuarios solo pueden CRUD sus propios recordatorios
- **id_usuario automático**: Se extrae del token JWT, no se envía en el payload

## Endpoints

### 1. Crear Recordatorio
**POST** `/recordatorios`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
```
descripcion: "Recordatorio de ejemplo"
id_estado: 1 (opcional, default: 1)
imagenes: [archivos de imagen] (opcional, máximo 10)
```
**NOTA:** `id_usuario` se obtiene automáticamente del token JWT

**Respuesta:**
```json
{
  "message": "Recordatorio creado exitosamente",}
```

### 2. Actualizar Recordatorio
**PUT** `/recordatorios/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
```
descripcion: "Descripción actualizada" (opcional)
id_estado: 2 (opcional)
activo: true (opcional)
nuevasImagenes: [archivos de imagen] (opcional, se agregan a las existentes)
```

### 3. Eliminar Recordatorio (Soft Delete)
**DELETE** `/recordatorios/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta:**
```json
{
  "message": "Recordatorio eliminado exitosamente"
}
```

### 4. Eliminar Recordatorio Permanente
**DELETE** `/recordatorios/:id/permanente`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Nota:** Elimina el recordatorio de la base de datos y todas las imágenes de Firebase.

### 5. Eliminar Imágenes Específicas
**DELETE** `/recordatorios/:id/imagenes`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "urlsAEliminar": [
    "recordatoriosUsuarios/imagen1.jpg",
    "recordatoriosUsuarios/imagen2.png"
  ]
}
```

### 6. Obtener Mis Recordatorios (Usuario Autenticado)
**GET** `/recordatorios/mis-recordatorios`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Descripción:** Obtiene todos los recordatorios del usuario autenticado.

**Respuesta:**
```json
[
  {
    "id": 1,
    "descripcion": "Recordatorio 1",
    "id_estado": 1,
    "id_usuario": 123,
    "url_imagen": ["recordatoriosUsuarios/imagen1.jpg"],
    "activo": true,
    "fecha_creacion": "2025-01-21T10:00:00Z",
    "fecha_actualizacion": "2025-01-21T10:00:00Z",
    "usuarios": {
      "id": 123,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@email.com"
    }
  }
]
```

### 6.1. Obtener Recordatorios por Usuario (Admin)
**GET** `/recordatorios/usuario/:idUsuario`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Descripción:** Para administradores que necesitan ver recordatorios de otros usuarios.

### 7. Obtener Recordatorio por ID
**GET** `/recordatorios/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Ejemplos de uso con cURL

### Crear recordatorio con imágenes:
```bash
curl -X POST \
  http://localhost:3000/recordatorios \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'descripcion=Mi recordatorio' \
  -F 'id_estado=1' \
  -F 'imagenes=@imagen1.jpg' \
  -F 'imagenes=@imagen2.png'
```
**NOTA:** Ya no necesitas enviar `id_usuario`, se obtiene del token.

### Actualizar recordatorio:
```bash
curl -X PUT \
  http://localhost:3000/recordatorios/1 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'descripcion=Descripción actualizada' \
  -F 'nuevasImagenes=@imagen3.jpg'
```

### Eliminar imágenes específicas:
```bash
curl -X DELETE \
  http://localhost:3000/recordatorios/1/imagenes \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "urlsAEliminar": [
      "recordatoriosUsuarios/imagen1.jpg"
    ]
  }'
```

## Notas importantes

1. **Autenticación**: Todos los endpoints requieren autenticación JWT.

2. **Imágenes**: Las imágenes se almacenan en Firebase Storage en la carpeta `recordatoriosUsuarios/`.

3. **Límites**: Máximo 10 imágenes por upload.

4. **Estados**: Los recordatorios tienen estados (id_estado) que debes definir según tu lógica de negocio.

5. **Soft Delete**: Por defecto, eliminar un recordatorio solo lo marca como inactivo (activo: false).

6. **Hard Delete**: Usar `/permanente` elimina definitivamente el recordatorio y sus imágenes de Firebase.

7. **Seguridad de propiedad**: 
   - Todos los CRUDs validan que el usuario autenticado sea propietario del recordatorio
   - Respuesta 400 si intenta modificar recordatorios de otros usuarios
   - `id_usuario` se inyecta automáticamente desde el token JWT

8. **Gestión de imágenes**: 
   - Al crear: se suben las imágenes nuevas
   - Al actualizar: se agregan nuevas imágenes a las existentes
   - Para reemplazar: primero elimina las existentes, luego actualiza con nuevas

9. **Nuevos endpoints seguros**:
   - `GET /recordatorios/mis-recordatorios` - Solo tus recordatorios
   - Validación automática de propiedad en todos los endpoints