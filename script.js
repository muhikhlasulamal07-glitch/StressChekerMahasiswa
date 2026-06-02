// Konfigurasi OpenAI API
const OPENAI_API_KEY = CONFIG?.OPENAI_API_KEY || '';
const OPENAI_API_URL = CONFIG?.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

// Riwayat percakapan
let conversationHistory = [
    {
        role: "system",
        content: CONFIG?.SYSTEM_PROMPT || `Kamu adalah seorang konselor mahasiswa yang ahli dalam problem solving dan manajemen stress. Kamu memiliki kemampuan untuk menganalisis masalah secara mendalam dan memberikan solusi yang terstruktur.

KEMAMPUAN ANALISIS:
1. Identifikasi akar masalah dari cerita user
2. Kategorikan jenis masalah (akademik, sosial, finansial, personal, keluarga)
3. Analisis tingkat urgensi dan dampak masalah
4. Berikan solusi bertahap yang realistis

GAYA KOMUNIKASI:
- Gunakan bahasa yang hangat, natural, dan tidak formal
- Tunjukkan empati dan pemahaman yang mendalam
- Berikan analisis yang terstruktur tapi mudah dipahami
- Fokus pada solusi praktis yang bisa langsung diterapkan

FORMAT RESPONS JSON:
{
    "response": "Respons empati dan analisis mendalam (2-3 paragraf)",
    "stressLevel": angka_1_sampai_10,
    "stressCategory": "Rendah/Sedang/Tinggi/Sangat Tinggi",
    "problemAnalysis": {
        "mainProblems": ["masalah utama 1", "masalah utama 2"],
        "problemTypes": ["akademik", "sosial", "finansial", "personal", "keluarga"],
        "urgencyLevel": "Rendah/Sedang/Tinggi/Kritis",
        "rootCause": "analisis akar masalah"
    },
    "actionPlan": {
        "immediate": ["langkah segera 1", "langkah segera 2"],
        "shortTerm": ["langkah jangka pendek 1", "langkah jangka pendek 2"],
        "longTerm": ["langkah jangka panjang 1", "langkah jangka panjang 2"]
    },
    "priorityMatrix": [
        {"task": "tugas/masalah", "priority": "Tinggi/Sedang/Rendah", "deadline": "timeline", "effort": "Mudah/Sedang/Sulit"},
        {"task": "tugas/masalah", "priority": "Tinggi/Sedang/Rendah", "deadline": "timeline", "effort": "Mudah/Sedang/Sulit"}
    ],
    "recommendations": [
        "rekomendasi praktis 1",
        "rekomendasi praktis 2", 
        "rekomendasi praktis 3"
    ],
    "resources": [
        "sumber bantuan 1 (konselor kampus, dll)",
        "sumber bantuan 2",
        "sumber bantuan 3"
    ]
}

CONTOH ANALISIS:
- "Dari cerita kamu, aku lihat ada 3 masalah utama yang saling terkait..."
- "Kayaknya akar masalahnya adalah manajemen waktu yang belum optimal..."
- "Mari kita buat action plan yang realistis, mulai dari yang paling urgent..."

Selalu berikan solusi yang terstruktur, realistis, dan bisa diterapkan bertahap. Fokus pada pemberdayaan user untuk mengatasi masalahnya sendiri.`
    }
];

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    console.log('User input element:', userInput);
    console.log('Send button element:', sendButton);
    
    // Navigation handling
    setupNavigation();
    
    // Load saved data
    loadProfile();
    loadMoodHistory();
    updateStats();
    
    // Enter key untuk mengirim pesan
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter key pressed, sending message');
                sendMessage();
            }
        });
        
        // Auto-resize textarea and toggle quick prompts
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            toggleQuickPrompts();
        });
        
        // Show quick prompts when input is focused and empty
        userInput.addEventListener('focus', function() {
            toggleQuickPrompts();
        });
    } else {
        console.error('User input element not found!');
    }
    
    // Add click event to send button
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            console.log('Send button clicked');
            sendMessage();
        });
    } else {
        console.error('Send button element not found!');
    }
    
    // Mood options handling
    setupMoodOptions();
    
    console.log('All event listeners set up');
});

// Debug function to check all elements
function debugElements() {
    console.log('=== DEBUG ELEMENTS ===');
    console.log('userInput:', document.getElementById('userInput'));
    console.log('sendButton:', document.getElementById('sendButton'));
    console.log('chatMessages:', document.getElementById('chatMessages'));
    console.log('stressIndicator:', document.getElementById('stressIndicator'));
    console.log('stressBar:', document.getElementById('stressBar'));
    console.log('stressLabel:', document.getElementById('stressLabel'));
    console.log('recommendations:', document.getElementById('recommendations'));
    console.log('recommendationList:', document.getElementById('recommendationList'));
    console.log('aiPage:', document.getElementById('aiPage'));
    console.log('Current page display:', document.getElementById('aiPage')?.style.display);
    console.log('=== END DEBUG ===');
}

// Add debug to window for manual testing
window.debugElements = debugElements;
window.sendMessage = sendMessage;

// Navigation from Home Page
function navigateToPage(pageName) {
    // Update active navigation states
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-item');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageName}"]`).forEach(l => l.classList.add('active'));
    
    // Show the target page
    showPage(pageName);
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll(`[data-page="${targetPage}"]`).forEach(l => l.classList.add('active'));
        });
    });
}

// Show specific page
function showPage(pageName) {
    console.log('Showing page:', pageName);
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show target page
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
        console.log('Page shown:', pageName);
        
        // Initialize quiz if quiz page is shown
        if (pageName === 'quiz' && !quizStarted) {
            initializeQuiz();
        }
        
        // Debug elements when AI page is shown
        if (pageName === 'ai') {
            setTimeout(debugElements, 100);
        }
    } else {
        console.error('Page not found:', pageName + 'Page');
    }
}

// Mood Options Setup
function setupMoodOptions() {
    const moodOptions = document.querySelectorAll('.mood-option');
    
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selection
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selection to clicked option
            this.classList.add('selected');
        });
    });
}

// Save Mood Function
function saveMood() {
    const selectedMood = document.querySelector('.mood-option.selected');
    const moodNote = document.getElementById('moodNote').value;
    
    if (!selectedMood) {
        alert('Silakan pilih mood Anda terlebih dahulu');
        return;
    }
    
    const moodData = {
        mood: selectedMood.getAttribute('data-mood'),
        note: moodNote,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Save to localStorage
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    moodHistory.push(moodData);
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    
    // Clear form
    selectedMood.classList.remove('selected');
    document.getElementById('moodNote').value = '';
    
    // Update stats
    updateStats();
    
    alert('Mood berhasil disimpan!');
}

// Save Profile Function
function saveProfile() {
    const profileData = {
        fullName: document.getElementById('fullName').value,
        university: document.getElementById('university').value,
        major: document.getElementById('major').value,
        semester: document.getElementById('semester').value,
        email: document.getElementById('email').value
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    alert('Profil berhasil disimpan!');
}

// Load Profile Function
function loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        
        if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = profileData.fullName || '';
            document.getElementById('university').value = profileData.university || '';
            document.getElementById('major').value = profileData.major || '';
            document.getElementById('semester').value = profileData.semester || '';
            document.getElementById('email').value = profileData.email || '';
        }
    }
}

// Load Mood History
function loadMoodHistory() {
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    return moodHistory;
}

// Quiz Data
const quizQuestions = [
    {
        question: "Seberapa sering Anda merasa kewalahan dengan tugas kuliah?",
        options: [
            { text: "Tidak pernah", score: 1 },
            { text: "Jarang", score: 2 },
            { text: "Kadang-kadang", score: 3 },
            { text: "Sering", score: 4 },
            { text: "Selalu", score: 5 }
        ]
    },
    {
        question: "Bagaimana kualitas tidur Anda dalam seminggu terakhir?",
        options: [
            { text: "Sangat baik, tidur nyenyak", score: 1 },
            { text: "Baik, sesekali terbangun", score: 2 },
            { text: "Cukup, sering terbangun", score: 3 },
            { text: "Buruk, sulit tidur", score: 4 },
            { text: "Sangat buruk, insomnia", score: 5 }
        ]
    },
    {
        question: "Seberapa sering Anda merasa cemas tentang masa depan karir?",
        options: [
            { text: "Tidak pernah", score: 1 },
            { text: "Jarang", score: 2 },
            { text: "Kadang-kadang", score: 3 },
            { text: "Sering", score: 4 },
            { text: "Selalu", score: 5 }
        ]
    },
    {
        question: "Bagaimana kemampuan Anda mengelola waktu untuk tugas kuliah?",
        options: [
            { text: "Sangat baik, selalu tepat waktu", score: 1 },
            { text: "Baik, jarang terlambat", score: 2 },
            { text: "Cukup, kadang terlambat", score: 3 },
            { text: "Buruk, sering terlambat", score: 4 },
            { text: "Sangat buruk, selalu terlambat", score: 5 }
        ]
    },
    {
        question: "Seberapa sering Anda merasa lelah secara mental?",
        options: [
            { text: "Tidak pernah", score: 1 },
            { text: "Jarang", score: 2 },
            { text: "Kadang-kadang", score: 3 },
            { text: "Sering", score: 4 },
            { text: "Selalu", score: 5 }
        ]
    },
    {
        question: "Bagaimana hubungan Anda dengan teman-teman kuliah?",
        options: [
            { text: "Sangat baik dan supportif", score: 1 },
            { text: "Baik, ada dukungan", score: 2 },
            { text: "Biasa saja", score: 3 },
            { text: "Kurang baik, jarang berinteraksi", score: 4 },
            { text: "Buruk, merasa terisolasi", score: 5 }
        ]
    },
    {
        question: "Seberapa sering Anda merasa tidak percaya diri dengan kemampuan akademik?",
        options: [
            { text: "Tidak pernah", score: 1 },
            { text: "Jarang", score: 2 },
            { text: "Kadang-kadang", score: 3 },
            { text: "Sering", score: 4 },
            { text: "Selalu", score: 5 }
        ]
    },
    {
        question: "Bagaimana kondisi finansial Anda sebagai mahasiswa?",
        options: [
            { text: "Sangat cukup, tidak ada masalah", score: 1 },
            { text: "Cukup untuk kebutuhan dasar", score: 2 },
            { text: "Pas-pasan, harus hemat", score: 3 },
            { text: "Kurang, sering kesulitan", score: 4 },
            { text: "Sangat kurang, selalu bermasalah", score: 5 }
        ]
    },
    {
        question: "Seberapa sering Anda merasa tertekan dengan ekspektasi keluarga?",
        options: [
            { text: "Tidak pernah", score: 1 },
            { text: "Jarang", score: 2 },
            { text: "Kadang-kadang", score: 3 },
            { text: "Sering", score: 4 },
            { text: "Selalu", score: 5 }
        ]
    },
    {
        question: "Bagaimana kemampuan Anda untuk rileks dan menikmati waktu luang?",
        options: [
            { text: "Sangat mudah rileks", score: 1 },
            { text: "Mudah rileks", score: 2 },
            { text: "Cukup sulit rileks", score: 3 },
            { text: "Sulit rileks", score: 4 },
            { text: "Tidak bisa rileks sama sekali", score: 5 }
        ]
    }
];

// Quiz State
let currentQuestionIndex = 0;
let quizAnswers = [];
let quizStarted = false;

// Quiz Functions
function initializeQuiz() {
    currentQuestionIndex = 0;
    quizAnswers = [];
    quizStarted = true;
    
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    
    showQuestion();
    updateProgress();
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    document.getElementById('questionNumber').textContent = `Pertanyaan ${currentQuestionIndex + 1}`;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('answerOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.innerHTML = `
            <input type="radio" name="answer" value="${option.score}" id="option${index}">
            <label for="option${index}" class="answer-text">${option.text}</label>
        `;
        
        optionElement.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            selectAnswer(option.score);
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Selesai' : 'Selanjutnya';
}

function selectAnswer(score) {
    quizAnswers[currentQuestionIndex] = score;
    
    // Update UI
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
        updateProgress();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
        updateProgress();
        
        // Restore previous answer if exists
        if (quizAnswers[currentQuestionIndex] !== undefined) {
            const savedScore = quizAnswers[currentQuestionIndex];
            const options = document.querySelectorAll('.answer-option');
            options.forEach(option => {
                const radio = option.querySelector('input[type="radio"]');
                if (parseInt(radio.value) === savedScore) {
                    radio.checked = true;
                    option.classList.add('selected');
                    document.getElementById('nextBtn').disabled = false;
                }
            });
        }
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
}

function finishQuiz() {
    const totalScore = quizAnswers.reduce((sum, score) => sum + score, 0);
    const maxScore = quizQuestions.length * 5;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Determine stress level
    let category, description, recommendations;
    
    if (percentage <= 30) {
        category = { text: 'Tingkat Stress: Rendah', class: 'low' };
        description = 'Selamat! Anda memiliki tingkat stress yang rendah. Anda tampaknya dapat mengelola tekanan akademik dengan baik dan memiliki keseimbangan hidup yang sehat.';
        recommendations = [
            'Pertahankan pola hidup sehat yang sudah Anda jalani',
            'Tetap jaga keseimbangan antara belajar dan istirahat',
            'Bantu teman-teman yang mungkin mengalami stress',
            'Lanjutkan aktivitas yang membuat Anda bahagia'
        ];
    } else if (percentage <= 60) {
        category = { text: 'Tingkat Stress: Sedang', class: 'medium' };
        description = 'Anda mengalami tingkat stress yang normal untuk seorang mahasiswa. Ada beberapa area yang perlu diperhatikan untuk mencegah stress bertambah parah.';
        recommendations = [
            'Buat jadwal belajar yang lebih terstruktur',
            'Luangkan waktu untuk aktivitas yang menyenangkan',
            'Berbicara dengan teman atau keluarga tentang perasaan Anda',
            'Praktikkan teknik relaksasi seperti meditasi atau yoga',
            'Pastikan tidur yang cukup setiap malam'
        ];
    } else {
        category = { text: 'Tingkat Stress: Tinggi', class: 'high' };
        description = 'Anda mengalami tingkat stress yang cukup tinggi. Penting untuk segera mengambil langkah-langkah untuk mengurangi stress dan mencari dukungan.';
        recommendations = [
            'Konsultasi dengan konselor atau psikolog kampus',
            'Evaluasi dan reorganisasi prioritas akademik',
            'Cari dukungan dari keluarga dan teman dekat',
            'Pertimbangkan untuk mengurangi beban kuliah jika memungkinkan',
            'Praktikkan teknik manajemen stress secara rutin',
            'Jangan ragu untuk meminta bantuan profesional'
        ];
    }
    
    // Save quiz result
    const quizResult = {
        score: percentage,
        totalScore: totalScore,
        maxScore: maxScore,
        category: category.text,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    let quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    quizHistory.push(quizResult);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    
    // Show result
    showQuizResult(percentage, category, description, recommendations);
    updateStats();
}

function showQuizResult(score, category, description, recommendations) {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    
    // Animate score
    animateScore(score);
    
    // Update result content
    document.getElementById('resultCategory').textContent = category.text;
    document.getElementById('resultCategory').className = `result-category ${category.class}`;
    document.getElementById('resultDescription').textContent = description;
    
    // Update recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });
}

function animateScore(targetScore) {
    const scoreElement = document.getElementById('scoreNumber');
    let currentScore = 0;
    const increment = targetScore / 50; // Animation duration
    
    const animation = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        scoreElement.textContent = Math.round(currentScore);
    }, 20);
}

function restartQuiz() {
    initializeQuiz();
}

function shareResult() {
    const score = document.getElementById('scoreNumber').textContent;
    const category = document.getElementById('resultCategory').textContent;
    
    const shareText = `Saya baru saja menyelesaikan Kuis Tingkat Stress Mahasiswa dan mendapat skor ${score}/100. ${category}. Coba juga kuis ini untuk mengetahui tingkat stress Anda!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Hasil Kuis Tingkat Stress',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Hasil kuis telah disalin ke clipboard!');
        });
    }
}
// Update Stats
function updateStats() {
    const moodHistory = loadMoodHistory();
    const stressHistory = JSON.parse(localStorage.getItem('stressHistory') || '[]');
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '0');
    
    // Calculate weekly average
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyStress = stressHistory.filter(s => s.timestamp > oneWeekAgo);
    const weeklyQuiz = quizHistory.filter(q => q.timestamp > oneWeekAgo);
    
    // Combine stress data from AI and quiz
    const allWeeklyStress = [
        ...weeklyStress.map(s => s.level * 10), // Convert 1-10 to percentage
        ...weeklyQuiz.map(q => q.score)
    ];
    
    const weeklyAvg = allWeeklyStress.length > 0 ? 
        (allWeeklyStress.reduce((sum, s) => sum + s, 0) / allWeeklyStress.length).toFixed(1) : '-';
    
    // Calculate monthly average
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyStress = stressHistory.filter(s => s.timestamp > oneMonthAgo);
    const monthlyQuiz = quizHistory.filter(q => q.timestamp > oneMonthAgo);
    
    const allMonthlyStress = [
        ...monthlyStress.map(s => s.level * 10),
        ...monthlyQuiz.map(q => q.score)
    ];
    
    const monthlyAvg = allMonthlyStress.length > 0 ? 
        (allMonthlyStress.reduce((sum, s) => sum + s, 0) / allMonthlyStress.length).toFixed(1) : '-';
    
    // Calculate trend
    const recentData = [...stressHistory.slice(-3).map(s => s.level * 10), ...quizHistory.slice(-2).map(q => q.score)];
    const olderData = [...stressHistory.slice(-6, -3).map(s => s.level * 10), ...quizHistory.slice(-4, -2).map(q => q.score)];
    let trendValue = '-';
    
    if (recentData.length > 0 && olderData.length > 0) {
        const recentAvg = recentData.reduce((sum, s) => sum + s, 0) / recentData.length;
        const olderAvg = olderData.reduce((sum, s) => sum + s, 0) / olderData.length;
        const trend = recentAvg - olderAvg;
        
        if (trend > 5) trendValue = '↗️ Meningkat';
        else if (trend < -5) trendValue = '↘️ Menurun';
        else trendValue = '➡️ Stabil';
    }
    
    // Update Stats Page UI
    if (document.getElementById('weeklyAvg')) {
        document.getElementById('weeklyAvg').textContent = weeklyAvg;
        document.getElementById('monthlyAvg').textContent = monthlyAvg;
        document.getElementById('trendValue').textContent = trendValue;
        document.getElementById('chatSessions').textContent = chatSessions;
    }
    
    // Update Home Page Quick Stats
    updateHomeStats(weeklyAvg, chatSessions, quizHistory.length);
    
    // Update Recent Activity
    updateRecentActivity(stressHistory, quizHistory, moodHistory);
}

// Update Home Page Stats
function updateHomeStats(stressAvg, chatCount, quizCount) {
    if (document.getElementById('homeStressAvg')) {
        document.getElementById('homeStressAvg').textContent = stressAvg;
        document.getElementById('homeChatCount').textContent = chatCount;
        document.getElementById('homeQuizCount').textContent = quizCount;
    }
}

// Update Recent Activity
function updateRecentActivity(stressHistory, quizHistory, moodHistory) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Combine all activities
    const allActivities = [
        ...stressHistory.map(s => ({
            type: 'chat',
            timestamp: s.timestamp,
            text: `Chat AI - Tingkat stress: ${s.level}/10 (${s.category})`
        })),
        ...quizHistory.map(q => ({
            type: 'quiz',
            timestamp: q.timestamp,
            text: `Kuis Stress - Skor: ${q.score}/100 (${q.category})`
        })),
        ...moodHistory.map(m => ({
            type: 'mood',
            timestamp: m.timestamp,
            text: `Mood Tracker - ${getMoodText(m.mood)}`
        }))
    ];
    
    // Sort by timestamp (newest first) and take last 5
    const recentActivities = allActivities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    
    // Clear and populate activity list
    activityList.innerHTML = '';
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <span>Belum ada aktivitas. Mulai dengan chat AI atau kuis stress!</span>
            </div>
        `;
    } else {
        recentActivities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = `activity-item ${activity.type}`;
            
            let icon = 'fas fa-circle';
            if (activity.type === 'chat') icon = 'fas fa-comments';
            else if (activity.type === 'quiz') icon = 'fas fa-clipboard-check';
            else if (activity.type === 'mood') icon = 'fas fa-heart';
            
            activityElement.innerHTML = `
                <i class="${icon}"></i>
                <span>${activity.text}</span>
                <small style="margin-left: auto; color: #999; font-size: 0.8rem;">
                    ${formatTimeAgo(activity.timestamp)}
                </small>
            `;
            
            activityList.appendChild(activityElement);
        });
    }
}

// Helper function to get mood text
function getMoodText(mood) {
    const moodTexts = {
        'very-happy': 'Sangat Bahagia 😄',
        'happy': 'Bahagia 😊',
        'neutral': 'Biasa Saja 😐',
        'sad': 'Sedih 🙁',
        'very-sad': 'Sangat Sedih 😢'
    };
    return moodTexts[mood] || mood;
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m yang lalu`;
    if (hours < 24) return `${hours}h yang lalu`;
    return `${days}d yang lalu`;
}

// Use quick prompt
function usePrompt(promptText) {
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.value = promptText;
        userInput.focus();
        
        // Auto resize textarea
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
        
        // Hide quick prompts after selection
        const quickPrompts = document.getElementById('quickPrompts');
        if (quickPrompts) {
            quickPrompts.style.display = 'none';
        }
    }
}

// Show/hide quick prompts based on input
function toggleQuickPrompts() {
    const userInput = document.getElementById('userInput');
    const quickPrompts = document.getElementById('quickPrompts');
    
    if (userInput && quickPrompts) {
        if (userInput.value.trim() === '') {
            quickPrompts.style.display = 'block';
        } else {
            quickPrompts.style.display = 'none';
        }
    }
}

// Simple test function
function testSendMessage() {
    console.log('Testing send message...');
    addMessage('Test user message', 'user');
    
    setTimeout(() => {
        const testResponse = {
            response: "Ini adalah respons test dari AI. Sistem berfungsi dengan baik!",
            stressLevel: 5,
            stressCategory: "Sedang",
            recommendations: ["Test rekomendasi 1", "Test rekomendasi 2", "Test rekomendasi 3"]
        };
        
        addMessage(testResponse.response, 'bot');
        showStressLevel(testResponse.stressLevel, testResponse.stressCategory);
        showRecommendations(testResponse.recommendations);
    }, 1000);
}

// Add to window for manual testing
window.testSendMessage = testSendMessage;

async function sendMessage() {
    console.log('sendMessage called');
    
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    if (!userInput) {
        console.error('User input element not found');
        alert('Error: Input element tidak ditemukan. Pastikan Anda berada di halaman AI Chat.');
        return;
    }
    
    const message = userInput.value.trim();
    console.log('Message:', message);
    
    if (!message) {
        alert('Silakan masukkan pesan terlebih dahulu.');
        return;
    }
    
    try {
        // Hide previous analysis components
        hideAnalysisComponents();
        
        // Tampilkan pesan user
        addMessage(message, 'user');
        
        // Clear input dan disable button
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Hide quick prompts after sending message
        const quickPrompts = document.getElementById('quickPrompts');
        if (quickPrompts) {
            quickPrompts.style.display = 'none';
        }
        
        if (sendButton) {
            sendButton.disabled = true;
        }
        
        // Tampilkan loading
        showLoading(true);
        
        // Tambahkan pesan user ke riwayat
        conversationHistory.push({
            role: "user",
            content: message
        });
        
        // Panggil OpenAI API
        const response = await callOpenAI();
        console.log('Raw API response:', response);
        
        // Parse respons JSON
        let aiResponse;
        try {
            aiResponse = JSON.parse(response);
            console.log('Parsed AI response:', aiResponse);
        } catch (e) {
            console.log('Response is not JSON, treating as plain text:', response);
            // Jika bukan JSON, buat struktur default
            aiResponse = {
                response: response,
                stressLevel: 5,
                stressCategory: "Sedang",
                recommendations: ["Istirahat yang cukup", "Olahraga ringan", "Berbicara dengan teman atau keluarga"]
            };
        }
        
        // Tampilkan respons AI
        addMessage(aiResponse.response, 'bot');
        
        // Tampilkan indikator stress
        showStressLevel(aiResponse.stressLevel, aiResponse.stressCategory);
        
        // Tampilkan analisis masalah jika ada
        if (aiResponse.problemAnalysis) {
            showProblemAnalysis(aiResponse.problemAnalysis);
        }
        
        // Tampilkan action plan jika ada
        if (aiResponse.actionPlan) {
            showActionPlan(aiResponse.actionPlan);
        }
        
        // Tampilkan priority matrix jika ada
        if (aiResponse.priorityMatrix) {
            showPriorityMatrix(aiResponse.priorityMatrix);
        }
        
        // Tampilkan resources jika ada
        if (aiResponse.resources) {
            showResources(aiResponse.resources);
        }
        
        // Simpan data stress untuk statistik
        saveStressData(aiResponse.stressLevel, aiResponse.stressCategory);
        
        // Tampilkan rekomendasi
        showRecommendations(aiResponse.recommendations);
        
        // Update chat sessions count
        let chatSessions = parseInt(localStorage.getItem('chatSessions') || '0');
        localStorage.setItem('chatSessions', (chatSessions + 1).toString());
        updateStats();
        
        // Tambahkan respons AI ke riwayat
        conversationHistory.push({
            role: "assistant",
            content: JSON.stringify(aiResponse)
        });
        
    } catch (error) {
        console.error('Error in sendMessage:', error);
        addMessage('Maaf, terjadi kesalahan saat menganalisis pesan Anda. Error: ' + error.message, 'bot');
    } finally {
        showLoading(false);
        if (sendButton) {
            sendButton.disabled = false;
        }
    }
}

async function callOpenAI() {
    try {
        console.log('Calling OpenAI API...');
        console.log('API Key exists:', !!OPENAI_API_KEY);
        console.log('Conversation history:', conversationHistory);
        
        // Check if API key is valid (not empty and not placeholder)
        if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
            console.warn('Invalid API key, using demo mode');
            return getDemoResponse();
        }
        
       const response = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messages: conversationHistory
    })
});
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            
            // If API fails, use demo mode
            if (response.status === 401 || response.status === 403) {
                console.warn('API authentication failed, switching to demo mode');
                return getDemoResponse();
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data.reply) {
    throw new Error('Invalid response from backend');
}

return data.reply;
        
    } catch (error) {
        console.error('Error in callOpenAI:', error);
        
        // Fallback to demo mode on any error
        console.warn('API call failed, using demo response');
        return getDemoResponse();
    }
}

// Demo response function for testing
function getDemoResponse() {
    const userMessage = conversationHistory[conversationHistory.length - 1]?.content || "";
    
    const demoResponses = [
        {
            response: "Hei, makasih ya udah mau cerita sama aku. Dari yang kamu sampaikan, aku bisa lihat ada beberapa masalah yang saling terkait dan bikin kamu overwhelmed. Yang kamu rasain itu wajar banget kok untuk mahasiswa, tapi kita perlu bikin strategi yang tepat buat ngatasinnya.\n\nAku udah analisis situasi kamu dan bikin action plan yang realistis. Kita mulai dari langkah-langkah kecil yang bisa kamu lakuin hari ini, terus bertahap ke solusi jangka panjang. Yang penting, kamu nggak sendirian dalam hal ini!",
            stressLevel: 5,
            stressCategory: "Sedang",
            problemAnalysis: {
                mainProblems: [
                    "Manajemen waktu yang kurang efektif",
                    "Beban tugas yang menumpuk",
                    "Kurang tidur dan istirahat"
                ],
                problemTypes: ["akademik", "personal"],
                urgencyLevel: "Sedang",
                rootCause: "Kurangnya sistem prioritas dan perencanaan yang terstruktur dalam menghadapi multiple deadlines"
            },
            actionPlan: {
                immediate: [
                    "Buat list semua tugas dan deadline dalam 1 minggu ke depan",
                    "Pilih 1-2 tugas paling urgent untuk dikerjakan hari ini",
                    "Set timer 25 menit untuk fokus kerja (teknik Pomodoro)"
                ],
                shortTerm: [
                    "Buat jadwal harian yang realistis dengan waktu istirahat",
                    "Komunikasi dengan dosen jika ada kesulitan deadline",
                    "Cari study buddy atau kelompok belajar untuk support"
                ],
                longTerm: [
                    "Develop sistem manajemen waktu yang konsisten",
                    "Bangun rutinitas tidur yang sehat (7-8 jam/malam)",
                    "Ikut workshop time management atau productivity skills"
                ]
            },
            priorityMatrix: [
                {
                    task: "Tugas yang deadline besok",
                    priority: "Tinggi",
                    deadline: "1 hari",
                    effort: "Sedang"
                },
                {
                    task: "Baca materi untuk ujian minggu depan",
                    priority: "Sedang", 
                    deadline: "1 minggu",
                    effort: "Mudah"
                },
                {
                    task: "Project kelompok",
                    priority: "Sedang",
                    deadline: "2 minggu", 
                    effort: "Sulit"
                }
            ],
            recommendations: [
                "Gunakan aplikasi seperti Todoist atau Notion untuk tracking tugas",
                "Buat reward system - kasih treat ke diri sendiri setelah selesai tugas penting",
                "Coba teknik time blocking: alokasikan waktu spesifik untuk setiap aktivitas",
                "Jangan lupa break time - otak butuh istirahat buat perform optimal"
            ],
            resources: [
                "Konselor akademik kampus untuk bantuan planning studi",
                "Pusat Konseling Mahasiswa untuk support psikologis",
                "Study group atau komunitas mahasiswa di jurusan kamu",
                "Apps: Forest (focus timer), Todoist (task management)"
            ]
        },
        {
            response: "Wah, dari cerita kamu, aku ngerasa situasinya cukup serius nih dan perlu perhatian lebih. Tingkat stress kamu udah masuk kategori tinggi, dan beberapa masalah yang kamu hadapi butuh penanganan segera sebelum makin parah.\n\nTapi tenang, kita bisa atasi ini step by step. Aku udah breakdown masalah kamu dan bikin action plan yang fokus pada stabilisasi dulu, baru improvement. Yang paling penting sekarang adalah kamu nggak handle semua sendirian.",
            stressLevel: 7,
            stressCategory: "Tinggi",
            problemAnalysis: {
                mainProblems: [
                    "Tekanan akademik yang berlebihan",
                    "Masalah finansial yang mengganggu fokus belajar", 
                    "Kurang support system yang memadai",
                    "Gejala kelelahan mental dan fisik"
                ],
                problemTypes: ["akademik", "finansial", "personal", "sosial"],
                urgencyLevel: "Tinggi",
                rootCause: "Kombinasi multiple stressors tanpa coping mechanism yang efektif, ditambah isolasi sosial yang mengurangi support system"
            },
            actionPlan: {
                immediate: [
                    "Hubungi konselor kampus atau hotline kesehatan mental",
                    "Inform keluarga/teman dekat tentang kondisi kamu",
                    "Prioritaskan basic needs: makan teratur, tidur minimal 6 jam"
                ],
                shortTerm: [
                    "Konsultasi dengan academic advisor tentang beban studi",
                    "Cari informasi beasiswa atau bantuan finansial kampus",
                    "Join support group atau komunitas mahasiswa"
                ],
                longTerm: [
                    "Pertimbangkan penyesuaian jadwal kuliah jika diperlukan",
                    "Bangun network support yang kuat",
                    "Develop healthy coping strategies dan stress management"
                ]
            },
            priorityMatrix: [
                {
                    task: "Konsultasi dengan konselor",
                    priority: "Tinggi",
                    deadline: "2-3 hari",
                    effort: "Mudah"
                },
                {
                    task: "Atur ulang prioritas tugas kuliah",
                    priority: "Tinggi",
                    deadline: "1 minggu",
                    effort: "Sedang"
                },
                {
                    task: "Cari sumber bantuan finansial",
                    priority: "Sedang",
                    deadline: "2 minggu",
                    effort: "Sedang"
                }
            ],
            recommendations: [
                "Jangan ragu untuk minta extension deadline ke dosen jika kondisi mental terganggu",
                "Manfaatkan fasilitas konseling gratis di kampus",
                "Consider part-time job atau freelance yang fleksibel untuk finansial",
                "Praktikkan mindfulness atau meditation 10 menit sehari untuk mental health"
            ],
            resources: [
                "Pusat Konseling dan Kesehatan Mental Kampus",
                "Hotline Kesehatan Mental: 119 ext 8",
                "Beasiswa dan bantuan finansial kampus",
                "Komunitas mahasiswa dan peer support groups",
                "Apps: Headspace (meditation), Calm (anxiety management)"
            ]
        }
    ];
    
    // Select response based on keywords or randomly
    let selectedResponse;
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('parah') || lowerMessage.includes('depresi') || lowerMessage.includes('bunuh diri') || lowerMessage.includes('menyerah') || lowerMessage.includes('nggak kuat')) {
        selectedResponse = demoResponses[1]; // High stress with comprehensive support
    } else {
        selectedResponse = demoResponses[0]; // Medium stress with structured plan
    }
    
    // Simulate API delay
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.stringify(selectedResponse));
        }, 2000); // Longer delay for more comprehensive analysis
    });
}

function addMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="${icon}"></i>
            <div class="text">${message}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showStressLevel(level, category) {
    const indicator = document.getElementById('stressIndicator');
    const bar = document.getElementById('stressBar');
    const label = document.getElementById('stressLabel');
    
    if (!indicator || !bar || !label) {
        console.error('Stress level elements not found');
        return;
    }
    
    // Tentukan warna berdasarkan level
    let colorClass;
    if (level <= 3) {
        colorClass = 'stress-low';
    } else if (level <= 6) {
        colorClass = 'stress-medium';
    } else if (level <= 8) {
        colorClass = 'stress-high';
    } else {
        colorClass = 'stress-very-high';
    }
    
    // Update tampilan
    bar.className = `stress-bar ${colorClass}`;
    bar.style.width = `${level * 10}%`;
    label.textContent = `${category} (${level}/10)`;
    
    indicator.style.display = 'block';
}

function showRecommendations(recommendations) {
    const container = document.getElementById('recommendations');
    const list = document.getElementById('recommendationList');
    
    if (!container || !list) {
        console.error('Recommendations elements not found');
        return;
    }
    
    list.innerHTML = '';
    
    if (recommendations && Array.isArray(recommendations)) {
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745; margin-right: 10px;"></i>${rec}`;
            list.appendChild(item);
        });
    }
    
    container.style.display = 'block';
}

// Hide analysis components
function hideAnalysisComponents() {
    const components = [
        'stressIndicator',
        'problemAnalysis', 
        'actionPlan',
        'priorityMatrix',
        'resourcesHelp',
        'recommendations'
    ];
    
    components.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Show Problem Analysis
function showProblemAnalysis(analysis) {
    const container = document.getElementById('problemAnalysis');
    const breakdown = document.getElementById('problemBreakdown');
    const rootCause = document.getElementById('rootCause');
    
    if (!container || !breakdown || !rootCause) {
        console.error('Problem analysis elements not found');
        return;
    }
    
    // Problem breakdown
    let breakdownHTML = '<h4><i class="fas fa-exclamation-triangle"></i> Masalah Utama</h4>';
    
    if (analysis.mainProblems && analysis.mainProblems.length > 0) {
        breakdownHTML += '<ul>';
        analysis.mainProblems.forEach(problem => {
            breakdownHTML += `<li>• ${problem}</li>`;
        });
        breakdownHTML += '</ul>';
    }
    
    // Problem types tags
    if (analysis.problemTypes && analysis.problemTypes.length > 0) {
        breakdownHTML += '<div class="problem-tags">';
        analysis.problemTypes.forEach(type => {
            breakdownHTML += `<span class="problem-tag ${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`;
        });
        breakdownHTML += '</div>';
    }
    
    // Urgency level
    if (analysis.urgencyLevel) {
        const urgencyClass = `urgency-${analysis.urgencyLevel.toLowerCase()}`;
        breakdownHTML += `<div class="urgency-indicator ${urgencyClass}">
            <i class="fas fa-clock"></i> Tingkat Urgensi: ${analysis.urgencyLevel}
        </div>`;
    }
    
    breakdown.innerHTML = breakdownHTML;
    
    // Root cause
    if (analysis.rootCause) {
        rootCause.innerHTML = `
            <h4><i class="fas fa-search"></i> Akar Masalah</h4>
            <p>${analysis.rootCause}</p>
        `;
    }
    
    container.style.display = 'block';
}

// Show Action Plan
function showActionPlan(plan) {
    const container = document.getElementById('actionPlan');
    const immediateList = document.getElementById('immediateActions');
    const shortTermList = document.getElementById('shortTermActions');
    const longTermList = document.getElementById('longTermActions');
    
    if (!container || !immediateList || !shortTermList || !longTermList) {
        console.error('Action plan elements not found');
        return;
    }
    
    // Immediate actions
    immediateList.innerHTML = '';
    if (plan.immediate && plan.immediate.length > 0) {
        plan.immediate.forEach(action => {
            const li = document.createElement('li');
            li.textContent = action;
            immediateList.appendChild(li);
        });
    }
    
    // Short term actions
    shortTermList.innerHTML = '';
    if (plan.shortTerm && plan.shortTerm.length > 0) {
        plan.shortTerm.forEach(action => {
            const li = document.createElement('li');
            li.textContent = action;
            shortTermList.appendChild(li);
        });
    }
    
    // Long term actions
    longTermList.innerHTML = '';
    if (plan.longTerm && plan.longTerm.length > 0) {
        plan.longTerm.forEach(action => {
            const li = document.createElement('li');
            li.textContent = action;
            longTermList.appendChild(li);
        });
    }
    
    container.style.display = 'block';
}

// Show Priority Matrix
function showPriorityMatrix(matrix) {
    const container = document.getElementById('priorityMatrix');
    const matrixBody = document.getElementById('matrixBody');
    
    if (!container || !matrixBody) {
        console.error('Priority matrix elements not found');
        return;
    }
    
    matrixBody.innerHTML = '';
    
    if (matrix && Array.isArray(matrix)) {
        matrix.forEach(item => {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            
            const priorityClass = `priority-${item.priority.toLowerCase()}`;
            const effortClass = `effort-${item.effort.toLowerCase()}`;
            
            row.innerHTML = `
                <div class="matrix-cell">${item.task}</div>
                <div class="matrix-cell ${priorityClass}">${item.priority}</div>
                <div class="matrix-cell">${item.deadline}</div>
                <div class="matrix-cell ${effortClass}">${item.effort}</div>
            `;
            
            matrixBody.appendChild(row);
        });
    }
    
    container.style.display = 'block';
}

// Show Resources
function showResources(resources) {
    const container = document.getElementById('resourcesHelp');
    const resourcesList = document.getElementById('resourcesList');
    
    if (!container || !resourcesList) {
        console.error('Resources elements not found');
        return;
    }
    
    resourcesList.innerHTML = '';
    
    if (resources && Array.isArray(resources)) {
        resources.forEach(resource => {
            const item = document.createElement('div');
            item.className = 'resource-item';
            
            // Determine icon based on resource type
            let icon = 'fas fa-info-circle';
            if (resource.toLowerCase().includes('konselor') || resource.toLowerCase().includes('psikolog')) {
                icon = 'fas fa-user-md';
            } else if (resource.toLowerCase().includes('kampus') || resource.toLowerCase().includes('universitas')) {
                icon = 'fas fa-university';
            } else if (resource.toLowerCase().includes('hotline') || resource.toLowerCase().includes('telepon')) {
                icon = 'fas fa-phone';
            } else if (resource.toLowerCase().includes('online') || resource.toLowerCase().includes('website')) {
                icon = 'fas fa-globe';
            }
            
            item.innerHTML = `
                <i class="${icon}"></i>
                <span>${resource}</span>
            `;
            
            resourcesList.appendChild(item);
        });
    }
    
    container.style.display = 'block';
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'flex' : 'none';
}

// Save stress data for statistics
function saveStressData(level, category) {
    let stressHistory = JSON.parse(localStorage.getItem('stressHistory') || '[]');
    
    const stressData = {
        level: level,
        category: category,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    stressHistory.push(stressData);
    
    // Keep only last 100 entries
    if (stressHistory.length > 100) {
        stressHistory = stressHistory.slice(-100);
    }
    
    localStorage.setItem('stressHistory', JSON.stringify(stressHistory));
}

// Fungsi untuk menangani error API
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showLoading(false);
    document.getElementById('sendButton').disabled = false;
    addMessage('Terjadi kesalahan teknis. Silakan periksa koneksi internet Anda dan coba lagi.', 'bot');
});