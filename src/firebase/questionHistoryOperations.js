import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const questionHistoryCollection = collection(db, 'questionHistory');

// Save question history to Firebase
export const saveQuestionHistory = async (userId, questions) => {
  if (!userId) throw new Error('User must be authenticated to save questions');

  try {
    const historyEntry = {
      userId,
      questions,
      timestamp: new Date().toISOString(),
      topic: questions[0].topic,
      type: questions[0].type,
      difficulty: questions[0].difficulty
    };

    await addDoc(questionHistoryCollection, historyEntry);
    return true;
  } catch (error) {
    console.error('Error saving question history:', error);
    throw error;
  }
};

// Get question history for a user
export const getQuestionHistory = async (userId, limitCount = 50) => {
  if (!userId) throw new Error('User must be authenticated to get questions');

  try {
    // Create a query for the user's questions
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure we're only getting this user's data
      if (data.userId === userId) {
        history.push({
          id: doc.id,
          ...data,
          questions: data.questions.map(q => ({
            ...q,
            date: data.timestamp // Use the timestamp from the document
          }))
        });
      }
    });

    // Flatten the questions array since we store multiple questions per entry
    const flattenedHistory = history.flatMap(entry => entry.questions);
    return flattenedHistory;
  } catch (error) {
    console.error('Error getting question history:', error);
    throw error;
  }
};

// Clear all question history for a user
export const clearQuestionHistory = async (userId) => {
  if (!userId) throw new Error('User must be authenticated to clear questions');

  try {
    const q = query(
      questionHistoryCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      // Double check that we're only deleting this user's data
      const data = doc.data();
      if (data.userId === userId) {
        await deleteDoc(doc.ref);
      }
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing question history:', error);
    throw error;
  }
}; 