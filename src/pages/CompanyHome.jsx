import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../data/jobs";
import { getCurrentUser } from "../utils/auth";
import { JobCard } from "../components/JobCard";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function CompanyHome() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantDetailModal, setShowApplicantDetailModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);

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
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Unable to open PDF. The file may be corrupted.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobs = await getJobs();
        const companyJobsList = jobs.filter(
          (job) => job.created_by === user?.email || job.createdBy === user?.email
        );
        setCompanyJobs(companyJobsList);

        const { data: users, error } = await supabase.from("users").select("*");
        if (!error && users) {
          setAllUsers(users);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (user?.email) {
      loadData();
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.role === "company") {
      const loadApplications = async () => {
        try {
          const { data, error } = await supabase
            .from("applications")
            .select("*");

          if (!error && data) {
            setApplications(data);
          }
        } catch (error) {
          console.error("Error loading applications:", error);
          setApplications([]);
        }
      };

      loadApplications();
    }
  }, [user?.role]);

  const getApplicantsForJob = useCallback(
    (jobId) => applications.filter((app) => app.job_id === jobId),
    [applications]
  );

  const getApplicantDetails = useCallback(
    (applicantEmail) => {
      if (!applicantEmail) return null;
      const foundUser = allUsers.find((u) => u && u.email === applicantEmail);
      if (foundUser) {
        return {
          ...foundUser,
          profilePic: foundUser.profile_pic,
          companyName: foundUser.company_name,
        };
      }
      return null;
    },
    [allUsers]
  );

  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
  };

  const handleViewApplicantDetail = (applicantEmail) => {
    const applicant = getApplicantDetails(applicantEmail);
    if (!applicant) {
      alert("Applicant details not found");
      return;
    }
    setSelectedApplicant(applicant);
    setShowApplicantDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Company Dashboard 🏢
          </h1>
          <p className="text-gray-600">Manage your job postings and review applicants</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={() => navigate("/add-job")}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200"
          >
            + Post New Job
          </button>
          <button
            onClick={() => navigate("/company-jobs")}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            📋 Manage Jobs
          </button>
        </div>

        {/* Your Posted Jobs Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Posted Jobs</h2>
          <p className="text-gray-500">Manage and track applicants for each position</p>
        </div>

        {companyJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg mb-4">No jobs posted yet.</p>
            <button
              onClick={() => navigate("/add-job")}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {companyJobs.map((job) => {
              const applicantCount = getApplicantsForJob(job.id).length;
              return (
                <div key={job.id} className="relative">
                  <JobCard job={job} />
                  <button
                    onClick={() => handleViewApplicants(job)}
                    className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-md shadow-orange-200"
                  >
                    👥 View Applicants ({applicantCount})
                  </button>
                </div>
              );
            })}
          </div>
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
              <p className="text-gray-400 text-sm">Find the right job and make your career grow faster.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-gray-400 hover:text-orange-400 transition">Jobs</a></li>
                <li><a href="/" className="text-gray-400 hover:text-orange-400 transition">Companies</a></li>
                <li><a href="/dashboard" className="text-gray-400 hover:text-orange-400 transition">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <p className="text-gray-400 text-sm">support@jobportal.com</p>
              <div className="flex gap-3 mt-3">
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">🌐</span>
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">🐦</span>
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">💼</span>
                <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition">📸</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
            © 2026 Job Portal. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Applicants Modal */}
      {showApplicantsModal && selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowApplicantsModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b rounded-t-2xl p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Applicants for</h2>
                <p className="text-orange-600 font-semibold">{selectedJob.title}</p>
                <p className="text-sm text-gray-500">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button onClick={() => setShowApplicantsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl transition">✕</button>
            </div>
            <div className="p-6">
              {(() => {
                const jobApplicants = getApplicantsForJob(selectedJob.id);
                if (jobApplicants.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">📭</div>
                      <p className="text-gray-500">No applicants yet for this position.</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {jobApplicants.map((application, idx) => {
                      const applicant = getApplicantDetails(application.applied_by);
                      return (
                        <div key={idx} className="border rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center gap-4">
                            {applicant?.profilePic ? (
                              <img src={applicant.profilePic} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-orange-200" />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{applicant?.name || application.applied_by}</h3>
                              <p className="text-sm text-gray-500">{application.applied_by}</p>
                              <p className="text-xs text-gray-400 mt-1">Applied on: {new Date(application.applied_at).toLocaleDateString()}</p>
                            </div>
                            <button
                              onClick={() => handleViewApplicantDetail(application.applied_by)}
                              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t rounded-b-2xl p-4 flex justify-end">
              <button onClick={() => setShowApplicantsModal(false)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Details Modal */}
      {showApplicantDetailModal && selectedApplicant && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowApplicantDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b rounded-t-2xl p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Applicant Details</h2>
              <button onClick={() => setShowApplicantDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl transition">✕</button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start border-b pb-6 mb-6">
                <div className="flex-shrink-0">
                  {selectedApplicant.profilePic ? (
                    <img src={selectedApplicant.profilePic} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-orange-200" />
                  ) : (
                    <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedApplicant.name || "Student Name"}</h3>
                  <p className="text-gray-600 mb-1 flex items-center gap-2">📧 {selectedApplicant.email}</p>
                  {selectedApplicant.phone && <p className="text-gray-600 mb-1 flex items-center gap-2">📞 {selectedApplicant.phone}</p>}
                  {selectedApplicant.age && <p className="text-gray-600 mb-1 flex items-center gap-2">🎂 Age: {selectedApplicant.age}</p>}
                  {selectedApplicant.gender && <p className="text-gray-600 mb-1 flex items-center gap-2">⚥ Gender: {selectedApplicant.gender}</p>}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Resume / CV</h3>
                {selectedApplicant.cv ? (
                  <button
                    onClick={() => openPDF(selectedApplicant.cv)}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 hover:from-purple-100 hover:to-purple-200 transition"
                  >
                    <span className="text-3xl">📄</span>
                    <div>
                      <p className="font-semibold text-purple-700">View Resume</p>
                      <p className="text-sm text-gray-500">Click to open PDF in new tab</p>
                    </div>
                  </button>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                    <p className="text-gray-500">No CV uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t rounded-b-2xl p-4 flex justify-end">
              <button onClick={() => setShowApplicantDetailModal(false)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}