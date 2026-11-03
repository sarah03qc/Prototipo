import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {dashboardMetrics,SCHEDULE_STATES} from '../src/utils/dashboard.js';
import {reportingMetrics} from '../src/utils/reporting.js';
import * as mocks from '../src/data/mockData.js';

const state=Object.fromEntries(Object.entries(mocks).map(([key,value])=>[key.slice(4,5).toLowerCase()+key.slice(5),value]));

test('Inicio comparte cobertura con Reportería y respeta ámbito y estados de programación',()=>{
  for(const role of ['EEII_LOCAL','ATE_REGIONAL','NIVEL_NACIONAL']){
    const dashboard=dashboardMetrics(state,role,'2026');
    const reporting=reportingMetrics(state,role,{year:'2026'});
    assert.deepEqual(dashboard.report.coverage,reporting.coverage);
    assert.deepEqual(dashboard.scheduleStates.map(x=>x.name),SCHEDULE_STATES);
    assert.ok(dashboard.realizedRate.numerator<=dashboard.realizedRate.denominator);
  }
  assert.ok(dashboardMetrics(state,'ATE_REGIONAL','2026').active.length<=dashboardMetrics(state,'NIVEL_NACIONAL','2026').active.length);
  assert.ok(dashboardMetrics(state,'ESTABLISHMENT','2026').active.every(c=>c.establishment==='CINAI Los Robles'));
  assert.ok(dashboardMetrics({...state,cases:[],timeline:[],groupAttentions:[]},'EEII_LOCAL','2026').report.coverage.percentage===null);
});

test('casos activos actuales, aperturas y cierres del período se calculan por separado',()=>{
  const cases=[{...state.cases[0],id:'A',openedAt:'2024-01-01',status:'Activo'},
    {...state.cases[0],id:'B',openedAt:'2026-02-01',closedAt:'2026-03-01',status:'Cerrado'},
    {...state.cases[0],id:'C',openedAt:'2025-01-01',closedAt:'2026-04-01',status:'Cerrado'}];
  const result=reportingMetrics({...state,cases},'EEII_LOCAL',{year:'2026'}).caseCounts;
  assert.deepEqual(result,{currentActive:1,startedInPeriod:1,closedInPeriod:2});
});

test('las tarjetas y los gráficos de Inicio se renderizan por perfil',async t=>{
  const server=await createServer({server:{middlewareMode:true},appType:'custom'});
  t.after(()=>server.close());
  const {default:Dashboard}=await server.ssrLoadModule('/src/pages/DashboardPage.jsx');
  const render=role=>renderToStaticMarkup(React.createElement(Dashboard,{state,role,onNavigate:()=>{}}));
  const establishment=render('ESTABLISHMENT');
  for(const label of ['Referencias generadas','Referencias por estado','Posibles referencias pendientes','Nueva referencia']) assert.ok(establishment.includes(label));
  assert.ok(!establishment.includes('Casos activos por prioridad'));
  const local=render('EEII_LOCAL');
  for(const label of ['Programación por estado','Casos activos por prioridad','Cobertura de atención','Antigüedad de referencias pendientes']) assert.ok(local.includes(label));
  const regional=render('ATE_REGIONAL');
  for(const label of ['Casos activos por Oficina Local','Cobertura por Oficina Local']) assert.ok(regional.includes(label));
  const national=render('NIVEL_NACIONAL');
  for(const label of ['Casos activos por Región','Cobertura por Región','Tendencia mensual de atenciones realizadas']) assert.ok(national.includes(label));
});
