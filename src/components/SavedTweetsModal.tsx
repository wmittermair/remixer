import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tweet } from '../lib/supabase';
import { FaTwitter, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

interface SavedTweetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweets: Tweet[];
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (id: string, content: string) => Promise<boolean>;
  onTweet: (content: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const SavedTweetsModal: React.FC<SavedTweetsModalProps> = ({
  isOpen,
  onClose,
  tweets,
  onDelete,
  onEdit,
  onTweet,
  isLoading = false,
  error = null,
}) => {
  const [editingTweet, setEditingTweet] = useState<{ id: string; content: string } | null>(null);

  const handleEdit = async (id: string, content: string) => {
    if (await onEdit(id, content)) {
      setEditingTweet(null);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto z-50"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gespeicherte Tweets</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Schließen"
        >
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="border p-3 rounded shadow-sm hover:shadow-md transition-shadow">
              {editingTweet?.id === tweet.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingTweet.content}
                    onChange={(e) => setEditingTweet({ ...editingTweet, content: e.target.value })}
                    className="w-full p-2 border rounded resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tweet.id, editingTweet.content)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingTweet(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2">{tweet.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTweet(tweet.content)}
                      className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      <FaTwitter /> Twittern
                    </button>
                    <button
                      onClick={() => setEditingTweet({ id: tweet.id, content: tweet.content })}
                      className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      <FaEdit /> Bearbeiten
                    </button>
                    <button
                      onClick={() => onDelete(tweet.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      <FaTrash /> Löschen
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {tweets.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Keine gespeicherten Tweets vorhanden
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SavedTweetsModal; 