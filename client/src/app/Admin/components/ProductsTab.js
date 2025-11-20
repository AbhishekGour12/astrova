import axios from 'axios';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaStar, 
  FaUpload, 
  FaDownload,
  FaFileExcel,
  FaTimes,
  FaCheck,
  FaShoppingBag,
  FaSave,
  FaImage
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import {adminAPI} from '../../lib/admin'
import { productAPI } from '../../lib/product';
const API_BASE_URL = 'http://localhost:5000/api';

const ProductsTab = ({ products: initialProducts, searchTerm }) => {
  const [products, setProducts] = useState(initialProducts);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productTypes, setProductTypes] = useState(["Bracelet", "Rudraksha", "Yantra", "Chain", "Gemstone", "Pendant", "Stones"]);
  const [newType, setNewType] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('manual');
  const [filters, setFilters] = useState({page: 1,
  limit: 10,
  search: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  isFeatured: '',
  sortBy: "price",
  order: "asc"}) // 'manual' or 'excel'
const category = ["Gift", "Love", "Money", "Evil Eye", "Health", "Gifting", "Career"];
  // Bulk products state - array of product forms
  const [bulkProducts, setBulkProducts] = useState([createEmptyProduct()]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    productType: '',
    weight: '',
    gstPercent: 18,
    rating: 0,
  
    isFeatured: false,
    imageUrls: [],
    category: '',
    
  });

  function createEmptyProduct() {
    return {
      name: '',
      description: '',
      price: '',
      stock: '',
      productType: '',
      weight: '',
      rating: 0,
      
      isFeatured: false,
      imageFiles: [],
      category: '' // For new image uploads
    };
  }
  
  // Fetch product types on component mount
  useEffect(() => {
    fetchProductTypes();
    fetchProducts();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await adminAPI.getProductTypes();
      setProductTypes(response);
      console.log(response)
      if(response.length < 1){
        setProductTypes(["Bracelet", "Rudraksha", "Yantra", "Chain", "Gemstone", "Pendant", "Stones"]);
      }
    } catch (error) {

      console.error('Error fetching product types:', error);
    }
  };

  const fetchProducts = async () => {
    try {
     
      const {products, totalPages} = await adminAPI.getProducts(filters);
      setProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addProductType = async () => {
    if (!newType.trim()) return;

    try {
      const response = await adminAPI.addProductType(newType.trim());
      

      if (response) {
        await fetchProductTypes();
        setNewType('');
        alert('Product type added successfully!');
      } else {
        
        const error = await response.json();
        throw new Error(error.error || 'Failed to add product type');
      }
    } catch (error) {
      console.error('Error adding product type:', error);
      alert(`Error adding product type: ${error.message}`);
    }
  };

  // File handling functions
  

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

 

  // Bulk product management
  const addBulkProductRow = () => {
    setBulkProducts(prev => [...prev, createEmptyProduct()]);
  };

  const removeBulkProductRow = (index) => {
    if (bulkProducts.length === 1) return;
    setBulkProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateBulkProduct = (index, field, value) => {
    setBulkProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const handleBulkProductImage = (index, files) => {
    const fileArray = Array.from(files);
    setBulkProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, imageFiles: fileArray } : product
    ));
  };

  // Add bulk products with images - CORRECTED ENDPOINT
  const addBulkProducts = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();

    // Prepare all product data
   const productsData = bulkProducts.map((product) => ({
  name: product.name,
  description: product.description || '',
  price: Number(product.price),
  stock: Number(product.stock),
  weight: Number(product.weight),
  rating: Number(product.rating)||0,
  
  productType: product.productType,
  isFeatured: Boolean(product.isFeatured),
  imageFilesCount: product.imageFiles.length,
  category: product.category || '', // ✅ Add this line

}));


    // ✅ Attach JSON string of product data
    formData.append("products", JSON.stringify(productsData));

    // ✅ Append all image files
    bulkProducts.forEach((p) => {
      if (p.imageFiles && p.imageFiles.length > 0) {
        for (let file of p.imageFiles) {
          formData.append("images", file); // must match multer field
        }
      }
    });

    // ✅ Send with correct headers
    const response = await adminAPI.createProduct(formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    

    console.log("Response:", response);
    alert("✅ Products uploaded successfully");
    setLoading(false);
  } catch (error) {
    console.error("Upload error:", error);
    alert("Upload failed: " + error.message);
    setLoading(false);
  }
};



  

  // Edit product functions
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
  name: product.name,
  description: product.description || '',
  price: product.price,
  stock: product.stock,
  productType: product.productType,
  weight: product.weight,
  gstPercent: product.gstPercent || 18,
  rating: product.rating || 0, // ⭐ Added
  isFeatured: product.isFeatured || false,
  imageUrls: product.imageUrls || [],
  category: product.category || '',
});

    setShowEditModal(true);
  };

  // Since update endpoint is not defined in your routes, we'll implement it
  const updateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('description', editForm.description);
    formData.append('price', editForm.price);
    formData.append('stock', editForm.stock);
    formData.append('productType', editForm.productType);
    formData.append('weight', editForm.weight);
    formData.append('gstPercent', editForm.gstPercent);
    formData.append('courierCharge', editForm.courierCharge);
    formData.append('isFeatured', editForm.isFeatured);

    // Append new images if any
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      // Note: You need to add this route in your backend
      const response = await adminAPI.updateProduct(editingProduct._id, formData);

      if (response) {
        await fetchProducts();
        setShowEditModal(false);
        setEditingProduct(null);
        setSelectedFiles([]);
        alert('Product updated successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Error updating product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      // Note: You need to add this route in your backend
      const response = await adminAPI.deleteProduct(productId);

      if (response) {
        await fetchProducts();
        alert('Product deleted successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Error deleting product: ${error.message}`);
    }
  };

  // Reset functions
  const resetBulkForm = () => {
    setBulkProducts([createEmptyProduct()]);
    setSelectedFiles([]);
  };
  // Enhanced Excel upload with images
const uploadExcelProducts = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();

    // ✅ Excel file
    const excelFile = selectedFiles.find(f =>
      f.name.endsWith(".xlsx") || f.name.endsWith(".xls") || f.name.endsWith(".csv")
    );
    if (!excelFile) {
      alert("Please select a valid Excel file");
      return;
    }
    formData.append("excelFile", excelFile);

    // ✅ Image files
    selectedFiles
      .filter(f => f.type.startsWith("image/"))
      .forEach(file => formData.append("productImages", file));

    const response = await fetch("http://localhost:5000/api/admin/bulk-upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok || response.status === 207) {
      alert(`✅ Uploaded ${result.products?.length || 0} products successfully`);
      await fetchProducts();
      setShowBulkUploadModal(false);
      setSelectedFiles([]);
    } else {
      alert(`❌ Upload failed: ${result.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Upload Excel error:", error);
    alert(`Upload failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


// Enhanced drag and drop for multiple file types
const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }
};

// Enhanced file upload handler
const handleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  setSelectedFiles(prev => [...prev, ...files]);
};

// Remove individual file
const removeFile = (index) => {
  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
};

// Enhanced Excel template download
const downloadExcelTemplate = () => {
  const templateData = [
  {
    'name': 'Sample Product',
    'description': 'Product description',
    'price': 99.99,
    'stock': 10,
    'productType': 'Bracelet',
    'weight': 0.5,
    'gstPercent': 18,
    'rating': 4.5, // ⭐ Added
    'images': 'product1.jpg,product2.jpg',
    'category': 'Gift',
    'isFeatured': 'TRUE'
  }
];


  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Add instructions sheet
  const instructions = [
    ['INSTRUCTIONS FOR EXCEL UPLOAD:'],
    [''],
    ['1. Fill product data in the Products sheet'],
    ['2. Required fields: name, price, stock, productType'],
    ['3. Images column: Add comma-separated image filenames'],
    ['4. Supported image formats: JPG, PNG, WebP'],
    ['5. Upload both Excel file and images together'],
    ['6. Image filenames in Excel must match uploaded image files exactly'],
    ['7. Keep all files in the same folder before uploading'],
     ['8. Add rating between 0 and 5 in the "rating" column'],

    ['EXAMPLE:'],
    ['images column: "product1.jpg,product2.jpg"'],
    ['Then upload product1.jpg and product2.jpg along with Excel file']
  ];
  
  const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');

  XLSX.writeFile(workbook, 'product_template_with_images.xlsx');
};

  

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#003D33]">Product Management</h2>
          <p className="text-[#00695C]">Manage your spiritual products inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#00695C] bg-[#ECE5D3] px-3 py-1 rounded-full">
            {filteredProducts.length} products
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTypesModal(true)}
            className="bg-[#003D33] text-white px-4 py-3 rounded-2xl font-semibold flex items-center gap-2"
          >
            <FaShoppingBag />
            Manage Types
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBulkUploadModal(true)}
            className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
          >
            <FaPlus />
            Add Products
          </motion.button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#B2C5B2] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
  <tr>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Product</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Type</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Price</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Rating</th> {/* ⭐ NEW */}
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Stock</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Weight</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Total Price</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Status</th>
    <th className="px-6 py-4 text-left text-[#003D33] font-semibold">Actions</th>
  </tr>
</thead>

<tbody className="divide-y divide-[#B2C5B2]">
  {filteredProducts.map((product) => (
    <motion.tr
      key={product._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-[#F7F3E9] transition-colors"
    >
      {/* 🧿 Product Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-2xl flex items-center justify-center text-white font-semibold overflow-hidden">
            {product.imageUrls?.[0] ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API}${product.imageUrls[0]}`}
                alt={product.name}
                className="w-12 h-12 object-cover"
              />
            ) : (
              <FaImage className="text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-[#003D33]">{product.name}</p>
            <p className="text-sm text-[#00695C] line-clamp-1">
              {product.description}
            </p>
            {product.isFeatured && (
              <span className="text-amber-500 text-xs">★ Featured</span>
            )}
          </div>
        </div>
      </td>

      {/* 🧿 Type */}
      <td className="px-6 py-4">
        <span className="text-[#00695C] bg-[#ECE5D3] px-2 py-1 rounded-full text-sm">
          {product.productType}
        </span>
      </td>

      {/* 💰 Price */}
      <td className="px-6 py-4">
        <span className="text-[#003D33] font-semibold">₹{product.price}</span>
      </td>

      {/* ⭐ Rating */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`${
                i < Math.round(product.rating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-[#003D33] font-medium ml-1">
            {product.rating?.toFixed(1) || "0.0"}
          </span>
        </div>
      </td>

      {/* 📦 Stock */}
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            product.stock > 10
              ? "bg-green-100 text-green-600"
              : product.stock > 0
              ? "bg-amber-100 text-amber-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {product.stock} in stock
        </span>
      </td>

      {/* ⚖️ Weight */}
      <td className="px-6 py-4">
        <span className="text-[#00695C]">{product.weight} kg</span>
      </td>

      {/* 💵 Total Price */}
      <td className="px-6 py-4">
        <span className="text-[#C06014] font-bold">₹{product.totalPrice}</span>
        <p className="text-xs text-[#00695C]">incl. GST</p>
      </td>

      {/* 🟢 Status */}
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            product.stock > 0
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {product.stock > 0 ? "Available" : "Out of Stock"}
        </span>
      </td>

      {/* ⚙️ Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openEditModal(product)}
            className="p-2 text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors"
            title="Edit Product"
          >
            <FaEdit />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deleteProduct(product._id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
            title="Delete Product"
          >
            <FaTrash />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  ))}
</tbody>

          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[#B2C5B2]">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#003D33]">Add Products in Bulk</h3>
                <button
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    resetBulkForm();
                  }}
                  className="p-2 hover:bg-[#F7F3E9] rounded-2xl transition-colors"
                >
                  <FaTimes className="text-[#00695C]" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-4 py-2 rounded-2xl font-semibold transition-colors ${
                    activeTab === 'manual' 
                      ? 'bg-[#C06014] text-white' 
                      : 'bg-[#F7F3E9] text-[#003D33]'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  onClick={() => setActiveTab('excel')}
                  className={`px-4 py-2 rounded-2xl font-semibold transition-colors ${
                    activeTab === 'excel' 
                      ? 'bg-[#C06014] text-white' 
                      : 'bg-[#F7F3E9] text-[#003D33]'
                  }`}
                >
                  Excel Upload
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'manual' ? (
                <form onSubmit={addBulkProducts} className="space-y-6">
                  {/* Bulk Product Forms */}
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    {bulkProducts.map((product, index) => (
                      <div key={index} className="bg-[#F7F3E9] rounded-2xl p-6 border-2 border-[#B2C5B2]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-[#003D33]">
                            Product {index + 1}
                          </h4>
                          {bulkProducts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBulkProductRow(index)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={product.name}
                              onChange={(e) => updateBulkProduct(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                              placeholder="Enter product name"
                            />
                          </div>

                          <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Product Type *
                            </label>
                            <select
                              required
                              value={product.productType}
                              onChange={(e) => updateBulkProduct(index, 'productType', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                            >
                              <option value="">Select Type</option>
                              {productTypes.map((type, typeIndex) => (
                                <option key={typeIndex} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
       
                          <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Price (₹) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={product.price}
                              onChange={(e) => updateBulkProduct(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Stock *
                            </label>
                            <input
                              type="number"
                              required
                              value={product.stock}
                              onChange={(e) => updateBulkProduct(index, 'stock', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Weight (kg) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={product.weight}
                              onChange={(e) => updateBulkProduct(index, 'weight', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                              placeholder="0.5"
                            />
                          </div>
                             <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Product Category *
                            </label>
                            <select
                              required
                              value={product.category}
                              onChange={(e) => updateBulkProduct(index, 'category', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                            >
                              <option value="">Select Type</option>
                              {category.map((type, typeIndex) => (
                                <option key={typeIndex} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          
                        </div>

                        <div className="mb-4">
                          <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                            Description
                          </label>
                          <textarea
                            value={product.description}
                            onChange={(e) => updateBulkProduct(index, 'description', e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                            placeholder="Product description (optional)"
                          />
                        </div>

                        {/* Image Upload for this product */}
                        <div className="mb-4">
                          <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                            Product Images
                          </label>
                          <div className="border-2 border-dashed border-[#B2C5B2] rounded-xl p-4 text-center bg-white">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleBulkProductImage(index, e.target.files)}
                              className="hidden"
                              id={`product-images-${index}`}
                            />
                            <label
                              htmlFor={`product-images-${index}`}
                              className="cursor-pointer block"
                            >
                              <FaUpload className="text-2xl text-[#00695C] mx-auto mb-2" />
                              <p className="text-[#003D33] text-sm mb-2">
                                Click to upload images for this product
                              </p>
                              <span className="inline-block bg-[#C06014] text-white px-4 py-2 rounded-2xl text-sm hover:bg-[#A05010] transition-colors">
                                Browse Files
                              </span>
                            </label>
                            {product.imageFiles.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-[#00695C]">
                                  {product.imageFiles.length} file(s) selected
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
  <label className="block text-[#003D33] font-semibold mb-2 text-sm">
    Rating (1–5)
  </label>
  <input
    type="number"
    min="0"
    max="5"
    step="0.1"
    value={product.rating}
    onChange={(e) => updateBulkProduct(index, 'rating', e.target.value)}
    className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
    placeholder="e.g. 4.5"
  />
</div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`isFeatured-${index}`}
                            checked={product.isFeatured}
                            onChange={(e) => updateBulkProduct(index, 'isFeatured', e.target.checked)}
                            className="w-4 h-4 text-[#C06014] bg-white border-gray-300 rounded focus:ring-[#C06014]"
                          />
                          <label htmlFor={`isFeatured-${index}`} className="text-[#003D33] font-semibold text-sm">
                            Feature this product
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add More Product Button */}
                  <button
                    type="button"
                    onClick={addBulkProductRow}
                    className="w-full border-2 border-dashed border-[#B2C5B2] text-[#00695C] py-4 rounded-2xl hover:bg-[#F7F3E9] transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus />
                    Add Another Product
                  </button>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkUploadModal(false);
                        resetBulkForm();
                      }}
                      className="flex-1 px-6 py-3 border border-[#B2C5B2] text-[#003D33] rounded-2xl hover:bg-[#F7F3E9] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Adding Products...' : `Add ${bulkProducts.length} Products`}
                    </button>
                  </div>
                </form>
              ) : (
                /* Excel Upload Tab */
               
<div className="space-y-6">
  <div className="bg-[#F7F3E9] rounded-2xl p-6">
    <h4 className="text-lg font-bold text-[#003D33] mb-4 flex items-center gap-2">
      <FaFileExcel className="text-green-600" />
      Upload Excel File with Images
    </h4>
    
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
        dragActive ? 'border-[#C06014] bg-white' : 'border-[#B2C5B2] bg-white'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <FaFileExcel className="text-4xl text-green-600 mx-auto mb-2" />
      <FaImage className="text-3xl text-blue-600 mx-auto mb-3" />
      <p className="text-[#003D33] mb-2 font-semibold">
        Drag & drop Excel file + Product Images
      </p>
      <p className="text-sm text-[#00695C] mb-3">
        Upload Excel file along with product images. Image names in Excel should match uploaded files.
      </p>
      <input
        type="file"
        multiple
        accept=".xlsx,.xls,.csv,image/*"
        onChange={handleFileUpload}
        className="hidden"
        id="excel-images-files"
      />
      <label
        htmlFor="excel-images-files"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded-2xl cursor-pointer hover:bg-green-700 transition-colors"
      >
        Choose Excel & Image Files
      </label>
    </div>

    {/* Selected Files Preview */}
    {selectedFiles.length > 0 && (
      <div className="mt-4">
        <h5 className="text-[#003D33] font-semibold mb-2">Selected Files:</h5>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
              <div className="flex items-center gap-2">
                {file.type.startsWith('image/') ? (
                  <FaImage className="text-blue-500" />
                ) : (
                  <FaFileExcel className="text-green-500" />
                )}
                <span className="text-sm text-[#003D33]">{file.name}</span>
                <span className="text-xs text-[#00695C]">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#00695C] mt-2">
          Excel files: {selectedFiles.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')).length} | 
          Images: {selectedFiles.filter(f => f.type.startsWith('image/')).length}
        </p>
      </div>
    )}

    <div className="grid grid-cols-2 gap-4 mt-6">
      <button
        onClick={downloadExcelTemplate}
        className="bg-[#003D33] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
      >
        <FaDownload />
        Download Template
      </button>

      <button
        onClick={uploadExcelProducts}
        disabled={loading || !selectedFiles.find(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))}
        className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white py-3 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Uploading...' : 'Upload Excel & Images'}
      </button>
    </div>
  </div>
</div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[#B2C5B2]">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#003D33]">Edit Product</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-[#F7F3E9] rounded-2xl transition-colors"
                >
                  <FaTimes className="text-[#00695C]" />
                </button>
              </div>
            </div>

            <form onSubmit={updateProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#003D33] font-semibold mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                  />
                </div>

                <div>
                  <label className="block text-[#003D33] font-semibold mb-2">Product Type *</label>
                  <select
                    required
                    value={editForm.productType}
                    onChange={(e) => setEditForm({...editForm, productType: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                  >
                    <option value="">Select Type</option>
                    {productTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#003D33] font-semibold mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                  />
                </div>

                <div>
                  <label className="block text-[#003D33] font-semibold mb-2">Stock *</label>
                  <input
                    type="number"
                    required
                    value={editForm.stock}
                    onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                  />
                </div>
               
                <div>
                  <label className="block text-[#003D33] font-semibold mb-2">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.weight}
                    onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                  />
                </div>
                   <div>
                            <label className="block text-[#003D33] font-semibold mb-2 text-sm">
                              Product Category *
                            </label>
                            <select
                              required
                              value={editForm.category}
                              onChange={(e) => updateBulkProduct(index, 'category', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#B2C5B2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33] text-sm"
                            >
                              <option value="">Select Type</option>
                              {category.map((type, typeIndex) => (
                                <option key={typeIndex} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
            
              </div>

              <div>
                <label className="block text-[#003D33] font-semibold mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                />
              </div>

              {/* Current Images */}
              {editForm.imageUrls.length > 0 && (
                <div>
                  <label className="block text-[#003D33] font-semibold mb-2">Current Images</label>
                  <div className="flex gap-2 flex-wrap">
                    {editForm.imageUrls.map((url, index) => (
                      <div key={index} className="w-20 h-20 rounded-2xl overflow-hidden border border-[#B2C5B2]">
                        <img 
                          src={`http://localhost:5000${url}`} 
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div>
                <label className="block text-[#003D33] font-semibold mb-2">Add New Images</label>
                <div className="border-2 border-dashed border-[#B2C5B2] rounded-2xl p-6 text-center bg-[#F7F3E9]">
                  <FaUpload className="text-3xl text-[#00695C] mx-auto mb-3" />
                  <p className="text-[#003D33] mb-3">
                    Drag & drop new images or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="edit-product-images"
                  />
                  <label
                    htmlFor="edit-product-images"
                    className="inline-block bg-[#C06014] text-white px-6 py-2 rounded-2xl cursor-pointer hover:bg-[#A05010] transition-colors"
                  >
                    Browse Files
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-[#00695C]">
                        {selectedFiles.length} new file(s) selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
                <div>
  <label className="block text-[#003D33] font-semibold mb-2">Rating (1–5)</label>
  <input
    type="number"
    min="0"
    max="5"
    step="0.1"
    value={editForm.rating}
    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
    className="w-full px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
  />
</div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-isFeatured"
                  checked={editForm.isFeatured}
                  onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})}
                  className="w-4 h-4 text-[#C06014] bg-gray-100 border-gray-300 rounded focus:ring-[#C06014]"
                />
                <label htmlFor="edit-isFeatured" className="text-[#003D33] font-semibold">
                  Feature this product
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-[#B2C5B2] text-[#003D33] rounded-2xl hover:bg-[#F7F3E9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Types Modal */}
      {showTypesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md"
          >
            <div className="p-6 border-b border-[#B2C5B2]">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#003D33]">Manage Product Types</h3>
                <button
                  onClick={() => setShowTypesModal(false)}
                  className="p-2 hover:bg-[#F7F3E9] rounded-2xl transition-colors"
                >
                  <FaTimes className="text-[#00695C]" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-[#003D33] font-semibold mb-2">Add New Type</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter new product type"
                    className="flex-1 px-4 py-3 bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C06014] text-[#003D33]"
                  />
                  <button
                    onClick={addProductType}
                    disabled={!newType.trim()}
                    className="bg-[#C06014] text-white px-4 py-3 rounded-2xl hover:bg-[#A05010] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#003D33] mb-3">Available Types</h4>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
                  {productTypes.length > 0 ? (
                    productTypes.map((type, index) => (
                      <span
                        key={index}
                        className="bg-[#ECE5D3] text-[#003D33] px-3 py-2 rounded-2xl text-sm border border-[#B2C5B2]"
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <p className="text-[#00695C] text-sm">No product types available</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;