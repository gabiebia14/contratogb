
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessagesSquare, Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Olá! Como posso ajudar você hoje?",
    sender: 'support',
    timestamp: new Date()
  }
];

export default function ProprietarioChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simula resposta do suporte após 1 segundo
    setTimeout(() => {
      const supportMessage: Message = {
        id: messages.length + 2,
        text: "Obrigado por sua mensagem. Um de nossos atendentes responderá em breve.",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessagesSquare className="h-6 w-6 text-[#0EA5E9]" />
        <h1 className="text-3xl font-bold">Suporte</h1>
      </div>

      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-[#0EA5E9] text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
