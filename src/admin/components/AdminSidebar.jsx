import {MessageSquare } from 'lucide-react';const AdminSidebar = ({ activeTab, setActiveTab, isEnglish, collapsed, setCollapsed }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: isEnglish ? 'Dashboard' : 'Ana Panel', 
      icon: 'bi-speedometer2' 
    },
    { 
      id: 'clients', 
      label: isEnglish ? 'Clients' : 'Danışanlar', 
      icon: 'bi-people' 
    },
    { 
      id: 'nutrition-tests', 
      label: isEnglish ? 'Nutrition Tests' : 'Beslenme Testleri', 
      icon: 'bi-heart-pulse',
     
    },
    { 
      id: 'appointments', 
      label: isEnglish ? 'Appointments' : 'Randevular', 
      icon: 'bi-calendar3' 
    },
    { 
      id: 'packages', 
      label: isEnglish ? 'Packages' : 'Paketler', 
      icon: 'bi-box-seam' 
    },
    
    { 
      id: 'testimonials', 
      label: isEnglish ? 'Testimonials' : 'Yorumlar', 
      icon: MessageSquare,
    },
    { 
      id: 'orders', 
      label: isEnglish ? 'Orders' : 'Siparişler', 
      icon: 'bi-cart4' 
    },
    { 
      id: 'blog', 
      label: isEnglish ? 'Blog Posts' : 'Blog Yazıları', 
      icon: 'bi-journal-text' 
    },
    { 
      id: 'faq', 
      label: isEnglish ? 'FAQ' : 'S.S.S.', 
      icon: 'bi-question-circle' 
    },
    { 
      id: 'contact', 
      label: isEnglish ? 'Contact' : 'İletişim', 
      icon: 'bi-envelope' 
    },
    { 
      id: 'analytics', 
      label: isEnglish ? 'Analytics' : 'Analitik', 
      icon: 'bi-graph-up' 
    },
    { 
      id: 'settings', 
      label: isEnglish ? 'Settings' : 'Ayarlar', 
      icon: 'bi-gear' 
    }
  ];

  return (
    <div className={`col-lg-${collapsed ? '1' : '2'} col-md-3 bg-white shadow-sm`}>
      <div className="sidebar py-3">
        <div className="d-flex justify-content-between align-items-center mb-3 px-3">
          {!collapsed && (
            <h6 className="text-muted mb-0 fw-bold">
              {isEnglish ? 'MENU' : 'MENÜ'}
            </h6>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? (isEnglish ? 'Expand Menu' : 'Menüyü Genişlet') : (isEnglish ? 'Collapse Menu' : 'Menüyü Daralt')}
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
        
        <ul className="nav nav-pills flex-column">
          {menuItems.map(item => (
            <li className="nav-item mb-1" key={item.id}>
              <button
                className={`nav-link w-100 text-start d-flex align-items-center justify-content-between ${
                  activeTab === item.id ? 'active' : 'text-dark'
                }`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : ''}
                style={{
                  transition: 'all 0.2s ease',
                  borderRadius: '8px'
                }}
              >
                <div className="d-flex align-items-center">
                  <i className={`${item.icon} me-2`} style={{ fontSize: '1.1rem' }}></i>
                  {!collapsed && (
                    <span className="fw-medium">{item.label}</span>
                  )}
                </div>
                
                {/* Badge gösterimi */}
                {!collapsed && item.badge && (
                  <span className={`badge ${
                    item.badge === 'new' ? 'bg-success' : 
                    item.badge === 'hot' ? 'bg-danger' : 
                    'bg-primary'
                  } rounded-pill`} style={{ fontSize: '0.65rem' }}>
                    {item.badge === 'new' ? (isEnglish ? 'NEW' : 'YENİ') : item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="mt-4 px-3">
            <div className="card border-0 bg-light">
              <div className="card-body p-3 text-center">
                <i className="bi bi-lightbulb text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                <h6 className="card-title mb-2" style={{ fontSize: '0.8rem' }}>
                  {isEnglish ? 'Quick Tip' : 'İpucu'}
                </h6>
                <p className="card-text text-muted" style={{ fontSize: '0.7rem' }}>
                  {isEnglish 
                    ? 'Check nutrition tests regularly for high-risk clients.'
                    : 'Yüksek riskli danışanlar için beslenme testlerini düzenli kontrol edin.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;