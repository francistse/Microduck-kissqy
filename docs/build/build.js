const storageKey='microduck-build-v1';
const money=cents=>'¥'+(cents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
function readState(){const result={costs:{},prepared:[]};try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object'){result.costs=saved.costs&&typeof saved.costs==='object'?saved.costs:{};result.prepared=Array.isArray(saved.prepared)?saved.prepared.filter(x=>typeof x==='string'):[];}}catch{}return result;}
let state=readState();
const save=field=>{try{const latest=readState();latest[field]=state[field];localStorage.setItem(storageKey,JSON.stringify(latest));}catch{}};
const priceInput=key=>{const raw=state.costs[key];if(raw===undefined||raw==='')return null;const number=Number(raw);return Number.isFinite(number)&&number>=0&&number<=1000000?Math.round(number*100):null;};
let data;
try{const response=await fetch(new URL('./data.json?v=20261027-wires',import.meta.url));if(response.ok)data=await response.json();}catch{}
if(data){
 const body=data.items.reduce((sum,item)=>sum+item.subtotalCents,0),boards=data.boards.reduce((sum,item)=>sum+item.subtotalCents,0),assembled=body+boards;
 const plans=[{id:'own',fields:['ownPrint','extras','shipping']},{id:'service',fields:['printService','extras','shipping'],quote:'printService',quoteText:'待填代打报价'},{id:'buy-printer',fields:['printer','ownPrint','extras','shipping'],quote:'printer',quoteText:'待填打印机价格'}];
 const names={ownPrint:'打印耗材',printService:'代打费用',printer:'打印机设备费',extras:'待补配件',shipping:'运费与零星费用'};
 const defaultValues={printer:String(data.printerReferenceCents/100)};
 const cost=key=>key==='printer'&&state.costs[key]===undefined?data.printerReferenceCents:priceInput(key);
 function updateBudget(){
  plans.forEach(plan=>{const card=document.querySelector('[data-plan="'+plan.id+'"]');if(!card)return;const values=plan.fields.map(cost),addition=values.reduce((s,v)=>s+(v??0),0),needsQuote=plan.quote&&cost(plan.quote)===null,price=card.querySelector('[data-price]');price.textContent=needsQuote?plan.quoteText:money(assembled+addition);price.classList.toggle('quote-needed',!!needsQuote);const missing=plan.fields.filter((_,i)=>values[i]===null);card.querySelector('[data-pending]').textContent=needsQuote?(plan.id==='service'?'填入整套代打报价后计算；无需购买打印机。':'填入设备价格后计算这一档预算。'):missing.length?'＋待补：'+missing.map(x=>names[x]).join('、'):'已含你填写的补充预算';});
  document.querySelectorAll('[data-base-total]').forEach(el=>el.textContent=money(assembled));
  const hint=document.getElementById('budget-state');if(hint)hint.textContent=Object.values(state.costs).some(x=>x!=='')?'已按打印方式更新预算并保存在这台设备。设备费只计入“买机器自己打”，代打费只计入“找人代打”。':'打印机设备费按参考 ¥3500 预填，可改为实际报价；代打未报价时不展示总额。其他待补费用另计。';
 }
 document.querySelectorAll('[data-cost]').forEach(input=>{const key=input.dataset.cost;input.value=state.costs[key]??defaultValues[key]??'';input.addEventListener('input',()=>{state.costs[key]=input.value;save('costs');updateBudget();});});
 document.getElementById('reset-budget')?.addEventListener('click',()=>{state.costs={};save('costs');document.querySelectorAll('[data-cost]').forEach(input=>input.value=defaultValues[input.dataset.cost]??'');updateBudget();});
 const required=[...data.boards,...data.items,...data.unpriced],byId=new Map(required.map(item=>[item.id,item]));
 function updatePrepared(){
  const done=new Set(state.prepared.filter(id=>byId.has(id)));
  document.querySelectorAll('[data-prepared]').forEach(input=>{input.checked=done.has(input.dataset.prepared);input.closest('tr')?.classList.toggle('prepared-row',input.checked);});
  const count=document.getElementById('prepared-count');if(count)count.textContent=done.size+' / '+required.length+' 项已备齐';
  const bar=document.getElementById('prepared-bar');if(bar)bar.style.width=(done.size/required.length*100)+'%';
  const left=[...data.boards,...data.items].filter(item=>!done.has(item.id)).reduce((sum,item)=>sum+item.subtotalCents,0),total=document.getElementById('remaining-total');if(total)total.textContent=money(left);
 }
 document.querySelectorAll('[data-prepared]').forEach(input=>input.addEventListener('change',()=>{const done=new Set(state.prepared);input.checked?done.add(input.dataset.prepared):done.delete(input.dataset.prepared);state.prepared=[...done];save('prepared');updatePrepared();}));
 document.getElementById('reset-prepared')?.addEventListener('click',()=>{state.prepared=[];save('prepared');updatePrepared();});
 function refreshSavedState(){state=readState();document.querySelectorAll('[data-cost]').forEach(input=>input.value=state.costs[input.dataset.cost]??defaultValues[input.dataset.cost]??'');updateBudget();updatePrepared();}
 window.addEventListener('pageshow',event=>{if(event.persisted)refreshSavedState();});
 window.addEventListener('storage',event=>{if(event.key===storageKey)refreshSavedState();});
 updateBudget();updatePrepared();
}
document.getElementById('print-list')?.addEventListener('click',()=>window.print());
