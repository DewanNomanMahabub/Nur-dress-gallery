import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const require=createRequire(import.meta.url);const wr=createRequire(require.resolve('wrangler'));const {Miniflare}=wr('miniflare');
const mf=new Miniflare({modules:['index.js',...fs.readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js')].map(p=>({type:'ESModule',path:process.cwd()+'/dist/server/'+p,contents:fs.readFileSync('dist/server/'+p,'utf8')})),modulesRoot:process.cwd()+'/dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{ADMIN_SETUP_HASH:crypto.createHash('sha256').update('test-only').digest('hex')},serviceBindings:{ASSETS:async req=>{let path='dist/client'+new URL(req.url).pathname;try{return new Response(fs.readFileSync(path))}catch{return new Response('Not found',{status:404})}}}});
try{
const db=await mf.getD1Database('DB');const sql=fs.readFileSync('drizzle/0000_steady_arclight.sql','utf8');for(const stmt of sql.split('--> statement-breakpoint'))await db.prepare(stmt.trim()).run();
const user=(id,email)=>({'oai-authenticated-user-id':id,'oai-authenticated-user-email':email});const owner=user('owner-1','owner@example.test');
async function call(body,who={},origin='https://shop.test'){const r=await mf.dispatchFetch('https://shop.test/api/shop',{method:body?'POST':'GET',headers:{...who,...(body?{'Content-Type':'application/json',origin}:{})},body:body?JSON.stringify(body):undefined});let d;try{d=await r.json()}catch{d={error:await r.text()}}return {status:r.status,d}}
let a=await call();assert.equal(a.status,200);assert.equal(a.d.catalog.products.length,4);const catalog=a.d.catalog;
a=await call({action:'save',catalog,revision:0});assert.equal(a.status,403);
a=await call({action:'setup',code:'test-only'},owner,'https://evil.test');assert.equal(a.status,403);
a=await call({action:'setup',code:'wrong'},owner);assert.equal(a.status,403);
a=await call({action:'setup',code:'test-only'},owner);assert.equal(a.status,200);
a=await call({action:'setup',code:'test-only'},user('stranger','stranger@example.test'));assert.equal(a.status,403);
catalog.categories.push({id:'test-category',name:'Test category',bn:'পরীক্ষা',image:''});a=await call({action:'save',catalog,revision:0},owner);assert.equal(a.status,200);
a=await call();assert.equal(a.d.catalog.categories.at(-1).id,'test-category');assert.equal(a.d.revision,1);
a=await call({action:'save',catalog,revision:0},owner);assert.equal(a.status,409);
a=await call({action:'member',email:'editor@example.test',role:'editor'},owner);assert.equal(a.status,200);const editor=user('editor-1','editor@example.test');
a=await call({action:'member',email:'bad@example.test',role:'manager'},editor);assert.equal(a.status,403);
const bad=structuredClone(catalog);bad.categories=[];bad.settings.live=true;bad.offers=[{id:'unauthorized-offer',title:'Unauthorized promotion',bn:'',badge:'TEST',category:'all',active:true}];bad.products[0].name='Editor update';a=await call({action:'save',catalog:bad,revision:1},editor);assert.equal(a.status,200);
a=await call();assert.equal(a.d.catalog.settings.live,false);assert.equal(a.d.catalog.categories.length,5);assert.ok(!a.d.catalog.offers.some(o=>o.id==='unauthorized-offer'));assert.equal(a.d.catalog.products[0].name,'Editor update');
const live=a.d.catalog;live.settings.live=true;live.offers.push({id:'new-promotion',title:'Verified test promotion',bn:'বিশেষ আয়োজন',badge:'TEST OFFER',category:'abaya',active:true});a=await call({action:'save',catalog:live,revision:2},owner);assert.equal(a.status,200);
a=await call({action:'order',customer:{name:'Test Customer',phone:'01700000000',address:'Test address'},items:[{id:'aura',color:'Dusty rose',size:'54',qty:1}]});assert.equal(a.status,200);assert.ok(a.d.id.startsWith('ND-'));assert.equal(a.d.total,2590);
a=await call({action:'order',customer:{name:'Test',phone:'01700000000',address:'Test'},items:[{id:'aura',color:'Nonexistent',size:'54',qty:1}]});assert.equal(a.status,400);
const publicOffers=await call();assert.ok(publicOffers.d.catalog.offers.some(o=>o.id==='new-promotion'));const invalidOffer=structuredClone(live);invalidOffer.offers[0].title='';const invalidResult=await call({action:'save',catalog:invalidOffer,revision:3},owner);assert.equal(invalidResult.status,400);
const ar=await mf.dispatchFetch('https://shop.test/api/shop?mode=admin');assert.equal(ar.status,403);
const page=await mf.dispatchFetch('https://shop.test/');assert.equal(page.status,200);const markup=await page.text();assert.ok(markup.includes('Nur Dress Gallary'));assert.ok(markup.includes('Verified test promotion'));assert.ok(markup.includes('offers-track'));
const admin=await mf.dispatchFetch('https://shop.test/admin');assert.equal(admin.status,200);assert.ok((await admin.text()).includes('Sign in with ChatGPT'));
console.log('PASS: storefront rendering; private admin gate; origin checks; owner setup; duplicate setup denial; role enforcement; category persistence; editor restrictions; revision conflict; order persistence; variant validation; offer persistence; editor offer restriction; offer validation; server-rendered offer ribbon.');
}finally{await mf.dispose()}
