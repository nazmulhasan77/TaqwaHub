import type { Settings } from '../types';

interface Props {
  settings: Settings;
}

export default function WeatherCard({ settings }: Props) {
  return (
    <aside className="weather-card glass">
      <div className="weather-top">
        <span>{settings.city}, {settings.country.slice(0, 2).toUpperCase()}</span>
        <button>⋮</button>
      </div>
      <div className="weather-main">
        <strong>27<span>°C</span></strong>
        <div className="weather-art">
          <span className="moon" />
          <span className="cloud" />
          <span className="rain">///</span>
        </div>
      </div>
      <p>Patchy rain nearby</p>
      <dl>
        <div><dt>Humidity</dt><dd>88%</dd></div>
        <div><dt>Feels like</dt><dd>30.7°C</dd></div>
        <div><dt>Wind</dt><dd>7 km/h</dd></div>
      </dl>
      <button className="forecast-button">View full forecast ›</button>
    </aside>
  );
}
