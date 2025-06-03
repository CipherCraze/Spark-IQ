import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore'; // Added doc, getDoc, writeBatch
import { db } from './firebaseConfig';

const questionHistoryCollection = collection(db, 'questionHistory');

// Save a question to Firebase
export const saveQuestionHistory = async (userId, questionData) => {
  if (!userId) throw new Error('User must be authenticated to save questions.');

  try {
    // questionData should include: text, options, answer, explanation, subject, difficulty, type
    const questionEntry = {
      userId,
      question: questionData.text, // Actual question text
      options: questionData.options || null, // For MCQ
      answer: questionData.answer || null,
      explanation: questionData.explanation || null,
      subject: questionData.subject || 'general', // Corresponds to 'topic' in UI
      difficulty: questionData.difficulty || 'medium',
      type: questionData.type || 'unknown', // e.g., 'mcq', 'short', etc.
      timestamp: new Date(), // Firestore will convert this to its Timestamp type
      isAnswered: false, // Default, can be updated later
      tags: questionData.tags || [], // Default
      generatedBy: 'AI' // Default
    };

    // Validate required fields
    if (!questionEntry.question || typeof questionEntry.question !== 'string' || questionEntry.question.trim() === '') {
      throw new Error('Question text is required and must be a non-empty string.');
    }
    if (!questionEntry.subject || typeof questionEntry.subject !== 'string' || questionEntry.subject.trim() === '') {
      throw new Error('Subject (topic) is required and must be a non-empty string.');
    }
    if (!questionEntry.type || typeof questionEntry.type !== 'string' || questionEntry.type.trim() === '') {
      throw new Error('Question type is required and must be a non-empty string.');
    }
    if (!questionEntry.difficulty || typeof questionEntry.difficulty !== 'string' || questionEntry.difficulty.trim() === '') {
      throw new Error('Difficulty level is required and must be a non-empty string.');
    }
     if (questionEntry.type === 'mcq' && (!Array.isArray(questionEntry.options) || questionEntry.options.length === 0)) {
      // Allow empty options if not MCQ, but for MCQ it's generally expected
      // console.warn('MCQ question saved without options or options is not an array.');
    }


    const docRef = await addDoc(questionHistoryCollection, questionEntry);
    return docRef.id;
  } catch (error) {
    console.error('Error saving question to Firebase:', error.message, questionData);
    // Re-throw the error so the calling function can handle it
    throw new Error(`Failed to save question: ${error.message}`);
  }
};

// Get question history for a user
export const getQuestionHistory = async (userId, limitCount = 100) => {
  if (!userId) throw new Error('User must be authenticated to get question history.');

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date object
      timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp) 
    }));
  } catch (error) {
    console.error('Error getting question history from Firebase:', error);
    if (error.code === 'failed-precondition') {
       console.error('Firestore index missing. Check Firebase console for index creation link in error logs.');
       throw new Error('Database query failed due to missing index. Please check Firestore console.');
    }
    throw new Error(`Failed to retrieve question history: ${error.message}`);
  }
};

// Get questions by subject (example, not directly used by the bug fix)
export const getQuestionsBySubject = async (userId, subject, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions.');

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId),
      where('subject', '==', subject),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting questions by subject:', error);
    throw error;
  }
};

// Get questions by difficulty (example)
export const getQuestionsByDifficulty = async (userId, difficulty, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions.');

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId),
      where('difficulty', '==', difficulty),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting questions by difficulty:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestionFromHistory = async (userId, questionId) => { // Renamed to avoid conflict if you have other deleteQuestion elsewhere
  if (!userId || !questionId) throw new Error('User ID and Question ID are required to delete questions.');

  try {
    const questionDocRef = doc(db, 'questionHistory', questionId);
    const docSnap = await getDoc(questionDocRef);

    if (!docSnap.exists()) {
      throw new Error('Question not found.');
    }

    if (docSnap.data().userId !== userId) {
      throw new Error('Not authorized to delete this question.');
    }

    await deleteDoc(questionDocRef);
    return true;
  } catch (error) {
    console.error('Error deleting question from Firebase:', error);
    throw new Error(`Failed to delete question: ${error.message}`);
  }
};

// Clear all questions for a user
export const clearQuestionHistory = async (userId) => {
  if (!userId) throw new Error('User must be authenticated to clear question history.');

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return true; // Nothing to delete
    }

    // Use a batch for atomic delete if many documents, though Firestore limits batch size (500 writes)
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error clearing question history from Firebase:', error);
    throw new Error(`Failed to clear question history: ${error.message}`);
  }
};

// Get questions by tags (example)
export const getQuestionsByTags = async (userId, tags, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions.');
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('Tags must be a non-empty array.');
  }

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId),
      where('tags', 'array-contains-any', tags), // Requires index on 'tags'
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting questions by tags:', error);
    throw error;
  }
};