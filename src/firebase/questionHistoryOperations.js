import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const questionHistoryCollection = collection(db, 'questionHistory');

// Save a question to Firebase
export const saveQuestionHistory = async (userId, question) => {
  if (!userId) throw new Error('User must be authenticated to save questions');

  try {
    const questionEntry = {
      userId,
      question: question.text,
      subject: question.subject || 'general',
      difficulty: question.difficulty || 'medium',
      timestamp: new Date().toISOString(),
      isAnswered: false,
      tags: question.tags || [],
      generatedBy: 'AI'
    };

    // Validate required fields
    if (!questionEntry.question || typeof questionEntry.question !== 'string') {
      throw new Error('Question text is required and must be a string');
    }

    const docRef = await addDoc(questionHistoryCollection, questionEntry);
    return docRef.id;
  } catch (error) {
    console.error('Error saving question:', error);
    throw error;
  }
};

// Get question history for a user
export const getQuestionHistory = async (userId, limitCount = 100) => {
  if (!userId) throw new Error('User must be authenticated to get question history');

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
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting question history:', error);
    if (error.code === 'failed-precondition' || error.code === 'resource-exhausted') {
      console.error('Index missing or other Firebase error:', error);
    }
    throw error;
  }
};

// Get questions by subject
export const getQuestionsBySubject = async (userId, subject, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions');

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
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting questions by subject:', error);
    throw error;
  }
};

// Get questions by difficulty
export const getQuestionsByDifficulty = async (userId, difficulty, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions');

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
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting questions by difficulty:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (userId, questionId) => {
  if (!userId || !questionId) throw new Error('User must be authenticated to delete questions');

  try {
    const docRef = doc(db, 'questionHistory', questionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Question not found');
    }

    if (docSnap.data().userId !== userId) {
      throw new Error('Not authorized to delete this question');
    }

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Clear all questions for a user
export const clearQuestionHistory = async (userId) => {
  if (!userId) throw new Error('User must be authenticated to clear question history');

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error clearing question history:', error);
    throw error;
  }
};

// Get questions by tags
export const getQuestionsByTags = async (userId, tags, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions');
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('Tags must be a non-empty array');
  }

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId),
      where('tags', 'array-contains-any', tags),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting questions by tags:', error);
    throw error;
  }
}; 