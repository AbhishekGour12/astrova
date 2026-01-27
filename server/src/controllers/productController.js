import Product from "../models/Products.js";
import xlsx from "xlsx";
import path from 'path';
import fs from 'fs';
const XLSX = xlsx;



 const calculatePricing = ({
  price,
  offerPercent = 0,
  gstPercent = 18,
}) => {
  const basePrice = Number(price);

  const discount =
    offerPercent > 0 ? (basePrice * offerPercent) / 100 : 0;

  const discountedPrice = Number((basePrice - discount).toFixed(2));

  const gstAmount = (((discountedPrice * gstPercent) / (100 + gstPercent)).toFixed(2));

  const totalPrice = discountedPrice

  return {
    discountedPrice,
    gstAmount,
    totalPrice,
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
 export const addBulkProductsWithImages = async (req, res) => {
  try {
    const productsData = JSON.parse(req.body.products);
    const uploadedFiles = req.files || [];

    const imageUrls = uploadedFiles.map(
      (file) => `/uploads/products/${file.filename}`
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
        totalPrice: pricing.totalPrice,
        imageUrls: productImages,
        rating: Number(product.rating) || 0,
      };
    });

    const saved = await Product.insertMany(processedProducts);

    res.status(201).json({
      message: "✅ Products added successfully",
      count: saved.length,
      products: saved,
    });
  } catch (err) {
    console.error("❌ Bulk add error:", err);
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

// ✅ Bulk upload products via Excel (ENHANCED WITH OFFER LOGIC)
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
        const gstPercent = Number(row.gstpercent) || 18;
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
  offerPercent,
  gstPercent,
});

const discountedPrice = pricing.discountedPrice;
const gstAmount = pricing.gstAmount;
const totalPrice = pricing.totalPrice;

        // ✅ Image matching
        const productImages = [];
        if (row.images) {
          const imageNames = row.images
            .split(",")
            .map((n) => n.trim().toLowerCase());

          for (const imgName of imageNames) {
            const img = imageFiles.find(
              (f) => f.originalname.toLowerCase() === imgName
            );

            if (img) {
              const ext = path.extname(img.originalname);
              const uniqueName = `product-${Date.now()}-${Math.round(
                Math.random() * 1e9
              )}${ext}`;

              const targetPath = path.join("uploads", "products", uniqueName);
              fs.mkdirSync(path.dirname(targetPath), { recursive: true });
              fs.renameSync(img.path, targetPath);

              productImages.push(`/uploads/products/${uniqueName}`);
            } else {
              errors.push(
                `Row ${i + 2}: Image "${imgName}" not found`
              );
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
          gstPercent,
          rating,
          isFeatured:
            row.isfeatured === "TRUE" ||
            row.isfeatured === true ||
            row.isfeatured === "true",
          imageUrls: productImages,
          totalPrice,
        };

        const product = await Product.create(productData);
        products.push(product);

        console.log(`✅ Added product: ${product.name}`);
      } catch (err) {
        console.error(`❌ Row ${i + 2} error:`, err.message);
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    // 🧹 Cleanup temp files
    try {
      if (fs.existsSync(excelFile.path)) fs.unlinkSync(excelFile.path);
      imageFiles.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    } catch (cleanupErr) {
      console.warn("⚠️ Cleanup error:", cleanupErr.message);
    }

    // 📊 Response
    if (errors.length > 0) {
      return res.status(207).json({
        message: "Uploaded with partial errors",
        created: products.length,
        errors,
        products,
      });
    }

    res.status(201).json({
      message: `${products.length} products uploaded successfully`,
      products,
    });
  } catch (error) {
    console.error("💥 Excel upload error:", error);
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
    if (!product) return res.status(404).json({ error: "Product not found" });

    const offerPercent = Number(req.body.offerPercent ?? product.offerPercent ?? 0);
    const gstPercent = Number(req.body.gstPercent ?? product.gstPercent ?? 18);
    const price = Number(req.body.price ?? product.price);

    const pricing = calculatePricing({
      price,
      offerPercent,
      gstPercent,
    });

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
        isFeatured:
          req.body.isFeatured === "true" || req.body.isFeatured === true,
        gstPercent,
        offerPercent,
        discountedPrice: pricing.discountedPrice,
        totalPrice: pricing.totalPrice,
        imageUrls: [...product.imageUrls, ...newImages],
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