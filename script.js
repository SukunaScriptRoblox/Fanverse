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
    });
}

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
    // In production, you would implement actual download logic here
}
