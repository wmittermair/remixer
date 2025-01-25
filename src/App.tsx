import React, { useState } from 'react';
import { FaDatabase, FaTwitter, FaEdit } from 'react-icons/fa';
import SavedTweetsModal from './components/SavedTweetsModal';
import { useTweets } from './hooks/useTweets';
import OpenAI from 'openai';
import './App.css';

// OpenAI Client initialisieren
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Beim ersten Laden prüfen, ob der User bereits eingeloggt ist
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedTweets, setGeneratedTweets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavedTweetsOpen, setIsSavedTweetsOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [editingTweetIndex, setEditingTweetIndex] = useState<number | null>(null);
  const [editingTweetContent, setEditingTweetContent] = useState<string>('');

  // Tweets-Hook integrieren
  const { 
    tweets, 
    loading: tweetsLoading, 
    error: tweetsError,
    saveTweet,
    deleteTweet,
    updateTweet
  } = useTweets();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.REACT_APP_PASSWORD;
    
    if (!correctPassword) {
      setPasswordError('Systemfehler: Passwort nicht konfiguriert');
      return;
    }
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setPasswordError(null);
    } else {
      setPasswordError('Falsches Passwort');
    }
  };

  const handleGenerateTweets = async () => {
    if (!prompt.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Du bist ein Social Media Experte, der sich auf Beauty und Kosmetik spezialisiert hat. Erstelle 5 verschiedene Versionen eines Twitter-Beitrags (max. 280 Zeichen). Jede Version soll einen einzigartigen Stil haben, aber alle sollen die Beauty-Community ansprechen. Formatiere die Antwort als nummerierte Liste von 1-5. Jede Version soll in einer neuen Zeile beginnen. Verwende eine leicht verständliche Sprache und füge passende Emojis hinzu. Zielgruppe sind 30-jährige Beauty-Enthusiasten."
          },
          {
            role: "user",
            content: `Bitte schreibe den folgenden Text als 5 verschiedene, aufregende Twitter-Beiträge um, die die Beauty-Community begeistern werden: ${prompt}`
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      });

      const remixedText = completion.choices[0]?.message?.content;
      if (remixedText) {
        const tweets = remixedText
          .split(/\d+\.\s+/)
          .filter(tweet => tweet.trim().length > 0);
        setGeneratedTweets(tweets);
      }
    } catch (err) {
      console.error('Fehler bei der Tweet-Generierung:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTweet = async (content: string) => {
    await saveTweet(content);
    setIsSavedTweetsOpen(true);
    setIsSidebarCollapsed(false);
  };

  const handleTweetClick = (tweet: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleEditSave = (index: number) => {
    const newTweets = [...generatedTweets];
    newTweets[index] = editingTweetContent;
    setGeneratedTweets(newTweets);
    setEditingTweetIndex(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h1 className="text-2xl font-bold text-center mb-8">Zugang zum Beauty Tweet Remixer</h1>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Passwort eingeben"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {passwordError && (
                      <div className="text-red-500 text-sm">{passwordError}</div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                    >
                      Einloggen
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-4xl sm:mx-auto w-full px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-3xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Beauty Tweet Remixer
                  </h1>
                  <button
                    onClick={() => {
                      if (!isSavedTweetsOpen) {
                        setIsSavedTweetsOpen(true);
                        setIsSidebarCollapsed(false);
                      } else {
                        setIsSidebarCollapsed(!isSidebarCollapsed);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all group relative
                      ${tweets.length > 0 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                    title={tweets.length === 0 ? "Noch keine Tweets gespeichert" : ""}
                  >
                    <FaDatabase className={tweets.length === 0 ? 'opacity-50' : ''} />
                    <span>
                      {tweets.length} {tweets.length === 1 ? 'Gespeicherter Tweet' : 'Gespeicherte Tweets'}
                    </span>
                    {tweets.length === 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Noch keine Tweets gespeichert
                      </div>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Beschreibe, worüber du twittern möchtest..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <button
                    onClick={handleGenerateTweets}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg mt-4 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generiere Tweets...
                      </div>
                    ) : (
                      'Tweets generieren'
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedTweets.map((tweet, index) => (
                    <div key={index} className="border p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      {editingTweetIndex === index ? (
                        <div className="space-y-4">
                          <textarea
                            value={editingTweetContent}
                            onChange={(e) => setEditingTweetContent(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 min-h-[120px]"
                            placeholder="Tweet bearbeiten..."
                          />
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleEditSave(index)}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 flex-1"
                            >
                              Speichern
                            </button>
                            <button
                              onClick={() => setEditingTweetIndex(null)}
                              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 flex-1"
                            >
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mb-3">{tweet}</p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleTweetClick(tweet)}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 flex-1"
                            >
                              <FaTwitter className="text-lg" /> Twittern
                            </button>
                            <button
                              onClick={() => handleSaveTweet(tweet)}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 flex-1"
                            >
                              <FaDatabase className="text-lg" /> Speichern
                            </button>
                            <button
                              onClick={() => {
                                setEditingTweetIndex(index);
                                setEditingTweetContent(tweet);
                              }}
                              className="flex items-center justify-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Bearbeiten"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SavedTweetsModal
        isOpen={isSavedTweetsOpen}
        onClose={() => setIsSavedTweetsOpen(false)}
        tweets={tweets}
        onDelete={deleteTweet}
        onEdit={updateTweet}
        onTweet={handleTweetClick}
        isLoading={tweetsLoading}
        error={tweetsError}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
    </div>
  );
}

export default App;
