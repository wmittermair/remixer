import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tweet-Typen
export interface Tweet {
  id: string;
  content: string;
  created_at: string;
}

// Tweet-Funktionen
export const saveTweet = async (content: string): Promise<Tweet | null> => {
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ content }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchTweets = async (): Promise<Tweet[]> => {
  const { data, error } = await supabase
    .from('tweets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteTweet = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tweets')
    .delete()
    .match({ id });

  if (error) throw error;
};

export const updateTweet = async (id: string, content: string): Promise<Tweet | null> => {
  const { data, error } = await supabase
    .from('tweets')
    .update({ content })
    .match({ id })
    .select()
    .single();

  if (error) throw error;
  return data;
}; 