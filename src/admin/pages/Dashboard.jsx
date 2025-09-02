import { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ isEnglish }) => {
  const [stats] = useState({
    totalClients: 147,
    activePackages: 89,
    monthlyRevenue: 45000,
    newAppointments: 23,
    pendingOrders: 8,
    completedOrders: 156
  });

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: isEnglish ? 'New order from Ayşe Kaya' : 'Ayşe Kaya\'dan yeni sipariş',
      time: '2 min ago',
      icon: 'bi-cart-plus',
      color: 'success'
    },
    {
      id: 2,
      type: 'appointment',
      message: isEnglish ? 'Appointment scheduled with Mehmet Öz' : 'Mehmet Öz ile randevu planlandı',
      time: '15 min ago',
      icon: 'bi-calendar-check',
      color: 'info'
    },
    {
      id: 3,
      type: 'client',
      message: isEnglish ? 'New client registration' : 'Yeni danışan kaydı',
      time: '1 hour ago',
      icon: 'bi-person-plus',
      color: 'primary'
    }
  ];

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-speedometer2 me-2 text-success"></i>
          {isEnglish ? 'Dashboard' : 'Ana Panel'}
        </h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-download me-1"></i>
            {isEnglish ? 'Export' : 'Dışa Aktar'}
          </button>
          <button className="btn btn-success btn-sm">
            <i className="bi bi-plus-circle me-1"></i>
            {isEnglish ? 'Add New' : 'Yeni Ekle'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card stats-card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-people"></i>
                </div>
                <div className="ms-3">
                  <h3 className="mb-0 fw-bold">{stats.totalClients}</h3>
                  <p className="text-muted mb-0">{isEnglish ? 'Total Clients' : 'Toplam Danışan'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card stats-card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-success bg-opacity-10 text-success">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="ms-3">
                  <h3 className="mb-0 fw-bold">{stats.activePackages}</h3>
                  <p className="text-muted mb-0">{isEnglish ? 'Active Packages' : 'Aktif Paketler'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card stats-card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-info bg-opacity-10 text-info">
                  <i className="bi bi-currency-exchange"></i>
                </div>
                <div className="ms-3">
                  <h3 className="mb-0 fw-bold">₺{stats.monthlyRevenue.toLocaleString()}</h3>
                  <p className="text-muted mb-0">{isEnglish ? 'Monthly Revenue' : 'Aylık Gelir'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card stats-card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className="ms-3">
                  <h3 className="mb-0 fw-bold">{stats.newAppointments}</h3>
                  <p className="text-muted mb-0">{isEnglish ? 'New Appointments' : 'Yeni Randevular'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-activity me-2"></i>
                {isEnglish ? 'Recent Activities' : 'Son Aktiviteler'}
              </h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="timeline-item">
                    <div className={`timeline-marker bg-${activity.color}`}>
                      <i className={activity.icon}></i>
                    </div>
                    <div className="timeline-content">
                      <p className="mb-1">{activity.message}</p>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-cart-check me-2"></i>
                {isEnglish ? 'Quick Actions' : 'Hızlı İşlemler'}
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-person-plus me-2"></i>
                  {isEnglish ? 'Add New Client' : 'Yeni Danışan Ekle'}
                </button>
                <button className="btn btn-outline-success">
                  <i className="bi bi-calendar-plus me-2"></i>
                  {isEnglish ? 'Schedule Appointment' : 'Randevu Planla'}
                </button>
                <button className="btn btn-outline-info">
                  <i className="bi bi-journal-plus me-2"></i>
                  {isEnglish ? 'Create Blog Post' : 'Blog Yazısı Oluştur'}
                </button>
                <button className="btn btn-outline-warning">
                  <i className="bi bi-gear me-2"></i>
                  {isEnglish ? 'System Settings' : 'Sistem Ayarları'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Manager Link */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <i className="bi bi-chat-heart text-success mb-3" style={{ fontSize: '2rem' }}></i>
              <h5 className="card-title mb-2">{isEnglish ? 'Testimonials' : 'Yorumlar'}</h5>
              <p className="card-text text-muted text-center">
                {isEnglish ? 'View, add, edit, and delete client testimonials.' : 'Danışan yorumlarını görüntüle, ekle, düzenle ve sil.'}
              </p>
              <Link to="/admin/testimonials" className="btn btn-outline-success mt-2">
                {isEnglish ? 'Manage Testimonials' : 'Yorumları Yönet'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
