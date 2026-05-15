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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-red-500 text-lg mb-4">Access denied. Only companies can post jobs.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4 text-center">
            <h1 className="text-xl font-bold text-white"> Post a New Job 📢</h1>
            <p className="text-orange-100 text-sm">    Fill in the details below</p>
          </div>

          {/* Compact Form - Reduced spacing */}
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Frontend Developer"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Kathmandu"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Skills <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="React, Node.js, Python (comma separated)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option>Internship</option>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Remote</option>
                  <option>Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Salary (Optional)</label>
                <input
                  type="text"
                  placeholder="Rs.50k - Rs.70k"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/company-home")}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition shadow-md"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}