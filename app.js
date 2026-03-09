// Personal Dashboard - Alex's Daily Overview

// ==================== CLOCK & GREETING ====================

function updateClock() {
    const now = new Date();
    
    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
    
    // Greeting based on time
    const hour = now.getHours();
    let greeting = 'Hello';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    document.getElementById('greeting').textContent = `${greeting}, Alex`;
}

setInterval(updateClock, 1000);
updateClock();

// ==================== WEATHER ====================

const weatherIcons = {
    0: { icon: '☀️', desc: 'Clear sky' },
    1: { icon: '🌤️', desc: 'Mainly clear' },
    2: { icon: '⛅', desc: 'Partly cloudy' },
    3: { icon: '☁️', desc: 'Overcast' },
    45: { icon: '🌫️', desc: 'Foggy' },
    48: { icon: '🌫️', desc: 'Foggy' },
    51: { icon: '🌧️', desc: 'Light drizzle' },
    53: { icon: '🌧️', desc: 'Drizzle' },
    55: { icon: '🌧️', desc: 'Heavy drizzle' },
    61: { icon: '🌧️', desc: 'Light rain' },
    63: { icon: '🌧️', desc: 'Rain' },
    65: { icon: '🌧️', desc: 'Heavy rain' },
    71: { icon: '🌨️', desc: 'Light snow' },
    73: { icon: '🌨️', desc: 'Snow' },
    75: { icon: '🌨️', desc: 'Heavy snow' },
    95: { icon: '⛈️', desc: 'Thunderstorm' },
};

async function getWeather(city = 'Sacramento') {
    const weatherContent = document.getElementById('weatherContent');
    weatherContent.innerHTML = '<div class="loading">Loading weather...</div>';
    
    try {
        // Get coordinates for city
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }
        
        const { latitude, longitude, name } = geoData.results[0];
        
        // Get weather data
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`);
        const weatherData = await weatherResponse.json();
        
        const current = weatherData.current;
        const weatherCode = current.weather_code;
        const weatherInfo = weatherIcons[weatherCode] || { icon: '❓', desc: 'Unknown' };
        
        // Convert C to F
        const tempF = Math.round((current.temperature_2m * 9/5) + 32);
        const feelsLikeF = Math.round((current.apparent_temperature * 9/5) + 32);
        const windMph = Math.round(current.wind_speed_10m * 0.621371);
        
        weatherContent.innerHTML = `
            <div class="weather-main">
                <div class="weather-icon">${weatherInfo.icon}</div>
                <div class="weather-temp">${tempF}°F</div>
            </div>
            <div class="weather-desc">${weatherInfo.desc}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <div class="weather-detail-value">${feelsLikeF}°</div>
                    <div class="weather-detail-label">Feels Like</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-value">${current.relative_humidity_2m}%</div>
                    <div class="weather-detail-label">Humidity</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-value">${windMph} mph</div>
                    <div class="weather-detail-label">Wind</div>
                </div>
            </div>
        `;
        
    } catch (error) {
        weatherContent.innerHTML = `
            <div class="loading">
                Could not load weather.<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function updateWeather() {
    const city = document.getElementById('cityInput').value.trim() || 'Oakland';
    getWeather(city);
}

// Load initial weather
getWeather();

// ==================== TASKS ====================

let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [
    { id: 1, text: 'Review Franks Angels donations', completed: false },
    { id: 2, text: 'Call about field maintenance', completed: true },
    { id: 3, text: 'Update website content', completed: false }
];

function saveTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    updateStats();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="delete-task" onclick="deleteTask(${task.id})">✕</span>
        `;
        taskList.appendChild(li);
    });
    
    document.getElementById('taskCount').textContent = tasks.filter(t => !t.completed).length;
    updateStats();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (text) {
        tasks.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        input.value = '';
        saveTasks();
        renderTasks();
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        addTask();
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    event.stopPropagation();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== EVENTS ====================

let events = JSON.parse(localStorage.getItem('dashboard_events')) || [
    { id: 1, title: 'Field Inspection', time: '14:00', location: 'Sunset Community Park' },
    { id: 2, title: 'Team Meeting', time: '16:30', location: 'Virtual' },
    { id: 3, title: 'Donor Call', time: '10:00', location: 'Phone' }
];

function saveEvents() {
    localStorage.setItem('dashboard_events', JSON.stringify(events));
    updateStats();
}

function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    
    // Sort events by time
    events.sort((a, b) => a.time.localeCompare(b.time));
    
    if (events.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No upcoming events</div>';
        return;
    }
    
    eventsList.innerHTML = events.map(event => {
        const [hour, minute] = event.time.split(':');
        const hour12 = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        
        return `
            <div class="event-item">
                <div class="event-time">
                    <div class="event-hour">${hour12}:${minute}</div>
                    <div class="event-ampm">${ampm}</div>
                </div>
                <div class="event-details">
                    <h3>${escapeHtml(event.title)}</h3>
                    <div class="event-location">📍 ${escapeHtml(event.location)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    updateStats();
}

function addEvent() {
    const title = prompt('Event title:');
    if (!title) return;
    
    const time = prompt('Time (HH:MM, 24-hour format):', '14:00');
    if (!time) return;
    
    const location = prompt('Location:', '');
    
    events.push({
        id: Date.now(),
        title: title,
        time: time,
        location: location || 'TBD'
    });
    
    saveEvents();
    renderEvents();
}

// ==================== STATS ====================

function updateStats() {
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    // Count events for today (simplified - just counting all)
    const upcoming = events.length;
    
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('upcomingEvents').textContent = upcoming;
    
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== INIT ====================

renderTasks();
renderEvents();
updateStats();

console.log('🎯 Personal Dashboard loaded!');
console.log('Features: Clock, Weather, Tasks, Events');