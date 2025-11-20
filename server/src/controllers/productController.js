import Product from "../models/Products.js";
import xlsx from "xlsx";
import path from 'path';
import fs from 'fs';
const XLSX = xlsx;

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    // 🧾 Query parameters from frontend
    const {
      page = 1,
      limit = 10,
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
 */
export const addBulkProductsWithImages = async (req, res) => {
  try {
    // Parse product JSON from frontend
    const productsData = JSON.parse(req.body.products);
    const uploadedFiles = req.files || [];

    console.log("🟢 Total Files Received:", uploadedFiles.length);

    const totalImages = uploadedFiles.length;
    if (totalImages < productsData.length) {
      console.warn("⚠️ Warning: Less images than products, assigning sequentially");
    }

    const imageUrls = uploadedFiles.map((file) => `/uploads/products/${file.filename}`);

    let fileIndex = 0;

    // 🟢 Step 1: Process each product
   const processedProducts = productsData.map((product) => {
  const count = product.imageCount || product.imageFilesCount || 1;
  const productImages = imageUrls.slice(fileIndex, fileIndex + count);
  fileIndex += count;

  const gstPercent = product.gstPercent || 18;
  const gstAmount = (product.price * gstPercent) / 100;
  const totalPrice = Number(product.price) + gstAmount;

  return {
    ...product,
    rating: Number(product.rating) || 0, // ⭐ Added rating
    imageUrls: productImages,
    gstPercent,
    totalPrice,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

    // 🟢 Step 2: Save to DB
    const savedProducts = await Product.insertMany(processedProducts);

    res.status(201).json({
      message: "✅ Products added successfully",
      count: savedProducts.length,
      products: savedProducts,
    });
  } catch (err) {
    console.error("❌ Error saving products:", err);
    res.status(500).json({ error: err.message });
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

// ✅ Bulk upload products via Excel
export const uploadBulkProductsWithImages = async (req, res) => {
  try {
    console.log("🟢 Files received:", Object.keys(req.files || {}));

    const excelFile = req.files?.excelFile?.[0];
    const imageFiles = req.files?.productImages || [];

    if (!excelFile) {
      return res.status(400).json({ error: "Excel file is required" });
    }

    // ✅ Validate file format
    const excelExt = path.extname(excelFile.originalname).toLowerCase();
    if (![".xlsx", ".xls", ".csv"].includes(excelExt)) {
      fs.unlinkSync(excelFile.path);
      return res.status(400).json({ error: "Invalid Excel file format" });
    }

    // ✅ Read Excel
    const workbook = XLSX.readFile(excelFile.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📘 Processing ${rawData.length} rows from Excel`);

    const products = [];
    const errors = [];

    for (let i = 0; i < rawData.length; i++) {
      try {
        // ✅ Clean headers and trim values
        const cleanRow = {};
        for (const key in rawData[i]) {
          cleanRow[key.trim().toLowerCase()] = rawData[i][key];
        }
        const row = cleanRow;

        console.log(`🔹 Row ${i + 2}:`, row);

        // ✅ Validate required fields
        const required = ["name", "price", "stock", "producttype", "category"];
        const missing = required.filter((f) => !row[f]);
        if (missing.length > 0) {
          errors.push(`Row ${i + 2}: Missing required fields (${missing.join(", ")})`);
          continue;
        }

        // ✅ Find images (case-insensitive)
        const productImages = [];
        if (row.images) {
          const imageNames = row.images
            .split(",")
            .map((n) => n.trim().toLowerCase())
            .filter((n) => n);

          for (const imageName of imageNames) {
            const foundImage = imageFiles.find(
              (img) => img.originalname.toLowerCase() === imageName
            );

            if (foundImage) {
              const ext = path.extname(foundImage.originalname);
              const uniqueName = `product-${Date.now()}-${Math.round(
                Math.random() * 1e9
              )}${ext}`;
              const targetPath = path.join("uploads", "products", uniqueName);

              // Ensure directory exists
              fs.mkdirSync(path.dirname(targetPath), { recursive: true });
              fs.renameSync(foundImage.path, targetPath);

              productImages.push(`/uploads/products/${uniqueName}`);
            } else {
              console.warn(`⚠️ Image not found: ${imageName}`);
              errors.push(`Row ${i + 2}: Image "${imageName}" not found`);
            }
          }
        }

        // ✅ Parse numbers correctly
        const price = parseFloat(row.price);
        const stock = parseInt(row.stock);
        const weight = parseFloat(row.weight) || 0;
        const gstPercent = row.gstpercent > 1 ? row.gstpercent : row.gstpercent * 100;
        const rating = parseFloat(row.rating) || 0;

        if (isNaN(price) || price <= 0) {
          errors.push(`Row ${i + 2}: Invalid price`);
          continue;
        }
        if (isNaN(stock) || stock < 0) {
          errors.push(`Row ${i + 2}: Invalid stock`);
          continue;
        }

        const totalPrice = parseFloat((price + (price * gstPercent) / 100).toFixed(2));

        // ✅ Prepare final product
        const productData = {
          name: row.name.trim(),
          description: (row.description || "").toString().trim(),
          price,
          stock,
          productType: row.producttype.trim(),
          category: row.category.trim(),
          weight,
          gstPercent,
          rating,
          isFeatured:
            row.isfeatured === "TRUE" ||
            row.isfeatured === true ||
            row.isfeatured === "true",
          imageUrls: productImages,
          totalPrice,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const product = new Product(productData);
        await product.save();
        products.push(product);
        console.log(`✅ Added product: ${product.name}`);
      } catch (err) {
        console.error(`❌ Error in row ${i + 2}:`, err.message);
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    // ✅ Cleanup temporary Excel file
    try {
      if (fs.existsSync(excelFile.path)) fs.unlinkSync(excelFile.path);
      imageFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    } catch (cleanupErr) {
      console.warn("⚠️ Cleanup error:", cleanupErr.message);
    }

    console.log(`📊 ${products.length} products created, ${errors.length} errors`);
    if (errors.length > 0) {
      return res.status(207).json({
        message: `Processed with ${errors.length} errors`,
        created: products.length,
        errors,
        products,
      });
    }

    res.status(201).json({
      message: `${products.length} products created successfully`,
      products,
    });
  } catch (error) {
    console.error("💥 Bulk upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ Update product fields
    const fieldsToUpdate = {
  name: req.body.name || product.name,
  description: req.body.description || product.description,
  price: req.body.price || product.price,
  stock: req.body.stock || product.stock,
  productType: req.body.productType || product.productType,
  weight: req.body.weight || product.weight,
  gstPercent: req.body.gstPercent || 18,
  rating: req.body.rating || product.rating, // ⭐ Added
  isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
  category: req.body.category || product.category,
};


    // ✅ Handle new images (if uploaded)
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => `/uploads/products/${path.basename(file.path)}`);
    }

    // ✅ Merge existing + new images
    const finalImages = [
      ...(product.imageUrls || []),
      ...newImages,
    ];

    // ✅ Update database
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...fieldsToUpdate, imageUrls: finalImages },
      { new: true }
    );

    res.json({
      message: "✅ Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("❌ getProductById error:", error);
    res.status(500).json({ error: error.message });
  }
};