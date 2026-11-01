import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, School, Hash, Layers, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StudentRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    studentIdNumber: '',
    section: '',
  });

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await api.registerStudent(formData);
      // Now request OTP to verify
      const mockOtp = await api.requestStudentOtp(formData.email);
      setIsVerifying(true);
      if (mockOtp) {
        setDevOtpHint(mockOtp);
        setOtp(mockOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const auth = await api.verifyStudentOtp(formData.email, otp.trim());
      login(auth);
      navigate('/student/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Student Registration</h2>
          <p className="text-sm text-slate-500 mt-1">Get your unique Student Code and instant QR code</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {devOtpHint && isVerifying && (
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

        {!isVerifying ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                College / Institution
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Stanford University / MIT"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                />
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID / Roll No.
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 21CS049"
                    value={formData.studentIdNumber}
                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  />
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Section / Department
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. CS-B"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  />
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register & Receive OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-800">
              Registration saved. Please verify your OTP sent to <strong>{formData.email}</strong>.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-center text-xl tracking-widest font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Complete Verification'} <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/student/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In with OTP
          </Link>
        </div>
      </div>
    </div>
  );
};

