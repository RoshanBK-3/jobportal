import { useParams, useNavigate } from "react-router-dom";
import { getJobs, updateJob } from "../data/jobs";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  // Load existing job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobs = await getJobs();
        const jobsArray = Array.isArray(jobs) ? jobs : [];
        const foundJob = jobsArray.find((j) => String(j.id) === String(id));
        
        if (foundJob) {
          setJob(foundJob);
          setTitle(foundJob.title || "");
          setCompany(foundJob.company || "");
          setLocation(foundJob.location || "");
          setSkills(foundJob.skills ? foundJob.skills.join(", ") : "");
          setDescription(foundJob.description || "");
        }
      } catch (error) {
        console.error("Error loading job:", error);
      }
    };
    
    loadJob();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedJob = {
      id: job.id,
      title,
      company,
      location,
      skills: skills.split(",").map((s) => s.trim()),
      description,
      createdBy: job.created_by || job.createdBy,
    };
    
    await updateJob(updatedJob);
    alert("Job updated successfully!");
    navigate("/company-jobs");
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-red-500 text-lg mb-4">Job not found</p>
            <button 
              onClick={() => navigate("/company-jobs")} 
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition"
            >
              ← Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4 justify-center text-center">
            <h2 className="text-xl font-bold text-white">✏️ Edit Job</h2>
            <p className="text-orange-100 text-sm">Update your job posting details</p>
          </div>

          {/* Compact Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Frontend Developer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ABC Tech"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Kathmandu"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Skills *</label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="React, Node.js, Python"
                required
              />
              <p className="text-xs text-gray-400 mt-0.5">Separate skills with commas</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Describe the role, responsibilities, and requirements..."
                rows="3"
                required
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => navigate("/company-jobs")}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition shadow-md"
              >
                Update Job →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}