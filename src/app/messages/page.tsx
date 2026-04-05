
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
  Flag,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation as NavIcon,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamAlert, setScamAlert] = useState<AntiScamChatProtectionOutput | null>(null);
  
  // Meeting Flow States
  const [meetingRequest, setMeetingRequest] = useState<{
    status: 'none' | 'pending' | 'accepted' | 'declined' | 'on_the_way' | 'arrived';
    location: string;
    time: string;
    requester: string;
    reliability: number;
  }>({
    status: 'pending', // Defaulting to pending for demonstration
    location: "Shell Garage Main Road",
    time: "Today 15:00",
    requester: "Alex Rivera",
    reliability: 96
  });

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);
    setScamAlert(null);

    const scanResult = await antiScamChatProtection({ message: inputValue });
    if (scanResult.isSuspicious && scanResult.riskLevel === 'high') {
      setScamAlert(scanResult);
      setIsSending(false);
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

  const handleNoShow = () => {
    toast({
      variant: "destructive",
      title: "No-Show Reported",
      description: "A penalty of -15 reliability points has been applied to the other user.",
    });
    setMeetingRequest({ ...meetingRequest, status: 'none' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-4 border-b bg-primary/5">
            <h2 className="font-bold text-lg">Conversations</h2>
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
                  <Badge className="bg-primary/10 text-primary text-[8px] h-4">Active Request</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">Meeting request pending...</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-4 border-b flex items-center justify-between bg-white z-10 shadow-sm">
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
                  <span className="text-[10px] font-bold text-primary uppercase">Reliability: 96%</span>
                  <span className="text-[10px] text-muted-foreground">• Active Seller</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
            {/* Meeting Request Panel */}
            {meetingRequest.status === 'pending' && (
              <Card className="border-primary/20 bg-primary/5 shadow-md animate-in slide-in-from-top-4">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Calendar className="w-5 h-5" />
                        <span>Meeting Request: Samsung TV Sale</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{meetingRequest.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{meetingRequest.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border w-fit">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
                        </Avatar>
                        <span className="text-xs">
                          Request from <span className="font-bold">{meetingRequest.requester}</span> 
                          <Badge variant="secondary" className="ml-2 text-[10px] bg-green-50 text-green-700">Rel: {meetingRequest.reliability}%</Badge>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button className="flex-1 bg-primary text-white font-bold rounded-xl" onClick={() => setMeetingRequest({...meetingRequest, status: 'accepted'})}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                      </Button>
                      <Button variant="outline" className="flex-1 border-destructive text-destructive font-bold rounded-xl" onClick={() => setMeetingRequest({...meetingRequest, status: 'none'})}>
                        <XCircle className="w-4 h-4 mr-2" /> Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meeting Status Tracker */}
            {(meetingRequest.status === 'accepted' || meetingRequest.status === 'on_the_way' || meetingRequest.status === 'arrived') && (
              <Card className="border-green-200 bg-green-50 shadow-md animate-in slide-in-from-top-4">
                <CardHeader className="p-4 border-b bg-green-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                    <ShieldCheck className="w-4 h-4" />
                    Meeting Status: {meetingRequest.location}
                  </CardTitle>
                  <span className="text-xs font-bold text-green-700">{meetingRequest.time}</span>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                          meetingRequest.status === 'on_the_way' || meetingRequest.status === 'arrived' ? "bg-green-500 border-green-600 text-white" : "bg-white border-muted text-muted-foreground"
                        )}>
                          <NavIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase">On the way</span>
                      </div>
                      <div className="h-0.5 w-12 bg-muted relative">
                        <div className={cn("absolute inset-0 transition-all", meetingRequest.status === 'arrived' ? "bg-green-500 w-full" : "bg-muted w-0")} />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                          meetingRequest.status === 'arrived' ? "bg-green-500 border-green-600 text-white" : "bg-white border-muted text-muted-foreground"
                        )}>
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase">I've Arrived</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {meetingRequest.status === 'accepted' && (
                        <Button className="bg-primary text-white font-bold rounded-xl" onClick={() => setMeetingRequest({...meetingRequest, status: 'on_the_way'})}>
                          I'm on my way
                        </Button>
                      )}
                      {meetingRequest.status === 'on_the_way' && (
                        <Button className="bg-green-600 text-white font-bold rounded-xl" onClick={() => setMeetingRequest({...meetingRequest, status: 'arrived'})}>
                          I have arrived
                        </Button>
                      )}
                      {meetingRequest.status === 'arrived' && (
                        <Alert className="bg-yellow-50 border-yellow-200 py-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-[10px] text-yellow-700">
                            Waiting for the other party. If they don't show up:
                            <button className="ml-2 font-bold underline" onClick={handleNoShow}>Report No-Show (-15 pts)</button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
              <Button size="icon" className="rounded-full bg-primary shrink-0 h-11 w-11 shadow-md hover:shadow-lg transition-shadow" onClick={handleSend}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
