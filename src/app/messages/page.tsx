
"use client";

import { useState, useEffect } from "react";
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
  Flag,
  ShieldCheck,
  Coffee,
  Building,
  Fuel,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'blocked';
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  { id: "2", senderId: "buyer", text: "Yes, I am. Is it in good condition?", timestamp: "10:32 AM" },
  { id: "3", senderId: "seller", text: "It's perfect. Only used a few times.", timestamp: "10:33 AM" },
];

const SAFE_ZONES = [
  { name: "Central Police Station", type: "Police", icon: ShieldCheck, address: "123 Law Ave" },
  { name: "City Mall Plaza", type: "Shopping", icon: Building, address: "456 Retail Way" },
  { name: "Starbucks Waterfront", type: "Coffee", icon: Coffee, address: "789 Brew St" },
  { name: "Shell Super Station", type: "Petrol", icon: Fuel, address: "321 Gas Blvd" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamAlert, setScamAlert] = useState<AntiScamChatProtectionOutput | null>(null);
  const [showMeetingSuggestions, setShowMeetingSuggestions] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    setIsSending(true);
    setScamAlert(null);

    // AI Check for scam phrases
    const scanResult = await antiScamChatProtection({ message: inputValue });

    if (scanResult.isSuspicious && scanResult.riskLevel === 'high') {
      setScamAlert(scanResult);
      setIsSending(false);
      // We block high-risk messages entirely
      return; 
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "buyer",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
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

        <div className="flex-1 flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-4 border-b flex items-center justify-between bg-white z-10">
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase">Reliability: 98%</span>
                  <span className="text-[10px] text-muted-foreground">• Active Seller</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex border-primary text-primary"
                onClick={() => setShowMeetingSuggestions(!showMeetingSuggestions)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {showMeetingSuggestions ? "Hide Safe Zones" : "Safe Meeting Points"}
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm text-[10px] py-1 border-primary/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-primary" />
                AI Anti-Scam Protection Active
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
              <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-top-2">
                <Alert variant="destructive" className="max-w-md bg-destructive/5 border-destructive/20 shadow-lg">
                  <ShieldAlert className="h-5 w-5" />
                  <AlertTitle className="text-sm font-bold">Message Blocked: Security Threat</AlertTitle>
                  <AlertDescription className="text-xs space-y-2">
                    <p>Our AI detected a high risk of fraudulent activity in your message. Specifically: <strong>{scamAlert.reason}</strong>.</p>
                    <p className="font-semibold text-destructive italic">"Never pay deposits or send OTPs to anyone you meet online."</p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="destructive" size="sm" className="h-8 text-[10px] font-bold">
                        <Flag className="w-3 h-3 mr-1" /> Report User
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] border-destructive text-destructive" onClick={() => setScamAlert(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {showMeetingSuggestions && (
              <div className="absolute top-4 right-6 w-72 z-20 animate-in slide-in-from-right-4 fade-in">
                <Card className="shadow-xl border-primary/20 bg-white/95 backdrop-blur">
                  <CardHeader className="p-4 border-b bg-primary/5">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Recommended Safe Zones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {SAFE_ZONES.map((zone) => {
                      const Icon = zone.icon;
                      return (
                        <div key={zone.name} className="p-3 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-primary/10">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{zone.name}</p>
                              <p className="text-[10px] text-muted-foreground">{zone.type} • {zone.address}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..." 
                className="rounded-full bg-background border-muted h-11"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="rounded-full bg-primary shrink-0 h-11 w-11 shadow-md hover:shadow-lg transition-shadow" onClick={handleSend} disabled={isSending}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-muted-foreground font-medium border-t pt-3">
              <span className="flex items-center gap-1.5"><AlertCircle className="w-3 h-3 text-destructive" /> No Deposits</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-primary" /> Verified Seller</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-primary" /> Safe Meeting</span>
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
