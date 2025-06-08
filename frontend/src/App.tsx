import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import MeetingRoomManagement from './pages/admin/MeetingRoomManagementPage';
import UserManagement from './pages/admin/UserManagementPage';
import BookingManagement from './pages/admin/BookingManagementPage';
import EquipmentManagement from './pages/admin/EquipmentManagementPage'
import BookingPage from './pages/customer/BookingPage';
import MyBookings from './pages/customer/MyBookingsPage';
import StaffWorkPage from './pages/staff/WorkPage';
import StaffBookingManagement from './pages/staff/BookingManagementPage'
import AdminLayout from './components/admin/AdminLayout';
import CustomerLayout from './components/customer/CustomerLayout';
import StaffLayout from './components/staff/StaffLayout';
import './App.css'

// 管理员路由守卫
const AdminRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
};

// 客户路由守卫
const CustomerRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'customer') {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
};

// 员工路由守卫
const StaffRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'staff') {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
};

function AppRoutes() {
  return (
    <div className="page-container">
      <AnimatePresence mode='wait'>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 管理员路由 */}
          <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}>
            <Route index element={<Navigate to="meeting-rooms" replace />} />
            <Route path="meeting-rooms" element={<MeetingRoomManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="equipments" element={<EquipmentManagement />} />
          </Route>

          {/* 客户路由 */}
          <Route path="/customer" element={<CustomerRoute element={<CustomerLayout />} />}>
            <Route index element={<Navigate to="book" replace />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="my-bookings" element={<MyBookings />} />
          </Route>

          {/* 员工路由 */}
          <Route path="/staff" element={<StaffRoute element={<StaffLayout />} />}>
            <Route index element={<Navigate to="work" replace />} />
            <Route path="work" element={<StaffWorkPage />} />
            <Route path="bookmanagement" element={<StaffBookingManagement />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;