import { Storage } from './storage.js';

class ListixApp {
  constructor() {
    this.tasks = Storage.loadTasks();
    this.currentFilter = 'all';
    this.searchQuery = '';

    // Theme Setup
    this.isDarkMode = localStorage.getItem('listix_theme') === 'dark';
    this.themeToggleNav = document.getElementById('theme-toggle-nav');
    this.themeToggleWorkspace = document.getElementById('theme-toggle-workspace');

    // Screen Views & Navigation
    this.heroScreen = document.getElementById('hero-screen');
    this.appWorkspace = document.getElementById('app-workspace');
    this.launchAppCta = document.getElementById('launch-app-cta');
    this.navLaunchBtn = document.getElementById('nav-launch-btn');
    this.returnLandingBtn = document.getElementById('return-landing-btn');
    this.brandNavTrigger = document.getElementById('brand-nav-trigger');

    // Sidebar & Drawer Controls
    this.sidebar = document.getElementById('app-sidebar');
    this.sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    this.sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    this.currentViewTitle = document.getElementById('current-view-title');

    // Badges & Progress
    this.badgeAll = document.getElementById('badge-all');
    this.badgeActive = document.getElementById('badge-active');
    this.badgeCompleted = document.getElementById('badge-completed');
    this.progressBarFill = document.getElementById('progress-bar-fill');
    this.progressPercentLabel = document.getElementById('progress-percent-label');

    // Search & Priority
    this.taskSearchInput = document.getElementById('task-search-input');
    this.prioritySelect = document.getElementById('priority-select');

    // Features Modal
    this.featuresModal = document.getElementById('features-modal');
    this.scrollFeaturesBtn = document.getElementById('scroll-features-btn');
    this.closeModalBtn = document.getElementById('close-modal-btn');
    this.modalStartBtn = document.getElementById('modal-start-btn');

    // Workspace DOM
    this.form = document.getElementById('todo-form');
    this.input = document.getElementById('todo-input');
    this.todoList = document.getElementById('todo-list');
    this.emptyState = document.getElementById('empty-state');
    this.stats = document.getElementById('task-stats');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');

    this.applyTheme();
    this.initEventListeners();
    this.render();
  }

  // --- Theme Toggle Logic ---
  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      if (this.themeToggleNav) this.themeToggleNav.textContent = '☀️';
      if (this.themeToggleWorkspace) this.themeToggleWorkspace.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      if (this.themeToggleNav) this.themeToggleNav.textContent = '🌙';
      if (this.themeToggleWorkspace) this.themeToggleWorkspace.textContent = '🌙';
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('listix_theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  initEventListeners() {
    // Theme Toggles
    if (this.themeToggleNav) this.themeToggleNav.addEventListener('click', () => this.toggleTheme());
    if (this.themeToggleWorkspace) this.themeToggleWorkspace.addEventListener('click', () => this.toggleTheme());

    // Stage Switch Triggers
    this.launchAppCta.addEventListener('click', () => this.switchStage('workspace'));
    this.navLaunchBtn.addEventListener('click', () => this.switchStage('workspace'));
    this.returnLandingBtn.addEventListener('click', () => this.switchStage('hero'));
    this.brandNavTrigger.addEventListener('click', () => this.switchStage('hero'));

    // Sidebar Toggle
    this.sidebarToggleBtn.addEventListener('click', () => {
      this.sidebar.classList.toggle('collapsed');
      this.sidebar.classList.toggle('mobile-open');
    });

    this.sidebarCloseBtn.addEventListener('click', () => {
      this.sidebar.classList.add('collapsed');
      this.sidebar.classList.remove('mobile-open');
    });

    // Real-Time Search Listener
    if (this.taskSearchInput) {
      this.taskSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Features Modal Logic
    if (this.scrollFeaturesBtn && this.featuresModal) {
      this.scrollFeaturesBtn.addEventListener('click', () => {
        this.featuresModal.classList.remove('hidden-stage');
        this.featuresModal.classList.add('active-stage');
      });

      const closeModal = () => {
        this.featuresModal.classList.remove('active-stage');
        this.featuresModal.classList.add('hidden-stage');
      };

      if (this.closeModalBtn) this.closeModalBtn.addEventListener('click', closeModal);
      this.featuresModal.addEventListener('click', (e) => {
        if (e.target === this.featuresModal) closeModal();
      });

      if (this.modalStartBtn) {
        this.modalStartBtn.addEventListener('click', () => {
          closeModal();
          this.switchStage('workspace');
        });
      }
    }

    // CRUD State Listeners
    this.form.addEventListener('submit', (e) => this.handleAddTask(e));
    this.todoList.addEventListener('click', (e) => this.handleListClick(e));
    this.todoList.addEventListener('dblclick', (e) => this.handleListDoubleClick(e));

    // Sidebar Filter Buttons Switch
    this.filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;

        const labels = { all: 'All Tasks', active: 'Active Tasks', completed: 'Completed Tasks' };
        this.currentViewTitle.textContent = labels[this.currentFilter];

        if (window.innerWidth < 900) {
          this.sidebar.classList.remove('mobile-open');
          this.sidebar.classList.add('collapsed');
        }

        this.render();
      });
    });

    // Clear completed tasks
    this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
  }

  switchStage(target) {
    if (target === 'workspace') {
      this.heroScreen.classList.remove('active-stage');
      this.heroScreen.classList.add('hidden-stage');

      this.appWorkspace.classList.remove('hidden-stage');
      this.appWorkspace.classList.add('active-stage');
      this.input.focus();
    } else {
      this.appWorkspace.classList.remove('active-stage');
      this.appWorkspace.classList.add('hidden-stage');

      this.heroScreen.classList.remove('hidden-stage');
      this.heroScreen.classList.add('active-stage');
    }
  }

  handleAddTask(e) {
    e.preventDefault();
    const title = this.input.value.trim();
    if (!title) return;

    const priority = this.prioritySelect ? this.prioritySelect.value : 'medium';

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask);
    this.commit();
    this.input.value = '';
    this.input.focus();
  }

  toggleTask(id) {
    let justCompleted = false;
    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        if (!task.completed) justCompleted = true;
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    this.commit();

    // Check if ALL tasks are completed -> Fire Confetti celebration!
    const allCompleted = this.tasks.length > 0 && this.tasks.every(t => t.completed);
    if (justCompleted && allCompleted && typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.commit();
  }

  updateTaskTitle(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      this.deleteTask(id);
      return;
    }
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, title: trimmed } : task
    );
    this.commit();
  }

  handleClearCompleted() {
    this.tasks = this.tasks.filter((task) => !task.completed);
    this.commit();
  }

  commit() {
    Storage.saveTasks(this.tasks);
    this.render();
  }

  handleListClick(e) {
    const target = e.target;
    const itemEl = target.closest('.todo-item');
    if (!itemEl) return;

    const id = itemEl.dataset.id;

    if (target.classList.contains('todo-chk')) {
      this.toggleTask(id);
      return;
    }

    if (target.classList.contains('delete-btn')) {
      this.deleteTask(id);
      return;
    }

    if (target.classList.contains('edit-btn')) {
      this.enterEditMode(itemEl, id);
    }
  }

  handleListDoubleClick(e) {
    if (e.target.classList.contains('todo-title')) {
      const itemEl = e.target.closest('.todo-item');
      this.enterEditMode(itemEl, itemEl.dataset.id);
    }
  }

  enterEditMode(itemEl, id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    const textSpan = itemEl.querySelector('.todo-title');
    const actionsDiv = itemEl.querySelector('.item-actions');

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input-field';
    editInput.value = task.title;
    editInput.maxLength = 150;

    textSpan.replaceWith(editInput);
    if (actionsDiv) actionsDiv.style.display = 'none';

    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    const finishEdit = (save) => {
      if (save) {
        this.updateTaskTitle(id, editInput.value);
      } else {
        this.render();
      }
    };

    editInput.addEventListener('blur', () => finishEdit(true), { once: true });
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') editInput.blur();
      if (e.key === 'Escape') {
        editInput.removeEventListener('blur', () => finishEdit(true));
        finishEdit(false);
      }
    });
  }

  getFilteredTasks() {
    let result = this.tasks;

    if (this.currentFilter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (this.currentFilter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    if (this.searchQuery) {
      result = result.filter((t) => t.title.toLowerCase().includes(this.searchQuery));
    }

    return result;
  }

  render() {
    const filtered = this.getFilteredTasks();
    this.todoList.innerHTML = '';

    filtered.forEach((task) => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-chk';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.title}" as complete`);

      const span = document.createElement('span');
      span.className = 'todo-title';
      span.textContent = task.title;

      const priorityBadge = document.createElement('span');
      const pr = task.priority || 'medium';
      priorityBadge.className = `task-priority-tag priority-${pr}`;
      priorityBadge.textContent = pr;

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit-btn';
      editBtn.textContent = 'Edit';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.textContent = 'Delete';

      actions.append(editBtn, deleteBtn);
      li.append(checkbox, span, priorityBadge, actions);
      this.todoList.appendChild(li);
    });

    const totalCount = this.tasks.length;
    const activeCount = this.tasks.filter((t) => !t.completed).length;
    const completedCount = this.tasks.filter((t) => t.completed).length;

    this.badgeAll.textContent = totalCount;
    this.badgeActive.textContent = activeCount;
    this.badgeCompleted.textContent = completedCount;

    const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    this.progressBarFill.style.width = `${percent}%`;
    this.progressPercentLabel.textContent = `${percent}%`;

    this.stats.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;

    if (filtered.length === 0) {
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ListixApp();
});