import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, ShieldCheck, MessageSquare } from 'lucide-react';
import { useRegisterWhatsAppPin, useRequestWhatsAppCode, useVerifyWhatsAppCode } from '../hooks/useBroadcasts';

interface WhatsAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: number;
  mode: 'SMS' | 'PIN';
}

export function WhatsAppVerificationModal({ isOpen, onClose, integrationId, mode }: WhatsAppVerificationModalProps) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  
  const registerPinMutation = useRegisterWhatsAppPin();
  const requestSmsMutation = useRequestWhatsAppCode();
  const verifyCodeMutation = useVerifyWhatsAppCode();

  const handleRequestCode = async () => {
    try {
      await requestSmsMutation.mutateAsync({ id: integrationId, method: 'SMS' });
      setStep(2);
    } catch (err) {
      // Error is handled by the hook's toast
    }
  };

  const handleVerifySms = async () => {
    try {
      await verifyCodeMutation.mutateAsync({ id: integrationId, code });
      onClose();
    } catch (err) {
      // Error is handled by the hook's toast
    }
  };

  const handleRegisterPin = async () => {
    try {
      await registerPinMutation.mutateAsync({ id: integrationId, pin: code });
      onClose();
    } catch (err) {
      // Error is handled by the hook's toast
    }
  };

  const isSubmitting = registerPinMutation.isPending || requestSmsMutation.isPending || verifyCodeMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            {mode === 'PIN' ? (
              <ShieldCheck className="w-6 h-6 text-green-600" />
            ) : (
              <MessageSquare className="w-6 h-6 text-green-600" />
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {mode === 'PIN' ? 'Two-Step Verification' : 'Verify Phone Number'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {mode === 'PIN' 
              ? 'Your WhatsApp number is locked with a Two-Step Verification PIN.' 
              : step === 1 
                ? 'Your WhatsApp number status is EXPIRED. We need to verify it to restore the connection.'
                : 'An SMS code has been sent to your WhatsApp number.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {mode === 'PIN' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Enter the 6-digit PIN you created in WhatsApp. If this fails, you must go to <strong>Meta Business Settings</strong> and turn off Two-Step Verification before you can connect.
                </p>
              </div>
              <div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit PIN"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center tracking-[0.5em] font-mono text-lg h-12"
                />
              </div>
            </div>
          )}

          {mode === 'SMS' && step === 1 && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Click below to request a 6-digit verification code via SMS to your connected phone number.
              </p>
            </div>
          )}

          {mode === 'SMS' && step === 2 && (
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center tracking-[0.5em] font-mono text-lg h-12"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-stretch flex-col gap-2 sm:gap-2">
          {mode === 'PIN' ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-11" 
              onClick={handleRegisterPin}
              disabled={isSubmitting || code.length < 6}
            >
              {registerPinMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit PIN
            </Button>
          ) : mode === 'SMS' && step === 1 ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-11" 
              onClick={handleRequestCode}
              disabled={isSubmitting}
            >
              {requestSmsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Request SMS Code
            </Button>
          ) : (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-11" 
              onClick={handleVerifySms}
              disabled={isSubmitting || code.length < 6}
            >
              {verifyCodeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify Code
            </Button>
          )}
          
          <Button variant="ghost" className="w-full" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
