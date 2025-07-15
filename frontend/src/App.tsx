import { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LandingPage from './components/Pages/LandingPage';
import Dashboard from './components/Pages/Dashboard';
import VideoGenerator from './components/Pages/VideoGenerator';
import VideoHistory from './components/Pages/VideoHistory';
import Settings from './components/Pages/Settings';
import Subscription from './components/Pages/Subscription';
import SignIn from './components/Pages/Auth/SignIn';
import SignUp from './components/Pages/Auth/SignUp';
import AuthCallback from './components/Pages/Auth/AuthCallback';
import HealthCheck from './components/HealthCheck';
import { AuthDebugPanel, useAuthDebug } from './components/AuthDebugPanel';
import { useAuth } from './hooks/useAuth';
import { UserProvider } from './contexts/UserContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, loading, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { isDebugVisible } = useAuthDebug();
  const isAuthenticated = !!user;

  // Redirect to dashboard if user is authenticated and on auth pages
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'signin' || currentPage === 'signup' || currentPage === 'home')) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.success) {
      setCurrentPage('dashboard');
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const result = await signUp(email, password, name);
    if (result.success) {
      setCurrentPage('dashboard');
    }
    return result;
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    // Note: For OAuth, the redirect happens automatically
    // The user will be redirected to the callback page
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return isAuthenticated ? <Dashboard onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} onGoogleSignIn={handleGoogleSignIn} />;
      case 'generator':
        return isAuthenticated ? <VideoGenerator onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} onGoogleSignIn={handleGoogleSignIn} />;
      case 'history':
        return isAuthenticated ? <VideoHistory onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} onGoogleSignIn={handleGoogleSignIn} />;
      case 'settings':
        return isAuthenticated ? <Settings onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} onGoogleSignIn={handleGoogleSignIn} />;
      case 'subscription':
        return isAuthenticated ? <Subscription onNavigate={handleNavigate} /> : <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} onGoogleSignIn={handleGoogleSignIn} />;
      case 'signin':
        return <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} onGoogleSignIn={handleGoogleSignIn} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigate} onSignUp={handleSignUp} onGoogleSignIn={handleGoogleSignIn} />;
      case 'auth/callback':
        return <AuthCallback onNavigate={handleNavigate} />;
      case 'pricing':
        return <LandingPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-[#0F1116] text-white">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
        />
        {isAuthenticated && (
          <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <HealthCheck />
            </div>
          </div>
        )}
        <main>
          {renderPage()}
        </main>
        {!['signin', 'signup'].includes(currentPage) && <Footer />}
        <AuthDebugPanel isVisible={isDebugVisible} />
      </div>
    </UserProvider>
  );
}

export default App;