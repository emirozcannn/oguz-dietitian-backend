import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';


const Appointment = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  
  const isEnglish = i18n.language === 'en';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    appointmentTypeId: '',
    appointmentDate: '',
    appointmentTime: '',
    clientPhone: user?.phone || '',
    notes: '',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptPayment: false
  });

  // Fetch appointment types
  const fetchAppointmentTypes = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.getAppointmentTypes(isEnglish ? 'en' : 'tr');
      // if (response.success) {
      //   setAppointmentTypes(response.data.types || []);
      // }
      
      // Mock data for demonstration
      const mockTypes = [
        {
          id: '1',
          name_en: 'Initial Consultation',
          name_tr: 'İlk Konsültasyon',
          description_en: 'Comprehensive nutrition assessment and personalized plan',
          description_tr: 'Kapsamlı beslenme değerlendirmesi ve kişisel plan',
          duration: 90,
          price: 500,
          color_code: '#28a745'
        },
        {
          id: '2',
          name_en: 'Follow-up Consultation',
          name_tr: 'Takip Konsültasyonu',
          description_en: 'Review progress and adjust your nutrition plan',
          description_tr: 'İlerlemenizi gözden geçirin ve beslenme planınızı ayarlayın',
          duration: 60,
          price: 350,
          color_code: '#007bff'
        }
      ];
      setAppointmentTypes(mockTypes);
    } catch (err) {
      console.error('Error fetching appointment types:', err);
      setError(isEnglish ? 'Failed to load appointment types' : 'Randevu türleri yüklenemedi');
    }
  };

  // Fetch available dates
  const fetchAvailableDates = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // TODO: Replace with actual Supabase query
      // const { data: slots, error } = await supabase
      //   .from('appointment_slots')
      //   .select('date, max_appointments')
      //   .eq('is_available', true)
      //   .gte('date', today.toISOString().split('T')[0])
      //   .order('date');

      // Mock available dates for demonstration
      const mockDates = [];
      for (let i = 1; i <= 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        if (date.getDay() !== 0) { // Exclude Sundays
          mockDates.push(date.toISOString().split('T')[0]);
        }
      }
      setAvailableDates(mockDates);
    } catch (err) {
      console.error('Error fetching available dates:', err);
      setError(isEnglish ? 'Failed to load available dates' : 'Müsait tarihler yüklenemedi');
    }
  };

  // Fetch available slots for selected date
  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual Supabase query
      // const { data: slots, error: slotsError } = await supabase
      //   .from('appointment_slots')
      //   .select('*')
      //   .eq('date', date)
      //   .eq('is_available', true)
      //   .order('start_time');

      // Mock available time slots
      const mockSlots = [
        { id: '1', start_time: '09:00:00', max_appointments: 1 },
        { id: '2', start_time: '10:00:00', max_appointments: 1 },
        { id: '3', start_time: '11:00:00', max_appointments: 1 },
        { id: '4', start_time: '14:00:00', max_appointments: 1 },
        { id: '5', start_time: '15:00:00', max_appointments: 1 },
        { id: '6', start_time: '16:00:00', max_appointments: 1 },
        { id: '7', start_time: '17:00:00', max_appointments: 1 }
      ];
      
      setAvailableSlots(mockSlots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setAvailableSlots([]);
      setError(isEnglish ? 'Failed to load time slots' : 'Zaman slotları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, appointmentDate: date, appointmentTime: '' }));
    fetchAvailableSlots(date);
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, appointmentTime: time }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];
    
    if (!formData.appointmentTypeId) {
      errors.push(isEnglish ? 'Please select an appointment type' : 'Lütfen randevu türü seçin');
    }
    
    if (!formData.appointmentDate) {
      errors.push(isEnglish ? 'Please select a date' : 'Lütfen tarih seçin');
    }
    
    if (!formData.appointmentTime) {
      errors.push(isEnglish ? 'Please select a time' : 'Lütfen saat seçin');
    }
    
    if (!formData.clientPhone) {
      errors.push(isEnglish ? 'Please enter your phone number' : 'Lütfen telefon numaranızı girin');
    }
    
    if (!formData.acceptTerms) {
      errors.push(isEnglish ? 'Please accept the terms and conditions' : 'Lütfen kullanım şartlarını kabul edin');
    }
    
    if (!formData.acceptPrivacy) {
      errors.push(isEnglish ? 'Please accept the privacy policy' : 'Lütfen gizlilik politikasını kabul edin');
    }
    
    if (!formData.acceptPayment) {
      errors.push(isEnglish ? 'Please accept the payment terms' : 'Lütfen ödeme şartlarını kabul edin');
    }
    
    return errors;
  };

  // Submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Get selected appointment type details
      const selectedType = appointmentTypes.find(type => type.id === formData.appointmentTypeId);
      
      const appointmentData = {
        user_id: user?.id,
        appointment_type_id: formData.appointmentTypeId,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        duration: selectedType?.duration || 60,
        status: 'pending',
        client_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || null,
        client_email: user?.email || null,
        client_phone: formData.clientPhone,
        notes: formData.notes,
        payment_status: 'pending',
        payment_amount: selectedType?.price || 0
      };

      // TODO: Replace with actual Supabase insert
      // const { error } = await supabase
      //   .from('appointments')
      //   .insert([appointmentData]);

      console.log('Appointment data:', appointmentData);

      setSuccess(isEnglish 
        ? 'Appointment request submitted successfully! We will confirm your appointment soon.'
        : 'Randevu talebiniz başarıyla gönderildi! En kısa sürede randevunuzu onaylayacağız.'
      );
      
      // Reset form
      setFormData({
        appointmentTypeId: '',
        appointmentDate: '',
        appointmentTime: '',
        clientPhone: user?.phone || '',
        notes: '',
        acceptTerms: false,
        acceptPrivacy: false,
        acceptPayment: false
      });
      setCurrentStep(1);
      setSelectedDate('');
      setAvailableSlots([]);
      
      // Refresh available dates
      fetchAvailableDates();
      
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(isEnglish 
        ? 'Failed to submit appointment request. Please try again.'
        : 'Randevu talebi gönderilemedi. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    return time.slice(0, 5); // HH:MM format
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get day name
  const getDayName = (date) => {
    return new Date(date).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', {
      weekday: 'short'
    });
  };

  // Get month and day
  const getMonthDay = (date) => {
    return new Date(date).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', {
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchAppointmentTypes();
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (user && user.phone) {
      setFormData(prev => ({
        ...prev,
        clientPhone: user.phone || ''
      }));
    }
  }, [user]);

  const selectedAppointmentType = appointmentTypes.find(type => type.id === formData.appointmentTypeId);

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <>
        <Helmet>
          <title>{isEnglish ? 'Login Required - Oğuz Yolyapan' : 'Giriş Gerekli - Oğuz Yolyapan'}</title>
        </Helmet>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-person-lock display-1 text-primary mb-3"></i>
                  <h3 className="card-title">
                    {isEnglish ? 'Login Required' : 'Giriş Gerekli'}
                  </h3>
                  <p className="card-text text-muted">
                    {isEnglish 
                      ? 'You need to login to book an appointment.'
                      : 'Randevu alabilmek için giriş yapmanız gerekiyor.'
                    }
                  </p>
                  <div className="d-grid gap-2">
                    <a href={isEnglish ? '/en/login' : '/giris'} className="btn btn-primary">
                      {isEnglish ? 'Login' : 'Giriş Yap'}
                    </a>
                    <a href={isEnglish ? '/en/signup' : '/kayit-ol'} className="btn btn-outline-primary">
                      {isEnglish ? 'Create Account' : 'Hesap Oluştur'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Book Appointment - Oğuz Yolyapan' : 'Randevu Al - Oğuz Yolyapan'}</title>
        <meta name="description" content={isEnglish 
          ? "Book your nutrition consultation appointment with dietitian Oğuz Yolyapan"
          : "Diyetisyen Oğuz Yolyapan ile beslenme danışmanlığı randevunuzu alın"
        } />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold text-primary">
                {isEnglish ? 'Book Your Appointment' : 'Randevunuzu Alın'}
              </h1>
              <p className="lead text-muted">
                {isEnglish 
                  ? 'Schedule your personalized nutrition consultation'
                  : 'Kişiselleştirilmiş beslenme danışmanlığınızı planlayın'
                }
              </p>
            </div>

            {/* Progress Steps */}
            <div className="row text-center mb-5">
              <div className="col-4">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <i className="bi bi-1-circle-fill"></i>
                  </div>
                  <div className="step-title">
                    {isEnglish ? 'Select Service' : 'Hizmet Seçin'}
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <i className="bi bi-2-circle-fill"></i>
                  </div>
                  <div className="step-title">
                    {isEnglish ? 'Choose Date & Time' : 'Tarih & Saat'}
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <i className="bi bi-3-circle-fill"></i>
                  </div>
                  <div className="step-title">
                    {isEnglish ? 'Contact Info' : 'İletişim Bilgileri'}
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="alert alert-danger alert-dismissible" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {success && (
              <div className="alert alert-success alert-dismissible" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
              </div>
            )}

            {/* Step 1: Select Appointment Type */}
            {currentStep === 1 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    {isEnglish ? 'Select Appointment Type' : 'Randevu Türü Seçin'}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {appointmentTypes.map(type => (
                      <div key={type.id} className="col-md-6 mb-3">
                        <div 
                          className={`card h-100 appointment-type-card ${formData.appointmentTypeId === type.id ? 'border-primary selected' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setFormData(prev => ({ ...prev, appointmentTypeId: type.id }))}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title">
                                {isEnglish ? type.name_en : type.name_tr}
                              </h6>
                              <span 
                                className="badge"
                                style={{ backgroundColor: type.color_code }}
                              >
                                ₺{type.price}
                              </span>
                            </div>
                            <p className="card-text text-muted small">
                              {isEnglish ? type.description_en : type.description_tr}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {type.duration} {isEnglish ? 'minutes' : 'dakika'}
                              </small>
                              {formData.appointmentTypeId === type.id && (
                                <i className="bi bi-check-circle-fill text-success"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn btn-primary"
                      disabled={!formData.appointmentTypeId}
                      onClick={() => setCurrentStep(2)}
                    >
                      {isEnglish ? 'Next Step' : 'Sonraki Adım'}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {currentStep === 2 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    {isEnglish ? 'Choose Date & Time' : 'Tarih ve Saat Seçin'}
                  </h5>
                </div>
                <div className="card-body">
                  {/* Date Selection */}
                  <div className="mb-4">
                    <h6>{isEnglish ? 'Select Date' : 'Tarih Seçin'}</h6>
                    {availableDates.length > 0 ? (
                      <div className="row">
                        {availableDates.slice(0, 21).map(date => (
                          <div key={date} className="col-md-3 col-6 mb-2">
                            <button
                              className={`btn w-100 ${selectedDate === date ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => handleDateSelect(date)}
                            >
                              <div className="small fw-bold">
                                {getMonthDay(date)}
                              </div>
                              <div className="small text-muted">
                                {getDayName(date)}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        {isEnglish 
                          ? 'No available dates at the moment. Please check back later.'
                          : 'Şu anda müsait tarih bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin.'
                        }
                      </div>
                    )}
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="mb-4">
                      <h6>
                        {isEnglish ? 'Available Times for' : 'Müsait Saatler'} {formatDate(selectedDate)}
                      </h6>
                      {loading ? (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="row">
                          {availableSlots.map(slot => (
                            <div key={slot.id} className="col-md-3 col-6 mb-2">
                              <button
                                className={`btn w-100 ${formData.appointmentTime === slot.start_time ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => handleTimeSelect(slot.start_time)}
                              >
                                {formatTime(slot.start_time)}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-warning">
                          {isEnglish 
                            ? 'No available time slots for this date. Please select another date.'
                            : 'Bu tarih için müsait saat yok. Lütfen başka bir tarih seçin.'
                          }
                        </div>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      {isEnglish ? 'Previous' : 'Önceki'}
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!formData.appointmentDate || !formData.appointmentTime}
                      onClick={() => setCurrentStep(3)}
                    >
                      {isEnglish ? 'Next Step' : 'Sonraki Adım'}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    {isEnglish ? 'Contact Information' : 'İletişim Bilgileri'}
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Appointment Summary */}
                    <div className="alert alert-info mb-4">
                      <h6 className="alert-heading">{isEnglish ? 'Appointment Summary' : 'Randevu Özeti'}</h6>
                      <hr />
                      <div className="row">
                        <div className="col-md-6">
                          <strong>{isEnglish ? 'Service:' : 'Hizmet:'}</strong><br />
                          {selectedAppointmentType && (isEnglish ? selectedAppointmentType.name_en : selectedAppointmentType.name_tr)}
                        </div>
                        <div className="col-md-6">
                          <strong>{isEnglish ? 'Date & Time:' : 'Tarih & Saat:'}</strong><br />
                          {formatDate(formData.appointmentDate)} - {formatTime(formData.appointmentTime)}
                        </div>
                      </div>
                      {selectedAppointmentType && (
                        <div className="mt-2">
                          <strong>{isEnglish ? 'Price:' : 'Fiyat:'}</strong> ₺{selectedAppointmentType.price}
                        </div>
                      )}
                    </div>

                    {/* Contact Form */}
                    <div className="mb-3">
                      <label className="form-label">
                        {isEnglish ? 'Phone Number *' : 'Telefon Numarası *'}
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder={isEnglish ? '+90 5XX XXX XX XX' : '+90 5XX XXX XX XX'}
                        required
                      />
                      <div className="form-text">
                        {isEnglish 
                          ? 'We will contact you on this number for appointment confirmation and payment details.'
                          : 'Randevu onayı ve ödeme detayları için bu numaradan size ulaşacağız.'
                        }
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label className="form-label">{isEnglish ? 'Additional Notes (Optional)' : 'Ek Notlar (İsteğe bağlı)'}</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder={isEnglish ? 'Any special requirements or notes...' : 'Özel gereksinimler veya notlar...'}
                      />
                    </div>

                    {/* Terms and Privacy */}
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          required
                        />
                        <label className="form-check-label">
                          {isEnglish ? 'I accept the ' : 'Kabul ediyorum '}
                          <a href={isEnglish ? '/en/terms-of-service' : '/kullanim-sartlari'} target="_blank">
                            {isEnglish ? 'Terms and Conditions' : 'Kullanım Şartları'}
                          </a>
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="acceptPrivacy"
                          checked={formData.acceptPrivacy}
                          onChange={handleInputChange}
                          required
                        />
                        <label className="form-check-label">
                          {isEnglish ? 'I accept the ' : 'Kabul ediyorum '}
                          <a href={isEnglish ? '/en/privacy-policy' : '/gizlilik-politikasi'} target="_blank">
                            {isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}
                          </a>
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="acceptPayment"
                          checked={formData.acceptPayment}
                          onChange={handleInputChange}
                          required
                        />
                        <label className="form-check-label">
                          <small>
                            {isEnglish ? (
                              <>I understand and accept that:<br />
                              • Payment must be completed before the appointment<br />
                              • I will be contacted via phone/SMS for payment details<br />
                              • Appointment confirmation will be sent after payment<br />
                              • Cancellation policy applies as per terms of service</>
                            ) : (
                              <>Anlıyorum ve kabul ediyorum ki:<br />
                              • Ödeme randevudan önce tamamlanmalıdır<br />
                              • Ödeme detayları için telefon/SMS ile iletişime geçilecek<br />
                              • Randevu onayı ödeme sonrası gönderilecek<br />
                              • İptal politikası kullanım şartlarına göre geçerlidir</>
                            )}
                          </small>
                        </label>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setCurrentStep(2)}
                      >
                        {isEnglish ? 'Back' : 'Geri'}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!formData.acceptTerms || !formData.acceptPrivacy || !formData.acceptPayment}
                      >
                        {isEnglish ? 'Confirm Appointment' : 'Randevuyu Onayla'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );  
};

export default Appointment;