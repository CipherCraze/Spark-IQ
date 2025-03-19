import { useState, useEffect } from 'react';
import { SparklesIcon, BookOpenIcon, LightBulbIcon, DocumentTextIcon, AdjustmentsHorizontalIcon, ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AIGeneratedQuestions = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [history, setHistory] = useState([]);

  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice' },
    { value: 'truefalse', label: 'True/False' },
    { value: 'short', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' },
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Beginner' },
    { value: 'medium', label: 'Intermediate' },
    { value: 'hard', label: 'Advanced' },
  ];

  const generateQuestions = async () => {
    if (!topic) return;
    setIsLoading(true);
    
    // Simulated API call
    setTimeout(() => {
      const generated = Array.from({ length: numQuestions }, (_, i) => ({
        id: Date.now() + i,
        text: `Sample question about ${topic} (${questionType}) - ${i + 1}`,
        answer: `Sample answer for question ${i + 1}`,
        type: questionType,
        difficulty,
      }));
      
      setQuestions(generated);
      setHistory(prev => [...generated, ...prev]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      generateQuestions();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [topic, questionType, difficulty, numQuestions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            AI Question Generator
          </h1>
          <p className="text-gray-300">Transform any topic into practice questions using AI</p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Quantum Physics, Renaissance Art)"
              className="flex-1 bg-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={generateQuestions}
              disabled={isLoading || !topic}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              {isLoading ? 'Generating...' : 'Generate'}
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
                className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
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
                className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Number of Questions: {numQuestions}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full bg-gray-700/50 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Generated Questions */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800/50 rounded-xl" />
              ))}
            </div>
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-400/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <LightBulbIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{question.type.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-100">{question.text}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                      <ClipboardDocumentIcon className="w-5 h-5 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                      <ArrowPathIcon className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>
                <div className="pl-8 border-l-2 border-purple-500/30">
                  <p className="text-gray-400 text-sm">{question.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-block bg-gray-800/50 p-8 rounded-xl">
                <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-200 mb-2">Start Generating Questions</h3>
                <p className="text-gray-400">Enter a topic and click generate to create practice questions</p>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 cursor-pointer">
                    <p className="text-sm text-purple-300">"Machine Learning Basics"</p>
                    <p className="text-xs text-gray-400">10 Multiple Choice Questions</p>
                  </div>
                  <div className="p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 cursor-pointer">
                    <p className="text-sm text-purple-300">"French Revolution"</p>
                    <p className="text-xs text-gray-400">5 Essay Questions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedQuestions;