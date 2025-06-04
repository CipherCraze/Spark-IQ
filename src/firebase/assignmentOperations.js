import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

const assignmentsCollection = collection(db, 'assignments');
const submissionsCollection = collection(db, 'submissions');

// Upload assignment file to Firebase Storage
export const uploadAssignmentFile = async (file, teacherId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fileRef = ref(storage, `assignments/${teacherId}/${fileName}`);
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
      fileUrl: assignmentData.fileUrl || null,
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
    // Check if submission already exists
    const existingSubmissionQuery = query(
      submissionsCollection,
      where('studentId', '==', studentId),
      where('assignmentId', '==', assignmentId)
    );
    const existingSubmissions = await getDocs(existingSubmissionQuery);
    
    if (!existingSubmissions.empty) {
      throw new Error('Assignment already submitted');
    }

    // Upload submission file
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fileRef = ref(storage, `submissions/${assignmentId}/${studentId}/${fileName}`);
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
    
    // Check if the submission exists
    const submissionDoc = await getDoc(submissionRef);
    if (!submissionDoc.exists()) {
      throw new Error('Submission not found');
    }
    
    await updateDoc(submissionRef, {
      grade,
      feedback: feedback || null,
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
    // Get assignment document first
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentDoc = await getDoc(assignmentRef);
    
    if (!assignmentDoc.exists()) {
      throw new Error('Assignment not found');
    }

    const assignmentData = assignmentDoc.data();

    // Verify that the teacher owns this assignment
    if (assignmentData.teacherId !== teacherId) {
      throw new Error('Unauthorized: You can only delete your own assignments');
    }

    // Delete assignment file from storage if it exists
    if (assignmentData.fileUrl) {
      try {
        const fileRef = ref(storage, assignmentData.fileUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn('Error deleting assignment file:', error);
        // Continue with deletion even if file deletion fails
      }
    }

    // Get all submissions for this assignment
    const submissionsQuery = query(
      submissionsCollection, 
      where('assignmentId', '==', assignmentId)
    );
    const querySnapshot = await getDocs(submissionsQuery);

    // Create a new batch
    const batch = writeBatch(db);

    // Delete submission files and add document deletions to batch
    for (const docSnapshot of querySnapshot.docs) {
      const submissionData = docSnapshot.data();
      
      // Delete submission file if it exists
      if (submissionData.fileUrl) {
        try {
          const fileRef = ref(storage, submissionData.fileUrl);
          await deleteObject(fileRef);
        } catch (error) {
          console.warn('Error deleting submission file:', error);
          // Continue with deletion even if file deletion fails
        }
      }

      // Add submission document deletion to batch
      batch.delete(docSnapshot.ref);
    }

    // Delete the assignment document
    batch.delete(assignmentRef);

    // Commit all deletions
    await batch.commit();

    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};