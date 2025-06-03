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
  TrashIcon,
  ChevronDownIcon, // For select dropdowns (optional, can be styled via CSS)
  CheckCircleIcon, // For copied feedback
} from '@heroicons/react/24/outline';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { saveQuestionHistory, getQuestionHistory, clearQuestionHistory } from '../../firebase/questionHistoryOperations';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const AIGeneratedQuestions = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedStates, setCopiedStates] = useState({}); // For individual copy confirmations
  const [userId, setUserId] = useState(null);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadHistoryFromFirebase(user.uid);
      } else {
        setUserId(null);
        setHistory([]);
        setQuestions([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadHistoryFromFirebase = async (uid) => {
    if (!uid) return;
    try {
      const historyData = await getQuestionHistory(uid);
      const formattedHistory = historyData.map(item => ({
        ...item,
        timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load question history. Check console for details.');
    }
  };

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate questions.');
      return;
    }
    if (!userId) {
      setError('Please sign in to generate questions.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setQuestions([]); // Clear previous questions
    
    try {
      const prompt = `Generate ${numQuestions} ${difficulty}-level ${questionType} questions about "${topic}" in strict JSON format. Follow this exact structure:
{
  "questions": [
    {
      "text": "The actual question text here",
      ${questionType === 'mcq' ? `"options": ["Option A text", "Option B text", "Option C text", "Option D text"],` : ''}
      "answer": "The correct answer. For MCQs, use format like 'A) Option A text'",
      "explanation": "A concise explanation of the answer."
    }
  ]
}
Requirements:
- For MCQs: Provide exactly 4 options. The answer field must clearly indicate the correct option (e.g., "A) Correct Option Text").
- For all types: Include a 'text' (question), 'answer', and 'explanation'.
- Difficulty: ${difficulty}.
- Ensure questions are clear, concise, and test understanding, not just recall.
- Output raw JSON only. Do NOT use markdown like \`\`\`json or \`\`\`.`;

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        { contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7, topP: 0.9 }
        },
        { params: { key: GEMINI_API_KEY }, headers: { 'Content-Type': 'application/json' }, timeout: 25000 }
      );

      const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) throw new Error('No valid response from AI. The response might be empty or malformed.');
      
      let parsedData;
      try {
        parsedData = JSON.parse(resultText);
      } catch (e) {
        console.error('Raw AI Response (failed to parse):', resultText);
        throw new Error('Failed to parse AI response as JSON. AI might have returned invalid format. Check console.');
      }

      let genQuestions = parsedData.questions || [];
      if (!Array.isArray(genQuestions) || genQuestions.length === 0) {
        console.warn('Parsed data did not yield questions:', parsedData);
        throw new Error('AI generated no questions or data was in unexpected format.');
      }
      
      const questionsWithMeta = genQuestions.map((q, i) => ({
        ...q,
        id: `${Date.now()}-${i}`,
        type: questionType,
        difficulty,
        topic,
        date: new Date().toISOString(),
        options: q.options || (questionType === 'mcq' ? ['N/A', 'N/A', 'N/A', 'N/A'] : undefined)
      }));

      setQuestions(questionsWithMeta);
      
      const savePromises = questionsWithMeta.map(q => 
        saveQuestionHistory(userId, {
          text: q.text, options: q.options, answer: q.answer, explanation: q.explanation,
          subject: q.topic, difficulty: q.difficulty, type: q.type,
        })
      );
      await Promise.all(savePromises);
      await loadHistoryFromFirebase(userId);

    } catch (error) {
      console.error('Generation error:', error);
      setError(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateQuestion = async (questionId) => {
    const qToRegen = questions.find(q => q.id === questionId);
    if (!qToRegen) return;
    
    setIsLoading(true); // Or a specific regen loading state
    setError(null);
    try {
       const prompt = `Regenerate the following ${qToRegen.type} question about "${qToRegen.topic}" at ${qToRegen.difficulty} level.
Original: Text: "${qToRegen.text}", Answer: "${qToRegen.answer}"
Provide new question in strict JSON: { "question": { "text": "...", ${qToRegen.type === 'mcq' ? `"options": ["...", "...", "...", "..."],` : ''} "answer": "...", "explanation": "..." } }
Requirements: New, distinct question. For MCQs, 4 options. Raw JSON.`;

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        { contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.8, topP: 0.95 }
        },
        { params: { key: GEMINI_API_KEY }, headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) throw new Error('No AI response for regeneration.');
      
      const newQData = JSON.parse(resultText).question;
      if (!newQData || !newQData.text) throw new Error('Invalid new question structure from AI.');

      setQuestions(prevQs => prevQs.map(q => q.id === questionId ? { 
        ...q, text: newQData.text, 
        options: newQData.options || (q.type === 'mcq' ? [] : undefined),
        answer: newQData.answer, explanation: newQData.explanation,
      } : q));
    } catch (error) {
      console.error('Regeneration error:', error);
      setError(`Regeneration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (typeof text !== 'string') text = JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
  };

  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); generateQuestions();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [topic, questionType, difficulty, numQuestions, userId, generateQuestions]); // Added generateQuestions to deps

  const clearHistoryAction = async () => {
    if (!userId) { setError('Sign in to clear history.'); return; }
    if (window.confirm("Clear all question history? This is irreversible.")) {
      try {
        await clearQuestionHistory(userId); setHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error);
        setError('Failed to clear history.');
      }
    }
  };
  
  const commonInputClass = "w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all shadow-sm hover:border-slate-600";
  const commonLabelClass = "block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-4 md:p-8 text-gray-200 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center relative">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 mb-4">
            <div className="bg-slate-900 p-2 rounded-full">
              <SparklesIcon className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            IntelliQuest AI
          </h1>
          <p className="text-slate-400 text-lg">Craft Perfect Questions with Gemini 1.5 Flash</p>
          
          {userId && (
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="absolute right-0 top-0 px-4 py-2 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white flex items-center gap-2 transition-all shadow-md hover:shadow-purple-500/30"
              title={showHistory ? "Hide History" : "Show History"}
            >
              {showHistory ? <XMarkIcon className="w-5 h-5" /> : <BookOpenIcon className="w-5 h-5" />}
              {showHistory ? "Close" : "History"}
            </button>
          )}
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 flex items-start gap-3 shadow-lg animate-shake">
            <ExclamationTriangleIcon className="w-6 h-6 mt-0.5 flex-shrink-0 text-red-400" />
            <div className="flex-grow">
              <p className="font-semibold">Oops! An Error Occurred</p>
              <p className="text-sm break-words">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1.5 -m-1.5 hover:bg-red-700/30 rounded-full text-red-400 hover:text-red-200 transition-colors">
              <XMarkIcon className="w-5 h-5"/>
            </button>
          </div>
        )}

        {/* History Panel */}
        {userId && showHistory && (
          <section className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 flex justify-end animate-slideInRight">
            <div className="w-full max-w-md bg-slate-900/90 border-l border-slate-700/50 shadow-2xl flex flex-col h-full">
              <header className="p-5 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2"><BookOpenIcon className="w-6 h-6"/> Generation History</h3>
                <button onClick={() => setShowHistory(false)} className="p-2 -m-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white transition-colors" title="Close History">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </header>
              <div className="flex-grow overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {history.length > 0 ? (
                  history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg cursor-pointer transition-all group hover:shadow-md hover:border-purple-600/50"
                      onClick={() => {
                        setTopic(item.subject); setQuestionType(item.type); setDifficulty(item.difficulty);
                        setQuestions([{
                          id: item.id, text: item.question, options: item.options, answer: item.answer,
                          explanation: item.explanation, type: item.type, difficulty: item.difficulty,
                          topic: item.subject, date: item.timestamp.toISOString(),
                        }]);
                        setShowHistory(false); setError(null);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-purple-400 font-medium text-md group-hover:text-purple-300 truncate pr-2" title={item.subject}>{item.subject}</span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-400 flex-shrink-0">
                          {item.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 group-hover:text-slate-200 truncate mt-1.5" title={item.question}>{item.question}</p>
                      <div className="flex gap-2 mt-2.5">
                        {[item.type, item.difficulty].map(tag => (
                          <span key={tag} className="text-xs px-2.5 py-1 bg-slate-700/70 group-hover:bg-purple-700/30 text-slate-400 group-hover:text-purple-300 rounded-full capitalize transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <BookOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                    <p>No history yet.</p>
                    <p className="text-xs mt-1">Your generated questions will appear here.</p>
                  </div>
                )}
              </div>
              {history.length > 0 && (
                <footer className="p-4 border-t border-slate-700/50">
                  <button onClick={clearHistoryAction} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-800/40 hover:bg-red-700/60 border border-red-700/50 rounded-lg text-sm text-red-300 hover:text-red-200 transition-all shadow-sm hover:shadow-red-500/20">
                    <TrashIcon className="w-5 h-5" /> Clear All History
                  </button>
                </footer>
              )}
            </div>
          </section>
        )}

        {/* Input Section */}
        <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-6 md:p-8 mb-10 shadow-2xl shadow-purple-900/10">
          <div className="flex flex-col lg:flex-row gap-5 mb-6">
            <div className="flex-grow">
              <label htmlFor="topicInput" className={commonLabelClass}><LightBulbIcon className="w-5 h-5 text-purple-400"/> Topic</label>
              <input
                id="topicInput" type="text" value={topic}
                onChange={(e) => { setTopic(e.target.value); if (error && error.includes("topic")) setError(null); }}
                placeholder="e.g., Quantum Entanglement, The Silk Road"
                className={`${commonInputClass} text-lg`}
              />
            </div>
            <button
              onClick={generateQuestions}
              disabled={isLoading || !topic.trim() || !userId}
              className="lg:self-end px-6 py-3 h-[50px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-semibold text-lg flex items-center justify-center gap-2.5 transition-all duration-300 ease-in-out shadow-lg hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              title={!userId ? "Sign in to generate" : (isLoading ? "Generating..." : "Generate Questions (Ctrl+Enter)")}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <> <SparklesIcon className="w-6 h-6" /> Generate </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="questionTypeSelect" className={commonLabelClass}><AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-400"/> Question Type</label>
              <div className="relative">
                <select id="questionTypeSelect" value={questionType} onChange={(e) => setQuestionType(e.target.value)} className={`${commonInputClass} appearance-none pr-10`}>
                  {questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
              </div>
            </div>
            <div>
              <label htmlFor="difficultySelect" className={commonLabelClass}><BookOpenIcon className="w-5 h-5 text-purple-400"/> Difficulty</label>
              <div className="relative">
                <select id="difficultySelect" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={`${commonInputClass} appearance-none pr-10`}>
                  {difficultyLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
              </div>
            </div>
            <div>
              <label htmlFor="numQuestionsRange" className={commonLabelClass}><DocumentTextIcon className="w-5 h-5 text-purple-400"/> Number of Questions: <span className="font-bold text-purple-400">{numQuestions}</span></label>
              <input id="numQuestionsRange" type="range" min="1" max="10" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} 
                     className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 range-thumb:bg-purple-500" />
            </div>
          </div>
        </section>

        {/* Generated Questions Display */}
        <main className="space-y-8">
          {isLoading && questions.length === 0 ? (
            [...Array(parseInt(numQuestions))].map((_, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 shadow-lg animate-pulse">
                <div className="h-5 bg-slate-700/50 rounded w-3/4 mb-5"></div>
                <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-slate-700/50 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
              </div>
            ))
          ) : questions.length > 0 ? (
            questions.map((q) => (
              <article key={q.id} className="bg-gradient-to-br from-slate-800/70 to-slate-850/70 border border-slate-700/60 rounded-xl shadow-xl hover:shadow-purple-600/20 transition-shadow duration-300 ease-in-out overflow-hidden">
                <header className="p-5 md:p-6 border-b border-slate-700/50 flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 text-purple-400 mb-1.5">
                      <LightBulbIcon className="w-6 h-6" />
                      <span className="text-sm font-semibold uppercase tracking-wider">
                        {q.type} • {q.difficulty} • <span className="text-slate-400 normal-case">{q.topic}</span>
                      </span>
                    </div>
                    <h2 className="text-gray-100 text-lg md:text-xl leading-snug font-medium">{q.text}</h2>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 relative">
                    {[
                      { id: `qtext-${q.id}`, text: q.text, Icon: ClipboardDocumentIcon, title: "Copy Question" },
                      { id: `regen-${q.id}`, action: () => regenerateQuestion(q.id), Icon: ArrowPathIcon, title: "Regenerate", disabled: isLoading },
                    ].map(btn => (
                      <button 
                        key={btn.id}
                        className={`p-2.5 bg-slate-700/50 hover:bg-purple-600/30 rounded-md text-slate-400 hover:text-purple-300 transition-all duration-200 relative disabled:opacity-50 disabled:cursor-not-allowed ${isLoading && btn.id.startsWith('regen') ? 'animate-pulse' : ''}`}
                        onClick={btn.action ? btn.action : () => copyToClipboard(btn.text, btn.id)}
                        title={btn.title}
                        disabled={btn.disabled}
                      >
                        <btn.Icon className="w-5 h-5" />
                        {copiedStates[btn.id] && (
                          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" /> Copied!
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </header>
                
                {q.type === 'mcq' && q.options && q.options.length > 0 && (
                  <div className="p-5 md:p-6 space-y-2.5">
                    {q.options.map((option, i) => (
                      <div key={i} className="flex items-start text-gray-300 bg-slate-700/30 p-3 rounded-md border border-transparent hover:border-slate-600 transition-colors">
                        <span className="mr-3 text-purple-400 font-semibold">{String.fromCharCode(65 + i)})</span>
                        <span className="break-words">{typeof option === 'string' ? option : JSON.stringify(option)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <footer className="p-5 md:p-6 bg-slate-800/40 border-t border-slate-700/50">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-semibold text-purple-400">Answer:</h3>
                      <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 relative" onClick={() => copyToClipboard(q.answer, `ans-${q.id}`)} title="Copy Answer">
                        {copiedStates[`ans-${q.id}`] ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <ClipboardDocumentIcon className="w-4 h-4"/>}
                        {copiedStates[`ans-${q.id}`] ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap break-words text-sm">{q.answer}</p>
                  </div>
                  {q.explanation && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-semibold text-purple-400">Explanation:</h3>
                        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 relative" onClick={() => copyToClipboard(q.explanation, `exp-${q.id}`)} title="Copy Explanation">
                          {copiedStates[`exp-${q.id}`] ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <ClipboardDocumentIcon className="w-4 h-4"/>}
                          {copiedStates[`exp-${q.id}`] ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-gray-400 whitespace-pre-wrap break-words text-sm leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </footer>
              </article>
            ))
          ) : !isLoading && (
            <div className="text-center py-16">
              <div className="inline-block bg-slate-800/60 p-10 rounded-xl shadow-2xl max-w-lg w-full border border-slate-700/50">
                <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-6" />
                <h3 className="text-2xl text-gray-100 mb-3 font-semibold">Ready to Generate Some Questions?</h3>
                <p className="text-slate-400 mb-8">
                  {userId ? "Enter a topic above, choose your options, and let the AI work its magic!" : "Please sign in to unlock the power of AI question generation."}
                </p>
                {userId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {[
                      {t:"Astrophysics", qt:"mcq", d:"hard", n:5}, 
                      {t:"Ancient Rome", qt:"short", d:"medium", n:3}
                    ].map(ex => (
                      <div key={ex.t} className="p-4 bg-slate-700/40 hover:bg-purple-600/20 border border-slate-600 hover:border-purple-500/50 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105"
                        onClick={() => { setTopic(ex.t); setQuestionType(ex.qt); setDifficulty(ex.d); setNumQuestions(ex.n); setError(null); }}>
                        <p className="text-md text-purple-300 font-medium">"{ex.t}"</p>
                        <p className="text-xs text-slate-400 mt-1">{ex.n} {questionTypes.find(q=>q.value===ex.qt)?.label}, {ex.d}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-16 pt-8 border-t border-slate-700/50 text-center text-slate-500 text-sm">
          <p>Powered by Gemini 1.5 Flash & React. Designed with Tailwind CSS.</p>
          <p className="mt-1">© {new Date().getFullYear()} IntelliQuest AI. Press Ctrl+Enter to generate.</p>
        </footer>

        <div className={`fixed bottom-5 right-5 text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300
                        ${userId ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${userId ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
          {userId ? 'Authenticated' : 'Not Signed In'}
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedQuestions;

// Add to your global CSS (e.g., index.css or App.css) for custom scrollbar and animations:
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: theme('colors.slate.800');
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: theme('colors.purple.600');
    border-radius: 10px;
    border: 2px solid theme('colors.slate.800');
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: theme('colors.purple.500');
  }

  .range-thumb\:bg-purple-500::-webkit-slider-thumb {
    @apply bg-purple-500;
  }
  .range-thumb\:bg-purple-500::-moz-range-thumb {
    @apply bg-purple-500;
  }


  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out forwards;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
}
*/