import { useState, useEffect } from 'react';
import { Tweet, fetchTweets, saveTweet, deleteTweet, updateTweet } from '../lib/supabase';

export const useTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTweets = async () => {
    try {
      setLoading(true);
      const data = await fetchTweets();
      setTweets(data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Tweets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTweet = async (content: string) => {
    try {
      const newTweet = await saveTweet(content);
      if (newTweet) {
        setTweets(prev => [newTweet, ...prev]);
      }
      return true;
    } catch (err) {
      setError('Fehler beim Speichern des Tweets');
      console.error(err);
      return false;
    }
  };

  const handleDeleteTweet = async (id: string) => {
    try {
      await deleteTweet(id);
      setTweets(prev => prev.filter(tweet => tweet.id !== id));
      return true;
    } catch (err) {
      setError('Fehler beim Löschen des Tweets');
      console.error(err);
      return false;
    }
  };

  const handleUpdateTweet = async (id: string, content: string) => {
    try {
      const updatedTweet = await updateTweet(id, content);
      if (updatedTweet) {
        setTweets(prev => prev.map(tweet => 
          tweet.id === id ? updatedTweet : tweet
        ));
      }
      return true;
    } catch (err) {
      setError('Fehler beim Aktualisieren des Tweets');
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    loadTweets();
  }, []);

  return {
    tweets,
    loading,
    error,
    saveTweet: handleSaveTweet,
    deleteTweet: handleDeleteTweet,
    updateTweet: handleUpdateTweet,
    refreshTweets: loadTweets
  };
}; 