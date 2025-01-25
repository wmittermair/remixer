import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveTweet = async (content: string) => {
  const { data, error } = await supabase
    .from('tweets')
    .insert([{ content }]);
  
  if (error) throw error;
  return data;
};

export const fetchTweets = async () => {
  const { data, error } = await supabase
    .from('tweets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const deleteTweet = async (id: string) => {
  const { error } = await supabase
    .from('tweets')
    .delete()
    .match({ id });
  
  if (error) throw error;
};

export const updateTweet = async (id: string, content: string) => {
  const { error } = await supabase
    .from('tweets')
    .update({ content })
    .match({ id });
  
  if (error) throw error;
}; 