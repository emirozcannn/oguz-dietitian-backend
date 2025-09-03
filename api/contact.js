const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { adminAuth } = require('../middleware/auth.js');
const Contact = require('../models/Contact.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/contact', '').split('/').filter(Boolean);

  try {
    // POST /api/contact - Submit contact form
    if (method === 'POST' && segments.length === 0) {
      return await submitContact(req, res);
    }

    // GET /api/contact/info - Get contact information
    if (method === 'GET' && segments[0] === 'info') {
      return await getContactInfo(req, res);
    }

    // GET /api/contact/admin/messages - Get contact messages for admin
    if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'messages') {
      return await getContactMessages(req, res);
    }

    // PUT /api/contact/admin/messages/:id - Update contact message (admin)
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'messages' && segments[2]) {
      return await updateContactMessage(req, res, segments[2]);
    }

    // DELETE /api/contact/admin/messages/:id - Delete contact message (admin)
    if (method === 'DELETE' && segments[0] === 'admin' && segments[1] === 'messages' && segments[2]) {
      return await deleteContactMessage(req, res, segments[2]);
    }

    sendError(res, 'Contact route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Contact API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Contact functions
async function submitContact(req, res) {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const contact = await Contact.create(contactData);
    sendSuccess(res, { contact }, 'Message sent successfully', 201);
  } catch (error) {
    console.error('Create contact error:', error);
    sendError(res, 'Failed to send message', 500);
  }
}

async function getContactInfo(req, res) {
  try {
    const { language = 'tr' } = req.query;
    
    const contactInfo = {
      phone: '+90 XXX XXX XX XX',
      email: 'info@oguzyolyapan.com',
      address: language === 'en' 
        ? 'Address Information (English)'
        : 'Adres Bilgisi (Türkçe)',
      workingHours: language === 'en'
        ? 'Monday - Friday: 09:00 - 18:00'
        : 'Pazartesi - Cuma: 09:00 - 18:00',
      social: {
        instagram: 'https://instagram.com/oguzyolyapan',
        linkedin: 'https://linkedin.com/in/oguzyolyapan',
        facebook: 'https://facebook.com/oguzyolyapan'
      }
    };

    sendSuccess(res, contactInfo);
  } catch (error) {
    console.error('Get contact info error:', error);
    sendError(res, 'Failed to get contact info', 500);
  }
}

// Admin contact functions
async function getContactMessages(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { status, page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const messages = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    sendSuccess(res, {
      messages,
      pagination: {
        page: parseInt(page),
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    sendError(res, 'Failed to fetch contact messages', 500);
  }
}

async function updateContactMessage(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { status, reply } = req.body;

    const updateData = { status };
    if (reply) updateData.reply = reply;
    if (status === 'replied') updateData.repliedAt = new Date();

    const message = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!message) {
      return sendError(res, 'Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }

    sendSuccess(res, { message }, 'Contact message updated successfully');
  } catch (error) {
    console.error('Update contact message error:', error);
    sendError(res, 'Failed to update contact message', 500);
  }
}

async function deleteContactMessage(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return sendError(res, 'Contact message not found', 404, 'MESSAGE_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'Contact message deleted successfully');
  } catch (error) {
    console.error('Delete contact message error:', error);
    sendError(res, 'Failed to delete contact message', 500);
  }
}
