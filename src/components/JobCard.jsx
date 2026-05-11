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
      className="relative bg-white rounded-xl shadow-sm p-5 hover:shadow-lg transition cursor-pointer"
    >
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

      <div className="pr-8">
        <h3 className="text-lg font-semibold text-gray-800 pr-4">{job.title}</h3>
        <p className="text-sm text-gray-500">{job.company} • {job.location}</p>

        <div className="flex gap-2 mt-3 flex-wrap">
          {job.skills?.map((skill, index) => (
            <span key={index} className="bg-purple-100 text-xs px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-1">
          Posted on {formatDate(job.createdAt || job.postedDate)}
        </p>

        {!isCompany ? (
          hasAppliedToJob ? (
            <button disabled className="mt-5 w-full bg-green-500 text-white py-2 rounded-lg cursor-not-allowed">
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
              className="flex-1 bg-gray-400 text-green-400 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-gray-400 text-red-500 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}