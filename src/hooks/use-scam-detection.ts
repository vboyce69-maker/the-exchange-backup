'use client';

import { useState } from 'react';
import { antiScamChatProtection, AntiScamChatProtectionOutput } from '@/ai/flows/anti-scam-chat-protection';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

/**
 * Reusable hook for marketplace security.
 * Implements the Tiered AI Architecture.
 */
export function useScamDetection() {
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useUser();

  const checkContent = async (text: string, context: 'message' | 'listing' | 'bio' = 'message'): Promise<AntiScamChatProtectionOutput | null> => {
    if (!text.trim()) return null;
    
    setIsValidating(true);
    try {
      // Use user profile trust indicators if logged in
      const userTrustScore = user ? 50 : 0; 
      
      const result = await antiScamChatProtection({ message: text, userTrustScore });
      
      if (result.decision === 'block') {
        toast({
          variant: 'destructive',
          title: 'Security Alert: Message Blocked',
          description: result.reason || 'This content contains high-risk fraud indicators.',
        });
      } else if (result.decision === 'warn') {
        toast({
          variant: 'default',
          title: 'Safety Notice',
          description: 'Platform AI suggests caution. Keep communication in-app.',
        });
      } else if (result.decision === 'hold') {
        toast({
          variant: 'default',
          title: 'Security Review',
          description: 'This content is being verified by our safety engine.',
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
