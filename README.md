# mi-backend

API REST para la app móvil de items con descuentos. Construida con Express, Multer y express-validator.

---

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (viene incluido con Node)

---

## Instalación

```bash
# 1. Clona o descarga el proyecto y entra a la carpeta
cd mi-backend

# 2. Instala las dependencias
npm install
```

---

## Correr el servidor

### Modo desarrollo (recarga automática con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor queda escuchando en `http://localhost:3000`.

---

## Variables de entorno

Crea un archivo `.env` en la raíz si quieres cambiar el puerto:

```env
PORT=3000
```

Si no existe el archivo `.env`, el servidor usa el puerto `3000` por defecto.

---

## Endpoints

### `GET /api/items`

Devuelve todos los items guardados, del más reciente al más antiguo.

**Respuesta `200`:**
```json
{
  "items": [
    {
      "id": 1234567890,
      "name": "Hamburguesa especial",
      "description": "Descripción del item",
      "price": 10.99,
      "offerType": "money",
      "discount": 2.00,
      "startDate": "2026-06-30T00:00:00.000Z",
      "endDate": "2026-07-10T00:00:00.000Z",
      "media": [
        {
          "filename": "1234567890-archivo.jpg",
          "originalname": "archivo.jpg",
          "mimetype": "image/jpeg",
          "size": 204800,
          "url": "/uploads/1234567890-archivo.jpg"
        }
      ],
      "createdAt": "2026-06-30T12:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/items`

Crea un nuevo item. El cuerpo debe enviarse como `multipart/form-data`.

**Campos:**

| Campo | Tipo | Reglas |
|---|---|---|
| `name` | texto | Obligatorio, máx 120 caracteres |
| `description` | texto | Obligatorio, máx 1000 caracteres |
| `price` | número | Obligatorio, mayor a 0 |
| `offerType` | `"money"` o `"percentage"` | Obligatorio |
| `discount` | número | Obligatorio, mayor a 0; si es `percentage` máx 100 |
| `startDate` | fecha ISO 8601 | Obligatorio |
| `endDate` | fecha ISO 8601 | Obligatorio, posterior a `startDate` |
| `media` | archivo(s) | Mínimo 1, máximo 10; formatos: jpeg, png, webp, mp4, mov |

**Respuesta `201`:**
```json
{
  "success": true,
  "item": { ... }
}
```

**Respuesta `422` (error de validación):**
```json
{
  "errors": [
    { "field": "price", "message": "El precio debe ser un número mayor a 0." }
  ]
}
```

---

## Archivos subidos

Los archivos multimedia se guardan en la carpeta `uploads/` y se sirven de forma estática en:

```
http://localhost:3000/uploads/<nombre-del-archivo>
```

---

## Conectar con el dispositivo físico

Si pruebas la app móvil en un dispositivo real (no simulador), reemplaza `localhost` por la IP local de tu Mac en el archivo `items.service.ts` del frontend:

```ts
// Antes
const BASE_URL = 'http://localhost:3000/api';

// Después (ejemplo)
const BASE_URL = 'http://192.168.1.100:3000/api';
```

Para encontrar tu IP local ejecuta en la terminal:

```bash
ipconfig getifaddr en0
```

---

## Estructura del proyecto

```
mi-backend/
├── index.js                  # Entry point
├── uploads/                  # Archivos subidos (generado automáticamente)
├── src/
│   ├── middleware/
│   │   └── upload.js         # Configuración de Multer
│   └── routes/
│       └── items.js          # Rutas y validaciones de /api/items
├── .env                      # Variables de entorno (no se sube al repo)
├── package.json
└── README.md
```
