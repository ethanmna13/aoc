import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import AdminUsers from "./components/admin/Users";
// import AdminOnboardingChecklists from "./components/admin/OnboardingChecklists";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="users/sign_in" element={<LoginPage />} />
        <Route path="admin/users" element={<AdminUsers />} />
        {/* <Route path="admin/main-tasks" element={<AdminOnboardingChecklists />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
