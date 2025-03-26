import { useState, useEffect } from 'react';
import { SparklesIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const WritingAssistant = ({ 
  active, 
  documentText, 
  onTextChange, 
  activeSentence,
  onSentenceHover 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock AI analysis function
  const analyzeText = (text) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockSuggestions = [];
      
      // Add suggestions based on text content
      if (text.length > 0) {
        if (text.toLowerCase().includes('could')) {
          mockSuggestions.push({
            id: 1,
            text: "Consider using 'might' or 'may' instead of 'could' for more academic tone",
            position: text.toLowerCase().indexOf('could'),
            category: 'tone',
            severity: 'medium'
          });
        }
        
        if (text.split('.').length < 3 && text.length > 100) {
          mockSuggestions.push({
            id: 2,
            text: "Long paragraph detected - consider breaking into smaller paragraphs for readability",
            position: 50,
            category: 'structure',
            severity: 'high'
          });
        }
        
        if (text.includes('!')) {
          mockSuggestions.push({
            id: 3,
            text: "Avoid exclamation points in academic writing",
            position: text.indexOf('!'),
            category: 'style',
            severity: 'high'
          });
        }
      }
      
      setSuggestions(mockSuggestions);
      setIsAnalyzing(false);
    }, 1500);
  };

  useEffect(() => {
    if (active && documentText) {
      analyzeText(documentText);
    } else {
      setSuggestions([]);
    }
  }, [active, documentText]);

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.category === 'tone' && suggestion.text.includes('could')) {
      const newText = documentText.replace(/could/gi, 'might');
      onTextChange(newText);
    }
  };

  const dismissSuggestion = (id, e) => {
    e.stopPropagation();
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className={`bg-gray-800/50 rounded-2xl p-6 border transition-all ${
      active ? 'border-purple-400/30' : 'border-gray-700/50 opacity-70'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <SparklesIcon className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Writing Assistant</h3>
        <span className={`text-xs px-2 py-1 rounded-full ml-auto ${
          active ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'
        }`}>
          {active ? 'ACTIVE' : 'PAUSED'}
        </span>
      </div>
      
      <div className="relative">
        <textarea
          value={documentText}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full h-40 bg-gray-700/30 rounded-lg p-3 text-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Paste your text for real-time feedback..."
          onMouseUp={() => {
            const selection = window.getSelection().toString();
            if (selection) {
              onSentenceHover(selection);
            }
          }}
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
            <div className="animate-pulse text-purple-400 text-sm">
              Analyzing your writing...
            </div>
          </div>
        )}
      </div>
      
      {active && suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Suggestions ({suggestions.length})</h4>
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-all ${
                suggestion.severity === 'high' 
                  ? 'bg-red-500/10 hover:bg-red-500/20' 
                  : 'bg-blue-500/10 hover:bg-blue-500/20'
              }`}
            >
              <div className={`p-1 rounded-full ${
                suggestion.severity === 'high' 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                <LightBulbIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-200">{suggestion.text}</div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {suggestion.category} • {suggestion.severity} priority
                </div>
              </div>
              <button 
                onClick={(e) => dismissSuggestion(suggestion.id, e)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {active && suggestions.length === 0 && !isAnalyzing && (
        <div className="text-center py-4 text-gray-500 text-sm">
          {documentText ? 'No suggestions found - great job!' : 'Enter text to get AI suggestions'}
        </div>
      )}
    </div>
  );
};