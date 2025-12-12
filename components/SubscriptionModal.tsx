
import React, { useMemo, useState } from 'react';
import { X, CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: (plan: 'WEEKLY' | 'MONTHLY') => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [processing, setProcessing] = useState(false);
  const [phone, setPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const backendBase = useMemo(() => (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, ''), []);

  const handlePayment = async () => {
    if (!backendBase) {
      setStatusMessage('Backend URL is not configured.');
      return;
    }
    if (!phone.trim()) {
      setStatusMessage('Please enter your Banglalink number.');
      return;
    }

    setProcessing(true);
    setStatusMessage('Contacting Banglalink...');
    try {
      const response = await fetch(`${backendBase}/api/subscription/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          action: '1',
          plan: selectedPlan,
          notify: true,
          frequency: selectedPlan === 'WEEKLY' ? 'weekly' : 'monthly',
          status: 'REGISTERED.',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.response?.statusDetail || 'Subscription failed.');
      }

      setStatusMessage('Subscription confirmed! You should receive an SMS shortly.');
      onSubscribe(selectedPlan);
    } catch (error: any) {
      setStatusMessage(error?.message || 'Subscription failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Specialist</h2>
          <p className="text-gray-500 mb-6">Get unlimited access to AI motion analysis and specialist checkups.</p>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => setSelectedPlan('WEEKLY')}
              className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                selectedPlan === 'WEEKLY' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <div className={`font-bold ${selectedPlan === 'WEEKLY' ? 'text-teal-700' : 'text-gray-800'}`}>Weekly Pass</div>
                <div className="text-xs text-gray-500">Good for short term</div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-gray-900">10 ৳</span>
                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                     selectedPlan === 'WEEKLY' ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                 }`}>
                     {selectedPlan === 'WEEKLY' && <div className="w-2 h-2 bg-white rounded-full" />}
                 </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedPlan('MONTHLY')}
              className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all relative ${
                selectedPlan === 'MONTHLY' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
               {/* Best Value Badge */}
               <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                   BEST VALUE
               </div>

              <div className="text-left">
                <div className={`font-bold ${selectedPlan === 'MONTHLY' ? 'text-teal-700' : 'text-gray-800'}`}>Monthly Pass</div>
                <div className="text-xs text-gray-500">Save 50% vs weekly</div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-gray-900">20 ৳</span>
                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                     selectedPlan === 'MONTHLY' ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                 }`}>
                     {selectedPlan === 'MONTHLY' && <div className="w-2 h-2 bg-white rounded-full" />}
                 </div>
              </div>
            </button>
          </div>

          <div className="text-left mb-6 space-y-2">
            <label className="block text-sm font-semibold text-gray-600">
              Banglalink Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
              disabled={processing}
            />
            <p className="text-xs text-gray-400">
              We’ll trigger an official Banglalink subscription for Specialist access and send you an SMS confirmation.
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || !phone.trim()}
            className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-700 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing ? (
                <>Processing...</>
            ) : (
                <>
                    <CreditCard size={20} /> Subscribe Now
                </>
            )}
          </button>
          {statusMessage && (
            <p className="mt-4 text-sm text-gray-600">{statusMessage}</p>
          )}
          <p className="mt-4 text-xs text-gray-400">
             Testing mode: use your whitelisted Banglalink number.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
