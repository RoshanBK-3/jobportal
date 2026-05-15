import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { addApplication } from "../data/applications";
import { getCurrentUser } from "../utils/auth";

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    gender: "",
    workLink: "",
    experience: "",
  });

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      const jobs = await getJobs();
      const foundJob = jobs.find((j) => j.id === Number(id));
      setJob(foundJob);
      setLoading(false);
    };
    loadJob();
  }, [id]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        age: user.age || "",
        phone: user.phone || "",
        gender: user.gender || "",
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      ...form,
      status: "applied",
      appliedAt: new Date().toISOString(),
    };

    await addApplication(newApplication);
    alert("Application submitted successfully!");
    navigate("/dashboard");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading application form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-red-500 text-lg mb-4">Job not found</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-orange-500 px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">Apply for Position</h1>
            <p className="text-purple-100 mt-1">{job.title} at {job.company}</p>
            <p className="text-orange-100 text-sm mt-1">📍 {job.location}</p>
          </div>

          {/* Job Preview */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex flex-wrap gap-2">
              {job.skills?.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-600 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  placeholder="25"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  placeholder="9841XXXXXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                >
                  <option value="">Select Experience</option>
                  <option>Fresher</option>
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub / Portfolio Link <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="url"
                placeholder="https://github.com/yourusername"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.workLink}
                onChange={(e) => setForm({ ...form, workLink: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/job/${job.id}`)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition shadow-md shadow-purple-200"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}