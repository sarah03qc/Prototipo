import { reportingMetrics } from './reporting.js';
import { currentDate, countValues } from './followUp.js';
import { roleConfig, scopeItems } from './access.js';
import { isOverdue } from './schedule.js';
import { pendingReferralSignals } from './referralSignals.js';

export const SCHEDULE_STATES=['Realizada','Programada','Cancelada','Reprogramada'];

export function dashboardMetrics(state,role,year=currentDate().slice(0,4)){
  const cfg=roleConfig(role);
  const scopedCases=scopeItems(state.cases,role);
  const scopedRefs=scopeItems(state.references,role);
  const schedule=scopeItems(state.schedule,role);
  const report=reportingMetrics(state,role,{year});
  const today=currentDate();
  const start=`${year}-01-01`,end=`${year}-12-31`;
  const pending=scopedRefs.filter(r=>r.status==='Pendiente de revisión');
  const due=schedule.filter(s=>(s.originalDate||s.date)>=start&&(s.originalDate||s.date)<=end&&(s.originalDate||s.date)<=today);
  const realized=due.filter(s=>s.status==='Realizada').length;
  const scheduleStates=SCHEDULE_STATES.map(name=>({name,value:schedule.filter(s=>s.status===name && s.date>=start && s.date<=end).length}));
  const active=scopedCases.filter(c=>c.status==='Activo');
  const coverageBy=(field)=>[...new Set(active.map(c=>c[field]).filter(Boolean))].sort().map(name=>{
    const coverage=reportingMetrics(state,role,{year,[field]:name}).coverage;
    return {name,value:coverage.percentage, ...coverage};
  });
  const referenceAge=countValues(pending.map(r=>{
    const days=Math.max(0,Math.floor((Date.parse(today)-Date.parse(r.sentAt||r.date))/86400000));
    return !Number.isFinite(days)?'Sin fecha':days<8?'0–7 días':days<31?'8–30 días':'31 días o más';
  }));
  const recentRefs=[...scopedRefs].sort((a,b)=>(b.sentAt||b.date||'').localeCompare(a.sentAt||a.date||'')).slice(0,4);
  const possible=pendingReferralSignals(state,role).length;
  return {report,active,pending,possible,recentRefs,referenceAge,scheduleStates,referenceCount:scopedRefs.length,
    referenceStates:countValues(scopedRefs.map(r=>r.status)),
    overdue:schedule.filter(s=>isOverdue(s,today)),
    realizedRate:{numerator:realized,denominator:due.length,percentage:due.length?100*realized/due.length:null},
    priority:countValues(active.map(c=>c.priority)),
    byOffice:countValues(active.map(c=>c.localOffice)),
    byRegion:countValues(active.map(c=>c.region)),
    officeCoverage:coverageBy('localOffice'),
    regionCoverage:coverageBy('region'),
    attentionTrend:countValues(report.events.map(e=>e.date?.slice(0,7))).sort((a,b)=>a.name.localeCompare(b.name)),
    nextSessions:state.sessions.filter(s=>s.status==='Programada' && s.date>=today && (s.localOffice||s.place)===cfg.scope).sort((a,b)=>a.date.localeCompare(b.date)),
  };
}
