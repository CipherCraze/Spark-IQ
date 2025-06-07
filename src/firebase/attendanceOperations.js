import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const attendanceCollection = collection(db, 'attendance');

// Save attendance records for a batch
export const saveAttendance = async (teacherId, batch, date, attendanceData) => {
  try {
    const attendanceRecord = {
      teacherId,
      batch,
      date,
      records: attendanceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(attendanceCollection, attendanceRecord);
    return docRef.id;
  } catch (error) {
    console.error('Error saving attendance:', error);
    throw error;
  }
};

// Get attendance records for a batch
export const getBatchAttendance = async (batch, date) => {
  try {
    const q = query(
      attendanceCollection,
      where('batch', '==', batch),
      where('date', '==', date),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting batch attendance:', error);
    throw error;
  }
};

// Get attendance records for a teacher
export const getTeacherAttendance = async (teacherId) => {
  try {
    const q = query(
      attendanceCollection,
      where('teacherId', '==', teacherId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting teacher attendance:', error);
    throw error;
  }
}; 