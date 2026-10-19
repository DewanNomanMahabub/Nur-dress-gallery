import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
import {initialCatalog,defaultOffers} from './catalog';
export const database=()=>{if(!env.DB)throw new Error('Database unavailable');return env.DB};
export async function catalog(){const r:any=await database().prepare("SELECT data,revision FROM records WHERE id='catalog'").first();return r?{catalog:{...JSON.parse(r.data),offers:JSON.parse(r.data).offers??defaultOffers},revision:r.revision}:{catalog:initialCatalog,revision:0};}
export async function identity(){const u=await getChatGPTUser();if(!u)return null;const m:any=await database().prepare('SELECT * FROM members WHERE email=?').bind(u.email.toLowerCase()).first();if(!m||m.user_id&&m.user_id!==u.userId)return null; if(!m.user_id)await database().prepare('UPDATE members SET user_id=? WHERE email=? AND user_id IS NULL').bind(u.userId,u.email.toLowerCase()).run();return {...u,role:m.role};}
export function sameOrigin(r:Request){const origin=r.headers.get('origin');return origin===new URL(r.url).origin;}
export const json=(d:any,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
