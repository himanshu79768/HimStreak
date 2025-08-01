// HimStreak Study Tracker - Complete Functional Application
class HimStreakApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.timerState = 'idle';
        this.timerInterval = null;
        this.currentTime = 25 * 60;
        this.totalTime = 25 * 60;
        this.currentSubject = null;
        this.sessionStartTime = null;
        this.isBreak = false;
        this.sidebarOpen = false;
        
        // Initialize data structures
        this.subjects = [
            { name: 'Accountancy', icon: '📊', color: '#FF6B6B', totalTime: 0 },
            { name: 'Business Law', icon: '⚖️', color: '#4ECDC4', totalTime: 0 },
            { name: 'Quantitative Aptitude', icon: '🔢', color: '#45B7D1', totalTime: 0 },
            { name: 'Business Economics', icon: '📈', color: '#96CEB4', totalTime: 0 }
        ];
        
        this.tasks = [];
        this.notes = [];
        this.sessions = [];
        this.habits = [];
        this.goals = [];
        
        this.settings = {
            pomodoroWork: 25,
            pomodoroBreak: 5,
            pomodoroLongBreak: 15,
            dailyGoal: 4,
            theme: 'light',
            profileName: ''
        };
        
        this.charts = {};
        
        // Initialize the app
        this.init();
    }
    
    init() {
        console.log('Initializing HimStreak App...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        this.preventMobileZoom();
        this.bindEvents();
        this.initializeTimer();
        this.applyTheme();
        
        // Check if we have Firebase, if not, use demo mode
        if (window.firebase && window.firebase.auth) {
            this.setupAuthentication();
        } else {
            console.log('Firebase not available, starting in demo mode');
            this.startDemoMode();
        }
        
        console.log('HimStreak App initialized successfully');
    }
    
    preventMobileZoom() {
        let viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // Demo Mode for when Firebase is not available
    startDemoMode() {
        this.currentUser = {
            uid: 'demo-user',
            email: 'demo@himstreak.com',
            displayName: 'Demo User'
        };
        
        // Add some demo data
        this.addDemoData();
        this.showMainApp();
    }
    
    addDemoData() {
        // Add some demo tasks
        this.tasks = [
            {
                id: 1,
                title: 'Study Financial Accounting - Chapter 5',
                description: 'Complete depreciation methods and calculations',
                subject: 'Accountancy',
                priority: 'high',
                dueDate: '2025-08-05',
                completed: false,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2,
                title: 'Solve 20 Quantitative Aptitude Problems',
                description: 'Focus on probability and statistics',
                subject: 'Quantitative Aptitude',
                priority: 'medium',
                dueDate: '2025-08-03',
                completed: true,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                completedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        
        // Add demo sessions
        this.sessions = [
            {
                id: 1,
                subject: 'Accountancy',
                duration: 45,
                startTime: new Date(Date.now() - 7200000).toISOString(),
                endTime: new Date(Date.now() - 4500000).toISOString(),
                type: 'pomodoro'
            },
            {
                id: 2,
                subject: 'Business Law',
                duration: 30,
                startTime: new Date(Date.now() - 90000000).toISOString(),
                endTime: new Date(Date.now() - 88200000).toISOString(),
                type: 'deep'
            }
        ];
        
        // Update subject times
        this.updateSubjectTimes();
    }
    
    updateSubjectTimes() {
        this.subjects.forEach(subject => {
            const subjectSessions = this.sessions.filter(s => s.subject === subject.name);
            subject.totalTime = subjectSessions.reduce((total, session) => total + session.duration, 0);
        });
    }
    
    // Authentication System
    setupAuthentication() {
        window.firebase.onAuthStateChanged(window.firebase.auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.showMainApp();
                this.loadUserData();
            } else {
                this.showAuthScreen();
            }
        });
    }
    
    showAuthScreen() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }
    
    showMainApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Update profile displays
        const profileName = this.currentUser.displayName || this.currentUser.email || 'User';
        const sidebarProfileName = document.getElementById('sidebarProfileName');
        if (sidebarProfileName) {
            sidebarProfileName.textContent = profileName;
        }
        
        // Initialize main app functionality
        this.setupNavigation();
        this.updateDashboard();
        
        // Setup charts after a delay
        setTimeout(() => {
            this.setupCharts();
        }, 200);
        
        this.showNotification('Welcome!', 'Ready to start studying?');
    }
    
    // Event Binding
    bindEvents() {
        this.bindAuthEvents();
        this.bindNavigationEvents();
        this.bindTimerEvents();
        this.bindTaskEvents();
        this.bindNoteEvents();
        this.bindHabitEvents();
        this.bindGoalEvents();
        this.bindSettingsEvents();
        this.bindModalEvents();
        this.bindFilterEvents();
    }
    
    bindAuthEvents() {
        // Show register form
        const showRegister = document.getElementById('showRegister');
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                const loginForm = document.getElementById('loginForm');
                const registerForm = document.getElementById('registerForm');
                if (loginForm && registerForm) {
                    loginForm.classList.remove('active');
                    registerForm.classList.add('active');
                }
            });
        }
        
        // Show login form
        const showLogin = document.getElementById('showLogin');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                const loginForm = document.getElementById('loginForm');
                const registerForm = document.getElementById('registerForm');
                if (loginForm && registerForm) {
                    registerForm.classList.remove('active');
                    loginForm.classList.add('active');
                }
            });
        }
        
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;
                
                if (!email || !password) {
                    this.showNotification('Login Error', 'Please enter both email and password');
                    return;
                }
                
                // If Firebase is available, use it
                if (window.firebase && window.firebase.auth) {
                    try {
                        await window.firebase.signInWithEmailAndPassword(window.firebase.auth, email, password);
                        this.showNotification('Welcome Back!', 'Successfully signed in');
                    } catch (error) {
                        this.showNotification('Login Failed', error.message);
                    }
                } else {
                    // Demo mode - accept any credentials
                    this.currentUser = {
                        uid: 'demo-user',
                        email: email,
                        displayName: email.split('@')[0]
                    };
                    this.addDemoData();
                    this.showMainApp();
                    this.showNotification('Demo Mode', 'You are using the demo version');
                }
            });
        }
        
        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('registerName')?.value;
                const email = document.getElementById('registerEmail')?.value;
                const password = document.getElementById('registerPassword')?.value;
                
                if (!name || !email || !password) {
                    this.showNotification('Registration Error', 'Please fill in all fields');
                    return;
                }
                
                if (password.length < 6) {
                    this.showNotification('Registration Error', 'Password must be at least 6 characters');
                    return;
                }
                
                // If Firebase is available, use it
                if (window.firebase && window.firebase.auth) {
                    try {
                        const userCredential = await window.firebase.createUserWithEmailAndPassword(window.firebase.auth, email, password);
                        await window.firebase.updateProfile(userCredential.user, { displayName: name });
                        this.showNotification('Account Created!', 'Welcome to HimStreak');
                    } catch (error) {
                        this.showNotification('Registration Failed', error.message);
                    }
                } else {
                    // Demo mode - create demo user
                    this.currentUser = {
                        uid: 'demo-user-' + Date.now(),
                        email: email,
                        displayName: name
                    };
                    this.showMainApp();
                    this.showNotification('Demo Account Created!', 'Welcome to HimStreak Demo');
                }
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (window.firebase && window.firebase.auth) {
                    try {
                        await window.firebase.signOut(window.firebase.auth);
                        this.showNotification('Logged Out', 'See you soon!');
                    } catch (error) {
                        this.showNotification('Logout Failed', error.message);
                    }
                } else {
                    // Demo mode logout
                    this.currentUser = null;
                    this.showAuthScreen();
                    this.showNotification('Logged Out', 'Thanks for trying the demo!');
                }
            });
        }
        
        // Profile menu toggle
        const profileMenu = document.getElementById('profileMenu');
        if (profileMenu) {
            profileMenu.addEventListener('click', () => {
                const dropdown = document.getElementById('profileDropdown');
                if (dropdown) {
                    dropdown.classList.toggle('hidden');
                }
            });
        }
        
        // Close profile dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const profileMenu = document.getElementById('profileMenu');
            const dropdown = document.getElementById('profileDropdown');
            if (profileMenu && dropdown && !profileMenu.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }
    
    bindNavigationEvents() {
        // Sidebar toggle
        const sidebarToggleFixed = document.getElementById('sidebarToggleFixed');
        if (sidebarToggleFixed) {
            sidebarToggleFixed.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Navigation menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                    if (window.innerWidth <= 768) {
                        this.closeSidebar();
                    }
                }
            });
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggleButton = document.getElementById('sidebarToggleFixed');
            
            if (this.sidebarOpen && sidebar && !sidebar.contains(e.target) && 
                toggleButton && !toggleButton.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // Quick timer button
        const quickTimerBtn = document.getElementById('quickTimerBtn');
        if (quickTimerBtn) {
            quickTimerBtn.addEventListener('click', () => {
                this.navigateToSection('timer');
            });
        }
    }
    
    bindTimerEvents() {
        const timerStart = document.getElementById('timerStart');
        const timerPause = document.getElementById('timerPause');
        const timerReset = document.getElementById('timerReset');
        
        if (timerStart) timerStart.addEventListener('click', () => this.startTimer());
        if (timerPause) timerPause.addEventListener('click', () => this.pauseTimer());
        if (timerReset) timerReset.addEventListener('click', () => this.resetTimer());
        
        // Timer mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const mode = e.target.dataset.mode;
                const customTimer = document.querySelector('.custom-timer');
                if (customTimer) {
                    if (mode === 'custom') {
                        customTimer.classList.remove('hidden');
                    } else {
                        customTimer.classList.add('hidden');
                    }
                }
            });
        });
    }
    
    bindTaskEvents() {
        const newTaskBtn = document.getElementById('newTaskBtn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.openTaskModal());
        }
        
        const taskModalClose = document.getElementById('taskModalClose');
        if (taskModalClose) {
            taskModalClose.addEventListener('click', () => this.closeTaskModal());
        }
        
        const taskModalCancel = document.getElementById('taskModalCancel');
        if (taskModalCancel) {
            taskModalCancel.addEventListener('click', () => this.closeTaskModal());
        }
        
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.saveTask(e));
        }
    }
    
    bindNoteEvents() {
        const newNoteBtn = document.getElementById('newNoteBtn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.openNoteModal());
        }
        
        const noteModalClose = document.getElementById('noteModalClose');
        if (noteModalClose) {
            noteModalClose.addEventListener('click', () => this.closeNoteModal());
        }
        
        const noteModalCancel = document.getElementById('noteModalCancel');
        if (noteModalCancel) {
            noteModalCancel.addEventListener('click', () => this.closeNoteModal());
        }
        
        const noteForm = document.getElementById('noteForm');
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => this.saveNote(e));
        }
    }
    
    bindHabitEvents() {
        const newHabitBtn = document.getElementById('newHabitBtn');
        if (newHabitBtn) {
            newHabitBtn.addEventListener('click', () => this.openHabitModal());
        }
        
        const habitModalClose = document.getElementById('habitModalClose');
        if (habitModalClose) {
            habitModalClose.addEventListener('click', () => this.closeHabitModal());
        }
        
        const habitModalCancel = document.getElementById('habitModalCancel');
        if (habitModalCancel) {
            habitModalCancel.addEventListener('click', () => this.closeHabitModal());
        }
        
        const habitForm = document.getElementById('habitForm');
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => this.saveHabit(e));
        }
    }
    
    bindGoalEvents() {
        const newGoalBtn = document.getElementById('newGoalBtn');
        if (newGoalBtn) {
            newGoalBtn.addEventListener('click', () => this.openGoalModal());
        }
        
        const goalModalClose = document.getElementById('goalModalClose');
        if (goalModalClose) {
            goalModalClose.addEventListener('click', () => this.closeGoalModal());
        }
        
        const goalModalCancel = document.getElementById('goalModalCancel');
        if (goalModalCancel) {
            goalModalCancel.addEventListener('click', () => this.closeGoalModal());
        }
        
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => this.saveGoal(e));
        }
    }
    
    bindSettingsEvents() {
        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }
    }
    
    bindModalEvents() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    e.target.closest('.modal').classList.add('hidden');
                }
            });
        });
    }
    
    bindFilterEvents() {
        const taskPriorityFilter = document.getElementById('taskPriorityFilter');
        if (taskPriorityFilter) {
            taskPriorityFilter.addEventListener('change', () => this.renderTasks());
        }
        
        const taskSubjectFilter = document.getElementById('taskSubjectFilter');
        if (taskSubjectFilter) {
            taskSubjectFilter.addEventListener('change', () => this.renderTasks());
        }
        
        const taskStatusFilter = document.getElementById('taskStatusFilter');
        if (taskStatusFilter) {
            taskStatusFilter.addEventListener('change', () => this.renderTasks());
        }
        
        const notesSearch = document.getElementById('notesSearch');
        if (notesSearch) {
            notesSearch.addEventListener('input', () => this.renderNotes());
        }
        
        const notesSubjectFilter = document.getElementById('notesSubjectFilter');
        if (notesSubjectFilter) {
            notesSubjectFilter.addEventListener('change', () => this.renderNotes());
        }
        
        const sessionSubjectFilter = document.getElementById('sessionSubjectFilter');
        if (sessionSubjectFilter) {
            sessionSubjectFilter.addEventListener('change', () => this.renderSessions());
        }
        
        const sessionDateFilter = document.getElementById('sessionDateFilter');
        if (sessionDateFilter) {
            sessionDateFilter.addEventListener('change', () => this.renderSessions());
        }
    }
    
    // Navigation System
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            this.sidebarOpen = !this.sidebarOpen;
            if (this.sidebarOpen) {
                sidebar.classList.add('open');
                if (window.innerWidth <= 768) {
                    this.addSidebarBackdrop();
                }
            } else {
                sidebar.classList.remove('open');
                this.removeSidebarBackdrop();
            }
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && this.sidebarOpen) {
            this.sidebarOpen = false;
            sidebar.classList.remove('open');
            this.removeSidebarBackdrop();
        }
    }
    
    addSidebarBackdrop() {
        let backdrop = document.querySelector('.sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.addEventListener('click', () => this.closeSidebar());
            document.body.appendChild(backdrop);
        }
        backdrop.classList.add('active');
    }
    
    removeSidebarBackdrop() {
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
        }
    }
    
    setupNavigation() {
        this.navigateToSection('dashboard');
    }
    
    navigateToSection(section) {
        console.log('Navigating to section:', section);
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const menuItem = document.querySelector(`.menu-item[data-section="${section}"]`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
        
        // Show section content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error(`Section with id "${section}" not found`);
            return;
        }
        
        this.currentSection = section;
        
        // Update section-specific content
        switch(section) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'timer':
                this.updateTimerDisplay();
                break;
            case 'sessions':
                this.renderSessions();
                break;
            case 'tasks':
                this.renderTasks();
                break;
            case 'notes':
                this.renderNotes();
                break;
            case 'habits':
                this.renderHabits();
                break;
            case 'goals':
                this.renderGoals();
                break;
            case 'analytics':
                setTimeout(() => this.setupCharts(), 200);
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    // Theme Management
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveUserData();
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = this.settings.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        this.showNotification('Theme Changed', `Switched to ${this.settings.theme} mode`);
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    // Timer Functions
    initializeTimer() {
        this.updateTimerDisplay();
        this.updateTimerProgress();
    }
    
    startTimer() {
        if (this.timerState === 'idle' || this.timerState === 'paused') {
            if (this.timerState === 'idle') {
                const subjectSelect = document.getElementById('timerSubject');
                this.currentSubject = subjectSelect?.value || '';
                this.sessionStartTime = new Date();
                
                const activeMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'pomodoro';
                switch(activeMode) {
                    case 'custom':
                        const customDuration = parseInt(document.getElementById('customDuration')?.value || 25);
                        this.currentTime = customDuration * 60;
                        this.totalTime = customDuration * 60;
                        break;
                    case 'deep':
                        this.currentTime = 50 * 60;
                        this.totalTime = 50 * 60;
                        break;
                    default:
                        this.currentTime = this.settings.pomodoroWork * 60;
                        this.totalTime = this.settings.pomodoroWork * 60;
                }
            }
            
            this.timerState = 'running';
            this.timerInterval = setInterval(() => {
                this.currentTime--;
                this.updateTimerDisplay();
                this.updateTimerProgress();
                
                if (this.currentTime <= 0) {
                    this.completeTimer();
                }
            }, 1000);
            
            this.updateTimerButtons();
            this.showNotification('Timer Started', `${Math.round(this.totalTime / 60)} minute session started`);
        }
    }
    
    pauseTimer() {
        if (this.timerState === 'running') {
            clearInterval(this.timerInterval);
            this.timerState = 'paused';
            this.updateTimerButtons();
            this.showNotification('Timer Paused', 'Take a moment to recharge');
        }
    }
    
    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerState = 'idle';
        this.currentTime = this.settings.pomodoroWork * 60;
        this.totalTime = this.settings.pomodoroWork * 60;
        this.isBreak = false;
        
        this.updateTimerButtons();
        this.updateTimerDisplay();
        this.updateTimerProgress();
        
        const timerMode = document.getElementById('timerMode');
        if (timerMode) timerMode.textContent = 'Focus Time';
        
        this.showNotification('Timer Reset', 'Ready for a new session');
    }
    
    completeTimer() {
        clearInterval(this.timerInterval);
        
        if (!this.isBreak && this.currentSubject) {
            const session = {
                id: Date.now(),
                subject: this.currentSubject,
                duration: Math.round(this.totalTime / 60),
                startTime: this.sessionStartTime.toISOString(),
                endTime: new Date().toISOString(),
                type: document.querySelector('.mode-btn.active')?.dataset.mode || 'pomodoro'
            };
            
            this.sessions.push(session);
            
            // Update subject total time
            const subject = this.subjects.find(s => s.name === this.currentSubject);
            if (subject) {
                subject.totalTime += session.duration;
            }
            
            this.saveUserData();
            this.startBreak();
        } else {
            this.endBreak();
        }
        
        this.showNotification('Session Complete!', this.isBreak ? 'Break time!' : 'Great work!');
    }
    
    startBreak() {
        this.isBreak = true;
        this.currentTime = this.settings.pomodoroBreak * 60;
        this.totalTime = this.settings.pomodoroBreak * 60;
        this.timerState = 'running';
        
        const timerMode = document.getElementById('timerMode');
        if (timerMode) timerMode.textContent = 'Short Break';
        
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            this.updateTimerProgress();
            
            if (this.currentTime <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }
    
    endBreak() {
        this.isBreak = false;
        this.resetTimer();
        this.showNotification('Break Over', 'Ready for another study session?');
    }
    
    updateTimerButtons() {
        const timerStart = document.getElementById('timerStart');
        const timerPause = document.getElementById('timerPause');
        
        if (this.timerState === 'running') {
            if (timerStart) timerStart.classList.add('hidden');
            if (timerPause) timerPause.classList.remove('hidden');
        } else {
            if (timerStart) {
                timerStart.classList.remove('hidden');
                timerStart.innerHTML = this.timerState === 'paused' 
                    ? '<i class="fas fa-play"></i> Resume' 
                    : '<i class="fas fa-play"></i> Start';
            }
            if (timerPause) timerPause.classList.add('hidden');
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }
        
        if (this.timerState === 'running') {
            document.title = `${display} - HimStreak Timer`;
        } else {
            document.title = 'HimStreak - CA Foundation Study Tracker';
        }
    }
    
    updateTimerProgress() {
        const progress = ((this.totalTime - this.currentTime) / this.totalTime) * 100;
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (progress / 100) * circumference;
        
        const progressCircle = document.getElementById('progressCircle');
        if (progressCircle) {
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }
    
    // Dashboard Functions
    updateDashboard() {
        this.updateStats();
        this.renderSubjects();
        this.renderRecentActivity();
    }
    
    updateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        });
        
        const todayMinutes = todaySessions.reduce((total, session) => total + session.duration, 0);
        const todayHours = Math.floor(todayMinutes / 60);
        const todayMins = todayMinutes % 60;
        
        const todayHoursElement = document.getElementById('todayHours');
        if (todayHoursElement) {
            todayHoursElement.textContent = `${todayHours}h ${todayMins}m`;
        }
        
        // Weekly stats
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weeklySessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= weekStart;
        });
        
        const weeklyMinutes = weeklySessions.reduce((total, session) => total + session.duration, 0);
        const weeklyHours = Math.floor(weeklyMinutes / 60);
        const weeklyMins = weeklyMinutes % 60;
        
        const weeklyHoursElement = document.getElementById('weeklyHours');
        if (weeklyHoursElement) {
            weeklyHoursElement.textContent = `${weeklyHours}h ${weeklyMins}m`;
        }
        
        // Streak
        const streak = this.calculateCurrentStreak();
        const studyStreakElement = document.getElementById('studyStreak');
        if (studyStreakElement) {
            studyStreakElement.textContent = streak;
        }
        
        // Goal progress
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const goalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const goalProgressElement = document.getElementById('goalProgress');
        if (goalProgressElement) {
            goalProgressElement.textContent = `${goalProgress}%`;
        }
    }
    
    renderSubjects() {
        const container = document.getElementById('subjectsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.subjects.forEach(subject => {
            const totalMinutes = subject.totalTime;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.style.setProperty('--subject-color', subject.color);
            
            card.innerHTML = `
                <div class="subject-name">
                    <span>${subject.icon}</span>
                    ${subject.name}
                </div>
                <div class="subject-time">${hours}h ${minutes}m studied</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (totalMinutes / 120) * 100)}%"></div>
                </div>
                <div class="progress-text">${Math.min(100, Math.round((totalMinutes / 120) * 100))}% of target</div>
            `;
            
            container.appendChild(card);
        });
    }
    
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        container.innerHTML = '';
        
        const recentSessions = this.sessions.slice(-5).reverse();
        
        if (recentSessions.length === 0) {
            container.innerHTML = '<p class="text-secondary">Start studying to see your recent activity here!</p>';
            return;
        }
        
        recentSessions.forEach(session => {
            const subject = this.subjects.find(s => s.name === session.subject);
            if (subject) {
                const activity = document.createElement('div');
                activity.className = 'activity-item';
                activity.innerHTML = `
                    <div class="activity-icon" style="background-color: ${subject.color}">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Studied ${subject.name}</div>
                        <div class="activity-time">${session.duration} minutes • ${this.formatTimeAgo(session.startTime)}</div>
                    </div>
                `;
                container.appendChild(activity);
            }
        });
    }
    
    calculateCurrentStreak() {
        if (this.sessions.length === 0) return 0;
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        while (true) {
            const dayStart = new Date(currentDate);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            const daySessions = this.sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });
            
            if (daySessions.length > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Task Management
    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const form = document.getElementById('taskForm');
        
        if (!modal || !title || !form) return;
        
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskSubject').value = task.subject;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            form.dataset.taskId = task.id;
        } else {
            title.textContent = 'New Task';
            form.reset();
            delete form.dataset.taskId;
        }
        
        modal.classList.remove('hidden');
    }
    
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    async saveTask(e) {
        e.preventDefault();
        
        const form = e.target;
        const taskData = {
            title: document.getElementById('taskTitle')?.value || '',
            description: document.getElementById('taskDescription')?.value || '',
            subject: document.getElementById('taskSubject')?.value || '',
            priority: document.getElementById('taskPriority')?.value || 'medium',
            dueDate: document.getElementById('taskDueDate')?.value || '',
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        if (form.dataset.taskId) {
            const taskId = parseInt(form.dataset.taskId);
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            }
        } else {
            taskData.id = Date.now();
            this.tasks.push(taskData);
        }
        
        this.closeTaskModal();
        this.renderTasks();
        await this.saveUserData();
        this.showNotification('Task Saved!', 'Task has been saved successfully');
    }
    
    renderTasks() {
        const container = document.getElementById('tasksList');
        if (!container) return;
        
        const filteredTasks = this.getFilteredTasks();
        container.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            container.innerHTML = '<p class="text-secondary">No tasks found. Create your first task to get organized!</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            
            const priorityClass = `priority-${task.priority}`;
            const completedClass = task.completed ? 'completed' : '';
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <div class="task-title ${completedClass}">${task.title}</div>
                    <div class="task-actions">
                        <button class="btn btn-sm btn-outline" onclick="app.toggleTask(${task.id})">
                            <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="app.editTask(${task.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="app.deleteTask(${task.id})">
                            <i class="fas fa-trash" style="color:#dc3545"></i>
                        </button>
                    </div>
                </div>
                <div class="task-meta">
                    <span class="priority-badge ${priorityClass}">${task.priority.toUpperCase()}</span>
                    <span class="subject-badge">${task.subject}</span>
                    ${task.dueDate ? `<span class="due-date"><i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}</span>` : ''}
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            `;
            
            container.appendChild(taskElement);
        });
    }
    
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        const priorityFilter = document.getElementById('taskPriorityFilter')?.value;
        const subjectFilter = document.getElementById('taskSubjectFilter')?.value;
        const statusFilter = document.getElementById('taskStatusFilter')?.value;
        
        if (priorityFilter) {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }
        
        if (subjectFilter) {
            filtered = filtered.filter(task => task.subject === subjectFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(task => {
                return statusFilter === 'completed' ? task.completed : !task.completed;
            });
        }
        
        return filtered.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
    
    async toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedAt = new Date().toISOString();
                this.showNotification('Task Completed!', task.title);
            }
            this.renderTasks();
            this.updateDashboard();
            await this.saveUserData();
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.openTaskModal(task);
        }
    }
    
    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.renderTasks();
            await this.saveUserData();
            this.showNotification('Task Deleted', 'Task has been removed');
        }
    }
    
    // Note Management
    openNoteModal(note = null) {
        const modal = document.getElementById('noteModal');
        const title = document.getElementById('noteModalTitle');
        const form = document.getElementById('noteForm');
        
        if (!modal || !title || !form) return;
        
        if (note) {
            title.textContent = 'Edit Note';
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteSubject').value = note.subject;
            document.getElementById('noteContent').value = note.content;
            document.getElementById('noteTags').value = note.tags ? note.tags.join(', ') : '';
            form.dataset.noteId = note.id;
        } else {
            title.textContent = 'New Note';
            form.reset();
            delete form.dataset.noteId;
        }
        
        modal.classList.remove('hidden');
    }
    
    closeNoteModal() {
        const modal = document.getElementById('noteModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    async saveNote(e) {
        e.preventDefault();
        
        const form = e.target;
        const noteData = {
            title: document.getElementById('noteTitle')?.value || '',
            subject: document.getElementById('noteSubject')?.value || '',
            content: document.getElementById('noteContent')?.value || '',
            tags: document.getElementById('noteTags')?.value.split(',').map(tag => tag.trim()).filter(tag => tag),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (form.dataset.noteId) {
            const noteId = parseInt(form.dataset.noteId);
            const noteIndex = this.notes.findIndex(n => n.id === noteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = { ...this.notes[noteIndex], ...noteData };
            }
        } else {
            noteData.id = Date.now();
            this.notes.push(noteData);
        }
        
        this.closeNoteModal();
        this.renderNotes();
        await this.saveUserData();
        this.showNotification('Note Saved!', 'Note has been saved successfully');
    }
    
    renderNotes() {
        const container = document.getElementById('notesGrid');
        if (!container) return;
        
        const filteredNotes = this.getFilteredNotes();
        container.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            container.innerHTML = '<p class="text-secondary">No notes yet. Create your first note to start organizing your study materials!</p>';
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-card';
            
            noteElement.innerHTML = `
                <div class="note-header">
                    <div class="note-title">${note.title}</div>
                    <div class="note-actions">
                        <button class="btn btn-sm btn-outline" onclick="app.editNote(${note.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="app.deleteNote(${note.id})">
                            <i class="fas fa-trash" style="color:#dc3545></i>
                        </button>
                    </div>
                </div>
                <div class="note-meta">
                    <span class="subject-badge">${note.subject}</span>
                    <span class="text-secondary">${this.formatTimeAgo(note.createdAt)}</span>
                </div>
                <div class="note-content">${note.content}</div>
                ${note.tags && note.tags.length > 0 ? `
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            `;
            
            container.appendChild(noteElement);
        });
    }
    
    getFilteredNotes() {
        let filtered = [...this.notes];
        
        const searchTerm = document.getElementById('notesSearch')?.value.toLowerCase();
        const subjectFilter = document.getElementById('notesSubjectFilter')?.value;
        
        if (searchTerm) {
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm) ||
                (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        if (subjectFilter) {
            filtered = filtered.filter(note => note.subject === subjectFilter);
        }
        
        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    
    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.openNoteModal(note);
        }
    }
    
    async deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.renderNotes();
            await this.saveUserData();
            this.showNotification('Note Deleted', 'Note has been removed');
        }
    }
    
    // Habit Management
    openHabitModal(habit = null) {
        const modal = document.getElementById('habitModal');
        const title = document.getElementById('habitModalTitle');
        const form = document.getElementById('habitForm');
        
        if (!modal || !title || !form) return;
        
        if (habit) {
            title.textContent = 'Edit Habit';
            document.getElementById('habitName').value = habit.name;
            document.getElementById('habitIcon').value = habit.icon;
            document.getElementById('habitTarget').value = habit.target;
            form.dataset.habitId = habit.id;
        } else {
            title.textContent = 'New Habit';
            form.reset();
            delete form.dataset.habitId;
        }
        
        modal.classList.remove('hidden');
    }
    
    closeHabitModal() {
        const modal = document.getElementById('habitModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    async saveHabit(e) {
        e.preventDefault();
        
        const form = e.target;
        const habitData = {
            name: document.getElementById('habitName')?.value || '',
            icon: document.getElementById('habitIcon')?.value || '📚',
            target: document.getElementById('habitTarget')?.value || '',
            streak: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        if (form.dataset.habitId) {
            const habitId = parseInt(form.dataset.habitId);
            const habitIndex = this.habits.findIndex(h => h.id === habitId);
            if (habitIndex !== -1) {
                this.habits[habitIndex] = { ...this.habits[habitIndex], ...habitData };
            }
        } else {
            habitData.id = Date.now();
            this.habits.push(habitData);
        }
        
        this.closeHabitModal();
        this.renderHabits();
        await this.saveUserData();
        this.showNotification('Habit Saved!', 'Habit has been created successfully');
    }
    
    renderHabits() {
        const container = document.getElementById('habitsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.habits.length === 0) {
            container.innerHTML = '<p class="text-secondary">No habits yet. Create your first habit to build consistency!</p>';
            return;
        }
        
        this.habits.forEach(habit => {
            const habitElement = document.createElement('div');
            habitElement.className = 'habit-card';
            
            habitElement.innerHTML = `
                <div class="habit-header">
                    <span class="habit-icon">${habit.icon}</span>
                    <div>
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-streak">🔥 ${habit.streak} day streak</div>
                    </div>
                </div>
                <div class="habit-status">
                    <p>Target: ${habit.target}</p>
                    <button class="btn ${habit.completed ? 'btn-primary' : 'btn-outline'}" 
                            onclick="app.toggleHabit(${habit.id})">
                        <i class="fas fa-${habit.completed ? 'check' : 'plus'}"></i>
                        ${habit.completed ? 'Completed' : 'Mark Done'}
                    </button>
                </div>
            `;
            
            container.appendChild(habitElement);
        });
        
        this.updateHabitStats();
    }
    
    updateHabitStats() {
        const activeHabitsElement = document.getElementById('activeHabits');
        if (activeHabitsElement) {
            activeHabitsElement.textContent = this.habits.length;
        }
        
        const bestStreak = this.habits.length > 0 ? Math.max(...this.habits.map(h => h.streak)) : 0;
        const bestStreakElement = document.getElementById('bestStreak');
        if (bestStreakElement) {
            bestStreakElement.textContent = `${bestStreak} days`;
        }
        
        const completedToday = this.habits.filter(h => h.completed).length;
        const progress = this.habits.length > 0 ? Math.round((completedToday / this.habits.length) * 100) : 0;
        const todayProgressElement = document.getElementById('todayProgress');
        if (todayProgressElement) {
            todayProgressElement.textContent = `${progress}%`;
        }
    }
    
    async toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            habit.completed = !habit.completed;
            if (habit.completed) {
                habit.streak++;
                this.showNotification('Habit Completed!', habit.name);
            } else {
                habit.streak = Math.max(0, habit.streak - 1);
            }
            this.renderHabits();
            await this.saveUserData();
        }
    }
    
    // Goal Management
    openGoalModal(goal = null) {
        const modal = document.getElementById('goalModal');
        const title = document.getElementById('goalModalTitle');
        const form = document.getElementById('goalForm');
        
        if (!modal || !title || !form) return;
        
        if (goal) {
            title.textContent = 'Edit Goal';
            document.getElementById('goalTitle').value = goal.title;
            document.getElementById('goalDescription').value = goal.description || '';
            document.getElementById('goalTarget').value = goal.target;
            document.getElementById('goalUnit').value = goal.unit;
            document.getElementById('goalDeadline').value = goal.deadline;
            form.dataset.goalId = goal.id;
        } else {
            title.textContent = 'New Goal';
            form.reset();
            delete form.dataset.goalId;
        }
        
        modal.classList.remove('hidden');
    }
    
    closeGoalModal() {
        const modal = document.getElementById('goalModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    async saveGoal(e) {
        e.preventDefault();
        
        const form = e.target;
        const goalData = {
            title: document.getElementById('goalTitle')?.value || '',
            description: document.getElementById('goalDescription')?.value || '',
            target: parseInt(document.getElementById('goalTarget')?.value || 0),
            unit: document.getElementById('goalUnit')?.value || 'hours',
            deadline: document.getElementById('goalDeadline')?.value || '',
            progress: 0,
            createdAt: new Date().toISOString()
        };
        
        if (form.dataset.goalId) {
            const goalId = parseInt(form.dataset.goalId);
            const goalIndex = this.goals.findIndex(g => g.id === goalId);
            if (goalIndex !== -1) {
                this.goals[goalIndex] = { ...this.goals[goalIndex], ...goalData };
            }
        } else {
            goalData.id = Date.now();
            this.goals.push(goalData);
        }
        
        this.closeGoalModal();
        this.renderGoals();
        await this.saveUserData();
        this.showNotification('Goal Saved!', 'Goal has been created successfully');
    }
    
    renderGoals() {
        const container = document.getElementById('goalsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.goals.length === 0) {
            container.innerHTML = '<p class="text-secondary">No goals yet. Set your first goal to track your progress!</p>';
            return;
        }
        
        this.goals.forEach(goal => {
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-card';
            
            goalElement.innerHTML = `
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-fill" style="width: ${(goal.progress / goal.target) * 100}%"></div>
                </div>
                <div class="goal-meta">
                    <span>${goal.progress} / ${goal.target} ${goal.unit}</span>
                    <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                </div>
                <p class="text-secondary">${goal.description}</p>
            `;
            
            container.appendChild(goalElement);
        });
    }
    
    // Sessions Management
    renderSessions() {
        const container = document.getElementById('sessionsList');
        if (!container) return;
        
        const filteredSessions = this.getFilteredSessions();
        container.innerHTML = '';
        
        if (filteredSessions.length === 0) {
            container.innerHTML = '<p class="text-secondary">No study sessions yet. Start your timer to create your first session!</p>';
            return;
        }
        
        // Update session stats
        const totalSessionsElement = document.getElementById('totalSessions');
        if (totalSessionsElement) {
            totalSessionsElement.textContent = this.sessions.length;
        }
        
        const avgDuration = this.sessions.length > 0 
            ? Math.round(this.sessions.reduce((sum, s) => sum + s.duration, 0) / this.sessions.length)
            : 0;
        const avgDurationElement = document.getElementById('avgDuration');
        if (avgDurationElement) {
            avgDurationElement.textContent = `${avgDuration} min`;
        }
        
        const thisWeek = this.sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            return sessionDate >= weekStart;
        }).length;
        const weekSessionsElement = document.getElementById('weekSessions');
        if (weekSessionsElement) {
            weekSessionsElement.textContent = thisWeek;
        }
        
        filteredSessions.forEach(session => {
            const subject = this.subjects.find(s => s.name === session.subject);
            
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';
            
            sessionElement.innerHTML = `
                <div class="session-header">
                    <div class="session-title">${session.subject}</div>
                    <span class="session-duration">${session.duration} min</span>
                </div>
                <div class="session-meta">
                    <span class="session-type" style="background-color: ${subject?.color}20; color: ${subject?.color}">
                        ${session.type}
                    </span>
                    <span class="session-date">${this.formatDate(session.startTime)}</span>
                    <span class="session-time">${this.formatTime(session.startTime)}</span>
                </div>
            `;
            
            container.appendChild(sessionElement);
        });
    }
    
    getFilteredSessions() {
        let filtered = [...this.sessions];
        
        const subjectFilter = document.getElementById('sessionSubjectFilter')?.value;
        const dateFilter = document.getElementById('sessionDateFilter')?.value;
        
        if (subjectFilter) {
            filtered = filtered.filter(session => session.subject === subjectFilter);
        }
        
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            filtered = filtered.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate.toDateString() === filterDate.toDateString();
            });
        }
        
        return filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }
    
    // Analytics and Charts
    setupCharts() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded, skipping chart setup');
            return;
        }
        
        if (this.currentSection === 'analytics') {
            this.createSubjectChart();
            this.createDailyChart();
            this.createWeeklyChart();
            this.createGoalsChart();
        }
    }
    
    createSubjectChart() {
        const canvas = document.getElementById('subjectChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.subject) {
            this.charts.subject.destroy();
        }
        
        const subjectData = this.subjects.map(s => s.totalTime);
        const hasData = subjectData.some(time => time > 0);
        
        if (!hasData) {
            ctx.font = '16px Inter';
            ctx.fillStyle = '#8E8E93';
            ctx.textAlign = 'center';
            ctx.fillText('No study data yet', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        this.charts.subject = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.subjects.map(s => s.name),
                datasets: [{
                    data: subjectData,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    createDailyChart() {
        const canvas = document.getElementById('dailyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.daily) {
            this.charts.daily.destroy();
        }
        
        const last7Days = [];
        const dailyData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dayStart = new Date(date);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            const daySessions = this.sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });
            
            const dayMinutes = daySessions.reduce((total, session) => total + session.duration, 0);
            dailyData.push(Math.round(dayMinutes / 60 * 100) / 100);
        }
        
        this.charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Study Hours',
                    data: dailyData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    createWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }
        
        const last4Weeks = [];
        const weeklyData = [];
        
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            last4Weeks.push(`Week ${4 - i}`);
            
            const weekSessions = this.sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate >= weekStart && sessionDate <= weekEnd;
            });
            
            const weekMinutes = weekSessions.reduce((total, session) => total + session.duration, 0);
            weeklyData.push(Math.round(weekMinutes / 60 * 100) / 100);
        }
        
        this.charts.weekly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last4Weeks,
                datasets: [{
                    label: 'Study Hours',
                    data: weeklyData,
                    backgroundColor: '#FFC185',
                    borderColor: '#FF9500',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    createGoalsChart() {
        const canvas = document.getElementById('goalsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.goals) {
            this.charts.goals.destroy();
        }
        
        if (this.goals.length === 0) {
            ctx.font = '16px Inter';
            ctx.fillStyle = '#8E8E93';  
            ctx.textAlign = 'center';
            ctx.fillText('No goals set yet', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        this.charts.goals = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.goals.map(g => g.title),
                datasets: [{
                    label: 'Progress',
                    data: this.goals.map(g => (g.progress / g.target) * 100),
                    backgroundColor: '#B4413C',
                    borderColor: '#A03A35',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Progress %'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Settings Management
    loadSettings() {
        const profileNameElement = document.getElementById('profileName');
        if (profileNameElement) {
            profileNameElement.value = this.settings.profileName || this.currentUser?.displayName || '';
        }
        
        const profileEmailElement = document.getElementById('profileEmail');
        if (profileEmailElement) {
            profileEmailElement.value = this.currentUser?.email || '';
        }
        
        const workDurationElement = document.getElementById('workDuration');
        if (workDurationElement) {
            workDurationElement.value = this.settings.pomodoroWork;
        }
        
        const shortBreakElement = document.getElementById('shortBreak');
        if (shortBreakElement) {
            shortBreakElement.value = this.settings.pomodoroBreak;
        }
        
        const dailyGoalElement = document.getElementById('dailyGoal');
        if (dailyGoalElement) {
            dailyGoalElement.value = this.settings.dailyGoal;
        }
    }
    
    async saveSettings() {
        this.settings.profileName = document.getElementById('profileName')?.value || '';
        this.settings.pomodoroWork = parseInt(document.getElementById('workDuration')?.value || 25);
        this.settings.pomodoroBreak = parseInt(document.getElementById('shortBreak')?.value || 5);
        this.settings.dailyGoal = parseFloat(document.getElementById('dailyGoal')?.value || 4);
        
        // Update profile display
        const sidebarProfileName = document.getElementById('sidebarProfileName');
        if (sidebarProfileName) {
            sidebarProfileName.textContent = this.settings.profileName;
        }
        
        await this.saveUserData();
        this.showNotification('Settings Saved!', 'Your preferences have been updated');
    }
    
    // Data Management
    async loadUserData() {
        if (!window.firebase || !this.currentUser) return;
        
        try {
            const userRef = window.firebase.ref(window.firebase.database, `users/${this.currentUser.uid}`);
            const snapshot = await window.firebase.get(userRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                this.tasks = data.tasks || [];
                this.notes = data.notes || [];
                this.sessions = data.sessions || [];
                this.habits = data.habits || [];
                this.goals = data.goals || [];
                this.settings = { ...this.settings, ...data.settings };
                
                // Update subject total times
                this.updateSubjectTimes();
                
                this.applyTheme();
                this.updateDashboard();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    async saveUserData() {
        if (!this.currentUser) return;
        
        // If Firebase is not available, just save to localStorage
        if (!window.firebase) {
            const data = {
                tasks: this.tasks,
                notes: this.notes,
                sessions: this.sessions,
                habits: this.habits,
                goals: this.goals,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('himstreak_data', JSON.stringify(data));
            return;
        }
        
        try {
            const userRef = window.firebase.ref(window.firebase.database, `users/${this.currentUser.uid}`);
            await window.firebase.set(userRef, {
                tasks: this.tasks,
                notes: this.notes,
                sessions: this.sessions,
                habits: this.habits,
                goals: this.goals,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showNotification('Save Failed', 'Failed to save data to cloud');
        }
    }
    
    // Utility Functions
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const checkFirebase = () => {
        // Initialize app regardless of Firebase availability
        app = new HimStreakApp();
    };
    
    // Give Firebase a moment to load, then start anyway
    setTimeout(checkFirebase, 500);
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
