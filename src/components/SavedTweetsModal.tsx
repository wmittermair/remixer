import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tweet } from '../lib/supabase';
import { FaTwitter, FaEdit, FaTrash, FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

interface SavedTweetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweets: Tweet[];
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (id: string, content: string) => Promise<boolean>;
  onTweet: (content: string) => void;
  isLoading?: boolean;
  error?: string | null;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
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
  isCollapsed = false,
  onCollapsedChange
}) => {
  const [editingTweet, setEditingTweet] = useState<{ id: string; content: string } | null>(null);
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);

  useEffect(() => {
    setLocalCollapsed(isCollapsed);
  }, [isCollapsed]);

  const handleCollapsedChange = (collapsed: boolean) => {
    setLocalCollapsed(collapsed);
    onCollapsedChange?.(collapsed);
  };

  const handleEdit = async (id: string, content: string) => {
    if (await onEdit(id, content)) {
      setEditingTweet(null);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? (localCollapsed ? '100%' : 0) : '100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-0 top-0 h-full flex"
    >
      <motion.button
        initial={false}
        animate={{ x: localCollapsed ? 0 : 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={() => handleCollapsedChange(!localCollapsed)}
        className="h-24 -ml-8 flex items-center bg-blue-500 hover:bg-blue-600 text-white px-2 rounded-l-lg shadow-lg self-center"
      >
        {localCollapsed ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
      </motion.button>
      
      <div className="h-full w-96 bg-white shadow-xl">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center space-x-4">
          <h2 className="text-xl font-bold text-blue-600">Gespeicherte Tweets</h2>
          <button 
            onClick={() => handleCollapsedChange(true)}
            className="flex items-center justify-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Einklappen"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tweets.length > 0 ? (
              <div className="space-y-6">
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    {editingTweet?.id === tweet.id ? (
                      <div className="p-6 space-y-4">
                        <textarea
                          value={editingTweet.content}
                          onChange={(e) => setEditingTweet({ ...editingTweet, content: e.target.value })}
                          className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 min-h-[120px]"
                          placeholder="Tweet bearbeiten..."
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(tweet.id, editingTweet.content)}
                            className="bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex-1 flex items-center justify-center gap-2"
                          >
                            Speichern
                          </button>
                          <button
                            onClick={() => setEditingTweet(null)}
                            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex-1 flex items-center justify-center gap-2"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <p className="text-gray-800 text-base leading-relaxed mb-6">{tweet.content}</p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => onTweet(tweet.content)}
                            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex-1"
                          >
                            <FaTwitter className="text-lg" /> Twittern
                          </button>
                          <button
                            onClick={() => setEditingTweet({ id: tweet.id, content: tweet.content })}
                            className="flex items-center justify-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                            aria-label="Bearbeiten"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => onDelete(tweet.id)}
                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-lg">Keine gespeicherten Tweets vorhanden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SavedTweetsModal; 