import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Store, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CanteenLogin: React.FC = () => {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!contact.trim()) {
      setErrorMsg('Please enter your email or phone.');
      return;
    }

    setLoading(true);
    try {
      const mockOtp = await api.requestCanteenOtp(contact.trim());
      setOtpSent(true);
      if (mockOtp) {
        setDevOtpHint(mockOtp);
        setOtp(mockOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Canteen owner account not found. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp.trim() || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const auth = await api.verifyCanteenOtp(contact.trim(), otp.trim());
      login(auth);
      navigate('/canteen/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Canteen Owner Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in using single-use OTP authentication</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {devOtpHint && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
            <div>
              <span className="font-bold block">Development Mock OTP Active:</span>
              <span className="font-mono text-sm tracking-widest font-extrabold text-amber-900">{devOtpHint}</span>
            </div>
            <button
              type="button"
              onClick={() => setOtp(devOtpHint)}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-amber-900 text-xs"
            >
              Fill OTP
            </button>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Owner Email or Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. owner@canteen.com or +919876543210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send Owner OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex justify-between items-center">
              <span>OTP sent to: <strong>{contact}</strong></span>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-slate-900 font-bold hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono text-center text-xl tracking-widest font-bold"
                  required
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Open Dashboard'} <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Want to register your canteen?{' '}
          <Link to="/canteen/register" className="font-bold text-slate-900 hover:underline">
            Register Canteen
          </Link>
        </div>
      </div>
    </div>
  );
};
