import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "../data/bookmarks";
import { isLoggedIn, getCurrentUser } from "../utils/auth";
import { deleteJob } from "../data/jobs";

export function JobCard({ job }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  const user = getCurrentUser();
  const isCompany = user?.role === "company";

  // Check if user has applied to this job
  const hasApplied = () => {
    if (isCompany) return false;
    let appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
    if (!Array.isArray(appliedJobs)) appliedJobs = [];
    return appliedJobs.some(
      (j) => j.id === job.id && j.appliedBy === user?.email,
    );
  };

  useEffect(() => {
    setBookmarked(isBookmarked(job.id));
  }, [job.id]);

  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBookmark = (e) => {
    e.stopPropagation();

    if (!isLoggedIn()) {
      alert("Please login to bookmark jobs");
      navigate("/login");
      return;
    }

    toggleBookmark(job);
    setBookmarked(!bookmarked);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteJob(job.id);
      window.location.reload();
    }
  };

  return (
    <div
      onClick={() => !isCompany && navigate(`/job/${job.id}`)}
      className="relative bg-white rounded-xl shadow-sm p-5 hover:shadow-lg transition cursor-pointer"
    >
      {/* BOOKMARK BUTTON - Fixed positioning */}
      {!isCompany && (
        <button
          onClick={handleBookmark}
          className={`absolute top-3 right-3 text-2xl z-10 ${
            bookmarked ? "text-red-500" : "text-gray-400"
          } hover:scale-110 transition`}
          style={{ background: "transparent", lineHeight: 1 }}
        >
          {bookmarked ? "❤️" : "🤍"}
        </button>
      )}

      {/* CONTENT - Added padding-right to prevent overlap with bookmark */}
      <div className="pr-8">
        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-800 pr-4">
          {job.title}
        </h3>

        {/* COMPANY + LOCATION */}
        <p className="text-sm text-gray-500">
          {job.company} • {job.location}
        </p>

        {/* SKILLS */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {job.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-purple-100 text-xs px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* POSTED DATE */}
        <p className="text-xs text-gray-400 mt-1">
          Posted on {formatDate(job.createdAt || job.postedDate)}
        </p>

        {/* BUTTON AREA */}
        {!isCompany ? (
          hasApplied() ? (
            <button
              disabled
              className="mt-5 w-full bg-green-500 text-white py-2 rounded-lg cursor-not-allowed"
            >
              ✅ Applied
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/job/${job.id}`);
              }}
              className="mt-5 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
            >
              View Details
            </button>
          )
        ) : (
          <div className="mt-5 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-job/${job.id}`);
              }}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
