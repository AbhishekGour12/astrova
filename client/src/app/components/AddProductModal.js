"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUpload } from 'react-icons/fa';

const AddProductModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrls: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call API to add product
    await onAdd(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#003D33]">Add New Product</h3>
          <button onClick={onClose} className="text-[#00695C] hover:text-[#C06014]">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields here */}
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#B2C5B2] text-[#003D33] py-3 rounded-2xl font-semibold"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="flex-1 bg-linear-to-r from-[#C06014] to-[#D47C3A] text-white py-3 rounded-2xl font-semibold"
            >
              Add Product
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProductModal;