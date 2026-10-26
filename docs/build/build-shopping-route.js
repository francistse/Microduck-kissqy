const money=cents=>'¥'+(cents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const range=(minimum,maximum)=>minimum===maximum?money(minimum):money(minimum)+'–'+money(maximum);

/** Configure the purchase list for the route explicitly selected on the budget page. */
export function configureShopping(data){
 if(!document.getElementById('prepared-count'))return null;
 const query=new URLSearchParams(location.search);
 const printing=['own','service','buy-printer'].includes(query.get('printing'))?query.get('printing'):null;
 const diy=query.get('boards')==='diy',buyTools=diy&&query.get('tools')==='new';
 const body=data.items.reduce((sum,item)=>sum+item.subtotalCents,0);
 const assembled=body+data.boards.reduce((sum,item)=>sum+item.subtotalCents,0);
 const minimum=body+data.diyMaterialsMinCents+(buyTools?data.diyToolsMinCents:0);
 const maximum=body+data.diyMaterialsMaxCents+(buyTools?data.diyToolsMaxCents:0);
 const baseLabel=diy?range(minimum,maximum):null;
 const priced=diy?[...data.items]:[...data.boards,...data.items];
 const unpriced=buyTools?data.unpriced.filter(item=>item.id!=='hand-tools'):data.unpriced;
 const required=[...priced,...unpriced];
 const route=new URLSearchParams();
 route.set('boards',diy?'diy':'assembled');
 if(diy)route.set('tools',buyTools?'new':'owned');
 if(printing)route.set('printing',printing);
 const budget='budget.html'+(route.size?'?'+route.toString():'');
 const routeName=diy?'手工焊 HAT／IMU · '+(buyTools?'从零购买工具':'已有焊接工具'):'购买成品 HAT／IMU';
 const printingNames={own:'有打印机 · 自己打印',service:'无打印机 · 找人代打','buy-printer':'无打印机 · 买机器自己打'};
 const byId=id=>document.getElementById(id);
 const text=(tag,value)=>{const element=document.createElement(tag);element.textContent=value;return element;};
 const setText=(id,value)=>{const element=byId(id);if(element)element.textContent=value;};

 if(diy){
  const boards=byId('boards');if(boards)boards.hidden=true;
  if(buyTools)document.querySelectorAll('[data-prepared="hand-tools"]').forEach(input=>{const item=input.closest('.unpriced-item');if(item)item.hidden=true;});
  document.querySelectorAll('.toc a[href="#boards"]').forEach(link=>{link.href='#diy';link.textContent='自焊板卡材料与工具';});
  const lead=document.querySelector('.page-head .lead');if(lead)lead.textContent='当前选择手工焊板卡：先备齐下方本体零件，再按详细 BOM 准备 HAT／IMU 的 PCB、元件与焊接工具。';
  const badge=document.querySelector('.page-head .badge');if(badge)badge.textContent=buyTools?'自焊板卡 · 从零购买工具':'自焊板卡 · 已有焊接工具';
  const summary=document.querySelector('.summary-bar > div');
  if(summary){const labels=summary.querySelectorAll('small');if(labels[0])labels[0].textContent=data.items.length+' 项本体采购＋首批自焊板卡材料'+(buyTools?'＋工具预算':'');if(labels[1])labels[1].textContent='已扣除成品 HAT／IMU；打印、HUB 等待报价项目和运费另计。';}
  const panel=byId('diy');
  if(panel){
   const first=panel.querySelector('p');if(first)first.textContent='当前路线不购买成品 HAT／IMU。首批 PCB 与元件材料参考 '+range(data.diyMaterialsMinCents,data.diyMaterialsMaxCents)+'；'+(buyTools?'另计工具与耗材预算 '+range(data.diyToolsMinCents,data.diyToolsMaxCents)+'。':'已有焊接设备可复用，缺少的耗材按实际补齐。');
   let checks=byId('diy-route-checks');
   if(!checks){checks=document.createElement('div');checks.id='diy-route-checks';checks.className='unpriced-list';panel.append(checks);}
   const addCheck=(id,name,description)=>{
    required.push({id,name});
    if(checks.querySelector('[data-prepared="'+id+'"]'))return;
    const article=document.createElement('article');article.className='unpriced-item';
    const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.prepared=id;
    label.append(input,text('span',name));article.append(label,text('p',description));checks.append(article);
   };
   addCheck('diy-materials','自焊 HAT／IMU 的 PCB 与元件','按详细 BOM 准备，首批整包材料参考 '+range(data.diyMaterialsMinCents,data.diyMaterialsMaxCents)+'。');
   if(buyTools)addCheck('diy-tools','焊接工具与耗材','参考预算 '+range(data.diyToolsMinCents,data.diyToolsMaxCents)+'，同一工具不要重复计入待补配件。');
   panel.querySelectorAll('a[href="budget.html#self-solder"]').forEach(link=>{link.href=budget;link.textContent='返回当前自焊预算 →';});
  }
  const remaining=byId('remaining-total');
  if(remaining?.parentElement)remaining.parentElement.replaceChildren(document.createTextNode('未勾选的本体已列价项目参考合计：'),remaining,document.createTextNode('；自焊板卡材料、工具与待报价项目另看对应清单。'));
 }
 document.querySelectorAll('.summary-bar > a').forEach(link=>link.href=budget);
 if(diy||printing){
  setText('printing-choice-title',routeName+(printing?' ／ '+printingNames[printing]:''));
  const descriptions={
   own:'打印机已有，准备结构件与 TPU 的打印耗材，设备费不重复计入。',
   service:'向代打商购买整套打印服务，硬质件与 TPU 一并询价；不需要购买打印机。',
   'buy-printer':'另购打印机与硬质件、TPU 耗材；设备费按实际机型报价填写。',
  };
  setText('printing-choice-description',(diy?'先备齐本体零件、自焊板卡材料'+(buyTools?'和焊接工具':'')+'。':'先备齐下方成品板路线的基础零件。')+(printing?descriptions[printing]:''));
  const items=[];
  if(printing==='service')items.push('把完整打印包交给代打商，确认硬质结构件、TPU 部件和电池仓版本，取得整套报价。');
  if(printing==='buy-printer')items.push('打印机设备参考预算 '+money(data.printerReferenceCents)+'；按实际报价调整，并准备硬质件与 TPU 耗材。');
  if(printing==='own')items.push('核对打印包与材料配置，电池仓选择其中一份，按硬质件和 TPU 分别准备耗材。');
  if(diy)items.push('不购买成品 HAT／IMU；按 PCB 详细 BOM 准备材料，完成自焊 IMU 固件烧录。');
  items.push((diy?'本体＋自焊材料'+(buyTools?'＋工具预算':''):'基础零件')+'参考 '+(baseLabel||money(assembled))+'；打印'+(printing==='buy-printer'?'、打印机设备':'')+'、待报价项目与运费另计，不是最终完工总价。');
  const list=byId('printing-choice-items');if(list)list.replaceChildren(...items.map(value=>text('li',value)));
  const quote=byId('printing-choice-quote');if(quote){quote.href=budget+'#calculator';quote.textContent=printing==='service'?'填写代打报价 →':printing==='buy-printer'?'调整设备与耗材预算 →':'返回当前预算 →';}
  const firstAction=document.querySelector('#printing-choice .actions a');if(firstAction)firstAction.href=diy?'#electronics':'#boards';
  const panel=byId('printing-choice');if(panel)panel.hidden=false;
 }
 return {required,priced,baseLabel};
}
