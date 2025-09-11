import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { createevent, clearErrors } from "../../redux/actions/event";
import { FiPlus, FiUpload, FiX, FiCalendar, FiDollarSign, FiTag, FiImage, FiInfo, FiBarChart } from "react-icons/fi";

const CreateEvent = () => {
  const { user } = useSelector((state) => state.user);
  const eventState = useSelector((state) => state.events);
  const message = eventState?.message || null;
  const error = eventState?.error || null;
  const createLoading = eventState?.isLoading || false;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = i18n.language === "ar";

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [tags, setTags] = useState("");
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [stock, setStock] = useState();
  const [minOrderQuantity, setMinOrderQuantity] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    setStartDate(startDate);
    setEndDate(null);
    document.getElementById("end-date").min = minEndDate
      .toISOString()
      .slice(0, 10);
  };

  const handleEndDateChange = (e) => {
    const endDate = new Date(e.target.value);
    setEndDate(endDate);
  };

  const today = new Date().toISOString().slice(0, 10);

  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : "";

  const handleImageChange = (e) => {
    e.preventDefault();

    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const resetForm = () => {
    console.log('Resetting form fields');
    setImages([]);
    setName("");
    setDescription("");
    setCategory("Electronics");
    setTags("");
    setMinPrice("");
    setMaxPrice("");
    setStock("");
    setMinOrderQuantity(1);
    setStartDate(null);
    setEndDate(null);
    console.log('Form reset completed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !name ||
        !description ||
        !category ||
        !tags ||
        !minPrice ||
        !maxPrice ||
        !stock ||
        !minOrderQuantity ||
        !startDate ||
        !endDate ||
        images.length === 0
      ) {
        toast.error(
          t("createEvent.fillAllFields", "Please fill in all required fields")
        );
        setLoading(false);
        return;
      }

      // Validate pricing
      if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
        toast.error("Maximum price must be greater than minimum price");
        setLoading(false);
        return;
      }

      const newForm = new FormData();

      images.forEach((image) => {
        newForm.append("images", image);
      });
      newForm.append("name", name);
      newForm.append("description", description);
      newForm.append("category", category);
      newForm.append("tags", tags);

      // Use minPrice as originalPrice and maxPrice as discountPrice for backend compatibility
      newForm.append("originalPrice", minPrice);
      newForm.append("discountPrice", maxPrice);
      newForm.append("stock", stock);
      newForm.append("minOrderQuantity", minOrderQuantity);
      const shopId = user.shop._id || user.shop;
      // Note: shopId is not needed as it's taken from user.shop in backend
      newForm.append("start_Date", startDate.toISOString());
      newForm.append("Finish_Date", endDate.toISOString());

      console.log('Creating event with form data');
      await dispatch(createevent(newForm));
      
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create success/error from Redux state
  useEffect(() => {
    console.log('Success effect triggered:', { message, createLoading });
    if (message && !createLoading) {
      console.log('Resetting form and showing success message');
      toast.success(message);
      // Reset form first
      resetForm();
      // Clear the message
      dispatch(clearErrors());
      // Redirect to dashboard after a short delay so user can see form reset
      setTimeout(() => {
        navigate("/dashboard-events");
      }, 1500);
    }
  }, [message, createLoading, navigate, dispatch]);

  // Handle create error from Redux state
  useEffect(() => {
    if (error && !createLoading) {
      toast.error(error);
      // Clear the error
      dispatch(clearErrors());
    }
  }, [error, createLoading, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <FiBarChart className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {t("createEvent.title", "Create New Event")}
            </h1>
            <p className="text-gray-600 text-lg">
              {t("createEvent.subtitle", "Create a special event to promote your products")}
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {/* Event Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Event Name */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <FiBarChart className="mr-2 text-orange-500" size={16} />
                      {t("createEvent.name", "Event Name")} 
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      required
                      maxLength="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("createEvent.namePlaceholder", "Enter your event name...")}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t("createEvent.charactersCount", "{{count}}/100 characters", { count: name.length })}</span>
                      <span>{t("createEvent.minCharacters", "Minimum 2 required")}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <FiTag className="mr-2 text-orange-500" size={16} />
                      {t("createEvent.category", "Category")} 
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      value={category}
                      required
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">{t("createEvent.chooseCategory", "Choose a category")}</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Sports & Outdoors">Sports & Outdoors</option>
                      <option value="Health & Beauty">Health & Beauty</option>
                      <option value="Books & Media">Books & Media</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Toys & Games">Toys & Games</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                      <option value="Pet Supplies">Pet Supplies</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <FiTag className="mr-2 text-orange-500" size={16} />
                      {t("createEvent.tags", "Tags")}
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={tags}
                      maxLength="200"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Enter tags separated by commas..."
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {tags.length}/200 characters
                    </div>
                  </div>

                  {/* Event Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <FiCalendar className="mr-2 text-orange-500" size={16} />
                        {t("createEvent.startDate", "Start Date")} 
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        onChange={handleStartDateChange}
                        min={today}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <FiCalendar className="mr-2 text-orange-500" size={16} />
                        {t("createEvent.endDate", "End Date")} 
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        id="end-date"
                        value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        onChange={handleEndDateChange}
                        min={minEndDate}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Pricing Section */}
                <div className="space-y-6">
                  {/* Pricing Range */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center mb-4">
                      <FiDollarSign className="mr-2 text-orange-600" size={20} />
                      <h3 className="text-lg font-semibold text-orange-800">Event Pricing Range</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-800">
                          Minimum Price (DH) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="minPrice"
                          value={minPrice}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-800">
                          Maximum Price (DH) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="maxPrice"
                          value={maxPrice}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    {minPrice && maxPrice && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-800 font-medium">
                          Price Range: {minPrice} DH - {maxPrice} DH
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stock & Order Quantity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={stock}
                        required
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Min. Order Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="minOrderQuantity"
                        value={minOrderQuantity}
                        required
                        min="1"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        onChange={(e) => setMinOrderQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2 mb-8">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <FiInfo className="mr-2 text-orange-500" size={16} />
                  {t("createEvent.description", "Event Description")} 
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  required
                  rows="6"
                  name="description"
                  value={description}
                  maxLength="2000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your event in detail..."
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{description.length}/2000 characters</span>
                  <span>Minimum 10 required</span>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4 mb-8">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <FiImage className="mr-2 text-orange-500" size={16} />
                  {t("createEvent.uploadImages", "Event Images")} 
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                <input
                  type="file"
                  name="images"
                  id="upload"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                <label htmlFor="upload" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200">
                    <FiUpload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Event Images</p>
                    <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select images</p>
                    <div className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      <FiPlus className="mr-2" size={16} />
                      Choose Files
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Supports: JPG, PNG, GIF, WebP (Max: 10MB each, Up to 10 images)
                    </p>
                  </div>
                </label>
                
                {/* Image Previews */}
                {images && Array.isArray(images) && images.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      Uploaded Images ({images.length}/10):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Event image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                            title="Remove image"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard-events")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || createLoading || !name.trim() || !description.trim() || !category || !minPrice || !maxPrice || !stock || !minOrderQuantity || !startDate || !endDate || !images || images.length === 0}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    loading || createLoading || !name.trim() || !description.trim() || !category || !minPrice || !maxPrice || !stock || !minOrderQuantity || !startDate || !endDate || !images || images.length === 0
                        ? 'bg-gray-400 cursor-not-allowed transform-none'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading || createLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("createEvent.creating", "Creating Event...")}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FiBarChart className="mr-2" size={16} />
                      {t("createEvent.createButton", "Create Event")}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
