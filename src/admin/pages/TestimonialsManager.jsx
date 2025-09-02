import React, { useState, useEffect } from 'react';
import TestimonialFormModal from '../../components/TestimonialFormModal';

const TestimonialsManager = ({ isEnglish = false }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [program, setProgram] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);

  const t = {
    tr: {
      title: 'Müşteri Yorumları Yönetimi',
      add: 'Yeni Yorum',
      search: 'Yorum ara...',
      filterAll: 'Tümü',
      filterApproved: 'Onaylanmış',
      filterPending: 'Beklemede',
      filterRejected: 'Reddedilmiş',
      name: 'İsim',
      title_field: 'Unvan',
      company: 'Şirket',
      city: 'Şehir',
      program: 'Program',
      rating: 'Puan',
      status: 'Durum',
      actions: 'İşlemler',
      approved: 'Onaylandı',
      pending: 'Beklemede',
      rejected: 'Reddedildi',
      highlight: 'Öne Çıkan',
      edit: 'Düzenle',
      delete: 'Sil',
      bulk: 'Toplu İşlemler',
      approve: 'Onayla',
      reject: 'Reddet',
      makeHighlight: 'Öne Çikar',
      removeHighlight: 'Öne Çıkarmayı Kaldır',
      deleteSelected: 'Seçilenleri Sil',
      noTestimonials: 'Henüz yorum bulunmuyor',
      confirmDelete: 'Bu yorumu silmek istediğinizden emin misiniz?',
      confirmBulkDelete: 'Seçili yorumları silmek istediğinizden emin misiniz?',
      programs: {
        'Kilo Verme Programı': 'Kilo Verme',
        'Sporcu Beslenmesi': 'Sporcu Beslenmesi',
        'Hamilelik Beslenmesi': 'Hamilelik',
        'Hastalıklarda Beslenme': 'Hastalık Beslenmesi'
      }
    },
    en: {
      title: 'Testimonials Management',
      add: 'Add New Testimonial',
      search: 'Search testimonials...',
      filterAll: 'All',
      filterApproved: 'Approved',
      filterPending: 'Pending',
      filterRejected: 'Rejected',
      name: 'Name',
      title_field: 'Title',
      company: 'Company',
      city: 'City',
      program: 'Program',
      rating: 'Rating',
      status: 'Status',
      actions: 'Actions',
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      highlight: 'Highlighted',
      edit: 'Edit',
      delete: 'Delete',
      bulk: 'Bulk Actions',
      approve: 'Approve',
      reject: 'Reject',
      makeHighlight: 'Make Highlight',
      removeHighlight: 'Remove Highlight',
      deleteSelected: 'Delete Selected',
      noTestimonials: 'No testimonials found',
      confirmDelete: 'Are you sure you want to delete this testimonial?',
      confirmBulkDelete: 'Are you sure you want to delete selected testimonials?',
      programs: {
        'Kilo Verme Programı': 'Weight Loss',
        'Sporcu Beslenmesi': 'Sports Nutrition',
        'Hamilelik Beslenmesi': 'Pregnancy Nutrition',
        'Hastalıklarda Beslenme': 'Medical Nutrition'
      }
    }
  }[isEnglish ? 'en' : 'tr'];

  // Supabase'den verileri çek
  useEffect(() => {
    setLoading(true);
    supabase
      .from('testimonials')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        setTestimonials(data || []);
        setLoading(false);
      });
  }, []);

  // Filtreleme ve arama
  useEffect(() => {
    let list = testimonials;
    if (search) {
      list = list.filter(
        t =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.title?.toLowerCase().includes(search.toLowerCase()) ||
          (t.company && t.company.toLowerCase().includes(search.toLowerCase())) ||
          t.city?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== 'all') list = list.filter(t => t.status === status);
    if (program !== 'all') list = list.filter(t => t.program_type === program);
    setFiltered(list);
  }, [testimonials, search, status, program]);

  // CRUD işlemleri
  const handleEdit = item => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (window.confirm(t.confirmDelete)) {
      // id'yi string olarak zorla
      const idStr = String(id);
      const { data, error } = await supabase.from('testimonials').delete().eq('id', idStr).select();
      console.log('Delete response:', data, error);
      if (error) {
        alert('Silme işlemi başarısız: ' + error.message);
        return;
      }
      if (data && data.length === 0) {
        alert('Kayıt bulunamadı veya zaten silinmiş.');
      }
      await refresh();
    }
  };

  const handleBulk = async action => {
    if (selected.length === 0) return;
    if (action === 'delete' && !window.confirm(t.confirmBulkDelete)) return;
    let update = {};
    if (action === 'approve') update = { status: 'approved', updated_at: new Date().toISOString() };
    if (action === 'reject') update = { status: 'rejected', updated_at: new Date().toISOString() };
    if (action === 'highlight') update = { highlight: true, updated_at: new Date().toISOString() };
    if (action === 'unhighlight') update = { highlight: false, updated_at: new Date().toISOString() };
    let error = null, data = null;
    // id'leri string olarak zorla
    const selectedStr = selected.map(String);
    if (action === 'delete') {
      ({ data, error } = await supabase.from('testimonials').delete().in('id', selectedStr).select());
    } else {
      ({ data, error } = await supabase.from('testimonials').update(update).in('id', selectedStr));
    }
    console.log('Bulk response:', data, error);
    if (error) {
      alert('Toplu işlem başarısız: ' + error.message);
      return;
    }
    setSelected([]);
    await refresh();
  };

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('Refresh error:', error);
      setTestimonials([]);
    } else {
      // Duplicate kontrolü
      const unique = Array.isArray(data)
        ? data.filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx)
        : [];
      if (unique.length !== data.length) {
        alert('Uyarı: Veritabanında duplicate (çift) kayıtlar var. Lütfen temizleyin.');
      }
      setTestimonials(unique);
    }
    setLoading(false);
  };

  const handleSave = async data => {
    // Always send correct types and Postgres array for tags
    function toPostgresArray(arr) {
      if (!Array.isArray(arr)) return '{}';
      return '{' + arr.map(tag => '"' + tag.replace(/"/g, '"') + '"').join(',') + '}';
    }
    const payload = {
      ...data,
      rating: Number(data.rating) || 5,
      highlight: !!data.highlight,
      tags: toPostgresArray(data.tags),
      status: 'approved',
    };
    let error = null, resp = null;
    if (editItem) {
      // id'yi string olarak zorla
      const idStr = String(editItem.id);
      ({ data: resp, error } = await supabase.from('testimonials').update({ ...payload, updated_at: new Date().toISOString(), status: 'approved' }).eq('id', idStr));
    } else {
      ({ data: resp, error } = await supabase.from('testimonials').insert([{ ...payload, created_at: new Date().toISOString(), status: 'approved' }]));
    }
    console.log('Supabase response:', resp, error);
    if (error) {
      alert('Kaydetme işlemi başarısız: ' + error.message);
      return;
    }
    setShowModal(false);
    setEditItem(null);
    await refresh();
  };

  // Bootstrap 5 tablo ve filtreler
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">{t.title}</h1>
        <button className="btn btn-success d-flex align-items-center gap-2" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <i className="bi bi-plus"></i> {t.add}
        </button>
      </div>

      <div className="bg-white rounded shadow-sm p-3 mb-4">
        <div className="row g-2">
          <div className="col-md">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="col-md-auto">
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">{t.filterAll}</option>
              <option value="approved">{t.filterApproved}</option>
              <option value="pending">{t.filterPending}</option>
              <option value="rejected">{t.filterRejected}</option>
            </select>
          </div>
          <div className="col-md-auto">
            <select className="form-select" value={program} onChange={e => setProgram(e.target.value)}>
              <option value="all">{t.filterAll}</option>
              <option value="Kilo Verme Programı">{t.programs['Kilo Verme Programı']}</option>
              <option value="Sporcu Beslenmesi">{t.programs['Sporcu Beslenmesi']}</option>
              <option value="Hamilelik Beslenmesi">{t.programs['Hamilelik Beslenmesi']}</option>
              <option value="Hastalıklarda Beslenme">{t.programs['Hastalıklarda Beslenme']}</option>
            </select>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="alert alert-info mt-3 d-flex align-items-center gap-2">
            <span>{selected.length} {t.bulk}:</span>
            <button className="btn btn-outline-success btn-sm" onClick={() => handleBulk('approve')}>{t.approve}</button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleBulk('reject')}>{t.reject}</button>
            <button className="btn btn-outline-warning btn-sm" onClick={() => handleBulk('highlight')}>{t.makeHighlight}</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => handleBulk('unhighlight')}>{t.removeHighlight}</button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleBulk('delete')}>{t.deleteSelected}</button>
          </div>
        )}
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>
                <input type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(t => t.id))}
                />
              </th>
              <th>{t.name}</th>
              <th>{t.title_field}</th>
              <th>{t.city}</th>
              <th>{t.program}</th>
              <th>{t.rating}</th>
              <th>{t.status}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border text-success" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-5 text-muted">{t.noTestimonials}</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id}>
                <td>
                  <input type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={e => setSelected(e.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))}
                  />
                </td>
                <td>
                  <i className="bi bi-person-circle me-2 text-secondary" />
                  {item.name}
                  {item.highlight && (
                    <i
                      className="bi bi-star-fill text-warning ms-1"
                      title={t.highlight}
                    />
                  )}
                </td>
                <td>
                  {item.title}
                  {item.company && <div className="text-muted small">{item.company}</div>}
                </td>
                <td>{item.city}</td>
                <td>
                  <span className="badge bg-info text-dark">
                    {t.programs?.[item.program_type] || item.program_type}
                  </span>
                </td>
                <td>
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < item.rating ? '-fill text-warning' : ' text-secondary'}`} />
                  ))}
                </td>
                <td>
                  <span className={`badge bg-${item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : 'danger'}`}>
                    {t[item.status] || item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline-success btn-sm me-1"
                    title={t.edit}
                    onClick={() => handleEdit(item)}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    title={t.delete}
                    onClick={() => handleDelete(item.id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TestimonialFormModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          testimonial={editItem || {}}   // null yerine boş obje gönder
          onSave={handleSave}
          isEnglish={isEnglish}
        />
      )}
    </div>
  );
};

export default TestimonialsManager;