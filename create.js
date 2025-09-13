  
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAXuigFW9jHpIAqQWVlsCJk-jFmktb3oH8",
            authDomain: "nextask-d818b.firebaseapp.com",
            projectId: "nextask-d818b",
            storageBucket: "nextask-d818b.appspot.com",
            messagingSenderId: "644127952047",
            appId: "1:644127952047:web:5b205ef88eb796cec8585a",
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        function getUserData() {
            const data = localStorage.getItem('userData');
            return data ? JSON.parse(data) : null;
        }

        async function handleCreateAccount(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const fullName = formData.get('fullName').trim();
            const email = formData.get('email').trim();
            const password = formData.get('password').trim();

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                localStorage.setItem('userData', JSON.stringify({
                    fullName: fullName,
                    email: email,
                    uid: user.uid
                }));

                alert('Account created successfully!');
                window.location.reload();
            } catch (error) {
                alert('Error creating account: ' + error.message);
            }
        }

        async function addTask(title, description) {
            const user = getUserData();
            if (!user || !user.uid) {
                alert('Please login or create an account first.');
                return;
            }

            try {
                const docRef = await addDoc(collection(db, 'tasks'), {
                    uid: user.uid,
                    title: title,
                    description: description,
                    createdAt: new Date().toISOString(),
                    completed: false
                });

                console.log('Task added with ID:', docRef.id);
                displayTasks();
            } catch (error) {
                console.error('Error adding task:', error);
                alert('Failed to add task: ' + error.message);
            }
        }

        async function handleAddTask(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const title = formData.get('title').trim();
            const description = formData.get('description').trim();

            if (title && description) {
                await addTask(title, description);
                event.target.reset();
            } else {
                alert('Please fill all fields.');
            }
        }

        async function getUserTasks() {
            const user = getUserData();
            if (!user || !user.uid) return [];

            const q = query(collection(db, 'tasks'), where('uid', '==', user.uid));
            const snapshot = await getDocs(q);

            const tasks = [];
            snapshot.forEach((doc) => {
                tasks.push({ id: doc.id, ...doc.data() });
            });

            return tasks;
        }

        async function displayTasks() {
            const tasks = await getUserTasks();
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';

            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.title}: ${task.description} (Created: ${new Date(task.createdAt).toLocaleString()})`;
                taskList.appendChild(li);
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            displayTasks();
        });

        window.handleCreateAccount = handleCreateAccount;
        window.handleAddTask = handleAddTask;
    