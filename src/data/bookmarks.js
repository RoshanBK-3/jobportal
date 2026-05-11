import { supabase } from '../supabaseClient';

// Get bookmarks from Supabase
export const getBookmarks = async (userEmail) => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_email', userEmail);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error loading bookmarks:", error);
    return [];
  }
};

// Toggle bookmark in Supabase
export const toggleBookmark = async (job, userEmail) => {
  try {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('job_id', job.id)
      .eq('user_email', userEmail);
    
    if (existing && existing.length > 0) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing[0].id);
      return false;
    } else {
      await supabase
        .from('bookmarks')
        .insert([{
          user_email: userEmail,
          job_id: job.id,
          created_at: new Date().toISOString()
        }]);
      return true;
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return false;
  }
};

// Check if bookmarked
export const isBookmarked = async (jobId, userEmail) => {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_email', userEmail);
    
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    return false;
  }
};

export const getBookmarkedJobs = async (userEmail) => {
  return await getBookmarks(userEmail);
};