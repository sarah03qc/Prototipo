import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAssistantContext } from '../server/assistantContextSelection.js';
import { buildAssistantContext } from '../src/utils/assistantContext.js';
import * as mocks from '../src/data/mockData.js';
const state=Object.fromEntries(Object.entries(mocks).map(([key,value])=>[key.slice(4,5).toLowerCase()+key.slice(5),value]));
const context=buildAssistantContext(state,'EEII_LOCAL');
const select=(question,previous=[])=>selectAssistantContext(context,[...previous.map(text=>({role:'user',text})),{role:'user',text:question}]);
test('person questions retain all authorized profiles including guardian contact',()=>{
 const selected=select('¿Quién es la persona encargada de esta menor?');
 assert.deepEqual(selected.clientesBeneficiarias,context.clientesBeneficiarias);
 assert.ok(!('lineaTiempo' in selected));
});
test('each operational topic retains the entire relevant collection with original fields',()=>{
 for(const [key,question] of Object.entries({referencias:'¿Cuál es el consecutivo de la referencia?',casosAI:'¿Qué riesgo, protección y prioridad tiene el caso?',sesiones:'¿Cuándo es la próxima sesión?',lineaTiempo:'Ver línea de tiempo',atencionesGrupales:'¿Quiénes participaron en la atención grupal?',documentos:'¿Cuáles documentos hay?',coordinaciones:'¿Hay coordinaciones?',reportes:'¿Qué reportes existen?',programacion:'¿Cuáles actividades hay programadas?',traslados:'¿Hay traslados pendientes de continuidad?'})) assert.deepEqual(select(question)[key],context[key],key);
});
test('follow-up inherits explicit topic and mixed questions include all matched subjects',()=>{
 assert.deepEqual(select('¿Cuál es su estado?',['¿Cuál es la referencia?']).referencias,context.referencias);
 const selected=select('¿Qué referencias y casos tiene?');
 assert.deepEqual(selected.referencias,context.referencias);
 assert.deepEqual(selected.casosAI,context.casosAI);
});
test('topic selection cannot expand authorization or mutate the source context',()=>{
 const restricted=buildAssistantContext(state,'ESTABLISHMENT_ASSISTANT2');
 const selected=selectAssistantContext(restricted,[{role:'user',text:'¿Qué prioridad tiene el caso y cuál es su línea de tiempo?'}]);
 assert.deepEqual(selected.lineaTiempo,[]);
 assert.ok(selected.casosAI.every(c=>'prioridad' in c && !('nivelRiesgo' in c) && !('nivelProteccion' in c)));
 const copy=structuredClone(context);
 select('¿Cuáles actividades hay programadas?');
 assert.deepEqual(context,copy);
});
