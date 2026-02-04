import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { Lock, Mail, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

type ViewState = 'login' | 'forgot_email' | 'forgot_otp' | 'reset_password';

const ADMIN_EMAIL = "razah3812@gmail.com";
const DEFAULT_PASSWORD = "admin123";

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('login');
  
  // Login State
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Reset Flow State
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [flowError, setFlowError] = useState('');
  const [flowSuccess, setFlowSuccess] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || DEFAULT_PASSWORD;
    
    if (password === storedPassword) {
      onLogin();
    } else {
      setLoginError('Invalid password');
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setFlowError('Email not authorized for password reset.');
      return;
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    // NOTE: In a real production app with a backend, this would make an API call to send an email.
    // Since this is a frontend-only portfolio, we display the code on screen so you can proceed.
    setFlowError('');
    setView('forgot_otp');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      setFlowError('');
      setView('reset_password');
    } else {
      setFlowError('Invalid OTP. Please check the code displayed above.');
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setFlowError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFlowError('Passwords do not match.');
      return;
    }

    // Save new password to local storage
    localStorage.setItem('admin_password', newPassword);
    
    setFlowSuccess('Password updated successfully!');
    setTimeout(() => {
      // Reset states and go back to login
      setPassword('');
      setFlowSuccess('');
      setGeneratedOtp('');
      setView('login');
    }, 2000);
  };

  const goBack = () => {
    setFlowError('');
    setFlowSuccess('');
    setGeneratedOtp('');
    setView('login');
  };

  // Render Login View
  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 mb-4">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Admin Access</h2>
            <p className="text-gray-500 text-sm mt-1">Enter password to manage portfolio</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <Button type="submit" fullWidth>Login</Button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setView('forgot_email')}
                className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Reset Flow Views
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
        
        {/* Header for Reset Flow */}
        <button onClick={goBack} className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            {view === 'forgot_email' && <Mail size={24} />}
            {view === 'forgot_otp' && <ShieldCheck size={24} />}
            {view === 'reset_password' && <KeyRound size={24} />}
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {view === 'forgot_email' && 'Reset Password'}
            {view === 'forgot_otp' && 'Verify OTP'}
            {view === 'reset_password' && 'New Password'}
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {view === 'forgot_email' && 'Enter your admin email to proceed.'}
            {view === 'forgot_otp' && `Enter the 6-digit code for verification.`}
            {view === 'reset_password' && 'Create a new secure password.'}
          </p>
        </div>

        {/* View 1: Email Input */}
        {view === 'forgot_email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="name@example.com"
                required
              />
            </div>
            {flowError && <p className="text-red-500 text-sm">{flowError}</p>}
            <Button type="submit" fullWidth>Send OTP</Button>
          </form>
        )}

        {/* View 2: OTP Input */}
        {view === 'forgot_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
             {/* DEMO MESSAGE - VISIBLE OTP */}
             <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg mb-4 text-center">
               <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-1 font-bold uppercase tracking-wide">Demo Mode (No Email Server)</p>
               <p className="text-sm text-yellow-700 dark:text-yellow-300">Your verification code is:</p>
               <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1 tracking-widest">{generatedOtp}</p>
             </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter OTP</label>
              <input 
                type="text" 
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none tracking-widest text-center text-lg font-mono"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            {flowError && <p className="text-red-500 text-sm text-center">{flowError}</p>}
            <Button type="submit" fullWidth>Verify Code</Button>
            <div className="text-center mt-2">
               <button type="button" onClick={handleSendOtp} className="text-xs text-primary-500 hover:underline">Resend Code</button>
            </div>
          </form>
        )}

        {/* View 3: New Password */}
        {view === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
             {flowSuccess ? (
               <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-center">
                  {flowSuccess}
               </div>
             ) : (
               <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                {flowError && <p className="text-red-500 text-sm">{flowError}</p>}
                <Button type="submit" fullWidth>Set New Password</Button>
               </>
             )}
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginForm;