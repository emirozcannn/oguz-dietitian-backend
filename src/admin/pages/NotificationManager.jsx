import React, { useState, useEffect } from 'react';
import { sendBulkNotification, getNotificationStats, NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from '../../lib/notificationService';
import { sendCouponNotification } from '../../lib/notificationService';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedTab, setSelectedTab] = useState('send');
  const [bulkNotificationForm, setBulkNotificationForm] = useState({
    type: NOTIFICATION_TYPES.COUPON_SENT,
    channels: NOTIFICATION_CHANNELS.BOTH,
    subject: '',
    message: '',
    recipients: 'all_users',
    couponCode: '',
    discount: 10,
    expiryDate: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const result = await getNotificationStats(startDate.toISOString(), endDate.toISOString());
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleBulkNotification = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      // Alıcıları al
      let recipients = [];
      if (bulkNotificationForm.recipients === 'all_users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, phone, first_name, last_name')
          .eq('role', 'client');
        
        if (error) throw error;
        recipients = data || [];
      } else if (bulkNotificationForm.recipients === 'newsletter_subscribers') {
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('email, first_name, last_name')
          .eq('is_active', true);
        
        if (error) throw error;
        recipients = data.map(sub => ({ ...sub, phone: null }));
      }

      // Kupon gönderimi için özel işlem
      if (bulkNotificationForm.type === NOTIFICATION_TYPES.COUPON_SENT) {
        // Kupon oluştur
        const { data: couponData, error: couponError } = await supabase
          .from('discount_codes')
          .insert([
            {
              code: bulkNotificationForm.couponCode,
              name_tr: `Toplu Kampanya - ${bulkNotificationForm.couponCode}`,
              name_en: `Bulk Campaign - ${bulkNotificationForm.couponCode}`,
              discount_value: bulkNotificationForm.discount,
              discount_type: 'percentage',
              valid_until: bulkNotificationForm.expiryDate,
              usage_limit: recipients.length,
              is_active: true
            }
          ])
          .select()
          .single();

        if (couponError) throw couponError;

        // Kupon bildirimlerini gönder
        const promises = recipients.map(recipient => 
          sendCouponNotification(
            {
              email: recipient.email,
              phone: recipient.phone,
              firstName: recipient.first_name
            },
            couponData,
            false
          )
        );

        await Promise.all(promises);
      } else {
        // Diğer bildirim türleri
        await sendBulkNotification(
          bulkNotificationForm.type,
          recipients,
          {
            subject: bulkNotificationForm.subject,
            message: bulkNotificationForm.message
          },
          bulkNotificationForm.channels
        );
      }

      alert('Bildirimler başarıyla gönderildi!');
      setBulkNotificationForm({
        type: NOTIFICATION_TYPES.COUPON_SENT,
        channels: NOTIFICATION_CHANNELS.BOTH,
        subject: '',
        message: '',
        recipients: 'all_users',
        couponCode: '',
        discount: 10,
        expiryDate: ''
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Bulk notification error:', error);
      alert('Bildirim gönderme hatası: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusBadge = (success) => {
    return success ? 'success' : 'danger';
  };

  const getStatusText = (success) => {
    return success ? 'Başarılı' : 'Başarısız';
  };

  const getTypeText = (type) => {
    const types = {
      [NOTIFICATION_TYPES.ORDER_CONFIRMATION]: 'Sipariş Onayı',
      [NOTIFICATION_TYPES.APPOINTMENT_CONFIRMATION]: 'Randevu Onayı',
      [NOTIFICATION_TYPES.COUPON_SENT]: 'Kupon Gönderimi',
      [NOTIFICATION_TYPES.WELCOME_MESSAGE]: 'Hoş Geldin Mesajı',
      [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: 'Ödeme Başarılı',
      [NOTIFICATION_TYPES.NEWSLETTER_WELCOME]: 'Bülten Hoş Geldin'
    };
    return types[type] || type;
  };

  const getChannelText = (channel) => {
    const channels = {
      [NOTIFICATION_CHANNELS.EMAIL]: 'Email',
      [NOTIFICATION_CHANNELS.SMS]: 'SMS',
      [NOTIFICATION_CHANNELS.BOTH]: 'Email + SMS'
    };
    return channels[channel] || channel;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-bell-fill me-2 text-primary"></i>
          Bildirim Yönetimi
        </h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${selectedTab === 'send' ? 'active' : ''}`}
            onClick={() => setSelectedTab('send')}
          >
            <i className="bi bi-send me-2"></i>
            Bildirim Gönder
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${selectedTab === 'history' ? 'active' : ''}`}
            onClick={() => setSelectedTab('history')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Bildirim Geçmişi
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${selectedTab === 'stats' ? 'active' : ''}`}
            onClick={() => setSelectedTab('stats')}
          >
            <i className="bi bi-bar-chart me-2"></i>
            İstatistikler
          </button>
        </li>
      </ul>

      {/* Send Notification Tab */}
      {selectedTab === 'send' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Toplu Bildirim Gönder</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleBulkNotification}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Bildirim Türü</label>
                  <select
                    className="form-select"
                    value={bulkNotificationForm.type}
                    onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, type: e.target.value})}
                  >
                    <option value={NOTIFICATION_TYPES.COUPON_SENT}>Kupon Gönderimi</option>
                    <option value={NOTIFICATION_TYPES.WELCOME_MESSAGE}>Hoş Geldin Mesajı</option>
                    <option value={NOTIFICATION_TYPES.NEWSLETTER_WELCOME}>Bülten Hoş Geldin</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gönderim Kanalı</label>
                  <select
                    className="form-select"
                    value={bulkNotificationForm.channels}
                    onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, channels: e.target.value})}
                  >
                    <option value={NOTIFICATION_CHANNELS.BOTH}>Email + SMS</option>
                    <option value={NOTIFICATION_CHANNELS.EMAIL}>Sadece Email</option>
                    <option value={NOTIFICATION_CHANNELS.SMS}>Sadece SMS</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Alıcı Grubu</label>
                  <select
                    className="form-select"
                    value={bulkNotificationForm.recipients}
                    onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, recipients: e.target.value})}
                  >
                    <option value="all_users">Tüm Kullanıcılar</option>
                    <option value="newsletter_subscribers">Bülten Aboneleri</option>
                  </select>
                </div>

                {bulkNotificationForm.type === NOTIFICATION_TYPES.COUPON_SENT && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Kupon Kodu</label>
                      <input
                        type="text"
                        className="form-control"
                        value={bulkNotificationForm.couponCode}
                        onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, couponCode: e.target.value})}
                        placeholder="KAMPANYA2025"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">İndirim Oranı (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={bulkNotificationForm.discount}
                        onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, discount: e.target.value})}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Son Kullanma Tarihi</label>
                      <input
                        type="date"
                        className="form-control"
                        value={bulkNotificationForm.expiryDate}
                        onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, expiryDate: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="col-12">
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Gönder
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Bildirim Geçmişi</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Tür</th>
                    <th>Alıcı</th>
                    <th>Kanal</th>
                    <th>Durum</th>
                    <th>Email</th>
                    <th>SMS</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>{formatDate(notification.created_at)}</td>
                      <td>{getTypeText(notification.type)}</td>
                      <td>
                        {notification.recipient_email && (
                          <div><small>{notification.recipient_email}</small></div>
                        )}
                        {notification.recipient_phone && (
                          <div><small>{notification.recipient_phone}</small></div>
                        )}
                      </td>
                      <td>{getChannelText(notification.channels)}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(notification.success)}`}>
                          {getStatusText(notification.success)}
                        </span>
                      </td>
                      <td>
                        {notification.channels !== 'sms' && (
                          <span className={`badge bg-${notification.email_success ? 'success' : 'danger'}`}>
                            {notification.email_success ? 'Başarılı' : 'Başarısız'}
                          </span>
                        )}
                      </td>
                      <td>
                        {notification.channels !== 'email' && (
                          <span className={`badge bg-${notification.sms_success ? 'success' : 'danger'}`}>
                            {notification.sms_success ? 'Başarılı' : 'Başarısız'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {selectedTab === 'stats' && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-envelope-fill text-primary mb-3" style={{ fontSize: '2rem' }}></i>
                <h4>{stats.total || 0}</h4>
                <p className="text-muted mb-0">Toplam Bildirim</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '2rem' }}></i>
                <h4>{stats.successful || 0}</h4>
                <p className="text-muted mb-0">Başarılı</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-x-circle-fill text-danger mb-3" style={{ fontSize: '2rem' }}></i>
                <h4>{stats.failed || 0}</h4>
                <p className="text-muted mb-0">Başarısız</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-percent text-info mb-3" style={{ fontSize: '2rem' }}></i>
                <h4>{stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%</h4>
                <p className="text-muted mb-0">Başarı Oranı</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
