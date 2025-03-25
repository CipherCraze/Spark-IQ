import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  SparklesIcon, 
  BookOpenIcon, 
  LightBulbIcon, 
  DocumentTextIcon, 
  AdjustmentsHorizontalIcon, 
  ClipboardDocumentIcon, 
  ArrowPathIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const AIGeneratedQuestions = () => {
  // State management
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Configuration options
  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice', icon: BookOpenIcon },
    { value: 'truefalse', label: 'True/False', icon: LightBulbIcon },
    { value: 'short', label: 'Short Answer', icon: DocumentTextIcon },
    { value: 'essay', label: 'Essay', icon: AdjustmentsHorizontalIcon },
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Beginner' },
    { value: 'medium', label: 'Intermediate' },
    { value: 'hard', label: 'Advanced' },
  ];

  // Generate questions using Gemini 2.0 Flash
  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Construct the prompt with specific instructions
      const prompt = `Generate ${numQuestions} ${difficulty}-level ${questionType} questions about "${topic}" in strict JSON format. Follow this exact structure:
{
  "questions": [
    {
      "text": "The actual question text here",
      ${questionType === 'mcq' ? `"options": ["Option 1", "Option 2", "Option 3", "Option 4"],` : ''}
      "answer": "The correct answer here",
      "explanation": "Explanation of the answer"
    }
  ]
}
Requirements:
- For MCQs: Provide exactly 4 options labeled A) to D)
- Clearly indicate the correct answer (include the letter for MCQs, e.g., "A) Option 1")
- Include a brief explanation
- Difficulty level: ${difficulty}
- Make questions clear and test real understanding`;

      // Call Gemini 2.0 Flash API
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            topP: 0.9
          }
        },
        {
          params: { key: GEMINI_API_KEY },
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000 // 15 second timeout
        }
      );

      // Process the response
      const result = response.data;
      if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response from AI');
      }

      try {
        const parsedData = JSON.parse(result.candidates[0].content.parts[0].text);
        let generatedQuestions = parsedData.questions || [];
        
        // Ensure proper formatting for MCQs
        if (questionType === 'mcq') {
          generatedQuestions = generatedQuestions.map(q => ({
            ...q,
            options: q.options || [],
            answer: q.answer.includes(')') ? q.answer : `${q.answer.match(/[A-D]/)?.[0] || 'A'}) ${q.answer}`
          }));
        }

        // Add metadata to questions
        const questionsWithMeta = generatedQuestions.map((q, i) => ({
          ...q,
          id: Date.now() + i,
          type: questionType,
          difficulty,
          topic,
          date: new Date().toISOString()
        }));

        setQuestions(questionsWithMeta);
        setHistory(prev => [...questionsWithMeta, ...prev.slice(0, 50)]); // Keep last 50 items
      } catch (parseError) {
        console.error('Parsing error:', parseError);
        setError('Failed to parse AI response. Please check your prompt and try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.response?.data?.error?.message || error.message || 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate a single question
  const regenerateQuestion = async (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    setIsLoading(true);
    try {
      const prompt = `Regenerate this ${question.type} question about ${question.topic} at ${question.difficulty} level in JSON format:
{
  "question": {
    "text": "...",
    ${question.type === 'mcq' ? `"options": ["...", "..."],` : ''}
    "answer": "...",
    "explanation": "..."
  }
}
Original question: ${question.text}`;
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        {
          params: { key: GEMINI_API_KEY },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = JSON.parse(response.data.candidates[0].content.parts[0].text);
      const newQuestion = result.question || {};
      
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                text: newQuestion.text || "New question", 
                answer: newQuestion.answer || "See generated response",
                options: newQuestion.options || q.options,
                explanation: newQuestion.explanation || q.explanation
              }
            : q
        )
      );
    } catch (error) {
      console.error('Regeneration error:', error);
      setError('Failed to regenerate question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy text to clipboard with feedback
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut handler
  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      generateQuestions();
    }
  };

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [topic, questionType, difficulty, numQuestions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            AI Question Generator
          </h1>
          <p className="text-gray-300">Powered by Gemini 2.0 Flash - Fast, accurate question generation</p>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="absolute right-0 top-0 px-4 py-2 bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-gray-600/50 flex items-center gap-2"
          >
            {showHistory ? (
              <>
                <XMarkIcon className="w-4 h-4" />
                Hide History
              </>
            ) : (
              <>
                <BookOpenIcon className="w-4 h-4" />
                Show History
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 rounded-lg text-red-200 flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error generating questions</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="bg-gray-800/70 rounded-xl p-4 mb-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">Generation History</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-700/50 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setTopic(item.topic);
                      setQuestionType(item.type);
                      setDifficulty(item.difficulty);
                      setQuestions([item]);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="text-purple-300 font-medium">{item.topic}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate mt-1">{item.text}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-full capitalize">
                        {item.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-full capitalize">
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No generation history yet</p>
                  <p className="text-xs text-gray-500 mt-1">Generated questions will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError(null);
              }}
              placeholder="Enter a topic (e.g., Quantum Physics, Renaissance Art)"
              className="flex-1 bg-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && generateQuestions()}
            />
            <button
              onClick={generateQuestions}
              disabled={isLoading || !topic.trim()}
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Questions: {numQuestions}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Generated Questions */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(numQuestions)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800/50 rounded-xl" />
              ))}
            </div>
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <div 
                key={question.id} 
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-400/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <LightBulbIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {question.type.toUpperCase()} • {question.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-100 whitespace-pre-wrap">{question.text}</p>
                    
                    {question.options && (
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, i) => (
                          <div key={i} className="flex items-center">
                            <span className="mr-2 text-gray-400 w-6">{String.fromCharCode(65 + i)})</span>
                            <span className="text-gray-300">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      className="p-2 hover:bg-gray-700/50 rounded-lg relative"
                      onClick={() => copyToClipboard(question.text, question.id)}
                      title="Copy question"
                    >
                      <ClipboardDocumentIcon className="w-5 h-5 text-gray-300" />
                      {copiedId === question.id && (
                        <span className="absolute -top-8 -right-2 bg-gray-700 text-xs px-2 py-1 rounded whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-700/50 rounded-lg"
                      onClick={() => regenerateQuestion(question.id)}
                      title="Regenerate question"
                      disabled={isLoading}
                    >
                      <ArrowPathIcon className={`w-5 h-5 text-gray-300 ${isLoading ? 'opacity-50' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="pl-8 border-l-2 border-purple-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Answer/Guidance:</span>
                    <button 
                      className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
                      onClick={() => copyToClipboard(question.answer, `answer-${question.id}`)}
                    >
                      {copiedId === `answer-${question.id}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{question.answer}</p>
                  {question.explanation && (
                    <>
                      <div className="mt-2 flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Explanation:</span>
                        <button 
                          className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
                          onClick={() => copyToClipboard(question.explanation, `explanation-${question.id}`)}
                        >
                          {copiedId === `explanation-${question.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm whitespace-pre-wrap">{question.explanation}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-block bg-gray-800/50 p-8 rounded-xl max-w-md w-full">
                <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-200 mb-2">Start Generating Questions</h3>
                <p className="text-gray-400 mb-6">Enter a topic and click generate to create practice questions</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 cursor-pointer transition-colors"
                    onClick={() => {
                      setTopic("Machine Learning Basics");
                      setQuestionType("mcq");
                      setDifficulty("medium");
                      setNumQuestions(10);
                    }}
                  >
                    <p className="text-sm text-purple-300 font-medium">"Machine Learning Basics"</p>
                    <p className="text-xs text-gray-400">10 Multiple Choice Questions</p>
                  </div>
                  <div 
                    className="p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 cursor-pointer transition-colors"
                    onClick={() => {
                      setTopic("French Revolution");
                      setQuestionType("essay");
                      setDifficulty("hard");
                      setNumQuestions(5);
                    }}
                  >
                    <p className="text-sm text-purple-300 font-medium">"French Revolution"</p>
                    <p className="text-xs text-gray-400">5 Essay Questions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Gemini 2.0 Flash • {new Date().getFullYear()}</p>
          <p className="mt-1">Press Ctrl+Enter to generate questions</p>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedQuestions;