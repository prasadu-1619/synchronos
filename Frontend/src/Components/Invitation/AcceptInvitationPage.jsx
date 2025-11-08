import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, Loader, AlertCircle, CheckCircle, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';

const AcceptInvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [invitation, setInvitation] = useState(null);
  
  // Registration form fields
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    checkInvitationStatus();
  }, [token]);

  const checkInvitationStatus = async () => {
    try {
      // First try to accept without registration (for existing users)
      const response = await axios.post(
        API_ENDPOINTS.INVITE_ACCEPT(token),
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Existing user - invitation accepted
        setSuccess(true);
        setInvitation(response.data.project);

        // Save token if provided (for new users)
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Redirect to project after 3 seconds
        setTimeout(() => {
          window.location.href = `/project/${response.data.project._id}`;
        }, 3000);
      }
    } catch (error) {
      console.error('Invitation check error:', error);
      
      if (error.response?.data?.requiresRegistration) {
        // New user - needs to register first
        setRequiresRegistration(true);
        setInvitationDetails(error.response.data.invitationDetails);
      } else {
        setError(
          error.response?.data?.message ||
          'Failed to process invitation. The link may be invalid or expired.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAndAccept = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const response = await axios.post(
        API_ENDPOINTS.INVITE_ACCEPT(token),
        {
          name,
          password,
          email: invitationDetails.email,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Save authentication token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        setSuccess(true);
        setInvitation(response.data.project);

        // Redirect to project after 3 seconds
        setTimeout(() => {
          window.location.href = `/project/${response.data.project._id}`;
        }, 3000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(
        error.response?.data?.message ||
        'Failed to create account and accept invitation'
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className={`max-w-md w-full rounded-lg shadow-xl p-8 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {loading && (
          <div className="text-center">
            <Loader size={48} className="mx-auto mb-4 animate-spin text-blue-500" />
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Processing Invitation
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Please wait while we verify your invitation...
            </p>
          </div>
        )}

        {error && !requiresRegistration && (
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2 text-red-500">Invitation Failed</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {requiresRegistration && invitationDetails && (
          <div>
            <div className="text-center mb-6">
              <UserCheck size={48} className="mx-auto mb-4 text-blue-500" />
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Welcome! Create Your Account
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                You've been invited to join <span className="font-medium text-blue-500">{invitationDetails.projectName}</span>
              </p>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">Email:</span> {invitationDetails.email}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">Role:</span> {invitationDetails.role}
              </p>
            </div>

            <form onSubmit={handleRegisterAndAccept} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registering ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Create Account & Join Project
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {success && invitation && (
          <div className="text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome to the Team!
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You've been added to <span className="font-medium text-blue-500">{invitation.name}</span> with{' '}
              <span className="font-medium text-blue-500">{invitation.role}</span> access.
            </p>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Redirecting to project...
              </p>
            </div>
            <button
              onClick={() => window.location.href = `/project/${invitation._id}`}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Go Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
