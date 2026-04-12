'use client';

import { useState } from 'react';
import { antiScamChatProtection, AntiScamChatProtectionOutput } from '@/ai/flows/anti-scam-chat-protection';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

/**
 * Reusable hook for marketplace security.
 * Detects scams in real-time across messages, listings, and bios.
 */
export function useScamDetection() {
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useUser();

  const checkContent = async (text: string, context: 'message' | 'listing' | 'bio' = 'message'): Promise<AntiScamChatProtectionOutput | null> => {
    if (!text.trim()) return null;
    
    setIsValidating(true);
    try {
      // Logic for trust score can be fetched from user profile
      const userTrustScore = user ? 50 : 0; 
      
      const result = await antiScamChatProtection({ message: text, userTrustScore });
      
      if (result.decision === 'block') {
        toast({
          variant: 'destructive',
          title: 'Security Alert: Message Blocked',
          description: 'This content contains high-risk fraud indicators and has been blocked for your safety.',
        });
      } else if (result.decision === 'warn') {
        toast({
          variant: 'default',
          title: 'Security Notice',
          description: 'Always keep communication and payments in-app to remain protected.',
        });
      } else if (result.decision === 'hold') {
        toast({
          variant: 'default',
          title: 'Verification Required',
          description: 'This listing is being reviewed by our safety team to ensure marketplace integrity.',
        });
      }

      return result;
    } catch (error) {
      console.error('Security Engine Error:', error);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  return { checkContent, isValidating };
}
