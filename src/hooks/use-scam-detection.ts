'use client';

import { useState } from 'react';
import { antiScamChatProtection, AntiScamChatProtectionOutput } from '@/ai/flows/anti-scam-chat-protection';
import { toast } from '@/hooks/use-toast';

/**
 * Reusable hook for marketplace security.
 * Compatible with React/Next.js (Web) and logic is portable to React Native.
 */
export function useScamDetection() {
  const [isValidating, setIsValidating] = useState(false);

  const checkContent = async (text: string): Promise<AntiScamChatProtectionOutput | null> => {
    if (!text.trim()) return null;
    
    setIsValidating(true);
    try {
      const result = await antiScamChatProtection({ message: text });
      
      if (result.decision === 'block') {
        toast({
          variant: 'destructive',
          title: 'Security Alert',
          description: 'This message was blocked for your safety as it contains high-risk fraud indicators.',
        });
      } else if (result.decision === 'flag') {
        toast({
          variant: 'default',
          title: 'Caution',
          description: 'Our AI has flagged this message as potentially suspicious.',
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
