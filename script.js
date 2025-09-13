// ===========================
// MAIN APPLICATION STATE
// ===========================

// Application state management
const AppState = {
    currentUser: null,
    tasks: [],
    currentView: 'dashboard',
    theme: 'light',
    currentDate: new Date(),
    filters: {
        status: 'all',
        priority: 'all',
        category: 'all',
        search: ''
    }
};

// ===========================
// AUTHENTICATION SYSTEM
// ===========================

class AuthManager {
    static init() {
        // Check for existing session
        const savedUser = localStorage.getItem('fleeped_user');
        const savedTheme = localStorage.getItem('fleeped_theme');
        
        if (savedUser) {
            AppState.currentUser = JSON.parse(savedUser);
        }
        
        if (savedTheme) {
            AppState.theme = savedTheme;
            document.body.dataset.theme = savedTheme;
        }
    }

    static async handleLogin(email, password, rememberMe = false) {
        // Simulate API call
        const user = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            avatar: email.charAt(0).toUpperCase(),
            loginTime: new Date().toISOString()
        };

        AppState.currentUser = user;
        
        if (rememberMe) {
            localStorage.setItem('fleeped_user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('fleeped_user', JSON.stringify(user));
        }

        // Show success message
        this.showSuccessMessage('Login successful! Welcome back!');
        
        // Redirect to dashboard after delay
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 1500);
    }

    static async handleSignup(fullName, email, password) {
        // Simulate API call
        const user = {
            id: Date.now(),
            email: email,
            name: fullName,
            avatar: fullName.charAt(0).toUpperCase(),
            loginTime: new Date().toISOString()
        };

        AppState.currentUser = user;
        localStorage.setItem('fleeped_user', JSON.stringify(user));

        this.showSuccessMessage('Account created successfully! Welcome to Fleeped!');
        
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 1500);
    }

    static handleGoogleAuth() {
        // Simulate Google OAuth
        const user = {
            id: Date.now(),
            email: 'user@gmail.com',
            name: 'Google User',
            avatar: 'G',
            loginTime: new Date().toISOString(),
            provider: 'google'
        };

        AppState.currentUser = user;
        localStorage.setItem('fleeped_user', JSON.stringify(user));

        this.showSuccessMessage('Google login successful!');
        
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 1500);
    }

    static handleFacebookAuth() {
        // Simulate Facebook OAuth
        const user = {
            id: Date.now(),
            email: 'user@facebook.com',
            name: 'Facebook User',
            avatar: 'F',
            loginTime: new Date().toISOString(),
            provider: 'facebook'
        };

        AppState.currentUser = user;
        localStorage.setItem('fleeped_user', JSON.stringify(user));

        this.showSuccessMessage('Facebook login successful!');
        
        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 1500);
    }

    static logout() {
        AppState.currentUser = null;
        localStorage.removeItem('fleeped_user');
        sessionStorage.removeItem('fleeped_user');
        this.navigateTo('welcome');
    }

    static showSuccessMessage(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }

    static navigateTo(page) {
        // Simple page navigation simulation
        console.log(`Navigating to: ${page}`);
        AppState.currentView = page;
        
        // In a real app, this would handle routing
        if (page === 'dashboard') {
            // Simulate loading dashboard
            setTimeout(() => {
                DashboardManager.init();
            }, 100);
        }
    }
}

// ===========================
// TASK MANAGEMENT SYSTEM
// ===========================

class TaskManager {
    static init() {
        // Load tasks from storage
        const savedTasks = localStorage.getItem('fleeped_tasks');
        if (savedTasks) {
            AppState.tasks = JSON.parse(savedTasks);
        }
    }

    static saveTasks() {
        localStorage.setItem('fleeped_tasks', JSON.stringify(AppState.tasks));
    }

    static addTask(taskData) {
        const newTask = {
            id: Date.now(),
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            category: taskData.category,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        AppState.tasks.push(newTask);
        this.saveTasks();
        DashboardManager.updateStats();
        DashboardManager.loadRecentTasks();
        return newTask;
    }

    static updateTask(taskId, updates) {
        const taskIndex = AppState.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            AppState.tasks[taskIndex] = {
                ...AppState.tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks();
            DashboardManager.updateStats();
            DashboardManager.loadRecentTasks();
        }
    }

    static deleteTask(taskId) {
        AppState.tasks = AppState.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        DashboardManager.updateStats();
        DashboardManager.loadRecentTasks();
    }

    static getTask(taskId) {
        return AppState.tasks.find(task => task.id === taskId);
    }

    static getFilteredTasks() {
        let filtered = [...AppState.tasks];

        // Apply status filter
        if (AppState.filters.status !== 'all') {
            if (AppState.filters.status === 'high') {
                filtered = filtered.filter(task => task.priority === 'high');
            } else {
                filtered = filtered.filter(task => task.status === AppState.filters.status);
            }
        }

        // Apply search filter
        if (AppState.filters.search) {
            const searchTerm = AppState.filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    static markAsComplete(taskId) {
        this.updateTask(taskId, { status: 'completed' });
    }

    static getTaskStats() {
        const total = AppState.tasks.length;
        const completed = AppState.tasks.filter(task => task.status === 'completed').length;
        const pending = AppState.tasks.filter(task => task.status === 'pending').length;
        
        // Check for overdue tasks
        const today = new Date();
        const overdue = AppState.tasks.filter(task => {
            if (task.status === 'completed') return false;
            const dueDate = new Date(task.dueDate);
            return dueDate < today;
        }).length;

        return { total, completed, pending, overdue };
    }
}

// ===========================
// DASHBOARD MANAGEMENT
// ===========================

class DashboardManager {
    static init() {
        this.updateStats();
        this.loadRecentTasks();
        this.generateCalendar();
        this.initializeFilters();
        this.updateUserProfile();
    }

    static updateStats() {
        const stats = TaskManager.getTaskStats();
        
        const elements = {
            totalTasks: document.getElementById('totalTasks'),
            completedTasks: document.getElementById('completedTasks'),
            pendingTasks: document.getElementById('pendingTasks'),
            overdueTasks: document.getElementById('overdueTasks')
        };

        // Animate counters
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (element) {
                const statKey = key.replace('Tasks', '');
                this.animateCounter(element, stats[statKey] || 0);
            }
        });
    }

    static animateCounter(element, target) {
        const start = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (target - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    static loadRecentTasks() {
        const taskContainer = document.getElementById('recentTasks');
        if (!taskContainer) return;

        const filteredTasks = TaskManager.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>No Tasks Yet</h3>
                    <p>Start by creating your first task to get organized</p>
                    <button class="btn" onclick="UIManager.showAddTaskModal()">Create First Task</button>
                </div>
            `;
            return;
        }

        // Show recent tasks (latest 5)
        const recentTasks = filteredTasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        taskContainer.innerHTML = recentTasks.map(task => this.createTaskElement(task)).join('');
    }

    static createTaskElement(task) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = task.status !== 'completed' && dueDate < new Date();
        
        return `
            <div class="task-item" onclick="UIManager.showTaskDetails(${task.id})">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    ${task.status === 'completed' ? '<span style="color: var(--secondary)">✓</span>' : ''}
                </div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    <span ${isOverdue ? 'style="color: var(--danger)"' : ''}>📅 ${this.formatDate(task.dueDate)}</span>
                    <span>📂 ${task.category}</span>
                    <span class="status-${task.status}">${task.status}</span>
                </div>
            </div>
        `;
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    static generateCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonth = document.getElementById('currentMonth');
        if (!calendar || !currentMonth) return;

        const now = AppState.currentDate;
        
        currentMonth.textContent = now.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        calendar.innerHTML = '';
        
        // Add day headers
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = '600';
            dayHeader.style.color = 'var(--text-secondary)';
            calendar.appendChild(dayHeader);
        });
        
        // Get calendar data
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startDate = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startDate; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendar.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const today = new Date();
            if (day === today.getDate() && 
                now.getMonth() === today.getMonth() && 
                now.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            // Check if day has tasks
            const dayTasks = AppState.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.getDate() === day &&
                       taskDate.getMonth() === now.getMonth() &&
                       taskDate.getFullYear() === now.getFullYear();
            });
            
            if (dayTasks.length > 0) {
                dayElement.classList.add('has-task');
                dayElement.title = `${dayTasks.length} task(s) due`;
            }
            
            calendar.appendChild(dayElement);
        }
    }

    static initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                AppState.filters.status = btn.dataset.filter;
                this.loadRecentTasks();
            });
        });
    }

    static updateUserProfile() {
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn && AppState.currentUser) {
            profileBtn.textContent = AppState.currentUser.avatar;
        }
    }

    static navigateMonth(direction) {
        if (direction === 'prev') {
            AppState.currentDate.setMonth(AppState.currentDate.getMonth() - 1);
        } else {
            AppState.currentDate.setMonth(AppState.currentDate.getMonth() + 1);
        }
        this.generateCalendar();
    }
}

// ===========================
// UI MANAGEMENT
// ===========================

class UIManager {
    static showAddTaskModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Task</h2>
                    <button class="modal-close" onclick="UIManager.closeModal()">&times;</button>
                </div>
                <form id="addTaskForm" onsubmit="UIManager.handleAddTask(event)">
                    <div class="form-group">
                        <label>Task Title</label>
                        <input type="text" name="title" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="3"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Priority</label>
                            <select name="priority" required>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Due Date</label>
                            <input type="date" name="dueDate" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <input type="text" name="category" placeholder="e.g., Work, Personal" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="UIManager.closeModal()">Cancel</button>
                        <button type="submit" class="btn">Create Task</button>
                    </div>
                </form>
            </div>
        `;
        
        this.addModalStyles();
        document.body.appendChild(modal);
        
        // Set minimum date to today
        const dateInput = modal.querySelector('input[type="date"]');
        dateInput.min = new Date().toISOString().split('T')[0];
    }

    static showTaskDetails(taskId) {
        const task = TaskManager.getTask(taskId);
        if (!task) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Task Details</h2>
                    <button class="modal-close" onclick="UIManager.closeModal()">&times;</button>
                </div>
                <div class="task-details">
                    <div class="task-detail-header">
                        <h3>${task.title}</h3>
                        <div class="task-status-badge status-${task.status}">${task.status}</div>
                    </div>
                    <p class="task-description">${task.description}</p>
                    <div class="task-meta-grid">
                        <div class="meta-item">
                            <strong>Priority:</strong>
                            <span class="priority-${task.priority}">${task.priority}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Due Date:</strong>
                            <span>${new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Category:</strong>
                            <span>${task.category}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Created:</strong>
                            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    ${task.status !== 'completed' ? 
                        `<button class="btn btn-secondary" onclick="UIManager.markTaskComplete(${task.id})">Mark Complete</button>` : 
                        `<button class="btn btn-secondary" onclick="UIManager.markTaskPending(${task.id})">Mark Pending</button>`
                    }
                    <button class="btn btn-warning" onclick="UIManager.editTask(${task.id})">Edit</button>
                    <button class="btn btn-danger" onclick="UIManager.deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    static handleAddTask(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            category: formData.get('category')
        };
        
        TaskManager.addTask(taskData);
        this.closeModal();
    }

    static markTaskComplete(taskId) {
        TaskManager.markAsComplete(taskId);
        this.closeModal();
    }

    static markTaskPending(taskId) {
        TaskManager.updateTask(taskId, { status: 'pending' });
        this.closeModal();
    }

    static deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            TaskManager.deleteTask(taskId);
            this.closeModal();
        }
    }

    static editTask(taskId) {
        // Implementation for edit task modal
        console.log('Edit task:', taskId);
        this.closeModal();
    }

    static closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    static addModalStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-secondary);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--text-primary);
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border);
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--primary);
            }
            
            .modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border);
            }
            
            .task-details {
                margin-bottom: 2rem;
            }
            
            .task-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .task-status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
            }
            
            .status-pending {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning);
            }
            
            .status-completed {
                background: rgba(16, 185, 129, 0.1);
                color: var(--secondary);
            }
            
            .task-description {
                margin-bottom: 1.5rem;
                color: var(--text-secondary);
                line-height: 1.6;
            }
            
            .task-meta-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .meta-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .btn-warning {
                background: var(--warning);
                color: white;
            }
            
            .btn-danger {
                background: var(--danger);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===========================
// GLOBAL EVENT HANDLERS
// ===========================

// Welcome page functions
function handleGetStarted() {
    AuthManager.navigateTo('login');
}

// Login page functions
function handleLogin(event) {
    event.preventDefault();
    const loginBtn = document.getElementById('loginBtn');
    const formData = new FormData(event.target);
    
    loginBtn.classList.add('loading');
    loginBtn.textContent = 'Signing In';
    
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    setTimeout(() => {
        AuthManager.handleLogin(email, password, rememberMe);
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Sign In';
    }, 1000);
}

function signInWithGoogle() {
    AuthManager.handleGoogleAuth();
}

function signInWithFacebook() {
    AuthManager.handleFacebookAuth();
}

function goToSignUp() {
    AuthManager.navigateTo('signup');
}

function forgotPassword() {
    const email = prompt('Enter your email address:');
    if (email) {
        alert(`Password reset link sent to ${email}`);
    }
}

// Signup page functions
function handleCreateAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    
    AuthManager.handleSignup(fullName, email, password);
}

function signUpWithGoogle() {
    AuthManager.handleGoogleAuth();
}

function signUpWithFacebook() {
    AuthManager.handleFacebookAuth();
}

function goToLogin() {
    AuthManager.navigateTo('login');
}

// Dashboard functions
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (body.dataset.theme === 'light') {
        body.dataset.theme = 'dark';
        AppState.theme = 'dark';
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        body.dataset.theme = 'light';
        AppState.theme = 'light';
        if (themeToggle) themeToggle.textContent = '🌙';
    }
    
    localStorage.setItem('fleeped_theme', AppState.theme);
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');
    
    if (passwordInput && toggleBtn) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }
}

function addNewTask() {
    UIManager.showAddTaskModal();
}

function viewAllTasks() {
    console.log('Navigate to tasks list page');
}

function viewCalendar() {
    console.log('Navigate to calendar view');
}

function viewProfile() {
    console.log('Navigate to profile page');
}

function viewDetailedStats() {
    console.log('View detailed statistics');
}

function toggleProfile() {
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.innerHTML = `
        <div class="profile-item" onclick="viewProfile()">Profile</div>
        <div class="profile-item" onclick="AuthManager.logout()">Logout</div>
    `;
    
    // Add dropdown styles if not exists
    if (!document.getElementById('profile-dropdown-styles')) {
        const style = document.createElement('style');
        style.id = 'profile-dropdown-styles';
        style.textContent = `
            .profile-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--bg-card);
                border-radius: 8px;
                box-shadow: var(--shadow);
                padding: 0.5rem 0;
                min-width: 150px;
                z-index: 1000;
                animation: fadeIn 0.2s ease;
            }
            
            .profile-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: background 0.2s;
                color: var(--text-primary);
            }
            
            .profile-item:hover {
                background: rgba(139, 92, 246, 0.1);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    const profileMenu = document.querySelector('.profile-menu');
    const existingDropdown = profileMenu.querySelector('.profile-dropdown');
    
    if (existingDropdown) {
        profileMenu.removeChild(existingDropdown);
    } else {
        profileMenu.appendChild(dropdown);
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!profileMenu.contains(e.target)) {
                    const dropdown = profileMenu.querySelector('.profile-dropdown');
                    if (dropdown) {
                        profileMenu.removeChild(dropdown);
                    }
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 100);
    }
}

function previousMonth() {
    DashboardManager.navigateMonth('prev');
}

function nextMonth() {
    DashboardManager.navigateMonth('next');
}

// ===========================
// SEARCH AND FILTER SYSTEM
// ===========================

class SearchManager {
    static initSearch() {
        const searchInput = document.getElementById('taskSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    }

    static handleSearch(event) {
        AppState.filters.search = event.target.value;
        DashboardManager.loadRecentTasks();
    }

    static clearSearch() {
        const searchInput = document.getElementById('taskSearch');
        if (searchInput) {
            searchInput.value = '';
            AppState.filters.search = '';
            DashboardManager.loadRecentTasks();
        }
    }
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================

class NotificationManager {
    static init() {
        this.checkDueTasks();
        // Check every hour
        setInterval(() => this.checkDueTasks(), 3600000);
    }

    static checkDueTasks() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueTasks = AppState.tasks.filter(task => {
            if (task.status === 'completed') return false;
            const dueDate = new Date(task.dueDate);
            return dueDate.toDateString() === today.toDateString() || 
                   dueDate.toDateString() === tomorrow.toDateString();
        });

        if (dueTasks.length > 0 && 'Notification' in window) {
            this.requestPermission().then(permission => {
                if (permission === 'granted') {
                    dueTasks.forEach(task => {
                        const dueDate = new Date(task.dueDate);
                        const isToday = dueDate.toDateString() === today.toDateString();
                        
                        new Notification(`Task ${isToday ? 'Due Today' : 'Due Tomorrow'}`, {
                            body: task.title,
                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238B5CF6"><path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/></svg>',
                            tag: `task-${task.id}`
                        });
                    });
                }
            });
        }
    }

    static requestPermission() {
        return new Promise((resolve) => {
            if ('Notification' in window) {
                Notification.requestPermission().then(resolve);
            } else {
                resolve('denied');
            }
        });
    }
}

// ===========================
// CALENDAR VIEW SYSTEM
// ===========================

class CalendarViewManager {
    static showFullCalendar() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content calendar-modal">
                <div class="modal-header">
                    <h2>Calendar View</h2>
                    <button class="modal-close" onclick="UIManager.closeModal()">&times;</button>
                </div>
                <div class="calendar-navigation">
                    <button class="btn btn-secondary" onclick="CalendarViewManager.navigateCalendar('prev')">← Previous</button>
                    <h3 id="calendarModalTitle"></h3>
                    <button class="btn btn-secondary" onclick="CalendarViewManager.navigateCalendar('next')">Next →</button>
                </div>
                <div class="full-calendar" id="fullCalendar"></div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: var(--primary)"></div>
                        <span>Today</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: var(--secondary)"></div>
                        <span>Has Tasks</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: var(--danger)"></div>
                        <span>Overdue</span>
                    </div>
                </div>
            </div>
        `;
        
        this.addCalendarModalStyles();
        document.body.appendChild(modal);
        this.renderFullCalendar();
    }

    static renderFullCalendar() {
        const calendar = document.getElementById('fullCalendar');
        const title = document.getElementById('calendarModalTitle');
        const now = AppState.currentDate;
        
        title.textContent = now.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        calendar.innerHTML = '';
        
        // Add day headers
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });
        
        // Generate calendar days
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startDate = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // Add empty cells
        for (let i = 0; i < startDate; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day-cell empty';
            calendar.appendChild(emptyDay);
        }
        
        // Add month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-cell';
            
            const dayTasks = AppState.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.getDate() === day &&
                       taskDate.getMonth() === now.getMonth() &&
                       taskDate.getFullYear() === now.getFullYear();
            });
            
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-tasks">
                    ${dayTasks.slice(0, 3).map(task => `
                        <div class="day-task priority-${task.priority}" title="${task.title}">
                            ${task.title.substring(0, 15)}${task.title.length > 15 ? '...' : ''}
                        </div>
                    `).join('')}
                    ${dayTasks.length > 3 ? `<div class="day-task-more">+${dayTasks.length - 3} more</div>` : ''}
                </div>
            `;
            
            const today = new Date();
            if (day === today.getDate() && 
                now.getMonth() === today.getMonth() && 
                now.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            if (dayTasks.length > 0) {
                dayElement.classList.add('has-tasks');
            }
            
            calendar.appendChild(dayElement);
        }
    }

    static navigateCalendar(direction) {
        if (direction === 'prev') {
            AppState.currentDate.setMonth(AppState.currentDate.getMonth() - 1);
        } else {
            AppState.currentDate.setMonth(AppState.currentDate.getMonth() + 1);
        }
        this.renderFullCalendar();
    }

    static addCalendarModalStyles() {
        if (document.getElementById('calendar-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'calendar-modal-styles';
        style.textContent = `
            .calendar-modal {
                max-width: 900px;
                width: 95%;
            }
            
            .calendar-navigation {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            
            .full-calendar {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: var(--border);
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 2rem;
            }
            
            .calendar-day-header {
                background: var(--primary);
                color: white;
                padding: 1rem;
                text-align: center;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .calendar-day-cell {
                background: var(--bg-card);
                min-height: 120px;
                padding: 0.5rem;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            
            .calendar-day-cell.empty {
                background: rgba(0, 0, 0, 0.05);
            }
            
            .calendar-day-cell.today {
                background: rgba(139, 92, 246, 0.1);
                border: 2px solid var(--primary);
            }
            
            .day-number {
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
            }
            
            .day-tasks {
                flex: 1;
                overflow: hidden;
            }
            
            .day-task {
                background: rgba(139, 92, 246, 0.1);
                color: var(--primary);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                margin-bottom: 0.25rem;
                cursor: pointer;
            }
            
            .day-task.priority-high {
                background: rgba(239, 68, 68, 0.1);
                color: var(--danger);
            }
            
            .day-task.priority-medium {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning);
            }
            
            .day-task.priority-low {
                background: rgba(16, 185, 129, 0.1);
                color: var(--secondary);
            }
            
            .day-task-more {
                font-size: 0.7rem;
                color: var(--text-secondary);
                font-style: italic;
            }
            
            .calendar-legend {
                display: flex;
                justify-content: center;
                gap: 2rem;
                flex-wrap: wrap;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }
            
            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }
            
            @media (max-width: 768px) {
                .calendar-modal {
                    width: 98%;
                    height: 95vh;
                }
                
                .calendar-day-cell {
                    min-height: 80px;
                    padding: 0.25rem;
                }
                
                .calendar-day-header {
                    padding: 0.5rem;
                    font-size: 0.8rem;
                }
                
                .calendar-navigation {
                    flex-direction: column;
                    gap: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===========================
// DATA EXPORT/IMPORT SYSTEM
// ===========================

class DataManager {
    static exportTasks() {
        const data = {
            tasks: AppState.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleeped-tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks && Array.isArray(data.tasks)) {
                    if (confirm(`This will import ${data.tasks.length} tasks. Continue?`)) {
                        AppState.tasks = [...AppState.tasks, ...data.tasks];
                        TaskManager.saveTasks();
                        DashboardManager.updateStats();
                        DashboardManager.loadRecentTasks();
                        alert('Tasks imported successfully!');
                    }
                } else {
                    alert('Invalid file format');
                }
            } catch (error) {
                alert('Error reading file');
            }
        };
        reader.readAsText(file);
    }
}

// ===========================
// INITIALIZATION
// ===========================

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AuthManager.init();
    TaskManager.init();
    
    // Initialize dashboard if elements exist
    if (document.getElementById('totalTasks')) {
        DashboardManager.init();
        SearchManager.initSearch();
        NotificationManager.init();
    }
    
    // Initialize form handlers
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.querySelector('form[onsubmit*="handleCreateAccount"]');
    if (signupForm) {
        signupForm.addEventListener('submit', handleCreateAccount);
    }
    
    // Auto-focus email field on login/signup pages
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
    
    // Initialize keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('taskSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + N to add new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (document.getElementById('totalTasks')) {
                addNewTask();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                UIManager.closeModal();
            }
        }
    });
});

// Make functions globally available
window.AuthManager = AuthManager;
window.TaskManager = TaskManager;
window.DashboardManager = DashboardManager;
window.UIManager = UIManager;
window.CalendarViewManager = CalendarViewManager;
window.DataManager = DataManager;