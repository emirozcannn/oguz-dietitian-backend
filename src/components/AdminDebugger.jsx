import * as AuthContext from '../context/AuthContext';

const AdminDebugger = () => {
  const { user } = AuthContext.useAuth();

  if (!user) {
    return (
      <div className="alert alert-warning">
        <h5>❌ Giriş yapmamışsınız</h5>
        <p>Admin paneline erişmek için önce giriş yapmanız gerekiyor.</p>
        <a href="/giris" className="btn btn-primary">Giriş Yap</a>
      </div>
    );
  }

  const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@oguzyolyapan.com';

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h3>🔍 Admin Debug Bilgileri</h3>
        </div>
        <div className="card-body">
          <h5>Kullanıcı Bilgileri:</h5>
          <ul>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>ID:</strong> {user.id}</li>
            <li><strong>Role:</strong> {user.user_metadata?.role || 'Tanımlı değil'}</li>
            <li><strong>Admin mi?:</strong> {isAdmin ? '✅ Evet' : '❌ Hayır'}</li>
          </ul>
          
          <h5 className="mt-3">User Metadata:</h5>
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(user.user_metadata, null, 2)}
          </pre>

          {!isAdmin && (
            <div className="alert alert-info mt-3">
              <h6>Admin olmak için:</h6>
              <ol>
                <li><code>admin@oguzyolyapan.com</code> email'i ile kayıt olun</li>
                <li>Veya Supabase'de mevcut hesabınıza admin role'ü ekleyin</li>
              </ol>
            </div>
          )}

          {isAdmin && (
            <div className="alert alert-success mt-3">
              <h6>✅ Admin erişiminiz var!</h6>
              <a href="/admin" className="btn btn-success">Admin Panele Git</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDebugger;
