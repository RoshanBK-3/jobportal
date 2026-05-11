import { useParams, useNavigate } from "react-router-dom";
import { getJobs, updateJob } from "../data/jobs";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  // Load existing job data
  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="text-center py-20">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-red-500">Job not found</p>
          <button onClick={() => navigate("/company-jobs")} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Edit Job</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Job Title"
            required
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Company"
            required
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Location"
            required
          />
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Skills (comma separated)"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Job Description"
            rows="4"
            required
          />
          <button type="submit" className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
            Update Job
          </button>
        </form>
      </div>
    </div>
  );
}