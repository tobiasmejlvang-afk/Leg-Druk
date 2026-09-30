import { CARDS, PACKS } from './data.js';
export const STORAGE_KEY = 'leg-druk.session.v1';
export function uid() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function randomInt(max, rng = Math.random) { return Math.min(max - 1, Math.floor(rng() * max)); }
export function newState() {
 return { version:1, players:[], active:0, round:1, turn:0, rounds:5, engine:'slots', pack:'party', level:2, started:false, paused:false, finished:false, board:[], history:[], used:[], result:null, chain:[], customCards:[], settings:{sound:false,motion:true,alcohol:false,theme:'neon',autoTheme:true,smart:true}, stats:{skipped:0,wildcards:0}, category:'all' };
}
export function normalizeState(value) {
 const base = newState();
 if (!value || value.version !== 1 || !Array.isArray(value.players)) return base;
 const players = value.players.filter(p => p && typeof p.name === 'string' && typeof p.id === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(p.id)).slice(0,16).map(p => ({id:p.id,name:p.name.trim().slice(0,24)})).filter(p=>p.name);
 const cardValid = c => c && typeof c.id==='string' && /^[a-zA-Z0-9-]{1,100}$/.test(c.id) && typeof c.title==='string' && typeof c.text==='string' && ['challenge','question','group','bonus','wildcard'].includes(c.category) && Number.isInteger(c.level) && c.level>=1 && c.level<=5 && (!c.nextEngine || ['slots','dice','roulette','cards','mystery'].includes(c.nextEngine)) && (c.seconds===undefined || Number.isInteger(c.seconds) && c.seconds>=0 && c.seconds<=3600);
 const board = (Array.isArray(value.board)?value.board:[]).filter(c=>c && cardValid(c.card) && typeof c.id==='string' && /^[a-zA-Z0-9-]{1,100}$/.test(c.id)).slice(0,500).map(c=>({...c,done:!!c.done,playerId:players.some(p=>p.id===c.playerId)?c.playerId:players[0]?.id}));
 return { ...base, players, active:players.length ? Math.max(0,Math.min(players.length-1,Math.floor(Number(value.active))||0)) : 0,
 round:Math.max(1,Math.min(50,Math.floor(Number(value.round))||1)), turn:Math.max(0,Number(value.turn)||0),rounds:[3,5,10,20].includes(value.rounds)?value.rounds:5,
 engine:['slots','dice','roulette','cards','mystery','random'].includes(value.engine)?value.engine:'slots',pack:PACKS.some(p=>p.id===value.pack)?value.pack:'party',
 level:Math.max(1,Math.min(5,Math.floor(Number(value.level))||2)),started:!!value.started&&players.length>=2, paused:!!value.paused,finished:!!value.finished,
 board, history:(Array.isArray(value.history)?value.history:[]).filter(h=>h&&typeof h.id==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(h.id)&&cardValid(h.card)).slice(0,500),used:(Array.isArray(value.used)?value.used:[]).filter(id=>typeof id==='string').slice(0,1000),
 result:value.result&&typeof value.result.id==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(value.result.id)&&cardValid(value.result.card)?value.result:null,chain:Array.isArray(value.chain)?value.chain.filter(s=>typeof s==='string').slice(0,8):[],
 customCards:(Array.isArray(value.customCards)?value.customCards:[]).filter(cardValid).slice(0,200),
 settings:{sound:!!value.settings?.sound,motion:value.settings?.motion!==false,alcohol:!!value.settings?.alcohol,theme:['neon','red','chaos','chrome'].includes(value.settings?.theme)?value.settings.theme:'neon',autoTheme:value.settings?.autoTheme!==false,smart:value.settings?.smart!==false},
 stats:{skipped:Math.max(0,Number(value.stats?.skipped)||0),wildcards:Math.max(0,Number(value.stats?.wildcards)||0)},category:['challenge','question','group','bonus','wildcard'].includes(value.category)?value.category:'all' };
}
export function cardPool(state) { return [...CARDS,...state.customCards].filter(c => (c.pack===state.pack || c.pack==='all') && c.level<=state.level && (state.category==='all'||c.category===state.category)); }
export function drawCard(state, preferredCategory, rng=Math.random) {
 let pool = cardPool(state);
 if (!pool.length) return null;
 if (state.settings.smart) {
  const unseen = pool.filter(c=>!state.used.includes(c.id));
  if (unseen.length) pool=unseen;
  else state.used=state.used.filter(id=>!pool.some(c=>c.id===id));
 }
 const preferred=pool.filter(c=>c.category===preferredCategory);
 if(preferred.length) pool=preferred;
 else if(state.settings.smart && !preferredCategory) {
  const counts=Object.fromEntries(['challenge','question','group','bonus','wildcard'].map(cat=>[cat,state.history.filter(h=>h.playerId===state.players[state.active]?.id && h.card.category===cat).length]));
  const minimum=Math.min(...pool.map(c=>counts[c.category]));
  pool=pool.filter(c=>counts[c.category]===minimum);
 }
 const card=pool[randomInt(pool.length,rng)];
 state.used.push(card.id);
 return card;
}
export function recordResult(state,card,engine) {
 const result={id:uid(),card:{...card},playerId:state.players[state.active].id,playerName:state.players[state.active].name,round:state.round,engine,createdAt:Date.now()};
 state.history.unshift(result);state.history=state.history.slice(0,500);state.result=result;
 if(card.category==='wildcard') state.stats.wildcards++;
 return result;
}
export function advanceTurn(state,skipped=false) {
 if(skipped) state.stats.skipped++;
 state.result=null;state.chain=[];state.turn++;
 state.active=(state.active+1)%state.players.length;
 if(state.active===0) state.round++;
 if(state.round>state.rounds) {state.finished=true;state.round=state.rounds;}
 return state;
}
export function beginSession(state,names,rounds=5) {
 const clean = names.map(n=>n.trim().slice(0,24)).filter(Boolean);
 const unique = clean.filter((n,i)=>clean.findIndex(x=>x.toLowerCase()===n.toLowerCase())===i);
 if(unique.length<2||unique.length>16) throw new Error('TilfÃ¸j mellem 2 og 16 forskellige spillere.');
 const fresh=newState();
 return {...fresh,players:unique.map(name=>({id:uid(),name})),rounds,pack:state.pack,engine:state.engine,level:state.level,settings:{...state.settings},customCards:[...state.customCards],started:true};
}
export function addToBoard(state,result=state.result) {
 if(!result || state.board.some(c=>c.sourceId===result.id)) return false;
 state.board.push({id:uid(),sourceId:result.id,card:{...result.card},playerId:result.playerId,done:false,round:result.round});
 return true;
}
export function moveBoardCard(state,id,offset) {
 const index=state.board.findIndex(c=>c.id===id);const next=index+offset;
 if(index<0||next<0||next>=state.board.length) return;
 [state.board[index],state.board[next]]=[state.board[next],state.board[index]];
}
export function loadState(storage) { try { return normalizeState(JSON.parse(storage.getItem(STORAGE_KEY))); } catch { return newState(); } }
export function saveState(storage,state) { try {storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;} catch {return false;} }

