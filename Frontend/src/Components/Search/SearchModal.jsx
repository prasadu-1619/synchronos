import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, X, Clock, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const SearchModal = ({ isOpen, onClose, projectId, isDark }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], cards: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadRecentSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults({ pages: [], cards: [] });
    }
  }, [query]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveToRecent = (searchQuery) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Search pages
      const pagesResponse = await axios.get(
        `${API_ENDPOINTS.PAGE_LIST}?projectId=${projectId}`,
        { withCredentials: true }
      );
      const pages = pagesResponse.data.pages || pagesResponse.data;

      // Search boards and cards
      const boardsResponse = await axios.get(
        `${API_ENDPOINTS.BOARD_PROJECT(projectId)}`,
        { withCredentials: true }
      );
      const boards = boardsResponse.data.boards || boardsResponse.data;

      // Client-side filtering
      const searchLower = query.toLowerCase();
      const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchLower) ||
        (page.content && page.content.toLowerCase().includes(searchLower))
      );

      const allCards = boards.flatMap(board =>
        (board.cards || []).map(card => ({ ...card, boardId: board._id, boardTitle: board.title }))
      );

      const filteredCards = allCards.filter(card =>
        card.title.toLowerCase().includes(searchLower) ||
        (card.description && card.description.toLowerCase().includes(searchLower))
      );

      setResults({
        pages: filteredPages.slice(0, 10),
        cards: filteredCards.slice(0, 10),
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type, item) => {
    saveToRecent(query);
    
    if (type === 'page') {
      navigate(`/project/${projectId}/page/${item._id}`);
    } else if (type === 'card') {
      navigate(`/project/${projectId}/board/${item.boardId}`);
    }
    
    onClose();
  };

  const handleKeyDown = (e) => {
    const totalResults = results.pages.length + results.cards.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalResults);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults);
    } else if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault();
      const allResults = [...results.pages, ...results.cards];
      const selected = allResults[selectedIndex];
      if (selected) {
        const type = selectedIndex < results.pages.length ? 'page' : 'card';
        handleSelect(type, selected);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-yellow-300 dark:bg-yellow-700">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };

  if (!isOpen) return null;

  const totalResults = results.pages.length + results.cards.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Search size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and cards..."
            className={`flex-1 bg-transparent outline-none ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          />
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!loading && !query && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <Clock size={16} />
                <span>Recent Searches</span>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className={`w-full text-left px-3 py-2 rounded hover:${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="p-8 text-center text-gray-400">
              No results found for "{query}"
            </div>
          )}

          {!loading && results.pages.length > 0 && (
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-2">Pages</div>
              {results.pages.map((page, index) => (
                <button
                  key={page._id}
                  onClick={() => handleSelect('page', page)}
                  className={`w-full text-left p-3 rounded-lg mb-1 ${
                    selectedIndex === index
                      ? isDark
                        ? 'bg-blue-900'
                        : 'bg-blue-100'
                      : isDark
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText size={20} className="text-blue-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {highlightMatch(page.title, query)}
                      </div>
                      {page.content && (
                        <div className="text-sm text-gray-400 truncate mt-1">
                          {highlightMatch(
                            page.content.substring(0, 100),
                            query
                          )}
                          {page.content.length > 100 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && results.cards.length > 0 && (
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-2">Cards</div>
              {results.cards.map((card, index) => (
                <button
                  key={card._id}
                  onClick={() => handleSelect('card', card)}
                  className={`w-full text-left p-3 rounded-lg mb-1 ${
                    selectedIndex === results.pages.length + index
                      ? isDark
                        ? 'bg-blue-900'
                        : 'bg-blue-100'
                      : isDark
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Hash size={20} className="text-green-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {highlightMatch(card.title, query)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        in {card.boardTitle}
                      </div>
                      {card.description && (
                        <div className="text-sm text-gray-400 truncate mt-1">
                          {highlightMatch(
                            card.description.substring(0, 100),
                            query
                          )}
                          {card.description.length > 100 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between text-xs text-gray-400`}>
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          {totalResults > 0 && (
            <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
