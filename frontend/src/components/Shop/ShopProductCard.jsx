import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

const ShopProductCard = ({ data, isEvent, onDelete, onUpdate }) => {
  const { t, i18n } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Early return if data is undefined or null
  if (!data) {
    return null;
  }

  const imageUrl = (() => {
    if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageObj = data.images[0];
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
          return imageUrl;
        }
        if (typeof imageUrl === 'string') {
          return `/uploads/${imageUrl}`;
        }
      }
      if (typeof imageObj === 'string') {
        if (imageObj.startsWith("http")) {
          return imageObj;
        }
        return `/uploads/${imageObj}`;
      }
    }
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTAzLjMxNCA4MCAxMDYgODIuNjg2MyAxMDYgODZDMTA2IDg5LjMxMzcgMTAzLjMxNCA5MiAxMDAgOTJDOTYuNjg2MyA5MiA5NCA4OS4zMTM3IDk0IDg2Qzk0IDgyLjY4NjMgOTQgODAgMTAwIDgwWiIgZmlsbD0iIzlDOUM5NyIvPgo8cGF0aCBkPSJNMTQwIDEyMEg2MEw3Ni4xOCAxMDMuODJMMTAwIDEyOEwxMjMuODIgMTAzLjgyTDE0MCAxMjBaIiBmaWxsPSIjOUM5Qzk3Ii8+Cjwvc3ZnPg==";
  })();

  const handleDelete = async () => {
    if (!window.confirm(t("shopProductCard.confirmDelete", "Are you sure you want to delete this product?"))) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      const endpoint = isEvent ? `${server}/events/${data._id}` : `${server}/products/${data._id}`;
      
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(t("shopProductCard.deleteSuccess", "Product deleted successfully!"));
      if (onDelete) {
        onDelete(data._id);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t("shopProductCard.deleteError", "Failed to delete product. Please try again."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      const token = getAuthToken();
      const endpoint = isEvent ? `${server}/events/${data._id}` : `${server}/products/${data._id}`;
      const newStatus = data.status === "active" ? "inactive" : "active";
      
      await axios.put(endpoint, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(t("shopProductCard.statusUpdated", "Status updated successfully!"));
      if (onUpdate) {
        onUpdate(data._id, { ...data, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("shopProductCard.statusUpdateError", "Failed to update status. Please try again."));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="group relative w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={imageUrl}
          alt={data.name || "Product"}
          className="w-full h-36 sm:h-40 lg:h-44 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTAzLjMxNCA4MCAxMDYgODIuNjg2MyAxMDYgODZDMTA2IDg5LjMxMzcgMTAzLjMxNCA5MiAxMDAgOTJDOTYuNjg2MyA5MiA5NCA4OS4zMTM3IDk0IDg2Qzk0IDgyLjY4NjMgOTQgODAgMTAwIDgwWiIgZmlsbD0iIzlDOUM5NyIvPgo8cGF0aCBkPSJNMTQwIDEyMEg2MEw3Ni4xOCAxMDMuODJMMTAwIDEyOEwxMjMuODIgMTAzLjgyTDE0MCAxMjBaIiBmaWxsPSIjOUM5Qzk3Ii8+Cjwvc3ZnPg==";
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
            {data.status || "active"}
          </span>
        </div>

        {/* Stock Badge */}
        {data.stock < 10 && data.stock > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {t("shopProductCard.lowStock", "Low Stock")}
          </div>
        )}
        
        {data.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {t("shopProductCard.outOfStock", "Out of Stock")}
          </div>
        )}

        {/* Event Badge */}
        {isEvent && (
          <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            🎉 {t("shopProductCard.event", "Event")}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4">
        {/* Product Title */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 leading-tight overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {data.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            {data.discountPrice} {t("common.currency", "dh")}
          </span>
          {data.originalPrice > 0 && data.originalPrice > data.discountPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {data.originalPrice} {t("common.currency", "dh")}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span>{t("shopProductCard.stock", "Stock:")} <span className="font-medium">{data.stock}</span></span>
          {data.sold > 0 && (
            <span>{t("shopProductCard.sold", "Sold:")} <span className="font-medium">{data.sold}</span></span>
          )}
          {data.ratings > 0 && (
            <span>⭐ <span className="font-medium">{data.ratings}</span></span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 sm:gap-2">
          {/* View Button */}
          <Link
            to={isEvent ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <AiOutlineEye size={14} />
            <span className="hidden sm:inline">{t("shopProductCard.view", "View")}</span>
            <span className="sm:hidden">👁️</span>
          </Link>

          {/* Edit Button */}
          <Link
            to={isEvent ? `/dashboard-edit-event/${data._id}` : `/dashboard-edit-product/${data._id}`}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <AiOutlineEdit size={14} />
            <span className="hidden sm:inline">{t("shopProductCard.edit", "Edit")}</span>
            <span className="sm:hidden">✏️</span>
          </Link>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium py-2 px-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <AiOutlineDelete size={14} />
            <span className="hidden sm:inline">{isDeleting ? t("common.deleting", "Deleting...") : t("shopProductCard.delete", "Delete")}</span>
            <span className="sm:hidden">{isDeleting ? "⏳" : "🗑️"}</span>
          </button>
        </div>

        {/* Status Toggle */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={`w-full py-2 px-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
              data.status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {isUpdating ? t("common.updating", "Updating...") : 
             data.status === "active" 
               ? t("shopProductCard.deactivate", "Deactivate") 
               : t("shopProductCard.activate", "Activate")
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopProductCard;
