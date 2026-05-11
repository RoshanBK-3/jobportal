import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../data/jobs";
import { getCurrentUser } from "../utils/auth";
import { JobCard } from "../components/JobCard";
import { useState, useEffect, useCallback } from "react";

export default function CompanyHome() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantDetailModal, setShowApplicantDetailModal] =
    useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Store jobs in state

  // Load all jobs once
  useEffect(() => {
    const jobs = getJobs();
    setAllJobs(jobs);
  }, []); // Empty array - runs only once

  // Function to open PDF from base64 data
  const openPDF = (base64Data) => {
    if (!base64Data) {
      alert("No PDF data available");
      return;
    }

    try {
      if (!base64Data.includes("base64,")) {
        alert("Invalid PDF format");
        return;
      }

      const base64Part = base64Data.split(",")[1];
      if (!base64Part) {
        alert("Invalid PDF data");
        return;
      }

      const byteCharacters = atob(base64Part);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Unable to open PDF. The file may be corrupted.");
    }
  };

  // Load company jobs - FIXED: depends on allJobs (which is stable) and user
  useEffect(() => {
    if (user?.role === "company" && allJobs.length > 0) {
      const jobs = allJobs.filter((job) => job.createdBy === user?.email);
      setCompanyJobs(jobs);
    }
  }, [user?.email, user?.role, allJobs]); // allJobs now has stable reference

  // Load all users from database
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("users_db")) || [];
      setAllUsers(users);
    } catch (error) {
      console.error("Error loading users:", error);
      setAllUsers([]);
    }
  }, []);

  // Get all applications for company's jobs
  useEffect(() => {
    if (user?.role === "company") {
      try {
        const savedApplied =
          JSON.parse(localStorage.getItem("appliedJobs")) || [];

        let appliedJobs = Array.isArray(savedApplied) ? savedApplied : [];

        const validJobs = appliedJobs.filter(
          (job) => job && job.id && job.appliedBy,
        );

        setApplications(validJobs);
      } catch (error) {
        console.error("Error loading applications:", error);
        setApplications([]);
      }
    }
  }, [user?.role]); // Removed companyJobs.length to prevent loop

  // Get applicants for a specific job
  const getApplicantsForJob = useCallback(
    (jobId) => {
      return applications.filter((app) => app.id === jobId);
    },
    [applications],
  );

  // Get full applicant details from users database
  const getApplicantDetails = useCallback(
    (applicantEmail) => {
      if (!applicantEmail) return null;
      const foundUser = allUsers.find((u) => u && u.email === applicantEmail);
      return foundUser || null;
    },
    [allUsers],
  );

  // Open modal to show all applicants for a job
  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
  };

  // Open modal to show single applicant details
  const handleViewApplicantDetail = (applicantEmail) => {
    const applicant = getApplicantDetails(applicantEmail);
    if (!applicant) {
      alert("Applicant details not found");
      return;
    }
    setSelectedApplicant(applicant);
    setShowApplicantDetailModal(true);
  };

  // Navigation functions
  const handlePostNewJob = () => {
    navigate("/add-job");
  };

  const handleManageJobs = () => {
    navigate("/company-jobs");
  };

  const handlePostFirstJob = () => {
    navigate("/add-job");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-4">Company Dashboard 🏢</h1>

        <p className="text-gray-600 mb-6">
          Manage your job postings and applicants
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={handlePostNewJob}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
            type="button"
          >
            Post New Job
          </button>

          <button
            onClick={handleManageJobs}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer"
            type="button"
          >
            Manage Jobs
          </button>
        </div>

        {/* POSTED JOBS SECTION WITH VIEW APPLICANTS BUTTON */}
        <h2 className="text-xl font-semibold mb-4">Your Posted Jobs</h2>

        {companyJobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No jobs posted yet.</p>
            <button
              onClick={handlePostFirstJob}
              className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
              type="button"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {companyJobs.map((job) => {
              const applicantCount = getApplicantsForJob(job.id).length;
              return (
                <div key={job.id} className="relative">
                  <JobCard job={job} />
                  <button
                    onClick={() => handleViewApplicants(job)}
                    className="mt-2 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-medium cursor-pointer"
                    type="button"
                  >
                    View Applicants ({applicantCount})
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
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
                <li className="hover:text-white cursor-pointer">Jobs</li>
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

      {/* APPLICANTS LIST MODAL */}
      {showApplicantsModal && selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowApplicantsModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Applicants for
                </h2>
                <p className="text-purple-600 font-semibold">
                  {selectedJob.title}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedJob.company} • {selectedJob.location}
                </p>
              </div>
              <button
                onClick={() => setShowApplicantsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const jobApplicants = getApplicantsForJob(selectedJob.id);
                if (jobApplicants.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <p className="text-gray-500">
                        No applicants yet for this position.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {jobApplicants.map((application, idx) => {
                      const applicant = getApplicantDetails(
                        application.appliedBy,
                      );
                      return (
                        <div
                          key={idx}
                          className="border rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-4">
                            {applicant?.profilePic ? (
                              <img
                                src={applicant.profilePic}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                              </div>
                            )}

                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {applicant?.name || application.appliedBy}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {application.appliedBy}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Applied on:{" "}
                                {new Date(
                                  application.appliedAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                handleViewApplicantDetail(application.appliedBy)
                              }
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm cursor-pointer"
                              type="button"
                            >
                              View Full Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
              <button
                onClick={() => setShowApplicantsModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE APPLICANT DETAIL MODAL */}
      {showApplicantDetailModal && selectedApplicant && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowApplicantDetailModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Applicant Details
              </h2>
              <button
                onClick={() => setShowApplicantDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start border-b pb-6 mb-6">
                <div className="flex-shrink-0">
                  {selectedApplicant.profilePic ? (
                    <img
                      src={selectedApplicant.profilePic}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">👤</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedApplicant.name || "Student Name"}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    📧 {selectedApplicant.email}
                  </p>
                  {selectedApplicant.phone && (
                    <p className="text-gray-600 mb-1">
                      📞 {selectedApplicant.phone}
                    </p>
                  )}
                  {selectedApplicant.age && (
                    <p className="text-gray-600 mb-1">
                      🎂 Age: {selectedApplicant.age}
                    </p>
                  )}
                  {selectedApplicant.gender && (
                    <p className="text-gray-600 mb-1">
                      ⚥ Gender: {selectedApplicant.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Resume / CV</h3>
                {selectedApplicant.cv ? (
                  <button
                    onClick={() => openPDF(selectedApplicant.cv)}
                    className="w-full flex items-center justify-center gap-3 bg-purple-50 border-2 border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition cursor-pointer"
                    type="button"
                  >
                    <span className="text-3xl">📄</span>
                    <div>
                      <p className="font-semibold text-purple-700">
                        View Resume
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to open PDF in new tab
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <p className="text-gray-500">No CV uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
              <button
                onClick={() => setShowApplicantDetailModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}