// routes/faq.js - Mongoose versiyonu
import express from 'express';
import FAQCategory from '../src/models/FAQCategory.js';
import FAQItem from '../src/models/FAQItem.js';

const router = express.Router();

// Get all FAQ items (Admin)
router.get('/items', async (req, res) => {
  try {
    const items = await FAQItem
      .find({})
      .populate('category_id', 'name_tr name_en icon color')
      .sort({ order_index: 1, created_at: -1 })
      .lean();

    // Rename populated field to match frontend expectations
    const formattedItems = items.map(item => ({
      ...item,
      category: item.category_id
    }));

    res.json({
      success: true,
      data: formattedItems
    });
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get public FAQ items
router.get('/items/public', async (req, res) => {
  try {
    const items = await FAQItem
      .find({ is_active: true })
      .populate('category_id', 'name_tr name_en icon color')
      .sort({ order_index: 1, created_at: -1 })
      .lean();

    // Rename populated field to match frontend expectations
    const formattedItems = items.map(item => ({
      ...item,
      category: item.category_id
    }));

    res.json({
      success: true,
      data: formattedItems
    });
  } catch (error) {
    console.error('Error fetching public FAQ items:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create FAQ item
router.post('/items', async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      view_count: 0
    };

    const newItem = new FAQItem(itemData);
    const savedItem = await newItem.save();
    
    // Populate category for response
    await savedItem.populate('category_id', 'name_tr name_en icon color');
    
    res.status(201).json({
      success: true,
      data: savedItem,
      message: 'FAQ öğesi başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Error creating FAQ item:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update FAQ item
router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedItem = await FAQItem
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category_id', 'name_tr name_en icon color');

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'FAQ öğesi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: updatedItem,
      message: 'FAQ öğesi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Error updating FAQ item:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete FAQ item
router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await FAQItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'FAQ öğesi bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'FAQ öğesi başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Toggle FAQ item status
router.patch('/items/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const updatedItem = await FAQItem.findByIdAndUpdate(
      id, 
      { is_active }, 
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'FAQ öğesi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: updatedItem,
      message: 'FAQ öğesi durumu güncellendi'
    });
  } catch (error) {
    console.error('Error updating FAQ item status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all FAQ categories (Admin)
router.get('/categories', async (req, res) => {
  try {
    const categories = await FAQCategory
      .find({})
      .sort({ order_index: 1, created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get public FAQ categories
router.get('/categories/public', async (req, res) => {
  try {
    const categories = await FAQCategory
      .find({ is_active: true })
      .sort({ order_index: 1, created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching public FAQ categories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create FAQ category
router.post('/categories', async (req, res) => {
  try {
    const categoryData = req.body;

    const newCategory = new FAQCategory(categoryData);
    const savedCategory = await newCategory.save();
    
    res.status(201).json({
      success: true,
      data: savedCategory,
      message: 'FAQ kategorisi başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update FAQ category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await FAQCategory.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'FAQ kategorisi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: updatedCategory,
      message: 'FAQ kategorisi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete FAQ category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has FAQ items
    const itemCount = await FAQItem.countDocuments({ category_id: id });
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kategoriye bağlı FAQ öğeleri var. Önce onları silin veya başka kategoriye taşıyın.'
      });
    }
    
    const deletedCategory = await FAQCategory.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'FAQ kategorisi bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'FAQ kategorisi başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting FAQ category:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Toggle FAQ category status
router.patch('/categories/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const updatedCategory = await FAQCategory.findByIdAndUpdate(
      id, 
      { is_active }, 
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'FAQ kategorisi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: updatedCategory,
      message: 'FAQ kategorisi durumu güncellendi'
    });
  } catch (error) {
    console.error('Error updating FAQ category status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;