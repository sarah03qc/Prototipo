import PossibleReferencesPage from './pages/PossibleReferencesPage';
import { createAssistantChat } from './utils/assistantChat';
import { isOverdue } from './utils/schedule';
import React,{useState} from 'react';
import AppShell from './components/AppShell';
import { usePrototypeStore } from './hooks/usePrototypeStore';
import DashboardPage from './pages/DashboardPage';
import ReferencesPage from './pages/ReferencesPage';
import SessionsPage from './pages/SessionsPage';
import CasesPage from './pages/CasesPage';
import AttentionsPage from './pages/AttentionsPage';
import SchedulePage from './pages/SchedulePage';
import ReportingPage from './pages/ReportingPage';
import AssistantPage from './pages/AssistantPage';
import LabPage from './pages/LabPage';
import { roleConfig } from './utils/access';

export default function App(){
  const {state,actions}=usePrototypeStore();
  const [activeView,setActiveView]=useState('dashboard');
  const [chat]=useState(()=>createAssistantChat(typeof localStorage==='undefined'?null:localStorage));
  const [role,setRole]=useState(()=>chat.getSnapshot().roleId);
  const changeRole=(nextRole)=>{chat.changeRole(nextRole);setRole(chat.getSnapshot().roleId);setActiveView('dashboard');setContext({})};
  const [context,setContext]=useState({});
  const navigate=(view,payload={})=>{setActiveView(view);setContext(payload||{});window.scrollTo({top:0,behavior:'smooth'})};
  const props={state,actions,role,chat,onNavigate:navigate,context};
  const pages={possibleReferences:<PossibleReferencesPage key={role} {...props}/>,dashboard:<DashboardPage key={role} {...props}/>,references:<ReferencesPage key={role} {...props}/>,sessions:<SessionsPage key={role} {...props}/>,cases:<CasesPage key={role} {...props}/>,attentions:<AttentionsPage key={role} {...props}/>,schedule:<SchedulePage key={role} {...props}/>,reporting:<ReportingPage key={role} {...props}/>,assistant:<AssistantPage key={role} {...props}/>,lab:<LabPage key={role} {...props}/>};
  const pendingSync=state.syncItems.filter(s=>s.status!=='Sincronizado').length;
  const cfg=roleConfig(role);
  const overdue=cfg.level==='local'?state.schedule.filter(s=>s.localOffice===cfg.scope&&isOverdue(s)).length:0;
  const alertCount=overdue;
  return <AppShell activeView={activeView} onNavigate={navigate} role={role} onRoleChange={changeRole} connection={state.connection} pendingSync={pendingSync} onToggleConnection={()=>actions.setConnection(state.connection==='online'?'offline':'online')} onReset={actions.resetDemo} alertCount={alertCount}>{pages[activeView]||pages.dashboard}</AppShell>;
}
