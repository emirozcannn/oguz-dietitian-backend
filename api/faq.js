const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { adminAuth } = require('../middleware/auth.js');
const { FAQCategory, FAQItem } = require('../models/FAQ.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/faq', '').split('/').filter(Boolean);

  try {
    // GET /api/faq - Get FAQ data (public)
    if (method === 'GET' && segments.length === 0) {
      return await getFAQ(req, res);
    }

    // GET /api/faq/categories - Get FAQ categories (admin)
    if (method === 'GET' && segments[0] === 'categories') {
      return await getFAQCategories(req, res);
    }

    // GET /api/faq/items - Get FAQ items (admin) 
    if (method === 'GET' && segments[0] === 'items') {
      return await getFAQItems(req, res);
    }

    // POST /api/faq/categories - Create FAQ category (admin)
    if (method === 'POST' && segments[0] === 'categories') {
      return await createFAQCategory(req, res);
    }

    // POST /api/faq/items - Create FAQ item (admin)
    if (method === 'POST' && segments[0] === 'items') {
      return await createFAQItem(req, res);
    }

    // PUT /api/faq/categories/:id - Update FAQ category (admin)
    if (method === 'PUT' && segments[0] === 'categories' && segments[1]) {
      return await updateFAQCategory(req, res, segments[1]);
    }

    // PUT /api/faq/items/:id - Update FAQ item (admin)
    if (method === 'PUT' && segments[0] === 'items' && segments[1]) {
      return await updateFAQItem(req, res, segments[1]);
    }

    // DELETE /api/faq/categories/:id - Delete FAQ category (admin)
    if (method === 'DELETE' && segments[0] === 'categories' && segments[1]) {
      return await deleteFAQCategory(req, res, segments[1]);
    }

    // DELETE /api/faq/items/:id - Delete FAQ item (admin)
    if (method === 'DELETE' && segments[0] === 'items' && segments[1]) {
      return await deleteFAQItem(req, res, segments[1]);
    }

    // PATCH /api/faq/items/:id/status - Update FAQ item status (admin)
    if (method === 'PATCH' && segments[0] === 'items' && segments[1] && segments[2] === 'status') {
      return await updateFAQItemStatus(req, res, segments[1]);
    }

    // PATCH /api/faq/categories/:id/status - Update FAQ category status (admin)
    if (method === 'PATCH' && segments[0] === 'categories' && segments[1] && segments[2] === 'status') {
      return await updateFAQCategoryStatus(req, res, segments[1]);
    }

    sendError(res, 'FAQ route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('FAQ API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Public FAQ function
async function getFAQ(req, res) {
  try {
    const { language = 'tr' } = req.query;

    const categories = await FAQCategory.find({ isActive: true })
      .sort({ sortOrder: 1 });

    const items = await FAQItem.find({ isActive: true })
      .populate('category')
      .sort({ sortOrder: 1 });

    const faqData = categories.map(category => ({
      _id: category._id,
      name: language === 'en' ? category.name_en : category.name_tr,
      description: language === 'en' ? category.description_en : category.description_tr,
      icon: category.icon,
      color: category.color,
      items: items
        .filter(item => item.category._id.toString() === category._id.toString())
        .map(item => ({
          _id: item._id,
          question: language === 'en' ? item.question_en : item.question_tr,
          answer: language === 'en' ? item.answer_en : item.answer_tr,
          viewCount: item.viewCount
        }))
    }));

    sendSuccess(res, { faq: faqData });
  } catch (error) {
    console.error('Get FAQ error:', error);
    sendError(res, 'Failed to fetch FAQ', 500);
  }
}

// Admin FAQ functions
async function getFAQCategories(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const categories = await FAQCategory.find().sort({ sortOrder: 1 });
    sendSuccess(res, { categories });
  } catch (error) {
    console.error('Get FAQ categories error:', error);
    sendError(res, 'Failed to fetch FAQ categories', 500);
  }
}

async function getFAQItems(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const items = await FAQItem.find()
      .populate('category')
      .sort({ sortOrder: 1 });
    sendSuccess(res, { items });
  } catch (error) {
    console.error('Get FAQ items error:', error);
    sendError(res, 'Failed to fetch FAQ items', 500);
  }
}

async function createFAQCategory(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const category = await FAQCategory.create(req.body);
    sendSuccess(res, { category }, 'FAQ category created successfully', 201);
  } catch (error) {
    console.error('Create FAQ category error:', error);
    sendError(res, 'Failed to create FAQ category', 500);
  }
}

async function createFAQItem(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const item = await FAQItem.create(req.body);
    const populatedItem = await FAQItem.findById(item._id).populate('category');
    sendSuccess(res, { item: populatedItem }, 'FAQ item created successfully', 201);
  } catch (error) {
    console.error('Create FAQ item error:', error);
    sendError(res, 'Failed to create FAQ item', 500);
  }
}

async function updateFAQCategory(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const category = await FAQCategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 'FAQ category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    sendSuccess(res, { category }, 'FAQ category updated successfully');
  } catch (error) {
    console.error('Update FAQ category error:', error);
    sendError(res, 'Failed to update FAQ category', 500);
  }
}

async function updateFAQItem(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const item = await FAQItem.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');

    if (!item) {
      return sendError(res, 'FAQ item not found', 404, 'ITEM_NOT_FOUND');
    }

    sendSuccess(res, { item }, 'FAQ item updated successfully');
  } catch (error) {
    console.error('Update FAQ item error:', error);
    sendError(res, 'Failed to update FAQ item', 500);
  }
}

async function deleteFAQCategory(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const category = await FAQCategory.findByIdAndDelete(id);

    if (!category) {
      return sendError(res, 'FAQ category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'FAQ category deleted successfully');
  } catch (error) {
    console.error('Delete FAQ category error:', error);
    sendError(res, 'Failed to delete FAQ category', 500);
  }
}

async function deleteFAQItem(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const item = await FAQItem.findByIdAndDelete(id);

    if (!item) {
      return sendError(res, 'FAQ item not found', 404, 'ITEM_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'FAQ item deleted successfully');
  } catch (error) {
    console.error('Delete FAQ item error:', error);
    sendError(res, 'Failed to delete FAQ item', 500);
  }
}

async function updateFAQItemStatus(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { isActive } = req.body;

    const item = await FAQItem.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).populate('category');

    if (!item) {
      return sendError(res, 'FAQ item not found', 404, 'ITEM_NOT_FOUND');
    }

    sendSuccess(res, { item }, 'FAQ item status updated successfully');
  } catch (error) {
    console.error('Update FAQ item status error:', error);
    sendError(res, 'Failed to update FAQ item status', 500);
  }
}

async function updateFAQCategoryStatus(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { isActive } = req.body;

    const category = await FAQCategory.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 'FAQ category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    sendSuccess(res, { category }, 'FAQ category status updated successfully');
  } catch (error) {
    console.error('Update FAQ category status error:', error);
    sendError(res, 'Failed to update FAQ category status', 500);
  }
}
