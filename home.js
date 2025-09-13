
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
    import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

    const firebaseConfig = {
        apiKey: "AIzaSyAXuigFW9jHpIAqQWVlsCJk-jFmktb3oH8",
        authDomain: "nextask-d818b.firebaseapp.com",
        projectId: "nextask-d818b",
        storageBucket: "nextask-d818b.appspot.com",
        messagingSenderId: "644127952047",
        appId: "1:644127952047:web:5b205ef88eb796cec8585a"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    window.firebaseServices = { auth, db };  // Make available globally

    // Global variables
    let tasks = [];
    let currentFilter = 'all';
    let currentDate = new Date();
    let editingTaskId = null;
    let isDarkTheme = false;
    let fullCalendarDate = new Date();
    let selectedCalendarDate = null;

    document.addEventListener('DOMContentLoaded', function() {
        loadTasksFromFirestore();
        updateStats();
        renderTasks();
        generateCalendar();
        updateProgress();
    });

    function addNewTask() {
        editingTaskId = null;
        document.getElementById('modalTitle').textContent = 'Add New Task';
        document.getElementById('taskForm').reset();
        document.getElementById('taskModal').classList.add('show');
    }

    async function saveTask(event) {
        event.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const dueDate = document.getElementById('taskDueDate').value;

        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.uid) {
            alert('Please login to save tasks.');
            return;
        }

        const task = {
            uid: userData.uid,
            title,
            description,
            priority,
            category,
            dueDate,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(window.firebaseServices.db, 'tasks'), task);
            alert('Task saved successfully!');
            loadTasksFromFirestore();  // Reload tasks after saving
            closeModal();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task: ' + error.message);
        }
    }

    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            editingTaskId = taskId;
            document.getElementById('modalTitle').textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskDueDate').value = task.dueDate;
            document.getElementById('taskModal').classList.add('show');
        }
    }

    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            // Deletion should remove from Firestore as well
            alert('Delete functionality not implemented for Firestore yet.');
        }
    }

    function completeTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            alert('Updating status in Firestore not implemented yet.');
            // Reminder: You could implement Firestore document update here
        }
    }

    function filterTasks(filter) {
        currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        renderTasks();
    }

    function renderTasks() {
        const container = document.getElementById('recentTasks');
        let filteredTasks = tasks;
        
        switch (currentFilter) {
            case 'pending':
                filteredTasks = tasks.filter(t => t.status === 'pending');
                break;
            case 'completed':
                filteredTasks = tasks.filter(t => t.status === 'completed');
                break;
            case 'high':
                filteredTasks = tasks.filter(t => t.priority === 'high');
                break;
        }
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>No Tasks Found</h3>
                    <p>No tasks match your current filter. Try creating a new task!</p>
                    <button class="btn" onclick="addNewTask()">Create Task</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredTasks.slice(0, 5).map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
            
            return `
                <div class="task-item">
                    <div class="task-header">
                        <div>
                            <div class="task-title">${task.title}</div>
                            ${task.description ? `<div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">${task.description}</div>` : ''}
                        </div>
                        <div class="task-status ${task.status}">
                            <div class="status-icon">${task.status === 'completed' ? '✓' : '○'}</div>
                            ${task.status}
                        </div>
                    </div>
                    <div class="task-meta">
                        ${task.dueDate ? `<div class="meta-item ${isOverdue ? 'style="color: var(--danger);"' : ''}">
                            <span class="meta-icon">📅</span>
                            ${new Date(task.dueDate).toLocaleDateString()}
                        </div>` : ''}
                        <div class="task-priority priority-${task.priority}">${task.priority}</div>
                        ${task.category ? `<div class="task-category">${task.category}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn btn-complete" onclick="completeTask('${task.id}')">
                            ${task.status === 'completed' ? 'Undo' : 'Complete'}
                        </button>
                        <button class="task-action-btn btn-edit" onclick="editTask('${task.id}')">Edit</button>
                        <button class="task-action-btn btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function loadTasksFromFirestore() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.uid) {
            tasks = [];
            renderTasks();
            return;
        }

        const q = query(collection(window.firebaseServices.db, 'tasks'), where('uid', '==', userData.uid));
        const snapshot = await getDocs(q);

        tasks = [];
        snapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        updateStats();
        renderTasks();
        generateCalendar();
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('overdueTasks').textContent = overdue;
    }

    function updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        document.getElementById('progressText').textContent = `${percentage}%`;
        const progressRing = document.getElementById('progressRing');
        const degrees = (percentage / 100) * 360;
        progressRing.style.background = `conic-gradient(var(--secondary) ${degrees}deg, var(--border) ${degrees}deg)`;
    }

    function generateCalendar() { /* existing unchanged code */ }
    function previousMonth() { /* unchanged */ }
    function nextMonth() { /* unchanged */ }
    function selectDate(dateString) { /* unchanged */ }
    function showCalendarModal() { /* unchanged */ }
    function closeCalendarModal() { /* unchanged */ }
    function generateFullCalendar() { /* unchanged */ }
    function selectCalendarDate(dateString) { /* unchanged */ }
    function previousMonthFull() { /* unchanged */ }
    function nextMonthFull() { /* unchanged */ }
    function showProfileModal() { /* unchanged */ }
    function closeProfileModal() { /* unchanged */ }
    function showProfileTab(tabName) { /* unchanged */ }
    function loadUserProfile() { /* unchanged */ }
    function saveProfile(event) { /* unchanged */ }
    function toggleTheme() { /* unchanged */ }
    function toggleProfile() { /* unchanged */ }
    function closeModal() { /* unchanged */ }
    function viewAllTasks() { /* unchanged */ }
    function viewDetailedStats() { /* unchanged */ }
    function viewCalendar() { /* unchanged */ }
    function viewProfile() { /* unchanged */ }
    function showSettings() { /* unchanged */ }
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            alert('Logged out successfully!');
            location.reload();
        }
    }

    document.addEventListener('keydown', function(event) { /* unchanged */ });
    document.getElementById('taskModal').addEventListener('click', function(event) { /* unchanged */ });
    document.getElementById('calendarModal').addEventListener('click', function(event) { /* unchanged */ });
    document.getElementById('profileModal').addEventListener('click', function(event) { /* unchanged */ });
