import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import AdminUsers from "./components/admin/Users";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="users/sign_in" element={<LoginPage />} />
        <Route path="admin/users" element={<AdminUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
