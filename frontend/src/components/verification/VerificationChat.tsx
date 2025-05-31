import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Verification, VerificationMessage } from '@/types/VerificationTypes';
import { SendHorizontal } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface VerificationChatProps {
  verification: Verification;
  onUpdate: () => void;
}

export default function VerificationChat({ verification, onUpdate }: VerificationChatProps) {
  const { user } = useAuth0();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if the chat is active
  const isChatActive = verification.status === 'PENDING';
  const isExpired = new Date() > new Date(verification.expiresAt);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [verification.chatHistory]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      await axios.post(
        `${API_ENDPOINTS.VERIFICATIONS}/${verification._id}/chat`, 
        { message, user }
      );
      
      setMessage('');
      onUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };
  
  // Determine if a message is from the current user
  const isCurrentUserMessage = (message: VerificationMessage) => {
    return message.sender.email === user?.email;
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Communication Channel</span>
          {isExpired && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
              Expired
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isChatActive && !isExpired 
            ? 'Use this temporary chat to communicate directly about verification.'
            : 'This chat is no longer active.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto border rounded-md p-3 bg-gray-50">
          {verification.chatHistory.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              No messages yet
            </div>
          ) : (
            <div className="space-y-3">
              {verification.chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${isCurrentUserMessage(msg) ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      isCurrentUserMessage(msg) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm">{msg.message}</div>
                    <div className={`text-xs mt-1 ${isCurrentUserMessage(msg) ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)} - {msg.sender.name}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>
      {isChatActive && !isExpired && (
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Type your message..." 
              disabled={isLoading}
              className="flex-grow"
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || isLoading}
              className="flex items-center gap-1"
            >
              <SendHorizontal className="h-4 w-4" />
              Send
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  );
} 