import Navbar from "../components/Navbar";
import { getJobs, deleteJob } from "../data/jobs";
import { getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function CompanyJobs() {
  const user = getUser();
  const navigate = useNavigate();

  const jobs = getJobs();

  // 🔥 ONLY COMPANY JOBS
  const myJobs = jobs.filter(
    (job) => job.createdBy === user.email
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        <h2 className="text-2xl font-bold mb-6">
          My Posted Jobs
        </h2>

        {myJobs.length === 0 ? (
          <p>No jobs posted yet</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {myJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-xl shadow"
              >
                <h3 className="font-semibold text-lg">
                  {job.title}
                </h3>

                <p className="text-gray-500">
                  {job.location}
                </p>

                <div className="flex gap-3 mt-3">

                  <button
                    onClick={() =>
                      navigate(`/edit-job/${job.id}`)
                    }
                    className="text-blue-500 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      deleteJob(job.id);
                      window.location.reload();
                    }}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}