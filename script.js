let allMangas = [];

// Display mangas in a container
function displayMangas(mangas, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    mangas.forEach(manga => {
        const div = document.createElement('div');
        div.classList.add('manga-card');
        div.innerHTML = `
            <h3>${manga.title}</h3>
            <p>Author: ${manga.author}</p>
            <p>Tags: ${manga.tags.join(', ')}</p>
            <img src="${manga.pages[0]}" alt="${manga.title}" width="150">
        `;
        container.appendChild(div);
    });
}

// FETCH ALL MANGAS
async function loadAllMangas() {
    try {
        const res = await fetch('http://localhost:5000/api/mangas');
        const data = await res.json();
        allMangas = data.mangas;
        displayMangas(allMangas, 'mangaGrid');
    } catch (e) {
        console.error("Error fetching mangas:", e);
    }
}

// SIGNUP FUNCTION
async function signup(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const res = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, email, password})
        });
        const data = await res.json();
        if (res.ok) alert(data.message);
        else alert(data.error);
    } catch(e) { console.error("Signup error:", e); }
}

// SIGNIN FUNCTION
async function signin(event) {
    event.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    try {
        const res = await fetch('http://localhost:5000/api/signin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            alert("Welcome " + data.user.username);
        } else alert(data.error);
    } catch(e) { console.error("Signin error:", e); }
}

// UPLOAD MANGA FUNCTION
async function uploadManga(event) {
    event.preventDefault();
    const files = document.getElementById('mangaPages').files;
    const title = document.getElementById('mangaTitle').value;
    const description = document.getElementById('mangaDescription').value;
    const author = document.getElementById('mangaAuthor').value;
    const tags = document.getElementById('mangaTags').value.split(',').map(t => t.trim());
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Please login first!");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('author', author);
    formData.append('tags', JSON.stringify(tags));
    formData.append('user_id', user.id);

    for (let i = 0; i < files.length; i++) formData.append('pages', files[i]);

    try {
        const res = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            loadAllMangas();
        } else alert(data.error);
    } catch(e) { console.error("Upload error:", e); }
}

// ACTIVATE PREMIUM FUNCTION
async function activatePremium(event) {
    event.preventDefault();
    const code = document.getElementById('premiumCode').value;
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Login first to activate premium!");

    try {
        const res = await fetch('http://localhost:5000/api/activate-premium', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: user.id, code})
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            alert(data.message + " 🎉");
        } else alert(data.error);
    } catch(e) { console.error("Activate premium error:", e); }
}

// INIT LOAD
window.onload = function() {
    loadAllMangas();
};
