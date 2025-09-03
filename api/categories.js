const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const Category = require('../models/Category.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;

  try {
    // GET /api/categories - Get categories
    if (method === 'GET') {
      return await getCategories(req, res);
    }

    sendError(res, 'Category route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Category API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Category functions
async function getCategories(req, res) {
  try {
    const { language = 'tr' } = req.query;

    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 });

    const formattedCategories = categories.map(category => ({
      _id: category._id,
      name: language === 'en' ? category.name_en : category.name_tr,
      slug: language === 'en' ? category.slug_en : category.slug_tr,
      description: language === 'en' ? category.description_en : category.description_tr,
      color: category.color,
      icon: category.icon
    }));

    sendSuccess(res, { categories: formattedCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to fetch categories', 500);
  }
}
