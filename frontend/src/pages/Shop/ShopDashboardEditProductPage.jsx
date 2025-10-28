import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { server } from '../../server';
import { getAuthToken } from '../../utils/auth';
import { useCategories } from '../../hooks/useCategories';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ShopDashboardEditProductPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { categories, subcategories, loading: categoriesLoading } = useCategories();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    stock: '',
    minOrderQuantity: '1'
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const response = await fetch(`${server}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.product) {
          const productData = data.product;
          setProduct(productData);
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            category: productData.category?._id || productData.category || '',
            subcategory: productData.subcategory?._id || productData.subcategory || '',
            minPrice: productData.originalPrice || '',
            maxPrice: productData.discountPrice || '',
            stock: productData.stock || '',
            minOrderQuantity: productData.minOrderQuantity || '1'
          });
          setExistingImages(productData.images || []);
        } else {
          toast.error(t('editProduct.notFound', 'Product not found'));
          navigate('/dashboard-products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to fetch product');
        navigate('/dashboard-products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast.error('Please select only image files');
    }
    
    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  // Remove selected image
  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    console.log('🔍 Frontend: Removing existing image at index:', index);
    setExistingImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log('🔍 Frontend: Updated existingImages:', newImages);
      return newImages;
    });
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    setDeleting(true);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${server}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Product deleted successfully');
        navigate('/dashboard-products');
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('editProduct.nameRequired', 'Product name is required');
    if (!formData.description.trim()) newErrors.description = t('editProduct.descriptionRequired', 'Description is required');
    if (!formData.category) newErrors.category = t('editProduct.categoryRequired', 'Category is required');
    if (!formData.subcategory) newErrors.subcategory = t('editProduct.subcategoryRequired', 'Subcategory is required');
    if (!formData.minPrice || formData.minPrice <= 0) newErrors.minPrice = t('editProduct.minPriceRequired', 'Valid minimum price is required');
    if (!formData.maxPrice || formData.maxPrice <= 0) newErrors.maxPrice = t('editProduct.maxPriceRequired', 'Valid maximum price is required');
    if (parseFloat(formData.minPrice) >= parseFloat(formData.maxPrice)) newErrors.maxPrice = t('editProduct.priceRangeInvalid', 'Maximum price must be greater than minimum price');
    if (!formData.stock || formData.stock < 0) newErrors.stock = t('editProduct.stockRequired', 'Valid stock quantity is required');
    if (formData.minOrderQuantity < 1) newErrors.minOrderQuantity = t('editProduct.minOrderQuantityRequired', 'Minimum order quantity must be at least 1');
    
    // Check if we have at least one image (existing or new)
    if (existingImages.length === 0 && selectedImages.length === 0) {
      newErrors.images = t('editProduct.imageRequired', 'At least one image is required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setSaving(true);
    
    try {
      const token = getAuthToken();
      const submitData = new FormData();
      
      // Add form data - map minPrice/maxPrice to originalPrice/discountPrice for backend
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('subcategory', formData.subcategory);
      submitData.append('originalPrice', formData.minPrice); // Map minPrice to originalPrice
      submitData.append('discountPrice', formData.maxPrice); // Map maxPrice to discountPrice
      submitData.append('stock', formData.stock);
      submitData.append('minOrderQuantity', formData.minOrderQuantity);
      
      // Add images to keep (existing images that weren't removed)
      console.log('🔍 Frontend: Sending imagesToKeep:', existingImages);
      submitData.append('imagesToKeep', JSON.stringify(existingImages));
      
      // Add new images
      console.log('🔍 Frontend: Adding new images:', selectedImages.length);
      selectedImages.forEach((image, index) => {
        submitData.append('images', image);
      });
      
      const response = await fetch(`${server}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Product updated successfully');
        navigate('/dashboard-products');
      } else {
        toast.error(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => navigate('/dashboard-products')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row w-full">
        <DashboardSideBar />
        
        <div className="flex-1 w-full p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard-products')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('editProduct.title', 'Edit Product')}</h1>
                  <p className="text-gray-600">{t('editProduct.subtitle', 'Update your product information')}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editProduct.basicInformation', 'Basic Information')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editProduct.productName', 'Product Name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('editProduct.productNamePlaceholder', 'Enter product name')}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editProduct.description', 'Description')} *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('editProduct.descriptionPlaceholder', 'Enter product description')}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editProduct.categorySubcategory', 'Category & Subcategory')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editProduct.category', 'Category')} *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{t('editProduct.selectCategory', 'Select a category')}</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {i18n.language === 'ar' ? category.nameAr : 
                           i18n.language === 'fr' ? category.nameFr : 
                           category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editProduct.subcategory', 'Subcategory')} *
                    </label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.subcategory ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={!formData.category}
                    >
                      <option value="">{t('editProduct.selectSubcategory', 'Select a subcategory')}</option>
                      {subcategories
                        .filter(sub => sub.category === formData.category)
                        .map((subcategory) => (
                          <option key={subcategory._id} value={subcategory._id}>
                            {i18n.language === 'ar' ? subcategory.nameAr : 
                             i18n.language === 'fr' ? subcategory.nameFr : 
                             subcategory.name}
                          </option>
                        ))}
                    </select>
                    {errors.subcategory && <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editProduct.pricingStock', 'Pricing & Stock')}</h2>
                
                {/* Pricing Range */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 mb-6">
                  <h3 className="text-md font-semibold text-orange-800 mb-4">{t('editProduct.pricingRange', 'Pricing Range')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Minimum Price */}
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-2">
                        {t('editProduct.minPrice', 'Minimum Price (DH)')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="minPrice"
                        value={formData.minPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.minPrice ? 'border-red-500' : 'border-orange-300'
                        }`}
                        placeholder={t('editProduct.minPricePlaceholder', '0.00')}
                      />
                      {errors.minPrice && <p className="text-red-500 text-sm mt-1">{errors.minPrice}</p>}
                    </div>

                    {/* Maximum Price */}
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-2">
                        {t('editProduct.maxPrice', 'Maximum Price (DH)')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxPrice"
                        value={formData.maxPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.maxPrice ? 'border-red-500' : 'border-orange-300'
                        }`}
                        placeholder={t('editProduct.maxPricePlaceholder', '0.00')}
                      />
                      {errors.maxPrice && <p className="text-red-500 text-sm mt-1">{errors.maxPrice}</p>}
                    </div>
                  </div>
                  
                  {/* Price Range Display */}
                  {formData.minPrice && formData.maxPrice && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium">
                        {t('editProduct.priceRangeDisplay', 'Price Range')}: {formData.minPrice} DH - {formData.maxPrice} DH
                      </p>
                    </div>
                  )}
                </div>

                {/* Stock & Order Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editProduct.stockQuantity', 'Stock Quantity')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                  </div>

                  {/* Minimum Order Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editProduct.minOrderQuantity', 'Minimum Order Quantity')}
                    </label>
                    <input
                      type="number"
                      name="minOrderQuantity"
                      value={formData.minOrderQuantity}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.minOrderQuantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1"
                    />
                    {errors.minOrderQuantity && <p className="text-red-500 text-sm mt-1">{errors.minOrderQuantity}</p>}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editProduct.productImages', 'Product Images')}</h2>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-3">{t('editProduct.currentImages', 'Current Images')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">{t('editProduct.addNewImages', 'Add New Images')}</h3>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  
                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{t('editProduct.selectedImages', 'Selected Images:')}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <FiX size={16} />
                  <span>{t('editProduct.deleteProduct', 'Delete Product')}</span>
                </button>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard-products')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('editProduct.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FiSave size={16} />
                    <span>{saving ? t('editProduct.updating', 'Updating...') : t('editProduct.updateProduct', 'Update Product')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('editProduct.deleteProductTitle', 'Delete Product')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('editProduct.deleteConfirmation', 'Are you sure you want to delete this product? This action cannot be undone.')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                {t('editProduct.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('editProduct.deleting', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <FiX size={16} />
                    <span>{t('editProduct.delete', 'Delete')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDashboardEditProductPage;
