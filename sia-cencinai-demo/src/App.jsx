import React, { useState } from 'react';
import AppShell from './components/AppShell';
import { usePrototypeStore } from './hooks/usePrototypeStore';
import DashboardPage from './pages/DashboardPage';
import PeoplePage from './pages/PeoplePage';
import ReferencesPage from './pages/ReferencesPage';
import SessionsPage from './pages/SessionsPage';
import CasesPage from './pages/CasesPage';
import InterventionsPage from './pages/InterventionsPage';
import ReportingPage from './pages/ReportingPage';
import QualityPage from './pages/QualityPage';
import LabPage from './pages/LabPage';

export default function App() {
  const { state, actions } = usePrototypeStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [role, setRole] = useState('EEII_LOCAL');
  const [initialCaseId, setInitialCaseId] = useState(null);

  const navigate = (view, caseId = null) => {
    setActiveView(view);
    if (caseId) setInitialCaseId(caseId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingSync = state.syncItems.filter((s) => s.status !== 'Sincronizado').length;

  let page = null;
  if (activeView === 'dashboard') page = <DashboardPage state={state} onNavigate={navigate} />;
  if (activeView === 'people') page = <PeoplePage state={state} onNavigate={navigate} />;
  if (activeView === 'references') page = <ReferencesPage state={state} actions={actions} />;
  if (activeView === 'sessions') page = <SessionsPage state={state} actions={actions} onNavigate={navigate} />;
  if (activeView === 'cases') page = <CasesPage state={state} actions={actions} initialCaseId={initialCaseId} />;
  if (activeView === 'interventions') page = <InterventionsPage state={state} actions={actions} />;
  if (activeView === 'reporting') page = <ReportingPage state={state} role={role} />;
  if (activeView === 'quality') page = <QualityPage state={state} actions={actions} />;
  if (activeView === 'lab') page = <LabPage state={state} actions={actions} />;

  return (
    <AppShell
      activeView={activeView}
      onNavigate={navigate}
      role={role}
      onRoleChange={setRole}
      connection={state.connection}
      pendingSync={pendingSync}
      onToggleConnection={() => actions.setConnection(state.connection === 'online' ? 'offline' : 'online')}
      onReset={actions.resetDemo}
    >
      {page}
    </AppShell>
  );
}
