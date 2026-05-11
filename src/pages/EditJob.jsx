import { useParams, useNavigate } from "react-router-dom";
import { getJobs, updateJob } from "../data/jobs";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const job = getJobs().find((j) => j.id === Number(id));

  if (!job) {
    return (
      <div>
        <Navbar />
        <p className="p-6 text-red-500">Job not found</p>
      </div>
    );
  }

  // ✅ initialize ONLY ONCE (fix backspace issue)
  const [title, setTitle] = useState(job.title);
  const [company, setCompany] = useState(job.company);
  const [location, setLocation] = useState(job.location);
  const [skills, setSkills] = useState(job.skills.join(", "));

  const handleSubmit = (e) => {
    e.preventDefault();

    updateJob({
      id: job.id,
      title,
      company,
      location,
      skills: skills.split(",").map((s) => s.trim()),
      createdBy: job.createdBy,
    });

    navigate("/company-jobs");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Edit Job</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded"
            placeholder="Job Title"
          />

          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border p-2 rounded"
            placeholder="Company"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded"
            placeholder="Location"
          />

          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="border p-2 rounded"
            placeholder="Skills (comma separated)"
          />

          <button className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
            Update Job
          </button>
        </form>
      </div>
    </div>
  );
}
