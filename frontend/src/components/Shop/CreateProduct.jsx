import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

const CreateProduct = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Electronics");
    const [tags, setTags] = useState("");
    const [originalPrice, setOriginalPrice] = useState();
    const [discountPrice, setDiscountPrice] = useState();
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
            
            if (!discountPrice || parseFloat(discountPrice) <= 0) {
                toast.error(t('createProduct.priceRequired', 'Discount price must be a positive number'));
                setLoading(false);
                return;
            }
            
            if (originalPrice && parseFloat(originalPrice) <= 0) {
                toast.error(t('createProduct.originalPriceInvalid', 'Original price must be a positive number'));
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
            
            // If originalPrice is empty, set it to discountPrice
            const finalOriginalPrice = originalPrice && originalPrice.trim() !== '' ? originalPrice : discountPrice;
            newForm.append("originalPrice", finalOriginalPrice);
            
            newForm.append("discountPrice", discountPrice);
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
                setOriginalPrice("");
                setDiscountPrice("");
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
        <div className="w-full">
            <div className="w-full px-0 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
                <div className="max-w-4xl mx-auto px-2 sm:px-0">
                    <h5 className="text-[30px] font-Poppins text-center">{t('createProduct.title', 'Create Product')}</h5>
                    {/* create product form */}
                    <form onSubmit={handleSubmit}>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.name', 'Name')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                required
                                maxLength="100"
                                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('createProduct.namePlaceholder', 'Enter your product name (2-100 characters)...')}
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {name.length}/100 characters (minimum 2 required)
                            </div>
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.description', 'Description')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
                            </label>
                            <textarea
                                cols="30"
                                required
                                rows="8"
                                type="text"
                                name="description"
                                value={description}
                                maxLength="2000"
                                className={`mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('createProduct.descriptionPlaceholder', 'Enter your product description (minimum 10 characters)...')}
                            ></textarea>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {description.length}/2000 characters (minimum 10 required)
                            </div>
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.category', 'Category')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
                            </label>
                            <select
                                className={`w-full mt-2 border h-[35px] rounded-[5px] ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                value={category}
                                required
                                onChange={(e) => setCategory(e.target.value)}
                            >
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
                        <br />
                        <div>
                            <label className="pb-2">{t('createProduct.tags', 'Tags')}</label>
                            <input
                                type="text"
                                name="tags"
                                value={tags}
                                maxLength="200"
                                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder={t('createProduct.tagsPlaceholder', 'Enter your product tags...')}
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {tags.length}/200 characters
                            </div>
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">{t('createProduct.originalPrice', 'Original Price')}</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={originalPrice}
                                min="0"
                                step="0.01"
                                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setOriginalPrice(e.target.value)}
                                placeholder={t('createProduct.originalPricePlaceholder', 'Enter your product price...')}
                            />
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.discountPrice', 'Price (With Discount)')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
                            </label>
                            <input
                                type="number"
                                name="discountPrice"
                                value={discountPrice}
                                required
                                min="0"
                                step="0.01"
                                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setDiscountPrice(e.target.value)}
                                placeholder={t('createProduct.discountPricePlaceholder', 'Enter your product price with discount...')}
                            />
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.stock', 'Product Stock')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={stock}
                                required
                                min="0"
                                step="1"
                                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder={t('createProduct.stockPlaceholder', 'Enter your product stock (required, non-negative)...')}
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                Current stock: {stock || 0} (minimum 0 required)
                            </div>
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.minOrderQuantity', 'Minimum Order Quantity')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
                            </label>
                            <input
                                type="number"
                                name="minOrderQuantity"
                                value={minOrderQuantity}
                                required
                                min="1"
                                step="1"
                                className={`mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    i18n.language === 'ar' ? 'text-right' : 'text-left'
                                }`}
                                onChange={(e) => setMinOrderQuantity(e.target.value)}
                                placeholder={t('createProduct.minOrderQuantityPlaceholder', 'Enter minimum order quantity...')}
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                Minimum order: {minOrderQuantity || 1} (minimum 1 required)
                            </div>
                        </div>
                        <br />
                        <div>
                            <label className="pb-2">
                                {t('createProduct.uploadImages', 'Upload Images')} <span className="text-red-500">{t('createProduct.required', '*')}</span>
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
                            <div className="w-full">
                                {/* Upload button */}
                                <label htmlFor="upload" className="cursor-pointer block">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200">
                                        <AiOutlinePlusCircle size={30} className="mx-auto mb-2" color="#555" />
                                        <p className="text-sm text-gray-600">Click to upload images</p>
                                        <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF (Max: 10MB each)</p>
                                    </div>
                                </label>
                                
                                {/* Image previews */}
                                {images && Array.isArray(images) && images.length > 0 && (
                                    <div className="w-full mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Uploaded Images ({images.length}):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {images.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Product image ${index + 1}`}
                                                        className="h-[120px] w-[120px] object-cover rounded border border-gray-200 shadow-sm"
                                                        onError={(e) => {
                                                            console.error('Image load error:', e);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                                                        title="Remove image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* No images message */}
                                {(!images || !Array.isArray(images) || images.length === 0) && (
                                    <div className="mt-4 text-center text-gray-500 text-sm">
                                        No images uploaded yet. Please select at least one image.
                                    </div>
                                )}
                                

                            </div>
                            <br />
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim() || !description.trim() || !category || !discountPrice || !stock || !minOrderQuantity || !images || images.length === 0}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        loading || !name.trim() || !description.trim() || !category || !discountPrice || !stock || !minOrderQuantity || !images || images.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed transform-none'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {t('createProduct.creating', 'Creating Product...')}
                                        </div>
                                    ) : (
                                        t('createProduct.create', 'Create Product')
                                    )}
                                </button>
                                
                                {(!name.trim() || !description.trim() || !category || !discountPrice || !stock || !minOrderQuantity || !images || images.length === 0) && (
                                    <div className="mt-3 text-center">
                                        <p className="text-sm text-gray-500">
                                            Please fill in all required fields and upload at least one image
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;