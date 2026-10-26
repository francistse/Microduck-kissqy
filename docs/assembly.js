import * as T from './vendor/three.module.min.js?demo=20261013';
import {DuckView} from './duck.js?demo=20261013';
import {REFERENCE_IDS,REFERENCE_LABELS} from './calibration-reference.js?demo=20261013';
import {officialStandingDegrees,referenceAngle} from './joint-reference.js?demo=20261013';

const groups={
  all:{title:'整只小鸭',description:'先看整体连接关系，再选择腿部或头颈放大查看。',indexes:REFERENCE_IDS.map((_,i)=>i)},
  left:{title:'左腿 · 20–24',description:'从髋部到脚踝依次为 20、21、22、23、24。这里的左侧以鸭子自身为准。',indexes:[0,1,2,3,4]},
  right:{title:'右腿 · 10–14',description:'从髋部到脚踝依次为 10、11、12、13、14。可切到背面或外侧核对连接朝向。',indexes:[10,11,12,13,14]},
  head:{title:'头颈 · 30–34',description:'颈部俯仰、头部俯仰、转向、侧摆与嘴部。转到侧面查看各层关节的连接关系。',indexes:[5,6,7,8,9]},
};
const $=id=>document.getElementById(id);
let scope='all',selected=null,pose='zero',view;

class AssemblyView extends DuckView{
  async init(container,onSelect){
    await super.init(container,officialStandingDegrees,onSelect);
    this.selected=-1;
    this.scene.background=new T.Color('#eaf0e7');
    this.scene.children.filter(item=>item.type==='GridHelper').forEach(item=>{item.material.transparent=true;item.material.opacity=.18;});
    this.bodyAxes.visible=false;
    this.controls.enablePan=true;
    this.renderer.domElement.setAttribute('aria-label','小鸭三维模型；拖动旋转，双指或滚轮缩放');
    this.bodyJointScopes=this.model.bodies.map((body,index)=>{
      const chain=[];let current=index;
      while(current>=0){const entry=this.model.bodies[current];if(entry.joint>=0)chain.push(entry.joint);current=entry.parent;}
      return chain;
    });
    this.setReference('zero');
    return this;
  }
  matches(part,index){
    if(scope==='all')return true;
    const indexes=groups[scope].indexes;
    return indexes.includes(this.actual.parts[index].userData.joint)||this.bodyJointScopes?.[part.body].some(joint=>indexes.includes(joint));
  }
  update(snapshot){
    super.update(snapshot);
    if(!this.actual||!this.bodyJointScopes)return;
    const fade=$('fade-others').checked&&scope!=='all';
    this.actual.parts.forEach((mesh,index)=>{
      const relevant=this.matches(this.model.parts[index],index);
      mesh.material.transparent=fade&&!relevant;
      mesh.material.opacity=fade&&!relevant ? .13 : 1;
      mesh.material.depthWrite=!fade||relevant;
      mesh.material.depthTest=true;
      mesh.renderOrder=relevant?1:0;
      if(mesh.userData.joint===this.selected){mesh.material.emissive.setHex(0xffa540);mesh.material.emissiveIntensity=.65;}
    });
  }
  focusScope(){
    if(scope==='all'){this.view('front');return;}
    this.actual.root.updateMatrixWorld(true);
    const box=new T.Box3();
    this.actual.parts.forEach((mesh,index)=>{if(this.matches(this.model.parts[index],index))box.expandByObject(mesh);});
    if(box.isEmpty())return;
    const target=box.getCenter(new T.Vector3());
    const direction=new T.Vector3(.72,scope==='left'?1:-1,.28).normalize();
    const radius=box.getBoundingSphere(new T.Sphere()).radius;
    const vertical=T.MathUtils.degToRad(this.camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*this.camera.aspect);
    const distance=Math.max(.16,radius/Math.sin(Math.min(vertical,horizontal)/2)*1.12);
    this.initialView=null;this.overviewName=null;
    this.focus={start:performance.now(),from:this.camera.position.clone(),fromTarget:this.controls.target.clone(),to:target.clone().addScaledVector(direction,distance),target};
  }
}

function drawInspector(){
  $('part-title').textContent=groups[scope].title;
  $('part-description').textContent=groups[scope].description;
  document.querySelectorAll('[data-group]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===scope)));
  $('joint-list').replaceChildren(...groups[scope].indexes.map(index=>{
    const button=document.createElement('button');button.type='button';button.className='joint-button';
    button.setAttribute('aria-pressed',String(index===selected));
    button.setAttribute('aria-label',`${REFERENCE_LABELS[index]}，舵机 ID ${REFERENCE_IDS[index]}`);
    const id=document.createElement('b');id.textContent=REFERENCE_IDS[index];
    const name=document.createElement('span');name.textContent=REFERENCE_LABELS[index];
    button.append(id,name);button.addEventListener('click',()=>selectJoint(index));button.disabled=!view;
    return button;
  }));
  const detail=$('joint-detail');detail.replaceChildren();
  if(selected===null){detail.textContent='点选舵机外壳或上方关节，查看对应 ID。';return;}
  const id=REFERENCE_IDS[selected],title=document.createElement('strong');title.textContent=`${REFERENCE_LABELS[selected]} · ID ${id}`;
  const description=document.createElement('span');description.textContent=id===34?'嘴部在此模型中为固定外观，可核对位置，不能演示开合。':`当前模型参考角度：${pose==='home'?referenceAngle(officialStandingDegrees[id],2):'0'}°。高亮位置表示舵机外壳；请旋转模型核对其连接方向。`;
  detail.append(title,description);
}
function selectJoint(index){
  if(!view)return;
  selected=index;
  if(scope!=='all'&&!groups[scope].indexes.includes(index))scope=index<5?'left':index<10?'head':'right';
  view.selectJoint(index);view.focusJoint(index);drawInspector();
}
function setScope(next){
  if(!view)return;
  scope=next;selected=null;view.selected=-1;view.update({});view.focusScope();drawInspector();
}
function setPose(next){
  if(!view)return;
  pose=next;view.setReference(next);
  if(selected!==null)view.focusJoint(selected);else view.focusScope();
  $('pose-label').textContent=next==='zero'?'模型零位 · 0°':'HOME · 官方站姿参考';
  document.querySelectorAll('[data-pose]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pose===next)));
  drawInspector();
}
document.querySelectorAll('[data-group]').forEach(button=>button.addEventListener('click',()=>setScope(button.dataset.group)));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>view?.view(button.dataset.view)));
document.querySelectorAll('[data-pose]').forEach(button=>button.addEventListener('click',()=>setPose(button.dataset.pose)));
$('fade-others').addEventListener('change',()=>view?.update({}));
$('reset-view').addEventListener('click',()=>setScope('all'));
$('retry').addEventListener('click',()=>location.reload());
drawInspector();
document.querySelectorAll('[data-group],[data-view],[data-pose],#reset-view,#fade-others').forEach(button=>button.disabled=true);
try{
  const loaded=await new AssemblyView().init($('assembly-canvas'),selectJoint);view=loaded;
  $('loading').hidden=true;
  document.querySelectorAll('[data-group],[data-view],[data-pose],#reset-view,#fade-others').forEach(button=>button.disabled=false);
  view.update({});drawInspector();
}catch(error){
  $('loading').hidden=true;$('model-error').hidden=false;
  $('error-detail').textContent='请确认网络已连接，并使用支持 WebGL 的浏览器。'+(error?.message?'（'+error.message+'）':'');
}
