import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateIntegration } from '../hooks/useBroadcasts';
import { Button } from '@/components/ui/button';
import { SiWhatsapp } from 'react-icons/si';

interface WhatsAppIntegrationCardProps {
  clientId?: number;
  onConnected?: () => void;
  hasExisting?: boolean;
  variant?: 'card' | 'button';
}

// Extend Window interface for FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
    _isFbInitialized?: boolean;
  }
}

export function WhatsAppIntegrationCard({ clientId, onConnected, hasExisting, variant = 'card' }: WhatsAppIntegrationCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [pin, setPin] = useState('');
  const createIntegration = useCreateIntegration();
  
  const loadSdkAsynchronously = () => {
    return new Promise<void>((resolve, reject) => {
      const appId = import.meta.env.VITE_META_APP_ID;

      if (!appId) {
        reject(new Error('Meta App ID (VITE_META_APP_ID) is missing in environment variables.'));
        return;
      }

      if (window.FB && window._isFbInitialized) {
        resolve();
        return;
      }
      
      if (window.FB && typeof window.FB.init === 'function' && !window._isFbInitialized) {
        window.FB.init({
          appId            : appId,
          autoLogAppEvents : true,
          xfbml            : true,
          version          : 'v19.0'
        });
        window._isFbInitialized = true;
        resolve();
        return;
      }
      
      window.fbAsyncInit = function() {
        if (!window._isFbInitialized && window.FB) {
          window.FB.init({
            appId            : appId,
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v19.0'
          });
          window._isFbInitialized = true;
        }
        resolve();
      };

      if (document.getElementById('facebook-jssdk')) {
        const interval = setInterval(() => {
          if (window.FB && window._isFbInitialized) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load Meta SDK'));
      document.body.appendChild(script);
    });
  };

  const launchWhatsAppSignup = async () => {
    setIsConnecting(true);

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast.error('Meta strictly requires HTTPS. Please access the app securely via https:// to connect WhatsApp.');
      setIsConnecting(false);
      return;
    }
    
    try {
      await loadSdkAsynchronously();
      
      window.FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          
          createIntegration.mutateAsync({
            name: 'WhatsApp Business',
            type: 'WHATSAPP',
            provider: 'META',
            config: { accessToken, pin: pin.trim() || '123456' },
            isDefault: true,
            clientId
          }).then(() => {
            toast.success('WhatsApp Business connected successfully!');
            setPin('');
            if (onConnected) onConnected();
          }).catch((err) => {
            if (err?.response?.status === 400 || err?.message?.includes('400')) {
              toast.error("Registration failed or expired. Please click 'Connect' again to re-verify your phone number.", { duration: 8000 });
            } else {
              toast.error(err.message || 'Failed to connect WhatsApp');
            }
          }).finally(() => {
            setIsConnecting(false);
          });
        } else {
          toast.error('WhatsApp connection was cancelled');
          setIsConnecting(false);
        }
      }, {
        scope: 'whatsapp_business_management,whatsapp_business_messaging',
        return_scopes: true
      });
    } catch (err: any) {
      toast.error(err.message || 'Could not load Meta SDK');
      setIsConnecting(false);
    }
  };

  if (variant === 'button') {
    return (
      <div className="flex flex-col gap-3 w-full">
        <input
          type="text"
          maxLength={6}
          placeholder="6-digit PIN (Optional)"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          className="h-12 w-full px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black text-sm font-medium focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all outline-none"
        />
        <Button
          onClick={launchWhatsAppSignup}
          disabled={isConnecting}
          className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold h-14 rounded-2xl flex items-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02]"
        >
          {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SiWhatsapp className="w-5 h-5" />
          )}
          {isConnecting ? 'Connecting Meta Account...' : 'Connect WhatsApp via Meta'}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="h-[240px] w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center p-6 hover:border-green-500/30 transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {isConnecting ? (
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
        ) : (
          <Plus className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="text-center w-full max-w-[200px] flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
          {hasExisting ? 'Connect Another Account' : 'No WhatsApp Gateway Connected'}
        </p>
        <input
          type="text"
          maxLength={6}
          placeholder="6-digit PIN (Optional)"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          className="h-10 w-full px-3 text-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-xs font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
        />
        <Button
          onClick={launchWhatsAppSignup}
          disabled={isConnecting}
          className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold h-10 rounded-xl"
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </div>
    </div>
  );
}
