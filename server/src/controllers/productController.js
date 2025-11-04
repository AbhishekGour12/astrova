import Product from "../models/Products.js";
import xlsx from "xlsx";
import path from 'path'

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
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

    // Each product has its own imageFiles[] on frontend.
    // So we must receive files in the same order as appended.

    // Step 1: Validate count
    const totalImages = uploadedFiles.length;
    if (totalImages < productsData.length) {
      console.warn("⚠️ Warning: Less images than products, assigning sequentially");
    }

    // Step 2: Create image URL array
    const imageUrls = uploadedFiles.map((file) => `/uploads/products/${file.filename}`);

    // Step 3: Rebuild mapping from frontend array structure
    // On frontend you append all product images sequentially.
    // To fix this mapping, we’ll assume each product sent `imageCount` field (optional)
    // OR all images are grouped sequentially by order.
    let fileIndex = 0;

    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];

      // Get how many images were sent for this product
      const count = product.imageCount || product.imageFilesCount || 1; // fallback
      product.imageUrls = imageUrls.slice(fileIndex, fileIndex + count);
      fileIndex += count;
    }

    // Step 4: Save to DB
    const savedProducts = await Product.insertMany(productsData);

    res.status(201).json({
      message: "✅ Products added successfully",
      count: savedProducts.length,
      products: savedProducts,
    });
  } catch (err) {
    console.error("❌ Error saving products:", err);
    res.status(500).json({ error: err.message });
  }
}



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
    console.log(newType)
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
    const excelFile = req.files?.excelFile?.[0];
    const imageFiles = req.files?.productImages || [];

    if (!excelFile) {
      return res.status(400).json({ error: "Excel file is required" });
    }

    // Read Excel file
    const workbook = XLSX.readFile(excelFile.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const products = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        
        // Validate required fields
        if (!row.name || !row.price || !row.stock || !row.productType) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        // Find images for this product
        const productImages = [];
        if (row.images) {
          const imageNames = row.images.split(',').map(name => name.trim());
          
          for (const imageName of imageNames) {
            const foundImage = imageFiles.find(img => 
              img.originalname.toLowerCase() === imageName.toLowerCase()
            );
            
            if (foundImage) {
              // Create unique filename
              const ext = path.extname(foundImage.originalname);
              const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
              const imagePath = path.join('uploads', 'products', uniqueName);
              
              // Move file to permanent location
              fs.renameSync(foundImage.path, imagePath);
              
              productImages.push(`/uploads/products/${uniqueName}`);
            }
          }
        }

        // Calculate total price
        const price = parseFloat(row.price);
        const weight = parseFloat(row.weight) || 0;
        const gstPercent = parseFloat(row.gstPercent) || 18;
        const courierCharge = parseFloat(row.courierCharge) || 0;

        const gstAmount = (price * gstPercent) / 100;
        const totalPrice = price + gstAmount + courierCharge;

        const productData = {
          name: row.name,
          description: row.description || '',
          price: price,
          stock: parseInt(row.stock),
          productType: row.productType,
          weight: weight,
          gstPercent: gstPercent,
          courierCharge: courierCharge,
          isFeatured: row.isFeatured === 'TRUE' || row.isFeatured === true,
          imageUrls: productImages,
          totalPrice: totalPrice
        };

        const product = new Product(productData);
        await product.save();
        products.push(product);

      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    // Cleanup temporary files
    try {
      fs.unlinkSync(excelFile.path);
      imageFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    if (errors.length > 0) {
      return res.status(207).json({
        message: `Processed with ${errors.length} errors`,
        created: products.length,
        errors: errors,
        products: products
      });
    }

    res.status(201).json({
      message: `${products.length} products created successfully`,
      products: products
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
