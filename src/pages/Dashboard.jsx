import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getCurrentUser, updateCurrentUser } from "../utils/auth";
import { JobCard } from "../components/JobCard";
import { getJobs } from "../data/jobs";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(getCurrentUser());
  const [bookmarks, setBookmarks] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [activeSection, setActiveSection] = useState("profile");

  // Load all jobs first
  useEffect(() => {
    const loadAllJobs = async () => {
      const jobs = await getJobs();
      setAllJobs(Array.isArray(jobs) ? jobs : []);
    };
    loadAllJobs();
  }, []);

  // Load all user data
  useEffect(() => {
    const loadData = async () => {
      if (!allJobs.length) return;

      if (user?.email) {
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_email", user.email);

        if (!bookmarkError && bookmarkData) {
          const bookmarkedJobs = bookmarkData
            .map((bookmark) =>
              allJobs.find((job) => job.id === bookmark.job_id),
            )
            .filter((job) => job);
          setBookmarks(bookmarkedJobs);
        }
      }

      if (user?.role === "company") {
        const companyJobs = allJobs.filter(
          (job) => job.createdBy === user.email,
        );
        setMyJobs(companyJobs);
      }

      if (user?.role === "user" && user?.email) {
        const { data: userApplied, error } = await supabase
          .from("applications")
          .select("*")
          .eq("applied_by", user.email)
          .order("applied_at", { ascending: false });

        if (!error && userApplied) {
          const appliedJobsWithDetails = userApplied
            .map((app) => allJobs.find((job) => job.id === app.job_id))
            .filter((job) => job);
          setAppliedJobs(appliedJobsWithDetails);
        }
      }
    };

    loadData();
  }, [user, allJobs]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = { ...user, profilePic: reader.result };
      updateCurrentUser(updated);
      setUser(updated);
      setUploading(false);
      alert("Profile picture updated successfully!");
    };
    reader.onerror = () => {
      setUploading(false);
      alert("Error uploading image. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      const updated = { ...user, profilePic: "" };
      updateCurrentUser(updated);
      setUser(updated);
      alert("Profile picture removed successfully!");
    }
  };

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }
    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = { ...user, cv: reader.result };
      updateCurrentUser(updated);
      setUser(updated);
      setUploading(false);
      alert("CV uploaded successfully!");
    };
    reader.onerror = () => {
      setUploading(false);
      alert("Error uploading CV. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCV = () => {
    if (window.confirm("Are you sure you want to remove your CV?")) {
      const updated = { ...user, cv: "" };
      updateCurrentUser(updated);
      setUser(updated);
      alert("CV removed successfully!");
    }
  };

  const groupByDate = (jobs) => {
    return jobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(job);
      return acc;
    }, {});
  };

  const groupedJobs = groupByDate(myJobs);

  const displayValue = (value) => {
    if (!value || value === "" || value === "null" || value === null) {
      return "Not provided";
    }
    return value;
  };

  // Get display name
  const displayName = () => {
    if (user?.role === "company") {
      return user.companyName || user.name || "Company";
    }
    return user?.name || "User";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Banner */}
          <div className="h-28 bg-gradient-to-r from-orange-400 to-purple-500"></div>

          <div className="px-6 pb-6">
            {/* Profile Image and Basic Info - Side by side */}
            <div className="flex flex-col md:flex-row gap-6 -mt-14 mb-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {uploading ? (
                    <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="profile"
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-4xl text-gray-500">👤</span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1.5 cursor-pointer hover:bg-orange-600 transition shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {user?.profilePic && (
                  <button
                    onClick={handleRemoveImage}
                    className="text-xs text-red-500 mt-2 hover:text-red-700 transition"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* User Info - Name and Role only (NO EMAIL HERE) */}
              <div className="flex-1 mt-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {displayName()}
                </h1>
                <div className="mt-1">
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-600 rounded-full text-xs font-medium">
                    {user?.role === "company"
                      ? "Employer Account"
                      : "Job Seeker"}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            {user?.role === "user" && (!user?.profilePic || !user?.cv) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      Complete your profile to apply for jobs:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      {!user?.profilePic && <li>Upload a profile picture</li>}
                      {!user?.cv && (
                        <li>Upload your CV/Resume (PDF format, max 1MB)</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Section - Email and other details together */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>📧</span> Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-24">Email Address:</span>
                  <span className="text-gray-700">
                    {user?.email || "Not provided"}
                  </span>
                </div>
                {user?.role === "user" && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Contact:</span>
                      <span className="text-gray-700">
                        {displayValue(user?.phone)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Age:</span>
                      <span className="text-gray-700">
                        {displayValue(user?.age)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Gender:</span>
                      <span className="text-gray-700">
                        {displayValue(user?.gender)}
                      </span>
                    </div>
                  </>
                )}
                {user?.role === "company" && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Location:</span>
                      <span className="text-gray-700">
                        {displayValue(user?.location)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Contact:</span>
                      <span className="text-gray-700">
                        {displayValue(user?.contact)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CV Section */}
        {user?.role === "user" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Resume / CV
              </h3>
            </div>

            {!user?.cv && (
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                CV is required to apply for jobs. Please upload your resume (PDF
                only, max 1MB).
              </div>
            )}
            {user?.cv && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                <span>✅</span> CV uploaded successfully! You can now apply for
                jobs.
              </div>
            )}

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium cursor-pointer hover:from-orange-600 hover:to-orange-700 transition shadow-md shadow-orange-200">
              <span>{user?.cv ? "🔄 " : "📎"}</span>
              {user?.cv ? "Update CV" : "Upload CV"}
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={handleCVUpload}
                disabled={uploading}
              />
            </label>

            {user?.cv && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="w-full flex items-center gap-4 border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-orange-50 hover:from-purple-100 hover:to-orange-100 transition"
                >
                  <div className="text-4xl">📄</div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Uploaded Resume</p>
                    <p className="text-sm text-gray-500">
                      Click to view full PDF
                    </p>
                  </div>
                  <span className="ml-auto text-purple-500">→</span>
                </button>

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={handleRemoveCV}
                    className="text-sm text-red-500 hover:text-red-700 transition"
                  >
                    🗑️ Remove CV
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section Tabs for User Role */}
        {user?.role === "user" && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveSection("bookmarks")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === "bookmarks"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              🔖 Bookmarks ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveSection("applied")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === "applied"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              📋 Applied Jobs ({appliedJobs.length})
            </button>
          </div>
        )}

        {/* Bookmarked Jobs Section */}
        {user?.role === "user" && activeSection === "bookmarks" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔖</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Bookmarked Jobs
              </h2>
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500">No bookmarked jobs yet</p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="mt-4 px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applied Jobs Section */}
        {user?.role === "user" && activeSection === "applied" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Applied Jobs</h2>
            </div>

            {appliedJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500">No applied jobs yet</p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="mt-4 px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appliedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Company Jobs Section */}
        {user?.role === "company" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Your Posted Jobs
                </h2>
              </div>
              <button
                onClick={() => (window.location.href = "/add-job")}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition shadow-md shadow-orange-200"
              >
                + Post New Job
              </button>
            </div>

            {Object.keys(groupedJobs).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500">No jobs posted yet</p>
                <button
                  onClick={() => (window.location.href = "/add-job")}
                  className="mt-4 px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              Object.entries(groupedJobs).map(([date, jobs]) => (
                <div key={date} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h3 className="font-medium text-gray-600">{date}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {showPdfModal && user?.cv && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPdfModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">📄</span>
                </div>
                <h3 className="font-semibold text-gray-800">
                  Resume / CV - {user?.name || "Applicant"}
                </h3>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={user.cv}
                className="w-full h-full rounded-xl border"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
