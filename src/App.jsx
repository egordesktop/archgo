import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthGate from './components/AuthGate';
import NewCalendarView from './components/NewCalendarView';

function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return <NewCalendarView role={role} user={user} />;
}

export default App;
