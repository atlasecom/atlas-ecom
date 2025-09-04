import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteProduct, clearErrors } from "../../redux/actions/product";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const productState = useSelector((state) => state.products);
  const message = productState?.message || null;
  const error = productState?.error || null;
  const deleteLoading = productState?.isLoading || false;
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [localDeleteLoading, setLocalDeleteLoading] = useState(false);

  // Fetch products from server
  const fetchProducts = async (shopId) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      console.log('Fetching products for shop ID:', shopId);
      
      // Use the API endpoint that returns images as objects
      const response = await axios.get(`${server}/api/shops/${shopId}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        console.log('Products fetched successfully:', response.data.products.length);
        response.data.products.forEach((product, index) => {
          console.log(`Product ${index + 1}:`, product.name);
          console.log(`Images:`, product.images);
          if (product.images && product.images.length > 0) {
            console.log(`First image:`, product.images[0]);
          }
        });
        setProducts(response.data.products);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.shop) {
      const shopId = user.shop._id || user.shop;
      fetchProducts(shopId);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleDelete = (id) => {
    const product = products.find(p => p._id === id);
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setLocalDeleteLoading(true);
    try {
      console.log('Confirming delete for product:', productToDelete._id);
      
      await dispatch(deleteProduct(productToDelete._id));
      
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setLocalDeleteLoading(false);
    }
  };

  // Handle delete success/error from Redux state
  useEffect(() => {
    if (message && !deleteLoading) {
      toast.success(message);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      
      // Refresh products list
      if (user && user.shop) {
        const shopId = user.shop._id || user.shop;
        fetchProducts(shopId);
      }
      
      // Clear the message after showing it
      dispatch(clearErrors());
    }
  }, [message, deleteLoading, user, dispatch]);

  // Handle delete error from Redux state
  useEffect(() => {
    if (error && !deleteLoading) {
      toast.error(error);
      // Clear the error after showing it
      dispatch(clearErrors());
    }
  }, [error, deleteLoading, dispatch]);

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setSelectedImage("");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      <div className="w-full px-0 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <Link
              to="/dashboard-create-product"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add New Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-4">Start by creating your first product</p>
              <Link
                to="/dashboard-create-product"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={(() => {
                          const imageObj = product.images[0];
                          // Handle different image formats with cache busting
                          if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                            const imageUrl = imageObj.url;
                            // Don't add cache busting to data URIs
                            if (imageUrl.startsWith('data:')) {
                              return imageUrl;
                            }
                            return imageUrl + '?v=' + Date.now();
                          }
                          if (typeof imageObj === 'string') {
                            // Don't add cache busting to data URIs
                            if (imageObj.startsWith('data:')) {
                              return imageObj;
                            }
                            return imageObj + '?v=' + Date.now();
                          }
                          return '/default-product.png';
                        })()}
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openImageModal((() => {
                          const imageObj = product.images[0];
                          if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                            return imageObj.url;
                          }
                          if (typeof imageObj === 'string') {
                            return imageObj;
                          }
                          return '/default-product.png';
                        })())}
                        onError={(e) => {
                          console.error('Image load error for product:', product.name, 'URL:', e.target.src);
                          // Try alternative loading methods
                          const imageObj = product.images[0];
                          if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                            // Try without cache busting
                            e.target.src = imageObj.url;
                          } else {
                            e.target.src = '/default-product.png';
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for product:', product.name);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-gray-400">📷</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">${product.discountPrice}</span>
                        {product.originalPrice && product.originalPrice > product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-600">{product.ratings || 0}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <span className={`ml-1 font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sold:</span>
                        <span className="ml-1 font-medium text-gray-900">{product.sold_out || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <span className="mr-1">👁️</span>
                        Preview
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-red-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <span className="mr-1">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl max-h-full mx-4">
                <button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                >
                  <span className="text-3xl">✕</span>
                </button>
                <img
                  src={selectedImage}
                  alt="Product"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={localDeleteLoading || deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {(localDeleteLoading || deleteLoading) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
