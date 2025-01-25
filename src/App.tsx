import React, { useState } from 'react';
import './App.css';
import OpenAI from 'openai';
import { FaTwitter } from 'react-icons/fa';

// OpenAI Error Type
interface OpenAIError extends Error {
  status?: number;
  type?: string;
}

// OpenAI Client initialisieren
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Nur für Entwicklungszwecke
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Beim ersten Laden prüfen, ob der User bereits eingeloggt ist
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [outputTexts, setOutputTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const maxTwitterLength = 280;

  const handlePasswordSubmit = (e: React.FormEvent) => {
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

  // Logout-Funktion hinzufügen
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(outputTexts.join('\n'));
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  const handleRemix = async () => {
    setError(null);
    
    if (!inputText.trim()) {
      setError('Bitte geben Sie einen Text ein, der remixed werden soll.');
      return;
    }

    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      setError('API Key ist nicht gesetzt!');
      return;
    }

    setIsLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Du bist ein Social Media Experte, der sich auf Beauty und Kosmetik spezialisiert hat. Erstelle 5 verschiedene Versionen eines Twitter-Beitrags (max. 280 Zeichen). Jede Version soll einen einzigartigen Stil haben, aber alle sollen die Beauty-Community ansprechen. Formatiere die Antwort als nummerierte Liste von 1-5. Jede Version soll in einer neuen Zeile beginnen. Verwende eine leicht verständliche Sprache und füge passende Emojis hinzu. Zielgruppe sind 30-jährige Beauty-Enthusiasten."
          },
          {
            role: "user",
            content: `Bitte schreibe den folgenden Text als 5 verschiedene, aufregende Twitter-Beiträge um, die die Beauty-Community begeistern werden: ${inputText}`
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
        setOutputTexts(tweets);
      } else {
        throw new Error('Keine Antwort von der API erhalten');
      }
    } catch (err) {
      console.error('Frontend Error:', err);
      setError('Ein Fehler ist aufgetreten: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
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
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between gap-2 mb-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Beauty Tweet Remixer
                  </h1>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Ausloggen
                  </button>
                  <div className="group relative">
                    <span className="text-2xl cursor-help hover:opacity-80 transition-opacity">ℹ️</span>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10">
                      Verwandle deine Beauty-Texte in perfekte Twitter-Posts mit maximal 280 Zeichen! Ideal für die Beauty-Community 💄✨
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 animate-shake" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="mb-4 relative">
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Fügen Sie hier Ihren Beauty-Text ein..."
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                    {charCount} Zeichen
                  </div>
                </div>

                <button
                  onClick={handleRemix}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 text-white rounded-lg transition-all transform hover:scale-[1.02] ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wird verarbeitet...
                    </div>
                  ) : 'Text Remixen ✨'}
                </button>

                {outputTexts.length > 0 && (
                  <div className="mt-6 fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Deine Beauty-Tweets:</h2>
                      <button
                        onClick={handleCopyClick}
                        className="text-sm px-3 py-1 text-purple-600 hover:text-purple-800 flex items-center gap-1 rounded-md hover:bg-purple-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Alle Kopieren
                      </button>
                    </div>
                    <div className="space-y-4">
                      {outputTexts.map((text, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-grow">
                              <div className="text-gray-700">{text}</div>
                            </div>
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm px-3 py-1 text-blue-400 hover:text-blue-600 flex items-center gap-1 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <FaTwitter className="w-4 h-4" />
                              Twittern
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
