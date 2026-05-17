import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../data/jobs";
import { getCurrentUser } from "../utils/auth";
import { JobCard } from "../components/JobCard";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function CompanyHome() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("home");
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantDetailModal, setShowApplicantDetailModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [sortedJobs, setSortedJobs] = useState([]);

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

  // Load all jobs for the Jobs tab
  useEffect(() => {
    const loadAllJobs = async () => {
      const jobs = await getJobs();
      setAllJobs(jobs);
      setSortedJobs([...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };
    loadAllJobs();
  }, []);

  // Load company specific data
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

  // Load applications - ONLY for jobs posted by this company
  useEffect(() => {
    if (user?.role === "company" && companyJobs.length > 0) {
      const loadApplications = async () => {
        try {
          // Get all job IDs for this company
          const companyJobIds = companyJobs.map(job => job.id);
          
          if (companyJobIds.length === 0) {
            setApplications([]);
            return;
          }

          // Fetch only applications for jobs belonging to this company
          const { data, error } = await supabase
            .from("applications")
            .select("*")
            .in("job_id", companyJobIds);

          if (!error && data) {
            setApplications(data);
          } else {
            setApplications([]);
          }
        } catch (error) {
          console.error("Error loading applications:", error);
          setApplications([]);
        }
      };

      loadApplications();
    } else if (companyJobs.length === 0) {
      setApplications([]);
    }
  }, [user?.role, companyJobs]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Calculate total applicants for this company (unique applicants across all their jobs)
  const totalCompanyApplicants = applications.length;

  // Stats data - now using company-specific applicant count
  const stats = [
    { icon: "📊", value: companyJobs.length, label: "Jobs Posted" },
    { icon: "👥", value: totalCompanyApplicants, label: "Total Applicants" },
    { icon: "⭐", value: companyJobs.filter(job => job.status !== "closed").length, label: "Active Jobs" }
  ];

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
          <div className="p-6">{children}</div>
          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ========== HOME TAB ========== */}
        {activeTab === "home" && (
          <>
            {/* Welcome Header*/}
            <div className="mb-5">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                Welcome Back! 👋
              </h1>
              <p className="text-gray-500 text-sm">
                {user?.email} • <span className="text-orange-600 font-semibold">Company Account</span>
              </p>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl p-8 mb-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">Find the Best Talent for Your Company</h2>
                  <p className="text-orange-100 text-sm md:text-base">
                    Post jobs, review applications, and connect with qualified candidates who match your requirements.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/add-job")}
                  className="bg-white text-orange-600 px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition text-sm md:text-base whitespace-nowrap"
                >
                  + Post a New Job
                </button>
              </div>
            </div>

            {/* Stats Cards*/}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-3 flex items-center gap-3 hover:shadow-md transition">
                  <span className="text-3xl">{stat.icon}</span>
                  <div>
                    <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions*/}
            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleTabChange("dashboard")}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition group"
                >
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition text-sm">Go to Dashboard</p>
                    <p className="text-xs text-gray-500">Manage your jobs and applicants</p>
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange("jobs")}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition group"
                >
                  <span className="text-xl">💼</span>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition text-sm">Browse Jobs</p>
                    <p className="text-xs text-gray-500">View all available positions</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Jobs */}
            {companyJobs.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-gray-800 mb-3">Your Recent Jobs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {companyJobs.slice(0, 3).map((job) => (
                    <div key={job.id}>
                      <JobCard job={job} />
                      <button
                        onClick={() => handleViewApplicants(job)}
                        className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-1.5 rounded-lg hover:from-orange-600 transition font-medium text-sm"
                      >
                        👥 View Applicants ({getApplicantsForJob(job.id).length})
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {companyJobs.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500 text-sm mb-3">No jobs posted yet.</p>
                <button onClick={() => navigate("/add-job")} className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-sm">
                  Post Your First Job
                </button>
              </div>
            )}
          </>
        )}

        {/*DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                Company Dashboard 🏢
              </h1>
              <p className="text-gray-500 text-sm">Manage your job postings and review applicants</p>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => navigate("/add-job")}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-md text-sm"
              >
                + Post New Job
              </button>
              <button
                onClick={() => navigate("/company-jobs")}
                className="px-5 py-2 bg-white text-gray-700 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 hover:shadow-md transition text-sm"
              >
                📋 Manage Jobs
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Your Posted Jobs</h2>
              <p className="text-gray-500 text-sm">Manage and track applicants for each position</p>
            </div>

            {companyJobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 text-md mb-3">No jobs posted yet.</p>
                <button
                  onClick={() => navigate("/add-job")}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-sm"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                {companyJobs.map((job) => {
                  const applicantCount = getApplicantsForJob(job.id).length;
                  return (
                    <div key={job.id} className="relative">
                      <JobCard job={job} />
                      <button
                        onClick={() => handleViewApplicants(job)}
                        className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-1.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium text-sm shadow-md"
                      >
                        👥 View Applicants ({applicantCount})
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/*JOBS TAB*/}
        {activeTab === "jobs" && (
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">All Jobs</h2>
              <p className="text-gray-500 text-xs">Recently posted first</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedJobs.length === 0 ? (
                <p className="text-center col-span-3 py-8 text-gray-500">No jobs found</p>
              ) : (
                sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer onTabChange={setActiveTab} />

      {/* Applicants Modal */}
      <Modal isOpen={showApplicantsModal} onClose={() => setShowApplicantsModal(false)} title={`Applicants for ${selectedJob?.title}`}>
        {selectedJob && (() => {
          const jobApplicants = getApplicantsForJob(selectedJob.id);
          if (jobApplicants.length === 0) return <div className="text-center py-8"><div className="text-5xl mb-2">📭</div><p>No applicants yet.</p></div>;
          return (
            <div className="space-y-3">
              {jobApplicants.map((app, idx) => {
                const applicant = getApplicantDetails(app.applied_by);
                return (
                  <div key={idx} className="border rounded-lg p-3 hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      {applicant?.profilePic ? (
                        <img src={applicant.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center text-xl">👤</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{applicant?.name || app.applied_by}</h3>
                        <p className="text-xs text-gray-500">{app.applied_by}</p>
                        <p className="text-xs text-gray-400">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleViewApplicantDetail(app.applied_by)} className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Modal>

      {/* Applicant Details Modal */}
      <Modal isOpen={showApplicantDetailModal} onClose={() => setShowApplicantDetailModal(false)} title="Applicant Details">
        {selectedApplicant && (
          <>
            <div className="flex flex-col md:flex-row gap-5 items-start border-b pb-5 mb-5">
              <div className="flex-shrink-0">
                {selectedApplicant.profilePic ? (
                  <img src={selectedApplicant.profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-orange-200" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedApplicant.name || "Student Name"}</h3>
                <p className="text-gray-600 text-sm">📧 {selectedApplicant.email}</p>
                {selectedApplicant.phone && <p className="text-gray-600 text-sm">📞 {selectedApplicant.phone}</p>}
                {selectedApplicant.age && <p className="text-gray-600 text-sm">🎂 Age: {selectedApplicant.age}</p>}
                {selectedApplicant.gender && <p className="text-gray-600 text-sm">⚥ Gender: {selectedApplicant.gender}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Resume / CV</h3>
              {selectedApplicant.cv ? (
                <button onClick={() => openPDF(selectedApplicant.cv)} className="w-full flex items-center justify-center gap-2 bg-purple-50 border-2 border-purple-200 rounded-lg p-3 hover:bg-purple-100 transition">
                  <span className="text-2xl">📄</span>
                  <span className="font-semibold text-purple-700">View Resume</span>
                </button>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-500">No CV uploaded yet</div>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}