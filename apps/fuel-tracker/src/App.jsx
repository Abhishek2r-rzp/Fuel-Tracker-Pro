import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@bill-reader/shared-auth";
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

  if (!currentUser) {
    if (import.meta.env.MODE === "production") {
      window.location.href = "/login";
    } else {
      window.location.href = "http://localhost:3000/login";
    }
    return null;
  }

  return children;
}

function App() {
  const basename = import.meta.env.MODE === "production" ? "/fuel-tracker" : "";
  return (
    <AuthProvider>
      <Router basename={basename}>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
