const { connectDB } = require('../../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../../lib/response.js');
const { adminAuth } = require('../../middleware/auth.js');
const Contact = require('../../models/Contact.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;

  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    // GET /api/admin/contacts - Get all contact messages
    if (method === 'GET') {
      return await getContacts(req, res);
    }

    // PUT /api/admin/contacts/:id - Update contact status
    if (method === 'PUT') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const segments = url.pathname.replace('/api/admin/contacts/', '').split('/').filter(Boolean);
      return await updateContactStatus(req, res, segments[0]);
    }

    // DELETE /api/admin/contacts/:id - Delete contact
    if (method === 'DELETE') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const segments = url.pathname.replace('/api/admin/contacts/', '').split('/').filter(Boolean);
      return await deleteContact(req, res, segments[0]);
    }

    sendError(res, 'Admin contact route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Admin Contact API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

async function getContacts(req, res) {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    sendSuccess(res, {
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    sendError(res, 'Failed to fetch contacts', 500);
  }
}

async function updateContactStatus(req, res, id) {
  try {
    const { status, reply } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { 
        status, 
        reply, 
        repliedAt: status === 'replied' ? new Date() : undefined 
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return sendError(res, 'Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    sendSuccess(res, { contact }, 'Contact updated successfully');
  } catch (error) {
    console.error('Update contact error:', error);
    sendError(res, 'Failed to update contact', 500);
  }
}

async function deleteContact(req, res, id) {
  try {
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return sendError(res, 'Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'Contact deleted successfully');
  } catch (error) {
    console.error('Delete contact error:', error);
    sendError(res, 'Failed to delete contact', 500);
  }
}
