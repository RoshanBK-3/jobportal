import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { isLoggedIn, getCurrentUser } from "../utils/auth";
import { supabase } from "../supabaseClient";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasAppliedToJob, setHasAppliedToJob] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [job, setJob] = useState(null);

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobs = await getJobs();
        
        if (!jobs || !Array.isArray(jobs)) {
          setJob(null);
          return;
        }
        
        const foundJob = jobs.find((j) => String(j.id) === String(id));
        setJob(foundJob || null);
      } catch (error) {
        console.error("Error loading job:", error);
        setJob(null);
      }
    };
    
    loadJob();
  }, [id]);

  // Check if user already applied
  useEffect(() => {
    const checkApplicationStatus = async () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      
      if (user && job) {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job.id)
            .eq('applied_by', user.email);
          
          if (!error && data && data.length > 0) {
            setHasAppliedToJob(true);
          } else {
            setHasAppliedToJob(false);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
          setHasAppliedToJob(false);
        }
      }
    };
    
    checkApplicationStatus();
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
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('applied_by', user.email);
      
      if (existing && existing.length > 0) {
        alert("You have already applied for this job!");
        setIsApplying(false);
        return;
      }
      
      const { error } = await supabase
        .from('applications')
        .insert([{
          job_id: job.id,
          job_title: job.title,
          job_company: job.company,
          job_location: job.location,
          applied_by: user.email,
          applied_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setHasAppliedToJob(true);
      alert("Applied Successfully! You'll be notified via email about selection.");
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-red-500 text-lg mb-4">Job not found</p>
            <button 
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition"
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-orange-100 mt-1">
              {job.company} • 📍 {job.location}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Skills */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>⚡</span> Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills && job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-purple-50 text-orange-600 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>📋</span> Job Description
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              disabled={hasAppliedToJob || isApplying}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                hasAppliedToJob
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : isApplying
                  ? "bg-gray-400 text-white cursor-wait"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-200"
              }`}
            >
              {hasAppliedToJob ? "✅ Applied Successfully" : isApplying ? "Applying..." : "Apply Now →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}