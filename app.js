/**
 * Atmos Weather Platform — Next-Gen Core Engine
 * Powered by Open-Meteo Free APIs (Zero Cost, No API Keys Required)
 */

// WMO Weather Code Mapping Table
const WMO_CODES = {
  0: { label: 'Clear sky', category: 'sunny', icon: '☀️' },
  1: { label: 'Mainly clear', category: 'partlyCloudy', icon: '🌤️' },
  2: { label: 'Partly cloudy', category: 'partlyCloudy', icon: '⛅' },
  3: { label: 'Overcast', category: 'cloudy', icon: '☁️' },
  45: { label: 'Foggy mist', category: 'foggy', icon: '🌫️' },
  48: { label: 'Depositing rime fog', category: 'foggy', icon: '🌫️' },
  51: { label: 'Light drizzle', category: 'rainy', icon: '🌦️' },
  53: { label: 'Moderate drizzle', category: 'rainy', icon: '🌧️' },
  55: { label: 'Dense drizzle', category: 'rainy', icon: '🌧️' },
  61: { label: 'Slight rain', category: 'rainy', icon: '🌧️' },
  63: { label: 'Moderate rain', category: 'rainy', icon: '🌧️' },
  65: { label: 'Heavy rain', category: 'rainy', icon: '🌧️' },
  71: { label: 'Slight snow fall', category: 'snowy', icon: '🌨️' },
  73: { label: 'Moderate snow fall', category: 'snowy', icon: '❄️' },
  75: { label: 'Heavy snow fall', category: 'snowy', icon: '❄️' },
  77: { label: 'Snow grains', category: 'snowy', icon: '❄️' },
  80: { label: 'Slight rain showers', category: 'rainy', icon: '🌦️' },
  81: { label: 'Moderate rain showers', category: 'rainy', icon: '🌧️' },
  82: { label: 'Violent rain showers', category: 'stormy', icon: '⛈️' },
  85: { label: 'Slight snow showers', category: 'snowy', icon: '🌨️' },
  86: { label: 'Heavy snow showers', category: 'snowy', icon: '❄️' },
  95: { label: 'Thunderstorm', category: 'stormy', icon: '🌩️' },
  96: { label: 'Thunderstorm with hail', category: 'stormy', icon: '⛈️' },
  99: { label: 'Heavy thunderstorm', category: 'stormy', icon: '⛈️' }
};

// High-Resolution Unsplash Atmospheric Backgrounds (Day & Night)
const WEATHER_BACKGROUNDS_DAY = {
  sunny: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=2560&q=80',
  cloudy: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2560&q=80',
  partlyCloudy: 'https://images.unsplash.com/photo-1595865749889-b37a53f4feab?auto=format&fit=crop&w=2560&q=80',
  rainy: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2560&q=80',
  stormy: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2560&q=80',
  snowy: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=2560&q=80',
  windy: 'https://images.unsplash.com/photo-1505672678564-9b2f6ef53bf6?auto=format&fit=crop&w=2560&q=80',
  foggy: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=2560&q=80'
};

const WEATHER_BACKGROUNDS_NIGHT = {
  sunny: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=80',
  cloudy: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=2560&q=80',
  partlyCloudy: 'https://images.unsplash.com/photo-1532978379173-523e16f371f2?auto=format&fit=crop&w=2560&q=80',
  rainy: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2560&q=80',
  stormy: 'https://images.unsplash.com/photo-1511289081-d06dda19034d?auto=format&fit=crop&w=2560&q=80',
  snowy: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=80',
  windy: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2560&q=80',
  foggy: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2560&q=80'
};

class AtmosApp {
  constructor() {
    this.currentLocation = {
      name: 'Brooklyn, New York',
      lat: 40.7128,
      lon: -74.0060,
      country: 'USA'
    };
    this.unit = localStorage.getItem('atmos_unit') || 'C'; // 'C' or 'F'
    this.weatherData = null;

    // Persistent Saved Locations
    const saved = localStorage.getItem('atmos_saved_locations');
    this.recents = saved ? JSON.parse(saved) : [
      { name: 'Home', tag: '🏠', country: 'Brooklyn', tempC: 18, category: 'cloudy', icon: '⛅', lat: 40.7128, lon: -74.0060 },
      { name: 'Palermo', tag: '🏖️', country: 'Italy', tempC: 22, category: 'sunny', icon: '☀️', lat: 38.1157, lon: 13.3615 },
      { name: 'Tokyo', tag: '💼', country: 'Japan', tempC: 19, category: 'partlyCloudy', icon: '🌤️', lat: 35.6762, lon: 139.6503 }
    ];

    this.effectsEngine = null;
    this.chatHistory = [];
    this.aiConversationHistory = [];
    this.aiBackendUrl = 'http://localhost:5005/api/ai';

    // Persistent Compare Cities Stack (Robust legacy Migration)
    let savedCompare = localStorage.getItem('atmos_compare_cities');
    if (savedCompare) {
      try {
        let parsed = JSON.parse(savedCompare);
        if (Array.isArray(parsed)) {
          this.compareCities = parsed.map(item => {
            if (typeof item === 'string') {
              if (item.includes('Palermo')) return { name: 'Palermo, Italy', lat: 38.1157, lon: 13.3615 };
              if (item.includes('Tokyo')) return { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 };
              if (item.includes('London')) return { name: 'London, UK', lat: 51.5074, lon: -0.1278 };
              if (item.includes('Paris')) return { name: 'Paris, France', lat: 48.8566, lon: 2.3522 };
              return { name: item, lat: 40.7128, lon: -74.0060 };
            }
            return item;
          }).filter(c => c && c.name);
        }
      } catch (e) {
        this.compareCities = null;
      }
    }

    if (!this.compareCities || !Array.isArray(this.compareCities) || this.compareCities.length === 0) {
      this.compareCities = [
        { name: 'Palermo, Italy', lat: 38.1157, lon: 13.3615 },
        { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
        { name: 'London, UK', lat: 51.5074, lon: -0.1278 }
      ];
    }

    this.init();
  }

  init() {
    // Canvas Effects Engine
    this.effectsEngine = new WeatherEffects('effects-canvas');
    this.effectsEngine.start();

    // Event Binding
    this.bindEvents();

    // Check Gemini AI Backend Connection Status
    this.checkAIStatus();

    // Live City Timezone Clock
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Initial Weather Load
    this.fetchWeatherData(this.currentLocation.lat, this.currentLocation.lon, this.currentLocation.name);
    this.renderRecentStack();
  }

  bindEvents() {
    // Unit Toggler
    document.getElementById('unit-c').addEventListener('click', () => this.setUnit('C'));
    document.getElementById('unit-f').addEventListener('click', () => this.setUnit('F'));

    // Search Modal Controls
    const searchModal = document.getElementById('search-modal');
    const openBtn = document.getElementById('btn-open-search');
    const closeBtn = document.getElementById('btn-close-search');
    const searchInput = document.getElementById('search-input');

    if (openBtn && searchModal) openBtn.addEventListener('click', () => { searchModal.classList.add('open'); searchInput.focus(); });
    if (closeBtn && searchModal) closeBtn.addEventListener('click', () => searchModal.classList.remove('open'));
    if (searchModal) searchModal.addEventListener('click', (e) => { if (e.target === searchModal) searchModal.classList.remove('open'); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay, .ai-chat-drawer, .alerts-drawer').forEach(el => el.classList.remove('open'));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchModal.classList.add('open');
        searchInput.focus();
      }
    });

    // Geolocation Auto-detect
    document.getElementById('btn-geolocation').addEventListener('click', () => this.useDeviceLocation());
    document.getElementById('btn-quick-location').addEventListener('click', () => this.useDeviceLocation());

    // Debounced Search Input
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query.length < 2) {
          document.getElementById('search-results-list').innerHTML = '';
          return;
        }
        debounceTimer = setTimeout(() => this.searchCity(query), 300);
      });
    }

    // Popular Quick City Chips
    document.querySelectorAll('.quick-city').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-city');
        const lat = parseFloat(btn.getAttribute('data-lat'));
        const lon = parseFloat(btn.getAttribute('data-lon'));
        this.fetchWeatherData(lat, lon, city);
        searchModal.classList.remove('open');
      });
    });

    // Weather Alerts Drawer Toggle
    const alertsBtn = document.getElementById('btn-open-alerts');
    const alertsDrawer = document.getElementById('alerts-drawer');
    const closeAlertsBtn = document.getElementById('btn-close-alerts');
    if (alertsBtn && alertsDrawer) alertsBtn.addEventListener('click', () => alertsDrawer.classList.toggle('open'));
    if (closeAlertsBtn && alertsDrawer) closeAlertsBtn.addEventListener('click', () => alertsDrawer.classList.remove('open'));

    // Atmos AI Chat Drawer Toggle
    const aiBtn = document.getElementById('btn-open-ai');
    const aiDrawer = document.getElementById('ai-chat-drawer');
    const closeAiBtn = document.getElementById('btn-close-ai');
    const sendAiBtn = document.getElementById('btn-send-ai');
    const clearAiBtn = document.getElementById('btn-clear-ai-chat');
    const aiInput = document.getElementById('ai-user-input');

    if (aiBtn && aiDrawer) aiBtn.addEventListener('click', () => { aiDrawer.classList.toggle('open'); this.checkAIStatus(); });
    if (closeAiBtn && aiDrawer) closeAiBtn.addEventListener('click', () => aiDrawer.classList.remove('open'));
    if (clearAiBtn) clearAiBtn.addEventListener('click', () => this.clearAIChat());
    if (sendAiBtn) sendAiBtn.addEventListener('click', () => this.handleUserAIMessage());
    if (aiInput) aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserAIMessage();
      }
    });

    // Quick AI Suggested Prompts
    document.querySelectorAll('.ai-prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const promptText = btn.getAttribute('data-prompt');
        document.getElementById('ai-user-input').value = promptText;
        this.handleUserAIMessage();
      });
    });

    // Header Tabs (Compare, Travel, Settings)
    const compareModal = document.getElementById('compare-modal');
    const travelModal = document.getElementById('travel-modal');
    const settingsModal = document.getElementById('settings-modal');

    document.getElementById('btn-tab-compare').addEventListener('click', () => { 
      this.renderCityComparison(); 
      compareModal.classList.add('open'); 
    });
    document.getElementById('btn-close-compare').addEventListener('click', () => compareModal.classList.remove('open'));

    // Compare Search Input & Quick Chips
    const compareSearchInput = document.getElementById('compare-search-input');
    const compareResultsBox = document.getElementById('compare-search-results');
    let compareTimer;
    if (compareSearchInput) {
      compareSearchInput.addEventListener('input', (e) => {
        clearTimeout(compareTimer);
        const query = e.target.value.trim();
        if (query.length < 2) {
          if (compareResultsBox) compareResultsBox.style.display = 'none';
          return;
        }
        compareTimer = setTimeout(() => this.searchCityForCompare(query), 300);
      });
    }

    document.querySelectorAll('.add-compare-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-city');
        this.addCityToCompare(city);
      });
    });

    document.getElementById('btn-tab-travel').addEventListener('click', () => travelModal.classList.add('open'));
    document.getElementById('btn-close-travel').addEventListener('click', () => travelModal.classList.remove('open'));
    document.getElementById('btn-check-travel').addEventListener('click', () => this.handleTravelPlanCheck());

    document.getElementById('btn-tab-settings').addEventListener('click', () => settingsModal.classList.add('open'));
    document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.remove('open'));
    document.getElementById('btn-reset-data').addEventListener('click', () => {
      localStorage.clear();
      alert('Local data reset successfully.');
      location.reload();
    });

    // Add Location Button
    document.getElementById('btn-add-location').addEventListener('click', () => {
      searchModal.classList.add('open');
    });
  }

  setUnit(unit) {
    if (this.unit === unit) return;
    this.unit = unit;
    localStorage.setItem('atmos_unit', unit);
    document.getElementById('unit-c').classList.toggle('active', unit === 'C');
    document.getElementById('unit-f').classList.toggle('active', unit === 'F');
    if (this.weatherData) {
      this.renderUI();
    }
  }

  formatTemp(tempC) {
    if (tempC === null || tempC === undefined || isNaN(tempC)) return '--°';
    if (this.unit === 'F') {
      const tempF = Math.round((tempC * 9/5) + 32);
      return `${tempF}°`;
    }
    return `${Math.round(tempC)}°`;
  }

  updateClock() {
    const now = new Date();
    const tz = this.currentLocation ? this.currentLocation.timezone : null;
    
    const options = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };

    if (tz) {
      try {
        options.timeZone = tz;
      } catch (e) {}
    }

    try {
      const formatted = new Intl.DateTimeFormat('en-US', options).format(now);
      document.getElementById('current-date-time').textContent = formatted;
    } catch (e) {
      document.getElementById('current-date-time').textContent = now.toLocaleDateString('en-US', options);
    }
  }

  async useDeviceLocation() {
    if (!navigator.geolocation) {
      alert('Location access is unavailable. Search for a city instead.');
      return;
    }
    document.getElementById('current-location-title').textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.fetchWeatherData(lat, lon, 'Your Location');
      },
      (err) => {
        alert('Location access is unavailable. Search for a city instead.');
        this.fetchWeatherData(40.7128, -74.0060, 'Brooklyn, New York');
      }
    );
  }

  async searchCity(query) {
    const resultsContainer = document.getElementById('search-results-list');
    resultsContainer.innerHTML = '<div style="padding:10px; color:var(--text-muted);">Searching cities...</div>';
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:10px; color:var(--text-muted);">No locations found matching your query.</div>';
        return;
      }

      resultsContainer.innerHTML = data.results.map(city => `
        <div class="search-result-item" data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${city.name}, ${city.country || ''}">
          <div>
            <strong>${city.name}</strong>
            <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">${city.admin1 || ''} ${city.country || ''}</span>
          </div>
          <span style="font-size:0.8rem; color:var(--accent-ochre);">${city.latitude.toFixed(2)}°, ${city.longitude.toFixed(2)}°</span>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.getAttribute('data-lat'));
          const lon = parseFloat(item.getAttribute('data-lon'));
          const name = item.getAttribute('data-name');
          this.fetchWeatherData(lat, lon, name);
          document.getElementById('search-modal').classList.remove('open');
        });
      });
    } catch (err) {
      resultsContainer.innerHTML = '<div style="padding:10px; color:var(--text-muted);">Error connecting to location service.</div>';
    }
  }

  async fetchWeatherData(lat, lon, locationName) {
    this.currentLocation = { name: locationName, lat, lon };

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,visibility&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,wind_speed_10m,cloud_cover,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto`;
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone`;

      const [resWeather, resAqi] = await Promise.all([
        fetch(url),
        fetch(aqiUrl).catch(() => null)
      ]);

      const data = await resWeather.json();
      let aqiData = null;
      if (resAqi && resAqi.ok) {
        aqiData = await resAqi.json();
      }

      this.currentLocation.timezone = data.timezone;
      this.currentLocation.utcOffsetSeconds = data.utc_offset_seconds;

      this.weatherData = {
        location: this.currentLocation,
        current: data.current,
        hourly: data.hourly,
        daily: data.daily,
        airQuality: aqiData?.current || {
          us_aqi: 34, pm2_5: 8.4, pm10: 14.2, carbon_monoxide: 210, nitrogen_dioxide: 12.1, ozone: 45.0
        }
      };

      this.addToRecents(locationName, data.current.temperature_2m, data.current.weather_code, lat, lon);
      this.renderUI();

    } catch (err) {
      console.warn('Network issue fetching live weather. Loading Atmos resilient fallback data.', err);
      this.loadFallbackData(locationName, lat, lon);
    }
  }

  loadFallbackData(locationName, lat, lon) {
    const times = [];
    const temps = [];
    const precipProbs = [];
    const codes = [];
    const now = new Date();

    for (let i = 0; i < 168; i++) {
      const d = new Date(now.getTime() + i * 3600 * 1000);
      times.push(d.toISOString());
      temps.push(Math.round(18 + Math.sin(i / 4) * 6));
      precipProbs.push(Math.round(Math.abs(Math.sin(i / 3)) * 60));
      codes.push(i % 12 === 0 ? 82 : (i % 6 === 0 ? 3 : 0));
    }

    this.weatherData = {
      location: { name: locationName, lat, lon, timezone: 'UTC' },
      current: {
        temperature_2m: 18,
        relative_humidity_2m: 68,
        apparent_temperature: 17,
        weather_code: 82,
        surface_pressure: 1014,
        wind_speed_10m: 14,
        wind_direction_10m: 315,
        is_day: 1,
        cloud_cover: 42,
        visibility: 10000
      },
      hourly: {
        time: times,
        temperature_2m: temps,
        precipitation_probability: precipProbs,
        weather_code: codes,
        wind_speed_10m: Array(168).fill(12),
        apparent_temperature: temps.map(t => t - 1)
      },
      daily: {
        time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'],
        weather_code: [82, 3, 2, 61, 0, 1, 2],
        temperature_2m_max: [29, 26, 27, 23, 30, 25, 24],
        temperature_2m_min: [12, 14, 15, 11, 16, 13, 12],
        sunrise: ['2026-09-30T06:42'],
        sunset: ['2026-09-30T18:55'],
        uv_index_max: [4.2, 5.1, 6.0, 3.8, 7.2, 5.8, 4.9]
      },
      airQuality: { us_aqi: 34, pm2_5: 8.4, pm10: 14.2, carbon_monoxide: 210, nitrogen_dioxide: 12.1, ozone: 45.0 }
    };
    this.renderUI();
  }

  addToRecents(name, tempC, code, lat, lon) {
    const meta = WMO_CODES[code] || WMO_CODES[0];
    this.recents = this.recents.filter(r => r.name.toLowerCase() !== name.toLowerCase());
    this.recents.unshift({
      name: name.split(',')[0],
      tag: '📍',
      country: name.split(',')[1] || '',
      tempC,
      category: meta.category,
      icon: meta.icon,
      lat,
      lon
    });
    if (this.recents.length > 5) this.recents.pop();
    localStorage.setItem('atmos_saved_locations', JSON.stringify(this.recents));
    this.renderRecentStack();
  }

  renderUI() {
    const cur = this.weatherData.current;
    const daily = this.weatherData.daily;
    const meta = WMO_CODES[cur.weather_code] || WMO_CODES[0];
    const isNight = cur.is_day === 0;

    this.updateClock();

    // Location & Header
    document.getElementById('current-location-title').textContent = this.currentLocation.name;
    document.getElementById('radar-city-label').textContent = this.currentLocation.name.split(',')[0];
    document.getElementById('coord-display').textContent = `${Math.abs(this.currentLocation.lat).toFixed(2)}° ${this.currentLocation.lat>=0?'N':'S'}, ${Math.abs(this.currentLocation.lon).toFixed(2)}° ${this.currentLocation.lon>=0?'E':'W'}`;

    // Hero Temperature & Condition
    document.getElementById('hero-temp').textContent = this.formatTemp(cur.temperature_2m);
    document.getElementById('hero-hi').textContent = this.formatTemp(daily.temperature_2m_max[0]);
    document.getElementById('hero-lo').textContent = this.formatTemp(daily.temperature_2m_min[0]);
    document.getElementById('hero-feels-num').textContent = this.formatTemp(cur.apparent_temperature);

    const timeOfDayTag = isNight ? ' 🌙 Night' : ' ☀️ Day';
    document.getElementById('hero-condition').textContent = `${meta.label} (${timeOfDayTag.trim()})`;

    // Dynamic Background Photo & Particle Effects
    const bgMap = isNight ? WEATHER_BACKGROUNDS_NIGHT : WEATHER_BACKGROUNDS_DAY;
    const bgUrl = bgMap[meta.category] || bgMap.cloudy;
    const viewportEl = document.getElementById('app-viewport');
    viewportEl.style.backgroundImage = `url('${bgUrl}')`;
    viewportEl.classList.toggle('night-theme', isNight);

    this.effectsEngine.setCondition(meta.category, isNight);

    // Weather Metrics Grid
    document.getElementById('val-wind').textContent = `${cur.wind_speed_10m} km/h`;
    document.getElementById('sub-wind').textContent = `${this.getWindDirection(cur.wind_direction_10m)} • Gusts ~${Math.round(cur.wind_speed_10m*1.4)} km/h`;

    document.getElementById('val-humidity').textContent = `${cur.relative_humidity_2m}%`;
    document.getElementById('sub-humidity').textContent = `Dew point ${this.formatTemp(cur.temperature_2m - ((100 - cur.relative_humidity_2m)/5))}`;

    const uv = daily.uv_index_max[0] || 4.2;
    document.getElementById('val-uv').textContent = uv.toFixed(1);
    document.getElementById('sub-uv').textContent = uv > 6 ? 'High UV • Use Protection' : 'Moderate Protection needed';

    document.getElementById('val-pressure').textContent = `${Math.round(cur.surface_pressure)} hPa`;
    document.getElementById('sub-pressure').textContent = 'Barometer Steady';

    const visKm = cur.visibility ? (cur.visibility / 1000).toFixed(1) : '10.0';
    document.getElementById('val-visibility').textContent = `${visKm} km`;
    document.getElementById('sub-visibility').textContent = visKm > 8 ? 'Clear horizon' : 'Reduced visibility';

    document.getElementById('val-cloud').textContent = `${cur.cloud_cover || 42}%`;

    // Render Sub-Components
    this.renderDailySummaryAndInsights(cur, daily, meta);
    this.renderHourlyForecastStrip();
    this.renderPrecipitationGraph();
    this.renderAdvancedAQI();
    this.renderClothingAdvisor(cur);
    this.renderActivityScores(cur);
    this.renderSunAndMoon(daily);
    this.renderWeatherAlerts(cur, daily);
    this.updateStatusBadge(cur, meta.category);
    this.renderForecastChart(daily);
  }

  renderDailySummaryAndInsights(cur, daily, meta) {
    const summaryText = document.getElementById('daily-summary-text');
    const isNight = cur.is_day === 0;

    summaryText.textContent = `${meta.label} conditions expected today with highs reaching ${this.formatTemp(daily.temperature_2m_max[0])} and nighttime lows around ${this.formatTemp(daily.temperature_2m_min[0])}. Pressure is steady at ${Math.round(cur.surface_pressure)} hPa.`;

    document.getElementById('insight-rain').textContent = `Rain probability max ${daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 15}%`;
    document.getElementById('insight-uv').textContent = `UV reaches peak ${daily.uv_index_max[0]} around 1 PM`;
    document.getElementById('insight-wind').textContent = `Wind blowing ${this.getWindDirection(cur.wind_direction_10m)} at ${cur.wind_speed_10m} km/h`;
  }

  renderHourlyForecastStrip() {
    const container = document.getElementById('hourly-scroll-container');
    if (!container || !this.weatherData.hourly) return;

    const hourly = this.weatherData.hourly;
    const cardsHtml = [];

    for (let i = 0; i < 24 && i < hourly.time.length; i++) {
      const timeStr = i === 0 ? 'NOW' : new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tempC = hourly.temperature_2m[i];
      const feelsC = hourly.apparent_temperature ? hourly.apparent_temperature[i] : tempC - 1;
      const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 5;
      const windSpeed = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 12;
      const code = hourly.weather_code[i];
      const meta = WMO_CODES[code] || WMO_CODES[0];

      cardsHtml.push(`
        <div class="hourly-card-item ${i===0?'active':''}" onclick="alert('${timeStr}: ${meta.label}, ${this.formatTemp(tempC)}, Rain: ${rainProb}%')">
          <span class="hourly-card-time">${timeStr}</span>
          <span class="hourly-card-icon">${meta.icon}</span>
          <span class="hourly-card-temp">${this.formatTemp(tempC)}</span>
          <span class="hourly-card-feels">Feels ${this.formatTemp(feelsC)}</span>
          <span class="hourly-card-rain">💧 ${rainProb}%</span>
          <span class="hourly-card-wind">💨 ${Math.round(windSpeed)}k/h</span>
        </div>
      `);
    }

    container.innerHTML = cardsHtml.join('');
  }

  renderPrecipitationGraph() {
    const svg = document.getElementById('precip-svg');
    if (!svg || !this.weatherData.hourly || !this.weatherData.hourly.precipitation_probability) return;

    const probs = this.weatherData.hourly.precipitation_probability.slice(0, 12);
    const times = this.weatherData.hourly.time.slice(0, 12);

    const width = 800;
    const height = 140;
    const padding = 30;

    const stepX = (width - padding * 2) / (probs.length - 1);
    const points = probs.map((prob, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (prob / 100) * (height - padding * 2);
      return { x, y, prob, timeStr: new Date(times[i]).toLocaleTimeString([], { hour: '2-digit' }) };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const maxProb = Math.max(...probs);
    document.getElementById('precip-peak-label').textContent = `Peak: ${maxProb}% Rain Prob`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="precip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(56, 189, 248, 0.4)" />
          <stop offset="100%" stop-color="rgba(56, 189, 248, 0)" />
        </linearGradient>
      </defs>
      <path d="${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z" fill="url(#precip-grad)" />
      <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#38bdf8" stroke="#fff" stroke-width="1.5" />
        <text x="${p.x}" y="${height - 8}" fill="rgba(255,255,255,0.6)" font-size="10" text-anchor="middle">${p.timeStr}</text>
        <text x="${p.x}" y="${p.y - 10}" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">${p.prob}%</text>
      `).join('')}
    `;
  }

  renderAdvancedAQI() {
    const aqiData = this.weatherData.airQuality;
    const aqi = aqiData.us_aqi || 34;

    const pin = document.getElementById('aqi-indicator-pin');
    const chip = document.getElementById('aqi-status-chip');

    let percent = Math.min(100, (aqi / 200) * 100);
    if (pin) pin.style.left = `${percent}%`;

    let statusText = 'Good Air Quality';
    let color = '#4ade80';

    if (aqi > 150) { statusText = 'Unhealthy Air Quality'; color = '#ef4444'; }
    else if (aqi > 100) { statusText = 'Poor Air Quality'; color = '#f97316'; }
    else if (aqi > 50) { statusText = 'Moderate Air Quality'; color = '#facc15'; }

    if (chip) {
      chip.textContent = `AQI ${aqi} • ${statusText}`;
      chip.style.color = color;
    }

    document.getElementById('pol-pm25').textContent = `${aqiData.pm2_5 || 8.4} µg`;
    document.getElementById('pol-pm10').textContent = `${aqiData.pm10 || 14.2} µg`;
    document.getElementById('pol-co').textContent = `${aqiData.carbon_monoxide || 210} µg`;
    document.getElementById('pol-no2').textContent = `${aqiData.nitrogen_dioxide || 12.1} µg`;
    document.getElementById('pol-o3').textContent = `${aqiData.ozone || 45.0} µg`;
  }

  renderClothingAdvisor(cur) {
    const tempC = cur.temperature_2m;
    const container = document.getElementById('clothing-items-row');
    const reason = document.getElementById('clothing-reason');

    let items = [];
    let explanation = '';

    if (tempC > 26) {
      items = ['👕 Light T-Shirt', '🩳 Shorts', '🕶️ Sunglasses', '🧢 Cap'];
      explanation = `At ${this.formatTemp(tempC)}, warm sunny weather prevails. Wear breathable lightweight fabrics and stay hydrated.`;
    } else if (tempC > 18) {
      items = ['👕 T-Shirt', '🧥 Light Jacket', '👟 Sneakers', '🕶️ Sunglasses'];
      explanation = `Mild ${this.formatTemp(tempC)} temperatures with a humidity of ${cur.relative_humidity_2m}%. A light shirt with an optional cardigan or windbreaker is ideal.`;
    } else if (tempC > 10) {
      items = ['🧥 Jacket', '👖 Jeans', '🧣 Scarf', '👟 Boots'];
      explanation = `Cool temperatures (${this.formatTemp(tempC)}) and wind speed of ${cur.wind_speed_10m} km/h. Layer up with a sweater or warm jacket.`;
    } else {
      items = ['🧥 Heavy Coat', '🧣 Thermal Scarf', '🧤 Gloves', '🥾 Warm Boots'];
      explanation = `Chilly ${this.formatTemp(tempC)} weather. Wear heavy thermal layers, gloves, and insulated footwear.`;
    }

    if (container) container.innerHTML = items.map(it => `<div class="clothing-item-chip">${it}</div>`).join('');
    if (reason) reason.textContent = explanation;
  }

  renderActivityScores(cur) {
    const tempC = cur.temperature_2m;
    const wind = cur.wind_speed_10m;
    const hum = cur.relative_humidity_2m;

    let runScore = 90 - Math.abs(18 - tempC) * 3 - (wind > 20 ? 15 : 0);
    let walkScore = 98 - Math.abs(20 - tempC) * 2;
    let cycleScore = 88 - (wind > 25 ? 25 : 0) - Math.abs(22 - tempC) * 2;
    let photoScore = cur.cloud_cover > 70 ? 65 : 85;

    runScore = Math.max(20, Math.min(99, Math.round(runScore)));
    walkScore = Math.max(20, Math.min(99, Math.round(walkScore)));
    cycleScore = Math.max(20, Math.min(99, Math.round(cycleScore)));

    const grid = document.getElementById('activities-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="activity-item-box">
          <div class="activity-top-label"><span>🏃 Running</span> <span class="activity-score-num">${runScore}%</span></div>
          <div class="score-progress-bar"><div class="score-progress-fill" style="width: ${runScore}%;"></div></div>
        </div>
        <div class="activity-item-box">
          <div class="activity-top-label"><span>🚶 Walking</span> <span class="activity-score-num">${walkScore}%</span></div>
          <div class="score-progress-bar"><div class="score-progress-fill" style="width: ${walkScore}%;"></div></div>
        </div>
        <div class="activity-item-box">
          <div class="activity-top-label"><span>🚴 Cycling</span> <span class="activity-score-num">${cycleScore}%</span></div>
          <div class="score-progress-bar"><div class="score-progress-fill" style="width: ${cycleScore}%;"></div></div>
        </div>
        <div class="activity-item-box">
          <div class="activity-top-label"><span>📷 Photography</span> <span class="activity-score-num">${photoScore}%</span></div>
          <div class="score-progress-bar"><div class="score-progress-fill" style="width: ${photoScore}%;"></div></div>
        </div>
      `;
    }
  }

  renderSunAndMoon(daily) {
    if (daily.sunrise && daily.sunrise[0]) {
      const sr = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const ss = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('ast-sunrise').textContent = sr;
      document.getElementById('ast-sunset').textContent = ss;
    }

    // Moon Phase Calculation based on current date
    const dayOfMonth = new Date().getDate();
    const moonPhases = ['🌑 New Moon', '🌒 Waxing Crescent', '🌓 First Quarter', '🌔 Waxing Gibbous', '🌕 Full Moon', '🌖 Waning Gibbous', '🌗 Last Quarter', '🌘 Waning Crescent'];
    const phaseIdx = Math.floor((dayOfMonth / 30) * 8) % 8;
    const phaseStr = moonPhases[phaseIdx];

    document.getElementById('moon-icon').textContent = phaseStr.split(' ')[0];
    document.getElementById('moon-phase-name').textContent = phaseStr.substring(2);
    document.getElementById('moon-illumination').textContent = `Illumination: ${Math.round(50 + Math.sin(dayOfMonth) * 45)}%`;
  }

  renderWeatherAlerts(cur, daily) {
    const alertsList = document.getElementById('alerts-list-container');
    const badge = document.getElementById('alert-count-badge');
    const alerts = [];

    if (cur.wind_speed_10m > 25) {
      alerts.push({ title: '💨 Strong Wind Advisory', desc: `Wind gusts reaching ${cur.wind_speed_10m} km/h. Secure loose outdoor objects.` });
    }
    if (daily.uv_index_max[0] > 6) {
      alerts.push({ title: '☀️ High UV Alert', desc: `UV Index reaching ${daily.uv_index_max[0]} today. Apply SPF 30+ sunscreen.` });
    }
    if (cur.weather_code >= 80) {
      alerts.push({ title: '🌧️ Heavy Rain Warning', desc: 'Precipitation active. Carry an umbrella and drive with extra care.' });
    }

    if (alerts.length === 0) {
      alerts.push({ title: '✅ No Active Severe Hazards', desc: 'Weather conditions are optimal with steady barometric pressure.' });
    }

    if (badge) badge.textContent = alerts.length;
    if (alertsList) {
      alertsList.innerHTML = alerts.map(a => `
        <div class="alert-item-card">
          <div class="alert-item-title">${a.title}</div>
          <div class="alert-item-desc">${a.desc}</div>
        </div>
      `).join('');
    }
  }

  async checkAIStatus() {
    const statusBadge = document.getElementById('ai-status-indicator');
    if (!statusBadge) return;

    try {
      const res = await fetch(`${this.aiBackendUrl}/status`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      if (data && data.available) {
        statusBadge.textContent = '● Live AI Connected';
        statusBadge.style.color = '#4ade80';
      } else {
        statusBadge.textContent = '● AI Offline (Set Key in backend/.env)';
        statusBadge.style.color = '#f4a261';
      }
    } catch (err) {
      statusBadge.textContent = '● AI Offline (Backend Unreachable)';
      statusBadge.style.color = '#f87171';
    }
  }

  buildWeatherContext() {
    if (!this.weatherData) return {};

    const cur = this.weatherData.current || {};
    const daily = this.weatherData.daily || {};
    const hourly = this.weatherData.hourly || {};

    const hourlyList = [];
    if (hourly.time) {
      const count = Math.min(12, hourly.time.length);
      for (let i = 0; i < count; i++) {
        const code = hourly.weather_code ? hourly.weather_code[i] : 0;
        hourlyList.push({
          time: hourly.time[i].includes('T') ? hourly.time[i].split('T')[1] : hourly.time[i],
          temperature: this.formatTemp(hourly.temperature_2m[i]),
          condition: WMO_CODES[code]?.label || 'Clear',
          rainProbability: hourly.precipitation_probability ? `${hourly.precipitation_probability[i]}%` : '0%'
        });
      }
    }

    const dailyList = [];
    if (daily.time) {
      const count = Math.min(7, daily.time.length);
      for (let i = 0; i < count; i++) {
        const code = daily.weather_code ? daily.weather_code[i] : 0;
        dailyList.push({
          date: daily.time[i],
          high: this.formatTemp(daily.temperature_2m_max[i]),
          low: this.formatTemp(daily.temperature_2m_min[i]),
          condition: WMO_CODES[code]?.label || 'Clear',
          rainProbabilityMax: daily.precipitation_probability_max ? `${daily.precipitation_probability_max[i]}%` : '0%'
        });
      }
    }

    return {
      location: {
        name: this.currentLocation.name,
        country: this.currentLocation.country || '',
        lat: this.currentLocation.lat,
        lon: this.currentLocation.lon
      },
      unit: this.unit === 'F' ? 'Fahrenheit (°F)' : 'Celsius (°C)',
      current: {
        temperature: this.formatTemp(cur.temperature_2m),
        feelsLike: this.formatTemp(cur.apparent_temperature),
        condition: WMO_CODES[cur.weather_code]?.label || 'Clear',
        humidity: `${cur.relative_humidity_2m}%`,
        windSpeed: `${cur.wind_speed_10m} km/h`,
        windDirection: this.getWindDirection(cur.wind_direction_10m || 0),
        surfacePressure: `${Math.round(cur.surface_pressure || 1013)} hPa`,
        uvIndex: cur.uv_index !== undefined ? cur.uv_index : 4.0
      },
      hourly: hourlyList,
      daily: dailyList,
      airQuality: {
        aqi: this.weatherData.aqi ? this.weatherData.aqi.current.us_aqi : 35,
        category: this.weatherData.aqi ? (this.weatherData.aqi.current.us_aqi > 50 ? 'Moderate' : 'Good') : 'Good'
      }
    };
  }

  async handleUserAIMessage() {
    const input = document.getElementById('ai-user-input');
    const msgContainer = document.getElementById('ai-messages-container');
    const sendBtn = document.getElementById('btn-send-ai');
    const statusBadge = document.getElementById('ai-status-indicator');
    const query = input.value.trim();
    if (!query) return;

    // Render User Bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-msg user';
    userDiv.textContent = query;
    msgContainer.appendChild(userDiv);

    input.value = '';
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Render Thinking Indicator Bubble
    const typingDiv = document.createElement('div');
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.className = 'ai-msg assistant';
    typingDiv.style.opacity = '0.7';
    typingDiv.style.fontStyle = 'italic';
    typingDiv.textContent = 'Atmos AI is thinking...';
    msgContainer.appendChild(typingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    if (statusBadge) {
      statusBadge.textContent = '● Thinking...';
      statusBadge.style.color = '#c084fc';
    }

    try {
      const payload = {
        message: query,
        conversation: this.aiConversationHistory,
        weatherContext: this.buildWeatherContext(),
        unit: this.unit === 'F' ? 'Fahrenheit (°F)' : 'Celsius (°C)'
      };

      const res = await fetch(`${this.aiBackendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      // Remove typing indicator
      if (typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);

      let replyText = '';
      if (data && data.success && data.reply) {
        replyText = data.reply;
        if (statusBadge) {
          statusBadge.textContent = '● Live AI Connected';
          statusBadge.style.color = '#4ade80';
        }
      } else if (data && data.fallback) {
        replyText = data.fallback;
        if (statusBadge) {
          statusBadge.textContent = '● AI Offline (Using Local Engine)';
          statusBadge.style.color = '#f4a261';
        }
      } else {
        replyText = data.error || "Atmos AI couldn't respond right now. Please try again.";
        if (statusBadge) {
          statusBadge.textContent = '● AI Error';
          statusBadge.style.color = '#f87171';
        }
      }

      // Render Assistant Bubble with formatted markdown
      const assistantDiv = document.createElement('div');
      assistantDiv.className = 'ai-msg assistant';
      
      let formattedHtml = replyText
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');

      assistantDiv.innerHTML = formattedHtml;
      msgContainer.appendChild(assistantDiv);

      // Save to Conversation Memory History
      this.aiConversationHistory.push({ role: 'user', content: query });
      this.aiConversationHistory.push({ role: 'assistant', content: replyText });

    } catch (err) {
      if (typingDiv.parentNode) typingDiv.parentNode.removeChild(typingDiv);

      const errDiv = document.createElement('div');
      errDiv.className = 'ai-msg assistant';
      errDiv.style.color = '#f87171';
      errDiv.textContent = "Atmos AI couldn't connect to backend. Please ensure the Python Flask backend is running on http://127.0.0.1:5000.";
      msgContainer.appendChild(errDiv);

      if (statusBadge) {
        statusBadge.textContent = '● AI Offline';
        statusBadge.style.color = '#f87171';
      }
    } finally {
      input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  clearAIChat() {
    this.aiConversationHistory = [];
    const msgContainer = document.getElementById('ai-messages-container');
    if (msgContainer) {
      msgContainer.innerHTML = `
        <div class="ai-msg assistant">
          Conversation history cleared. I am ready for your next weather question!
        </div>
      `;
    }
  }

  async searchCityForCompare(query) {
    const container = document.getElementById('compare-search-results');
    if (!container) return;
    container.style.display = 'block';
    container.innerHTML = '<div style="padding:10px; color:var(--text-muted);">Searching cities...</div>';

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        container.innerHTML = '<div style="padding:10px; color:var(--text-muted);">No locations found.</div>';
        return;
      }

      container.innerHTML = data.results.map(city => {
        const fullName = `${city.name}${city.country ? ', ' + city.country : ''}`;
        return `
          <div class="search-result-item compare-search-item" data-name="${fullName}" data-lat="${city.latitude}" data-lon="${city.longitude}">
            <div>
              <strong>${city.name}</strong>
              <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">${city.admin1 || ''} ${city.country || ''}</span>
            </div>
            <button class="glass-pill" style="padding:2px 8px; font-size:0.75rem; color:var(--accent-ochre);">+ Add</button>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.compare-search-item').forEach(item => {
        item.addEventListener('click', () => {
          const name = item.getAttribute('data-name');
          const lat = parseFloat(item.getAttribute('data-lat'));
          const lon = parseFloat(item.getAttribute('data-lon'));
          this.addCityToCompareObj({ name, lat, lon });
          container.style.display = 'none';
          document.getElementById('compare-search-input').value = '';
        });
      });
    } catch (err) {
      container.innerHTML = '<div style="padding:10px; color:var(--text-muted);">Connection error.</div>';
    }
  }

  async addCityToCompare(cityName) {
    const loc = await this.geocodeCity(cityName);
    if (loc) {
      this.addCityToCompareObj({ name: loc.name, lat: loc.lat, lon: loc.lon });
    }
  }

  addCityToCompareObj(cityObj) {
    if (!cityObj || !cityObj.name) return;

    const exists = this.compareCities.some(c => c.name.toLowerCase() === cityObj.name.toLowerCase());
    if (exists) return;

    if (this.compareCities.length >= 6) {
      alert('You can compare up to 6 locations at a time. Remove one first.');
      return;
    }

    this.compareCities.push(cityObj);
    localStorage.setItem('atmos_compare_cities', JSON.stringify(this.compareCities));
    this.renderCityComparison();
  }

  removeCompareCity(index) {
    this.compareCities.splice(index, 1);
    localStorage.setItem('atmos_compare_cities', JSON.stringify(this.compareCities));
    this.renderCityComparison();
  }

  async renderCityComparison() {
    const container = document.getElementById('compare-grid-container');
    if (!container) return;

    if (!this.compareCities || this.compareCities.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding:30px; text-align:center; color:var(--text-muted);">
          No locations added for comparison. Use the search input above or quick-add chips to compare cities.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding:20px; text-align:center; color:var(--accent-ochre);">
        <span style="font-size:1.4rem;">⚖️</span>
        <p style="margin-top:6px; font-size:0.88rem;">Fetching live meteorological satellite metrics for comparison...</p>
      </div>
    `;

    try {
      const fetchPromises = this.compareCities.map(async (c) => {
        if (!c.lat || !c.lon) {
          const g = await this.geocodeCity(c.name);
          if (g) { c.lat = g.lat; c.lon = g.lon; c.name = g.name; }
        }
        if (!c.lat || !c.lon) return { city: c, wData: null, aqiVal: 35 };

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=precipitation_probability_max&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}&current=us_aqi`;

        const [resWeather, resAqi] = await Promise.all([
          fetch(weatherUrl).catch(() => null),
          fetch(aqiUrl).catch(() => null)
        ]);

        let wData = null;
        let aqiVal = 35;
        if (resWeather && resWeather.ok) wData = await resWeather.json();
        if (resAqi && resAqi.ok) {
          const aData = await resAqi.json();
          if (aData.current && aData.current.us_aqi) aqiVal = aData.current.us_aqi;
        }

        return { city: c, wData, aqiVal };
      });

      const results = await Promise.all(fetchPromises);

      container.innerHTML = results.map((item, idx) => {
        const c = item.city;
        const w = item.wData;
        const cur = w ? w.current : null;
        const daily = w ? w.daily : null;

        const tempStr = cur ? this.formatTemp(cur.temperature_2m) : '--';
        const feelsStr = cur ? this.formatTemp(cur.apparent_temperature) : '--';
        const code = cur ? cur.weather_code : 0;
        const meta = WMO_CODES[code] || WMO_CODES[0];
        const rainProb = daily && daily.precipitation_probability_max ? `${daily.precipitation_probability_max[0]}%` : '0%';
        const humidity = cur ? `${cur.relative_humidity_2m}%` : '--%';
        const windSpeed = cur ? `${Math.round(cur.wind_speed_10m)} km/h` : '--';
        const windDir = cur ? this.getWindDirection(cur.wind_direction_10m || 0) : '';

        const aqiColor = item.aqiVal <= 50 ? '#4ade80' : (item.aqiVal <= 100 ? '#f4a261' : '#f87171');
        const aqiLabel = item.aqiVal <= 50 ? 'Good' : (item.aqiVal <= 100 ? 'Moderate' : 'Poor');

        const countryCode = c.name.includes(',') ? c.name.split(',').pop().trim() : '';
        const nameOnly = c.name.split(',')[0].trim();

        return `
          <div class="compare-card">
            <div class="compare-card-header">
              <div class="compare-title-wrapper">
                <h4 class="compare-city-name" title="${c.name}">${nameOnly}</h4>
                ${countryCode ? `<span class="compare-country-badge">${countryCode}</span>` : ''}
              </div>
              <button class="compare-remove-btn" data-idx="${idx}" title="Remove city" aria-label="Remove city">✕</button>
            </div>

            <div class="compare-hero-row">
              <div class="compare-card-temp">${tempStr}</div>
              <div class="compare-cond-badge">
                <span class="compare-cond-icon">${meta.icon}</span>
                <span class="compare-cond-text">${meta.label}</span>
              </div>
            </div>

            <div class="compare-metrics-grid">
              <div class="compare-metric-pill">
                <span class="m-label">Feels Like</span>
                <span class="m-val">${feelsStr}</span>
              </div>
              <div class="compare-metric-pill">
                <span class="m-label">Rain Chance</span>
                <span class="m-val">${rainProb}</span>
              </div>
              <div class="compare-metric-pill">
                <span class="m-label">Wind</span>
                <span class="m-val">${windSpeed} ${windDir}</span>
              </div>
              <div class="compare-metric-pill">
                <span class="m-label">Humidity</span>
                <span class="m-val">${humidity}</span>
              </div>
              <div class="compare-metric-pill full-width">
                <span class="m-label">Air Quality</span>
                <span class="aqi-badge" style="background:${aqiColor}20; color:${aqiColor}; border:1px solid ${aqiColor}40;">
                  <span class="aqi-dot" style="background:${aqiColor}; box-shadow:0 0 6px ${aqiColor};"></span>
                  ${item.aqiVal} AQI • ${aqiLabel}
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.compare-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-idx'));
          this.removeCompareCity(idx);
        });
      });

    } catch (err) {
      console.error('Compare error:', err);
      container.innerHTML = '<div style="padding:20px; color:#f87171;">Failed to load live comparison weather. Please check connection.</div>';
    }
  }

  async geocodeCity(query) {
    if (!query || !query.trim()) return null;
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) return null;
      
      const city = data.results[0];
      const cityName = `${city.name}${city.country ? ', ' + city.country : ''}`;
      return {
        name: cityName,
        lat: city.latitude,
        lon: city.longitude,
        timezone: city.timezone || 'auto'
      };
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  }

  async fetchTravelWeatherForDate(lat, lon, dateStr, timeStr, timezone) {
    if (!dateStr) return { forecastAvailable: false, reason: 'missing_date' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateStr + 'T00:00:00');
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { forecastAvailable: false, reason: 'past_date', diffDays };
    }

    if (diffDays > 16) {
      return { forecastAvailable: false, reason: 'beyond_horizon', diffDays };
    }

    try {
      const tzParam = timezone ? encodeURIComponent(timezone) : 'auto';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${tzParam}`;

      const res = await fetch(url);
      if (!res.ok) return { forecastAvailable: false, reason: 'api_error' };

      const data = await res.json();
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      let selectedTemp = null;
      let selectedCode = 0;
      let selectedRainProb = '0%';
      let selectedHumidity = '65%';
      let selectedWind = '10 km/h';
      let isHourlyMatch = false;

      if (timeStr && hourly.time && hourly.time.length > 0) {
        const targetHourStr = `${dateStr}T${timeStr.split(':')[0]}:00`;
        const hourIdx = hourly.time.findIndex(t => t.startsWith(targetHourStr));
        if (hourIdx !== -1) {
          selectedTemp = hourly.temperature_2m[hourIdx];
          selectedCode = hourly.weather_code[hourIdx];
          selectedRainProb = `${hourly.precipitation_probability ? hourly.precipitation_probability[hourIdx] : 0}%`;
          selectedHumidity = `${hourly.relative_humidity_2m ? hourly.relative_humidity_2m[hourIdx] : 65}%`;
          selectedWind = `${hourly.wind_speed_10m ? Math.round(hourly.wind_speed_10m[hourIdx]) : 10} km/h`;
          isHourlyMatch = true;
        }
      }

      if (selectedTemp === null && daily.temperature_2m_max && daily.temperature_2m_max.length > 0) {
        selectedTemp = daily.temperature_2m_max[0];
        selectedCode = daily.weather_code[0];
        selectedRainProb = `${daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0}%`;
        selectedHumidity = hourly.relative_humidity_2m ? `${hourly.relative_humidity_2m[12] || 65}%` : '65%';
        selectedWind = hourly.wind_speed_10m ? `${Math.round(hourly.wind_speed_10m[12] || 12)} km/h` : '12 km/h';
      }

      const weatherMeta = WMO_CODES[selectedCode] || WMO_CODES[0];

      return {
        forecastAvailable: true,
        temperature: this.formatTemp(selectedTemp),
        rawTempC: selectedTemp,
        condition: weatherMeta.label,
        icon: weatherMeta.icon,
        rainProbability: selectedRainProb,
        humidity: selectedHumidity,
        windSpeed: selectedWind,
        isHourlyMatch,
        dateStr
      };
    } catch (err) {
      console.error('Fetch travel weather error:', err);
      return { forecastAvailable: false, reason: 'network_error' };
    }
  }

  async handleTravelPlanCheck() {
    const fromInput = document.getElementById('travel-from-input');
    const toInput = document.getElementById('travel-to-input');
    const depDateInput = document.getElementById('travel-dep-date');
    const depTimeInput = document.getElementById('travel-dep-time');
    const retDateInput = document.getElementById('travel-ret-date');
    
    const validationBox = document.getElementById('travel-validation-box');
    const resultBox = document.getElementById('travel-result-container');

    const fromCityQuery = fromInput ? fromInput.value.trim() : '';
    const toCityQuery = toInput ? toInput.value.trim() : '';
    const depDate = depDateInput ? depDateInput.value : '';
    const depTime = depTimeInput ? depTimeInput.value : '';
    const retDate = retDateInput ? retDateInput.value : '';

    if (!depDate) {
      validationBox.style.display = 'block';
      validationBox.textContent = 'Please select your departure date to check travel weather.';
      resultBox.innerHTML = '';
      return;
    }

    if (!fromCityQuery || !toCityQuery) {
      validationBox.style.display = 'block';
      validationBox.textContent = 'Please enter both departure and destination cities.';
      resultBox.innerHTML = '';
      return;
    }

    validationBox.style.display = 'none';
    resultBox.innerHTML = `
      <div style="padding:20px; text-align:center; color:var(--accent-ochre);">
        <span style="font-size:1.8rem;">✈️</span>
        <p style="margin-top:8px; font-size:0.9rem;">Resolving city coordinates & querying live meteorological satellites...</p>
      </div>
    `;

    const [fromLoc, toLoc] = await Promise.all([
      this.geocodeCity(fromCityQuery),
      this.geocodeCity(toCityQuery)
    ]);

    if (!fromLoc || !toLoc) {
      const missing = !fromLoc && !toLoc ? 'both locations' : (!fromLoc ? `"${fromCityQuery}"` : `"${toCityQuery}"`);
      validationBox.style.display = 'block';
      validationBox.textContent = `Location not found (${missing}). Please enter a valid city or destination.`;
      resultBox.innerHTML = '';
      return;
    }

    const [depWeather, destWeather, retWeather] = await Promise.all([
      this.fetchTravelWeatherForDate(fromLoc.lat, fromLoc.lon, depDate, depTime, fromLoc.timezone),
      this.fetchTravelWeatherForDate(toLoc.lat, toLoc.lon, depDate, null, toLoc.timezone),
      retDate ? this.fetchTravelWeatherForDate(fromLoc.lat, fromLoc.lon, retDate, null, fromLoc.timezone) : Promise.resolve(null)
    ]);

    const formatDisplayDate = (dStr) => {
      try {
        const parts = dStr.split('-');
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(dateObj);
      } catch (e) {
        return dStr;
      }
    };

    const formattedDepDate = formatDisplayDate(depDate);
    const formattedRetDate = retDate ? formatDisplayDate(retDate) : null;

    const forecastAvailable = depWeather.forecastAvailable && destWeather.forecastAvailable;

    let cardsHTML = '';

    if (!forecastAvailable) {
      cardsHTML = `
        <div class="travel-notice-warning">
          ⚠️ <strong>Forecast Availability Warning</strong><br>
          Detailed weather forecasts aren't available for this travel date yet. Check again closer to your departure.
        </div>
      `;
    } else {
      cardsHTML = `
        <div class="travel-card-row">
          <div class="travel-card-col">
            <div class="travel-card-title">🛫 DEPARTURE LOCATION</div>
            <div class="travel-city-name">${fromLoc.name}</div>
            <div class="travel-date-str">📅 ${formattedDepDate} ${depTime ? '• ⏰ ' + depTime : ''}</div>
            <div class="travel-temp-cond"><span>${depWeather.icon}</span> <span>${depWeather.temperature}</span></div>
            <div class="travel-metric-line"><span>Condition</span> <strong>${depWeather.condition}</strong></div>
            <div class="travel-metric-line"><span>Rain Probability</span> <strong>${depWeather.rainProbability}</strong></div>
            <div class="travel-metric-line"><span>Humidity</span> <strong>${depWeather.humidity}</strong></div>
            <div class="travel-metric-line"><span>Wind Speed</span> <strong>${depWeather.windSpeed}</strong></div>
          </div>

          <div class="travel-card-col">
            <div class="travel-card-title">🛬 DESTINATION LOCATION</div>
            <div class="travel-city-name">${toLoc.name}</div>
            <div class="travel-date-str">📅 ${formattedDepDate}</div>
            <div class="travel-temp-cond"><span>${destWeather.icon}</span> <span>${destWeather.temperature}</span></div>
            <div class="travel-metric-line"><span>Condition</span> <strong>${destWeather.condition}</strong></div>
            <div class="travel-metric-line"><span>Rain Probability</span> <strong>${destWeather.rainProbability}</strong></div>
            <div class="travel-metric-line"><span>Humidity</span> <strong>${destWeather.humidity}</strong></div>
            <div class="travel-metric-line"><span>Wind Speed</span> <strong>${destWeather.windSpeed}</strong></div>
          </div>
        </div>
      `;

      if (retWeather && retWeather.forecastAvailable) {
        cardsHTML += `
          <div class="travel-card-col" style="margin-bottom:16px;">
            <div class="travel-card-title">🔄 RETURN TRIP LOCATION</div>
            <div class="travel-city-name">${fromLoc.name}</div>
            <div class="travel-date-str">📅 ${formattedRetDate}</div>
            <div class="travel-temp-cond"><span>${retWeather.icon}</span> <span>${retWeather.temperature}</span></div>
            <div class="travel-metric-line"><span>Condition</span> <strong>${retWeather.condition}</strong></div>
            <div class="travel-metric-line"><span>Rain Probability</span> <strong>${retWeather.rainProbability}</strong></div>
            <div class="travel-metric-line"><span>Wind Speed</span> <strong>${retWeather.windSpeed}</strong></div>
          </div>
        `;
      }
    }

    resultBox.innerHTML = `
      ${cardsHTML}
      <div id="travel-ai-box" class="travel-ai-result-box">
        <div style="font-size:0.8rem; font-weight:800; letter-spacing:1px; color:#fbbf24; display:flex; align-items:center; gap:6px;">
          <span>✦</span>
          <span>ATMOS AI TRAVEL CONCIERGE</span>
        </div>
        <div id="travel-ai-text" style="font-size:0.92rem; color:rgba(255, 255, 255, 0.85); line-height:1.65; font-style:italic;">
          Generating luxury travel weather itinerary from Groq AI...
        </div>
      </div>
    `;

    try {
      const payload = {
        departure: {
          city: fromLoc.name,
          date: formattedDepDate,
          time: depTime || 'All Day',
          temperature: depWeather.temperature || '--',
          condition: depWeather.condition || 'N/A',
          rainProbability: depWeather.rainProbability || '0%',
          humidity: depWeather.humidity || '65%',
          windSpeed: depWeather.windSpeed || '10 km/h'
        },
        destination: {
          city: toLoc.name,
          date: formattedDepDate,
          temperature: destWeather.temperature || '--',
          condition: destWeather.condition || 'N/A',
          rainProbability: destWeather.rainProbability || '0%',
          humidity: destWeather.humidity || '65%',
          windSpeed: destWeather.windSpeed || '10 km/h'
        },
        returnTrip: retWeather && retWeather.forecastAvailable ? {
          city: fromLoc.name,
          date: formattedRetDate,
          temperature: retWeather.temperature,
          condition: retWeather.condition,
          rainProbability: retWeather.rainProbability,
          humidity: retWeather.humidity,
          windSpeed: retWeather.windSpeed
        } : null,
        unit: this.unit === 'F' ? 'Fahrenheit (°F)' : 'Celsius (°C)',
        forecastAvailable
      };

      const aiRes = await fetch(`${this.aiBackendUrl}/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const aiData = await aiRes.json();
      const aiTextBox = document.getElementById('travel-ai-text');
      
      if (aiData && aiData.success && aiData.reply) {
        let formattedReply = aiData.reply
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n\n/g, '<br><br>')
          .replace(/\n/g, '<br>');
        
        aiTextBox.style.fontStyle = 'normal';
        aiTextBox.innerHTML = formattedReply;
      } else if (aiData && aiData.fallback) {
        let formattedReply = aiData.fallback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        aiTextBox.style.fontStyle = 'normal';
        aiTextBox.innerHTML = formattedReply;
      } else {
        aiTextBox.textContent = 'Travel guidance currently unavailable.';
      }

    } catch (err) {
      console.error('Travel AI fetch error:', err);
      const aiTextBox = document.getElementById('travel-ai-text');
      if (aiTextBox) {
        aiTextBox.style.fontStyle = 'normal';
        aiTextBox.innerHTML = `
          • 👕 <strong>Clothing</strong>: Pack layers suitable for temperature changes between ${fromLoc.name} (${depWeather.temperature || '--'}) and ${toLoc.name} (${destWeather.temperature || '--'}).<br>
          • ☂️ <strong>Rain Gear</strong>: Destination rain probability is ${destWeather.rainProbability || '0%'}.<br>
          <span style="font-size:0.75rem; color:var(--text-muted); margin-top:6px; display:block;">(Meteorological data retrieved live from Open-Meteo)</span>
        `;
      }
    }
  }

  getWindDirection(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  updateStatusBadge(cur, category) {
    const badge = document.getElementById('status-badge');
    const desc = document.getElementById('status-desc');

    if (category === 'stormy' || cur.wind_speed_10m > 35) {
      badge.textContent = 'Severe';
      badge.className = 'status-badge severe';
      desc.textContent = 'Severe weather alert in area. High wind gusts and potential lightning flashes.';
    } else if (category === 'rainy' || category === 'snowy' || cur.wind_speed_10m > 20) {
      badge.textContent = 'Moderate';
      badge.className = 'status-badge moderate';
      desc.textContent = 'Precipitation active. Drive with extra care and carry atmospheric gear.';
    } else {
      badge.textContent = 'Optimal';
      badge.className = 'status-badge optimal';
      desc.textContent = 'Atmospheric pressure is steady. Favorable weather conditions expected throughout today.';
    }
  }

  renderRecentStack() {
    const stackContainer = document.getElementById('city-stack');
    stackContainer.innerHTML = this.recents.map(city => `
      <div class="city-item" data-lat="${city.lat}" data-lon="${city.lon}" data-name="${city.name}">
        <div class="city-item-left">
          <span class="city-icon">${city.icon}</span>
          <div>
            <div class="city-name">${city.tag} ${city.name}</div>
            <div class="city-sub">${city.country}</div>
          </div>
        </div>
        <div class="city-temp">${this.formatTemp(city.tempC)}</div>
      </div>
    `).join('');

    stackContainer.querySelectorAll('.city-item').forEach(item => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.getAttribute('data-lat'));
        const lon = parseFloat(item.getAttribute('data-lon'));
        const name = item.getAttribute('data-name');
        this.fetchWeatherData(lat, lon, name);
      });
    });
  }

  renderForecastChart(daily) {
    const svg = document.getElementById('forecast-wave-svg');
    const daysRow = document.getElementById('forecast-days-row');

    const tempsMax = daily.temperature_2m_max;
    const tempsMin = daily.temperature_2m_min;
    const times = daily.time;
    const codes = daily.weather_code;

    const width = 800;
    const height = 160;
    const padding = 30;

    const minTemp = Math.min(...tempsMin) - 2;
    const maxTemp = Math.max(...tempsMax) + 2;

    const stepX = (width - padding * 2) / (tempsMax.length - 1);

    const points = tempsMax.map((temp, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((temp - minTemp) / (maxTemp - minTemp)) * (height - padding * 2);
      return { x, y, temp, dayName: new Date(times[i] + 'T00:00').toLocaleDateString('en-US', { weekday: 'short' }), code: codes[i] };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const nodesSVG = points.map((p, i) => `
      <g class="chart-node" data-index="${i}">
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="#e9c46a" stroke="#ffffff" stroke-width="2.5" />
        <circle cx="${p.x}" cy="${p.y}" r="12" fill="rgba(233, 196, 106, 0.25)" />
        <text x="${p.x}" y="${p.y - 14}" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">${this.formatTemp(p.temp)}</text>
      </g>
    `).join('');

    svg.innerHTML = `
      <defs>
        <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(233, 196, 106, 0.35)" />
          <stop offset="100%" stop-color="rgba(233, 196, 106, 0)" />
        </linearGradient>
      </defs>
      <path d="${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z" fill="url(#wave-grad)" />
      <path d="${pathD}" fill="none" stroke="#e9c46a" stroke-width="3.5" stroke-linecap="round" />
      ${nodesSVG}
    `;

    daysRow.innerHTML = points.map((p, i) => {
      const meta = WMO_CODES[p.code] || WMO_CODES[0];
      return `
        <div class="forecast-day-col ${i===0?'active':''}" data-index="${i}">
          <div class="day-name">${p.dayName}</div>
          <div class="day-icon">${meta.icon}</div>
          <div class="day-temp-hi">${this.formatTemp(tempsMax[i])}</div>
          <div class="day-temp-lo">${this.formatTemp(tempsMin[i])}</div>
        </div>
      `;
    }).join('');

    const tooltip = document.getElementById('chart-tooltip');

    const showTooltip = (i) => {
      if (!tooltip) return;
      const p = points[i];
      const meta = WMO_CODES[p.code] || WMO_CODES[0];
      
      tooltip.innerHTML = `
        <div class="chart-tooltip-header">${p.dayName} • ${meta.label}</div>
        <div class="chart-tooltip-body">
          <span style="font-size:1.2rem;">${meta.icon}</span>
          <span>High: <strong>${this.formatTemp(tempsMax[i])}</strong></span>
          <span style="color:var(--text-muted); margin-left:4px;">Low: ${this.formatTemp(tempsMin[i])}</span>
        </div>
      `;

      const wrapperRect = svg.parentElement.getBoundingClientRect();
      const nodeX = p.x * (wrapperRect.width / width);
      const nodeY = p.y * (wrapperRect.height / height);

      tooltip.style.left = `${nodeX}px`;
      tooltip.style.top = `${nodeY}px`;
      tooltip.classList.add('visible');
    };

    const hideTooltip = () => {
      if (tooltip) tooltip.classList.remove('visible');
    };

    svg.querySelectorAll('.chart-node').forEach((node, i) => {
      node.style.cursor = 'pointer';
      node.addEventListener('mouseenter', () => showTooltip(i));
      node.addEventListener('mouseleave', hideTooltip);
    });

    daysRow.querySelectorAll('.forecast-day-col').forEach((col, i) => {
      col.addEventListener('mouseenter', () => showTooltip(i));
      col.addEventListener('mouseleave', hideTooltip);
    });
  }
}

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.atmosApp = new AtmosApp();
});
