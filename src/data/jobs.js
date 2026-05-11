import { supabase } from '../supabaseClient';

const getDefaultJobs = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      title: "Frontend Developer Intern",
      company: "ABC Tech",
      location: "Kathmandu",
      skills: ["React", "Tailwind"].join(','),
      description: "Work on modern frontend applications using React.",
      created_by: "admin@example.com",
      created_at: now.toISOString(),
    },
    {
      title: "Backend Developer Intern",
      company: "XYZ Solutions",
      location: "Pokhara",
      skills: ["Node.js", "MongoDB"].join(','),
      description: "Build APIs and handle server-side logic.",
      created_by: "admin@example.com",
      created_at: yesterday.toISOString(),
    },
    {
      title: "Full Stack Intern",
      company: "TechNepal",
      location: "Lalitpur",
      skills: ["React", "Node.js"].join(','),
      description: "Work on both frontend and backend systems.",
      created_by: "admin@example.com",
      created_at: twoDaysAgo.toISOString(),
    },
    {
      title: "UI Designer Senior",
      company: "Techmandu",
      location: "Syangja",
      skills: ["React", "Next.js"].join(','),
      description: "Work on frontend systems.",
      created_by: "admin@example.com",
      created_at: threeDaysAgo.toISOString(),
    },
    {
      title: "DevOps Intern",
      company: "CloudTech",
      location: "Kathmandu",
      skills: ["Docker", "AWS", "Jenkins"].join(','),
      description: "Learn and work on cloud infrastructure.",
      created_by: "admin@example.com",
      created_at: lastWeek.toISOString(),
    },
  ];
};

export const getJobs = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase error:", error);
      return [];
    }
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map(job => ({
        ...job,
        skills: job.skills ? job.skills.split(',') : [],
        createdAt: job.created_at,
        createdBy: job.created_by
      }));
    }
    
    const defaultJobs = getDefaultJobs();
    for (const job of defaultJobs) {
      await supabase.from('jobs').insert([job]);
    }
    
    const { data: newData } = await supabase.from('jobs').select('*');
    if (newData && Array.isArray(newData)) {
      return newData.map(job => ({
        ...job,
        skills: job.skills ? job.skills.split(',') : [],
        createdAt: job.created_at
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error getting jobs:", error);
    return [];
  }
};

export const addJob = async (job) => {
  try {
    const dbJob = {
      title: job.title,
      company: job.company,
      location: job.location,
      skills: job.skills ? job.skills.join(',') : '',
      description: job.description,
      created_by: job.createdBy,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([dbJob])
      .select();
    
    if (error) throw error;
    
    if (data && data[0]) {
      return {
        ...data[0],
        skills: data[0].skills ? data[0].skills.split(',') : [],
        createdAt: data[0].created_at
      };
    }
    return null;
  } catch (error) {
    console.error("Error adding job:", error);
    return null;
  }
};

export const deleteJob = async (id) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting job:", error);
    return false;
  }
};

export const updateJob = async (updatedJob) => {
  try {
    const dbJob = {
      title: updatedJob.title,
      company: updatedJob.company,
      location: updatedJob.location,
      skills: updatedJob.skills ? updatedJob.skills.join(',') : '',
      description: updatedJob.description
    };
    
    const { error } = await supabase
      .from('jobs')
      .update(dbJob)
      .eq('id', updatedJob.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating job:", error);
    return false;
  }
};