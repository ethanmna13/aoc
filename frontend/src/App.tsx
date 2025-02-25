import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import AdminUsers from "./components/admin/Users";
import AdminOnboardingChecklists from "./components/admin/OnboardingChecklists";
import AdminMentorshipPage from "./components/admin/MentorshipPage";
import AdminAssignPage from "./components/admin/AssignTasks";
import MentorDashboard from "./components/mentor/Dashboard";
import MentorMentorships from "./components/mentor/Dashboard";
import MenteeToDoPage from "./components/mentee/MenteeToDoPage";
import UnauthorizedPage from "./components/UnauthorizedPage";
import '../node_modules/@freee_jp/vibes/vibes_2021.css';
import { Provider } from 'react-redux';
import { store } from './app/store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign_in" element={<LoginPage />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/main-tasks" element={<AdminOnboardingChecklists />} />
          <Route path="admin/mentorships" element={<AdminMentorshipPage />} />
          <Route path="admin/assign" element={<AdminAssignPage />} />
          <Route path="mentor/dashboard" element={<MentorDashboard />} />
          <Route path="mentor/TODO" element={<MentorMentorships />} />
          <Route path="mentee/TODO" element={<MenteeToDoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
