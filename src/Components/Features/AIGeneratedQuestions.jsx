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
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { saveQuestionHistory, getQuestionHistory, clearQuestionHistory } from '../../firebase/questionHistoryOperations';

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
  const [userId, setUserId] = useState(null);

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

  // Check authentication status and load history
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadHistoryFromFirebase(user.uid);
      } else {
        setUserId(null);
        setHistory([]);
        setQuestions([]); // Clear questions if user logs out
      }
    });

    return () => unsubscribe();
  }, []);

  // Load history from Firebase
  const loadHistoryFromFirebase = async (uid) => {
    if (!uid) return;
    try {
      const historyData = await getQuestionHistory(uid);
      // Ensure timestamp is a Date object for consistent handling
      const formattedHistory = historyData.map(item => ({
        ...item,
        timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load question history. Please check console for details.');
    }
  };

  // Generate questions using Gemini
  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (!userId) {
      setError('Please sign in to generate questions');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `Generate ${numQuestions} ${difficulty}-level ${questionType} questions about "${topic}" in strict JSON format. Follow this exact structure:
{
  "questions": [
    {
      "text": "The actual question text here",
      ${questionType === 'mcq' ? `"options": ["Option A", "Option B", "Option C", "Option D"],` : ''}
      "answer": "The correct answer here. For MCQs, just the letter and option text like 'A) Option A'",
      "explanation": "Explanation of the answer"
    }
  ]
}
Requirements:
- For MCQs: Provide exactly 4 options. The answer field should contain the correct option letter followed by the option text (e.g., "A) Correct Option Text").
- For other types: Provide the answer and explanation as appropriate.
- Clearly indicate the correct answer.
- Include a brief explanation for all question types.
- Difficulty level: ${difficulty}.
- Make questions clear and test real understanding.
- Do NOT include markdown like \`\`\`json or \`\`\` in the response. Output raw JSON only.`;

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
          timeout: 20000 // Increased timeout to 20 seconds
        }
      );

      const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) {
        throw new Error('No valid response from AI. The response might be empty or malformed.');
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(resultText);
      } catch (e) {
          console.error('Raw AI Response (failed to parse):', resultText);
          throw new Error('Failed to parse AI response as JSON. The AI might have returned an invalid format. Check console for raw response.');
      }

      let generatedQuestions = parsedData.questions || [];
      
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        console.warn('Parsed data did not yield an array of questions or the array was empty:', parsedData);
        throw new Error('AI generated no questions or data was in unexpected format.');
      }
      
      // Add metadata to questions for UI display
      const questionsWithMeta = generatedQuestions.map((q, i) => ({
        ...q,
        id: `${Date.now()}-${i}`, // More robust client-side ID
        type: questionType,
        difficulty,
        topic,
        date: new Date().toISOString(),
        options: q.options || (questionType === 'mcq' ? [] : undefined) // Ensure options array exists for MCQ
      }));

      setQuestions(questionsWithMeta);
      
      // Save each question to Firebase history
      const savePromises = questionsWithMeta.map(q => {
        const questionDataForDb = {
          text: q.text,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          subject: q.topic, // Map UI 'topic' to DB 'subject'
          difficulty: q.difficulty,
          type: q.type,
          // tags can be added here if implemented
        };
        return saveQuestionHistory(userId, questionDataForDb);
      });

      await Promise.all(savePromises);
      
      // Refresh history from Firebase
      await loadHistoryFromFirebase(userId);

    } catch (error) {
      console.error('Generation error:', error);
      let errorMessage = 'Failed to generate questions. ';
      if (error.response) {
        errorMessage += `Server responded with ${error.response.status}: ${JSON.stringify(error.response.data?.error?.message || error.response.data)}.`;
      } else if (error.request) {
        errorMessage += 'No response received from server. Check network connection or API endpoint.';
      } else {
        errorMessage += error.message || 'An unknown error occurred.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate a single question (client-side only for now)
  const regenerateQuestion = async (questionId) => {
    const questionToRegen = questions.find(q => q.id === questionId);
    if (!questionToRegen) return;
    
    // This is a simplified regeneration, ideally it would call the API again
    // For now, it just marks it for user to know it's a placeholder for regeneration
    // A full implementation would be similar to generateQuestions but for a single item.
    setIsLoading(true); // Consider a specific loading state for regeneration
    setError(null);
    try {
       // Construct prompt for regenerating a single question
       const prompt = `Regenerate the following ${questionToRegen.type} question about "${questionToRegen.topic}" at ${questionToRegen.difficulty} level.
Original question:
Text: "${questionToRegen.text}"
${questionToRegen.options ? `Options: ${JSON.stringify(questionToRegen.options)}` : ''}
Answer: "${questionToRegen.answer}"

Provide the regenerated question in strict JSON format:
{
  "question": {
    "text": "New question text here",
    ${questionToRegen.type === 'mcq' ? `"options": ["New Option A", "New Option B", "New Option C", "New Option D"],` : ''}
    "answer": "New correct answer here",
    "explanation": "New explanation here"
  }
}
Requirements:
- For MCQs: Provide exactly 4 options. The answer field should contain the correct option letter followed by the option text.
- Include a brief explanation.
- Difficulty level: ${questionToRegen.difficulty}.
- Make the new question distinct from the original but cover a similar concept if possible.
- Do NOT include markdown like \`\`\`json or \`\`\` in the response. Output raw JSON only.`;


      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.8, topP: 0.95 }
        },
        { params: { key: GEMINI_API_KEY }, headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) throw new Error('No valid response from AI for regeneration.');
      
      const parsedData = JSON.parse(resultText);
      const newQuestionData = parsedData.question;

      if (!newQuestionData || !newQuestionData.text) throw new Error('AI did not return a valid new question structure.');

      setQuestions(prevQs => 
        prevQs.map(q => 
          q.id === questionId 
            ? { 
                ...q, // Retain original id, type, difficulty, topic, date
                text: newQuestionData.text, 
                options: newQuestionData.options || (q.type === 'mcq' ? [] : undefined),
                answer: newQuestionData.answer,
                explanation: newQuestionData.explanation,
                // Potentially mark as regenerated or update timestamp
              }
            : q
        )
      );
      // Note: This regenerated question is NOT automatically saved back to Firebase history.
      // An explicit save/update mechanism would be needed if desired.

    } catch (error) {
      console.error('Regeneration error:', error);
      setError(`Failed to regenerate question: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (typeof text !== 'string') {
      console.warn('Attempted to copy non-string data:', text);
      text = JSON.stringify(text, null, 2); // Fallback for non-string
    }
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission if any
      generateQuestions();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, questionType, difficulty, numQuestions, userId]); // Add userId to dependencies

  const clearHistoryAction = async () => {
    if (!userId) {
      setError('Please sign in to clear history');
      return;
    }
    if (window.confirm("Are you sure you want to clear all your question history? This cannot be undone.")) {
      try {
        await clearQuestionHistory(userId);
        setHistory([]);
        // setError(null); // Clear any previous error
      } catch (error) {
        console.error('Error clearing history:', error);
        setError('Failed to clear history. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8 text-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            AI Question Generator
          </h1>
          <p className="text-gray-300">Powered by Gemini 1.5 Flash - Fast, accurate question generation</p>
          
          {userId && (
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="absolute right-0 top-0 px-3 py-2 bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-gray-600/50 flex items-center gap-2"
              title={showHistory ? "Hide generation history" : "Show generation history"}
            >
              {showHistory ? (
                <> <XMarkIcon className="w-4 h-4" /> Hide History </>
              ) : (
                <> <BookOpenIcon className="w-4 h-4" /> Show History </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/60 border border-red-700 rounded-lg text-red-200 flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">An Error Occurred</p>
              <p className="text-sm break-words">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-800/50 rounded">
              <XMarkIcon className="w-4 h-4"/>
            </button>
          </div>
        )}

        {/* History Panel */}
        {userId && showHistory && (
          <div className="bg-gray-800/70 rounded-xl p-4 mb-6 border border-gray-700/50 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">Generation History</h3>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button 
                    onClick={clearHistoryAction}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-900/30"
                    title="Clear all history"
                  >
                    <TrashIcon className="w-4 h-4" /> Clear All
                  </button>
                )}
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-gray-700/50 rounded-lg"
                  title="Close history panel"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? (
                history.sort((a, b) => b.timestamp - a.timestamp).map((item) => ( // item is from Firebase
                  <div 
                    key={item.id} 
                    className="p-3 bg-gray-700/40 rounded-lg hover:bg-gray-700/60 cursor-pointer transition-colors border border-transparent hover:border-purple-500/30"
                    onClick={() => {
                      setTopic(item.subject); // History item has 'subject'
                      setQuestionType(item.type); 
                      setDifficulty(item.difficulty); 
                      
                      const questionFromHistory = {
                          id: item.id, // Use Firebase ID
                          text: item.question, 
                          options: item.options,
                          answer: item.answer,
                          explanation: item.explanation,
                          type: item.type,
                          difficulty: item.difficulty,
                          topic: item.subject, // Map 'subject' back to 'topic' for UI
                          date: item.timestamp.toISOString(), // Map 'timestamp' back to 'date'
                      };
                      setQuestions([questionFromHistory]); 
                      setShowHistory(false);
                      setError(null);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 font-medium truncate" title={item.subject}>{item.subject}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {item.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate mt-1" title={item.question}>{item.question}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-600/50 rounded-full capitalize">
                        {item.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-600/50 rounded-full capitalize">
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No generation history yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Generated questions will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error && error.includes("topic")) setError(null);
              }}
              placeholder="Enter a topic (e.g., Quantum Physics)"
              className="flex-1 bg-gray-700/60 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-transparent focus:border-purple-500"
            />
            <button
              onClick={generateQuestions}
              disabled={isLoading || !topic.trim() || !userId}
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={!userId ? "Sign in to generate questions" : (isLoading ? "Generating..." : "Generate Questions (Ctrl+Enter)")}
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
                <> <SparklesIcon className="w-5 h-5" /> Generate </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Question Type Select */}
            <div className="space-y-1">
              <label htmlFor="questionTypeSelect" className="text-gray-300 text-sm flex items-center gap-1"><AdjustmentsHorizontalIcon className="w-4 h-4" /> Type</label>
              <select id="questionTypeSelect" value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full bg-gray-700/60 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-purple-500 focus:outline-none border border-transparent focus:border-purple-500">
                {questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            {/* Difficulty Select */}
            <div className="space-y-1">
              <label htmlFor="difficultySelect" className="text-gray-300 text-sm flex items-center gap-1"><BookOpenIcon className="w-4 h-4" /> Difficulty</label>
              <select id="difficultySelect" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-gray-700/60 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-purple-500 focus:outline-none border border-transparent focus:border-purple-500">
                {difficultyLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>
            {/* Number of Questions Range */}
            <div className="space-y-1">
              <label htmlFor="numQuestionsRange" className="text-gray-300 text-sm flex items-center gap-1"><DocumentTextIcon className="w-4 h-4" /> Questions: {numQuestions}</label>
              <input id="numQuestionsRange" type="range" min="1" max="10" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Generated Questions Display */}
        <div className="space-y-6">
          {isLoading && questions.length === 0 ? ( // Show skeletons only if no questions yet and loading
            <div className="animate-pulse space-y-4">
              {[...Array(parseInt(numQuestions))].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded-xl p-6">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className="bg-gray-800/60 p-5 md:p-6 rounded-xl border border-gray-700/60 hover:border-purple-500/40 transition-all group shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-purple-300 mb-2">
                      <LightBulbIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
                        {question.type} • {question.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-100 whitespace-pre-wrap break-words">{question.text}</p>
                    
                    {question.type === 'mcq' && question.options && question.options.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {question.options.map((option, i) => (
                          <div key={i} className="flex items-center text-sm">
                            <span className="mr-2 text-gray-400 w-5">{String.fromCharCode(65 + i)})</span>
                            <span className="text-gray-300 break-words">{typeof option === 'string' ? option : JSON.stringify(option)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                    <button className="p-1.5 hover:bg-gray-700/50 rounded-lg relative" onClick={() => copyToClipboard(question.text, `qtext-${question.id}`)} title="Copy question text">
                      <ClipboardDocumentIcon className="w-5 h-5 text-gray-300" />
                      {copiedId === `qtext-${question.id}` && <span className="absolute -top-7 -right-1 bg-gray-900 text-xs px-1.5 py-0.5 rounded shadow-md">Copied!</span>}
                    </button>
                    <button className="p-1.5 hover:bg-gray-700/50 rounded-lg" onClick={() => regenerateQuestion(question.id)} title="Regenerate this question" disabled={isLoading}>
                      <ArrowPathIcon className={`w-5 h-5 text-gray-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="pl-6 border-l-2 border-purple-500/30 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 font-semibold">Answer:</span>
                    <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1" onClick={() => copyToClipboard(question.answer, `ans-${question.id}`)} title="Copy answer">
                      {copiedId === `ans-${question.id}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap break-words">{question.answer}</p>
                  {question.explanation && (
                    <>
                      <div className="mt-2 flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400 font-semibold">Explanation:</span>
                        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1" onClick={() => copyToClipboard(question.explanation, `exp-${question.id}`)} title="Copy explanation">
                         {copiedId === `exp-${question.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-gray-400 whitespace-pre-wrap break-words">{question.explanation}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : !isLoading && ( // Show placeholder only if not loading and no questions
            <div className="text-center py-12">
              <div className="inline-block bg-gray-800/50 p-8 rounded-xl max-w-md w-full shadow-lg">
                <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-200 mb-2">Start Generating Questions</h3>
                <p className="text-gray-400 mb-6">
                  {userId ? "Enter a topic above and click generate." : "Please sign in to generate questions."}
                </p>
                {userId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {[{t:"Machine Learning", qt:"mcq", d:"medium", n:3}, {t:"French Revolution", qt:"essay", d:"hard", n:2}].map(ex => (
                      <div key={ex.t} className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => { setTopic(ex.t); setQuestionType(ex.qt); setDifficulty(ex.d); setNumQuestions(ex.n); setError(null); }}>
                        <p className="text-sm text-purple-300 font-medium">"{ex.t}"</p>
                        <p className="text-xs text-gray-400">{ex.n} {questionTypes.find(q=>q.value===ex.qt)?.label}, {ex.d}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Gemini 1.5 Flash • © {new Date().getFullYear()}</p>
          <p className="mt-1">Tip: Press Ctrl+Enter (or Cmd+Enter) to generate.</p>
        </div>

        <div className="fixed bottom-4 right-4 text-sm text-gray-400 bg-gray-800/70 px-3 py-1.5 rounded-lg shadow-md">
          {userId ? (
            <span className="flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Signed In
            </span>
          ) : (
            <span className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Not Signed In
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedQuestions;