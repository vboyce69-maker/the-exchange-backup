'use client';

import { useState } from 'react';
import { antiScamChatProtection, AntiScamChatProtectionOutput } from '@/ai/flows/anti-scam-chat-protection';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

/**
 * Reusable hook for marketplace security.
 * Implements the Tiered AI Architecture and strict policy blocking.
 */
export function useScamDetection() {
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useUser();

  const checkContent = async (text: string, context: 'message' | 'listing' | 'bio' = 'message'): Promise<AntiScamChatProtectionOutput | null> => {
    if (!text.trim()) return null;
    
    setIsValidating(true);
    try {
      const userTrustScore = user ? 50 : 0; 
      const result = await antiScamChatProtection({ message: text, userTrustScore });
      
      if (result.decision === 'block') {
        toast({
          variant: 'destructive',
          title: 'Policy Violation: Message Blocked',
          description: result.reason || 'Sending contact details or social media links is not allowed.',
        });
      } else if (result.decision === 'warn') {
        toast({
          variant: 'default',
          title: 'Safety Notice',
          description: 'Keep all trade discussions inside the platform to remain protected.',
        });
      }

      return result;
    } catch (error) {
      console.error('Security Architecture Fault:', error);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  return { checkContent, isValidating };
}
