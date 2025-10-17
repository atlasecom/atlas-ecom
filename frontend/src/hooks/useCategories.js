import { useState, useEffect } from 'react';
import { server } from '../server';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${server}/api/categories`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
        
        // Extract all subcategories from the categories data
        const allSubcategories = [];
        data.categories.forEach(category => {
          if (category.subcategories && Array.isArray(category.subcategories)) {
            category.subcategories.forEach(sub => {
              allSubcategories.push({
                ...sub,
                category: category._id // Ensure category is a string ID
              });
            });
          }
        });
        setSubcategories(allSubcategories);
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId = null) => {
    try {
      setError(null);
      
      let url = `${server}/api/subcategories`;
      if (categoryId) {
        url = `${server}/api/categories/${categoryId}/subcategories`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSubcategories(data.subcategories);
      } else {
        setError(data.message || 'Failed to fetch subcategories');
      }
    } catch (err) {
      setError('Error fetching subcategories');
      console.error('Error fetching subcategories:', err);
    }
  };

  const getSubcategoriesByCategory = (categoryId) => {
    return subcategories.filter(sub => {
      // Handle both string and object references
      const subCategoryId = typeof sub.category === 'object' ? sub.category._id : sub.category;
      return subCategoryId === categoryId;
    });
  };

  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat._id === categoryId);
  };

  const getSubcategoryById = (subcategoryId) => {
    return subcategories.find(sub => sub._id === subcategoryId);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    subcategories,
    loading,
    error,
    fetchCategories,
    fetchSubcategories,
    getSubcategoriesByCategory,
    getCategoryById,
    getSubcategoryById,
    refetch: () => {
      fetchCategories();
    }
  };
};
