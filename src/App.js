import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import { RequestProvider } from "./context/RequestContext";
import { RoomProvider } from "./context/RoomContext";

/* AUTH */
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";

/* DASHBOARDS */
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

/* STUDENT */
import RequestRoom from "./pages/RequestRoom";
import MyBookings from "./pages/MyBookings";
import UsageHistory from "./pages/UsageHistory";
import PendingRequests from "./pages/PendingRequests";

/* SHARED */
import Rooms from "./pages/Rooms";

/* ADMIN */
import RoomManagement from "./pages/RoomManagement";
import Allocation from "./pages/Allocation";
import Monitor from "./pages/Monitor";
import Analytics from "./pages/Analytics";

/* COMMON */
import Profile from "./pages/Profile";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "40vh" }}>Loading…</div>;
  }

  return (
    <BrowserRouter>
      <RequestProvider>
        <RoomProvider>
          <Navbar />

          <Routes>
            {/* AUTH */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* STUDENT */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/request-room"
              element={
                <ProtectedRoute requiredRole="student">
                  <RequestRoom />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute requiredRole="student">
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usage-history"
              element={
                <ProtectedRoute requiredRole="student">
                  <UsageHistory />
                </ProtectedRoute>
              }
            />

            {/* SHARED */}
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <Rooms />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/room-management"
              element={
                <ProtectedRoute requiredRole="admin">
                  <RoomManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/allocation"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Allocation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/monitor"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Monitor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* COMMON */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/pending-requests" element={<PendingRequests />} />

            {/* DEFAULT */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </RoomProvider>
      </RequestProvider>
    </BrowserRouter>
  );
}