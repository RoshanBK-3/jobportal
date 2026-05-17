import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { JobCard } from "../components/JobCard";
import { getCurrentUser } from "../utils/auth";
import CompanyHome from "./CompanyHome";

export default function Home() {
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
        
        {/*HOME TAB */}
        {activeTab === "home" && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Find Your Dream Internship/Job 🚀
              </h1>
              <p className="text-lg text-gray-600">
                Discover thousands of jobs in Kathmandu and beyond
              </p>
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
                  <p className="text-gray-500">{filteredJobs.length} jobs found</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-gray-500 text-lg">
                        No jobs found. Try different keywords!
                      </p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
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
                      featuredJobs.map((job) => <JobCard key={job.id} job={job} />)
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
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3">
                JobPortal
              </h1>
              <p className="text-gray-400 text-sm">
                Find the right job and make your career grow faster.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="text-gray-400 hover:text-orange-400 transition"
                  >
                    Jobs
                  </button>
                </li>
                <li>
                  <a
                    href="/"
                    className="text-gray-400 hover:text-orange-400 transition"
                  >
                    Companies
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    className="text-gray-400 hover:text-orange-400 transition"
                  >
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-orange-400 transition"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-orange-400 transition"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-orange-400 transition"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <p className="text-gray-400 text-sm">support@jobportal.com</p>
              <div className="flex gap-3 mt-3">
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">
                  🌐
                </span>
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">
                  🐦
                </span>
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">
                  💼
                </span>
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">
                  📸
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
            © 2026 Job Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}