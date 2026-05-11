import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import Apply from "./pages/Apply";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CompanyJobs from "./pages/CompanyJobs";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import CompanyHome from "./pages/CompanyHome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/apply/:id" element={<Apply />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/company-jobs" element={<CompanyJobs />} />
      <Route path="/add-job" element={<AddJob />} />
      <Route path="/edit-job/:id" element={<EditJob />} />
      <Route path="/company-home" element={<CompanyHome />} />
    </Routes>
  );
}
