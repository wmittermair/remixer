import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tweet } from '../lib/supabase';
import { FaTwitter, FaEdit, FaTrash, FaTimes, FaChevronRight, FaChevronLeft, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [tweetsPerPage, setTweetsPerPage] = useState(3); // Reduziert auf 3 Tweets pro Seite

  useEffect(() => {
    setLocalCollapsed(isCollapsed);
  }, [isCollapsed]);

  // Berechne die Höhe des sichtbaren Bereichs und passe tweetsPerPage an
  useEffect(() => {
    const updateTweetsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 64; // Header
      const paginationHeight = 72; // Pagination
      const tweetHeight = 200; // Einzelner Tweet
      const tweetMargin = 16; // Margin zwischen Tweets
      const containerPadding = 32; // Container padding (oben + unten)
      const safetyMargin = 20; // Zusätzlicher Sicherheitsabstand
      
      // Berechne die tatsächlich verfügbare Höhe
      const availableHeight = viewportHeight - headerHeight - paginationHeight - containerPadding - safetyMargin;
      
      // Berechne wie viele komplette Tweet-Boxen (inkl. Margin) in den verfügbaren Platz passen
      const spacePerTweet = tweetHeight + tweetMargin;
      const calculatedTweetsPerPage = Math.floor(availableHeight / spacePerTweet);
      
      // Setze mindestens 1 Tweet und maximal so viele wie KOMPLETT reinpassen
      setTweetsPerPage(Math.max(1, calculatedTweetsPerPage));
    };

    // Initial ausführen und bei Resize aktualisieren
    updateTweetsPerPage();
    window.addEventListener('resize', updateTweetsPerPage);
    return () => window.removeEventListener('resize', updateTweetsPerPage);
  }, []);

  useEffect(() => {
    // Setze die Seite auf 1 zurück, wenn sich die Gesamtzahl der Tweets ändert
    setCurrentPage(1);
  }, [tweets.length]);

  // Berechne die aktuelle Seite von Tweets
  const currentTweets = useMemo(() => {
    const indexOfLastTweet = currentPage * tweetsPerPage;
    const indexOfFirstTweet = indexOfLastTweet - tweetsPerPage;
    return tweets.slice(indexOfFirstTweet, indexOfLastTweet);
  }, [tweets, currentPage, tweetsPerPage]);

  const totalPages = Math.ceil(tweets.length / tweetsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
        className="h-24 -ml-8 flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 rounded-l-lg shadow-lg self-center hover:from-blue-600 hover:to-indigo-600"
      >
        {localCollapsed ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
      </motion.button>
      
      <div className="h-full w-96 bg-white shadow-xl flex flex-col">
        <div className="bg-white border-b p-4 flex justify-between items-center space-x-4">
          <h2 className="text-xl font-bold text-blue-600">Gespeicherte Tweets</h2>
          <button 
            onClick={() => handleCollapsedChange(true)}
            className="flex items-center justify-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Einklappen"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
          <div className="flex-1 p-4 overflow-y-hidden">
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
              <div className="space-y-4 pb-4">
                {currentTweets.map((tweet, index) => (
                  <div 
                    key={tweet.id} 
                    className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                      index !== currentTweets.length - 1 ? 'mb-4' : ''
                    }`}
                  >
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
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 flex-1"
                          >
                            Speichern
                          </button>
                          <button
                            onClick={() => setEditingTweet(null)}
                            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex-1"
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
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 flex-1"
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
                            className="flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 text-white p-2.5 rounded-lg hover:from-red-600 hover:to-rose-600 transition-colors"
                            aria-label="Löschen"
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

          {tweets.length > 0 && (
            <div className="border-t bg-white p-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Vorherige Seite"
                >
                  <FaAngleLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Seite {currentPage} von {Math.max(1, totalPages)}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages || totalPages === 0
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Nächste Seite"
                >
                  <FaAngleRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default SavedTweetsModal; 