import { useState, useEffect } from 'react';
import apiClient from '../../lib/api.js';

const FAQManager = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('items');
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // FAQ Item Form State
  const [itemForm, setItemForm] = useState({
    category_id: '',
    question_tr: '',
    question_en: '',
    answer_tr: '',
    answer_en: '',
    order_index: 0,
    is_active: true
  });

  // FAQ Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name_tr: '',
    name_en: '',
    icon: 'bi-question-circle',
    color: '#0d6efd',
    order_index: 0,
    is_active: true
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    loadFAQData();
  }, []);

  const loadFAQData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading FAQ data...');
      const itemsResponse = await apiClient.getFAQItems('tr');
      const categoriesResponse = await apiClient.getFAQCategories('tr');

      console.log('📦 Items Response:', itemsResponse);
      console.log('📂 Categories Response:', categoriesResponse);

      if (!itemsResponse.success) throw new Error(itemsResponse.message || 'FAQ öğeleri yüklenemedi');
      if (!categoriesResponse.success) throw new Error(categoriesResponse.message || 'Kategoriler yüklenemedi');

      const items = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
      const cats = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];

      console.log('✅ Final items:', items);
      console.log('✅ Final categories:', cats);

      setFaqItems(items);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      setError(error.message || 'Veri yükleme hatası');
      setFaqItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // FAQ Item CRUD Operations
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!itemForm.question_tr.trim() || !itemForm.question_en.trim()) {
        throw new Error('Soru alanları gereklidir (hem TR hem EN)');
      }
      if (!itemForm.answer_tr.trim() || !itemForm.answer_en.trim()) {
        throw new Error('Cevap alanları gereklidir (hem TR hem EN)');
      }
      if (!itemForm.category_id) {
        throw new Error('Kategori seçimi gereklidir');
      }

      const submitData = {
        ...itemForm,
        order_index: parseInt(itemForm.order_index) || 0
      };

      let response;
      if (editingItem) {
        response = await apiClient.put(`/faq/items/${editingItem._id || editingItem.id}`, submitData);
      } else {
        response = await apiClient.post('/faq/items', submitData);
      }

      if (!response.success) {
        throw new Error(response.message || 'Kaydetme işlemi başarısız');
      }

      setShowItemModal(false);
      setEditingItem(null);
      resetItemForm();
      await loadFAQData();
      showToast('FAQ öğesi başarıyla kaydedildi', 'success');
    } catch (error) {
      console.error('Error saving FAQ item:', error);
      setError(error.message);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bu FAQ öğesini silmek istediğinizden emin misiniz?')) return;
    try {
      setLoading(true);
      const response = await apiClient.delete(`/faq/items/${id}`);
      if (!response.success) {
        throw new Error(response.message || 'Silme işlemi başarısız');
      }
      await loadFAQData();
      showToast('FAQ öğesi başarıyla silindi', 'success');
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      setError(error.message);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      category_id: item.category_id || '',
      question_tr: item.question_tr || '',
      question_en: item.question_en || '',
      answer_tr: item.answer_tr || '',
      answer_en: item.answer_en || '',
      order_index: item.order_index || 0,
      is_active: item.is_active
    });
    setShowItemModal(true);
  };

  const resetItemForm = () => {
    setItemForm({
      category_id: '',
      question_tr: '',
      question_en: '',
      answer_tr: '',
      answer_en: '',
      order_index: 0,
      is_active: true
    });
  };

  // FAQ Category CRUD Operations
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!categoryForm.name_tr.trim() || !categoryForm.name_en.trim()) {
        throw new Error('Kategori isimleri gereklidir (hem TR hem EN)');
      }

      const submitData = {
        ...categoryForm,
        order_index: parseInt(categoryForm.order_index) || 0
      };

      let response;
      if (editingCategory) {
        response = await apiClient.put(`/faq/categories/${editingCategory._id || editingCategory.id}`, submitData);
      } else {
        response = await apiClient.post('/faq/categories', submitData);
      }

      if (!response.success) {
        throw new Error(response.message || 'Kaydetme işlemi başarısız');
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
      await loadFAQData();
      showToast('Kategori başarıyla kaydedildi', 'success');
    } catch (error) {
      console.error('Error saving FAQ category:', error);
      setError(error.message);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye bağlı tüm FAQ öğeleri etkilenecek.')) return;
    try {
      setLoading(true);
      const response = await apiClient.delete(`/faq/categories/${id}`);
      if (!response.success) {
        throw new Error(response.message || 'Silme işlemi başarısız');
      }
      await loadFAQData();
      showToast('Kategori başarıyla silindi', 'success');
    } catch (error) {
      console.error('Error deleting FAQ category:', error);
      setError(error.message);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name_tr: category.name_tr || '',
      name_en: category.name_en || '',
      icon: category.icon || 'bi-question-circle',
      color: category.color || '#0d6efd',
      order_index: category.order_index || 0,
      is_active: category.is_active
    });
    setShowCategoryModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name_tr: '',
      name_en: '',
      icon: 'bi-question-circle',
      color: '#0d6efd',
      order_index: 0,
      is_active: true
    });
  };

  const toggleItemStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/faq/items/${id}/status`, {
        is_active: !currentStatus
      });
      if (!response.success) {
        throw new Error(response.message || 'Durum güncelleme başarısız');
      }
      await loadFAQData();
    } catch (error) {
      console.error('Error toggling FAQ item status:', error);
      setError(error.message);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/faq/categories/${id}/status`, {
        is_active: !currentStatus
      });
      if (!response.success) {
        throw new Error(response.message || 'Durum güncelleme başarısız');
      }
      await loadFAQData();
    } catch (error) {
      console.error('Error toggling FAQ category status:', error);
      setError(error.message);
      showToast('Hata: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
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
              <i className="bi bi-question-circle me-2"></i>
              FAQ Yönetimi
            </h2>
            <div className="btn-group">
              <button
                className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('items')}
              >
                <i className="bi bi-list-ul me-2"></i>
                FAQ Öğeleri
              </button>
              <button
                className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('categories')}
              >
                <i className="bi bi-folder me-2"></i>
                Kategoriler
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* FAQ Items Tab */}
          {activeTab === 'items' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">FAQ Öğeleri ({faqItems.length})</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingItem(null);
                    resetItemForm();
                    setShowItemModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Yeni FAQ Ekle
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Sıra</th>
                        <th>Kategori</th>
                        <th>Soru (TR)</th>
                        <th>Soru (EN)</th>
                        <th>Görüntülenme</th>
                        <th>Durumu</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqItems.map((item) => (
                        <tr key={item._id || item.id}>
                          <td>{item.order_index}</td>
                          <td>
                            {item.category && (
                              <span 
                                className="badge"
                                style={{ backgroundColor: item.category.color, color: 'white' }}
                              >
                                <i className={`bi ${item.category.icon} me-1`}></i>
                                {item.category.name_tr}
                              </span>
                            )}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.question_tr}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.question_en}
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {item.view_count || 0}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${item.is_active ? 'btn-success' : 'btn-secondary'}`}
                              onClick={() => toggleItemStatus(item._id || item.id, item.is_active)}
                            >
                              {item.is_active ? 'Aktif' : 'Pasif'}
                            </button>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditItem(item)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteItem(item._id || item.id)}
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
          )}

          {/* FAQ Categories Tab */}
          {activeTab === 'categories' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">FAQ Kategorileri ({categories.length})</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingCategory(null);
                    resetCategoryForm();
                    setShowCategoryModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Yeni Kategori Ekle
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Sıra</th>
                        <th>Kategori</th>
                        <th>İsim (TR)</th>
                        <th>İsim (EN)</th>
                        <th>Renk</th>
                        <th>Durumu</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td>{category.order_index}</td>
                          <td>
                            <span 
                              className="badge"
                              style={{ backgroundColor: category.color, color: 'white' }}
                            >
                              <i className={`bi ${category.icon} me-1`}></i>
                              {category.name_tr}
                            </span>
                          </td>
                          <td>{category.name_tr}</td>
                          <td>{category.name_en}</td>
                          <td>
                            <div
                              className="color-preview"
                              style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: category.color,
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                display: 'inline-block'
                              }}
                            ></div>
                            <span className="ms-2">{category.color}</span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${category.is_active ? 'btn-success' : 'btn-secondary'}`}
                              onClick={() => toggleCategoryStatus(category._id, category.is_active)}
                            >
                              {category.is_active ? 'Aktif' : 'Pasif'}
                            </button>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditCategory(category)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteCategory(category._id)}
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
          )}
        </div>
      </div>

      {/* FAQ Item Modal */}
      {showItemModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'FAQ Öğesi Düzenle' : 'Yeni FAQ Öğesi Ekle'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowItemModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveItem}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Kategori</label>
                        <select
                          className="form-select"
                          value={itemForm.category_id}
                          onChange={(e) => setItemForm({...itemForm, category_id: e.target.value})}
                          required
                        >
                          <option value="">Kategori Seçin</option>
                          {console.log('🎯 Rendering categories in dropdown:', categories)}
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>
                              {category.name_tr}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">Mevcut kategori sayısı: {categories.length}</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Sıra</label>
                        <input
                          type="number"
                          className="form-control"
                          value={itemForm.order_index}
                          onChange={(e) => setItemForm({...itemForm, order_index: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Soru (Türkçe)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={itemForm.question_tr}
                      onChange={(e) => setItemForm({...itemForm, question_tr: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Soru (İngilizce)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={itemForm.question_en}
                      onChange={(e) => setItemForm({...itemForm, question_en: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Cevap (Türkçe)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={itemForm.answer_tr}
                      onChange={(e) => setItemForm({...itemForm, answer_tr: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Cevap (İngilizce)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={itemForm.answer_en}
                      onChange={(e) => setItemForm({...itemForm, answer_en: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="itemActive"
                      checked={itemForm.is_active}
                      onChange={(e) => setItemForm({...itemForm, is_active: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="itemActive">
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Category Modal */}
      {showCategoryModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCategoryModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveCategory}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">İsim (Türkçe)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={categoryForm.name_tr}
                          onChange={(e) => setCategoryForm({...categoryForm, name_tr: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">İsim (İngilizce)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={categoryForm.name_en}
                          onChange={(e) => setCategoryForm({...categoryForm, name_en: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">İkon (Bootstrap Icons)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                          placeholder="bi-question-circle"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Renk</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Sıra</label>
                    <input
                      type="number"
                      className="form-control"
                      value={categoryForm.order_index}
                      onChange={(e) => setCategoryForm({...categoryForm, order_index: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="categoryActive"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="categoryActive">
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast.show && (
        <div className={`toast align-items-center text-bg-${toast.type} border-0 position-fixed bottom-0 end-0 m-3`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">
              {toast.message}
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ ...toast, show: false })}></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQManager;
