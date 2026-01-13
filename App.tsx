
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender, Source } from './types';
import { getChatResponseStream, getInitialSuggestions } from './services/geminiService';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now(),
      text: "أهلاً بيك في مساعد تونيسكوب الإخباري! كيفاش نجم نعاونك اليوم؟",
      sender: Sender.ASSISTANT,
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const initialSuggestions = await getInitialSuggestions();
        setSuggestions(initialSuggestions);
      } catch (error) {
        console.error("Failed to fetch initial suggestions:", error);
        setSuggestions([
          "شنوة آخر الأخبار في تونس؟",
          "لخصلي أهم أخبار الرياضة اليوم.",
          "فماش أخبار جديدة على الإقتصاد؟"
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: Sender.USER,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestions([]); // Hide suggestions during response generation

    // Prepare for streaming response
    const assistantMessageId = Date.now() + 1;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      text: '',
      sender: Sender.ASSISTANT,
      sources: [],
    };
    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      const stream = await getChatResponseStream(text);
      let fullText = '';
      let finalSources: Source[] = [];

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId ? { ...msg, text: fullText } : msg
            )
          );
        }
        
        const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
             const sources: Source[] = groundingMetadata.groundingChunks
                .filter(c => c.web?.uri)
                .map(c => ({
                    uri: c.web.uri,
                    title: c.web.title || c.web.uri,
                }));
            finalSources = [...sources];
        }
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId ? { ...msg, text: fullText, sources: finalSources } : msg
        )
      );

    } catch (error) {
      console.error("Error getting response from Gemini:", error);
      const errorMessage: Message = {
        id: assistantMessageId,
        text: "عذراً، حدث خطأ أثناء محاولة الإجابة. الرجاء المحاولة مرة أخرى.",
        sender: Sender.ASSISTANT,
      };
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? errorMessage : msg));
    } finally {
      setIsLoading(false);
      // Fetch new suggestions
       const newSuggestions = await getInitialSuggestions();
       setSuggestions(newSuggestions);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50" ref={chatRef}>
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 text-center">مساعد تونيسكوب الإخباري</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </main>
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          suggestions={suggestions}
        />
      </footer>
    </div>
  );
};

export default App;
