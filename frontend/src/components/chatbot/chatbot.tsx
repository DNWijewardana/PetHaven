import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm PetHaven Assistant. How can I help you with pet adoption, lost pets, or pet care today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.CHATBOT, {
        message: input,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className="rounded-full w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 shadow-lg"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-3 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 rounded-full">
                <img src="/images/pethaven-avatar.svg" alt="PetHaven Assistant" />
              </Avatar>
              <span className="font-medium">PetHaven Assistant</span>
            </div>
            <Button
              onClick={toggleChat}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-indigo-700 h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 p-3">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.sender === "user"
                      ? "bg-indigo-100 ml-auto rounded-tr-none"
                      : "bg-gray-100 rounded-tl-none"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-[10px] text-gray-500 mt-1 inline-block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 max-w-[80%] p-3 rounded-lg rounded-tl-none">
                  <div className="flex gap-1 items-center">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send size={16} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 