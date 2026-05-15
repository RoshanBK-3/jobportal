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
    return () => window.removeEventListener("authChange", handleAuthChange);
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

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login or signup to access dashboard");
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <h1
            className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition"
            onClick={handleLogoClick}
          >
            JobPortal
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={handleHomeClick}
              className={`relative px-2 py-1 text-gray-600 hover:text-orange-500 transition-all duration-200 ${
                activeTab === "home" ? "text-orange-500 font-semibold" : ""
              }`}
            >
              Home
              {activeTab === "home" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={handleJobsClick}
              className={`relative px-2 py-1 text-gray-600 hover:text-orange-500 transition-all duration-200 ${
                activeTab === "jobs" ? "text-orange-500 font-semibold" : ""
              }`}
            >
              Jobs
              {activeTab === "jobs" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={handleDashboardClick}
              className="relative px-2 py-1 text-gray-600 hover:text-orange-500 transition-all duration-200"
            >
              Dashboard
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === "company" && (
                  <button
                    onClick={() => navigate("/add-job")}
                    className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200 text-sm"
                  >
                    + Post Job
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                    {user.role === "company" ? user.companyName?.charAt(0) || "C" : user.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700">
                    {user.role === "company" ? user.companyName : user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="px-5 py-2 text-gray-600 hover:text-orange-500 transition-all duration-200 text-sm font-medium">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200 text-sm">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}