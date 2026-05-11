import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getCurrentUser, updateCurrentUser } from "../utils/auth";
import { JobCard } from "../components/JobCard";
import { getJobs } from "../data/jobs";

export default function Dashboard() {
  const [user, setUser] = useState(getCurrentUser());
  const [bookmarks, setBookmarks] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // =============================
  // LOAD DATA
  // =============================
  useEffect(() => {
    // BOOKMARKS - with validation
    let savedBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    if (!Array.isArray(savedBookmarks)) {
      savedBookmarks = [];
      localStorage.setItem("bookmarks", JSON.stringify(savedBookmarks));
    }
    setBookmarks(savedBookmarks);

    // JOBS
    const allJobs = getJobs();

    // COMPANY JOBS
    if (user?.role === "company") {
      const companyJobs = allJobs.filter((job) => job.createdBy === user.email);
      setMyJobs(companyJobs);
    }

    // APPLIED JOBS - FIXED: Handle both array and object formats
    if (user?.role === "user") {
      let savedApplied = JSON.parse(localStorage.getItem("appliedJobs")) || [];

      // FIX: If savedApplied is an object (from old JobDetails.jsx), convert to array
      if (!Array.isArray(savedApplied)) {
        // Old format: { "email@example.com": [jobs] }
        if (typeof savedApplied === "object" && savedApplied !== null) {
          // Get all jobs from all users and filter for current user
          const allAppliedJobs = [];
          Object.keys(savedApplied).forEach((email) => {
            if (Array.isArray(savedApplied[email])) {
              allAppliedJobs.push(...savedApplied[email]);
            }
          });
          savedApplied = allAppliedJobs;
        } else {
          savedApplied = [];
        }
        // Save back in correct format
        localStorage.setItem("appliedJobs", JSON.stringify(savedApplied));
      }

      const userApplied = savedApplied.filter(
        (job) => job.appliedBy === user.email,
      );
      setAppliedJobs(userApplied);
    }
  }, [user]);

  // =============================
  // IMAGE UPLOAD
  // =============================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = {
        ...user,
        profilePic: reader.result,
      };
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

  // =============================
  // REMOVE IMAGE
  // =============================
  const handleRemoveImage = () => {
    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      const updated = {
        ...user,
        profilePic: "",
      };
      updateCurrentUser(updated);
      setUser(updated);
      alert("Profile picture removed successfully!");
    }
  };

  // =============================
  // CV UPLOAD
  // =============================
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
      const updated = {
        ...user,
        cv: reader.result,
      };
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

  // =============================
  // REMOVE CV
  // =============================
  const handleRemoveCV = () => {
    if (window.confirm("Are you sure you want to remove your CV?")) {
      const updated = {
        ...user,
        cv: "",
      };
      updateCurrentUser(updated);
      setUser(updated);
      alert("CV removed successfully!");
    }
  };

  // =============================
  // GROUP JOBS BY DATE
  // =============================
  const groupByDate = (jobs) => {
    return jobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(job);
      return acc;
    }, {});
  };

  const groupedJobs = groupByDate(myJobs);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        {/* PROFILE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-6">Profile Dashboard</h2>

          {/* Warning Banner - Show if profile pic or CV is missing */}
          {user?.role === "user" && (!user?.profilePic || !user?.cv) && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️{" "}
                <span className="font-semibold">
                  Complete your profile to apply for jobs:
                </span>
              </p>
              <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                {!user?.profilePic && <li>📸 Upload a profile picture</li>}
                {!user?.cv && (
                  <li>📄 Upload your CV/Resume (PDF format, max 1MB)</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* IMAGE */}
            <div className="flex flex-col items-center min-w-[160px]">
              {uploading ? (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-gray-400">👤</span>
                </div>
              )}

              <label className="mt-3 text-sm text-purple-600 cursor-pointer hover:text-purple-700">
                {user?.profilePic ? "Update Image" : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>

              {user?.profilePic && (
                <button
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 mt-1 hover:text-red-700"
                  disabled={uploading}
                >
                  Remove
                </button>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <p>
                  <b>Name:</b>{" "}
                  {user?.role === "company" ? user.companyName : user.name}
                </p>
                <p>
                  <b>Email:</b> {user?.email}
                </p>
                {user?.role === "user" && (
                  <>
                    <p>
                      <b>Phone:</b> {user?.phone || "-"}
                    </p>
                    <p>
                      <b>Age:</b> {user?.age || "-"}
                    </p>
                    <p>
                      <b>Gender:</b> {user?.gender || "-"}
                    </p>
                  </>
                )}
                {user?.role === "company" && (
                  <>
                    <p>
                      <b>Location:</b> {user?.location || "-"}
                    </p>
                    <p>
                      <b>Contact:</b> {user?.contact || "-"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CV - IMPROVED PDF VIEWER */}
          {user?.role === "user" && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-3">Resume / CV</h3>

              {/* CV Warning - Show if CV is missing */}
              {!user?.cv && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                  📄 CV is required to apply for jobs. Please upload your resume
                  (PDF only, max 1MB).
                </div>
              )}

              {/* CV Success - Show if CV is uploaded */}
              {user?.cv && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  ✅ CV uploaded successfully! You can now apply for jobs.
                </div>
              )}

              <label className="text-orange-600 cursor-pointer hover:text-orange-700">
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
                    className="flex items-center gap-4 border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition w-full text-left"
                  >
                    <div className="text-4xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Uploaded Resume
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to view full PDF
                      </p>
                    </div>
                  </button>

                  <div className="flex gap-4 mt-3">
                    <label className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                      Update CV
                      <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        onChange={handleCVUpload}
                        disabled={uploading}
                      />
                    </label>
                    <button
                      onClick={handleRemoveCV}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove CV
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PDF MODAL - IMPROVED */}
        {showPdfModal && user?.cv && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPdfModal(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">
                  Resume / CV - {user?.name || "Applicant"}
                </h3>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-4">
                <iframe
                  src={user.cv}
                  className="w-full h-full rounded border"
                  title="PDF Viewer"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="text-center p-8 text-gray-500">Unable to preview PDF. <button class="text-purple-600 underline" onclick="window.open(\'' +
                        user.cv +
                        "', '_blank')\">Click here to open</button></div>";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* BOOKMARKS */}
        {user?.role === "user" && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Bookmarked Jobs</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {bookmarks.length === 0 ? (
                <p className="text-gray-500">No bookmarked jobs</p>
              ) : (
                bookmarks.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        )}

        {/* APPLIED JOBS */}
        {user?.role === "user" && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Applied Jobs</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {appliedJobs.length === 0 ? (
                <p className="text-gray-500">No applied jobs yet</p>
              ) : (
                appliedJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        )}

        {/* COMPANY JOBS */}
        {user?.role === "company" && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Posted Jobs</h2>
            {Object.keys(groupedJobs).length === 0 ? (
              <p className="text-gray-500">No jobs posted yet</p>
            ) : (
              Object.entries(groupedJobs).map(([date, jobs]) => (
                <div key={date} className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">{date}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
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
    </div>
  );
}
