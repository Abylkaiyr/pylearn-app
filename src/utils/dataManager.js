// Import as fallback for initial load
import problemsDataFallback from '../data/problems.json';
import themesDataFallback from '../data/themes.json';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

// Cache for data
let problemsCache = null;
let themesCache = null;
let problemsUnsubscribe = null;
let themesUnsubscribe = null;

// Check if Firebase is available
const useFirebase = isFirebaseConfigured();

// Firestore collection names
const PROBLEMS_COLLECTION = 'problems';
const THEMES_COLLECTION = 'themes';

// ========== FIREBASE FUNCTIONS ==========

// Initialize Firestore with data from JSON if empty
const initializeFirestore = async () => {
  if (!useFirebase) return;

  try {
    // Check if problems collection exists and has data
    const problemsSnapshot = await getDocs(collection(db, PROBLEMS_COLLECTION));
    if (problemsSnapshot.empty) {
      // Initialize with JSON data
      const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
      await setDoc(problemsRef, problemsDataFallback);
      console.log('Initialized Firestore problems with JSON data');
    }

    // Check if themes collection exists and has data
    const themesSnapshot = await getDocs(collection(db, THEMES_COLLECTION));
    if (themesSnapshot.empty) {
      // Initialize with JSON data
      const themesRef = doc(db, THEMES_COLLECTION, 'data');
      await setDoc(themesRef, { themes: themesDataFallback });
      console.log('Initialized Firestore themes with JSON data');
    }
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};

// Get problems from Firestore
const getProblemsFromFirestore = async () => {
  try {
    const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
    const docSnap = await getDoc(problemsRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error getting problems from Firestore:', error);
  }
  return null;
};

// Get themes from Firestore
const getThemesFromFirestore = async () => {
  try {
    const themesRef = doc(db, THEMES_COLLECTION, 'data');
    const docSnap = await getDoc(themesRef);
    if (docSnap.exists()) {
      return docSnap.data().themes || [];
    }
  } catch (error) {
    console.error('Error getting themes from Firestore:', error);
  }
  return null;
};

// Save problems to Firestore
const saveProblemsToFirestore = async (problems) => {
  if (!useFirebase) {
    console.warn('Firebase not configured, cannot save to Firestore');
    return false;
  }
  try {
    const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
    await setDoc(problemsRef, problems);
    return true;
  } catch (error) {
    console.error('Error saving problems to Firestore:', error);
    return false;
  }
};

// Save themes to Firestore
const saveThemesToFirestore = async (themes) => {
  if (!useFirebase) {
    console.warn('Firebase not configured, cannot save to Firestore');
    return false;
  }
  try {
    const themesRef = doc(db, THEMES_COLLECTION, 'data');
    await setDoc(themesRef, { themes });
    return true;
  } catch (error) {
    console.error('Error saving themes to Firestore:', error);
    return false;
  }
};

// Set up real-time listener for problems
export const subscribeToProblems = (callback) => {
  if (!useFirebase) {
    callback(problemsDataFallback);
    return () => {};
  }

  if (problemsUnsubscribe) {
    problemsUnsubscribe();
  }

  const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
  problemsUnsubscribe = onSnapshot(problemsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      problemsCache = data;
      callback(data);
    } else {
      callback(problemsDataFallback);
    }
  }, (error) => {
    console.error('Error in problems listener:', error);
    callback(problemsCache || problemsDataFallback);
  });

  return problemsUnsubscribe;
};

// Set up real-time listener for themes
export const subscribeToThemes = (callback) => {
  if (!useFirebase) {
    callback(themesDataFallback);
    return () => {};
  }

  if (themesUnsubscribe) {
    themesUnsubscribe();
  }

  const themesRef = doc(db, THEMES_COLLECTION, 'data');
  themesUnsubscribe = onSnapshot(themesRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data().themes || [];
      themesCache = data;
      callback(data);
    } else {
      callback(themesDataFallback);
    }
  }, (error) => {
    console.error('Error in themes listener:', error);
    callback(themesCache || themesDataFallback);
  });

  return themesUnsubscribe;
};

// ========== PUBLIC API ==========

// Get problems (synchronous, uses cache)
export const getProblems = () => {
  if (problemsCache) {
    return problemsCache;
  }
  return problemsDataFallback;
};

// Get themes (synchronous, uses cache)
export const getThemes = () => {
  if (themesCache) {
    return themesCache;
  }
  return themesDataFallback;
};

// Refresh problems from Firestore
export const refreshProblems = async () => {
  if (useFirebase) {
    const data = await getProblemsFromFirestore();
    if (data) {
      problemsCache = data;
      return data;
    }
  }
  // Fallback to JSON
  problemsCache = problemsDataFallback;
  return problemsDataFallback;
};

// Refresh themes from Firestore
export const refreshThemes = async () => {
  if (useFirebase) {
    const data = await getThemesFromFirestore();
    if (data) {
      themesCache = data;
      return data;
    }
  }
  // Fallback to JSON
  themesCache = themesDataFallback;
  return themesDataFallback;
};

// Get problems by theme
export const getProblemsByTheme = (themeId) => {
  const problems = getProblems();
  return problems[themeId] || [];
};

// Get problem by ID
export const getProblemById = (themeId, problemId) => {
  const problems = getProblemsByTheme(themeId);
  return problems.find(p => p.id === problemId);
};

// Add problem
export const addProblem = async (themeId, problem) => {
  const problems = getProblems();
  if (!problems[themeId]) {
    problems[themeId] = [];
  }
  problems[themeId].push(problem);
  
  if (useFirebase) {
    const success = await saveProblemsToFirestore(problems);
    if (success) {
      problemsCache = problems;
      return true;
    }
  }
  
  // Fallback: save to localStorage for export
  localStorage.setItem('problems_temp', JSON.stringify(problems));
  return true;
};

// Update problem
export const updateProblem = async (themeId, problemId, updatedProblem) => {
  const problems = getProblems();
  if (problems[themeId]) {
    const index = problems[themeId].findIndex(p => p.id === problemId);
    if (index !== -1) {
      problems[themeId][index] = { ...updatedProblem, id: problemId };
      
      if (useFirebase) {
        const success = await saveProblemsToFirestore(problems);
        if (success) {
          problemsCache = problems;
          return true;
        }
      }
      
      // Fallback: save to localStorage for export
      localStorage.setItem('problems_temp', JSON.stringify(problems));
      return true;
    }
  }
  return false;
};

// Delete problem
export const deleteProblem = async (themeId, problemId) => {
  const problems = getProblems();
  if (problems[themeId]) {
    problems[themeId] = problems[themeId].filter(p => p.id !== problemId);
    
    if (useFirebase) {
      const success = await saveProblemsToFirestore(problems);
      if (success) {
        problemsCache = problems;
        return true;
      }
    }
    
    // Fallback: save to localStorage for export
    localStorage.setItem('problems_temp', JSON.stringify(problems));
    return true;
  }
  return false;
};

// Theme management functions
export const getThemeById = (themeId) => {
  const themes = getThemes();
  return themes.find(t => t.id === themeId);
};

// Add theme
export const addTheme = async (theme) => {
  const themes = getThemes();
  themes.push(theme);
  
  if (useFirebase) {
    const success = await saveThemesToFirestore(themes);
    if (success) {
      themesCache = themes;
      return true;
    }
  }
  
  // Fallback: save to localStorage for export
  localStorage.setItem('themes_temp', JSON.stringify(themes));
  return true;
};

// Update theme
export const updateTheme = async (themeId, updatedTheme) => {
  const themes = getThemes();
  const index = themes.findIndex(t => t.id === themeId);
  if (index !== -1) {
    themes[index] = { ...updatedTheme, id: themeId };
    
    if (useFirebase) {
      const success = await saveThemesToFirestore(themes);
      if (success) {
        themesCache = themes;
        return true;
      }
    }
    
    // Fallback: save to localStorage for export
    localStorage.setItem('themes_temp', JSON.stringify(themes));
    return true;
  }
  return false;
};

// Delete theme
export const deleteTheme = async (themeId) => {
  const themes = getThemes();
  const filteredThemes = themes.filter(t => t.id !== themeId);
  if (filteredThemes.length < themes.length) {
    if (useFirebase) {
      const success = await saveThemesToFirestore(filteredThemes);
      if (success) {
        themesCache = filteredThemes;
        // Also delete all problems in this theme
        const problems = getProblems();
        delete problems[themeId];
        await saveProblemsToFirestore(problems);
        problemsCache = problems;
        return true;
      }
    }
    
    // Fallback: save to localStorage for export
    localStorage.setItem('themes_temp', JSON.stringify(filteredThemes));
    const problems = getProblems();
    delete problems[themeId];
    localStorage.setItem('problems_temp', JSON.stringify(problems));
    return true;
  }
  return false;
};

// Export functions (for backup/download)
export const exportProblems = () => {
  const problems = getProblems();
  const dataStr = JSON.stringify(problems, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'problems.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportThemes = () => {
  const themes = getThemes();
  const dataStr = JSON.stringify(themes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'themes.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Initialize Firestore on module load
if (useFirebase) {
  initializeFirestore();
  // Initial load
  refreshProblems();
  refreshThemes();
}
