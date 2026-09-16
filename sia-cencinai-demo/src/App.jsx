import React,{useState} from 'react';
import AppShell from './components/AppShell';
import { usePrototypeStore } from './hooks/usePrototypeStore';
import DashboardPage from './pages/DashboardPage';
import PeoplePage from './pages/PeoplePage';
import ReferencesPage from './pages/ReferencesPage';
import SessionsPage from './pages/SessionsPage';
import CasesPage from './pages/CasesPage';
import AttentionsPage from './pages/AttentionsPage';
import SchedulePage from './pages/SchedulePage';
import ReportingPage from './pages/ReportingPage';
import LabPage from './pages/LabPage';
import { roleConfig } from './utils/access';

export default function App(){
  const {state,actions}=usePrototypeStore();
  const [activeView,setActiveView]=useState('dashboard');
  const [role,setRole]=useState('EEII_LOCAL');
  const [context,setContext]=useState({});
  const navigate=(view,payload={})=>{setActiveView(view);setContext(payload||{});window.scrollTo({top:0,behavior:'smooth'})};
  const props={state,actions,role,onNavigate:navigate,context};
  const pages={dashboard:<DashboardPage {...props}/>,people:<PeoplePage {...props}/>,references:<ReferencesPage {...props}/>,sessions:<SessionsPage {...props}/>,cases:<CasesPage {...props}/>,attentions:<AttentionsPage {...props}/>,schedule:<SchedulePage {...props}/>,reporting:<ReportingPage {...props}/>,lab:<LabPage {...props}/>};
  const pendingSync=state.syncItems.filter(s=>s.status!=='Sincronizado').length;
  const cfg=roleConfig(role);
  const overdue=cfg.level==='local'?state.schedule.filter(s=>s.localOffice===cfg.scope&&s.status==='Programada'&&s.date<'2026-09-16').length:0;
  const transferAlerts=cfg.level==='local'?state.transfers.filter(t=>t.destinationOffice===cfg.scope&&t.status==='Pendiente de continuidad').length:0;
  const alertCount=overdue+transferAlerts;
  return <AppShell activeView={activeView} onNavigate={navigate} role={role} onRoleChange={setRole} connection={state.connection} pendingSync={pendingSync} onToggleConnection={()=>actions.setConnection(state.connection==='online'?'offline':'online')} onReset={actions.resetDemo} alertCount={alertCount} onGlobalSearch={(q)=>navigate('people',{query:q})}>{pages[activeView]||pages.dashboard}</AppShell>;
}
