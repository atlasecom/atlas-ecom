import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { server } from '../../server';
import { getAuthToken } from '../../utils/auth';
import { useCategories } from '../../hooks/useCategories';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ShopDashboardEditEventPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { categories, subcategories, loading: categoriesLoading } = useCategories();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    start_Date: '',
    Finish_Date: '',
    minPrice: '',
    maxPrice: '',
    stock: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const response = await fetch(`${server}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.event) {
          const eventData = data.event;
          setEvent(eventData);
          
          // Format dates for input
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
          };
          
          setFormData({
            name: eventData.name || '',
            description: eventData.description || '',
            category: eventData.category?._id || eventData.category || '',
            subcategory: eventData.subcategory?._id || eventData.subcategory || '',
            start_Date: formatDate(eventData.start_Date),
            Finish_Date: formatDate(eventData.Finish_Date),
            minPrice: eventData.originalPrice || '',
            maxPrice: eventData.discountPrice || '',
            stock: eventData.stock || ''
          });
          setExistingImages(eventData.images || []);
        } else {
          toast.error('Event not found');
          navigate('/dashboard-events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to fetch event');
        navigate('/dashboard-events');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
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
    console.log('🔍 Frontend Event: Removing existing image at index:', index);
    setExistingImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log('🔍 Frontend Event: Updated existingImages:', newImages);
      return newImages;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('editEvent.nameRequired', 'Event name is required');
    if (!formData.description.trim()) newErrors.description = t('editEvent.descriptionRequired', 'Description is required');
    if (!formData.category) newErrors.category = t('editEvent.categoryRequired', 'Category is required');
    if (!formData.subcategory) newErrors.subcategory = t('editEvent.subcategoryRequired', 'Subcategory is required');
    if (!formData.start_Date) newErrors.start_Date = t('editEvent.startDateRequired', 'Start date is required');
    if (!formData.Finish_Date) newErrors.Finish_Date = t('editEvent.endDateRequired', 'End date is required');
    if (!formData.minPrice || formData.minPrice <= 0) newErrors.minPrice = t('editEvent.minPriceRequired', 'Valid minimum price is required');
    if (!formData.maxPrice || formData.maxPrice <= 0) newErrors.maxPrice = t('editEvent.maxPriceRequired', 'Valid maximum price is required');
    if (parseFloat(formData.minPrice) >= parseFloat(formData.maxPrice)) newErrors.maxPrice = t('editEvent.priceRangeInvalid', 'Maximum price must be greater than minimum price');
    if (!formData.stock || formData.stock < 0) newErrors.stock = t('editEvent.stockRequired', 'Valid stock quantity is required');
    
    // Check dates
    if (formData.start_Date && formData.Finish_Date) {
      const startDate = new Date(formData.start_Date);
      const endDate = new Date(formData.Finish_Date);
      if (startDate >= endDate) {
        newErrors.Finish_Date = t('editEvent.endDateAfterStart', 'End date must be after start date');
      }
    }
    
    // Check if we have at least one image (existing or new)
    if (existingImages.length === 0 && selectedImages.length === 0) {
      newErrors.images = t('editEvent.imageRequired', 'At least one image is required');
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
      submitData.append('start_Date', formData.start_Date);
      submitData.append('Finish_Date', formData.Finish_Date);
      submitData.append('originalPrice', formData.minPrice); // Map minPrice to originalPrice
      submitData.append('discountPrice', formData.maxPrice); // Map maxPrice to discountPrice
      submitData.append('stock', formData.stock);
      
      // Add images to keep (existing images that weren't removed)
      console.log('🔍 Frontend Event: Sending imagesToKeep:', existingImages);
      submitData.append('imagesToKeep', JSON.stringify(existingImages));
      
      // Add new images
      console.log('🔍 Frontend Event: Adding new images:', selectedImages.length);
      selectedImages.forEach((image, index) => {
        submitData.append('images', image);
      });
      
      const response = await fetch(`${server}/api/events/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Event updated successfully');
        navigate('/dashboard-events');
      } else {
        toast.error(data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('editEvent.notFound', 'Event not found')}</p>
          <button
            onClick={() => navigate('/dashboard-events')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('editEvent.backToEvents', 'Back to Events')}
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
                  onClick={() => navigate('/dashboard-events')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('editEvent.title', 'Edit Event')}</h1>
                  <p className="text-gray-600">{t('editEvent.subtitle', 'Update your event information')}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editEvent.basicInformation', 'Basic Information')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.eventName', 'Event Name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('editEvent.eventNamePlaceholder', 'Enter event name')}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.description', 'Description')} *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('editEvent.descriptionPlaceholder', 'Enter event description')}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editEvent.categorySubcategory', 'Category & Subcategory')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.category', 'Category')} *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{t('editEvent.selectCategory', 'Select a category')}</option>
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
                      {t('editEvent.subcategory', 'Subcategory')} *
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
                      <option value="">{t('editEvent.selectSubcategory', 'Select a subcategory')}</option>
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

              {/* Event Dates */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editEvent.eventDates', 'Event Dates')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.startDateTime', 'Start Date & Time')} *
                    </label>
                    <input
                      type="datetime-local"
                      name="start_Date"
                      value={formData.start_Date}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.start_Date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.start_Date && <p className="text-red-500 text-sm mt-1">{errors.start_Date}</p>}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.endDateTime', 'End Date & Time')} *
                    </label>
                    <input
                      type="datetime-local"
                      name="Finish_Date"
                      value={formData.Finish_Date}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.Finish_Date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.Finish_Date && <p className="text-red-500 text-sm mt-1">{errors.Finish_Date}</p>}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editEvent.pricingStock', 'Pricing & Stock')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Minimum Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.minPrice', 'Minimum Price (DH)')} *
                    </label>
                    <input
                      type="number"
                      name="minPrice"
                      value={formData.minPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.minPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('editEvent.minPricePlaceholder', '0.00')}
                    />
                    {errors.minPrice && <p className="text-red-500 text-sm mt-1">{errors.minPrice}</p>}
                  </div>

                  {/* Maximum Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.maxPrice', 'Maximum Price (DH)')} *
                    </label>
                    <input
                      type="number"
                      name="maxPrice"
                      value={formData.maxPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.maxPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('editEvent.maxPricePlaceholder', '0.00')}
                    />
                    {errors.maxPrice && <p className="text-red-500 text-sm mt-1">{errors.maxPrice}</p>}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('editEvent.stockQuantity', 'Stock Quantity')} *
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
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('editEvent.eventImages', 'Event Images')}</h2>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-3">{t('editEvent.currentImages', 'Current Images')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Event ${index + 1}`}
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
                  <h3 className="text-md font-medium text-gray-700 mb-3">{t('editEvent.addNewImages', 'Add New Images')}</h3>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  
                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{t('editEvent.selectedImages', 'Selected Images:')}</h4>
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
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard-events')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('editEvent.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <FiSave size={16} />
                  <span>{saving ? t('editEvent.updating', 'Updating...') : t('editEvent.updateEvent', 'Update Event')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboardEditEventPage;
