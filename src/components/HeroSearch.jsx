import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { searchServices, serviceCategories } from '@/lib/services';

const trendingSearches = [
    'Kisan Yojana',
    'Health Insurance',
    'Education Scholarship',
    'Women Empowerment',
    'Housing Scheme',
    'Startup Grant',
];

const HeroSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Animated placeholder
    const placeholders = [
        'Search 400+ government schemes...',
        'Try "Kisan Yojana"...',
        'Find health insurance schemes...',
        'Search education scholarships...',
        'Discover startup grants...',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        const timer = setTimeout(() => {
            const matched = searchServices(query).slice(0, 6);
            setResults(matched);
            setActiveIndex(-1);
        }, 200);
        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = useCallback((e) => {
        e?.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
            navigate(`/service/${results[activeIndex].id}`);
        } else if (query.trim()) {
            navigate(`/services?q=${encodeURIComponent(query.trim())}`);
        }
        setIsFocused(false);
    }, [query, activeIndex, results, navigate]);

    const handleKeyDown = (e) => {
        const totalItems = results.length;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        } else if (e.key === 'Enter') {
            handleSubmit(e);
        } else if (e.key === 'Escape') {
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    const showDropdown = isFocused && (results.length > 0 || query.trim().length < 2);

    return (
        <div className="hero-search-wrapper">
            <form onSubmit={handleSubmit} className="hero-search-form">
                <div className={`hero-search-container ${isFocused ? 'focused' : ''}`}>
                    <Search className="hero-search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholders[placeholderIdx]}
                        className="hero-search-input"
                        autoComplete="off"
                        aria-label="Search government schemes"
                    />
                    <button
                        type="submit"
                        className="hero-search-btn"
                        aria-label="Search schemes"
                    >
                        <span className="hero-search-btn-text">Search</span>
                        <ArrowRight className="hero-search-btn-icon" />
                    </button>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div ref={dropdownRef} className="hero-search-dropdown">
                        {results.length > 0 ? (
                            <>
                                <div className="hero-dropdown-header">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>{results.length} scheme{results.length > 1 ? 's' : ''} found</span>
                                </div>
                                {results.map((result, idx) => (
                                    <button
                                        key={result.id}
                                        type="button"
                                        className={`hero-dropdown-item ${idx === activeIndex ? 'active' : ''}`}
                                        onClick={() => {
                                            navigate(`/service/${result.id}`);
                                            setIsFocused(false);
                                        }}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                    >
                                        <div className="hero-dropdown-item-left">
                                            <span className="hero-dropdown-item-name">{result.name}</span>
                                            <span className="hero-dropdown-item-meta">
                                                {result.governmentLevel && (
                                                    <span className={`hero-dropdown-badge ${result.governmentLevel === 'Central' ? 'central' : 'state'}`}>
                                                        {result.governmentLevel}
                                                    </span>
                                                )}
                                                {result.category.replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                        <ArrowRight className="hero-dropdown-arrow" />
                                    </button>
                                ))}
                                {results.length >= 6 && (
                                    <button
                                        type="button"
                                        className="hero-dropdown-viewall"
                                        onClick={() => {
                                            navigate(`/services?q=${encodeURIComponent(query.trim())}`);
                                            setIsFocused(false);
                                        }}
                                    >
                                        View all results →
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="hero-dropdown-trending">
                                <div className="hero-dropdown-header">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>Trending Searches</span>
                                </div>
                                {trendingSearches.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        className="hero-dropdown-item"
                                        onClick={() => {
                                            setQuery(term);
                                            inputRef.current?.focus();
                                        }}
                                    >
                                        <div className="hero-dropdown-item-left">
                                            <span className="hero-dropdown-item-name">{term}</span>
                                        </div>
                                        <Search className="hero-dropdown-arrow" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </form>

            {/* Quick category pills */}
            <div className="hero-search-pills">
                {serviceCategories.slice(5, 12).map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        className="hero-pill"
                        onClick={() => navigate(`/category/${cat.id}`)}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.nameKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HeroSearch;
