import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { server } from '../../server';
import { getAuthToken } from '../../utils/auth';

const CategoryManagement = () => {
  const { user } = useSelector((state) => state.user);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    nameFr: '',
    description: '',
    descriptionAr: '',
    descriptionFr: '',
    sortOrder: 0,
    isActive: true,
    image: null,
    category: '',
    tags: '' // Single tags field for all languages
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${server}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || 'Error fetching categories');
      }
    } catch (error) {
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${server}/api/admin/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSubcategories(data.subcategories);
      } else {
        toast.error(data.message || 'Error fetching subcategories');
      }
    } catch (error) {
      toast.error('Error fetching subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getAuthToken();
      const formDataToSend = new FormData();
      
      // Add all form data except image
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image if it exists
      if (formData.image && formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
        console.log('📸 Image file added to form data:', formData.image.name, formData.image.size);
      } else {
        console.log('⚠️ No image file selected');
      }

      const url = activeTab === 'categories' 
        ? `${server}/api/admin/categories`
        : `${server}/api/admin/subcategories`;
      
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem 
        ? `${url}/${editingItem._id}`
        : url;

      console.log('🚀 Sending request to:', endpoint);
      console.log('📋 Form data keys:', Array.from(formDataToSend.keys()));

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('📥 Response:', data);
      
      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        setEditingItem(null);
        resetForm();
        if (activeTab === 'categories') {
          fetchCategories();
        } else {
          fetchSubcategories();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      nameAr: item.nameAr || '',
      nameFr: item.nameFr || '',
      description: item.description || '',
      descriptionAr: item.descriptionAr || '',
      descriptionFr: item.descriptionFr || '',
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
      image: null,
      category: item.category?._id || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    let confirmMessage = 'Are you sure you want to delete this item?';
    
    // If deleting a category, show how many subcategories will also be deleted
    if (activeTab === 'categories') {
      const subcategoriesToDelete = subcategories.filter(sub => sub.category === item._id);
      if (subcategoriesToDelete.length > 0) {
        confirmMessage = `Are you sure you want to delete this category? This will also delete ${subcategoriesToDelete.length} subcategor${subcategoriesToDelete.length === 1 ? 'y' : 'ies'}.`;
      }
    }
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setLoading(true);
      const token = getAuthToken();
      const url = activeTab === 'categories' 
        ? `${server}/api/admin/categories/${item._id}`
        : `${server}/api/admin/subcategories/${item._id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        
        if (activeTab === 'categories') {
          // Count subcategories that will be deleted
          const subcategoriesToDelete = subcategories.filter(sub => sub.category === item._id);
          
          // Immediately update UI for better UX
          setCategories(prev => prev.filter(cat => cat._id !== item._id));
          
          // Also remove subcategories that belonged to this category
          setSubcategories(prev => prev.filter(sub => sub.category !== item._id));
          
          // Show additional message if subcategories were deleted
          if (subcategoriesToDelete.length > 0) {
            toast.info(`${subcategoriesToDelete.length} subcategor${subcategoriesToDelete.length === 1 ? 'y' : 'ies'} also deleted`);
          }
          
          // Then refresh from server to ensure consistency
          fetchCategories();
          fetchSubcategories();
        } else {
          // Immediately update UI for subcategory deletion
          setSubcategories(prev => prev.filter(sub => sub._id !== item._id));
          
          // Then refresh from server
          fetchSubcategories();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error deleting item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      nameFr: '',
      description: '',
      descriptionAr: '',
      descriptionFr: '',
      sortOrder: 0,
      isActive: true,
      image: null,
      category: '',
      tags: ''
    });
  };

  const openModal = () => {
    resetForm();
    setEditingItem(null);
    setShowModal(true);
  };

  return (
    <div className="w-full">
      {/* Mobile Navigation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 lg:hidden">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">Mobile Navigation</p>
            <p className="text-xs text-blue-700">Use the blue menu button in the header to navigate</p>
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
                Category Management
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                Manage categories and subcategories with multilingual support
              </p>
            </div>
            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add {activeTab === 'categories' ? 'Category' : 'SubCategory'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'categories'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'subcategories'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SubCategories ({subcategories.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name (EN/AR/FR)
                    </th>
                    {activeTab === 'subcategories' && (
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    )}
                    {activeTab === 'categories' && (
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subcategories
                      </th>
                    )}
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'categories' ? categories : subcategories).map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image?.url || '/default-product.png'}
                            alt={item.name}
                            className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.nameAr}</div>
                        <div className="text-sm text-gray-500">{item.nameFr}</div>
                      </td>
                      {activeTab === 'subcategories' && (
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category?.name}
                          </span>
                        </td>
                      )}
                      {activeTab === 'categories' && (
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {subcategories.filter(sub => sub.category === item._id).length} subcategor{subcategories.filter(sub => sub.category === item._id).length === 1 ? 'y' : 'ies'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {(activeTab === 'categories' ? categories : subcategories).length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new {activeTab === 'categories' ? 'category' : 'subcategory'}.</p>
                <div className="mt-6">
                  <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add {activeTab === 'categories' ? 'Category' : 'SubCategory'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-2/5 shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : 'SubCategory'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (Arabic)</label>
                    <input
                      type="text"
                      name="nameAr"
                      value={formData.nameAr}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (French)</label>
                    <input
                      type="text"
                      name="nameFr"
                      value={formData.nameFr}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (EN)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (AR)</label>
                    <textarea
                      name="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (FR)</label>
                    <textarea
                      name="descriptionFr"
                      value={formData.descriptionFr}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                  </div>
                </div>

                {activeTab === 'subcategories' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name} / {cat.nameAr} / {cat.nameFr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Tags (All Languages)
                        <span className="text-xs text-gray-500 ml-2">Separate tags with commas. Mix English, Arabic, and French.</span>
                      </label>
                      <textarea
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="Samsung Galaxy, سامسونج, Galaxy S24, غالاكسي, Téléphone Samsung, iPhone 15, آيفون"
                        rows="3"
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 These tags help customers find products. When someone searches for any of these terms, all products in this subcategory will appear.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {editingItem ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
