import problemsData from '../data/problems.json';
import themesData from '../data/themes.json';

// Load data from localStorage or use default
export const getProblems = () => {
  const stored = localStorage.getItem('problems');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default data
  localStorage.setItem('problems', JSON.stringify(problemsData));
  return problemsData;
};

export const getThemes = () => {
  const stored = localStorage.getItem('themes');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default data
  localStorage.setItem('themes', JSON.stringify(themesData));
  return themesData;
};

export const saveProblems = (problems) => {
  localStorage.setItem('problems', JSON.stringify(problems));
};

export const saveThemes = (themes) => {
  localStorage.setItem('themes', JSON.stringify(themes));
};

export const getProblemsByTheme = (themeId) => {
  const problems = getProblems();
  return problems[themeId] || [];
};

export const getProblemById = (themeId, problemId) => {
  const problems = getProblemsByTheme(themeId);
  return problems.find(p => p.id === problemId);
};

export const addProblem = (themeId, problem) => {
  const problems = getProblems();
  if (!problems[themeId]) {
    problems[themeId] = [];
  }
  problems[themeId].push(problem);
  saveProblems(problems);
};

export const updateProblem = (themeId, problemId, updatedProblem) => {
  const problems = getProblems();
  if (problems[themeId]) {
    const index = problems[themeId].findIndex(p => p.id === problemId);
    if (index !== -1) {
      problems[themeId][index] = { ...updatedProblem, id: problemId };
      saveProblems(problems);
      return true;
    }
  }
  return false;
};

export const deleteProblem = (themeId, problemId) => {
  const problems = getProblems();
  if (problems[themeId]) {
    problems[themeId] = problems[themeId].filter(p => p.id !== problemId);
    saveProblems(problems);
    return true;
  }
  return false;
};

