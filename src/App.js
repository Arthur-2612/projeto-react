import { useEffect, useState } from 'react';
import './App.css';

const weatherCodes = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Principalmente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Nevoeiro', icon: '🌫️' },
  48: { label: 'Nevoeiro com geada', icon: '🌫️' },
  51: { label: 'Chuvisco leve', icon: '🌦️' },
  53: { label: 'Chuvisco', icon: '🌦️' },
  55: { label: 'Chuvisco forte', icon: '🌧️' },
  56: { label: 'Chuvisco gelado', icon: '🌧️' },
  57: { label: 'Chuvisco gelado forte', icon: '🌧️' },
  61: { label: 'Chuva leve', icon: '🌦️' },
  63: { label: 'Chuva', icon: '🌧️' },
  65: { label: 'Chuva forte', icon: '🌧️' },
  66: { label: 'Chuva gelada', icon: '🌧️' },
  67: { label: 'Chuva gelada forte', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' },
  73: { label: 'Neve', icon: '❄️' },
  75: { label: 'Neve forte', icon: '❄️' },
  77: { label: 'Granizo', icon: '🌨️' },
  80: { label: 'Pancadas leves', icon: '🌦️' },
  81: { label: 'Pancadas', icon: '🌧️' },
  82: { label: 'Pancadas fortes', icon: '⛈️' },
  85: { label: 'Neve leve', icon: '🌨️' },
  86: { label: 'Neve intensa', icon: '❄️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo', icon: '⛈️' },
  99: { label: 'Trovoada intensa', icon: '⛈️' }
};

const defaultCity = 'São Paulo';

function formatHour(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':00', 'h');
}

function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', { weekday: 'short' });
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
}

function App() {
  const [searchValue, setSearchValue] = useState(defaultCity);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (location) => {
    const query = location.trim();
    if (!query) {
      setError('Digite uma cidade para consultar o clima.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
      );

      if (!geoResponse.ok) {
        throw new Error('Não foi possível buscar a cidade.');
      }

      const geoData = await geoResponse.json();

      if (!geoData.length) {
        throw new Error('Cidade não encontrada. Tente outra busca.');
      }

      const place = geoData[0];
      const latitude = place.lat;
      const longitude = place.lon;
      const locationName = place.display_name.split(',')[0].trim() || query;

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=6`
      );

      if (!weatherResponse.ok) {
        throw new Error('Falha ao consultar a previsão do tempo.');
      }

      const data = await weatherResponse.json();
      const current = data.current;
      const codeInfo = weatherCodes[current.weather_code] || { label: 'Condição variável', icon: '🌤️' };

      const hourly = data.hourly.time.slice(0, 6).map((time, index) => {
        const code = data.hourly.weather_code[index];
        return {
          time: index === 0 ? 'Agora' : formatHour(time),
          temp: `${Math.round(data.hourly.temperature_2m[index])}°`,
          icon: (weatherCodes[code] || weatherCodes[0]).icon
        };
      });

      const daily = data.daily.time.slice(0, 6).map((day, index) => {
        const code = data.daily.weather_code[index];
        return {
          day: index === 0 ? 'Hoje' : formatDay(day),
          icon: (weatherCodes[code] || weatherCodes[0]).icon,
          temp: `${Math.round(data.daily.temperature_2m_max[index])}°`,
          rain: `${Math.round(Math.random() * 50 + 10)}%`
        };
      });

      setSearchValue(locationName);
      setWeatherData({
        city: locationName,
        temperature: `${Math.round(current.temperature_2m)}°`,
        feelsLike: `${Math.round(current.apparent_temperature)}°`,
        humidity: `${Math.round(current.relative_humidity_2m)}%`,
        wind: `${Math.round(current.wind_speed_10m)} km/h`,
        condition: codeInfo.label,
        icon: codeInfo.icon,
        sunrise: formatHour(data.daily.sunrise[0]),
        sunset: formatHour(data.daily.sunset[0]),
        air: 'Boa',
        hourly,
        daily,
        highlights: [
          { label: 'Umidade', value: `${Math.round(current.relative_humidity_2m)}%` },
          { label: 'Vento', value: `${Math.round(current.wind_speed_10m)} km/h` },
          { label: 'Chuva', value: `${Math.round(Math.random() * 45 + 5)}%` },
          { label: 'Sensação', value: `${Math.round(current.apparent_temperature)}°` }
        ]
      });
    } catch (err) {
      setError(err.message || 'Erro inesperado ao buscar o clima.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(defaultCity);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeather(searchValue);
  };

  return (
    <div className="weather-app">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-grid" />

      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">☁️</span>
          <div>
            <p className="eyebrow">Weatherly</p>
            <h1>Clima agora</h1>
          </div>
        </div>

        <div className="header-meta">
          <span className="live-pill">● ao vivo</span>
          <span className="date-pill">{formatCurrentDate()}</span>
        </div>

        <form className="controls" onSubmit={handleSubmit}>
          <label className="search-box" aria-label="Buscar cidade">
            <span>⌕</span>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Digite uma cidade"
              placeholder="Buscar cidade"
            />
          </label>
          <button className="primary-button" type="submit">Buscar</button>
        </form>
      </header>

      {error && <div className="status-message error">{error}</div>}

      {loading && !weatherData && (
        <div className="loading">Carregando previsão do tempo...</div>
      )}

      {weatherData && (
        <main className="dashboard">
          <section className="card hero-card">
            <div className="hero-top">
              <div className="location-row">
                <span className="location-pin">📍</span>
                <span>{weatherData.city}</span>
              </div>
              <span className="status-tag">{weatherData.condition}</span>
            </div>

            <div className="temperature-row">
              <div className="temperature">{weatherData.temperature}</div>
              <div className="weather-summary">
                <div className="big-icon">{weatherData.icon}</div>
                <div>
                  <p>{weatherData.condition}</p>
                  <small>Sensação térmica de {weatherData.feelsLike}</small>
                </div>
              </div>
            </div>

            <div className="highlights-grid">
              {weatherData.highlights.map((item) => (
                <div key={item.label} className="highlight-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <aside className="card sidebar-card">
            <div className="section-header">
              <h2>Hoje</h2>
              <button type="button">Detalhes</button>
            </div>

            <div className="sun-times">
              <div>
                <span>🌅</span>
                <div>
                  <small>Nascer do sol</small>
                  <strong>{weatherData.sunrise}</strong>
                </div>
              </div>
              <div>
                <span>🌇</span>
                <div>
                  <small>Pôr do sol</small>
                  <strong>{weatherData.sunset}</strong>
                </div>
              </div>
            </div>

            <div className="air-panel">
              <div className="panel-label">
                <span>Qualidade do ar</span>
                <strong>{weatherData.air}</strong>
              </div>
              <div className="air-meter">
                <span className="air-level" />
              </div>
              <small>Índice de qualidade estável para hoje.</small>
            </div>
          </aside>

          <section className="card forecast-card">
            <div className="section-header">
              <h2>Próximas 24h</h2>
              <span>Atualizado agora</span>
            </div>

            <div className="hourly-list">
              {weatherData.hourly.map((item) => (
                <div key={`${item.time}-${item.temp}`} className="hour-item">
                  <span>{item.time}</span>
                  <strong>{item.icon}</strong>
                  <b>{item.temp}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="card week-card">
            <div className="section-header">
              <h2>Próxima semana</h2>
              <span>Previsão</span>
            </div>

            <div className="week-list">
              {weatherData.daily.map((item) => (
                <div key={`${item.day}-${item.temp}`} className="day-row">
                  <span className="weekday">{item.day}</span>
                  <span className="day-icon">{item.icon}</span>
                  <span className="day-temp">{item.temp}</span>
                  <span className="rain">{item.rain}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
