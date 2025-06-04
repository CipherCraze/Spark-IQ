import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

const assignmentsCollection = collection(db, 'assignments');
const submissionsCollection = collection(db, 'submissions');

// Upload assignment file to Firebase Storage
export const uploadAssignmentFile = async (file, teacherId) => {
  try {
    const fileRef = ref(storage, `assignments/${teacherId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading assignment file:', error);
    throw error;
  }
};

// Create a new assignment
export const createAssignment = async (teacherId, assignmentData) => {
  try {
    const assignment = {
      teacherId,
      title: assignmentData.title,
      description: assignmentData.description,
      fileUrl: assignmentData.fileUrl,
      dueDate: assignmentData.dueDate,
      subject: assignmentData.subject,
      points: assignmentData.points || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(assignmentsCollection, assignment);
    return docRef.id;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Get all assignments for a teacher
export const getTeacherAssignments = async (teacherId) => {
  try {
    const q = query(
      assignmentsCollection,
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teacher assignments:', error);
    throw error;
  }
};

// Get all assignments for a student
export const getStudentAssignments = async () => {
  try {
    const q = query(
      assignmentsCollection,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student assignments:', error);
    throw error;
  }
};

// Submit assignment
export const submitAssignment = async (studentId, assignmentId, file) => {
  try {
    // Upload submission file
    const fileRef = ref(storage, `submissions/${assignmentId}/${studentId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    // Create submission document
    const submission = {
      studentId,
      assignmentId,
      fileUrl: downloadURL,
      submittedAt: serverTimestamp(),
      status: 'submitted',
      grade: null,
      feedback: null
    };

    const docRef = await addDoc(submissionsCollection, submission);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// Get student's submissions
export const getStudentSubmissions = async (studentId) => {
  try {
    const q = query(
      submissionsCollection,
      where('studentId', '==', studentId),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting student submissions:', error);
    throw error;
  }
};

// Get submissions for an assignment
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const q = query(
      submissionsCollection,
      where('assignmentId', '==', assignmentId),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting assignment submissions:', error);
    throw error;
  }
};

// Grade submission
export const gradeSubmission = async (submissionId, grade, feedback) => {
  try {
    const submissionRef = doc(db, 'submissions', submissionId);
    await updateDoc(submissionRef, {
      grade,
      feedback,
      status: 'graded',
      gradedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

// Delete assignment and all related files/submissions
export const deleteAssignment = async (assignmentId, teacherId) => {
  try {
    // Get all submissions for this assignment
    const submissions = await getAssignmentSubmissions(assignmentId);
    
    // Delete all submission files and documents
    const batch = db.batch();
    for (const submission of submissions) {
      // Delete submission file from storage
      const submissionFileRef = ref(storage, submission.fileUrl);
      await deleteObject(submissionFileRef);
      
      // Add submission document deletion to batch
      const submissionRef = doc(db, 'submissions', submission.id);
      batch.delete(submissionRef);
    }
    
    // Get assignment document
    const assignmentDoc = await getDoc(doc(db, 'assignments', assignmentId));
    const assignmentData = assignmentDoc.data();
    
    // Delete assignment file from storage
    if (assignmentData.fileUrl) {
      const assignmentFileRef = ref(storage, `assignments/${teacherId}/${assignmentData.fileUrl}`);
      await deleteObject(assignmentFileRef);
    }
    
    // Delete assignment document
    batch.delete(doc(db, 'assignments', assignmentId));
    
    // Commit batch delete
    await batch.commit();
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}; 