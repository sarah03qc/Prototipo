import { useEffect, useMemo, useState } from 'react';
import { demoCases,demoCoordinations,demoDocuments,demoGroupAttentions,demoOcr,demoPeople,demoReferences,demoReports,demoSchedule,demoSessions,demoSyncItems,demoTimeline,demoTransfers } from '../data/mockData';

const STORAGE_KEY='sia-cencinai-prototype-v3';
const today='2026-09-16';
const initialState={people:demoPeople,references:demoReferences,cases:demoCases,sessions:demoSessions,timeline:demoTimeline,groupAttentions:demoGroupAttentions,documents:demoDocuments,coordinations:demoCoordinations,reports:demoReports,schedule:demoSchedule,transfers:demoTransfers,syncItems:demoSyncItems,ocr:demoOcr,connection:'online'};

export function usePrototypeStore(){
  const [state,setState]=useState(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?{...initialState,...JSON.parse(raw)}:initialState}catch{return initialState}});
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))},[state]);
  const actions=useMemo(()=>({
    resetDemo(){setState(initialState)},
    setConnection(connection){setState(p=>({...p,connection}))},
    addReference(reference){setState(p=>({...p,references:[{...reference,id:`REF-${Date.now()}`},...p.references]}))},
    updateReference(id,patch){setState(p=>({...p,references:p.references.map(r=>r.id===id?{...r,...patch}:r)}))},
    addSession(session){setState(p=>({...p,sessions:[{...session,id:`SES-${Date.now()}`},...p.sessions]}))},
    updateSession(id,patch){setState(p=>({...p,sessions:p.sessions.map(s=>s.id===id?{...s,...patch}:s)}))},
    createCaseFromReference(referenceId,payload){setState(p=>{const ref=p.references.find(r=>r.id===referenceId);if(!ref)return p;const person=p.people.find(x=>x.id===ref.personId);const id=`AI-${Date.now()}`;const c={id,personId:ref.personId,referenceId,openedAt:payload.openedAt||today,status:'Activo',localOffice:person?.localOffice,establishment:person?.establishment,region:person?.region,...payload};return{...p,references:p.references.map(r=>r.id===referenceId?{...r,status:'Admitida a A.I.'}:r),cases:[c,...p.cases],timeline:[{id:`EVT-${Date.now()}`,caseId:id,date:c.openedAt,type:'Sesión interdisciplinaria',title:'Caso admitido a Atención Interdisciplinaria',detail:`Prioridad ${c.priority||'sin asignar'}. ${c.valuationSummary||''}`,discipline:'EE.II.',professional:'Equipo Interdisciplinario'},...p.timeline]}})},
    addAttention(caseId,attention){setState(p=>({...p,timeline:[{id:`EVT-${Date.now()}`,caseId,...attention},...p.timeline]}))},
    addGroupAttention(attention){const id=`GRP-${Date.now()}`;setState(p=>{const events=attention.participantIds.flatMap((pid)=>p.cases.filter(c=>c.personId===pid&&c.status==='Activo').map(c=>({id:`EVT-${Date.now()}-${c.id}`,caseId:c.id,date:attention.date,type:'Atención grupal',title:attention.topic,detail:attention.actions||'',discipline:(attention.disciplines||[]).join(', ')||'Interdisciplinaria',professional:(attention.professionals||[]).join(', '),groupInterventionId:id})));return{...p,groupAttentions:[{...attention,id},...p.groupAttentions],timeline:[...events,...p.timeline]}})},
    addDocument(doc){setState(p=>({...p,documents:[{...doc,id:`DOC-${Date.now()}`},...p.documents]}))},
    addCoordination(coord){setState(p=>({...p,coordinations:[{...coord,id:`COORD-${Date.now()}`},...p.coordinations]}))},
    addReport(report){setState(p=>({...p,reports:[{...report,id:`REP-${Date.now()}`},...p.reports]}))},
    closeCase(caseId,{date,reason}){setState(p=>({...p,cases:p.cases.map(c=>c.id===caseId?{...c,status:'Cerrado',closedAt:date,closureReason:reason}:c),timeline:[{id:`EVT-${Date.now()}`,caseId,date,type:'Cierre',title:'Caso de A.I. cerrado',detail:reason,discipline:'EE.II.',professional:'Equipo Interdisciplinario'},...p.timeline]}))},
    transferCase(caseId,payload){setState(p=>{const c=p.cases.find(x=>x.id===caseId);if(!c)return p;const tr={id:`TR-${Date.now()}`,personId:c.personId,sourceCaseId:caseId,sourceOffice:c.localOffice,destinationOffice:payload.destinationOffice,destinationEstablishment:payload.destinationEstablishment,region:payload.region,date:payload.date,status:'Pendiente de continuidad',reason:payload.reason};return{...p,cases:p.cases.map(x=>x.id===caseId?{...x,status:'Cerrado',closedAt:payload.date,closureReason:'Cierre por traslado'}:x),transfers:[tr,...p.transfers],timeline:[{id:`EVT-${Date.now()}`,caseId,date:payload.date,type:'Traslado',title:'Cierre por traslado',detail:`Destino: ${payload.destinationOffice}. ${payload.reason}`,discipline:'EE.II.',professional:'Equipo Interdisciplinario'},...p.timeline]}})},
    continueTransfer(transferId){setState(p=>{const tr=p.transfers.find(t=>t.id===transferId);if(!tr)return p;const source=p.cases.find(c=>c.id===tr.sourceCaseId);const person=p.people.find(x=>x.id===tr.personId);const newId=`AI-${Date.now()}`;const newCase={...source,id:newId,openedAt:today,closedAt:undefined,closureReason:undefined,status:'Activo',localOffice:tr.destinationOffice,establishment:tr.destinationEstablishment,region:tr.region,referenceId:source?.referenceId};return{...p,transfers:p.transfers.map(t=>t.id===transferId?{...t,status:'Continuidad confirmada'}:t),cases:[newCase,...p.cases],people:p.people.map(x=>x.id===person?.id?{...x,localOffice:tr.destinationOffice,establishment:tr.destinationEstablishment,region:tr.region}:x),timeline:[{id:`EVT-${Date.now()}`,caseId:newId,date:today,type:'Traslado',title:'Continuidad de A.I. confirmada en destino',detail:`Caso continúa en ${tr.destinationOffice}.`,discipline:'EE.II.',professional:'Equipo Interdisciplinario'},...p.timeline]}})},
    addSchedule(item){setState(p=>({...p,schedule:[{...item,id:`SCH-${Date.now()}`},...p.schedule]}))},
    updateSchedule(id,patch){setState(p=>({...p,schedule:p.schedule.map(s=>s.id===id?{...s,...patch}:s)}))},
    syncAll(){setState(p=>({...p,connection:'online',syncItems:p.syncItems.map(s=>({...s,status:'Sincronizado'}))}))},
    updateOcrField(id,patch){setState(p=>({...p,ocr:{...p.ocr,fields:p.ocr.fields.map(f=>f.id===id?{...f,...patch}:f)}}))},
  }),[]);
  return {state,actions};
}
