/**
 * Storage Service - handles data persistence safely.
 */
const STORAGE_KEY = 'todo_app_tasks_v1';

export const Storage = {
  /**
   * Retrieve tasks array from localStorage.
   * @returns {Array} Array of tasks or empty array on failure.
   */
  loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Storage read error: Falling back to empty state.', error);
      return [];
    }
  },

  /**
   * Save tasks array to localStorage.
   * @param {Array} tasks 
   * @returns {boolean} Success status.
   */
  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Storage write error: Local storage may be full or blocked.', error);
      return false;
    }
  }
};