import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/StudentLogin';
import { StudentRegister } from './pages/StudentRegister';
import { CanteenLogin } from './pages/CanteenLogin';
import { CanteenRegister } from './pages/CanteenRegister';
import { StudentDashboard } from './pages/StudentDashboard';
import { CanteenMenu } from './pages/CanteenMenu';
import { CartPage } from './pages/CartPage';
import { StudentOrders } from './pages/StudentOrders';
import { StudentProfile } from './pages/StudentProfile';
import { CanteenDashboard } from './pages/CanteenDashboard';
import { CanteenOrders } from './pages/CanteenOrders';
import { CanteenFoodManagement } from './pages/CanteenFoodManagement';
import { CanteenProfile } from './pages/CanteenProfile';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/register" element={<StudentRegister />} />
                <Route path="/canteen/login" element={<CanteenLogin />} />
                <Route path="/canteen/register" element={<CanteenRegister />} />
                <Route path="/canteen/:canteenCode" element={<CanteenMenu />} />
                <Route path="/student/cart" element={<CartPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute requiredRole="ROLE_STUDENT">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/orders"
                  element={
                    <ProtectedRoute requiredRole="ROLE_STUDENT">
                      <StudentOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute requiredRole="ROLE_STUDENT">
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Canteen Protected Routes */}
                <Route
                  path="/canteen/dashboard"
                  element={
                    <ProtectedRoute requiredRole="ROLE_CANTEEN_OWNER">
                      <CanteenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/canteen/orders"
                  element={
                    <ProtectedRoute requiredRole="ROLE_CANTEEN_OWNER">
                      <CanteenOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/canteen/foods"
                  element={
                    <ProtectedRoute requiredRole="ROLE_CANTEEN_OWNER">
                      <CanteenFoodManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/canteen/profile"
                  element={
                    <ProtectedRoute requiredRole="ROLE_CANTEEN_OWNER">
                      <CanteenProfile />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

