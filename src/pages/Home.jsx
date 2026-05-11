import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { JobCard } from "../components/JobCard";
import { getCurrentUser } from "../utils/auth";
import CompanyHome from "./CompanyHome";

export default function Home() {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("home"); // "home" or "jobs"
  const [allJobs, setAllJobs] = useState([]);
  const [sortedJobs, setSortedJobs] = useState([]);

  // Dynamic stats
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalApplicants, setTotalApplicants] = useState(0);

  // SWITCH HOME FOR COMPANY
  if (user?.role === "company") {
    return <CompanyHome />;
  }

  // Load and sort jobs by date (newest first)
  useEffect(() => {
    const jobs = getJobs();
    setAllJobs(jobs);
    setTotalJobs(jobs.length);

    // Sort jobs by createdAt date (newest first)
    const sorted = [...jobs].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    setSortedJobs(sorted);

    // Calculate unique companies
    const uniqueCompanies = new Set();
    jobs.forEach((job) => {
      if (job.company) {
        uniqueCompanies.add(job.company);
      }
    });
    setTotalCompanies(uniqueCompanies.size);

    // Calculate total applicants from appliedJobs
    const savedApplied = JSON.parse(localStorage.getItem("appliedJobs")) || [];
    let appliedJobs = Array.isArray(savedApplied) ? savedApplied : [];

    // Count unique applicants (by email)
    const uniqueApplicants = new Set();
    appliedJobs.forEach((application) => {
      if (application.appliedBy) {
        uniqueApplicants.add(application.appliedBy);
      }
    });
    setTotalApplicants(uniqueApplicants.size);
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

  // Get featured jobs (3 most recent)
  const featuredJobs = sortedJobs.slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-6xl mx-auto p-6 flex-grow">
        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl shadow mb-8 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by skill"
            className="border p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
          />

          <input
            type="text"
            placeholder="Search by location"
            className="border p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />

          <button
            onClick={handleSearch}
            className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 active:scale-95"
          >
            Search
          </button>

          {isSearched && (
            <button
              onClick={handleClear}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* SEARCH MODE */}
        {isSearched ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {filteredJobs.length === 0 ? (
                <p className="text-center col-span-3 py-10">No jobs found</p>
              ) : (
                filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </>
        ) : activeTab === "jobs" ? (
          /* JOBS TAB - All jobs sorted by recent first */
          <>
            <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
            <p className="text-gray-500 text-sm mb-4">
              Recently posted jobs appear first
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {sortedJobs.length === 0 ? (
                <p>No jobs found</p>
              ) : (
                sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </>
        ) : (
          /* HOME TAB */
          <>
            {/* HERO */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold">
                Find Your Dream Internship 🚀
              </h1>
              <p className="text-gray-600">
                Discover jobs in Kathmandu and beyond
              </p>
            </div>

            {/* STATS - DYNAMIC NUMBERS */}
            <div className="grid grid-cols-3 gap-4 mb-10 text-center">
              <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <p className="text-2xl font-bold text-orange-600">
                  {totalJobs}+
                </p>
                <p className="text-gray-500 text-sm">Jobs</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <p className="text-2xl font-bold text-orange-600">
                  {totalCompanies}+
                </p>
                <p className="text-gray-500 text-sm">Companies</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <p className="text-2xl font-bold text-orange-600">
                  {totalApplicants}+
                </p>
                <p className="text-gray-500 text-sm">Applicants</p>
              </div>
            </div>

            {/* FEATURED JOBS - Most recent 3 */}
            <h2 className="text-xl font-semibold mb-4">Featured Jobs</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {featuredJobs.length === 0 ? (
                <p>No jobs found</p>
              ) : (
                featuredJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {/* ALL JOBS - Sorted by recent first */}
            <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {sortedJobs.length === 0 ? (
                <p>No jobs found</p>
              ) : (
                sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <h1 className="text-xl font-bold text-white mb-2">JobPortal</h1>
              <p className="text-gray-400">
                Find the right job and make your career grow faster.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Explore</h3>
              <ul className="space-y-2">
                <li
                  onClick={() => setActiveTab("home")}
                  className="hover:text-white cursor-pointer"
                >
                  Home
                </li>
                <li
                  onClick={() => setActiveTab("jobs")}
                  className="hover:text-white cursor-pointer"
                >
                  Jobs
                </li>
                <li className="hover:text-white cursor-pointer">Companies</li>
                <li className="hover:text-white cursor-pointer">Dashboard</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">Terms</li>
                <li className="hover:text-white cursor-pointer">Privacy</li>
                <li className="hover:text-white cursor-pointer">Cookies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <p className="text-gray-400">support@jobportal.com</p>
              <div className="flex gap-3 mt-3 text-lg">
                <span className="hover:text-white cursor-pointer">🌐</span>
                <span className="hover:text-white cursor-pointer">🐦</span>
                <span className="hover:text-white cursor-pointer">💼</span>
                <span className="hover:text-white cursor-pointer">📸</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
            © 2026 Job Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
