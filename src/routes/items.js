const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/upload');

const router = Router();

// ─── Store en memoria ─────────────────────────────────────────────────────────
const items = [];

// ─── GET /api/items ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  // Los más recientes primero
  res.json({ items: [...items].reverse() });
});

// ─── Validaciones ────────────────────────────────────────────────────────────

const itemValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 120 }).withMessage('El nombre no puede superar 120 caracteres.'),

  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria.')
    .isLength({ max: 1000 }).withMessage('La descripción no puede superar 1000 caracteres.'),

  body('price')
    .notEmpty().withMessage('El precio es obligatorio.')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0.'),

  body('offerType')
    .notEmpty().withMessage('El tipo de oferta es obligatorio.')
    .isIn(['money', 'percentage']).withMessage('offerType debe ser "money" o "percentage".'),

  body('discount')
    .notEmpty().withMessage('El descuento es obligatorio.')
    .isFloat({ gt: 0 }).withMessage('El descuento debe ser un número mayor a 0.')
    .custom((value, { req }) => {
      if (req.body.offerType === 'percentage') {
        const pct = parseFloat(value);
        if (pct > 100) throw new Error('El porcentaje de descuento no puede ser mayor a 100.');
      }
      return true;
    }),

  body('startDate')
    .notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .isISO8601().withMessage('startDate debe ser una fecha válida (ISO 8601).'),

  body('endDate')
    .notEmpty().withMessage('La fecha de fin es obligatoria.')
    .isISO8601().withMessage('endDate debe ser una fecha válida (ISO 8601).')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');
      }
      return true;
    }),
];

// ─── POST /api/items ──────────────────────────────────────────────────────────

router.post(
  '/',
  upload.array('media', 10),          // campo "media", máximo 10 archivos
  itemValidations,
  (req, res) => {
    // 1. Validar que se subió al menos 1 archivo
    if (!req.files || req.files.length === 0) {
      return res.status(422).json({
        errors: [{ field: 'media', message: 'Debes adjuntar al menos un archivo multimedia.' }],
      });
    }

    // 2. Validar campos de texto
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({
        errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, description, price, offerType, discount, startDate, endDate } = req.body;

    const item = {
      id: Date.now(),
      name,
      description,
      price: parseFloat(price),
      offerType,
      discount: parseFloat(discount),
      startDate,
      endDate,
      media: req.files.map((f) => ({
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        url: `/uploads/${f.filename}`,
      })),
      createdAt: new Date().toISOString(),
    };

    items.push(item);

    return res.status(201).json({ success: true, item });
  }
);

module.exports = router;
