import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getJobs, deleteJob } from "../data/jobs";
import { getCurrentUser } from "../utils/auth";
import { JobCard } from "../components/JobCard";

export default function CompanyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  // Get logged in user's email
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, []);

  // Fetch company's jobs
  useEffect(() => {
    if (!userEmail) return;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const allJobs = await getJobs();
        if (!allJobs || !Array.isArray(allJobs)) {
          setJobs([]);
          return;
        }
        const companyJobsList = allJobs.filter(
          (job) => job.created_by === userEmail || job.createdBy === userEmail
        );
        setJobs(companyJobsList);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [userEmail]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(id);
        const allJobs = await getJobs();
        const jobsArray = Array.isArray(allJobs) ? allJobs : [];
        const companyJobsList = jobsArray.filter(
          (job) => job.created_by === userEmail || job.createdBy === userEmail
        );
        setJobs(companyJobsList);
        alert("Job deleted successfully!");
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="text-center py-20">Loading your jobs...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
          <button
            onClick={() => navigate("/add-job")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            + Post New Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
            <button
              onClick={() => navigate("/add-job")}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}