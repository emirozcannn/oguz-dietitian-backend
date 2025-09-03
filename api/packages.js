const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { auth, adminAuth } = require('../middleware/auth.js');
const Package = require('../models/Package.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/packages', '').split('/').filter(Boolean);

  try {
    // GET /api/packages - Get all packages
    if (method === 'GET' && segments.length === 0) {
      return await getPackages(req, res);
    }

    // GET /api/packages/:id - Get single package
    if (method === 'GET' && segments.length === 1) {
      return await getPackage(req, res, segments[0]);
    }

    // POST /api/packages - Create new package (admin only)
    if (method === 'POST' && segments.length === 0) {
      return await createPackage(req, res);
    }

    // PUT /api/packages/:id - Update package (admin only)
    if (method === 'PUT' && segments.length === 1) {
      return await updatePackage(req, res, segments[0]);
    }

    // PATCH /api/packages/:id/status - Update package status (admin)
    if (method === 'PATCH' && segments[0] && segments[1] === 'status') {
      return await updatePackageStatus(req, res, segments[0]);
    }

    // DELETE /api/packages/:id - Delete package (admin only)
    if (method === 'DELETE' && segments.length === 1) {
      return await deletePackage(req, res, segments[0]);
    }

    sendError(res, 'Package route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Package API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Package functions
async function getPackages(req, res) {
  try {
    const { language = 'tr', category, type } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (type === 'home-featured') query.isHomeFeatured = true;

    const packages = await Package.find(query)
      .populate('category', 'name_tr name_en')
      .sort({ sortOrder: 1, createdAt: -1 });

    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      title: language === 'en' ? pkg.title_en : pkg.title_tr,
      description: language === 'en' ? pkg.description_en : pkg.description_tr,
      features: language === 'en' ? pkg.features_en : pkg.features_tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      currency: pkg.currency,
      duration: language === 'en' ? pkg.duration_en : pkg.duration_tr,
      sessionCount: pkg.sessionCount,
      type: pkg.type,
      category: pkg.category,
      isPopular: pkg.isPopular,
      icon: pkg.icon,
      color: pkg.color,
      discountPercentage: pkg.discountPercentage,
      rating: pkg.rating,
      createdAt: pkg.createdAt
    }));

    sendSuccess(res, { packages: formattedPackages });
  } catch (error) {
    console.error('Get packages error:', error);
    sendError(res, 'Failed to fetch packages', 500);
  }
}

async function getPackage(req, res, id) {
  try {
    const { language = 'tr' } = req.query;

    const pkg = await Package.findOne({ _id: id, isActive: true })
      .populate('category', 'name_tr name_en');

    if (!pkg) {
      return sendError(res, 'Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    const formattedPackage = {
      _id: pkg._id,
      title: language === 'en' ? pkg.title_en : pkg.title_tr,
      description: language === 'en' ? pkg.description_en : pkg.description_tr,
      features: language === 'en' ? pkg.features_en : pkg.features_tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      duration: language === 'en' ? pkg.duration_en : pkg.duration_tr,
      sessionCount: pkg.sessionCount,
      type: pkg.type,
      category: pkg.category,
      isPopular: pkg.isPopular,
      includes: pkg.includes,
      excludes: pkg.excludes,
      requirements: language === 'en' ? pkg.requirements_en : pkg.requirements_tr,
      rating: pkg.rating,
      purchaseCount: pkg.purchaseCount
    };

    sendSuccess(res, { package: formattedPackage });
  } catch (error) {
    console.error('Get package error:', error);
    sendError(res, 'Failed to fetch package', 500);
  }
}

async function createPackage(req, res) {
  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const pkg = await Package.create(req.body);
    const populatedPackage = await Package.findById(pkg._id)
      .populate('category');

    sendSuccess(res, { package: populatedPackage }, 'Package created successfully', 201);
  } catch (error) {
    console.error('Create package error:', error);
    sendError(res, 'Failed to create package', 500);
  }
}

async function updatePackage(req, res, id) {
  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const pkg = await Package.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');

    if (!pkg) {
      return sendError(res, 'Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    sendSuccess(res, { package: pkg }, 'Package updated successfully');
  } catch (error) {
    console.error('Update package error:', error);
    sendError(res, 'Failed to update package', 500);
  }
}

async function deletePackage(req, res, id) {
  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const pkg = await Package.findByIdAndDelete(id);

    if (!pkg) {
      return sendError(res, 'Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'Package deleted successfully');
  } catch (error) {
    console.error('Delete package error:', error);
    sendError(res, 'Failed to delete package', 500);
  }
}

async function updatePackageStatus(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { isActive, isVisible } = req.body;

    const pkg = await Package.findByIdAndUpdate(
      id,
      { isActive, isVisible },
      { new: true, runValidators: true }
    );

    if (!pkg) {
      return sendError(res, 'Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    sendSuccess(res, { package: pkg }, 'Package status updated successfully');
  } catch (error) {
    console.error('Update package status error:', error);
    sendError(res, 'Failed to update package status', 500);
  }
}
