import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteProduct, clearErrors } from "../../redux/actions/product";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import { FiPackage, FiEye, FiTrash2, FiPlus, FiCamera, FiStar, FiEdit, FiEyeOff, FiToggleLeft, FiToggleRight, FiCheck, FiX, FiClock, FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const AllProducts = () => {
  const { t } = useTranslation();
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
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [productToHide, setProductToHide] = useState(null);
  const [localHideLoading, setLocalHideLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Fetch products from server
  const fetchProducts = async (shopId, status = 'all') => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      // Use the seller-specific API endpoint that returns all products (active and inactive)
      const response = await axios.get(`${server}/api/shops/${shopId}/products/seller?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(t("allProducts.failedToFetch", "Failed to fetch products"));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t("allProducts.failedToFetch", "Failed to fetch products"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.shop) {
      const shopId = user.shop._id || user.shop;
      fetchProducts(shopId, statusFilter);
    } else {
      setIsLoading(false);
    }
  }, [user, statusFilter]);

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
      toast.error(t("allProducts.failedToDelete", "Failed to delete product. Please try again."));
    } finally {
      setLocalDeleteLoading(false);
    }
  };

  // Handle delete success/error from Redux state
  useEffect(() => {
    if (message && !deleteLoading) {
      toast.success(t("allProducts.productDeleted", "Product deleted successfully"));
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
      toast.error(t("allProducts.failedToDelete", "Failed to delete product"));
      // Clear the error after showing it
      dispatch(clearErrors());
    }
  }, [error, deleteLoading, dispatch]);

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleHide = (product) => {
    setProductToHide(product);
    setHideModalOpen(true);
  };

  const confirmHide = async () => {
    if (!productToHide) return;
    
    setLocalHideLoading(true);
    try {
      const token = getAuthToken();
      const newStatus = !productToHide.isActive;
      
      const response = await axios.put(`${server}/api/products/${productToHide._id}`, 
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(newStatus ? t("allProducts.productShown", "Product shown successfully") : t("allProducts.productHidden", "Product hidden successfully"));
        
        // Update the product in the local state
        setProducts(prev => prev.map(p => 
          p._id === productToHide._id ? { ...p, isActive: newStatus } : p
        ));
        
        setHideModalOpen(false);
        setProductToHide(null);
      } else {
        toast.error(response.data.message || t("allProducts.failedToUpdateStatus", "Failed to update product status"));
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(t("allProducts.failedToUpdateStatus", "Failed to update product status. Please try again."));
    } finally {
      setLocalHideLoading(false);
    }
  };

  const cancelHide = () => {
    setHideModalOpen(false);
    setProductToHide(null);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{t("allProducts.title", "All Products")}</h1>
            
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t("allProducts.filter", "Filter")}:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="all">{t("allProducts.allProducts", "All Products")}</option>
                  <option value="active">{t("allProducts.visibleOnly", "Visible Only")}</option>
                  <option value="inactive">{t("allProducts.hiddenOnly", "Hidden Only")}</option>
                  <option value="pending">{t("allProducts.pendingApproval", "⏳ Pending Approval")}</option>
                  <option value="approved">{t("allProducts.approved", "✓ Approved")}</option>
                  <option value="rejected">{t("allProducts.rejected", "✗ Rejected")}</option>
                </select>
              </div>
              
              <Link
                to="/dashboard-create-product"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-2" size={16} />
{t("allProducts.addNewProduct", "Add New Product")}
              </Link>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="text-6xl mb-4 block text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{t("allProducts.noProductsFound", "No Products Found")}</h3>
              <p className="text-gray-500 mb-4">{t("allProducts.startCreating", "Start by creating your first product")}</p>
              <Link
                to="/dashboard-create-product"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto w-fit"
              >
                <FiPlus className="mr-2" size={16} />
{t("allProducts.createProduct", "Create Product")}
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center">
                          <FiCamera className="text-gray-400 mx-auto mb-2" size={48} />
                          <p className="text-gray-500 text-sm font-medium">{t("allProducts.noImage", "No Image")}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                        {product.category?.name || product.category || t("allProducts.category", "Category")}
                      </span>
                      {/* Approval Status Badge */}
                      {product.approvalStatus === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1">
                          <FiClock size={12} />
                          {t("allProducts.pendingApproval", "⏳ Pending Approval")}
                        </span>
                      )}
                      {product.approvalStatus === 'approved' && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                          <FiCheck size={12} />
                          {t("allProducts.approved", "✓ Approved")}
                        </span>
                      )}
                      {product.approvalStatus === 'rejected' && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                          <FiX size={12} />
                          {t("allProducts.rejected", "✗ Rejected")}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-white text-xs rounded-full w-fit ${
                        product.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {product.isActive ? t("allProducts.active", "Live") : t("allProducts.inactive", "Hidden")}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-orange-600">
                          {product.originalPrice} - {product.discountPrice} DH
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiStar className="text-yellow-400" size={16} />
                        <span className="text-sm text-gray-600">{product.ratings || 0}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">{t("allProducts.stock", "Stock")}:</span>
                        <span className={`ml-1 font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t("allProducts.sold", "Sold")}:</span>
                        <span className="ml-1 font-medium text-gray-900">{product.sold_out || 0}</span>
                      </div>
                    </div>

                    {/* Rejection Reason Alert */}
                    {product.approvalStatus === 'rejected' && product.rejectionReason && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-red-800 mb-1">{t("allProducts.rejectionReason", "Rejection Reason")}:</p>
                            <p className="text-xs text-red-700">{product.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pending Approval Notice */}
                    {product.approvalStatus === 'pending' && (
                      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <FiClock className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-yellow-800 mb-1">{t("allProducts.awaitingAdminApproval", "Awaiting Admin Approval")}</p>
                            <p className="text-xs text-yellow-700">{t("allProducts.pendingApprovalNotice", "This product is pending approval by an admin. It will be visible to customers once approved.")}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="bg-blue-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <FiEye className="mr-1" size={14} />
                        {t("allProducts.preview", "Preview")}
                      </Link>
                      <Link
                        to={`/dashboard-edit-product/${product._id}`}
                        className="bg-orange-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                      >
                        <FiEdit className="mr-1" size={14} />
                        {t("allProducts.edit", "Edit")}
                      </Link>
                      <button
                        onClick={() => handleHide(product)}
                        className={`text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center ${
                          product.isActive 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {product.isActive ? (
                          <>
                            <FiEyeOff className="mr-1" size={14} />
                            {t("allProducts.hide", "Hide")}
                          </>
                        ) : (
                          <>
                            <FiEye className="mr-1" size={14} />
                            {t("allProducts.show", "Show")}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <FiTrash2 className="mr-1" size={14} />
                        {t("allProducts.delete", "Delete")}
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
                  <h3 className="text-lg font-semibold text-gray-900">{t("allProducts.deleteProduct", "Delete Product")}</h3>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  {t("allProducts.areYouSureDelete", "Are you sure you want to delete")} "{productToDelete?.name}"? {t("allProducts.thisActionCannotBeUndone", "This action cannot be undone.")}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t("allProducts.cancel", "Cancel")}
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={localDeleteLoading || deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {(localDeleteLoading || deleteLoading) ? t("allProducts.deleting", "Deleting...") : t("allProducts.delete", "Delete")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hide/Show Confirmation Modal */}
          {hideModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {productToHide?.isActive ? t("allProducts.hideProduct", "Hide Product") : t("allProducts.showProduct", "Show Product")}
                  </h3>
                  <button
                    onClick={cancelHide}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  {t("allProducts.areYouSureHide", "Are you sure you want to")} {productToHide?.isActive ? t("allProducts.hide", "hide") : t("allProducts.show", "show")} "{productToHide?.name}"? 
                  {productToHide?.isActive 
                    ? ` ${t("allProducts.hiddenProductsNotice", "Hidden products will not be visible to customers.")}` 
                    : ` ${t("allProducts.productWillBeVisible", "The product will be visible to customers again.")}`
                  }
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelHide}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t("allProducts.cancel", "Cancel")}
                  </button>
                  <button
                    onClick={confirmHide}
                    disabled={localHideLoading}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                      productToHide?.isActive 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {localHideLoading ? t("allProducts.updating", "Updating...") : (productToHide?.isActive ? t("allProducts.hide", "Hide") : t("allProducts.show", "Show"))}
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
