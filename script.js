// ====== YOUR ORIGINAL CODE STARTS ======
card.onclick = () => openManga(manga);

const coverImage = manga.pages && manga.pages.length > 0 ? manga.pages[0] : 
                  'https://via.placeholder.com/250x300/667eea/ffffff?text=No+Cover';

card.innerHTML = `
    <img src="${coverImage}" alt="${manga.title}">
    <div class="manga-info">
        <h3>${manga.title}</h3>
        <p>By ${manga.author}</p>
        <p>${manga.description}</p>
        <div class="manga-tags">
            ${(manga.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </div>
`;

grid.appendChild(card);

function searchManga() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allMangas.filter(manga => 
        manga.title.toLowerCase().includes(searchTerm) ||
        manga.author.toLowerCase().includes(searchTerm) ||
        manga.description.toLowerCase().includes(searchTerm) ||
        (manga.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
    );
    displayMangas(filtered, 'mangaGrid');
}

async function uploadManga(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert('Please sign in to upload manga');
        showPage('auth');
        return;
    }
    
    const title = document.getElementById('mangaTitle').value;
    const description = document.getElementById('mangaDescription').value;
    const author = document.getElementById('mangaAuthor').value;
    const tags = document.getElementById('mangaTags').value.split(',').map(t => t.trim());
    const filesInput = document.getElementById('mangaPages');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('author', author);
    formData.append('tags', JSON.stringify(tags));
    formData.append('user_id', currentUser.id);
    
    for (let i = 0; i < filesInput.files.length; i++) {
        formData.append('pages', filesInput.files[i]);
    }
    
    try {
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Manga uploaded successfully!');
            document.getElementById('uploadForm').reset();
            loadAllMangas();
            showPage('home');
        } else {
            alert(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during upload');
    }
}

function openManga(manga) {
    if (!currentUser) {
        alert('Please sign in to read manga');
        showPage('auth');
        return;
    }
    
    // Check daily limit for free users
    if (!currentUser.premium) {
        loadDailyReads();
        if (readMangasToday.length >= 3 && !readMangasToday.includes(manga.id)) {
            document.getElementById('limitWarning').style.display = 'block';
            document.querySelector('.reader-content').style.display = 'none';
            document.querySelector('.reader-controls').style.display = 'none';
            currentManga = manga;
            document.getElementById('readerTitle').textContent = manga.title;
            showPage('reader');
            return;
        }
    }
    
    document.getElementById('limitWarning').style.display = 'none';
    document.querySelector('.reader-content').style.display = 'block';
    document.querySelector('.reader-controls').style.display = 'flex';
    
    currentManga = manga;
    currentPage = 0;
    document.getElementById('readerTitle').textContent = manga.title;
    recordMangaRead(manga.id);
    updateReadLimitDisplay();
    showPage('reader');
    updateReaderPage();
}

function updateReaderPage() {
    if (!currentManga || !currentManga.pages || currentManga.pages.length === 0) return;
    
    document.getElementById('currentPage').src = currentManga.pages[currentPage];
    document.getElementById('pageInfo').textContent = 
        `Page ${currentPage + 1} / ${currentManga.pages.length}`;
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        updateReaderPage();
    }
}

function nextPage() {
    if (currentManga && currentPage < currentManga.pages.length - 1) {
        currentPage++;
        updateReaderPage();
    }
}

async function downloadManga() {
    if (!currentManga) return;
    
    if (!currentUser.premium) {
        alert('Download feature is only available for Premium users! Upgrade to Premium to download manga.');
        showPage('premium');
        return;
    }
    
    alert(`Download feature: ${currentManga.title}\nPages: ${currentManga.pages.length}`);
}
// ====== YOUR ORIGINAL CODE ENDS ======


// ====== MISSING HELPER FUNCTIONS ======
let allMangas = [];        // store all mangas
let currentUser = null;    // store logged in user
let currentManga = null;
let currentPage = 0;
let readMangasToday = [];
const API_URL = 'https://your-api-url.com'; // replace with actual backend URL

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    switch(page) {
        case 'home': document.getElementById('homePage').classList.add('active'); break;
        case 'browse': document.getElementById('browsePage').classList.add('active'); break;
        case 'upload': document.getElementById('uploadPage').classList.add('active'); break;
        case 'reader': document.getElementById('readerPage').classList.add('active'); break;
        case 'auth': document.getElementById('authPage').classList.add('active'); break;
        case 'premium': document.getElementById('premiumPage').classList.add('active'); break;
    }
}

function switchTab(tab) {
    document.getElementById('signinForm').style.display = tab === 'signin' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
}

function signIn() {
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    // Dummy authentication (replace with actual API)
    currentUser = {id: 1, email: email, premium: false, username: email.split('@')[0]};
    alert(`Signed in as ${currentUser.username}`);
    document.getElementById('authBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('uploadLink').style.display = 'inline-block';
    document.getElementById('premiumBtn').style.display = 'inline-block';
    showPage('home');
}

function signUp() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    // Dummy signup (replace with actual API)
    currentUser = {id: 2, email: email, premium: false, username: username};
    alert(`Account created: ${username}`);
    document.getElementById('authBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('uploadLink').style.display = 'inline-block';
    document.getElementById('premiumBtn').style.display = 'inline-block';
    showPage('home');
}

function logout() {
    currentUser = null;
    document.getElementById('authBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('uploadLink').style.display = 'none';
    document.getElementById('premiumBtn').style.display = 'none';
    alert('Logged out successfully!');
    showPage('home');
}

function loadAllMangas() {
    // Dummy data (replace with API fetch)
    allMangas = [
        {id:1, title:'Naruto Fan', author:'Prashant', description:'Epic ninja story', tags:['action','adventure'], pages:['https://via.placeholder.com/600x800']},
        {id:2, title:'My Hero Fan', author:'Dost', description:'Superhero action', tags:['action','hero'], pages:['https://via.placeholder.com/600x800']}
    ];
    displayMangas(allMangas, 'mangaGrid');
    displayMangas(allMangas, 'browseGrid');
}

function recordMangaRead(mangaId) {
    if (!readMangasToday.includes(mangaId)) readMangasToday.push(mangaId);
    localStorage.setItem('readMangasToday', JSON.stringify(readMangasToday));
}

function loadDailyReads() {
    readMangasToday = JSON.parse(localStorage.getItem('readMangasToday') || '[]');
}

function updateReadLimitDisplay() {
    if (!currentUser) return;
    document.getElementById('readsLeft').textContent = Math.max(0, 3 - readMangasToday.length);
    let now = new Date();
    let reset = new Date();
    reset.setHours(24,0,0,0);
    document.getElementById('nextReset').textContent = reset.toLocaleTimeString();
}

function activatePremium() {
    const code = document.getElementById('premiumCode').value.trim();
    if(code === "FANPREMIUM2025") {
        currentUser.premium = true;
        alert('Premium activated! Enjoy unlimited manga reading.');
        document.getElementById('userBadge').style.display = 'inline';
        document.getElementById('userBadge').textContent = '⭐ Premium';
        document.getElementById('premiumBtn').style.display = 'none';
        showPage('home');
    } else {
        alert('Invalid premium code!');
    }
}

// Helper function to display mangas
function displayMangas(mangas, gridId) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    mangas.forEach(manga => {
        const card = document.createElement('div');
        card.className = 'manga-card';
        const cover = manga.pages && manga.pages.length > 0 ? manga.pages[0] : 'https://via.placeholder.com/250x300/667eea/ffffff?text=No+Cover';
        card.innerHTML = `
            <img src="${cover}" alt="${manga.title}">
            <div class="manga-info">
                <h3>${manga.title}</h3>
                <p>By ${manga.author}</p>
                <p>${manga.description}</p>
                <div class="manga-tags">
                    ${(manga.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        card.onclick = () => openManga(manga);
        grid.appendChild(card);
    });
}

// Initial load
loadAllMangas();
updateReadLimitDisplay();
