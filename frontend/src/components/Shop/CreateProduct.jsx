import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { FiPlus, FiUpload, FiX, FiPackage, FiDollarSign, FiTag, FiImage, FiInfo } from "react-icons/fi";

const CreateProduct = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Electronics");
    const [tags, setTags] = useState("");
    const [minPrice, setMinPrice] = useState();
    const [maxPrice, setMaxPrice] = useState();
    const [stock, setStock] = useState();
    const [minOrderQuantity, setMinOrderQuantity] = useState(1);
    const [loading, setLoading] = useState(false);



    const handleImageChange = (e) => {
        e.preventDefault();

        let files = Array.from(e.target.files);
        
        if (files.length === 0) {
            toast.error(t('createProduct.noFilesSelected', 'Please select at least one image file'));
            return;
        }
        
        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            toast.error(t('createProduct.invalidFileType', 'Please select only image files (JPG, PNG, GIF, WebP)'));
            return;
        }
        
        // Validate file sizes (max 10MB each)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            toast.error(t('createProduct.fileTooLarge', 'Each image must be less than 10MB'));
            return;
        }
        
        // Limit total number of images
        if (images.length + files.length > 10) {
            toast.error(t('createProduct.tooManyImages', 'Maximum 10 images allowed'));
            return;
        }
        
        setImages((prevImages) => [...prevImages, ...files]);
    };

    const removeImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Enhanced validation
            if (!name || name.trim().length < 2 || name.trim().length > 100) {
                toast.error(t('createProduct.nameLength', 'Product name must be between 2 and 100 characters'));
                setLoading(false);
                return;
            }
            
            if (!description || description.trim().length < 10 || description.trim().length > 2000) {
                toast.error(t('createProduct.descriptionLength', 'Description must be between 10 and 2000 characters'));
                setLoading(false);
                return;
            }
            
            if (!category) {
                toast.error(t('createProduct.categoryRequired', 'Please select a category'));
                setLoading(false);
                return;
            }
            
            if (!minPrice || parseFloat(minPrice) <= 0) {
                toast.error(t('createProduct.minPriceRequired', 'Minimum price must be a positive number'));
                setLoading(false);
                return;
            }
            
            if (!maxPrice || parseFloat(maxPrice) <= 0) {
                toast.error(t('createProduct.maxPriceRequired', 'Maximum price must be a positive number'));
                setLoading(false);
                return;
            }
            
            if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
                toast.error(t('createProduct.priceRangeInvalid', 'Maximum price must be greater than minimum price'));
                setLoading(false);
                return;
            }
            
            if (!stock || parseInt(stock) < 0) {
                toast.error(t('createProduct.stockRequired', 'Stock must be a non-negative number'));
                setLoading(false);
                return;
            }
            
            if (images.length === 0) {
                toast.error(t('createProduct.imageRequired', 'At least one product image is required'));
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

            const token = getAuthToken();
            const config = { 
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            };

            const shopId = user.shop._id || user.shop;
            const response = await axios.post(
                `${server}/api/products/${shopId}`, 
                newForm, 
                config
            );

            if (response.data.success) {
                toast.success(t('createProduct.success', 'Product created successfully!'));
                // Reset form
                setImages([]);
                setName("");
                setDescription("");
                setCategory("");
                setTags("");
                setMinPrice("");
                setMaxPrice("");
                setStock("");
                setMinOrderQuantity(1);
                // Redirect to dashboard
                navigate("/dashboard-products");
            }
        } catch (error) {
            console.error('Error creating product:', error);
            const errorMessage = error.response?.data?.message || 
                               t('createProduct.error', 'Failed to create product. Please try again.');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
                            <FiPackage className="text-white text-2xl" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            {t('createProduct.title', 'Create New Product')}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Add your product to start selling on our platform
                        </p>
                    </div>

                    {/* Main Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                            {/* Product Information Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Product Name */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <FiPackage className="mr-2 text-orange-500" size={16} />
                                            {t('createProduct.name', 'Product Name')} 
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
                                            placeholder={t("createProduct.namePlaceholder", "Enter your product name...")}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{t("createProduct.charactersCount", "{{count}}/100 characters", { count: name.length })}</span>
                                            <span>{t("createProduct.minCharacters", "Minimum 2 required")}</span>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <FiTag className="mr-2 text-orange-500" size={16} />
                                            {t('createProduct.category', 'Category')} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            value={category}
                                            required
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="Electronics">{t("createProduct.categories.electronics", "Electronics")}</option>
                                            <option value="Fashion & Apparel">{t("createProduct.categories.fashion", "Fashion & Apparel")}</option>
                                            <option value="Home & Garden">{t("createProduct.categories.home", "Home & Garden")}</option>
                                            <option value="Sports & Outdoors">{t("createProduct.categories.sports", "Sports & Outdoors")}</option>
                                            <option value="Health & Beauty">{t("createProduct.categories.health", "Health & Beauty")}</option>
                                            <option value="Books & Media">{t("createProduct.categories.books", "Books & Media")}</option>
                                            <option value="Automotive">{t("createProduct.categories.automotive", "Automotive")}</option>
                                            <option value="Toys & Games">{t("createProduct.categories.toys", "Toys & Games")}</option>
                                            <option value="Food & Beverages">{t("createProduct.categories.food", "Food & Beverages")}</option>
                                            <option value="Jewelry & Accessories">{t("createProduct.categories.jewelry", "Jewelry & Accessories")}</option>
                                            <option value="Pet Supplies">{t("createProduct.categories.pet", "Pet Supplies")}</option>
                                        </select>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <FiTag className="mr-2 text-orange-500" size={16} />
                                            {t('createProduct.tags', 'Tags')}
                                        </label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={tags}
                                            maxLength="200"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            onChange={(e) => setTags(e.target.value)}
                                            placeholder={t("createProduct.tagsPlaceholder", "Enter tags separated by commas...")}
                                        />
                                        <div className="text-xs text-gray-500 text-right">
{t("createProduct.charactersCount", "{{count}}/200 characters", { count: tags.length })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Pricing Section */}
                                <div className="space-y-6">
                                    {/* Pricing Range */}
                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                        <div className="flex items-center mb-4">
                                            <FiDollarSign className="mr-2 text-orange-600" size={20} />
                                            <h3 className="text-lg font-semibold text-orange-800">{t("createProduct.pricingRange", "Pricing Range")}</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-orange-800">
{t("createProduct.minPrice", "Minimum Price (DH)")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="minPrice"
                                                    value={minPrice}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    placeholder={t("createProduct.minPricePlaceholder", "0.00")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-orange-800">
{t("createProduct.maxPrice", "Maximum Price (DH)")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="maxPrice"
                                                    value={maxPrice}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    placeholder={t("createProduct.maxPricePlaceholder", "0.00")}
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
                                    {t('createProduct.description', 'Product Description')} 
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
                                    placeholder="Describe your product in detail..."
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
                                    {t('createProduct.uploadImages', 'Product Images')} 
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
                                        <p className="text-lg font-medium text-gray-700 mb-2">Upload Product Images</p>
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
                                                        alt={`Product image ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                        onError={(e) => {
                                                            console.error('Image load error:', e);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
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
                                    onClick={() => navigate("/dashboard-products")}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim() || !description.trim() || !category || !minPrice || !maxPrice || !stock || !minOrderQuantity || !images || images.length === 0}
                                    className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        loading || !name.trim() || !description.trim() || !category || !minPrice || !maxPrice || !stock || !minOrderQuantity || !images || images.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed transform-none'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {t('createProduct.creating', 'Creating Product...')}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <FiPackage className="mr-2" size={16} />
                                            {t('createProduct.create', 'Create Product')}
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

export default CreateProduct;