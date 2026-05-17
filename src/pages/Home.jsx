import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getJobs } from "../data/jobs";
import { JobCard } from "../components/JobCard";
import { getCurrentUser } from "../utils/auth";
import CompanyHome from "./CompanyHome";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("home");
  const [allJobs, setAllJobs] = useState([]);
  const [sortedJobs, setSortedJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalApplicants, setTotalApplicants] = useState(0);

  if (user?.role === "company") {
    return <CompanyHome />;
  }

  // Load all jobs and calculate stats
  useEffect(() => {
    const loadJobs = async () => {
      const jobs = await getJobs();
      setAllJobs(jobs);
      setTotalJobs(jobs.length);

      const sorted = [...jobs].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      setSortedJobs(sorted);

      const uniqueCompanies = new Set();
      jobs.forEach((job) => {
        if (job.company) uniqueCompanies.add(job.company);
      });
      setTotalCompanies(uniqueCompanies.size);

      const savedApplied =
        JSON.parse(localStorage.getItem("appliedJobs")) || [];
      let appliedJobs = Array.isArray(savedApplied) ? savedApplied : [];
      const uniqueApplicants = new Set();
      appliedJobs.forEach((application) => {
        if (application.appliedBy) uniqueApplicants.add(application.appliedBy);
      });
      setTotalApplicants(uniqueApplicants.size);
    };

    loadJobs();
  }, []);

  const [searchSkill, setSearchSkill] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    const search = searchSkill.toLowerCase().trim();
    const result = allJobs.filter((job) => {
      const title = job.title.toLowerCase();
      const skills = job.skills.map((s) => s.toLowerCase());
      const skillMatch =
        search === "" ||
        title.includes(search) ||
        skills.some((s) => s.includes(search));
      const locationMatch =
        searchLocation === "" ||
        job.location.toLowerCase().includes(searchLocation.toLowerCase());
      return skillMatch && locationMatch;
    });
    setFilteredJobs(result);
    setIsSearched(true);
  };

  const handleClear = () => {
    setSearchSkill("");
    setSearchLocation("");
    setFilteredJobs([]);
    setIsSearched(false);
  };

  const featuredJobs = sortedJobs.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            {/* Hero Section - Shows different content for logged in vs non-logged in */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                {user
                  ? "Find Your Dream Internship/Job 🚀"
                  : "Find Jobs or Hire Talent 🚀"}
              </h1>
              <p className="text-lg text-gray-600 mb-3">
                {user
                  ? "Discover thousands of jobs in Kathmandu and beyond"
                  : "Whether you're looking for your next career opportunity or searching for the perfect candidate"}
              </p>
              {/* For non-logged in users - show dual purpose message */}
              {!user && (
                <div className="flex flex-col items-center justify-center gap-5 mt-6">
                  <div className="flex items-center gap-3 text-base md:text-lg text-gray-600">
                    <span className="text-orange-500 text-2xl">🎯</span>
                    <span className="font-semibold">Find Jobs</span>
                    <span className="text-gray-400 text-xl">•</span>
                    <span className="text-purple-500 text-2xl">🏢</span>
                    <span className="font-semibold">Post Jobs</span>

                    <button
                      onClick={() => navigate("/signup")}
                      className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Skill
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., React, Node.js, Python"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Kathmandu, Pokhara"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <button
                    onClick={handleSearch}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200"
                  >
                    🔍 Search Jobs
                  </button>
                  {isSearched && (
                    <button
                      onClick={handleClear}
                      className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {totalJobs}+
                </div>
                <div className="text-gray-500">Active Jobs</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {totalCompanies}+
                </div>
                <div className="text-gray-500">Trusted Companies</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {totalApplicants}+
                </div>
                <div className="text-gray-500">Happy Applicants</div>
              </div>
            </div>

            {/* Search Results or Featured Jobs */}
            {isSearched ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Search Results
                  </h2>
                  <p className="text-gray-500">
                    {filteredJobs.length} jobs found
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-gray-500 text-lg">
                        No jobs found. Try different keywords!
                      </p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Featured Jobs */}
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      ✨ Featured Opportunities
                    </h2>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredJobs.length === 0 ? (
                      <p className="text-center col-span-3 text-gray-500">
                        No featured jobs
                      </p>
                    ) : (
                      featuredJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Jobs */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      📋 Recently Posted
                    </h2>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Browse all →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedJobs.slice(0, 6).map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">All Jobs</h2>
              <p className="text-gray-500">Recently posted first</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedJobs.length === 0 ? (
                <p className="text-center col-span-3 py-12 text-gray-500">
                  No jobs found
                </p>
              ) : (
                sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer onTabChange={setActiveTab} />
    </div>
  );
}
