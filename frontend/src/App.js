import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './component/common/Navbar';
import FooterComponent from './component/common/Footer';
import AdminLayout from './component/admin/AdminLayout';
import LoginPage from './component/auth/LoginPage';
import RegisterPage from './component/auth/RegisterPage';
import HomePage from './component/home/HomePage';
import AllRoomsPage from './component/booking_rooms/AllRoomsPage';
import RoomDetailsBookingPage from './component/booking_rooms/RoomDetailsPage';
import FindBookingPage from './component/booking_rooms/FindBookingPage';
import AdminPage from './component/admin/AdminPage';
import ManageRoomPage from './component/admin/ManageRoomPage';
import EditRoomPage from './component/admin/EditRoomPage';
import AddRoomPage from './component/admin/AddRoomPage';
import ManageBookingsPage from './component/admin/ManageBookingsPage';
import EditBookingPage from './component/admin/EditBookingPage';
import ProfilePage from './component/profile/ProfilePage';
import EditProfilePage from './component/profile/EditProfilePage';
import PaymentPage from './component/payment/PaymentPage';
import ManageCouponsPage from './component/admin/ManageCouponsPage';
import ManageMealPlansPage from './component/admin/ManageMealPlansPage';
import PaymentReportsPage from './component/admin/PaymentReportsPage';
import ManageLocationsPage from './component/admin/ManageLocationsPage';
import { ProtectedRoute, AdminRoute } from './service/guard';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public / User shell (Navbar + Footer) ── */}
        <Route element={<PublicShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<AllRoomsPage />} />
          <Route path="/find-booking" element={<FindBookingPage />} />
          <Route path="/room-details-book/:roomId"
            element={<ProtectedRoute element={<RoomDetailsBookingPage />} />}
          />
          <Route path="/payment"
            element={<ProtectedRoute element={<PaymentPage />} />}
          />
          <Route path="/profile"
            element={<ProtectedRoute element={<ProfilePage />} />}
          />
          <Route path="/edit-profile"
            element={<ProtectedRoute element={<EditProfilePage />} />}
          />
        </Route>

        {/* ── Admin shell (sidebar, no Navbar/Footer) ── */}
        <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}>
          <Route index element={<AdminPage />} />
          <Route path="manage-rooms" element={<ManageRoomPage />} />
          <Route path="add-room" element={<AddRoomPage />} />
          <Route path="edit-room/:roomId" element={<EditRoomPage />} />
          <Route path="manage-bookings" element={<ManageBookingsPage />} />
          <Route path="edit-booking/:bookingCode" element={<EditBookingPage />} />
          <Route path="manage-coupons" element={<ManageCouponsPage />} />
          <Route path="manage-meal-plans" element={<ManageMealPlansPage />} />
          <Route path="payment-reports" element={<PaymentReportsPage />} />
          <Route path="manage-locations" element={<ManageLocationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

function PublicShell() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Outlet />
      </div>
      <FooterComponent />
    </div>
  );
}

export default App;
