import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const { i18n } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isEnglish = i18n.language === 'en';

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload(); // Reload to trigger AuthWrapper recheck
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sayfa başlıklarını belirle
  const getPageTitle = () => {
    const titles = {
      'dashboard': isEnglish ? 'Dashboard' : 'Ana Panel',
      'clients': isEnglish ? 'Client Management' : 'Danışan Yönetimi',
      'nutrition-tests': isEnglish ? 'Nutrition Test Management' : 'Beslenme Testi Yönetimi',
      'appointments': isEnglish ? 'Appointment Management' : 'Randevu Yönetimi',
      'packages': isEnglish ? 'Package Management' : 'Paket Yönetimi',
      'testimonials': isEnglish ? 'Testimonial Management' : 'Yorum Yönetimi',
      'orders': isEnglish ? 'Order Management' : 'Sipariş Yönetimi',
      'blog': isEnglish ? 'Blog Management' : 'Blog Yönetimi',
      'faq': isEnglish ? 'FAQ Management' : 'S.S.S. Yönetimi',
      'contact': isEnglish ? 'Contact Management' : 'İletişim Yönetimi',
      'analytics': isEnglish ? 'Analytics' : 'Analitik',
      'settings': isEnglish ? 'Settings' : 'Ayarlar'
    };
    return titles[activeTab] || (isEnglish ? 'Admin Panel' : 'Yönetici Paneli');
  };

  const getPageIcon = () => {
    const icons = {
      'dashboard': 'bi-speedometer2',
      'clients': 'bi-people',
      'nutrition-tests': 'bi-heart-pulse',
      'appointments': 'bi-calendar3',
      'packages': 'bi-box-seam',
      'testimonials': 'bi-chat-left-dots-fill',
      'orders': 'bi-cart4',
      'blog': 'bi-journal-text',
      'faq': 'bi-question-circle',
      'contact': 'bi-envelope',
      'analytics': 'bi-graph-up',
      'settings': 'bi-gear'
    };
    return icons[activeTab] || 'bi-speedometer2';
  };

  return (
    <div className="admin-panel min-vh-100 bg-light">
      {/* Top Navigation */}
      <AdminTopbar onLogout={handleLogout} isEnglish={isEnglish} />

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <AdminSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isEnglish={isEnglish}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />

          {/* Main Content */}
          <div className={`col-lg-${sidebarCollapsed ? '11' : '10'} col-md-9`}>
            {/* Page Header */}
            <div className="main-header bg-white shadow-sm mb-4 py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className={`${getPageIcon()} text-success me-3`} style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <h4 className="mb-0 fw-bold text-dark">{getPageTitle()}</h4>
                    <small className="text-muted">
                      {isEnglish ? 'Manage your' : 'Yönet'} {getPageTitle().toLowerCase()}
                    </small>
                  </div>
                </div>
                
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <button 
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        <i className="bi bi-house-door me-1"></i>
                        {isEnglish ? 'Home' : 'Ana Sayfa'}
                      </button>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      {getPageTitle()}
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Yardımcı Bilgiler */}
              {activeTab === 'nutrition-tests' && (
                <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle text-success me-2"></i>
                    <small className="text-success fw-medium">
                      {isEnglish 
                        ? 'Monitor nutrition test results and contact high-risk clients promptly.'
                        : 'Beslenme testi sonuçlarını takip edin ve yüksek riskli danışanlarla hemen iletişime geçin.'
                      }
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="main-content px-4 pb-4">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
      .main-header {
    position: sticky;
    top: 60px;
    z-index: 1020;
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95) !important;
  }
        
        .sidebar {
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          overflow-y: auto;
        }
        
        .nav-link {
          border: none !important;
          margin-bottom: 2px;
        }
        
        .nav-link:hover {
          background-color: rgba(40, 167, 69, 0.1) !important;
          color: #28a745 !important;
          transform: translateX(2px);
        }
        
        .nav-link.active {
          background-color: #28a745 !important;
          color: white !important;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          content: "›";
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .main-header {
            position: relative;
            top: auto;
          }
          
          .sidebar {
            position: relative;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;