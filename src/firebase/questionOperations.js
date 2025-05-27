import { 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore'; 
import { db, questionsCollection } from './firebaseConfig';

// Enhanced question storage with better metadata
export const storeQuestion = async (questionData) => {
  if (!questionData || !questionData.userId) {
    console.error('Invalid question data:', questionData);
    throw new Error('Invalid question data or missing userId');
  }

  try {
    console.log('Storing question for user:', questionData.userId);
    
    // Add comprehensive metadata
    const questionToStore = {
      ...questionData,
      // Convert all dates to Firestore Timestamp
      timestamp: serverTimestamp(),
      createdAt: Timestamp.now(),
      // Add searchable fields
      searchTerms: generateSearchTerms(questionData),
      // Normalize question type and difficulty
      type: questionData.type?.toLowerCase() || 'mcq',
      difficulty: questionData.difficulty?.toLowerCase() || 'medium',
      // Add word count for analytics
      wordCount: questionData.text?.split(/\s+/)?.length || 0
    };

    const docRef = await addDoc(questionsCollection, questionToStore);
    console.log('Question stored successfully with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...questionToStore
    };
  } catch (error) {
    console.error('Error storing question:', error);
    throw new Error('Failed to store question in database');
  }
};

// Helper function to generate search terms
const generateSearchTerms = (question) => {
  const terms = [];
  
  // Add topic words
  if (question.topic) {
    terms.push(...question.topic.toLowerCase().split(/\s+/));
  }
  
  // Add question type
  if (question.type) {
    terms.push(question.type.toLowerCase());
  }
  
  // Add difficulty level
  if (question.difficulty) {
    terms.push(question.difficulty.toLowerCase());
  }
  
  // Add first few words of question
  if (question.text) {
    terms.push(...question.text.toLowerCase().split(/\s+/).slice(0, 5));
  }
  
  // Remove duplicates
  return [...new Set(terms)];
};

// Enhanced question fetching with pagination
export const getUserQuestions = async (userId, options = {}) => {
  if (!userId) {
    console.error('No userId provided to getUserQuestions');
    throw new Error('UserId is required to fetch questions');
  }

  const {
    limit: queryLimit = 50,
    after = null,
    searchTerm = null
  } = options;

  try {
    console.log('Fetching questions for user:', userId);
    
    // Base query with user filter
    let q = query(
      questionsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(queryLimit)
    );
    
    // Add search filter if provided
    if (searchTerm) {
      q = query(
        q,
        where('searchTerms', 'array-contains', searchTerm.toLowerCase())
      );
    }
    
    // Add pagination cursor if provided
    if (after) {
      q = query(
        q,
        where('timestamp', '<', after)
      );
    }

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No questions found for user:', userId);
      return {
        questions: [],
        lastVisible: null,
        hasMore: false
      };
    }

    // Process documents
    const questions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to JavaScript Dates
      const timestamp = data.timestamp?.toDate?.() || 
                       data.createdAt?.toDate?.() || 
                       new Date();
      
      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });

    // Determine if more questions are available
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = questions.length >= queryLimit;

    console.log(`Retrieved ${questions.length} questions`);
    return {
      questions,
      lastVisible,
      hasMore
    };
  } catch (error) {
    console.error('Error getting user questions:', error);
    throw new Error('Failed to fetch questions from database');
  }
};

// Batch delete questions
export const deleteQuestions = async (questionIds) => {
  if (!Array.isArray(questionIds)) {
    throw new Error('questionIds must be an array');
  }
  
  // Note: In Firestore, you need to delete documents one by one
  // or use a batched write (this is a simplified version)
  try {
    const deletePromises = questionIds.map(id => 
      deleteDoc(doc(db, 'questions', id))
    );
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting questions:', error);
    throw new Error('Failed to delete questions');
  }
};