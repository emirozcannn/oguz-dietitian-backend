import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import * as AuthContext from '../context/AuthContext';

const ClientPanel = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, signOut } = AuthContext.useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goals: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    if (user?.user_metadata) {
      setProfileData({
        firstName: user.user_metadata.first_name || '',
        lastName: user.user_metadata.last_name || '',
        phone: user.user_metadata.phone || '',
        birthDate: user.user_metadata.birth_date || '',
        gender: user.user_metadata.gender || '',
        height: user.user_metadata.height || '',
        weight: user.user_metadata.weight || '',
        activityLevel: user.user_metadata.activity_level || '',
        goals: user.user_metadata.goals || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const updates = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        birth_date: profileData.birthDate,
        gender: profileData.gender,
        height: profileData.height,
        weight: profileData.weight,
        activity_level: profileData.activityLevel,
        goals: profileData.goals,
        full_name: `${profileData.firstName} ${profileData.lastName}`
      };

      const { error } = await updateProfile(updates);

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: isEnglish ? 'Profile updated successfully!' : 'Profil başarıyla güncellendi!'
        });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: isEnglish ? 'Error updating profile' : 'Profil güncellenirken hata oluştu'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Client Panel' : 'Danışan Paneli'} - Oğuz Yolyapan</title>
      </Helmet>

      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container py-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                  <h1 className="h3 mb-1">
                    {isEnglish ? 'Welcome,' : 'Hoş geldin,'} {user?.user_metadata?.first_name || user?.email}
                  </h1>
                  <p className="text-muted mb-0">
                    {isEnglish ? 'Manage your nutrition journey' : 'Beslenme yolculuğunu yönet'}
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Link 
                    to={isEnglish ? "/en" : "/"}
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-house me-2"></i>
                    <span className="d-none d-sm-inline">{isEnglish ? 'Back to Website' : 'Ana Sayfaya Dön'}</span>
                    <span className="d-sm-none">{isEnglish ? 'Home' : 'Ana Sayfa'}</span>
                  </Link>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    <span className="d-none d-sm-inline">{isEnglish ? 'Logout' : 'Çıkış'}</span>
                    <span className="d-sm-none">{isEnglish ? 'Exit' : 'Çık'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-pills mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    type="button"
                  >
                    <i className="bi bi-person me-2"></i>
                    {isEnglish ? 'Profile' : 'Profil'}
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                    type="button"
                  >
                    <i className="bi bi-bag me-2"></i>
                    {isEnglish ? 'My Orders' : 'Siparişlerim'}
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                    type="button"
                  >
                    <i className="bi bi-calendar me-2"></i>
                    {isEnglish ? 'Appointments' : 'Randevular'}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Tab Content */}
          <div className="row">
            <div className="col-12">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-person-circle me-2 text-primary"></i>
                        {isEnglish ? 'Profile Information' : 'Profil Bilgileri'}
                      </h5>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <i className={`bi ${isEditing ? 'bi-x' : 'bi-pencil'} me-1`}></i>
                        {isEditing ? (isEnglish ? 'Cancel' : 'İptal') : (isEnglish ? 'Edit' : 'Düzenle')}
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {message && (
                      <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
                        {message.text}
                        <button 
                          type="button" 
                          className="btn-close" 
                          onClick={() => setMessage('')}
                        ></button>
                      </div>
                    )}

                    <form>
                      <div className="row g-3">
                        {/* Basic Information */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'First Name' : 'Ad'}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Last Name' : 'Soyad'}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Email' : 'E-posta'}
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={user?.email || ''}
                            disabled
                          />
                          <div className="form-text">
                            {isEnglish ? 'Email cannot be changed' : 'E-posta değiştirilemez'}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Phone' : 'Telefon'}
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Birth Date' : 'Doğum Tarihi'}
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="birthDate"
                            value={profileData.birthDate}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Gender' : 'Cinsiyet'}
                          </label>
                          <select
                            className="form-select"
                            name="gender"
                            value={profileData.gender}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          >
                            <option value="">
                              {isEnglish ? 'Select gender' : 'Cinsiyet seçin'}
                            </option>
                            <option value="male">
                              {isEnglish ? 'Male' : 'Erkek'}
                            </option>
                            <option value="female">
                              {isEnglish ? 'Female' : 'Kadın'}
                            </option>
                            <option value="other">
                              {isEnglish ? 'Other' : 'Diğer'}
                            </option>
                          </select>
                        </div>

                        {/* Health Information */}
                        <div className="col-12">
                          <hr className="my-4" />
                          <h6 className="text-primary mb-3">
                            <i className="bi bi-heart-pulse me-2"></i>
                            {isEnglish ? 'Health Information' : 'Sağlık Bilgileri'}
                          </h6>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Height (cm)' : 'Boy (cm)'}
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="height"
                            value={profileData.height}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="170"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Weight (kg)' : 'Kilo (kg)'}
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="weight"
                            value={profileData.weight}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="70"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Activity Level' : 'Aktivite Seviyesi'}
                          </label>
                          <select
                            className="form-select"
                            name="activityLevel"
                            value={profileData.activityLevel}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          >
                            <option value="">
                              {isEnglish ? 'Select level' : 'Seviye seçin'}
                            </option>
                            <option value="sedentary">
                              {isEnglish ? 'Sedentary' : 'Hareketsiz'}
                            </option>
                            <option value="light">
                              {isEnglish ? 'Light Activity' : 'Az Aktif'}
                            </option>
                            <option value="moderate">
                              {isEnglish ? 'Moderate Activity' : 'Orta Aktif'}
                            </option>
                            <option value="very">
                              {isEnglish ? 'Very Active' : 'Çok Aktif'}
                            </option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            {isEnglish ? 'Goals' : 'Hedefler'}
                          </label>
                          <textarea
                            className="form-control"
                            name="goals"
                            rows="3"
                            value={profileData.goals}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder={isEnglish ? 'Describe your health and nutrition goals...' : 'Sağlık ve beslenme hedeflerinizi açıklayın...'}
                          />
                        </div>

                        {isEditing && (
                          <div className="col-12">
                            <hr className="my-4" />
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    {isEnglish ? 'Saving...' : 'Kaydediliyor...'}
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-check me-2"></i>
                                    {isEnglish ? 'Save Changes' : 'Değişiklikleri Kaydet'}
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                              >
                                {isEnglish ? 'Cancel' : 'İptal'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0">
                      <i className="bi bi-bag me-2 text-primary"></i>
                      {isEnglish ? 'My Orders' : 'Siparişlerim'}
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Mock Orders - in real app this would come from Supabase */}
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">
                                <i className="bi bi-receipt me-2"></i>
                                {isEnglish ? 'Order' : 'Sipariş'} #ORD-2025-001234
                              </h6>
                              <small className="text-muted">
                                {new Date().toLocaleDateString()}
                              </small>
                            </div>
                            <span className="badge bg-success">
                              {isEnglish ? 'Completed' : 'Tamamlandı'}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="mb-1">✓ {isEnglish ? 'First Consultation (45 min)' : 'İlk Danışmanlık (45 dk)'}</p>
                            <p className="mb-1">✓ {isEnglish ? 'Personalized Nutrition Plan' : 'Kişisel Beslenme Planı'}</p>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <strong>{isEnglish ? 'Total:' : 'Toplam:'} ₺750</strong>
                            <div>
                              <button className="btn btn-outline-primary btn-sm me-2">
                                <i className="bi bi-eye me-1"></i>
                                {isEnglish ? 'View Details' : 'Detayları Gör'}
                              </button>
                              <button className="btn btn-outline-secondary btn-sm">
                                <i className="bi bi-download me-1"></i>
                                {isEnglish ? 'Invoice' : 'Fatura'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="text-center py-3">
                          <Link 
                            to={isEnglish ? '/en/packages' : '/paketler'} 
                            className="btn btn-primary"
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            {isEnglish ? 'Explore More Packages' : 'Daha Fazla Paket Keşfet'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-calendar me-2 text-primary"></i>
                        {isEnglish ? 'My Appointments' : 'Randevularım'}
                      </h5>
                      <Link 
                        to={isEnglish ? '/en/appointment' : '/randevu'} 
                        className="btn btn-primary btn-sm"
                      >
                        <i className="bi bi-plus me-1"></i>
                        {isEnglish ? 'Book New' : 'Yeni Randevu'}
                      </Link>
                    </div>
                  </div>
                  <div className="card-body">
                    {/* Mock Appointments - in real app this would come from Supabase */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">
                                <i className="bi bi-person-check me-2"></i>
                                {isEnglish ? 'Nutrition Consultation' : 'Beslenme Danışmanlığı'}
                              </h6>
                              <small className="text-muted">
                                {isEnglish ? 'First Consultation' : 'İlk Danışmanlık'}
                              </small>
                            </div>
                            <span className="badge bg-warning">
                              {isEnglish ? 'Upcoming' : 'Yaklaşan'}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="mb-1">
                              <i className="bi bi-calendar3 me-2"></i>
                              {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                            <p className="mb-1">
                              <i className="bi bi-clock me-2"></i>
                              14:00 - 14:45 (45 dk)
                            </p>
                            <p className="mb-1">
                              <i className="bi bi-camera-video me-2"></i>
                              {isEnglish ? 'Online Meeting' : 'Online Görüşme'}
                            </p>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-primary btn-sm flex-fill">
                              <i className="bi bi-camera-video me-1"></i>
                              {isEnglish ? 'Join Meeting' : 'Toplantıya Katıl'}
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-calendar3"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">
                                <i className="bi bi-arrow-repeat me-2"></i>
                                {isEnglish ? 'Follow-up Consultation' : 'Takip Danışmanlığı'}
                              </h6>
                              <small className="text-muted">
                                {isEnglish ? 'Progress Review' : 'İlerleme Değerlendirmesi'}
                              </small>
                            </div>
                            <span className="badge bg-success">
                              {isEnglish ? 'Completed' : 'Tamamlandı'}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="mb-1">
                              <i className="bi bi-calendar3 me-2"></i>
                              {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                            <p className="mb-1">
                              <i className="bi bi-clock me-2"></i>
                              10:00 - 10:30 (30 dk)
                            </p>
                            <p className="mb-1">
                              <i className="bi bi-check-circle me-2 text-success"></i>
                              {isEnglish ? 'Session completed' : 'Seans tamamlandı'}
                            </p>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm flex-fill">
                              <i className="bi bi-file-text me-1"></i>
                              {isEnglish ? 'View Notes' : 'Notları Gör'}
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-download"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientPanel;
