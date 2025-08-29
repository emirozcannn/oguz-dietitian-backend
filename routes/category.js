import express from 'express';
import Category from '../src/models/Category.js';

const router = express.Router();

// Tüm kategorileri getir - Mongoose kullanarak
router.get('/', async (req, res) => {
  try {
    const { language = 'tr' } = req.query;
    const categories = await Category.find({}).sort({ order_index: 1, created_at: -1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// Yeni kategori ekle
router.post('/', async (req, res) => {
  try {
    const categoryData = req.body;
    const category = new Category(categoryData);
    const savedCategory = await category.save();
    
    res.status(201).json({
      success: true,
      data: savedCategory,
      message: 'Kategori başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: 'Kategori oluşturulurken hata oluştu',
      error: error.message
    });
  }
});

// Kategori güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: category,
      message: 'Kategori başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({
      success: false,
      message: 'Kategori güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// Kategori sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Kategori başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori silinirken hata oluştu',
      error: error.message
    });
  }
});

export default router;