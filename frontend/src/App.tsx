import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CitizenManagement from './pages/admin/CitizenManagement';
import AuditTrail from './pages/admin/AuditTrail';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminManagement />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/citizens" element={<CitizenManagement />} />
        <Route path="/admin/audit" element={<AuditTrail />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
      </Routes>
    </Router>
  );
}

export default App;
