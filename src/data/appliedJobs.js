const APPLIED_KEY = "appliedJobs";

// Get applied jobs for current user
export const getAppliedJobs = (userEmail) => {
  const data = localStorage.getItem(APPLIED_KEY);
  let appliedJobs = data ? JSON.parse(data) : [];
  
  // Ensure it's an array
  if (!Array.isArray(appliedJobs)) {
    appliedJobs = [];
    localStorage.setItem(APPLIED_KEY, JSON.stringify(appliedJobs));
  }
  
  // Filter for current user if email provided
  if (userEmail) {
    return appliedJobs.filter(job => job.appliedBy === userEmail);
  }
  
  return appliedJobs;
};

// Save applied jobs
const saveAppliedJobs = (jobs) => {
  localStorage.setItem(APPLIED_KEY, JSON.stringify(jobs));
};

// Apply to job
export const applyJob = (job, userEmail) => {
  const jobs = getAppliedJobs();
  
  // prevent duplicate apply
  const alreadyApplied = jobs.find((j) => j.id === job.id && j.appliedBy === userEmail);
  if (alreadyApplied) return false;
  
  jobs.push({
    ...job,
    appliedBy: userEmail,
    appliedAt: new Date().toISOString(),
  });
  
  saveAppliedJobs(jobs);
  return true;
};