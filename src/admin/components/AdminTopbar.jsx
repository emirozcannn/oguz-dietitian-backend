import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AdminTopbar = ({ onLogout, isEnglish }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-heart-pulse text-success me-2 fs-4"></i>
          <span className="fw-bold">Oğuz Yolyapan</span>
          <span className="badge bg-success ms-2">Admin</span>
        </Link>
        
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown">
            <a 
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle me-2"></i>
              {isEnglish ? 'Admin User' : 'Yönetici'}
            </a>
            <ul className="dropdown-menu">
              <li>
                <Link className="dropdown-item" to={isEnglish ? "/en" : "/"}>
                  <i className="bi bi-house me-2"></i>
                  {isEnglish ? 'Back to Website' : 'Ana Sayfaya Dön'}
                </Link>
              </li>
              <li><hr className="dropdown-divider"></hr></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>{isEnglish ? 'Profile' : 'Profil'}</a></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>{isEnglish ? 'Settings' : 'Ayarlar'}</a></li>
              <li><hr className="dropdown-divider"></hr></li>
              <li>
                <button className="dropdown-item" onClick={onLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  {isEnglish ? 'Logout' : 'Çıkış'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminTopbar;
