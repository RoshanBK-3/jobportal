import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, logoutUser } from "../utils/auth";

export default function Navbar({ activeTab, setActiveTab }) {
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getUser());
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (user?.role === "company") {
      navigate("/company-home");
    } else {
      navigate("/");
      if (setActiveTab) setActiveTab("home");
    }
  };

  const handleJobsClick = () => {
    if (setActiveTab) setActiveTab("jobs");
    navigate("/");
  };

  const handleHomeClick = () => {
    if (setActiveTab) setActiveTab("home");
    navigate("/");
  };

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-xl font-bold text-orange-600 cursor-pointer hover:text-orange-700 transition"
          onClick={handleLogoClick}
        >
          JobPortal
        </h1>

        {/* Links */}
        <div className="hidden md:flex gap-6 text-gray-600">
          <button
            onClick={handleHomeClick}
            className={`hover:text-orange-600 transition cursor-pointer ${activeTab === "home" ? "text-orange-600 font-semibold" : ""}`}
          >
            Home
          </button>
          <button
            onClick={handleJobsClick}
            className={`hover:text-orange-600 transition cursor-pointer ${activeTab === "jobs" ? "text-orange-600 font-semibold" : ""}`}
          >
            Jobs
          </button>
          <Link to="/dashboard" className="hover:text-orange-600 transition">
            Dashboard
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === "company" && (
                <button
                  onClick={() => navigate("/add-job")}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Post Job
                </button>
              )}
              <span className="font-medium text-gray-800">
                {user.role === "company" ? user.companyName : user.name}
              </span>

              <button
                onClick={handleLogout}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-1 border rounded-lg hover:bg-gray-50 transition">
                  Login
                </button>
              </Link>

              <Link to="/signup">
                <button className="px-4 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
