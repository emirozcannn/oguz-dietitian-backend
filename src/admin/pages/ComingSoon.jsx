const ComingSoon = ({ activeTab, isEnglish }) => {
  const menuItems = [
    { id: 'dashboard', label: isEnglish ? 'Dashboard' : 'Ana Panel', icon: 'bi-speedometer2' },
    { id: 'clients', label: isEnglish ? 'Clients' : 'Danışanlar', icon: 'bi-people' },
    { id: 'packages', label: isEnglish ? 'Packages' : 'Paketler', icon: 'bi-box-seam' },
    { id: 'appointments', label: isEnglish ? 'Appointments' : 'Randevular', icon: 'bi-calendar3' },
    { id: 'orders', label: isEnglish ? 'Orders' : 'Siparişler', icon: 'bi-cart4' },
    { id: 'blog', label: isEnglish ? 'Blog Posts' : 'Blog Yazıları', icon: 'bi-journal-text' },
    { id: 'analytics', label: isEnglish ? 'Analytics' : 'Analitik', icon: 'bi-graph-up' },
    { id: 'settings', label: isEnglish ? 'Settings' : 'Ayarlar', icon: 'bi-gear' }
  ];

  const currentItem = menuItems.find(item => item.id === activeTab);

  return (
    <div className="coming-soon text-center py-5">
      <div className="coming-soon-animation mb-4">
        <i className={`bi ${currentItem?.icon || 'bi-tools'} text-muted mb-3`} style={{ fontSize: '4rem' }}></i>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <h3 className="text-muted mb-3">
        {isEnglish ? 'Coming Soon' : 'Yakında Gelecek'}
      </h3>
      <p className="text-muted mb-4">
        {isEnglish ? 
          `${currentItem?.label || 'This'} section is under development` :
          `${currentItem?.label || 'Bu'} bölümü geliştiriliyor`
        }
      </p>
      <div className="progress mx-auto" style={{ maxWidth: '300px' }}>
        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
             role="progressbar" 
             style={{ width: '65%' }}
             aria-valuenow="65" 
             aria-valuemin="0" 
             aria-valuemax="100">
          65%
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
