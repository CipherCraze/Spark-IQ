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
  XMarkIcon
} from '@heroicons/react/24/outline';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const AIGeneratedQuestions = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [history, setHistory] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

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

  const generateQuestions = async () => {
    if (!topic) return;
    setIsLoading(true);
    
    try {
      let prompt = `Generate ${numQuestions} ${difficulty}-level ${questionType} questions about ${topic}.\n`;
      
      // Add specific instructions based on question type
      switch(questionType) {
        case 'mcq':
          prompt += `- Format: "1. Question text?\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\nAnswer: [Correct option]"\n`;
          prompt += `- Include 4 plausible options with one clearly correct answer\n`;
          break;
        case 'truefalse':
          prompt += `- Format: "1. Statement (True/False)\nAnswer: [True/False]"\n`;
          break;
        case 'short':
          prompt += `- Format: "1. Question text?\nAnswer: [Concise answer]"\n`;
          prompt += `- Answers should be 1-2 sentences maximum\n`;
          break;
        case 'essay':
          prompt += `- Format: "1. Question/prompt\nGrading Criteria: [3-5 bullet points]"\n`;
          prompt += `- Include detailed grading criteria\n`;
          break;
      }

      prompt += `- Questions should be educational and test real understanding\n`;
      prompt += `- Vary question styles and avoid repetition\n`;
      prompt += `- Make answers clear and accurate`;

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        },
        {
          params: { key: GEMINI_API_KEY },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedQuestions = parseGeneratedText(generatedText);
      
      const questionsWithMeta = parsedQuestions.map((q, i) => ({
        ...q,
        id: Date.now() + i,
        type: questionType,
        difficulty,
        topic,
        date: new Date().toISOString()
      }));

      setQuestions(questionsWithMeta);
      setHistory(prev => [...questionsWithMeta, ...prev]);
    } catch (error) {
      console.error('Generation error:', error);
      setQuestions([{
        id: Date.now(),
        text: 'Failed to generate questions. Please try again.',
        answer: 'Error: ' + (error.response?.data?.error?.message || error.message),
        type: 'error',
        difficulty,
        topic,
        date: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseGeneratedText = (text) => {
    if (!text) return [];
    
    const questionBlocks = text.split(/\n\d+\./).slice(1);
    return questionBlocks.map((block) => {
      // Handle different question formats
      if (questionType === 'mcq') {
        const [questionPart, answerPart] = block.split(/Answer:/i);
        return {
          text: questionPart?.trim() || 'Question',
          answer: answerPart?.trim() || 'No answer provided'
        };
      } else if (questionType === 'truefalse') {
        const [questionPart, answerPart] = block.split(/Answer:/i);
        return {
          text: questionPart?.trim() || 'True/False statement',
          answer: answerPart?.trim() || 'No answer provided'
        };
      } else {
        // For short answer and essay questions
        const [questionPart, answerPart] = block.split(/\n(?:Answer|Grading Criteria):/i);
        return {
          text: questionPart?.trim() || 'Question',
          answer: answerPart?.trim() || 'No answer provided'
        };
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      generateQuestions();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateQuestion = async (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    setIsLoading(true);
    try {
      const prompt = `Regenerate this ${question.type} question about ${question.topic} at ${question.difficulty} level:\n\nOriginal: ${question.text}\n\nGenerate a similar but different question.`;
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        },
        {
          params: { key: GEMINI_API_KEY },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId 
            ? { ...q, text: generatedText.split('\n')[0] || "New question", answer: "See generated response" }
            : q
        )
      );
    } catch (error) {
      console.error('Regeneration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-gray-300">Transform any topic into practice questions using AI</p>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="absolute right-0 top-0 px-4 py-2 bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-gray-600/50"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-gray-800/70 rounded-xl p-4 mb-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">Generation History</h3>
              <button onClick={() => setShowHistory(false)}>
                <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => {
                      setTopic(item.topic);
                      setQuestionType(item.type);
                      setDifficulty(item.difficulty);
                      setQuestions([item]);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="text-purple-300">{item.topic}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">{item.text}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-full">
                        {item.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-full">
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No generation history yet</p>
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
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Quantum Physics, Renaissance Art)"
              className="flex-1 bg-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={generateQuestions}
              disabled={isLoading || !topic}
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                {questionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  );
                })}
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
              {[...Array(numQuestions)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800/50 rounded-xl" />
              ))}
            </div>
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <div 
                key={question.id} 
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-400/30 transition-all"
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
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      className="p-2 hover:bg-gray-700/50 rounded-lg"
                      onClick={() => copyToClipboard(question.text)}
                      title="Copy question"
                    >
                      <ClipboardDocumentIcon className="w-5 h-5 text-gray-300" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-700/50 rounded-lg"
                      onClick={() => regenerateQuestion(question.id)}
                      title="Regenerate question"
                    >
                      <ArrowPathIcon className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>
                <div className="pl-8 border-l-2 border-purple-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Answer/Guidance:</span>
                    <button 
                      className="text-xs text-gray-400 hover:text-gray-300"
                      onClick={() => copyToClipboard(question.answer)}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{question.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-block bg-gray-800/50 p-8 rounded-xl">
                <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-200 mb-2">Start Generating Questions</h3>
                <p className="text-gray-400">Enter a topic and click generate to create practice questions</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 cursor-pointer"
                    onClick={() => {
                      setTopic("Machine Learning Basics");
                      setQuestionType("mcq");
                      setDifficulty("medium");
                      setNumQuestions(10);
                    }}
                  >
                    <p className="text-sm text-purple-300">"Machine Learning Basics"</p>
                    <p className="text-xs text-gray-400">10 Multiple Choice Questions</p>
                  </div>
                  <div 
                    className="p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 cursor-pointer"
                    onClick={() => {
                      setTopic("French Revolution");
                      setQuestionType("essay");
                      setDifficulty("hard");
                      setNumQuestions(5);
                    }}
                  >
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