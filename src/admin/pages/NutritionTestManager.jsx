import React, { useState, useEffect } from 'react';

const NutritionTestManager = ({ isEnglish = false }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    urgencyLevel: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: testsData, error: testsError } = await supabase
        .from('nutrition_tests')
        .select('*')
        .order('completed_at', { ascending: false });

      if (testsError) {
        throw testsError;
      }

      setTests(testsData || []);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId, status) => {
    try {
      const { error } = await supabase
        .from('nutrition_tests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;
      loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTest = async (testId) => {
    if (window.confirm('Bu test sonucunu silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('nutrition_tests')
          .delete()
          .eq('id', testId);

        if (error) throw error;
        loadData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const filteredTests = tests.filter(test => {
    if (filters.status !== 'all' && test.status !== filters.status) return false;
    if (filters.riskLevel !== 'all' && test.risk_level !== filters.riskLevel) return false;
    if (filters.urgencyLevel !== 'all' && test.urgency_level !== filters.urgencyLevel) return false;
    
    if (filters.dateRange !== 'all') {
      const testDate = new Date(test.completed_at);
      const now = new Date();
      const daysDiff = Math.floor((now - testDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }
    
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'bg-primary';
      case 'reviewed': return 'bg-info';
      case 'contacted': return 'bg-success';
      case 'plan_sent': return 'bg-warning';
      case 'completed': return 'bg-success';
      case 'spam': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getUrgencyBadgeClass = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'low': return 'bg-info';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-danger';
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
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">
          {isEnglish ? 'Loading nutrition tests...' : 'Beslenme testleri yükleniyor...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-heart-pulse me-2"></i>
              {isEnglish ? 'Nutrition Test Management' : 'Beslenme Testi Yönetimi'}
            </h2>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <div>
                <strong>{isEnglish ? 'Error:' : 'Hata:'}</strong> {error}
                <button 
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={loadData}
                >
                  {isEnglish ? 'Retry' : 'Tekrar Dene'}
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {tests.length === 0 && !loading && !error && (
            <div className="alert alert-info">
              <h5><i className="bi bi-info-circle me-2"></i>
                {isEnglish ? 'No Data Found' : 'Veri Bulunamadı'}
              </h5>
              <p className="mb-2">
                {isEnglish 
                  ? 'No nutrition test data found in the database. This could mean:'
                  : 'Veritabanında beslenme testi verisi bulunamadı. Bunun anlamı:'
                }
              </p>
              <ul className="mb-3">
                <li>{isEnglish ? 'No tests have been completed yet' : 'Henüz hiç test tamamlanmamış'}</li>
                <li>{isEnglish ? 'Database connection issues' : 'Veritabanı bağlantı sorunları'}</li>
                <li>{isEnglish ? 'Table permissions not configured' : 'Tablo izinleri yapılandırılmamış'}</li>
              </ul>
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={loadData}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {isEnglish ? 'Refresh' : 'Yenile'}
                </button>
              </div>
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
                    <option value="reviewed">İncelendi</option>
                    <option value="contacted">İletişim Kuruldu</option>
                    <option value="plan_sent">Plan Gönderildi</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Risk Seviyesi</label>
                  <select
                    className="form-select"
                    value={filters.riskLevel}
                    onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                  >
                    <option value="all">Tümü</option>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Aciliyet</label>
                  <select
                    className="form-select"
                    value={filters.urgencyLevel}
                    onChange={(e) => setFilters({...filters, urgencyLevel: e.target.value})}
                  >
                    <option value="all">Tümü</option>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tarih Aralığı</label>
                  <select
                    className="form-select"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  >
                    <option value="all">Tümü</option>
                    <option value="today">Bugün</option>
                    <option value="week">Son 7 Gün</option>
                    <option value="month">Son 30 Gün</option>
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setFilters({ status: 'all', riskLevel: 'all', urgencyLevel: 'all', dateRange: 'all' })}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tests Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Test Sonuçları ({filteredTests.length})
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
                      <th>Yaş/Cinsiyet</th>
                      <th>BMI</th>
                      <th>Risk</th>
                      <th>Aciliyet</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.map((test) => (
                      <tr key={test.id} className={test.status === 'new' ? 'table-warning' : ''}>
                        <td>{formatDate(test.completed_at)}</td>
                        <td>{test.user_name}</td>
                        <td>
                          <a 
                            href={`mailto:${test.user_email}`}
                            className="text-decoration-none"
                          >
                            {test.user_email}
                          </a>
                        </td>
                        <td>
                          {test.answers?.['basic_info.age'] || 'N/A'} / 
                          {test.answers?.['basic_info.gender'] === 'female' ? ' K' : test.answers?.['basic_info.gender'] === 'male' ? ' E' : ' N/A'}
                        </td>
                        <td>
                          <span className={`badge ${test.bmi ? (test.bmi < 18.5 || test.bmi > 25 ? 'bg-warning' : 'bg-success') : 'bg-secondary'}`}>
                            {test.bmi || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getRiskBadgeClass(test.risk_level)}`}>
                            {test.risk_level === 'low' ? 'Düşük' : 
                             test.risk_level === 'medium' ? 'Orta' : 
                             test.risk_level === 'high' ? 'Yüksek' : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getUrgencyBadgeClass(test.urgency_level)}`}>
                            {test.urgency_level === 'low' ? 'Düşük' : 
                             test.urgency_level === 'medium' ? 'Orta' : 
                             test.urgency_level === 'high' ? 'Yüksek' : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <select
                            className={`form-select form-select-sm badge ${getStatusBadgeClass(test.status)}`}
                            value={test.status}
                            onChange={(e) => updateTestStatus(test.id, e.target.value)}
                            style={{ color: 'white', border: 'none', minWidth: '120px' }}
                          >
                            <option value="new">Yeni</option>
                            <option value="reviewed">İncelendi</option>
                            <option value="contacted">İletişim Kuruldu</option>
                            <option value="plan_sent">Plan Gönderildi</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="spam">Spam</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteTest(test.id)}
                            title="Test sonucunu sil"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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
    </div>
  );
};

export default NutritionTestManager;