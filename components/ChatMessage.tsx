
import React from 'react';
import { Message, Sender } from '../types';

const AssistantIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">ts</span>
    </div>
);

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);


const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isAssistant = message.sender === Sender.ASSISTANT;

  return (
    <div className={`flex items-start gap-3 ${!isAssistant ? 'flex-row-reverse' : 'flex-row'}`}>
      {isAssistant ? <AssistantIcon /> : <UserIcon />}
      <div className="flex flex-col">
        <div
          className={`w-fit max-w-lg rounded-2xl p-4 text-gray-800 ${
            isAssistant
              ? 'bg-white shadow-sm border border-gray-200 rounded-tl-none'
              : 'bg-red-50 text-gray-800 rounded-tr-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <h4 className="text-xs font-bold text-gray-500 mb-1">المصادر:</h4>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-red-200 hover:text-red-800 transition-colors duration-200 truncate"
                  title={source.title}
                >
                  {new URL(source.uri).hostname}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
