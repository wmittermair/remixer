import React, { useState } from 'react';
import { FaDatabase, FaTwitter } from 'react-icons/fa';
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
  const [isSavedTweetsOpen, setIsSavedTweetsOpen] = useState(false);

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
  };

  const handleTweetClick = (tweet: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, '_blank');
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
                    onClick={() => setIsSavedTweetsOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600"
                  >
                    <FaDatabase /> Gespeicherte Tweets
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
                      <p className="mb-3">{tweet}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTweetClick(tweet)}
                          className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-indigo-600"
                        >
                          <FaTwitter /> Twittern
                        </button>
                        <button
                          onClick={() => handleSaveTweet(tweet)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded hover:from-green-600 hover:to-emerald-600"
                        >
                          Speichern
                        </button>
                      </div>
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
      />
    </div>
  );
}

export default App;
