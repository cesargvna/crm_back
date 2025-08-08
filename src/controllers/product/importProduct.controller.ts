import multer from "multer";
import xlsx from "xlsx";
import path from "path";
import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { normalizeProductCode, normalizeProductName } from "./product.controller";
import { normalizeProductCategoryName } from "./productCategory.controller";
import { normalizeUnitMeasurementName } from "./unitMeasurement.controller";
import {
  importProductRowSchema,
  importExcelFormSchema,
} from "../../validators/product/importProduct.validator";
import { z } from "zod";

// ✅ Multer configuration for in-memory file upload
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /product/import/product-category-unit
 * @desc Import products from Excel and create related categories and units
 */
export const importProductsWithCategoriesAndUnits = [
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    // ✅ Validate tenantId and subsidiaryId from body
    const parsedForm = importExcelFormSchema.safeParse(req.body);
    if (!parsedForm.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: parsedForm.error.flatten().fieldErrors,
      });
    }

    const { tenantId, subsidiaryId } = parsedForm.data;

    // ✅ Check if file is present
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required." });
    }

    // ✅ Check mimetype
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Please upload an Excel file (.xlsx or .xls).",
      });
    }

    // ✅ Check file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      return res.status(400).json({
        message: "Only Excel files with .xlsx or .xls extensions are allowed.",
      });
    }

    // ✅ Parse Excel content
    const workbook = xlsx.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json<any>(sheet);

    const createdProducts = [];
    const skippedProducts: any[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2; // +2 assuming header is on row 1

      let parsedRow;
      try {
        parsedRow = importProductRowSchema.parse(row);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const formattedErrors = err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          }));

          const codeInfo = row.code || "(sin código)";
          const nameInfo = row.name || "(sin nombre)";

          console.log(`❌ Error de validación en fila ${rowNumber} - Código: ${codeInfo}, Nombre: ${nameInfo}`);
          formattedErrors.forEach((error) => {
            console.log(`   • Campo: ${error.path} → ${error.message}`);
          });

          skippedProducts.push({
            rowNumber,
            code: row.code || null,
            name: row.name || null,
            reason: "Validation error",
            details: formattedErrors,
          });
        } else {
          console.log(`❌ Error desconocido en fila ${rowNumber}:`, row);
          skippedProducts.push({
            rowNumber,
            code: row.code || null,
            name: row.name || null,
            reason: "Unknown error",
            details: "Unexpected error occurred.",
          });
        }
        continue;
      }

      const {
        code,
        name,
        productCategoryName,
        unitMeasurementName,
        quantityUnit,
        barcode,
        description,
      } = parsedRow;

      const normalizedCode = normalizeProductCode(code);
      const normalizedName = normalizeProductName(name);
      const normalizedCategory = normalizeProductCategoryName(productCategoryName);
      const normalizedUnit = normalizeUnitMeasurementName(unitMeasurementName);

      // ✅ Skip if product already exists
      const exists = await prisma.product.findFirst({
        where: {
          code: normalizedCode,
          name: normalizedName,
          tenantId,
          subsidiaryId,
        },
      });

      if (exists) {
        console.log(`⚠️ Producto ya existe (omitido): ${name} - ${code}`);
        skippedProducts.push({ rowNumber, code, name, reason: "Product already exists" });
        continue;
      }

      // ✅ Upsert category
      const category = await prisma.productCategory.upsert({
        where: {
          name_subsidiaryId: {
            name: normalizedCategory,
            subsidiaryId,
          },
        },
        update: {},
        create: {
          name: normalizedCategory,
          status: true,
          tenantId,
          subsidiaryId,
        },
      });

      // ✅ Upsert unit measurement
      const unit = await prisma.unitMeasurement.upsert({
        where: {
          name_quantity_subsidiaryId: {
            name: normalizedUnit,
            quantity: quantityUnit,
            subsidiaryId,
          },
        },
        update: {},
        create: {
          name: normalizedUnit,
          quantity: quantityUnit,
          status: true,
          tenantId,
          subsidiaryId,
        },
      });

      // ✅ Create product
      const product = await prisma.product.create({
        data: {
          code: normalizedCode,
          name: normalizedName,
          barcode,
          description,
          status: false,
          tenantId,
          subsidiaryId,
          productCategoryId: category.id,
          unitMeasurementId: unit.id,
        },
      });

      console.log(`✅ Producto creado: ${name} - ${code}`);
      createdProducts.push(product);
    }

    // ✅ Final response
    console.log("✅ Importación finalizada.");
    console.log(`🟢 Productos creados: ${createdProducts.length}`);
    console.log(`🟡 Productos omitidos: ${skippedProducts.length}`);

    res.status(201).json({
      message: "Import completed successfully.",
      createdCount: createdProducts.length,
      skippedCount: skippedProducts.length,
      skippedProducts,
    });
  }),
];
