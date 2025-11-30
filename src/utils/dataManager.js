import { db, isFirebaseConfigured } from './firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot
} from 'firebase/firestore';

let problemsCache = null;
let themesCache = null;
let problemsUnsubscribe = null;
let themesUnsubscribe = null;

const useFirebase = isFirebaseConfigured();

const PROBLEMS_COLLECTION = 'problems';
const THEMES_COLLECTION = 'themes';

if (!useFirebase) {
  throw new Error('Firebase must be configured. Check your .env file.');
}

const saveProblemsToFirestore = async (problems) => {
  try {
    const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
    await setDoc(problemsRef, problems);
    return true;
  } catch (error) {
    throw error;
  }
};

const saveThemesToFirestore = async (themes) => {
  try {
    const themesRef = doc(db, THEMES_COLLECTION, 'data');
    await setDoc(themesRef, { themes });
    return true;
  } catch (error) {
    throw error;
  }
};

export const subscribeToProblems = (callback) => {
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
      problemsCache = {};
      callback({});
    }
  }, (error) => {
    console.error('Firestore listener error:', error);
  });

  return problemsUnsubscribe;
};

export const subscribeToThemes = (callback) => {
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
      themesCache = [];
      callback([]);
    }
  }, (error) => {
    console.error('Firestore listener error:', error);
  });

  return themesUnsubscribe;
};

export const getProblems = () => {
  return problemsCache || {};
};

export const getThemes = () => {
  return themesCache || [];
};

export const getProblemsByTheme = (themeId) => {
  const problems = getProblems();
  return problems[themeId] || [];
};

export const getProblemById = (themeId, problemId) => {
  const problems = getProblemsByTheme(themeId);
  return problems.find(p => p.id === problemId);
};

export const addProblem = async (themeId, problem) => {
  try {
    const problems = getProblems();
    const updatedProblems = { ...problems };
    if (!updatedProblems[themeId]) {
      updatedProblems[themeId] = [];
    }
    updatedProblems[themeId] = [...updatedProblems[themeId], problem];
    
    await saveProblemsToFirestore(updatedProblems);
    problemsCache = updatedProblems;
    return true;
  } catch (error) {
    console.error('Error adding problem:', error);
    throw error;
  }
};

export const updateProblem = async (themeId, problemId, updatedProblem) => {
  try {
    const problems = getProblems();
    if (problems[themeId]) {
      const updatedProblems = { ...problems };
      const index = updatedProblems[themeId].findIndex(p => p.id === problemId);
      if (index !== -1) {
        updatedProblems[themeId] = [...updatedProblems[themeId]];
        updatedProblems[themeId][index] = { ...updatedProblem, id: problemId };
        await saveProblemsToFirestore(updatedProblems);
        problemsCache = updatedProblems;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error updating problem:', error);
    throw error;
  }
};

export const deleteProblem = async (themeId, problemId) => {
  try {
    const problems = getProblems();
    if (problems[themeId]) {
      const updatedProblems = { ...problems };
      updatedProblems[themeId] = updatedProblems[themeId].filter(p => p.id !== problemId);
      await saveProblemsToFirestore(updatedProblems);
      problemsCache = updatedProblems;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting problem:', error);
    throw error;
  }
};

export const getThemeById = (themeId) => {
  const themes = getThemes();
  return themes.find(t => t.id === themeId);
};

export const addTheme = async (theme) => {
  try {
    const themes = getThemes();
    const updatedThemes = [...themes, theme];
    await saveThemesToFirestore(updatedThemes);
    themesCache = updatedThemes;
    return true;
  } catch (error) {
    console.error('Error adding theme:', error);
    throw error;
  }
};

export const updateTheme = async (themeId, updatedTheme) => {
  try {
    const themes = getThemes();
    const index = themes.findIndex(t => t.id === themeId);
    if (index !== -1) {
      const updatedThemes = [...themes];
      updatedThemes[index] = { ...updatedTheme, id: themeId };
      await saveThemesToFirestore(updatedThemes);
      themesCache = updatedThemes;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
};

export const deleteTheme = async (themeId) => {
  try {
    const themes = getThemes();
    const filteredThemes = themes.filter(t => t.id !== themeId);
    
    if (filteredThemes.length < themes.length) {
      await saveThemesToFirestore(filteredThemes);
      themesCache = filteredThemes;
      const problems = getProblems();
      const updatedProblems = { ...problems };
      delete updatedProblems[themeId];
      await saveProblemsToFirestore(updatedProblems);
      problemsCache = updatedProblems;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
};

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
