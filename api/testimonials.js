const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { auth, adminAuth } = require('../middleware/auth.js');
const Testimonial = require('../models/Testimonial.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/testimonials', '').split('/').filter(Boolean);

  try {
    // GET /api/testimonials - Get testimonials
    if (method === 'GET' && segments.length === 0) {
      return await getTestimonials(req, res);
    }

    // GET /api/testimonials/admin/all - Get all testimonials for admin
    if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'all') {
      return await getAllTestimonialsAdmin(req, res);
    }

    // POST /api/testimonials - Create new testimonial
    if (method === 'POST' && segments.length === 0) {
      return await createTestimonial(req, res);
    }

    // PUT /api/testimonials/:id - Update testimonial (admin only)
    if (method === 'PUT' && segments.length === 1) {
      return await updateTestimonial(req, res, segments[0]);
    }

    // PUT /api/testimonials/:id/status - Update testimonial status (admin)
    if (method === 'PUT' && segments[0] && segments[1] === 'status') {
      return await updateTestimonialStatus(req, res, segments[0]);
    }

    // DELETE /api/testimonials/:id - Delete testimonial (admin only)
    if (method === 'DELETE' && segments.length === 1) {
      return await deleteTestimonial(req, res, segments[0]);
    }

    sendError(res, 'Testimonial route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Testimonial API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Testimonial functions
async function getTestimonials(req, res) {
  try {
    const { language = 'tr', limit, type, status } = req.query;

    const query = { 
      isVisible: true 
    };

    // Add type filter for approved testimonials
    if (type === 'approved' || !status) {
      query.status = 'approved';
    } else if (status) {
      query.status = status;
    }

    let dbQuery = Testimonial.find(query)
      .populate('packageUsed', 'title_tr title_en')
      .sort({ sortOrder: 1, approvedAt: -1 });

    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    }

    const testimonials = await dbQuery;

    const formattedTestimonials = testimonials.map(testimonial => ({
      _id: testimonial._id,
      name: testimonial.name,
      content: testimonial.content[language] || testimonial.content.tr,
      rating: testimonial.rating,
      position: testimonial.position,
      company: testimonial.company,
      location: testimonial.location,
      avatarUrl: testimonial.avatarUrl,
      packageUsed: testimonial.packageUsed,
      approvedAt: testimonial.approvedAt
    }));

    sendSuccess(res, { testimonials: formattedTestimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    sendError(res, 'Failed to fetch testimonials', 500);
  }
}

async function createTestimonial(req, res) {
  try {
    const testimonial = await Testimonial.create(req.body);
    sendSuccess(res, { testimonial }, 'Testimonial submitted successfully', 201);
  } catch (error) {
    console.error('Create testimonial error:', error);
    sendError(res, 'Failed to submit testimonial', 500);
  }
}

async function updateTestimonial(req, res, id) {
  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('packageUsed');

    if (!testimonial) {
      return sendError(res, 'Testimonial not found', 404, 'TESTIMONIAL_NOT_FOUND');
    }

    sendSuccess(res, { testimonial }, 'Testimonial updated successfully');
  } catch (error) {
    console.error('Update testimonial error:', error);
    sendError(res, 'Failed to update testimonial', 500);
  }
}

async function deleteTestimonial(req, res, id) {
  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return sendError(res, 'Testimonial not found', 404, 'TESTIMONIAL_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'Testimonial deleted successfully');
  } catch (error) {
    console.error('Delete testimonial error:', error);
    sendError(res, 'Failed to delete testimonial', 500);
  }
}

// Admin testimonial functions
async function getAllTestimonialsAdmin(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { status, page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const testimonials = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Testimonial.countDocuments(filter);

    sendSuccess(res, {
      testimonials,
      pagination: {
        page: parseInt(page),
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all testimonials admin error:', error);
    sendError(res, 'Failed to fetch testimonials', 500);
  }
}

async function updateTestimonialStatus(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { status, isVisible } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { 
        status, 
        isVisible,
        ...(status === 'approved' && { approvedAt: new Date() })
      },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return sendError(res, 'Testimonial not found', 404, 'TESTIMONIAL_NOT_FOUND');
    }

    sendSuccess(res, { testimonial }, 'Testimonial status updated successfully');
  } catch (error) {
    console.error('Update testimonial status error:', error);
    sendError(res, 'Failed to update testimonial status', 500);
  }
}
