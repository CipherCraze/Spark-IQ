import { useState } from 'react';
import { LanguageIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const FeedbackTranslation = ({ 
  active, 
  originalText, 
  translatedFeedback, 
  onTranslate 
}) => {
  const [languages] = useState([
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  return (
    <div className={`bg-gray-800/50 rounded-2xl p-6 border transition-all ${
      active ? 'border-yellow-400/30' : 'border-gray-700/50 opacity-70'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <LanguageIcon className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Feedback Translation</h3>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Select Language</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {translatedFeedback ? (
        <>
          <div className="prose prose-invert max-w-none mb-2 bg-gray-700/30 p-3 rounded-lg">
            <p className="text-gray-300 text-sm">{translatedFeedback.text}</p>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-yellow-400">
              {translatedFeedback.language} ({translatedFeedback.accuracy}% accuracy)
            </span>
            <button 
              onClick={onTranslate}
              className="text-gray-400 hover:text-yellow-300 flex items-center gap-1"
            >
              <ArrowPathIcon className="w-3 h-3" />
              Retranslate
            </button>
          </div>
        </>
      ) : (
        <div className="prose prose-invert max-w-none mb-4 bg-gray-700/30 p-3 rounded-lg">
          <p className="text-gray-400 text-sm">{originalText.substring(0, 200)}...</p>
        </div>
      )}
      
      <button
        onClick={onTranslate}
        disabled={active && translatedFeedback}
        className={`mt-4 w-full py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
          active && !translatedFeedback
            ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
            : 'bg-gray-700/50 text-gray-400'
        }`}
      >
        {translatedFeedback ? 'Translation Complete' : 'Translate Feedback'}
      </button>
    </div>
  );
};