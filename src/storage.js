/* IndexedDB accepts media-rich drafts; localStorage remains a fallback. */
const LotoStorage = (() => {
  let opening;
  function database(){if(!opening)opening=new Promise((resolve,reject)=>{if(typeof indexedDB==='undefined')return reject(Error('IndexedDB unavailable'));const request=indexedDB.open('loto-studio',1);request.onupgradeneeded=()=>request.result.createObjectStore('drafts');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Storage blocked'));}).catch(error=>{opening=null;throw error;});return opening;}
  async function readIDB(key){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readonly'),r=tx.objectStore('drafts').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function writeIDB(key,record){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(record,key);tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||Error('Storage failed'));});}
  const localKey=key=>'loto-draft-v2:'+key;
  async function get(key){let primary=null,fallback=null;try{primary=await readIDB(key);}catch{}try{fallback=JSON.parse(localStorage.getItem(localKey(key))||'null');}catch{}return (!primary||fallback?.savedAt>primary.savedAt?fallback:primary)?.data??null;}
  let serial=Promise.resolve(),lastStamp=0;
  function put(key,data){const record={savedAt:(lastStamp=Math.max(Date.now(),lastStamp+1)),data:JSON.parse(JSON.stringify(data))};const operation=serial.catch(()=>{}).then(async()=>{try{await writeIDB(key,record);try{localStorage.removeItem(localKey(key));}catch{}return 'indexeddb';}catch(error){try{localStorage.setItem(localKey(key),JSON.stringify(record));return 'local';}catch{throw Error('Браузер не смог сохранить черновик. Скачайте проект кнопкой «Сохранить проект».');}}});serial=operation;return operation;}
  async function editorDraft(){const draft=await get('editor');if(draft)return draft;try{const p=JSON.parse(localStorage.getItem('loto-studio-v1')||'null');return p?{project:p,scratch:null}:null;}catch{return null;}}
  function isDraft(p){return p?.version===1&&p.design&&p.hero&&p.rules&&p.screens&&Array.isArray(p.questions)&&Array.isArray(p.tickets)&&p.questions.every(q=>q&&typeof q.id==='string'&&Array.isArray(q.options)&&q.options.every(o=>o&&typeof o.id==='string')&&Array.isArray(q.answers))&&p.tickets.every(t=>t&&typeof t.id==='string'&&Array.isArray(t.cells)&&Number.isInteger(t.cols)&&Number.isInteger(t.rows));}
  return {get,put,editorDraft,isDraft};
})();
