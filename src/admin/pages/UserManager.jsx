import { useState, useEffect } from 'react';
import { adminUserService } from '../../lib/adminService';

const UserManager = ({ isEnglish }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // New user form data
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'client'
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.listUsers();
      setUsers(data.users || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching users:', err);
      
      if (err.message?.includes('JWT') || err.message?.includes('not authorized') || err.message?.includes('Admin access not configured')) {
        setError(isEnglish 
          ? 'Admin user management requires proper configuration. Some features may be limited.' 
          : 'Admin kullanıcı yönetimi uygun yapılandırma gerektirir. Bazı özellikler sınırlı olabilir.'
        );
        // Set demo users for development
        setUsers([
          {
            id: 'demo-admin',
            email: 'admin@oguz.com',
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            user_metadata: {
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin'
            }
          },
          {
            id: 'demo-client',
            email: 'demo@example.com',
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {
              first_name: 'Demo',
              last_name: 'Client',
              role: 'client'
            }
          }
        ]);
      } else {
        setError(isEnglish ? 'Failed to fetch users' : 'Kullanıcılar getirilemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      await adminUserService.updateUser(userId, {
        user_metadata: { role: newRole }
      });

      setSuccess(isEnglish ? 'User role updated successfully' : 'Kullanıcı rolü başarıyla güncellendi');
      fetchUsers(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(isEnglish ? 'Failed to update user role' : 'Kullanıcı rolü güncellenemedi');
      console.error('Error updating user role:', err);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm(isEnglish ? 'Are you sure you want to delete this user?' : 'Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await adminUserService.deleteUser(userId);

      setSuccess(isEnglish ? 'User deleted successfully' : 'Kullanıcı başarıyla silindi');
      fetchUsers(); // Refresh the list
      setSelectedUser(null);
      setShowUserDetails(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(isEnglish ? 'Failed to delete user' : 'Kullanıcı silinemedi');
      console.error('Error deleting user:', err);
    }
  };

  // Create new user
  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Demo: Just show success message
      setSuccess(isEnglish ? 'User created successfully (Demo)' : 'Kullanıcı başarıyla oluşturuldu (Demo)');
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'client' });
      setShowAddUser(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || (isEnglish ? 'Failed to create user' : 'Kullanıcı oluşturulamadı'));
      console.error('Error creating user:', err);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.user_metadata?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.user_metadata?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && (user.user_metadata?.role === 'admin' || user.email === 'admin@oguz.com' || user.email === 'admin@oguzyolyapan.com')) ||
                       (filterRole === 'client' && user.user_metadata?.role !== 'admin' && user.email !== 'admin@oguz.com' && user.email !== 'admin@oguzyolyapan.com');
    
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserRole = (user) => {
    if (user.user_metadata?.role === 'admin' || user.email === 'admin@oguz.com' || user.email === 'admin@oguzyolyapan.com') {
      return isEnglish ? 'Admin' : 'Yönetici';
    }
    return isEnglish ? 'Client' : 'Danışan';
  };

  const isUserAdmin = (user) => {
    return user.user_metadata?.role === 'admin' || user.email === 'admin@oguz.com' || user.email === 'admin@oguzyolyapan.com';
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
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h4 mb-1">{isEnglish ? 'User Management' : 'Kullanıcı Yönetimi'}</h2>
              <p className="text-muted mb-0">
                {isEnglish ? `${users.length} total users` : `Toplam ${users.length} kullanıcı`}
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddUser(true)}
            >
              <i className="bi bi-person-plus me-2"></i>
              {isEnglish ? 'Add User' : 'Kullanıcı Ekle'}
            </button>
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

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">{isEnglish ? 'Search Users' : 'Kullanıcı Ara'}</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isEnglish ? 'Search by email or name...' : 'Email veya isimle ara...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">{isEnglish ? 'Filter by Role' : 'Role Göre Filtrele'}</label>
                  <select 
                    className="form-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">{isEnglish ? 'All Users' : 'Tüm Kullanıcılar'}</option>
                    <option value="admin">{isEnglish ? 'Admins' : 'Yöneticiler'}</option>
                    <option value="client">{isEnglish ? 'Clients' : 'Danışanlar'}</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <div>
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={fetchUsers}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      {isEnglish ? 'Refresh' : 'Yenile'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>{isEnglish ? 'User' : 'Kullanıcı'}</th>
                      <th>{isEnglish ? 'Email' : 'E-posta'}</th>
                      <th>{isEnglish ? 'Role' : 'Rol'}</th>
                      <th>{isEnglish ? 'Status' : 'Durum'}</th>
                      <th>{isEnglish ? 'Created' : 'Oluşturulma'}</th>
                      <th>{isEnglish ? 'Actions' : 'İşlemler'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                              {(user.user_metadata?.first_name?.[0] || user.email[0]).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {user.user_metadata?.first_name && user.user_metadata?.last_name
                                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                                  : user.email.split('@')[0]
                                }
                              </div>
                              <small className="text-muted">ID: {user.id.slice(0, 8)}...</small>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${isUserAdmin(user) ? 'bg-danger' : 'bg-primary'}`}>
                            {getUserRole(user)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${user.email_confirmed_at ? 'bg-success' : 'bg-warning'}`}>
                            {user.email_confirmed_at 
                              ? (isEnglish ? 'Verified' : 'Doğrulanmış')
                              : (isEnglish ? 'Pending' : 'Bekliyor')
                            }
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(user.created_at).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR')}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {!isUserAdmin(user) && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => updateUserRole(user.id, 'admin')}
                                title={isEnglish ? 'Make Admin' : 'Yönetici Yap'}
                              >
                                <i className="bi bi-shield-check"></i>
                              </button>
                            )}
                            {isUserAdmin(user) && user.email !== 'admin@oguz.com' && user.email !== 'admin@oguzyolyapan.com' && (
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => updateUserRole(user.id, 'client')}
                                title={isEnglish ? 'Remove Admin' : 'Yönetici Kaldır'}
                              >
                                <i className="bi bi-shield-x"></i>
                              </button>
                            )}
                            {user.email !== 'admin@oguz.com' && user.email !== 'admin@oguzyolyapan.com' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteUser(user.id)}
                                title={isEnglish ? 'Delete User' : 'Kullanıcı Sil'}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-2">
                      {isEnglish ? 'No users found' : 'Kullanıcı bulunamadı'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEnglish ? 'User Details' : 'Kullanıcı Detayları'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowUserDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>{isEnglish ? 'Basic Information' : 'Temel Bilgiler'}</h6>
                    <table className="table table-sm">
                      <tr>
                        <td><strong>{isEnglish ? 'Full Name' : 'Ad Soyad'}:</strong></td>
                        <td>
                          {selectedUser.user_metadata?.first_name && selectedUser.user_metadata?.last_name
                            ? `${selectedUser.user_metadata.first_name} ${selectedUser.user_metadata.last_name}`
                            : (isEnglish ? 'Not provided' : 'Belirtilmemiş')
                          }
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{selectedUser.email}</td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Phone' : 'Telefon'}:</strong></td>
                        <td>{selectedUser.user_metadata?.phone || (isEnglish ? 'Not provided' : 'Belirtilmemiş')}</td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Role' : 'Rol'}:</strong></td>
                        <td>
                          <span className={`badge ${isUserAdmin(selectedUser) ? 'bg-danger' : 'bg-primary'}`}>
                            {getUserRole(selectedUser)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>{isEnglish ? 'Health Information' : 'Sağlık Bilgileri'}</h6>
                    <table className="table table-sm">
                      <tr>
                        <td><strong>{isEnglish ? 'Birth Date' : 'Doğum Tarihi'}:</strong></td>
                        <td>{selectedUser.user_metadata?.birth_date || (isEnglish ? 'Not provided' : 'Belirtilmemiş')}</td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Gender' : 'Cinsiyet'}:</strong></td>
                        <td>{selectedUser.user_metadata?.gender || (isEnglish ? 'Not provided' : 'Belirtilmemiş')}</td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Height' : 'Boy'}:</strong></td>
                        <td>{selectedUser.user_metadata?.height ? `${selectedUser.user_metadata.height} cm` : (isEnglish ? 'Not provided' : 'Belirtilmemiş')}</td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Weight' : 'Kilo'}:</strong></td>
                        <td>{selectedUser.user_metadata?.weight ? `${selectedUser.user_metadata.weight} kg` : (isEnglish ? 'Not provided' : 'Belirtilmemiş')}</td>
                      </tr>
                    </table>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <h6>{isEnglish ? 'Account Information' : 'Hesap Bilgileri'}</h6>
                    <table className="table table-sm">
                      <tr>
                        <td><strong>{isEnglish ? 'Created' : 'Oluşturulma'}:</strong></td>
                        <td>{new Date(selectedUser.created_at).toLocaleString(isEnglish ? 'en-US' : 'tr-TR')}</td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Last Sign In' : 'Son Giriş'}:</strong></td>
                        <td>
                          {selectedUser.last_sign_in_at 
                            ? new Date(selectedUser.last_sign_in_at).toLocaleString(isEnglish ? 'en-US' : 'tr-TR')
                            : (isEnglish ? 'Never' : 'Hiç')
                          }
                        </td>
                      </tr>
                      <tr>
                        <td><strong>{isEnglish ? 'Email Confirmed' : 'Email Doğrulandı'}:</strong></td>
                        <td>
                          <span className={`badge ${selectedUser.email_confirmed_at ? 'bg-success' : 'bg-warning'}`}>
                            {selectedUser.email_confirmed_at 
                              ? (isEnglish ? 'Yes' : 'Evet')
                              : (isEnglish ? 'No' : 'Hayır')
                            }
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>

                {selectedUser.user_metadata?.goals && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <h6>{isEnglish ? 'Goals' : 'Hedefler'}</h6>
                      <p className="text-muted">{selectedUser.user_metadata.goals}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowUserDetails(false)}
                >
                  {isEnglish ? 'Close' : 'Kapat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEnglish ? 'Add New User' : 'Yeni Kullanıcı Ekle'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddUser(false)}
                ></button>
              </div>
              <form onSubmit={createUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Password' : 'Şifre'} *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'First Name' : 'Ad'}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">{isEnglish ? 'Last Name' : 'Soyad'}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isEnglish ? 'Role' : 'Rol'}</label>
                    <select
                      className="form-select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="client">{isEnglish ? 'Client' : 'Danışan'}</option>
                      <option value="admin">{isEnglish ? 'Admin' : 'Yönetici'}</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddUser(false)}
                  >
                    {isEnglish ? 'Cancel' : 'İptal'}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEnglish ? 'Create User' : 'Kullanıcı Oluştur'}
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

export default UserManager;
