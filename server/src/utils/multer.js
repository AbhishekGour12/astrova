// multer.js (fixed)
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const uploadDir = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

// Temporary directory for uploads
const tempDir = path.join(process.cwd(), "temp");
fs.mkdirSync(tempDir, { recursive: true });

// Process only image files
const processAndStoreImage = async (file) => {
  const timestamp = Date.now();
  const randomId = Math.round(Math.random() * 1e9);
  const webpFilename = `${timestamp}-${randomId}.webp`;
  const outputPath = path.join(uploadDir, webpFilename);
  
  try {
    // Check if file exists
    if (!fs.existsSync(file.path)) {
      throw new Error(`File not found: ${file.path}`);
    }
    
    // Process image with sharp
    await sharp(file.path)
      .webp({ 
        quality: 80,
        effort: 6,
        lossless: false,
        nearLossless: false,
        smartSubsample: true
      })
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(outputPath);
    
    // Delete original temp file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return {
      filename: webpFilename,
      path: `/uploads/products/${webpFilename}`,
      fullPath: outputPath,
      size: fs.statSync(outputPath).size,
      originalname: file.originalname
    };
  } catch (error) {
    console.error(`Image processing error for ${file.originalname}:`, error.message);
    
    // If processing fails, copy original as fallback
    const fallbackPath = path.join(uploadDir, webpFilename);
    if (fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, fallbackPath);
      fs.unlinkSync(file.path);
    }
    
    return {
      filename: webpFilename,
      path: `/uploads/products/${webpFilename}`,
      fullPath: fallbackPath,
      size: fs.existsSync(fallbackPath) ? fs.statSync(fallbackPath).size : 0,
      originalname: file.originalname
    };
  }
};

// Disk storage for temp files
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomId}${ext}`);
  },
});

// Image-only filter
const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/avif", "image/svg+xml", "image/gif", "image/tiff", "image/bmp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid image file type"), false);
  }
};

// Excel + images filter
const excelAndImageFileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const allowedDocs = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv"
  ];
  
  if (allowedImages.includes(file.mimetype) || allowedDocs.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and Excel files are allowed."), false);
  }
};

// Middleware to process only image files (not Excel)
export const processUploadedImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  
  try {
    const processedImages = [];
    
    for (const file of req.files) {
      // Only process if it's an image
      if (file.mimetype.startsWith('image/')) {
        const processed = await processAndStoreImage(file);
        processedImages.push({
          ...file,
          filename: processed.filename,
          path: processed.path,
          size: processed.size,
          originalname: file.originalname
        });
      } else {
        // Keep non-image files as-is
        processedImages.push(file);
      }
    }
    
    req.files = processedImages;
    next();
  } catch (error) {
    console.error("Bulk image processing error:", error);
    next(error);
  }
};

// Process field-based uploads (Excel + images)
export const processFieldImages = async (req, res, next) => {
  if (!req.files) {
    return next();
  }
  
  try {
    for (const fieldName in req.files) {
      if (req.files[fieldName] && req.files[fieldName].length > 0) {
        const processedFiles = [];
        
        for (const file of req.files[fieldName]) {
          // Only process image files, skip Excel files
          if (file.mimetype.startsWith('image/')) {
            const processed = await processAndStoreImage(file);
            processedFiles.push({
              ...file,
              filename: processed.filename,
              path: processed.path,
              size: processed.size,
              originalname: file.originalname
            });
          } else {
            // Keep Excel file as-is
            processedFiles.push(file);
          }
        }
        
        req.files[fieldName] = processedFiles;
      }
    }
    
    next();
  } catch (error) {
    console.error("Field image processing error:", error);
    next(error);
  }
};

// Cleanup middleware for temp files
export const cleanupTempFiles = (req, res, next) => {
  res.on('finish', () => {
    if (req.files) {
      const deleteFile = (file) => {
        if (file && file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.warn(`Failed to delete temp file: ${file.path}`);
          }
        }
      };
      
      if (Array.isArray(req.files)) {
        req.files.forEach(deleteFile);
      } else if (typeof req.files === 'object') {
        Object.values(req.files).forEach(files => {
          if (Array.isArray(files)) {
            files.forEach(deleteFile);
          }
        });
      }
    }
  });
  next();
};

export const uploadImages = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

export const uploadExcelAndImages = multer({
  storage: diskStorage,
  fileFilter: excelAndImageFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

export const uploadAstrologerFiles = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});