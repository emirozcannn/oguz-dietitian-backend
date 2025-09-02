import { useState, useEffect } from 'react';
import apiClient from '../../lib/api.js';

const PackageManager = ({ isEnglish }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    title: { tr: '', en: '' },
    description: { tr: '', en: '' },
    price: '',
    originalPrice: '',
    duration: { tr: '', en: '' },
    icon: 'bi-heart',
    isPopular: false,
    features: { tr: [], en: [] },
    isActive: true,
    category: 'basic',
    orderIndex: 0
  });

  // Available icons
  const availableIcons = [
    { value: 'bi-heart', label: 'Kalp', preview: '♥️' },
    { value: 'bi-star', label: 'Yıldız', preview: '⭐' },
    { value: 'bi-gem', label: 'Elmas', preview: '💎' },
    { value: 'bi-trophy', label: 'Kupa', preview: '🏆' },
    { value: 'bi-shield', label: 'Kalkan', preview: '🛡️' },
    { value: 'bi-crown', label: 'Taç', preview: '👑' },
    { value: 'bi-fire', label: 'Ateş', preview: '🔥' },
    { value: 'bi-lightning', label: 'Yıldırım', preview: '⚡' },
    { value: 'bi-sun', label: 'Güneş', preview: '☀️' },
    { value: 'bi-moon', label: 'Ay', preview: '🌙' },
    { value: 'bi-flower1', label: 'Çiçek', preview: '🌸' },
    { value: 'bi-tree', label: 'Ağaç', preview: '🌳' }
  ];

  // Fetch packages from database
  const fetchPackages = async () => {
    try {
      const response = await apiClient.get('/packages?lang=tr');
      
      if (response.success) {
        setPackages(response.data || []);
      } else {
        throw new Error(response.message || 'Paketler yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested object properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle features input (convert string to array)
  const handleFeaturesChange = (e, language) => {
    const { value } = e.target;
    const features = value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [language]: features
      }
    }));
  };

  // Open modal for new package
  const openNewPackageModal = () => {
    setEditingPackage(null);
    setFormData({
      title: { tr: '', en: '' },
      description: { tr: '', en: '' },
      price: '',
      originalPrice: '',
      duration: { tr: '', en: '' },
      icon: 'bi-heart',
      isPopular: false,
      features: { tr: [], en: [] },
      isActive: true,
      category: 'basic',
      orderIndex: 0
    });
    setShowModal(true);
  };

  // Open modal for editing package
  const openEditPackageModal = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      title: { 
        tr: pkg.title || '', 
        en: pkg.title || ''
      },
      description: { 
        tr: pkg.description || '', 
        en: pkg.description || ''
      },
      price: pkg.price || '',
      originalPrice: pkg.originalPrice || '',
      duration: { 
        tr: pkg.duration || '', 
        en: pkg.duration || ''
      },
      icon: pkg.icon || 'bi-heart',
      isPopular: pkg.isPopular || false,
      features: { 
        tr: pkg.features || [], 
        en: pkg.features || []
      },
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      category: pkg.category || 'basic',
      orderIndex: pkg.orderIndex || 0
    });
    setShowModal(true);
  };

  // Save package (create or update)
  const savePackage = async (e) => {
    e.preventDefault();
    
    try {
      const packageData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        duration: formData.duration,
        features: formData.features,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        icon: formData.icon,
        category: formData.category,
        orderIndex: parseInt(formData.orderIndex) || 0
      };

      if (editingPackage) {
        // Update existing package
        const response = await apiClient.put(`/packages/${editingPackage._id || editingPackage.id}`, packageData);
        
        if (!response.success) {
          throw new Error(response.message || 'Paket güncellenemedi');
        }
      } else {
        // Create new package
        const response = await apiClient.post('/packages', packageData);
        
        if (!response.success) {
          throw new Error(response.message || 'Paket oluşturulamadı');
        }
      }

      setShowModal(false);
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Hata: ' + error.message);
    }
  };

  // Delete package
  const deletePackage = async (id) => {
    if (!confirm(isEnglish ? 'Are you sure you want to delete this package?' : 'Bu paketi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/packages/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Paket silinemedi');
      }
      
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Hata: ' + error.message);
    }
  };

  // Toggle package status
  const togglePackageStatus = async (id, currentStatus) => {
    try {
      const response = await apiClient.patch(`/packages/${id}/status`, { 
        isActive: !currentStatus 
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Paket durumu güncellenemedi');
      }
      
      fetchPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
      alert('Hata: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEnglish ? 'Package Management' : 'Paket Yönetimi'}</h2>
        <button className="btn btn-primary" onClick={openNewPackageModal}>
          <i className="bi bi-plus-circle me-2"></i>
          {isEnglish ? 'Add New Package' : 'Yeni Paket Ekle'}
        </button>
      </div>

      {/* Packages Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>{isEnglish ? 'Icon' : 'İkon'}</th>
              <th>{isEnglish ? 'Title (TR)' : 'Başlık (TR)'}</th>
              <th>{isEnglish ? 'Title (EN)' : 'Başlık (EN)'}</th>
              <th>{isEnglish ? 'Price' : 'Fiyat'}</th>
              <th>{isEnglish ? 'Duration' : 'Süre'}</th>
              <th>{isEnglish ? 'Popular' : 'Popüler'}</th>
              <th>{isEnglish ? 'Status' : 'Durum'}</th>
              <th>{isEnglish ? 'Actions' : 'İşlemler'}</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg._id || pkg.id}>
                <td>{(pkg._id || pkg.id).slice(-8)}</td>
                <td>
                  <i className={`${pkg.icon || 'bi-heart'} text-primary`} style={{ fontSize: '1.2rem' }}></i>
                </td>
                <td>{pkg.title}</td>
                <td>{pkg.title}</td>
                <td>₺{pkg.price}</td>
                <td>
                  <span className="badge bg-info">
                    {pkg.duration || (isEnglish ? '1 Month' : '1 Ay')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${pkg.isPopular ? 'bg-warning' : 'bg-secondary'}`}>
                    {pkg.isPopular ? (isEnglish ? 'Popular' : 'Popüler') : (isEnglish ? 'Normal' : 'Normal')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${pkg.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {pkg.isActive ? (isEnglish ? 'Active' : 'Aktif') : (isEnglish ? 'Inactive' : 'Pasif')}
                  </span>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEditPackageModal(pkg)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className={`btn btn-sm ${pkg.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => togglePackageStatus(pkg._id || pkg.id, pkg.isActive)}
                    >
                      <i className={`bi ${pkg.isActive ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deletePackage(pkg._id || pkg.id)}
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

      {/* Modal for Add/Edit Package */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPackage 
                    ? (isEnglish ? 'Edit Package' : 'Paket Düzenle') 
                    : (isEnglish ? 'Add New Package' : 'Yeni Paket Ekle')
                  }
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={savePackage}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Title (Turkish)' : 'Başlık (Türkçe)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="title.tr"
                          value={formData.title.tr}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Title (English)' : 'Başlık (İngilizce)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="title.en"
                          value={formData.title.en}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Description (Turkish)' : 'Açıklama (Türkçe)'}</label>
                        <textarea
                          className="form-control"
                          name="description.tr"
                          rows="3"
                          value={formData.description.tr}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Description (English)' : 'Açıklama (İngilizce)'}</label>
                        <textarea
                          className="form-control"
                          name="description.en"
                          rows="3"
                          value={formData.description.en}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Features (Turkish)' : 'Özellikler (Türkçe)'}</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.features.tr.join('\n')}
                          onChange={(e) => handleFeaturesChange(e, 'tr')}
                          placeholder={isEnglish ? 'One feature per line' : 'Her satıra bir özellik yazın'}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Features (English)' : 'Özellikler (İngilizce)'}</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.features.en.join('\n')}
                          onChange={(e) => handleFeaturesChange(e, 'en')}
                          placeholder={isEnglish ? 'One feature per line' : 'Her satıra bir özellik yazın'}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Price (₺)' : 'Fiyat (₺)'}</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Duration (Turkish)' : 'Süre (Türkçe)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="duration.tr"
                          value={formData.duration.tr}
                          onChange={handleInputChange}
                          placeholder="örn: 1 Ay"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Duration (English)' : 'Süre (İngilizce)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="duration.en"
                          value={formData.duration.en}
                          onChange={handleInputChange}
                          placeholder="e.g: 1 Month"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Icon' : 'İkon'}</label>
                        <select
                          className="form-select"
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                        >
                          {availableIcons.map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.preview} {icon.label}
                            </option>
                          ))}
                        </select>
                        <div className="form-text">
                          <i className={`${formData.icon} text-primary`} style={{ fontSize: '1.5rem' }}></i>
                          <span className="ms-2">{isEnglish ? 'Preview' : 'Önizleme'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Status' : 'Durum'}</label>
                        <select
                          className="form-select"
                          name="isActive"
                          value={formData.isActive}
                          onChange={handleInputChange}
                        >
                          <option value={true}>{isEnglish ? 'Active' : 'Aktif'}</option>
                          <option value={false}>{isEnglish ? 'Inactive' : 'Pasif'}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isPopular"
                            name="isPopular"
                            checked={formData.isPopular}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="isPopular">
                            {isEnglish ? 'Popular Package' : 'Popüler Paket'}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isFeatured"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="isFeatured">
                            {isEnglish ? 'Featured Package' : 'Öne Çıkan Paket'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    {isEnglish ? 'Cancel' : 'İptal'}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEnglish ? 'Save' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManager;
