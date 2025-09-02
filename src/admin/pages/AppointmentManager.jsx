import React, { useState, useEffect } from 'react';

const AppointmentManager = ({ isEnglish }) => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Appointment Type CRUD state & handlers
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editTypeId, setEditTypeId] = useState(null);
  const [typeForm, setTypeForm] = useState({
    name_tr: '',
    name_en: '',
    description_tr: '',
    description_en: '',
    duration: 30,
    price: 0,
    color_code: '#198754',
    is_active: true
  });

  // Slot management state
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState('');
  const [slotForm, setSlotForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    max_appointments: 1,
    is_available: true
  });
  const [bulkSlotForm, setBulkSlotForm] = useState({
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: 60,
    break_duration: 0,
    lunch_start: '12:00',
    lunch_duration: 60,
    working_days: [1, 2, 3, 4, 5], // Monday to Friday
    max_appointments_per_slot: 1
  });

  // Fetch appointments with enhanced data
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone
          ),
          appointment_types (
            name_tr,
            name_en,
            duration,
            price,
            color_code
          )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(isEnglish ? 'Failed to fetch appointments' : 'Randevular getirilemedi');
    }
  };

  // Fetch appointment types
  const fetchAppointmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_types')
        .select('*')
        .order('name_tr');

      if (error) throw error;
      setAppointmentTypes(data || []);
    } catch (err) {
      console.error('Error fetching appointment types:', err);
    }
  };

  // Fetch appointment slots with booking count
  const fetchAppointmentSlots = async () => {
    try {
      const { data: slots, error: slotsError } = await supabase
        .from('appointment_slots')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .order('start_time');

      if (slotsError) throw slotsError;

      // Get booking counts for each slot
      const slotsWithBookings = await Promise.all(
        (slots || []).map(async (slot) => {
          const { count, error: countError } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('appointment_date', slot.date)
            .eq('appointment_time', slot.start_time)
            .in('status', ['pending', 'confirmed']);

          if (countError) {
            console.error('Error counting appointments:', countError);
            return { ...slot, current_appointments: 0 };
          }

          return { ...slot, current_appointments: count || 0 };
        })
      );

      setAppointmentSlots(slotsWithBookings);
    } catch (err) {
      console.error('Error fetching appointment slots:', err);
    }
  };

  // Create single slot
  const createSlot = async (slotData) => {
    try {
      const { error } = await supabase
        .from('appointment_slots')
        .insert([slotData]);

      if (error) throw error;
      
      setSuccess(isEnglish ? 'Slot created successfully' : 'Slot başarıyla oluşturuldu');
      fetchAppointmentSlots();
      return true;
    } catch (err) {
      console.error('Error creating slot:', err);
      setError(isEnglish ? 'Failed to create slot' : 'Slot oluşturulamadı');
      return false;
    }
  };

  // Create bulk slots
  const createBulkSlots = async () => {
    setLoading(true);
    try {
      const slots = [];
      const startDate = new Date(bulkSlotForm.start_date);
      const endDate = new Date(bulkSlotForm.end_date);
      
      // Loop through each day
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        
        // Skip if not a working day
        if (!bulkSlotForm.working_days.includes(dayOfWeek)) continue;
        
        const dateStr = d.toISOString().split('T')[0];
        
        // Calculate time slots for the day
        const dayStart = new Date(`${dateStr}T${bulkSlotForm.start_time}`);
        const dayEnd = new Date(`${dateStr}T${bulkSlotForm.end_time}`);
        const lunchStart = new Date(`${dateStr}T${bulkSlotForm.lunch_start}`);
        const lunchEnd = new Date(lunchStart.getTime() + bulkSlotForm.lunch_duration * 60000);
        
        // Generate slots
        let currentTime = new Date(dayStart);
        
        while (currentTime < dayEnd) {
          const slotEnd = new Date(currentTime.getTime() + bulkSlotForm.slot_duration * 60000);
          
          // Skip lunch break
          if (bulkSlotForm.lunch_duration > 0) {
            if (currentTime >= lunchStart && currentTime < lunchEnd) {
              currentTime = new Date(lunchEnd);
              continue;
            }
            if (slotEnd > lunchStart && currentTime < lunchStart) {
              // Slot would overlap with lunch break, skip it
              currentTime = new Date(lunchEnd);
              continue;
            }
          }
          
          // Create slot
          slots.push({
            date: dateStr,
            start_time: currentTime.toTimeString().slice(0, 5),
            end_time: slotEnd.toTimeString().slice(0, 5),
            max_appointments: bulkSlotForm.max_appointments_per_slot,
            is_available: true
          });
          
          // Move to next slot (including break time)
          currentTime = new Date(slotEnd.getTime() + bulkSlotForm.break_duration * 60000);
        }
      }
      
      // Insert all slots
      if (slots.length > 0) {
        const { error } = await supabase
          .from('appointment_slots')
          .insert(slots);
          
        if (error) throw error;
        
        setSuccess(isEnglish 
          ? `${slots.length} slots created successfully` 
          : `${slots.length} slot başarıyla oluşturuldu`
        );
        fetchAppointmentSlots();
        setShowSlotModal(false);
      } else {
        setError(isEnglish ? 'No slots to create' : 'Oluşturulacak slot yok');
      }
    } catch (err) {
      console.error('Error creating bulk slots:', err);
      setError(isEnglish ? 'Failed to create slots' : 'Slotlar oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  // Delete slot
  const deleteSlot = async (slotId) => {
    if (!window.confirm(isEnglish ? 'Delete this slot?' : 'Bu slotu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointment_slots')
        .delete()
        .eq('id', slotId);
        
      if (error) throw error;
      
      setSuccess(isEnglish ? 'Slot deleted' : 'Slot silindi');
      fetchAppointmentSlots();
    } catch (err) {
      console.error('Error deleting slot:', err);
      setError(isEnglish ? 'Failed to delete slot' : 'Slot silinemedi');
    }
  };

  // Toggle slot availability
  const toggleSlotAvailability = async (slotId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('appointment_slots')
        .update({ is_available: !currentStatus })
        .eq('id', slotId);
        
      if (error) throw error;
      
      setSuccess(isEnglish ? 'Slot status updated' : 'Slot durumu güncellendi');
      fetchAppointmentSlots();
    } catch (err) {
      console.error('Error updating slot:', err);
      setError(isEnglish ? 'Failed to update slot' : 'Slot güncellenemedi');
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const updateData = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) throw error;

      setSuccess(isEnglish ? 'Appointment status updated' : 'Randevu durumu güncellendi');
      fetchAppointments();
      fetchAppointmentSlots(); // Refresh slots to update counts
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(isEnglish ? 'Failed to update appointment' : 'Randevu güncellenemedi');
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm(isEnglish ? 'Delete this appointment?' : 'Bu randevuyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      setSuccess(isEnglish ? 'Appointment deleted' : 'Randevu silindi');
      fetchAppointments();
      fetchAppointmentSlots(); // Refresh slots to update counts
      setSelectedAppointment(null);
      setShowAppointmentDetails(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError(isEnglish ? 'Failed to delete appointment' : 'Randevu silinemedi');
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = !filterDate || appointment.appointment_date === filterDate;
    return matchesStatus && matchesDate;
  });

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'warning', text: isEnglish ? 'Pending' : 'Bekliyor' },
      confirmed: { class: 'success', text: isEnglish ? 'Confirmed' : 'Onaylandı' },
      cancelled: { class: 'danger', text: isEnglish ? 'Cancelled' : 'İptal' },
      completed: { class: 'primary', text: isEnglish ? 'Completed' : 'Tamamlandı' },
      no_show: { class: 'secondary', text: isEnglish ? 'No Show' : 'Gelmedi' }
    };
    return statusMap[status] || { class: 'secondary', text: status };
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR');
  };

  // Format time
  const formatTime = (time) => {
    return time.slice(0, 5); // HH:MM format
  };

  const handleTypeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTypeForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCloseTypeModal = () => {
    setShowTypeModal(false);
    setEditTypeId(null);
    setTypeForm({
      name_tr: '',
      name_en: '',
      description_tr: '',
      description_en: '',
      duration: 30,
      price: 0,
      color_code: '#198754',
      is_active: true
    });
  };

  const handleEditType = (type) => {
    setEditTypeId(type.id);
    setTypeForm({
      name_tr: type.name_tr,
      name_en: type.name_en,
      description_tr: type.description_tr,
      description_en: type.description_en,
      duration: type.duration,
      price: type.price,
      color_code: type.color_code,
      is_active: type.is_active
    });
    setShowTypeModal(true);
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm(isEnglish ? 'Delete this type?' : 'Bu türü silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointment_types')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSuccess(isEnglish ? 'Type deleted.' : 'Tür silindi.');
      fetchAppointmentTypes();
    } catch (err) {
      setError(isEnglish ? 'Failed to delete type.' : 'Tür silinemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editTypeId) {
        // Update
        const { error } = await supabase
          .from('appointment_types')
          .update(typeForm)
          .eq('id', editTypeId);
        if (error) throw error;
        setSuccess(isEnglish ? 'Type updated.' : 'Tür güncellendi.');
      } else {
        // Create
        const { error } = await supabase
          .from('appointment_types')
          .insert([typeForm]);
        if (error) throw error;
        setSuccess(isEnglish ? 'Type added.' : 'Tür eklendi.');
      }
      fetchAppointmentTypes();
      handleCloseTypeModal();
    } catch (err) {
      setError(isEnglish ? 'Failed to save type.' : 'Tür kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk slot form changes
  const handleBulkSlotFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'working_days') {
      const day = parseInt(value);
      setBulkSlotForm(prev => ({
        ...prev,
        working_days: checked 
          ? [...prev.working_days, day]
          : prev.working_days.filter(d => d !== day)
      }));
    } else {
      setBulkSlotForm(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAppointments(),
        fetchAppointmentTypes(),
        fetchAppointmentSlots()
      ]);
      setLoading(false);
    };
    
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">{isEnglish ? 'Appointment Management' : 'Randevu Yönetimi'}</h2>
          <p className="text-muted mb-0">
            {isEnglish ? `${appointments.length} total appointments` : `Toplam ${appointments.length} randevu`}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>

      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="bi bi-calendar-check me-2"></i>
            {isEnglish ? 'Appointments' : 'Randevular'}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'slots' ? 'active' : ''}`}
            onClick={() => setActiveTab('slots')}
          >
            <i className="bi bi-calendar3 me-2"></i>
            {isEnglish ? 'Time Slots' : 'Zaman Slotları'}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="bi bi-gear me-2"></i>
            {isEnglish ? 'Settings' : 'Ayarlar'}
          </button>
        </li>
      </ul>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <React.Fragment>
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">{isEnglish ? 'Filter by Status' : 'Duruma Göre Filtrele'}</label>
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">{isEnglish ? 'All Status' : 'Tüm Durumlar'}</option>
                    <option value="pending">{isEnglish ? 'Pending' : 'Bekliyor'}</option>
                    <option value="confirmed">{isEnglish ? 'Confirmed' : 'Onaylandı'}</option>
                    <option value="cancelled">{isEnglish ? 'Cancelled' : 'İptal'}</option>
                    <option value="completed">{isEnglish ? 'Completed' : 'Tamamlandı'}</option>
                    <option value="no_show">{isEnglish ? 'No Show' : 'Gelmedi'}</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">{isEnglish ? 'Filter by Date' : 'Tarihe Göre Filtrele'}</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <div>
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterDate('');
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      {isEnglish ? 'Clear Filters' : 'Filtreleri Temizle'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>{isEnglish ? 'Date & Time' : 'Tarih & Saat'}</th>
                      <th>{isEnglish ? 'Client' : 'Danışan'}</th>
                      <th>{isEnglish ? 'Type' : 'Tür'}</th>
                      <th>{isEnglish ? 'Status' : 'Durum'}</th>
                      <th>{isEnglish ? 'Contact' : 'İletişim'}</th>
                      <th>{isEnglish ? 'Actions' : 'İşlemler'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                          <p className="text-muted mt-2">{isEnglish ? 'No appointments found' : 'Randevu bulunamadı'}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(appointment => {
                        const statusBadge = getStatusBadge(appointment.status);
                        const appointmentType = appointment.appointment_types;
                        return (
                          <tr key={appointment.id}>
                            <td>
                              <div>
                                <div className="fw-semibold">{formatDate(appointment.appointment_date)}</div>
                                <small className="text-muted">{formatTime(appointment.appointment_time)}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-semibold">
                                  {appointment.profiles 
                                    ? `${appointment.profiles.first_name || ''} ${appointment.profiles.last_name || ''}`.trim()
                                    : appointment.client_name || 'Unknown'
                                  }
                                </div>
                                <small className="text-muted">
                                  {appointment.profiles?.email || appointment.client_email || 'No email'}
                                </small>
                              </div>
                            </td>
                            <td>
                              {appointmentType && (
                                <div>
                                  <span 
                                    className="badge"
                                    style={{ backgroundColor: appointmentType.color_code }}
                                  >
                                    {isEnglish ? appointmentType.name_en : appointmentType.name_tr}
                                  </span>
                                  <div>
                                    <small className="text-muted">{appointmentType.duration} dk</small>
                                    {appointmentType.price && (
                                      <small className="text-muted"> • ₺{appointmentType.price}</small>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge bg-${statusBadge.class}`}>
                                {statusBadge.text}
                              </span>
                            </td>
                            <td>
                              <div>
                                {(appointment.profiles?.phone || appointment.client_phone) && (
                                  <div>
                                    <i className="bi bi-telephone me-1"></i>
                                    <small>{appointment.profiles?.phone || appointment.client_phone}</small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowAppointmentDetails(true);
                                  }}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                {appointment.status === 'pending' && (
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                    title={isEnglish ? 'Confirm' : 'Onayla'}
                                  >
                                    <i className="bi bi-check"></i>
                                  </button>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                    title={isEnglish ? 'Mark Complete' : 'Tamamla'}
                                  >
                                    <i className="bi bi-check-all"></i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteAppointment(appointment.id)}
                                  title={isEnglish ? 'Delete' : 'Sil'}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h6 className="card-title">{isEnglish ? 'Total Slots' : 'Toplam Slot'}</h6>
                  <h3 className="mb-0">{appointmentSlots.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h6 className="card-title">{isEnglish ? 'Available' : 'Müsait'}</h6>
                  <h3 className="mb-0">
                    {appointmentSlots.filter(s => s.is_available && s.current_appointments < s.max_appointments).length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h6 className="card-title">{isEnglish ? 'Full' : 'Dolu'}</h6>
                  <h3 className="mb-0">
                    {appointmentSlots.filter(s => s.current_appointments >= s.max_appointments).length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body">
                  <h6 className="card-title">{isEnglish ? 'Blocked' : 'Bloke'}</h6>
                  <h3 className="mb-0">
                    {appointmentSlots.filter(s => !s.is_available).length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">

      {/* Modal for Add/Edit Appointment Type */}
      {showTypeModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editTypeId ? (isEnglish ? 'Edit Type' : 'Türü Düzenle') : (isEnglish ? 'Add Type' : 'Tür Ekle')}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseTypeModal}></button>
              </div>
              <form onSubmit={handleTypeSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Name (TR)' : 'Ad (TR)'}</label>
                    <input type="text" className="form-control" name="name_tr" value={typeForm.name_tr} onChange={handleTypeFormChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Name (EN)' : 'Ad (EN)'}</label>
                    <input type="text" className="form-control" name="name_en" value={typeForm.name_en} onChange={handleTypeFormChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Description (TR)' : 'Açıklama (TR)'}</label>
                    <textarea className="form-control" name="description_tr" value={typeForm.description_tr} onChange={handleTypeFormChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Description (EN)' : 'Açıklama (EN)'}</label>
                    <textarea className="form-control" name="description_en" value={typeForm.description_en} onChange={handleTypeFormChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Duration (min)' : 'Süre (dk)'}</label>
                    <input type="number" className="form-control" name="duration" value={typeForm.duration} onChange={handleTypeFormChange} required min="1" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Price (₺)' : 'Fiyat (₺)'}</label>
                    <input type="number" className="form-control" name="price" value={typeForm.price} onChange={handleTypeFormChange} required min="0" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Color' : 'Renk'}</label>
                    <input type="color" className="form-control form-control-color" name="color_code" value={typeForm.color_code} onChange={handleTypeFormChange} />
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" name="is_active" checked={typeForm.is_active} onChange={handleTypeFormChange} />
                    <label className="form-check-label">{isEnglish ? 'Active' : 'Aktif'}</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseTypeModal}>{isEnglish ? 'Cancel' : 'İptal'}</button>
                  <button type="submit" className="btn btn-primary">{isEnglish ? 'Save' : 'Kaydet'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Slot Creation Modal */}
      {showSlotModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEnglish ? 'Create Time Slots' : 'Zaman Slotları Oluştur'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSlotModal(false)}></button>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  {isEnglish ? 'Appointment Types' : 'Randevu Türleri'}
                </h5>
                <button className="btn btn-sm btn-success" onClick={() => setShowTypeModal(true)}>
                  <i className="bi bi-plus-lg"></i> {isEnglish ? 'Add' : 'Ekle'}
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{isEnglish ? 'Type' : 'Tür'}</th>
                        <th>{isEnglish ? 'Duration' : 'Süre'}</th>
                        <th>{isEnglish ? 'Price' : 'Fiyat'}</th>
                        <th>{isEnglish ? 'Status' : 'Durum'}</th>
                        <th>{isEnglish ? 'Actions' : 'İşlemler'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentTypes.map(type => (
                        <tr key={type.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span 
                                className="badge me-2"
                                style={{ backgroundColor: type.color_code }}
                              >
                                &nbsp;&nbsp;&nbsp;
                              </span>
                              <div>
                                <div className="fw-semibold">
                                  {isEnglish ? type.name_en : type.name_tr}
                                </div>
                                <small className="text-muted">
                                  {isEnglish ? type.description_en : type.description_tr}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {type.duration} {isEnglish ? 'min' : 'dk'}
                          </td>
                          <td>
                            {type.price ? `₺${type.price}` : '-'}
                          </td>
                          <td>
                            <span className={`badge ${type.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {type.is_active ? (isEnglish ? 'Active' : 'Aktif') : (isEnglish ? 'Inactive' : 'Pasif')}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditType(type)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteType(type.id)}>
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
          </div>
        </div>
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">{isEnglish ? 'Break Between Slots (min)' : 'Slotlar Arası Mola (dk)'}</label>
                      <input
                        type="number"
                        className="form-control"
                        name="break_duration"
                        value={bulkSlotForm.break_duration}
                        onChange={handleBulkSlotFormChange}
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">{isEnglish ? 'Max Appointments per Slot' : 'Slot Başına Max Randevu'}</label>
                      <input
                        type="number"
                        className="form-control"
                        name="max_appointments_per_slot"
                        value={bulkSlotForm.max_appointments_per_slot}
                        onChange={handleBulkSlotFormChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">{isEnglish ? 'Lunch Break Start' : 'Öğle Arası Başlangıç'}</label>
                      <input
                        type="time"
                        className="form-control"
                        name="lunch_start"
                        value={bulkSlotForm.lunch_start}
                        onChange={handleBulkSlotFormChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">{isEnglish ? 'Lunch Break Duration (min)' : 'Öğle Arası Süresi (dk)'}</label>
                      <input
                        type="number"
                        className="form-control"
                        name="lunch_duration"
                        value={bulkSlotForm.lunch_duration}
                        onChange={handleBulkSlotFormChange}
                        min="0"
                        step="15"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">{isEnglish ? 'Working Days' : 'Çalışma Günleri'}</label>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { value: 1, label: isEnglish ? 'Monday' : 'Pazartesi' },
                      { value: 2, label: isEnglish ? 'Tuesday' : 'Salı' },
                      { value: 3, label: isEnglish ? 'Wednesday' : 'Çarşamba' },
                      { value: 4, label: isEnglish ? 'Thursday' : 'Perşembe' },
                      { value: 5, label: isEnglish ? 'Friday' : 'Cuma' },
                      { value: 6, label: isEnglish ? 'Saturday' : 'Cumartesi' },
                      { value: 0, label: isEnglish ? 'Sunday' : 'Pazar' }
                    ].map(day => (
                      <div key={day.value} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="working_days"
                          value={day.value}
                          checked={bulkSlotForm.working_days.includes(day.value)}
                          onChange={handleBulkSlotFormChange}
                        />
                        <label className="form-check-label">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSlotModal(false)}>
                  {isEnglish ? 'Cancel' : 'İptal'}
                </button>
                <button type="button" className="btn btn-primary" onClick={createBulkSlots} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {isEnglish ? 'Creating...' : 'Oluşturuluyor...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-plus me-2"></i>
                      {isEnglish ? 'Create Slots' : 'Slotları Oluştur'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEnglish ? 'Appointment Details' : 'Randevu Detayları'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAppointmentDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>{isEnglish ? 'Appointment Information' : 'Randevu Bilgileri'}</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>{isEnglish ? 'Date' : 'Tarih'}:</strong></td>
                          <td>{formatDate(selectedAppointment.appointment_date)}</td>
                        </tr>
                        <tr>
                          <td><strong>{isEnglish ? 'Time' : 'Saat'}:</strong></td>
                          <td>{formatTime(selectedAppointment.appointment_time)}</td>
                        </tr>
                        <tr>
                          <td><strong>{isEnglish ? 'Duration' : 'Süre'}:</strong></td>
                          <td>{selectedAppointment.duration} {isEnglish ? 'minutes' : 'dakika'}</td>
                        </tr>
                        <tr>
                          <td><strong>{isEnglish ? 'Status' : 'Durum'}:</strong></td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(selectedAppointment.status).class}`}>
                              {getStatusBadge(selectedAppointment.status).text}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>{isEnglish ? 'Payment' : 'Ödeme'}:</strong></td>
                          <td>
                            {selectedAppointment.payment_amount && `₺${selectedAppointment.payment_amount} - `}
                            <span className={`badge bg-${selectedAppointment.payment_status === 'paid' ? 'success' : 'warning'}`}>
                              {selectedAppointment.payment_status === 'paid' ? (isEnglish ? 'Paid' : 'Ödendi') : (isEnglish ? 'Pending' : 'Bekliyor')}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>{isEnglish ? 'Client Information' : 'Danışan Bilgileri'}</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>{isEnglish ? 'Name' : 'Ad Soyad'}:</strong></td>
                          <td>
                            {selectedAppointment.profiles 
                              ? `${selectedAppointment.profiles.first_name || ''} ${selectedAppointment.profiles.last_name || ''}`.trim()
                              : selectedAppointment.client_name || 'Unknown'
                            }
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{selectedAppointment.profiles?.email || selectedAppointment.client_email || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>{isEnglish ? 'Phone' : 'Telefon'}:</strong></td>
                          <td>{selectedAppointment.profiles?.phone || selectedAppointment.client_phone || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className="mt-3">
                    <h6>{isEnglish ? 'Client Notes' : 'Danışan Notları'}</h6>
                    <p className="text-muted">{selectedAppointment.notes}</p>
                  </div>
                )}
                
                {selectedAppointment.admin_notes && (
                  <div className="mt-3">
                    <h6>{isEnglish ? 'Admin Notes' : 'Yönetici Notları'}</h6>
                    <p className="text-muted">{selectedAppointment.admin_notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAppointmentDetails(false)}
                >
                  {isEnglish ? 'Close' : 'Kapat'}
                </button>
                {selectedAppointment.status === 'pending' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, 'confirmed');
                      setShowAppointmentDetails(false);
                    }}
                  >
                    {isEnglish ? 'Confirm Appointment' : 'Randevuyu Onayla'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>{isEnglish ? 'Time Slot Management' : 'Zaman Slotu Yönetimi'}</h5>
            <button 
              className="btn btn-success"
              onClick={() => setShowSlotModal(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              {isEnglish ? 'Create Slots' : 'Slot Oluştur'}
            </button>
          </div>

          {/* Slots by Date */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{isEnglish ? 'Date' : 'Tarih'}</th>
                      <th>{isEnglish ? 'Time' : 'Saat'}</th>
                      <th>{isEnglish ? 'Capacity' : 'Kapasite'}</th>
                      <th>{isEnglish ? 'Status' : 'Durum'}</th>
                      <th>{isEnglish ? 'Actions' : 'İşlemler'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentSlots.map(slot => {
                      const slotDate = new Date(slot.date);
                      const isToday = slotDate.toDateString() === new Date().toDateString();
                      const isPast = slotDate < new Date() && !isToday;
                      const isFull = slot.current_appointments >= slot.max_appointments;
                      return (
                        <tr key={slot.id} className={isPast ? 'text-muted' : ''}>
                          <td>
                            <div>
                              <div className="fw-semibold">{formatDate(slot.date)}</div>
                              <small className="text-muted">
                                {slotDate.toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', { weekday: 'long' })}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress" style={{ width: '100px', height: '20px' }}>
                                <div 
                                  className={`progress-bar ${isFull ? 'bg-danger' : 'bg-success'}`}
                                  style={{ width: `${(slot.current_appointments / slot.max_appointments) * 100}%` }}
                                ></div>
                              </div>
                              <small className="ms-2">
                                {slot.current_appointments}/{slot.max_appointments}
                              </small>
                            </div>
                          </td>
                          <td>
                            {isPast ? (
                              <span className="badge bg-secondary">{isEnglish ? 'Past' : 'Geçmiş'}</span>
                            ) : slot.is_available ? (
                              isFull ? (
                                <span className="badge bg-warning">{isEnglish ? 'Full' : 'Dolu'}</span>
                              ) : (
                                <span className="badge bg-success">{isEnglish ? 'Available' : 'Müsait'}</span>
                              )
                            ) : (
                              <span className="badge bg-danger">{isEnglish ? 'Blocked' : 'Bloke'}</span>
                            )}
                          </td>
                          <td>
                            {!isPast && (
                              <div className="btn-group">
                                <button
                                  className={`btn btn-sm ${slot.is_available ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                  onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                                  title={slot.is_available ? (isEnglish ? 'Block' : 'Bloke Et') : (isEnglish ? 'Unblock' : 'Bloke Kaldır')}
                                >
                                  <i className={`bi ${slot.is_available ? 'bi-lock' : 'bi-unlock'}`}></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteSlot(slot.id)}
                                  title={isEnglish ? 'Delete' : 'Sil'}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {appointmentSlots.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-plus text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-2">
                      {isEnglish ? 'No time slots created yet' : 'Henüz zaman slotu oluşturulmamış'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}