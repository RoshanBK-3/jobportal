import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { addApplication } from "../data/applications";

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobs = getJobs();
  const job = jobs.find((j) => j.id === Number(id));

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    gender: "",
    workLink: "",
    experience: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      ...form,
      status: "applied",
    };

    addApplication(newApplication);
    alert("Application submitted!");
    navigate("/dashboard");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Apply for {job?.title}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            placeholder="Name"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="number"
            placeholder="Age"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <input
            required
            placeholder="Phone"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select
            required
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <input
            required
            type="url"
            placeholder="GitHub / Portfolio Link"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, workLink: e.target.value })}
          />
          <select
            required
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          >
            <option value="">Select Experience</option>
            <option>1 Month</option>
            <option>3 Months</option>
            <option>6 Months</option>
            <option>1 Year</option>
            <option>2 Years</option>
            <option>3 Years</option>
            <option>5+ Years</option>
          </select>
          <button className="bg-purple-600 text-white py-2 rounded-lg">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}