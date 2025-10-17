import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineVideoCamera } from "react-icons/ai";
import { MdPlayCircleOutline } from "react-icons/md";
import { getAuthToken } from "../../utils/auth";

const AllTutorials = () => {
  const { t, i18n } = useTranslation();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    titleFr: "",
    description: "",
    descriptionAr: "",
    descriptionFr: "",
    videoUrl: "",
    category: "getting-started",
    duration: "",
    order: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const categories = [
    { value: "getting-started", label: t("tutorial.gettingStarted", "Getting Started") },
    { value: "create-product", label: t("tutorial.createProduct", "Create Product") },
    { value: "manage-orders", label: t("tutorial.manageOrders", "Manage Orders") },
    { value: "analytics", label: t("tutorial.analytics", "Analytics") },
    { value: "marketing", label: t("tutorial.marketing", "Marketing") },
    { value: "settings", label: t("tutorial.settings", "Settings") },
    { value: "other", label: t("tutorial.other", "Other") }
  ];

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const { data } = await axios.get(`${server}/api/tutorials/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTutorials(data.tutorials || []);
    } catch (error) {
      console.error("Fetch tutorials error:", error);
      toast.error(t("common.fetchError", "Failed to fetch tutorials"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      
      console.log("=== Submitting Tutorial ===");
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Form Data:", formData);
      console.log("Thumbnail:", thumbnail);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
        console.log(`Appending ${key}:`, formData[key]);
      });
      
      if (thumbnail) {
        formDataToSend.append("thumbnail", thumbnail);
        console.log("Thumbnail appended");
      }

      const url = editingTutorial 
        ? `${server}/api/tutorials/admin/${editingTutorial._id}`
        : `${server}/api/tutorials/admin/create`;
      
      console.log("Request URL:", url);
      console.log("Method:", editingTutorial ? "PUT" : "POST");

      if (editingTutorial) {
        // Update
        const response = await axios.put(url, formDataToSend, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        });
        console.log("Update response:", response.data);
        toast.success(t("common.updateSuccess", "Tutorial updated successfully"));
      } else {
        // Create
        const response = await axios.post(url, formDataToSend, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        });
        console.log("Create response:", response.data);
        toast.success(t("common.createSuccess", "Tutorial created successfully"));
      }

      fetchTutorials();
      handleCloseModal();
    } catch (error) {
      console.error("=== Submit tutorial error ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = t("common.submitError", "Failed to submit tutorial");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Unauthorized. Please login as admin.";
      } else if (error.response?.status === 403) {
        errorMessage = "Forbidden. Admin access required.";
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title || "",
      titleAr: tutorial.titleAr || "",
      titleFr: tutorial.titleFr || "",
      description: tutorial.description || "",
      descriptionAr: tutorial.descriptionAr || "",
      descriptionFr: tutorial.descriptionFr || "",
      videoUrl: tutorial.videoUrl || "",
      category: tutorial.category || "getting-started",
      duration: tutorial.duration || "",
      order: tutorial.order || 0,
      isActive: tutorial.isActive !== undefined ? tutorial.isActive : true
    });
    setThumbnailPreview(tutorial.thumbnail?.url || "");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("common.confirmDelete", "Are you sure you want to delete this tutorial?"))) {
      return;
    }

    try {
      const token = getAuthToken();
      await axios.delete(`${server}/api/tutorials/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t("common.deleteSuccess", "Tutorial deleted successfully"));
      fetchTutorials();
    } catch (error) {
      console.error("Delete tutorial error:", error);
      toast.error(error.response?.data?.message || t("common.deleteError", "Failed to delete tutorial"));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTutorial(null);
    setFormData({
      title: "",
      titleAr: "",
      titleFr: "",
      description: "",
      descriptionAr: "",
      descriptionFr: "",
      videoUrl: "",
      category: "getting-started",
      duration: "",
      order: 0,
      isActive: true
    });
    setThumbnail(null);
    setThumbnailPreview("");
  };

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t("tutorial.manageTutorials", "Manage Tutorials")}</h1>
          <p className="text-gray-600 mt-1">{t("tutorial.manageDesc", "Create and manage platform tutorials")}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <AiOutlinePlus size={20} />
          {t("tutorial.addNew", "Add Tutorial")}
        </button>
      </div>

      {/* Tutorials List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : tutorials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AiOutlineVideoCamera className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("tutorial.noTutorials", "No tutorials yet")}</h3>
          <p className="text-gray-500">{t("tutorial.addFirst", "Add your first tutorial to help sellers")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200">
                {tutorial.thumbnail?.url ? (
                  <img
                    src={tutorial.thumbnail.url}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MdPlayCircleOutline className="text-gray-400" size={64} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {tutorial.duration || "0:00"}
                </div>
                {!tutorial.isActive && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                    {t("common.inactive", "Inactive")}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {getCategoryLabel(tutorial.category)}
                  </span>
                  <span className="text-xs text-gray-500">{tutorial.views || 0} {t("tutorial.views", "views")}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {i18n.language === 'ar' && tutorial.titleAr ? tutorial.titleAr :
                   i18n.language === 'fr' && tutorial.titleFr ? tutorial.titleFr :
                   tutorial.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {i18n.language === 'ar' && tutorial.descriptionAr ? tutorial.descriptionAr :
                   i18n.language === 'fr' && tutorial.descriptionFr ? tutorial.descriptionFr :
                   tutorial.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tutorial)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
                  >
                    <AiOutlineEdit size={16} />
                    {t("common.edit", "Edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(tutorial._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                  >
                    <AiOutlineDelete size={16} />
                    {t("common.delete", "Delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AiOutlineVideoCamera className="text-orange-600" />
                    {editingTutorial ? t("tutorial.editTutorial", "Edit Tutorial") : t("tutorial.addNew", "Add New Tutorial")}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingTutorial ? t("tutorial.updateDetails", "Update tutorial details") : t("tutorial.createNew", "Create a new tutorial for sellers")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Titles Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-600 rounded"></span>
                    {t("tutorial.titles", "Tutorial Titles")}
                  </h3>
                  <div className="space-y-3">
                    {/* Title (English) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🇬🇧 {t("tutorial.titleEn", "English")} *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., How to create your first product"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Title (French) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🇫🇷 {t("tutorial.titleFr", "French")}
                      </label>
                      <input
                        type="text"
                        name="titleFr"
                        value={formData.titleFr}
                        onChange={handleInputChange}
                        placeholder="e.g., Comment créer votre premier produit"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Title (Arabic) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🇲🇦 {t("tutorial.titleAr", "Arabic")}
                      </label>
                      <input
                        type="text"
                        name="titleAr"
                        value={formData.titleAr}
                        onChange={handleInputChange}
                        placeholder="مثال: كيفية إنشاء أول منتج لك"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Descriptions Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-600 rounded"></span>
                    {t("tutorial.descriptions", "Tutorial Descriptions")}
                  </h3>
                  <div className="space-y-3">
                    {/* Description (English) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🇬🇧 {t("tutorial.descriptionEn", "English")} *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        placeholder="Explain what sellers will learn in this tutorial..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Description (French) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🇫🇷 {t("tutorial.descriptionFr", "French")}
                      </label>
                      <textarea
                        name="descriptionFr"
                        value={formData.descriptionFr}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Expliquez ce que les vendeurs apprendront..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Description (Arabic) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🇲🇦 {t("tutorial.descriptionAr", "Arabic")}
                      </label>
                      <textarea
                        name="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="اشرح ما سيتعلمه البائعون في هذا الدرس..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Video & Media Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-600 rounded"></span>
                    {t("tutorial.videoMedia", "Video & Media")}
                  </h3>
                  <div className="space-y-4">
                    {/* Video URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        🎥 {t("tutorial.videoUrl", "Video URL")} *
                        <span className="text-xs text-gray-500 font-normal">(YouTube, Vimeo, etc.)</span>
                      </label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 {t("tutorial.videoUrlHint", "Paste the full URL of your YouTube or Vimeo video")}
                      </p>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        🖼️ {t("tutorial.thumbnail", "Thumbnail Image")}
                      </label>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            📸 {t("tutorial.thumbnailHint", "Recommended size: 1280x720px (16:9 ratio)")}
                          </p>
                        </div>
                        {thumbnailPreview && (
                          <div className="flex-shrink-0">
                            <img 
                              src={thumbnailPreview} 
                              alt="Preview" 
                              className="w-32 h-18 object-cover rounded-lg border-2 border-gray-200 shadow-sm" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-600 rounded"></span>
                    {t("tutorial.settings", "Settings")}
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-900 cursor-pointer">
                        {t("tutorial.isActive", "Active Tutorial")}
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("tutorial.isActiveHint", "When active, sellers can view this tutorial")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t("common.saving", "Saving...")}
                      </>
                    ) : (
                      <>
                        {editingTutorial ? t("common.update", "Update Tutorial") : t("common.create", "Create Tutorial")}
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTutorials;

