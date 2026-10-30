import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { createAssistantChat } from '../src/utils/assistantChat.js';
import { filteredSchedule } from '../src/utils/schedule.js';
import * as mocks from '../src/data/mockData.js';

const state=Object.fromEntries(Object.entries(mocks).map(([key,value])=>[key.slice(4,5).toLowerCase()+key.slice(5),value]));

test('changed pages render with actual components and respect visible role boundaries', async t => {
  const server=await createServer({server:{middlewareMode:true},appType:'custom'});
  t.after(()=>server.close());
  const render=async (name,role,context={})=>{
    const {default:Page}=await server.ssrLoadModule(`/src/pages/${name}.jsx`);
    return renderToStaticMarkup(React.createElement(Page,{state,role,context,actions:{},onNavigate:()=>{}}));
  };
  for(const role of ['ESTABLISHMENT','ESTABLISHMENT_ASSISTANT2']) {
    const cases=await render('CasesPage',role,{caseId:'AI-001'});
    assert.ok(cases.includes('Prioridad del caso'));
    assert.ok(cases.includes('Alto')&&cases.includes('Moderado')&&cases.includes('Bajo'));
    for(const text of ['Nivel de riesgo','Nivel de protección','Valoración vigente','Plan de atención','Documentos']) assert.ok(!cases.includes(text),text);
  }
  const localCases=await render('CasesPage','EEII_LOCAL');
  for(const text of ['Última atención','Sin atención registrada','Sin atención en el período','2025-09-11','2026-10-28']) assert.ok(localCases.includes(text),text);
  for(const role of ['ATE_REGIONAL','NIVEL_NACIONAL']) {
    const schedule=await render('SchedulePage',role);
    for(const action of ['Programar actividad','>Actualizar<','Guardar cambio']) assert.ok(!schedule.includes(action));
  }
  const schedule=await render('SchedulePage','EEII_LOCAL');
  for(const text of ['Vencida','bg-red-50','Actividad general','Casos específicos','Indisponibilidad de la familia','Visita a establecimiento para Atención Interdisciplinaria']) assert.ok(schedule.includes(text),text);
  assert.ok(!schedule.includes('Sesión de trabajo'));
  const references=await render('ReferencesPage','EEII_LOCAL');
  for(const text of ['Posibles referencias pendientes','Información complementaria asociada al motivo de referencia','Fecha/hora de envío']) assert.ok(references.includes(text),text);
  for(const text of ['Marcar recibida','Recibir referencia']) assert.ok(!references.includes(text));
  const attentions=await render('AttentionsPage','EEII_LOCAL');
  assert.ok(!attentions.match(/acompañante|companion/i));
  const reports=await render('ReportingPage','NIVEL_NACIONAL');
  for(const text of ['Referencias a Atención Interdisciplinaria','Referencias enviadas','Referencias analizadas','Casos activos por sexo','Edad mínima','Principales motivos de cancelación','Atenciones por tipo vigente']) assert.ok(reports.includes(text),text);
});


test('calendar renders dates, status and shared detail with read-only regional/national permissions', async t => {
  const server=await createServer({server:{middlewareMode:true},appType:'custom'});
  t.after(()=>server.close());
  const {default:Calendar}=await server.ssrLoadModule('/src/components/ScheduleCalendar.jsx');
  const {ScheduleDetail}=await server.ssrLoadModule('/src/pages/SchedulePage.jsx');
  const activities=filteredSchedule(state,'EEII_LOCAL',{});
  const html=renderToStaticMarkup(React.createElement(Calendar,{activities,month:'2026-09',onMonthChange:()=>{},onSelect:()=>{}}));
  for(const text of ['Septiembre','2026','Mes anterior','Mes siguiente','Hoy','Vencida','bg-red-50','dateTime="2026-09-18"']) assert.ok(html.includes(text),text);
  assert.ok(html.indexOf('dateTime="2026-09-18"')<html.indexOf('Sesión ordinaria EE.II.'));
  assert.ok(!html.includes('Gira CEN Las Juntas'));
  const general=state.schedule.find(s=>s.id==='SCH-002');
  const specific=state.schedule.find(s=>s.id==='SCH-006');
  const renderDetail=(role,item)=>renderToStaticMarkup(React.createElement(ScheduleDetail,{role,state,item,actions:{},onClose:()=>{}}));
  for(const role of ['ATE_REGIONAL','NIVEL_NACIONAL']) {
    const detail=renderDetail(role,general);
    assert.ok(detail.includes('Actividad general'));
    for(const text of ['Guardar cambio','Nuevo estado','Buscar casos para programación']) assert.ok(!detail.includes(text));
  }
  const local=renderDetail('EEII_LOCAL',specific);
  for(const text of ['Guardar cambio','Sofía Vargas Mora','Lucas Herrera Campos']) assert.ok(local.includes(text),text);
});

test('AssistantPage remount and refresh restore visible messages once and clear returns to greeting', async t => {
  const server=await createServer({server:{middlewareMode:true},appType:'custom'});
  t.after(()=>server.close());
  const {default:Assistant}=await server.ssrLoadModule('/src/pages/AssistantPage.jsx');
  const values=new Map();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const chat=createAssistantChat(storage);
  chat.append({role:'user',text:'Primera consulta de prueba'});
  chat.append({role:'assistant',text:'Respuesta terminada de prueba'});
  const render=store=>renderToStaticMarkup(React.createElement(Assistant,{state,role:store.getSnapshot().roleId,chat:store}));
  const first=render(chat), remounted=render(chat), refreshed=render(createAssistantChat(storage));
  for(const html of [first,remounted,refreshed]) {
    assert.ok(html.includes('Primera consulta de prueba')&&html.includes('Respuesta terminada de prueba'));
    assert.equal(html.split('¿En qué puedo ayudarle?').length-1,1);
    assert.ok(html.includes('Borrar chat'));
  }
  chat.changeRole('ESTABLISHMENT_ASSISTANT2');
  assert.ok(!render(chat).includes('Primera consulta de prueba'));
  chat.append({role:'user',text:'Nueva conversación'});
  chat.clear();
  assert.ok(!render(createAssistantChat(storage)).includes('Nueva conversación'));
});
