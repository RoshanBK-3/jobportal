import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "../data/bookmarks";
import { isLoggedIn, getCurrentUser } from "../utils/auth";
import { deleteJob } from "../data/jobs";
import { supabase } from "../supabaseClient";

export function JobCard({ job }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const user = getCurrentUser();
  const isCompany = user?.role === "company";
  const [hasAppliedToJob, setHasAppliedToJob] = useState(false);

  // Check if user has applied to this job
  useEffect(() => {
    const checkApplied = async () => {
      if (isCompany || !user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', job.id)
          .eq('applied_by', user.email);
        
        if (!error && data && data.length > 0) {
          setHasAppliedToJob(true);
        }
      } catch (error) {
        console.error("Error checking application:", error);
      }
    };
    
    checkApplied();
  }, [job.id, user?.email, isCompany]);

  useEffect(() => {
    const checkBookmark = async () => {
      if (user?.email) {
        const bookmarkedStatus = await isBookmarked(job.id, user.email);
        setBookmarked(bookmarkedStatus);
      }
    };
    checkBookmark();
  }, [job.id, user?.email]);

  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) {
      alert("Please login to bookmark jobs");
      navigate("/login");
      return;
    }
    const newStatus = await toggleBookmark(job, user.email);
    setBookmarked(newStatus);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this job?")) {
      await deleteJob(job.id);
      window.location.reload();
    }
  };

  return (
    <div
      onClick={() => !isCompany && navigate(`/job/${job.id}`)}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm -z-10"></div>
      
      <div className="bg-white rounded-2xl p-5 relative z-10">
        {/* Bookmark Button */}
        {!isCompany && (
          <button
            onClick={handleBookmark}
            className={`absolute top-4 right-4 text-2xl z-20 transition-all duration-200 hover:scale-110 ${
              bookmarked ? "text-red-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            {bookmarked ? "❤️" : "🤍"}
          </button>
        )}

        <div className="pr-8">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{job.title}</h3>
          
          {/* Company & Location */}
          <p className="text-sm text-gray-500 mb-2">
            🏢 {job.company} • 📍 {job.location}
          </p>

          {/* Skills */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {job.skills?.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-gradient-to-r from-purple-50 to-orange-50 text-purple-600 text-xs px-2.5 py-1 rounded-full">
                {skill}
              </span>
            ))}
            {job.skills?.length > 3 && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                +{job.skills.length - 3}
              </span>
            )}
          </div>

          {/* Posted Date */}
          <p className="text-xs text-gray-400 mt-3">
            📅 Posted on {formatDate(job.createdAt || job.postedDate)}
          </p>

          {/* Button Area */}
          {!isCompany ? (
            hasAppliedToJob ? (
              <button disabled className="mt-4 w-full bg-green-500 text-white py-2.5 rounded-xl font-medium cursor-not-allowed transition flex items-center justify-center gap-2">
                <span>✅</span> Applied
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/job/${job.id}`);
                }}
                className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200 flex items-center justify-center gap-2"
              >
                <span>🔍</span> View Details
              </button>
            )
          ) : (
            <div className="mt-4 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-job/${job.id}`);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}