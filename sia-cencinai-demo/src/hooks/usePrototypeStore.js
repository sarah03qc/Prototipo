import { addReference, createCaseFromReference, closeCase, transferCase } from '../utils/caseOperations';
import { reassessCase } from '../utils/caseValuations';
import { useEffect, useMemo, useState } from 'react';
import { demoInstitutionalReferralSignals,demoCases,demoCoordinations,demoDocuments,demoGroupAttentions,demoOcr,demoPeople,demoReferences,demoReports,demoSchedule,demoSessions,demoSyncItems,demoTimeline,demoTransfers } from '../data/mockData';
import { currentDate } from '../utils/followUp';
import { updateReferenceRecord } from '../utils/references';
import { addGroupAttentionRecord } from '../utils/groupAttentions';
import { normalizeSchedule, updateScheduledActivity } from '../utils/schedule';
import { prepareDemoState } from '../utils/demoState';

const STORAGE_KEY='sia-cencinai-prototype-v3-1';
const initialState={institutionalReferralSignals:demoInstitutionalReferralSignals,people:demoPeople,references:demoReferences,cases:demoCases,sessions:demoSessions,timeline:demoTimeline,groupAttentions:demoGroupAttentions,documents:demoDocuments,coordinations:demoCoordinations,reports:demoReports,schedule:demoSchedule,transfers:demoTransfers,syncItems:demoSyncItems,ocr:demoOcr,connection:'online'};

export function usePrototypeStore(){
  const [state,setState]=useState(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?prepareDemoState(JSON.parse(raw),initialState):prepareDemoState(initialState,initialState)}catch{return prepareDemoState(initialState,initialState)}});
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))},[state]);
  const actions=useMemo(()=>({
    resetDemo(){setState(prepareDemoState(initialState,initialState))},
    setConnection(connection){setState(p=>({...p,connection}))},
    addReference(reference){setState(p=>addReference(p,reference))},
    updateReference(id,patch){setState(p=>({...p,references:p.references.map(r=>r.id===id?updateReferenceRecord(r,patch):r)}))},
    addSession(session){setState(p=>({...p,sessions:[{...session,id:`SES-${Date.now()}`},...p.sessions]}))},
    updateSession(id,patch){setState(p=>({...p,sessions:p.sessions.map(s=>s.id===id?{...s,...patch}:s)}))},
    createCaseFromReference(referenceId,payload){setState(p=>createCaseFromReference(p,referenceId,payload))},
    addAttention(caseId,attention){setState(p=>({...p,timeline:[{id:`EVT-${Date.now()}`,caseId,...attention},...p.timeline]}))},
    addGroupAttention(attention){setState(p=>addGroupAttentionRecord(p,attention,`GRP-${Date.now()}`))},
    addDocument(doc){setState(p=>({...p,documents:[{...doc,id:`DOC-${Date.now()}`},...p.documents]}))},
    addCoordination(coord){setState(p=>({...p,coordinations:[{...coord,id:`COORD-${Date.now()}`},...p.coordinations]}))},
    addReport(report){setState(p=>({...p,reports:[{...report,id:`REP-${Date.now()}`},...p.reports]}))},
    reassessCase(role,caseId,sessionId,valuation){setState(p=>reassessCase(p,role,caseId,sessionId,valuation,currentDate()))},
    closeCase(caseId,payload){setState(p=>closeCase(p,caseId,payload))},
    transferCase(caseId,payload){setState(p=>transferCase(p,caseId,payload))},
    addSchedule(item){setState(p=>({...p,schedule:[{...normalizeSchedule(item),id:`SCH-${Date.now()}`},...p.schedule]}))},
    updateSchedule(id,patch){setState(p=>({...p,schedule:p.schedule.map(s=>s.id===id?updateScheduledActivity(s,patch):s)}))},
    syncAll(){setState(p=>({...p,connection:'online',syncItems:p.syncItems.map(s=>({...s,status:'Sincronizado'}))}))},
    updateOcrField(id,patch){setState(p=>({...p,ocr:{...p.ocr,fields:p.ocr.fields.map(f=>f.id===id?{...f,...patch}:f)}}))},
  }),[]);
  return {state,actions};
}
