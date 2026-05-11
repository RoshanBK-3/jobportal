import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { isLoggedIn, getCurrentUser } from "../utils/auth";

const APPLIED_KEY = "appliedJobs";

// Clean old/invalid applied jobs - NEVER touches users_db
const cleanAppliedJobs = () => {
  try {
    let appliedJobs = JSON.parse(localStorage.getItem(APPLIED_KEY)) || [];

    // Ensure it's an array
    if (!Array.isArray(appliedJobs)) {
      appliedJobs = [];
      localStorage.setItem(APPLIED_KEY, JSON.stringify(appliedJobs));
      return [];
    }

    // Remove any invalid entries (jobs without required fields)
    const validJobs = appliedJobs.filter(
      (job) => job && job.id && job.appliedBy,
    );

    // Limit to last 100 applications to prevent storage issues
    const limitedJobs = validJobs.slice(-100);

    if (
      validJobs.length !== appliedJobs.length ||
      limitedJobs.length !== validJobs.length
    ) {
      localStorage.setItem(APPLIED_KEY, JSON.stringify(limitedJobs));
      return limitedJobs;
    }

    return validJobs;
  } catch (error) {
    console.error("Error cleaning applied jobs:", error);
    // ONLY reset appliedJobs, NEVER touch users_db
    localStorage.setItem(APPLIED_KEY, JSON.stringify([]));
    return [];
  }
};

// Save applied job with minimal data
const saveAppliedJob = (userEmail, job) => {
  try {
    let appliedJobs = cleanAppliedJobs();

    // Check if already applied
    const alreadyApplied = appliedJobs.some(
      (j) => j.id === job.id && j.appliedBy === userEmail,
    );

    if (alreadyApplied) {
      return false;
    }

    // Get current user's basic info
    const currentUser = getCurrentUser();

    // Create minimal application data (no heavy base64 data)
    const newApplication = {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      skills: job.skills || [],
      description: job.description ? job.description.substring(0, 500) : "", // Limit description length
      appliedBy: userEmail,
      appliedAt: new Date().toISOString(),
      applicantName: currentUser?.name || userEmail.split("@")[0],
      hasProfilePic: !!currentUser?.profilePic,
      hasCV: !!currentUser?.cv,
    };

    appliedJobs.push(newApplication);

    // Keep only last 100 applications
    if (appliedJobs.length > 100) {
      appliedJobs = appliedJobs.slice(-100);
    }

    const serialized = JSON.stringify(appliedJobs);

    // Check storage size (limit to 3MB)
    if (serialized.length > 3 * 1024 * 1024) {
      // Remove oldest 50 applications and try again
      const reducedJobs = appliedJobs.slice(-50);
      const reducedSerialized = JSON.stringify(reducedJobs);

      if (reducedSerialized.length < 3 * 1024 * 1024) {
        localStorage.setItem(APPLIED_KEY, reducedSerialized);
        return true;
      } else {
        alert(
          "Storage limit reached. Please clear some old applications from your dashboard.",
        );
        return false;
      }
    }

    localStorage.setItem(APPLIED_KEY, serialized);
    return true;
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      alert("Storage is full. Please clear your browser data for this site.");
      // Only reset appliedJobs
      localStorage.setItem(APPLIED_KEY, JSON.stringify([]));
      // Try saving again with just this application
      try {
        const newApplication = {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          skills: job.skills || [],
          appliedBy: userEmail,
          appliedAt: new Date().toISOString(),
        };
        localStorage.setItem(APPLIED_KEY, JSON.stringify([newApplication]));
        return true;
      } catch {
        return false;
      }
    }
    console.error("Error saving application:", error);
    alert("Failed to apply. Please try again.");
    return false;
  }
};

// Check if user already applied
const hasApplied = (userEmail, jobId) => {
  try {
    const appliedJobs = cleanAppliedJobs();
    return appliedJobs.some((j) => j.id === jobId && j.appliedBy === userEmail);
  } catch (error) {
    console.error("Error checking application status:", error);
    return false;
  }
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasAppliedToJob, setHasAppliedToJob] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load job data
  useEffect(() => {
    try {
      const jobs = getJobs();
      const foundJob = jobs.find((j) => j.id === Number(id));
      setJob(foundJob);
    } catch (error) {
      console.error("Error loading job:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Check application status when component loads
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user && job) {
      const applied = hasApplied(user.email, job.id);
      setHasAppliedToJob(applied);
    }
  }, [job]);

  const handleApply = async () => {
    if (isApplying) return;

    if (!isLoggedIn()) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const user = getCurrentUser();

    if (!user?.profilePic) {
      alert("Please upload a profile picture before applying");
      navigate("/dashboard");
      return;
    }

    if (!user?.cv) {
      alert("Please upload your CV/Resume before applying");
      navigate("/dashboard");
      return;
    }

    setIsApplying(true);

    try {
      const applied = saveAppliedJob(user.email, job);

      if (applied) {
        setHasAppliedToJob(true);
        alert(
          "Applied Successfully, you'll be notified through e-mail about selection",
        );
      } else {
        alert("You have already applied for this job!");
      }
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setIsApplying(false);
    }
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
        <p className="text-center mt-10">Job not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 bg-white mt-10 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

        <p className="text-gray-500 mb-4">
          {job.company} • {job.location}
        </p>

        <div className="flex gap-2 mb-4 flex-wrap">
          {job.skills &&
            job.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs"
              >
                {skill}
              </span>
            ))}
        </div>

        <p className="text-gray-700 mb-6">{job.description}</p>

        <button
          onClick={handleApply}
          disabled={hasAppliedToJob || isApplying}
          className={`px-6 py-2 rounded-lg transition ${
            hasAppliedToJob
              ? "bg-green-500 text-white cursor-not-allowed"
              : isApplying
                ? "bg-gray-400 text-white cursor-wait"
                : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {hasAppliedToJob
            ? "✅ Applied"
            : isApplying
              ? "Applying..."
              : "Apply Now"}
        </button>
      </div>
    </div>
  );
}
