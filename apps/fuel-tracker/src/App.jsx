import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@bill-reader/shared-auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScanBill from "./pages/ScanBill";
import AddManual from "./pages/AddManual";
import FuelHistory from "./pages/FuelHistory";
import FuelStations from "./pages/FuelStations";
import BikeProfile from "./pages/BikeProfile";
import Contact from "./pages/Contact";
import Layout from "./components/Layout";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router basename="/fuel-tracker">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/scan" element={<ScanBill />} />
                    <Route path="/add-manual" element={<AddManual />} />
                    <Route path="/history" element={<FuelHistory />} />
                    <Route path="/stations" element={<FuelStations />} />
                    <Route path="/bike" element={<BikeProfile />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
