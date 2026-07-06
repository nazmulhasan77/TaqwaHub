import { useState } from 'react';

const engines = {
  Default: 'https://www.google.com/search?q=',
  Google: 'https://www.google.com/search?q=',
  DuckDuckGo: 'https://duckduckgo.com/?q=',
  Bing: 'https://www.bing.com/search?q=',
  Brave: 'https://search.brave.com/search?q='
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<keyof typeof engines>('Default');

  const search = () => {
    const value = query.trim();
    if (!value) return;
    const looksLikeUrl = value.includes('.') && !value.includes(' ');
    const target = looksLikeUrl ? `https://${value.replace(/^https?:\/\//, '')}` : `${engines[engine]}${encodeURIComponent(value)}`;
    window.location.href = target;
  };

  return (
    <section className="search-stack">
      <div className="search-bar glass">
        <span className="search-icon">⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && search()}
          placeholder="Search the web or type a URL"
        />
        <button onClick={search}>Search</button>
      </div>
      <div className="engine-row">
        {(Object.keys(engines) as Array<keyof typeof engines>).map((name) => (
          <button key={name} className={engine === name ? 'engine active' : 'engine'} onClick={() => setEngine(name)}>
            <span>{name}</span>
            <i />
          </button>
        ))}
      </div>
    </section>
  );
}
