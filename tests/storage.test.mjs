import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let IDBFactory;
try{({IDBFactory}=await import('fake-indexeddb'));}catch{
  const source=await fs.readFile(new URL('../tmp/test-deps/fake-indexeddb.mjs',import.meta.url),'utf8');
  const {serialize,deserialize}=await import('node:v8');
  const environment=vm.createContext({setTimeout,clearTimeout,structuredClone:x=>deserialize(serialize(x)),DOMException:class extends Error{constructor(message,name){super(message);this.name=name;}}});
  vm.runInContext(source.replace(/export\{[^}]+\};/,'this.IDBFactory=ye;'),environment);IDBFactory=environment.IDBFactory;
}
const source=await fs.readFile(new URL('../src/storage.js',import.meta.url),'utf8');
const factory=new IDBFactory(),memory=new Map();
const local={getItem:k=>memory.get(k)||null,setItem:(k,v)=>{if(v.length>1024)throw Error('QuotaExceededError');memory.set(k,v);},removeItem:k=>memory.delete(k)};
function app(indexedDB=factory,localStorage=local){const c=vm.createContext({indexedDB,localStorage});vm.runInContext(source+';this.store=LotoStorage;',c);return c.store;}
const first=app();
await first.put('editor',{project:{title:'Медиа-проект',image:'A'.repeat(7*1024*1024)},scratch:{strokes:[{points:[[.1,.2]]}]}});
const second=app(),draft=await second.editorDraft();assert.equal(draft.project.image.length,7*1024*1024);assert.equal(draft.scratch.strokes.length,1);
const initial={value:1};const a=second.put('ordered',initial);initial.value=10;const b=second.put('ordered',{value:2});await Promise.all([a,b]);assert.equal((await app().get('ordered')).value,2);
const snapshot={value:3};const c=second.put('snapshot',snapshot);snapshot.value=9;await c;assert.equal((await app().get('snapshot')).value,3);
await assert.rejects(app(null,{getItem:()=>null,setItem:()=>{throw Error('QuotaExceededError');},removeItem:()=>{}}).put('x',{data:'a'.repeat(2000)}));
const fallback=app(null);await fallback.put('fallback',{value:7});assert.equal((await app(null).get('fallback')).value,7);
console.log('✓ IndexedDB: черновик 7 МБ при переполненном localStorage, восстановление рисунка, порядок записей и снимок данных.');
console.log('✓ Резервное хранилище и честная ошибка при отказе обоих способов.');
