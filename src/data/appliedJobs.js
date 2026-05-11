import { supabase } from '../supabaseClient';

// Get applied jobs from Supabase
export const getAppliedJobs = async (userEmail) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('applied_by', userEmail)
      .order('applied_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error loading applications:", error);
    return [];
  }
};

// Save applied job to Supabase
export const applyJob = async (job, userEmail) => {
  try {
    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', job.id)
      .eq('applied_by', userEmail);
    
    if (existing && existing.length > 0) {
      return false;
    }
    
    // Save new application
    const { error } = await supabase
      .from('applications')
      .insert([{
        job_id: job.id,
        job_title: job.title,
        job_company: job.company,
        job_location: job.location,
        applied_by: userEmail,
        applied_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving application:", error);
    return false;
  }
};