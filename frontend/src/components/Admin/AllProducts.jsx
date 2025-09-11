import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { useTranslation } from "react-i18next";
import Loader from "../Layout/Loader";
import { FiPackage, FiDollarSign, FiStar, FiAlertTriangle, FiEye, FiTrash2 } from "react-icons/fi";
import { backend_url } from "../../server";

const AllProducts = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productId, setProductId] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${server}/products/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setData(response.data.products);
      } else {
        toast.error(t("admin.allProducts.fetchError", "Failed to fetch products"));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(t("admin.allProducts.fetchError", "Failed to fetch products"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch real products from database
  useEffect(() => {
    fetchProducts();
  }, []);

  // Get image URL with multiple fallbacks and null checks
  const getImageUrl = (product) => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const imageObj = product.images[0];
      // Check if imageObj is an object with url property
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
          return imageUrl;
        }
        if (typeof imageUrl === 'string') {
          return `${backend_url.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
        }
      }
      // Fallback for old format where images might be direct strings
      if (typeof imageObj === 'string') {
        if (imageObj.startsWith("http")) {
          return imageObj;
        }
        return `${backend_url.replace(/\/$/, "")}/${imageObj.replace(/^\//, "")}`;
      }
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${server}/products/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(t("admin.allProducts.deleteSuccess", "Product deleted successfully"));
      setDeleteOpen(false);
      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t("admin.allProducts.deleteError", "Failed to delete product"));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex-1">
      {/* Mobile Menu Indicator */}
      <div className="lg:hidden p-3 sm:p-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiPackage className="text-blue-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">{t("admin.allProducts.mobileNavigation", "Mobile Navigation")}</p>
            <p className="text-xs text-blue-700">{t("admin.allProducts.mobileNavigationDesc", "Use the blue menu button in the header to navigate")}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {t("admin.allProducts.title", "All Products")}
            </h1>
            <p className="text-sm lg:text-base text-gray-600">
              {t("admin.allProducts.subtitle", "Manage and monitor all products in the store")}
            </p>
          </div>

        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t("admin.allProducts.totalProducts", "Total Products")}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{data.length}</p>
            </div>
            <div className="bg-blue-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiPackage className="text-blue-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t("admin.allProducts.totalValue", "Total Value")}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {data.reduce((acc, item) => acc + (item.discountPrice || 0), 0).toFixed(2)} DH
              </p>
            </div>
            <div className="bg-green-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiDollarSign className="text-green-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t("admin.allProducts.lowStock", "Low Stock")}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                {data.filter(p => p.stock < 20).length}
              </p>
            </div>
            <div className="bg-orange-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiAlertTriangle className="text-orange-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{t("admin.allProducts.avgRating", "Avg Rating")}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                {data.length > 0 ? (data.reduce((acc, item) => acc + (item.ratings || 0), 0) / data.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="bg-purple-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiStar className="text-purple-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {data.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative mb-3 sm:mb-4">
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg cursor-pointer"
                onError={(e) => {
                  console.error('Image failed to load for product:', product.name, 'URL:', e.target.src);
                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Error";
                }}
                loading="lazy"
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                {product.name}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 truncate">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-bold text-orange-600">
                    {product.originalPrice} - {product.discountPrice} DH
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiStar className="text-yellow-400" />
                  <span className="text-xs sm:text-sm text-gray-600">{product.ratings || 0}</span>
                  <span className="text-xs text-gray-400">({product.numOfReviews || 0})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <span className={`ml-1 font-medium ${product.stock < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Sold:</span>
                  <span className="ml-1 font-medium text-gray-900">{product.sold_out || 0}</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-gray-500 text-xs sm:text-sm">Shop: </span>
                <span className="text-xs sm:text-sm font-medium text-blue-600">{product.shop?.name || 'Unknown Shop'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Link
                to={`/product/${product._id}`}
                className="w-full sm:flex-1 bg-blue-600 text-white text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FiEye className="mr-1" size={14} />
                Preview
              </Link>
              <button
                onClick={() => {
                  setProductId(product._id);
                  setDeleteOpen(true);
                }}
                className="w-full sm:flex-1 bg-red-600 text-white text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FiTrash2 className="mr-1" size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Delete Product</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="w-full sm:flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(productId)}
                className="w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AllProducts;
