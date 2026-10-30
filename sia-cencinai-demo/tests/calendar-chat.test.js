import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistantChat, CHAT_STORAGE_KEY } from '../src/utils/assistantChat.js';
import { calendarDays, monthLabel, moveMonth } from '../src/utils/calendar.js';
import { filteredSchedule, isOverdue, scheduleAssociationLabel } from '../src/utils/schedule.js';
import * as mocks from '../src/data/mockData.js';

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
const state=Object.fromEntries(Object.entries(mocks).map(([key,value])=>[key.slice(4,5).toLowerCase()+key.slice(5),value]));

test('monthly navigation crosses year boundaries and labels months in Spanish', () => {
  assert.equal(moveMonth('2026-12',1),'2027-01');
  assert.equal(moveMonth('2026-01',-1),'2025-12');
  assert.match(monthLabel('2026-10'),/^Octubre.*2026$/);
});
test('monthly grid aligns Mondays, includes leap days and places each activity on its date', () => {
  const activities=[{id:'A',date:'2026-10-01'},{id:'B',date:'2026-10-31'},{id:'C',date:'2026-11-01'}];
  const grid=calendarDays('2026-10',activities);
  assert.equal(grid[0],null);
  assert.equal(grid[3].date,'2026-10-01');
  assert.deepEqual(grid.flatMap(day=>day?.activities||[]).map(a=>a.id),['A','B']);
  assert.equal(grid.filter(Boolean).length,31);
  assert.equal(calendarDays('2028-02',[]).filter(Boolean).length,29);
  assert.equal(grid.length%7,0);
});
test('calendar uses the same scoped filtered activities as the list without mutating schedule', () => {
  const before=JSON.stringify(state.schedule);
  for(const role of ['EEII_LOCAL','ATE_REGIONAL','NIVEL_NACIONAL']) {
    for(const filters of [{},{establishment:'CINAI Los Robles'},{status:'Cancelada'},{localOffice:'Oficina Local Liberia'}]) {
      const list=filteredSchedule(state,role,filters);
      const months=[...new Set(list.map(a=>a.date.slice(0,7)))];
      const calendar=months.flatMap(month=>calendarDays(month,list).flatMap(day=>day?.activities||[]));
      assert.deepEqual(calendar.map(a=>a.id),list.map(a=>a.id));
    }
  }
  assert.equal(JSON.stringify(state.schedule),before);
});
test('calendar reuses overdue rule and general activities never infer associated cases', () => {
  const general={date:'2026-09-01',status:'Programada',establishment:'CINAI Los Robles',caseIds:[]};
  const day=calendarDays('2026-09',[general]).find(day=>day?.day===1);
  assert.equal(isOverdue(day.activities[0],'2026-10-01'),true);
  assert.equal(scheduleAssociationLabel(general,state),'Actividad general — sin personas programadas específicamente');
  assert.match(scheduleAssociationLabel({...general,caseIds:['AI-001']},state),/Sofía Vargas Mora/);
});
test('completed messages persist with role and recover after a simulated refresh', () => {
  const storage=memoryStorage(), chat=createAssistantChat(storage);
  chat.append({role:'user',text:'Primera pregunta'});
  chat.append({role:'assistant',text:'Primera respuesta'});
  const saved=JSON.parse(storage.getItem(CHAT_STORAGE_KEY));
  assert.equal(saved.roleId,'EEII_LOCAL');
  assert.equal(saved.version,1);
  assert.deepEqual(createAssistantChat(storage).getSnapshot(),chat.getSnapshot());
});
test('navigation away and back keeps one active conversation', () => {
  const storage=memoryStorage(), chat=createAssistantChat(storage);
  chat.append({role:'user',text:'Consulta'});
  let notified=0;
  const unsubscribe=chat.subscribe(()=>notified++);
  unsubscribe(); // AssistantPage unmounts, App still owns the conversation.
  chat.cancelRequest();
  const subscribeAgain=chat.subscribe(()=>notified++);
  assert.deepEqual(chat.getSnapshot().messages,[{role:'user',text:'Consulta'}]);
  chat.append({role:'assistant',text:'Respuesta'});
  assert.equal(notified,1);
  subscribeAgain();
});
test('same-role selection keeps conversation but changing role erases memory and storage', () => {
  const storage=memoryStorage(), chat=createAssistantChat(storage);
  chat.append({role:'user',text:'Contexto local'});
  chat.changeRole('EEII_LOCAL');
  assert.equal(chat.getSnapshot().messages.length,1);
  chat.changeRole('ESTABLISHMENT_ASSISTANT2');
  assert.deepEqual(chat.getSnapshot().messages,[]);
  assert.equal(storage.getItem(CHAT_STORAGE_KEY),null);
  chat.changeRole('EEII_LOCAL');
  assert.deepEqual(chat.getSnapshot().messages,[]);
  assert.deepEqual(createAssistantChat(storage).getSnapshot().messages,[]);
});
test('refresh preserves the selected role and its single current conversation', () => {
  const storage=memoryStorage(), chat=createAssistantChat(storage);
  chat.changeRole('ESTABLISHMENT_ASSISTANT2');
  chat.append({role:'user',text:'Consulta de establecimiento'});
  const refreshed=createAssistantChat(storage);
  assert.equal(refreshed.getSnapshot().roleId,'ESTABLISHMENT_ASSISTANT2');
  assert.equal(refreshed.getSnapshot().messages[0].text,'Consulta de establecimiento');
});
test('manual clear removes messages and chat storage while retaining role after refresh', () => {
  const storage=memoryStorage(), chat=createAssistantChat(storage);
  chat.changeRole('ESTABLISHMENT_ASSISTANT2');
  chat.append({role:'user',text:'Consulta'});
  chat.clear();
  assert.deepEqual(chat.getSnapshot().messages,[]);
  assert.equal(storage.getItem(CHAT_STORAGE_KEY),null);
  const refreshed=createAssistantChat(storage);
  assert.equal(refreshed.getSnapshot().roleId,'ESTABLISHMENT_ASSISTANT2');
  assert.deepEqual(refreshed.getSnapshot().messages,[]);
});
test('persistence whitelists message text/role and omits context, loading and transient errors', () => {
  const storage=memoryStorage(), chat=createAssistantChat(storage);
  chat.append({role:'user',text:'Pregunta',assistantContext:{secret:'context'},apiKey:'never-save',loading:false});
  chat.append({role:'assistant',text:'Error técnico',error:true});
  chat.append({role:'assistant',text:'Pendiente',pending:true});
  chat.append({role:'assistant',text:'Escribiendo',loading:true});
  const raw=storage.getItem(CHAT_STORAGE_KEY);
  assert.deepEqual(JSON.parse(raw).messages,[{role:'user',text:'Pregunta'}]);
  assert.ok(!raw.match(/assistantContext|never-save|Error técnico|Pendiente|Escribiendo/));
});
test('a response initiated under the previous role is aborted and cannot append after role switch', async () => {
  const chat=createAssistantChat(memoryStorage());
  chat.append({role:'user',text:'Pregunta local'});
  const request=chat.beginRequest();
  let resolve;
  const response=new Promise(r=>{resolve=r;}).then(answer=>{if(request.isCurrent())chat.append({role:'assistant',text:answer});});
  chat.changeRole('ESTABLISHMENT_ASSISTANT2');
  resolve('Respuesta que pertenece a Oficina Local');
  await response;
  assert.equal(request.signal.aborted,true);
  assert.equal(request.isCurrent(),false);
  assert.deepEqual(chat.getSnapshot().messages,[]);
});
test('manual clear invalidates pending responses and navigation cancellation preserves finished messages', () => {
  const chat=createAssistantChat(memoryStorage());
  chat.append({role:'user',text:'Pregunta'});
  const first=chat.beginRequest();
  chat.cancelRequest();
  assert.equal(first.signal.aborted,true);
  assert.equal(chat.getSnapshot().messages.length,1);
  const second=chat.beginRequest();
  chat.clear();
  assert.equal(second.isCurrent(),false);
  assert.equal(second.signal.aborted,true);
  assert.deepEqual(chat.getSnapshot().messages,[]);
});
test('malformed or inaccessible localStorage does not crash the assistant', () => {
  const storage=memoryStorage();storage.setItem(CHAT_STORAGE_KEY,'broken json');
  assert.deepEqual(createAssistantChat(storage).getSnapshot().messages,[]);
  storage.setItem(CHAT_STORAGE_KEY,JSON.stringify({version:1,roleId:'EEII_LOCAL',messages:[null,{role:'system',text:'Bad'},{role:'assistant',text:'Valid'}]}));
  assert.deepEqual(createAssistantChat(storage).getSnapshot().messages,[{role:'assistant',text:'Valid'}]);
  const unavailable={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
  const chat=createAssistantChat(unavailable);
  assert.doesNotThrow(()=>{chat.append({role:'user',text:'Pregunta'});chat.clear();chat.changeRole('ESTABLISHMENT');});
});
