import { db, isFirebaseConfigured } from './firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot,
  getDoc
} from 'firebase/firestore';

let problemsCache = null;
let themesCache = null;
let problemsUnsubscribe = null;
let themesUnsubscribe = null;
let initialLoadPromise = null;

const useFirebase = isFirebaseConfigured();

const PROBLEMS_COLLECTION = 'problems';
const THEMES_COLLECTION = 'themes';

if (!useFirebase) {
  throw new Error('Firebase must be configured. Check your .env file.');
}

// Initial data load from Firestore
const loadInitialData = async () => {
  if (initialLoadPromise) {
    return initialLoadPromise;
  }

  initialLoadPromise = (async () => {
    try {
      const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
      const themesRef = doc(db, THEMES_COLLECTION, 'data');
      
      const [problemsDoc, themesDoc] = await Promise.all([
        getDoc(problemsRef),
        getDoc(themesRef)
      ]);
      
      if (problemsDoc.exists()) {
        problemsCache = problemsDoc.data();
      } else {
        problemsCache = {};
      }
      
      if (themesDoc.exists()) {
        themesCache = themesDoc.data().themes || [];
      } else {
        themesCache = [];
      }
    } catch {
      problemsCache = {};
      themesCache = [];
    }
  })();

  return initialLoadPromise;
};

// Load initial data immediately
loadInitialData();

const saveProblemsToFirestore = async (problems) => {
  const problemsRef = doc(db, PROBLEMS_COLLECTION, 'data');
  await setDoc(problemsRef, problems);
  return true;
};

const saveThemesToFirestore = async (themes) => {
  const themesRef = doc(db, THEMES_COLLECTION, 'data');
  await setDoc(themesRef, { themes });
  return true;
};

export const subscribeToProblems = (callback) => {
  if (problemsUnsubscribe) {
    problemsUnsubscribe();
  }

  loadInitialData().then(() => {
    callback(problemsCache || {});
  });

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
  }, () => {
    callback(problemsCache || {});
  });

  return problemsUnsubscribe;
};

export const subscribeToThemes = (callback) => {
  if (themesUnsubscribe) {
    themesUnsubscribe();
  }

  loadInitialData().then(() => {
    callback(themesCache || []);
  });

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
  }, () => {
    callback(themesCache || []);
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
  const problems = getProblems();
  const updatedProblems = { ...problems };
  if (!updatedProblems[themeId]) {
    updatedProblems[themeId] = [];
  }
  updatedProblems[themeId] = [...updatedProblems[themeId], problem];
  
  await saveProblemsToFirestore(updatedProblems);
  problemsCache = updatedProblems;
  return true;
};

export const updateProblem = async (themeId, problemId, updatedProblem) => {
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
};

export const deleteProblem = async (themeId, problemId) => {
  const problems = getProblems();
  if (problems[themeId]) {
    const updatedProblems = { ...problems };
    updatedProblems[themeId] = updatedProblems[themeId].filter(p => p.id !== problemId);
    await saveProblemsToFirestore(updatedProblems);
    problemsCache = updatedProblems;
    return true;
  }
  return false;
};

export const getThemeById = (themeId) => {
  const themes = getThemes();
  return themes.find(t => t.id === themeId);
};

export const addTheme = async (theme) => {
  const themes = getThemes();
  const updatedThemes = [...themes, theme];
  await saveThemesToFirestore(updatedThemes);
  themesCache = updatedThemes;
  return true;
};

export const updateTheme = async (themeId, updatedTheme) => {
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
};

export const deleteTheme = async (themeId) => {
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
