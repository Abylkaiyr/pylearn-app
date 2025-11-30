// Debug utility to check Firebase status
import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const checkFirebaseStatus = async () => {
  const isConfigured = isFirebaseConfigured();
  
  console.log('=== Firebase Status Check ===');
  console.log('Firebase Configured:', isConfigured);
  
  if (!isConfigured) {
    console.log('❌ Firebase is NOT configured');
    console.log('Check your .env file and make sure VITE_FIREBASE_* variables are set');
    return {
      configured: false,
      usingFirebase: false,
      source: 'JSON files (fallback)'
    };
  }
  
  console.log('✅ Firebase is configured');
  
  // Try to read from Firestore
  try {
    const themesRef = doc(db, 'themes', 'data');
    const themesDoc = await getDoc(themesRef);
    
    if (themesDoc.exists()) {
      console.log('✅ Firestore themes document exists');
      console.log('Themes count:', themesDoc.data().themes?.length || 0);
      
      const problemsRef = doc(db, 'problems', 'data');
      const problemsDoc = await getDoc(problemsRef);
      
      if (problemsDoc.exists()) {
        console.log('✅ Firestore problems document exists');
        const problemsData = problemsDoc.data();
        const themeIds = Object.keys(problemsData);
        console.log('Problem themes:', themeIds);
      } else {
        console.log('⚠️ Firestore problems document does NOT exist');
      }
      
      return {
        configured: true,
        usingFirebase: true,
        source: 'Firestore (Firebase)',
        themesExist: true,
        problemsExist: problemsDoc.exists()
      };
    } else {
      console.log('⚠️ Firestore themes document does NOT exist');
      console.log('This means data will be initialized from JSON files');
      
      return {
        configured: true,
        usingFirebase: true,
        source: 'Firestore (will initialize from JSON)',
        themesExist: false,
        problemsExist: false
      };
    }
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
    return {
      configured: true,
      usingFirebase: false,
      source: 'JSON files (Firestore error)',
      error: error.message
    };
  }
};

// Call this in browser console: window.checkFirebase()
if (typeof window !== 'undefined') {
  window.checkFirebase = checkFirebaseStatus;
}

