const storageKey='microduck-build-v1';
const money=cents=>'¥'+(cents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
let state={costs:{},prepared:[]};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object'){state.costs=saved.costs&&typeof saved.costs==='object'?saved.costs:{};state.prepared=Array.isArray(saved.prepared)?saved.prepared.filter(x=>typeof x==='string'):[];}}catch{}
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}};
const priceInput=key=>{const raw=state.costs[key];if(raw===undefined||raw==='')return null;const number=Number(raw);return Number.isFinite(number)&&number>=0&&number<=1000000?Math.round(number*100):null;};
let data;
try{const response=await fetch(new URL('./data.json?v=20261027-journey',import.meta.url));if(response.ok)data=await response.json();}catch{}
if(data){
 const body=data.items.reduce((sum,item)=>sum+item.subtotalCents,0),boards=data.boards.reduce((sum,item)=>sum+item.subtotalCents,0),assembled=body+boards;
 const plans=[{id:'own',fields:['ownPrint','extras','shipping'],min:assembled,max:assembled},{id:'service',fields:['printService','extras','shipping'],min:assembled,max:assembled},{id:'diy',fields:['ownPrint','extras','shipping'],min:body+data.diyMaterialsMinCents+data.diyToolsMinCents,max:body+data.diyMaterialsMaxCents+data.diyToolsMaxCents}];
 const names={ownPrint:'打印耗材',printService:'代打费用',extras:'待补配件',shipping:'运费与零星费用'};
 function updateBudget(){
  plans.forEach(plan=>{const card=document.querySelector('[data-plan="'+plan.id+'"]');if(!card)return;const values=plan.fields.map(priceInput),addition=values.reduce((s,v)=>s+(v??0),0),min=plan.min+addition,max=plan.max+addition;card.querySelector('[data-price]').textContent=min===max?money(min):money(min)+'–'+money(max).replace('¥','');const missing=plan.fields.filter((_,i)=>values[i]===null);card.querySelector('[data-pending]').textContent=missing.length?'＋待补：'+missing.map(x=>names[x]).join('、'):'已含你填写的补充预算';});
  document.querySelectorAll('[data-base-total]').forEach(el=>el.textContent=money(assembled));
  const hint=document.getElementById('budget-state');if(hint)hint.textContent=Object.values(state.costs).some(x=>x!=='')?'金额已更新并保存在这台设备；工具与打印机仍按下面的范围单独核对。':'待报价费用尚未填写。上方金额是已列价采购参考，不是最终到手总额。';
 }
 document.querySelectorAll('[data-cost]').forEach(input=>{const key=input.dataset.cost;input.value=state.costs[key]??'';input.addEventListener('input',()=>{state.costs[key]=input.value;save();updateBudget();});});
 document.getElementById('reset-budget')?.addEventListener('click',()=>{state.costs={};save();document.querySelectorAll('[data-cost]').forEach(input=>input.value='');updateBudget();});
 const required=[...data.boards,...data.items,...data.unpriced],byId=new Map(required.map(item=>[item.id,item]));
 function updatePrepared(){
  const done=new Set(state.prepared.filter(id=>byId.has(id)));
  document.querySelectorAll('[data-prepared]').forEach(input=>{input.checked=done.has(input.dataset.prepared);input.closest('tr')?.classList.toggle('prepared-row',input.checked);});
  const count=document.getElementById('prepared-count');if(count)count.textContent=done.size+' / '+required.length+' 项已备齐';
  const bar=document.getElementById('prepared-bar');if(bar)bar.style.width=(done.size/required.length*100)+'%';
  const left=[...data.boards,...data.items].filter(item=>!done.has(item.id)).reduce((sum,item)=>sum+item.subtotalCents,0),total=document.getElementById('remaining-total');if(total)total.textContent=money(left);
 }
 document.querySelectorAll('[data-prepared]').forEach(input=>input.addEventListener('change',()=>{const done=new Set(state.prepared);input.checked?done.add(input.dataset.prepared):done.delete(input.dataset.prepared);state.prepared=[...done];save();updatePrepared();}));
 document.getElementById('reset-prepared')?.addEventListener('click',()=>{state.prepared=[];save();updatePrepared();});
 updateBudget();updatePrepared();
}
document.getElementById('print-list')?.addEventListener('click',()=>window.print());
