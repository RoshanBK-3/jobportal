import { useState } from "react";
import { addJob } from "../data/jobs";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser } from "../utils/auth";

export default function AddJob() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);

  // Restrict access to companies only
  if (!user || user.role !== "company") {
    return (
      <div className="p-6">
        <Navbar />
        <p className="mt-6 text-center text-red-500">
          Access denied. Only companies can post jobs.
        </p>
      </div>
    );
  }

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newJob = {
      title,
      company: user.companyName,
      location,
      skills: skills.split(",").map((s) => s.trim()),
      type,
      salary,
      description,
      createdBy: user.email,
    };

    await addJob(newJob);
    alert("Job posted successfully!");
    navigate("/company-home");
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Post a New Job 🏢
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Job Title (e.g. Frontend Developer)"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location (e.g. Kathmandu)"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Skills (React, Node, HTML)"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />
          <select
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Job Type</option>
            <option>Internship</option>
            <option>Full-Time</option>
            <option>Part-Time</option>
          </select>
          <input
            type="text"
            placeholder="Salary (optional)"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
          <textarea
            placeholder="Job Description"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="4"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}