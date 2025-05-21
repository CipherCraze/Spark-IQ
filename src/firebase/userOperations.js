import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

// Function to get user profile data
export const getUserProfile = async (userId) => {
  try {
    console.log('Getting profile for user:', userId);
    
    // Try to get user from students collection first
    let userDoc = await getDoc(doc(db, 'students', userId));
    
    // If not found in students, try teachers collection
    if (!userDoc.exists()) {
      userDoc = await getDoc(doc(db, 'teachers', userId));
    }

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('Raw data from Firebase:', data);
      
      // Create merged data structure
      const mergedData = {
        id: userId,
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || null,
        skills: data.skills || [],
        courses: data.courses || [],
        isVerified: data.isVerified || false,
        role: data.role || '',
        joinDate: data.joinDate || '',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        settings: data.settings || {
          accentColor: '#8B5CF6',
          darkMode: true,
          density: 'Normal',
          fontSize: 'Medium',
          language: 'en',
          emailNotifications: true,
          pushNotifications: true,
          notificationsEnabled: true
        },
        social: data.social || {
          github: '',
          linkedin: '',
          twitter: ''
        },
        stats: data.stats || {
          points: 0,
          streak: 0,
          rank: 0
        },
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        education: data.education || '',
        batch: data.batch || '',
        year: data.year || '',
        subjects: data.subjects || []
      };
      
      console.log('Merged profile data:', mergedData);
      return mergedData;
    }
    console.log('No user document found');
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Function to update user profile data
export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('Updating profile for user:', userId);
    console.log('Profile data to update:', profileData);

    // Determine which collection to use
    let userDoc = await getDoc(doc(db, 'students', userId));
    const collectionName = userDoc.exists() ? 'students' : 'teachers';

    // Get current user data first
    const currentData = userDoc.exists() ? userDoc.data() : {};

    // Create a standardized update object
    const updateData = {
      ...currentData,
      ...profileData,
      lastUpdated: new Date().toISOString()
    };

    // Update the document
    await setDoc(doc(db, collectionName, userId), updateData, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Function to upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('Uploading profile picture for user:', userId);
    const storageRef = ref(storage, `profile-pictures/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Determine which collection to use
    let userDoc = await getDoc(doc(db, 'students', userId));
    const collectionName = userDoc.exists() ? 'students' : 'teachers';
    
    // Update the avatar URL in the user document
    await updateDoc(doc(db, collectionName, userId), {
      avatar: downloadURL,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Profile picture updated, URL:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Function to update user settings
export const updateUserSettings = async (userId, settings) => {
  try {
    console.log('Updating settings for user:', userId);
    console.log('Settings to update:', settings);
    
    // Determine which collection to use
    let userDoc = await getDoc(doc(db, 'students', userId));
    const collectionName = userDoc.exists() ? 'students' : 'teachers';
    
    // Get current user data
    const currentData = userDoc.exists() ? userDoc.data() : {};

    // Create update object
    const updateData = {
      ...currentData,
      settings: settings.settings || settings,
      lastUpdated: new Date().toISOString()
    };

    // Update user data if present
    if (settings.userData) {
      updateData.name = settings.userData.name || currentData.name;
      updateData.email = settings.userData.email || currentData.email;
      updateData.phone = settings.userData.phone || currentData.phone;
      updateData.location = settings.userData.location || currentData.location;
      updateData.bio = settings.userData.bio || currentData.bio;
      updateData.education = settings.userData.education || currentData.education;
    }
    
    // Update the document
    await setDoc(doc(db, collectionName, userId), updateData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Function to get user settings
export const getUserSettings = async (userId) => {
  try {
    // Try to get user from students collection first
    let userDoc = await getDoc(doc(db, 'students', userId));
    
    // If not found in students, try teachers collection
    if (!userDoc.exists()) {
      userDoc = await getDoc(doc(db, 'teachers', userId));
    }

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        settings: data.settings || {
          accentColor: '#8B5CF6',
          darkMode: true,
          density: 'Normal',
          fontSize: 'Medium',
          language: 'en',
          emailNotifications: true,
          pushNotifications: true,
          notificationsEnabled: true
        },
        userData: {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          education: data.education || ''
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
}; 