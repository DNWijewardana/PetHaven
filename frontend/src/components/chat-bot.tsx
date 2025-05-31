import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Minimize2, Maximize2, PawPrint } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS } from "@/lib/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm PetHaven, your pet care assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // You can replace this with your actual AI API call
      const response = await axios.post(`${API_ENDPOINTS.CHATBOT}/message`, {
        message: input,
      });

      // Handle API call to your backend chatbot service
      // For now, we'll simulate a response
      setTimeout(() => {
        const botResponse = getSimulatedResponse(input);
        const assistantMessage: Message = {
          role: "assistant",
          content: botResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Simulated responses until you integrate with a real AI API
  const getSimulatedResponse = (userInput: string): string => {
    const normalizedInput = userInput.toLowerCase();
    
    if (normalizedInput.includes("lost pet") || normalizedInput.includes("missing pet")) {
      return "I'm sorry to hear about your lost pet. The best thing to do is to report it immediately through our 'Report Lost Pet' feature. Would you like me to direct you there?";
    }
    
    if (normalizedInput.includes("adopt") || normalizedInput.includes("adoption")) {
      return "Adopting a pet is a wonderful decision! You can browse pets available for adoption in our 'Assist or Adopt Pets' section. Would you like to see available pets?";
    }
    
    if (normalizedInput.includes("vet") || normalizedInput.includes("veterinarian")) {
      return "You can find nearby veterinary clinics using our 'Find Vets' feature. It will show you clinics close to your location. Would you like to search for vets now?";
    }
    
    if (normalizedInput.includes("first aid") || normalizedInput.includes("emergency")) {
      return "For pet emergencies, please check our Pet First Aid guide. It contains crucial information for various emergency situations. Would you like me to direct you there?";
    }
    
    if (normalizedInput.includes("hello") || normalizedInput.includes("hi")) {
      return "Hello there! How can I assist you with your pet-related questions today?";
    }
    
    if (normalizedInput.includes("thank")) {
      return "You're very welcome! Is there anything else I can help you with?";
    }
    
    return "I'm here to help with pet-related questions. You can ask about lost pets, adoption, veterinary care, pet health, or using any feature of our website!";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen ? (
        <div
          className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out mb-2 w-80 sm:w-96 ${
            isMinimized ? "h-14" : "h-[500px]"
          }`}
        >
          {/* Chat header */}
          <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <PawPrint className="h-5 w-5 mr-2" />
              <h3 className="font-medium">PetHaven Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMinimize}
                className="text-white hover:text-indigo-200 transition-colors"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={handleClose}
                className="text-white hover:text-indigo-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages container - only shown when not minimized */}
          {!isMinimized && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-3 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-3 flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className={message.role === "user" ? "ml-2" : "mr-2"}>
                        {message.role === "assistant" ? (
                          <AvatarImage src="/images/pethaven-avatar.png" alt="PetHaven" />
                        ) : null}
                        <AvatarFallback>
                          {message.role === "assistant" ? "PH" : "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`py-2 px-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="flex items-start">
                      <Avatar className="mr-2">
                        <AvatarImage src="/images/pethaven-avatar.png" alt="PetHaven" />
                        <AvatarFallback>PH</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 py-2 px-3 rounded-lg">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t p-3">
                <div className="flex items-end">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="resize-none flex-1 mr-2 max-h-32"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="h-10 w-10 p-0"
                    disabled={isLoading || input.trim() === ""}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Chat button */}
      <button
        onClick={handleOpen}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
} 