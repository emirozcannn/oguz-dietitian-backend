import { useState, useEffect } from 'react';
import apiClient from '../../lib/api.js';

const ContactManager = () => {
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // API'den contact mesajlarını yükle
      const response = await apiClient.request('/api/admin/contacts');
      
      if (response.success) {
        setMessages(response.data.contacts || []);
      } else {
        throw new Error(response.error || 'Failed to load contacts');
      }

    } catch (error) {
      console.error('Error loading contacts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      const response = await apiClient.request(`/api/admin/contacts/${messageId}/status`, {
        method: 'PATCH',
        data: { status }
      });

      if (!response.success) throw new Error(response.error);
      loadData();
    } catch (error) {
      console.error('Error updating message status:', error);
      setError(error.message);
    }
  };

  const updateMessagePriority = async (messageId, priority) => {
    try {
      const response = await apiClient.request(`/api/admin/contacts/${messageId}/priority`, {
        method: 'PATCH',
        data: { priority }
      });

      if (!response.success) throw new Error(response.error);
      loadData();
    } catch (error) {
      console.error('Error updating message priority:', error);
      setError(error.message);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await apiClient.request(`/api/admin/contacts/${messageId}/read`, {
        method: 'PATCH',
        data: { is_read: true }
      });

      if (!response.success) throw new Error(response.error);
      loadData();
    } catch (error) {
      console.error('Error marking message as read:', error);
      setError(error.message);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;

    try {
      const response = await apiClient.request(`/api/admin/contacts/${selectedMessage.id}/reply`, {
        method: 'POST',
        data: {
          reply_message: replyMessage,
          reply_date: new Date().toISOString(),
          is_replied: true,
          status: 'resolved'
        }
      });

      if (!response.success) throw new Error(response.error);

      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedMessage(null);
      loadData();
    } catch (error) {
      console.error('Error sending reply:', error);
      setError(error.message);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await apiClient.request(`/api/admin/contacts/${messageId}`, {
          method: 'DELETE'
        });

        if (!response.success) throw new Error(response.error);
        loadData();
      } catch (error) {
        console.error('Error deleting message:', error);
        setError(error.message);
      }
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filters.status !== 'all' && message.status !== filters.status) return false;
    if (filters.category !== 'all' && message.category_id !== filters.category) return false;
    if (filters.priority !== 'all' && message.priority !== filters.priority) return false;
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'bg-primary';
      case 'in_progress': return 'bg-warning';
      case 'resolved': return 'bg-success';
      case 'spam': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low': return 'bg-info';
      case 'normal': return 'bg-secondary';
      case 'high': return 'bg-warning';
      case 'urgent': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-envelope me-2"></i>
              İletişim Yönetimi
            </h2>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">Yeni: {messages.filter(m => m.status === 'new').length}</span>
              <span className="badge bg-warning">Devam Eden: {messages.filter(m => m.status === 'in_progress').length}</span>
              <span className="badge bg-success">Çözüldü: {messages.filter(m => m.status === 'resolved').length}</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Durum</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">Tümü</option>
                    <option value="new">Yeni</option>
                    <option value="in_progress">Devam Eden</option>
                    <option value="resolved">Çözüldü</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="all">Tümü</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name_tr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Öncelik</label>
                  <select
                    className="form-select"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  >
                    <option value="all">Tümü</option>
                    <option value="low">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setFilters({ status: 'all', category: 'all', priority: 'all' })}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                İletişim Mesajları ({filteredMessages.length})
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>İsim</th>
                      <th>Email</th>
                      <th>Konu</th>
                      <th>Kategori</th>
                      <th>Durum</th>
                      <th>Öncelik</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((message) => (
                      <tr key={message.id} className={!message.is_read ? 'table-warning' : ''}>
                        <td>{formatDate(message.created_at)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {!message.is_read && (
                              <i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '0.5rem' }}></i>
                            )}
                            {message.name}
                          </div>
                        </td>
                        <td>
                          <a 
                            href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}&body=${encodeURIComponent(`Merhaba ${message.name},\n\n"${message.subject}" konulu mesajınız için teşekkür ederim.\n\n\n\nSaygılarımla,\nOğuz Yolyapan\nDiyetisyen`)}`}
                            className="text-decoration-none"
                          >
                            {message.email}
                          </a>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                          {message.subject}
                        </td>
                        <td>
                          {message.contact_categories && (
                            <span 
                              className="badge"
                              style={{ backgroundColor: message.contact_categories.color, color: 'white' }}
                            >
                              <i className={`bi ${message.contact_categories.icon} me-1`}></i>
                              {message.contact_categories.name_tr}
                            </span>
                          )}
                        </td>
                        <td>
                          <select
                            className={`form-select form-select-sm badge ${getStatusBadgeClass(message.status)}`}
                            value={message.status}
                            onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                            style={{ color: 'white', border: 'none' }}
                          >
                            <option value="new">Yeni</option>
                            <option value="in_progress">Devam Eden</option>
                            <option value="resolved">Çözüldü</option>
                            <option value="spam">Spam</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className={`form-select form-select-sm badge ${getPriorityBadgeClass(message.priority)}`}
                            value={message.priority}
                            onChange={(e) => updateMessagePriority(message.id, e.target.value)}
                            style={{ color: 'white', border: 'none' }}
                          >
                            <option value="low">Düşük</option>
                            <option value="normal">Normal</option>
                            <option value="high">Yüksek</option>
                            <option value="urgent">Acil</option>
                          </select>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-info"
                              onClick={() => {
                                setSelectedMessage(message);
                                markAsRead(message.id);
                                setShowDetailModal(true);
                              }}
                              title="Mesaj detayını görüntüle"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <a
                              href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}&body=${encodeURIComponent(`Merhaba ${message.name},\n\n"${message.subject}" konulu mesajınız için teşekkür ederim.\n\n\n\nSaygılarımla,\nOğuz Yolyapan\nDiyetisyen`)}`}
                              className="btn btn-outline-success"
                              title="E-posta ile cevapla"
                            >
                              <i className="bi bi-envelope"></i>
                            </a>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowReplyModal(true);
                              }}
                              title="Sistem üzerinden cevapla"
                            >
                              <i className="bi bi-reply"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteMessage(message.id)}
                              title="Mesajı sil"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {showDetailModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-envelope-open me-2"></i>
                  Mesaj Detayı
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedMessage && (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong>İsim:</strong> {selectedMessage.name}
                      </div>
                      <div className="col-md-6">
                        <strong>Email:</strong> 
                        <a href={`mailto:${selectedMessage.email}`} className="ms-2">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong>Telefon:</strong> {selectedMessage.phone || 'Belirtilmemiş'}
                      </div>
                      <div className="col-md-6">
                        <strong>Tarih:</strong> {formatDate(selectedMessage.created_at)}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong>Durum:</strong>
                        <span className={`badge ms-2 ${getStatusBadgeClass(selectedMessage.status)}`}>
                          {selectedMessage.status === 'new' ? 'Yeni' : 
                           selectedMessage.status === 'in_progress' ? 'Devam Eden' :
                           selectedMessage.status === 'resolved' ? 'Çözüldü' : 'Spam'}
                        </span>
                      </div>
                      <div className="col-md-6">
                        <strong>Öncelik:</strong>
                        <span className={`badge ms-2 ${getPriorityBadgeClass(selectedMessage.priority)}`}>
                          {selectedMessage.priority === 'low' ? 'Düşük' :
                           selectedMessage.priority === 'normal' ? 'Normal' :
                           selectedMessage.priority === 'high' ? 'Yüksek' : 'Acil'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Konu:</strong> 
                      <div className="mt-1">{selectedMessage.subject}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Kategori:</strong>
                      {selectedMessage.contact_categories && (
                        <span 
                          className="badge ms-2"
                          style={{ backgroundColor: selectedMessage.contact_categories.color, color: 'white' }}
                        >
                          <i className={`bi ${selectedMessage.contact_categories.icon} me-1`}></i>
                          {selectedMessage.contact_categories.name_tr}
                        </span>
                      )}
                    </div>
                    <div className="mb-3">
                      <strong>Mesaj:</strong>
                      <div className="border rounded p-3 mt-2 bg-light">
                        {selectedMessage.message}
                      </div>
                    </div>
                    {selectedMessage.reply_message && (
                      <div className="mb-3">
                        <strong>Cevap:</strong>
                        <div className="border rounded p-3 mt-2 bg-success bg-opacity-10">
                          {selectedMessage.reply_message}
                        </div>
                        <small className="text-muted">
                          Cevap tarihi: {formatDate(selectedMessage.reply_date)}
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Kapat
                </button>
                <a
                  href={`mailto:${selectedMessage?.email}?subject=Re: ${encodeURIComponent(selectedMessage?.subject || '')}&body=${encodeURIComponent(`Merhaba ${selectedMessage?.name},\n\n"${selectedMessage?.subject}" konulu mesajınız için teşekkür ederim.\n\n\n\nSaygılarımla,\nOğuz Yolyapan\nDiyetisyen`)}`}
                  className="btn btn-success"
                >
                  <i className="bi bi-envelope me-2"></i>
                  E-posta Gönder
                </a>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowReplyModal(true);
                  }}
                >
                  <i className="bi bi-reply me-2"></i>
                  Cevapla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mesajı Yanıtla</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReplyModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedMessage && (
                  <div>
                    <div className="mb-3">
                      <strong>Kime:</strong> {selectedMessage.email}
                    </div>
                    <div className="mb-3">
                      <strong>Konu:</strong> Re: {selectedMessage.subject}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Cevap Mesajı</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Cevabınızı buraya yazın..."
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReplyModal(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={sendReply}
                  disabled={!replyMessage.trim()}
                >
                  <i className="bi bi-send me-2"></i>
                  Cevap Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;
