
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, suggestions }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        {suggestions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
                {suggestions.map((s, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-700 transition-all duration-200 border border-gray-200"
                    >
                        {s}
                    </button>
                ))}
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="أكتب سؤالك هنا..."
            disabled={isLoading}
            className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow duration-200 disabled:bg-gray-200"
            />
            <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-12 h-12 flex items-center justify-center bg-red-600 text-white rounded-full transition-colors duration-200 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
            aria-label="Send message"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                )}
            </button>
        </form>
    </div>
  );
};

export default MessageInput;
