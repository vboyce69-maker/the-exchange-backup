
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { antiScamChatProtection, AntiScamChatProtectionOutput } from "@/ai/flows/anti-scam-chat-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ShieldAlert, 
  Send, 
  MapPin, 
  AlertCircle,
  Lock,
  MoreVertical,
  Flag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isScamFlagged?: boolean;
  scamReason?: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  { id: "2", senderId: "buyer", text: "Yes, I am. Is it in good condition?", timestamp: "10:32 AM" },
  { id: "3", senderId: "seller", text: "It's perfect. Only used a few times.", timestamp: "10:33 AM" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamAlert, setScamAlert] = useState<AntiScamChatProtectionOutput | null>(null);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    setIsSending(true);
    setScamAlert(null);

    // AI Check for scam
    const scanResult = await antiScamChatProtection({ message: inputValue });

    if (scanResult.isSuspicious) {
      setScamAlert(scanResult);
      setIsSending(false);
      return; // Block message from being sent visually if highly suspicious
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "buyer",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
        {/* Chat List Sidebar (Mobile hidden for simplicity) */}
        <aside className="hidden lg:block w-80 bg-white border rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-4 border-b bg-primary/5">
            <h2 className="font-bold text-lg">Your Exchanges</h2>
          </div>
          <div className="overflow-y-auto h-full">
            <div className="p-4 bg-secondary border-l-4 border-primary flex gap-3 cursor-pointer">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm truncate">Alex Rivera</span>
                  <span className="text-[10px] text-muted-foreground">10:33 AM</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">Only used a few times...</p>
              </div>
            </div>
            {/* Mock more chats */}
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border-b hover:bg-background flex gap-3 cursor-pointer transition-colors">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/user${i+3}/200/200`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">User {i+5}</span>
                    <span className="text-[10px] text-muted-foreground">Yesterday</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Is the item available?</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Active Chat Area */}
        <div className="flex-1 flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">Alex Rivera</h3>
                  <VerifiedBadge />
                </div>
                <p className="text-xs text-green-500 font-medium">Online • Active Seller</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex border-primary text-primary">
                <MapPin className="w-4 h-4 mr-2" />
                Suggest Meeting
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Messages Window */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
            <div className="flex justify-center mb-8">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm text-[10px] py-1 border-primary/20 flex items-center gap-1">
                <Lock className="w-2 h-2" />
                End-to-end encrypted • AI Anti-Scam Protection Enabled
              </Badge>
            </div>

            {messages.map((m) => (
              <div key={m.id} className={cn(
                "flex flex-col max-w-[80%] space-y-1",
                m.senderId === "buyer" ? "ml-auto items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                  m.senderId === "buyer" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white text-foreground rounded-tl-none border"
                )}>
                  {m.text}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{m.timestamp}</span>
              </div>
            ))}

            {scamAlert && (
              <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-2">
                <Alert variant="destructive" className="max-w-md bg-destructive/5 border-destructive/20">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle className="text-sm font-bold">Scam Alert Triggered</AlertTitle>
                  <AlertDescription className="text-xs">
                    Our AI detected a high risk of fraudulent behavior. {scamAlert.reason}.
                    <div className="mt-2 flex gap-2">
                      <Button variant="destructive" size="sm" className="h-7 text-[10px] font-bold">
                        <Flag className="w-3 h-3 mr-1" /> Report User
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] border-destructive text-destructive" onClick={() => setScamAlert(null)}>
                        I trust this user
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Meeting Point Suggestions (Static Mock) */}
          <div className="px-4 py-3 bg-accent/5 border-t border-accent/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-accent-foreground">Safe Meeting Point: </span>
              <span className="text-xs text-muted-foreground">Central Park Mall - Info Desk (Public Zone)</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-accent hover:bg-accent/10">View Map</Button>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..." 
                className="rounded-full bg-background border-muted"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="rounded-full bg-primary shrink-0" onClick={handleSend} disabled={isSending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Don't share bank details</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Stay within LocalBid Chat</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
