// routes/packages.js - MongoDB Package Routes
import express from 'express';
import Package from '../src/models/Package.js';

const router = express.Router();

// Get all active packages with language support
router.get('/', async (req, res) => {
  try {
    const { lang = 'tr' } = req.query;
    
    const packages = await Package
      .find({ isActive: true })
      .sort({ orderIndex: 1, createdAt: -1 })
      .lean();

    // Format response based on language
    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      id: pkg._id,
      title: lang === 'en' ? pkg.title.en : pkg.title.tr,
      description: lang === 'en' ? pkg.description.en : pkg.description.tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      duration: lang === 'en' ? pkg.duration.en : pkg.duration.tr,
      features: lang === 'en' ? pkg.features.en : pkg.features.tr,
      isPopular: pkg.isPopular,
      icon: pkg.icon,
      category: pkg.category,
      orderIndex: pkg.orderIndex,
      discountPercentage: pkg.discountPercentage,
      isAvailable: pkg.isAvailable,
      remainingCapacity: pkg.remainingCapacity,
      seoTitle: lang === 'en' ? pkg.seoTitle?.en : pkg.seoTitle?.tr,
      seoDescription: lang === 'en' ? pkg.seoDescription?.en : pkg.seoDescription?.tr,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt
    }));

    res.json({
      success: true,
      data: formattedPackages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get popular packages
router.get('/popular', async (req, res) => {
  try {
    const { lang = 'tr' } = req.query;
    
    const packages = await Package
      .find({ isActive: true, isPopular: true })
      .sort({ orderIndex: 1, createdAt: -1 })
      .lean();

    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      id: pkg._id,
      title: lang === 'en' ? pkg.title.en : pkg.title.tr,
      description: lang === 'en' ? pkg.description.en : pkg.description.tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      duration: lang === 'en' ? pkg.duration.en : pkg.duration.tr,
      features: lang === 'en' ? pkg.features.en : pkg.features.tr,
      isPopular: pkg.isPopular,
      icon: pkg.icon,
      category: pkg.category,
      discountPercentage: pkg.discountPercentage
    }));

    res.json({
      success: true,
      data: formattedPackages
    });
  } catch (error) {
    console.error('Error fetching popular packages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get home featured packages (Top 3 packages for homepage)
router.get('/home-featured', async (req, res) => {
  try {
    const { lang = 'tr' } = req.query;
    
    const packages = await Package
      .find({ isActive: true })
      .sort({ isPopular: -1, orderIndex: 1, createdAt: -1 })
      .limit(3)
      .lean();

    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      id: pkg._id,
      title: lang === 'en' ? pkg.title.en : pkg.title.tr,
      description: lang === 'en' ? pkg.description.en : pkg.description.tr,
      price: pkg.price,
      duration: lang === 'en' ? pkg.duration.en : pkg.duration.tr,
      icon: pkg.icon,
      isPopular: pkg.isPopular,
      category: pkg.category
    }));

    res.json({
      success: true,
      data: formattedPackages
    });
  } catch (error) {
    console.error('Error fetching home featured packages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single package by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'tr' } = req.query;
    
    const pkg = await Package.findById(id).lean();
    
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı'
      });
    }

    const formattedPackage = {
      _id: pkg._id,
      id: pkg._id,
      title: lang === 'en' ? pkg.title.en : pkg.title.tr,
      description: lang === 'en' ? pkg.description.en : pkg.description.tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      duration: lang === 'en' ? pkg.duration.en : pkg.duration.tr,
      features: lang === 'en' ? pkg.features.en : pkg.features.tr,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      icon: pkg.icon,
      category: pkg.category,
      orderIndex: pkg.orderIndex,
      maxClients: pkg.maxClients,
      currentClients: pkg.currentClients,
      tags: pkg.tags,
      discountPercentage: pkg.discountPercentage,
      isAvailable: pkg.isAvailable,
      remainingCapacity: pkg.remainingCapacity,
      seoTitle: lang === 'en' ? pkg.seoTitle?.en : pkg.seoTitle?.tr,
      seoDescription: lang === 'en' ? pkg.seoDescription?.en : pkg.seoDescription?.tr,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt
    };

    res.json({
      success: true,
      data: formattedPackage
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new package (Admin only)
router.post('/', async (req, res) => {
  try {
    const packageData = req.body;

    const newPackage = new Package(packageData);
    const savedPackage = await newPackage.save();
    
    res.status(201).json({
      success: true,
      data: savedPackage,
      message: 'Paket başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update package (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPackage = await Package.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı'
      });
    }

    res.json({
      success: true,
      data: updatedPackage,
      message: 'Paket başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete package (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPackage = await Package.findByIdAndDelete(id);
    
    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Paket başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Toggle package status (Admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const updatedPackage = await Package.findByIdAndUpdate(
      id, 
      { isActive }, 
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı'
      });
    }

    res.json({
      success: true,
      data: updatedPackage,
      message: 'Paket durumu güncellendi'
    });
  } catch (error) {
    console.error('Error updating package status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
