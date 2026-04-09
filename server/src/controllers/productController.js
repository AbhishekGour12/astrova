import Product from "../models/Products.js";
import xlsx from "xlsx";
import path from 'path';
import fs from 'fs';
const XLSX = xlsx;
import mongoose from "mongoose";


const calculatePricing = ({
  price,
  offerPercent = 0,
}) => {
  const basePrice = Number(price);

  const discount =
    offerPercent > 0 ? (basePrice * offerPercent) / 100 : 0;

  // ✅ Proper rounding (no decimal, no string)
  const discountedPrice = Math.round(basePrice - discount);

  const totalPrice = discountedPrice;

  return {
    discountedPrice,
    totalPrice
  };
};
// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    // 🧾 Query parameters from frontend
    const {
      page = 1,
      limit,
      search = "",
      type = "",
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = "createdAt",
      order = "desc",
      category = ""
    } = req.query;
    
    // 🧩 Build MongoDB filter
    const filter = {};

    // 🔍 Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🧿 Filter by product type
    if (type) filter.productType = type;
    if (category) filter.category = category;
    // 💰 Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 🌟 Featured filter
    if (isFeatured !== undefined && isFeatured !== "") {
      filter.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    // 🧮 Pagination setup
    const skip = (Number(page) - 1) * Number(limit);

    // 🧾 Sort setup (default newest first)
    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    // 🧠 Fetch data
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);
    
    // 📦 Pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      currentPage: Number(page),
      totalPages,
      totalCount,
      limit: Number(limit),
      products,
    });
  } catch (error) {
    console.error("❌ getProducts error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Add new product


/**
 * Add single product (supports multiple images uploaded in field "images")
 * Expects multipart/form-data:
 *  - images: file[] (optional)
 *  - other fields as JSON form fields (name, price, stock, weight, productType, etc)
 */


/**
 * 🧩 Add multiple products at once (bulk form input from frontend)
 * Expects request.body = [{ name, description, price, stock, weight, productType, imageUrls[], ... }, ...]
 * Frontend should send JSON array of products.
 */

/**
 * 🧩 Add multiple products (bulk add) with optional uploaded images.
 * Expects:
 *  - Field "products" (JSON string of array)
 *  - Field "images" (multiple image files)
 **/
 // Updated addBulkProductsWithImages function

export const addBulkProductsWithImages = async (req, res) => {
  try {
    const productsData = JSON.parse(req.body.products);
    const uploadedFiles = req.files || [];

    // Files are already compressed and converted to WebP by middleware
    const imageUrls = uploadedFiles.map(
      (file) => file.path // Now returns WebP path
    );

    let fileIndex = 0;

    const processedProducts = productsData.map((product) => {
      const imageCount = product.imageFilesCount || 0;
      const productImages = imageUrls.slice(
        fileIndex,
        fileIndex + imageCount
      );
      fileIndex += imageCount;

      const offerPercent = Number(product.offerPercent) || 0;
      
      const gstPercent = Number(product.gstPercent) || 18;
      const pricing = calculatePricing({
        price: product.price,
        offerPercent,
        gstPercent,
      });

      return {
        ...product,
        offerPercent,
        discountedPrice: pricing.discountedPrice,
        gstPercent,
        totalPrice: Number(pricing.totalPrice).toFixed(0),
        imageUrls: productImages,
        rating: Number(product.rating) || 0,
      };
    });

    const saved = await Product.insertMany(processedProducts);

    res.status(201).json({
      message: "✅ Products added successfully with optimized images",
      count: saved.length,
      products: saved,
      imageInfo: {
        format: "webp",
        compressed: true
      }
    });
  } catch (err) {
    console.error("❌ Bulk add error:", err);
    res.status(500).json({ error: err.message });
  }
};

// productController.js (fixed version)
export const uploadBulkProductsWithImages = async (req, res) => {
  try {
    console.log("🟢 Files received:", Object.keys(req.files || {}));

    const excelFile = req.files?.excelFile?.[0];
    const imageFiles = req.files?.productImages || [];

    if (!excelFile) {
      return res.status(400).json({ error: "Excel file is required" });
    }

    // ✅ Validate Excel format
    const excelExt = path.extname(excelFile.originalname).toLowerCase();
    if (![".xlsx", ".xls", ".csv"].includes(excelExt)) {
      return res.status(400).json({ error: "Invalid Excel file format" });
    }

    // ✅ Check if excel file exists
    if (!fs.existsSync(excelFile.path)) {
      return res.status(400).json({ error: "Excel file not found on server" });
    }

    // ✅ Read Excel
    let workbook;
    try {
      workbook = XLSX.readFile(excelFile.path);
    } catch (err) {
      console.error("Excel read error:", err);
      return res.status(400).json({ error: "Failed to read Excel file. Please ensure it's a valid Excel file." });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📘 Processing ${rawData.length} rows from Excel`);
    console.log(`🖼️ Processing ${imageFiles.length} images available`);

    // ✅ Create a map of images by original name (case insensitive)
    const imageMap = new Map();
    imageFiles.forEach(img => {
      const baseName = path.basename(img.originalname, path.extname(img.originalname)).toLowerCase();
      const fullName = img.originalname.toLowerCase();
      const nameWithoutExt = baseName;
      
      // Store image with multiple keys for flexible matching
      imageMap.set(fullName, img);
      imageMap.set(nameWithoutExt, img);
      imageMap.set(baseName, img);
      
      // Also store without special characters
      const cleanName = nameWithoutExt.replace(/[^a-z0-9]/g, '');
      imageMap.set(cleanName, img);
    });

    console.log(`📸 Image map created with ${imageMap.size} entries`);

    const products = [];
    const errors = [];

    for (let i = 0; i < rawData.length; i++) {
      try {
        // 🔹 Normalize headers
        const row = {};
        for (const key in rawData[i]) {
          row[key.trim().toLowerCase()] = rawData[i][key];
        }

        // ✅ Required fields
        const required = ["name", "price", "stock", "producttype", "category"];
        const missing = required.filter((f) => !row[f]);
        if (missing.length) {
          errors.push(
            `Row ${i + 2}: Missing required fields (${missing.join(", ")})`
          );
          continue;
        }

        // ✅ Parse numeric values safely
        const price = Number(row.price);
        const stock = Number(row.stock);
        const weight = Number(row.weight) || 0.2;
        const rating = Number(row.rating) || 0;
        const offerPercent = Number(row.offerpercent) || 0;

        if (price <= 0 || isNaN(price)) {
          errors.push(`Row ${i + 2}: Invalid price`);
          continue;
        }

        if (stock < 0 || isNaN(stock)) {
          errors.push(`Row ${i + 2}: Invalid stock`);
          continue;
        }

        const pricing = calculatePricing({
          price,
          offerPercent
        });

        const discountedPrice = pricing.discountedPrice;
        const totalPrice = Math.round(pricing.totalPrice);

        // ✅ Image matching - DON'T remove images from map
        const productImages = [];
        if (row.images) {
          const imageNames = row.images
            .split(",")
            .map((n) => n.trim().toLowerCase())
            .filter(n => n.length > 0);

          console.log(`Row ${i + 2}: Looking for images:`, imageNames);

          for (const imgName of imageNames) {
            // Try multiple matching strategies
            let matchedImage = null;
            
            // Strategy 1: Exact match with original name
            if (imageMap.has(imgName)) {
              matchedImage = imageMap.get(imgName);
            }
            // Strategy 2: Match without extension
            else {
              const nameWithoutExt = imgName.replace(/\.[^/.]+$/, "");
              if (imageMap.has(nameWithoutExt)) {
                matchedImage = imageMap.get(nameWithoutExt);
              }
              // Strategy 3: Match by cleaning special characters
              else {
                const cleanName = nameWithoutExt.replace(/[^a-z0-9]/g, '');
                for (const [key, value] of imageMap.entries()) {
                  const cleanKey = key.replace(/[^a-z0-9]/g, '');
                  if (cleanKey === cleanName) {
                    matchedImage = value;
                    break;
                  }
                }
              }
            }
            
            if (matchedImage && matchedImage.path) {
              // Verify image file exists
              const fullImagePath = path.join(process.cwd(), matchedImage.path);
              if (fs.existsSync(fullImagePath)) {
                productImages.push(matchedImage.path);
                console.log(`✅ Row ${i + 2}: Matched image "${imgName}" -> ${matchedImage.path}`);
              } else {
                errors.push(`Row ${i + 2}: Image file not found on disk for "${imgName}"`);
                console.log(`❌ Row ${i + 2}: Image file missing at ${fullImagePath}`);
              }
            } else {
              errors.push(`Row ${i + 2}: Image "${imgName}" not found in upload`);
              console.log(`❌ Row ${i + 2}: No match found for "${imgName}"`);
            }
          }
        }

        // ✅ Final product object
        const productData = {
          name: row.name.toString().trim(),
          description: (row.description || "").toString().trim(),
          price,
          discountedPrice,
          offerPercent,
          stock,
          productType: row.producttype.toString().trim(),
          category: row.category.toString().trim(),
          weight,
          rating,
          isFeatured: row.isfeatured === "TRUE" || row.isfeatured === true || row.isfeatured === "true",
          imageUrls: productImages.length > 0 ? productImages : [],
          totalPrice: totalPrice,
          imageFormat: productImages.length > 0 ? "webp" : null,
          compressed: productImages.length > 0
        };

        const product = await Product.create(productData);
        products.push(product);
        console.log(`✅ Added product: ${product.name} with ${productImages.length} images`);
      } catch (err) {
        console.error(`❌ Row ${i + 2} error:`, err.message);
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    // 📊 Response
    const totalProcessed = products.length;
    const totalErrors = errors.length;

    // Log summary
    console.log(`\n📊 Upload Summary:`);
    console.log(`✅ Products created: ${totalProcessed}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log(`🖼️ Total images available: ${imageFiles.length}`);

    if (errors.length > 0) {
      return res.status(207).json({
        message: `Uploaded with partial errors. ${totalProcessed} products created, ${totalErrors} errors.`,
        created: totalProcessed,
        errors: errors.slice(0, 50), // Limit error messages
        products,
        imageInfo: {
          format: "webp",
          compressed: true,
          totalImagesAvailable: imageFiles.length,
          optimization: "Images converted to WebP format with 80% quality"
        }
      });
    }

    res.status(201).json({
      message: `${products.length} products uploaded successfully with optimized WebP images`,
      products,
      imageInfo: {
        format: "webp",
        compressed: true,
        totalImagesUsed: products.reduce((sum, p) => sum + p.imageUrls.length, 0),
        optimization: "All images converted to WebP for better performance"
      }
    });
  } catch (error) {
    console.error("💥 Excel upload error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    // Cleanup temp files (but keep processed images in products folder)
    try {
      if (req.files) {
        // Delete temp excel file
        if (req.files.excelFile && req.files.excelFile[0] && req.files.excelFile[0].path) {
          if (fs.existsSync(req.files.excelFile[0].path)) {
            fs.unlinkSync(req.files.excelFile[0].path);
            console.log("🧹 Cleaned up temp Excel file");
          }
        }
        
        // Delete temp image files (original uploads before processing)
        if (req.files.productImages) {
          req.files.productImages.forEach(file => {
            if (file.path && fs.existsSync(file.path) && file.path.includes('temp')) {
              fs.unlinkSync(file.path);
              console.log(`🧹 Cleaned up temp image: ${file.originalname}`);
            }
          });
        }
      }
    } catch (cleanupErr) {
      console.warn("⚠️ Cleanup error:", cleanupErr.message);
    }
  }
};




/**
 * Bulk upload (Excel file) - expects field "file" (single file)
 * Use multer single('file') middleware before calling this.
 * Implementation similar to earlier uploadBulkProducts but updated to accept files uploaded via multerConfig.
 */



// ✅ Get available product types
export const getProductTypes = async (req, res) => {
  try {
    const product = await Product.findOne();
    const types = product?.availableTypes || [];
   
    res.json(types);
   
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Add new product type manually
export const addProductType = async (req, res) => {
  try {
    const { newType } = req.body;
    
    if (!newType) return res.status(400).json({ error: "Type name required" });

    await Product.updateMany({}, { $addToSet: { availableTypes: newType } });
    res.json({ message: "Product type added successfully", newType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProductType = async (req, res) => {
  try {
   
    const { typeToDelete } = req.body;
    

    if (!typeToDelete)
      return res.status(400).json({ error: "Type name required" });

    // Remove this type from availableTypes array in all products
    await Product.updateMany(
      {},
      { $pull: { availableTypes: typeToDelete } }
    );

    res.json({
      message: "Product type deleted successfully",
      deletedType: typeToDelete,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Delete all images
    if (product.imageUrls && product.imageUrls.length > 0) {
      product.imageUrls.forEach((imgPath) => {
        // remove starting "/" to avoid absolute path issue
        const fullPath = path.join(process.cwd(), imgPath.replace("/", ""));

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // ✅ Delete product from DB
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product and all images deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/productController.js - Update the updateProduct function

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const offerPercent = Number(req.body.offerPercent ?? product.offerPercent ?? 0);
    const gstPercent = Number(req.body.gstPercent ?? product.gstPercent ?? 18);
    const price = Number(req.body.price ?? product.price);

    const pricing = calculatePricing({
      price,
      offerPercent,
      gstPercent,
    });

    // Handle image deletion
    let currentImages = [...product.imageUrls];
    const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [];
    
    if (imagesToDelete.length > 0) {
      // Remove images from database array
      currentImages = currentImages.filter(img => !imagesToDelete.includes(img));
      
      // Delete physical image files
      for (const imagePath of imagesToDelete) {
        try {
          const fullPath = path.join(process.cwd(), imagePath.replace(/^\//, ''));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Deleted image: ${fullPath}`);
          }
        } catch (err) {
          console.error(`Error deleting image ${imagePath}:`, err);
        }
      }
    }

    // Add new images
    let newImages = [];
    if (req.files?.length) {
      newImages = req.files.map(
        (f) => `/uploads/products/${path.basename(f.path)}`
      );
    }

    let stock;
    if (req.body.stock !== undefined) {
      stock = Math.max(0, Number(req.body.stock));
    } else {
      stock = product.stock;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: req.body.name ?? product.name,
        description: req.body.description ?? product.description,
        price,
        stock,
        productType: req.body.productType ?? product.productType,
        category: req.body.category ?? product.category,
        weight: req.body.weight ?? product.weight,
        rating: req.body.rating ?? product.rating,
        isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
        gstPercent,
        offerPercent,
        discountedPrice: pricing.discountedPrice,
        totalPrice: pricing.totalPrice,
        imageUrls: [...currentImages, ...newImages],
      },
      { new: true }
    );

    res.json({
      message: "✅ Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    res.status(500).json({ error: err.message });
  }
};



export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Param received:", id);

    let product;

    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      // Otherwise treat it as slug
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  }
};