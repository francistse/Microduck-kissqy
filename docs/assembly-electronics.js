import * as T from './vendor/three.module.min.js?demo=20261013';

// These are simplified visual boards, not fabrication models or a fit check.
// HAT/IMU outlines: repository PCB documentation; Zero: Radxa Zero 3 docs.
// HUB outline and nets: user's DXL_HUB_notch_14-22_symmetric.epro2 project.
export const ELECTRONICS_LAYOUT=Object.freeze({
  hat:Object.freeze({name:'HAT',width:.065,height:.0309,color:0x208778,location:'head',outline:'documented'}),
  zero:Object.freeze({name:'ZERO 3W',width:.065,height:.030,color:0x286d9a,location:'head',outline:'documented'}),
  imu:Object.freeze({name:'IMU',width:.0227,height:.0256,color:0x8b61a5,location:'torso',outline:'documented'}),
  hub:Object.freeze({name:'HUB',width:.023,height:.034,color:0xb78142,location:'torso',outline:'documented'}),
});
export const ELECTRONICS_WIRES=Object.freeze([
  Object.freeze({id:'hat-zero',label:'HAT J4 ↔ ZERO 3W · 40 针排针',color:'#8366b4'}),
  Object.freeze({id:'hat-bus',label:'HAT ↔ 舵机总线',color:'#e3873f'}),
  Object.freeze({id:'imu-bus',label:'IMU ↔ 舵机总线',color:'#369a9a'}),
  Object.freeze({id:'battery-hub',label:'总电源 → HUB CN1（GND / VIN）',color:'#d9695d'}),
  Object.freeze({id:'hub-bus',label:'HUB ↔ 舵机总线（信号名配对）',color:'#d3a645'}),
]);

const COVER_MESH_INDEX=21; // top_head_shell in the frozen manifest.
const PCB_THICKNESS=.0016;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function boxMesh(width,height,depth,color){
  return new T.Mesh(new T.BoxGeometry(width,height,depth),new T.MeshStandardMaterial({color,roughness:.72,metalness:.08}));
}
function addBox(parent,width,height,depth,color,x=0,y=0,z=0){
  const mesh=boxMesh(width,height,depth,color);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
function addBoardText(parent,text,width,height){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.clearRect(0,0,512,160);ctx.font='700 56px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffffe8';ctx.fillText(text,256,80,480);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));
  mesh.position.z=PCB_THICKNESS/2+.00012;parent.add(mesh);return mesh;
}
function makeBoard(id,spec){
  const {width,height}=spec,group=new T.Group();
  group.name=`assembly-${id}`;group.userData.component=id;
  const pcb=addBox(group,width,height,PCB_THICKNESS,spec.color);pcb.userData.component=id;
  // Holes/chips/connectors are visual shorthand, never a PCB placement reference.
  if(id!=='hub')addBox(group,width*.24,height*.38,.0018,0x263532,0,0,.0017);
  const text=addBoardText(group,spec.name,width*.84,height*.26);if(text)text.position.y=-height*.25;
  if(id==='zero'){
    addBox(group,.008,.008,.003,0xc1c9c6,width*.41,height*.24,.0022);
    addBox(group,.007,.010,.003,0xc1c9c6,width*.41,-height*.21,.0022);
    addBox(group,width*.72,.005,.004,0x263431,-width*.02,height*.38,.003);
  }else if(id==='hat'){
    addBox(group,width*.72,.005,.004,0x263431,-width*.02,height*.38,-.003);
    addBox(group,.008,.006,.004,0xe9e1c6,width*.36,-height*.26,.0025);
    addBox(group,.008,.006,.004,0xe9e1c6,width*.18,-height*.26,.0025);
  }else if(id==='imu'){
    addBox(group,.006,.007,.004,0xe9e1c6,width*.32,0,.0025);
  }else{
    // The actual HUB has one 2P input, four common 3P outputs and C1.
    // Connector/component placement here remains schematic, not a pin-view.
    addBox(group,.007,.004,.004,0xe9e1c6,0,height*.33,.0026);
    for(const side of [-1,1])for(const y of [-.003,.007])addBox(group,.004,.007,.004,0xe9e1c6,side*width*.35,y,.0026);
    const capacitor=new T.Mesh(new T.CylinderGeometry(.0038,.0038,.010,16),new T.MeshStandardMaterial({color:0x313f43,metalness:.25,roughness:.5}));
    capacitor.rotation.x=Math.PI/2;capacitor.position.set(0,-height*.24,-.006);group.add(capacitor);
    const capTop=new T.Mesh(new T.CircleGeometry(.0037,16),new T.MeshStandardMaterial({color:0xcbd3d0,metalness:.5,roughness:.5}));
    capTop.rotation.y=Math.PI;capTop.position.set(0,-height*.24,-.0111);group.add(capTop);
    for(const x of [-.0095,.0095])for(const y of [-.015,.015]){
      const hole=new T.Mesh(new T.RingGeometry(.0012,.0019,12),new T.MeshBasicMaterial({color:0xe1cb7d,side:T.DoubleSide}));hole.position.set(x,y,PCB_THICKNESS/2+.00005);group.add(hole);
    }
  }
  group.traverse(mesh=>{if(mesh.isMesh)mesh.userData.component=id;});
  return {id,spec,group,pcb,width,height,visible:true,label:null};
}

/** Add schematic electronics only to the standalone assembly viewer instance.
 * UI owns the explanatory data and purchase links. Selecting in the scene calls
 * onSelect(id); programmatic select(id) does not call it again.
 */
export function attachElectronics(view,onSelect=()=>{}){
  if(!view?.actual?.parts||!view?.model?.parts)throw Error('装配结构模型尚未加载');
  const root=view.actual.root,container=view.container,canvas=view.renderer.domElement;
  const coverIndex=view.model.parts.findIndex(p=>p.mesh===COVER_MESH_INDEX);
  const cover=view.actual.parts[coverIndex];
  if(!cover||view.model.parts[coverIndex].body!==9)throw Error('头盖定位与冻结模型不一致');
  root.updateMatrixWorld(true);
  const headParent=cover.parent,trunk=view.actual.bodies[0];
  const coverRest=cover.position.clone(),coverOpacity=cover.material.opacity;
  const coverWorldBox=new T.Box3().setFromObject(cover),headCenter=coverWorldBox.getCenter(new T.Vector3());
  const headSize=coverWorldBox.getSize(new T.Vector3());
  const torsoBox=new T.Box3();[1,2,5].forEach(index=>torsoBox.expandByObject(view.actual.parts[index]));
  const torsoCenter=torsoBox.getCenter(new T.Vector3());
  // Offsets are illustrative packing positions, explicitly labelled in the UI.
  // They do not claim a verified mount, clearance, socket orientation or routing.
  const positions={
    zero:new T.Vector3(headCenter.x+.004,headCenter.y-.017,coverWorldBox.min.z+.017),
    hat:new T.Vector3(headCenter.x+.004,headCenter.y-.017,coverWorldBox.min.z+.029),
    imu:new T.Vector3(torsoBox.min.x-.001,torsoCenter.y,torsoCenter.z+.003),
    hub:new T.Vector3(torsoBox.min.x-.002,torsoCenter.y,torsoBox.min.z+.008),
  };
  const components=new Map(),boardTargets=[];
  const worldFlat=new T.Quaternion(),torsoVertical=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2);
  const originalUpdate=view.update,originalAdvanceFocus=view.advanceFocus;
  let disposed=false,selected=null,wiringVisible=false,coverOpen=false,coverAmount=0,coverFrom=0,coverTo=0,coverStarted=0;
  let coverBaseOpacity=coverOpacity,coverBaseTransparent=cover.material.transparent,coverBaseDepthWrite=cover.material.depthWrite;
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const coverUp=new T.Vector3(0,0,1).applyQuaternion(headParent.getWorldQuaternion(new T.Quaternion()).invert()).normalize();
  const coverLift=clamp(headSize.z*1.3,.045,.075);

  for(const [id,spec]of Object.entries(ELECTRONICS_LAYOUT)){
    const component=makeBoard(id,spec),parent=spec.location==='head'?headParent:trunk;
    parent.add(component.group);
    component.group.position.copy(parent.worldToLocal(positions[id].clone()));
    component.group.quaternion.copy(parent.getWorldQuaternion(new T.Quaternion()).invert()).multiply(spec.location==='head'?worldFlat:torsoVertical);
    component.group.traverse(object=>{if(object.isMesh)boardTargets.push(object);});
    const label=document.createElement('button');label.type='button';label.className='electronics-label';
    label.textContent=spec.name;label.setAttribute('aria-label',`查看 ${id==='zero'?'Radxa ZERO 3W':spec.name}`);
    Object.assign(label.style,{position:'absolute',zIndex:'3',transform:'translate(-50%,-50%)',border:'1px solid #ffffffd9',borderRadius:'7px',padding:'4px 7px',background:'#143c36e8',color:'#fffdf2',font:'650 10px system-ui,sans-serif',boxShadow:'0 2px 9px #143c3625',whiteSpace:'nowrap',cursor:'pointer'});
    label.addEventListener('click',()=>{api.select(id);onSelect(id);});container.append(label);component.label=label;
    components.set(id,component);
  }

  // The bus anchor is a schematic routing node, not a real physical connector.
  const busAnchor=new T.Object3D();busAnchor.position.copy(trunk.worldToLocal(new T.Vector3(torsoCenter.x+.024,torsoCenter.y,torsoBox.max.z+.013)));trunk.add(busAnchor);
  // This point denotes the external supply, not a claimed battery mount.
  const powerNode=new T.Mesh(new T.SphereGeometry(.0024,10,8),new T.MeshBasicMaterial({color:0xd9695d}));
  powerNode.position.copy(trunk.worldToLocal(positions.hub.clone().add(new T.Vector3(-.028,-.026,-.006))));trunk.add(powerNode);powerNode.visible=false;
  const wireRoot=new T.Group();wireRoot.name='assembly-wiring-schematic';root.add(wireRoot);wireRoot.visible=false;
  const wires=ELECTRONICS_WIRES.map(spec=>{
    const material=new T.MeshStandardMaterial({color:spec.color,roughness:.55,metalness:.08});
    const mesh=new T.Mesh(new T.BufferGeometry(),material);mesh.name=spec.id;wireRoot.add(mesh);return {...spec,mesh,last:null};
  });
  const notice=document.createElement('span');notice.className='electronics-scene-note';notice.textContent='内部位置与线束为示意';
  Object.assign(notice.style,{position:'absolute',left:'12px',top:'10px',zIndex:'2',font:'600 10px system-ui,sans-serif',color:'#75633c',background:'#fff7dded',padding:'5px 8px',borderRadius:'8px',pointerEvents:'none'});container.append(notice);

  const worldPosition=(id)=>components.get(id).group.getWorldPosition(new T.Vector3());
  function updateWires(){
    if(!wiringVisible)return;
    root.updateMatrixWorld(true);
    const hat=worldPosition('hat'),zero=worldPosition('zero'),imu=worldPosition('imu'),hub=worldPosition('hub'),bus=busAnchor.getWorldPosition(new T.Vector3()),power=powerNode.getWorldPosition(new T.Vector3());
    const endpoints={'hat-zero':[hat,zero],'hat-bus':[hat,bus],'imu-bus':[imu,bus],'battery-hub':[power,hub],'hub-bus':[hub,bus]};
    powerNode.visible=wiringVisible&&components.get('hub').visible;
    for(const wire of wires){
      const [a,b]=endpoints[wire.id];
      wire.mesh.visible=wire.id==='hat-zero'?components.get('hat').visible&&components.get('zero').visible:components.get(wire.id==='hat-bus'?'hat':wire.id==='imu-bus'?'imu':'hub').visible;
      const signature=[...a.toArray(),...b.toArray()].map(x=>x.toFixed(6)).join(',');
      if(signature===wire.last)continue;wire.last=signature;
      const start=root.worldToLocal(a.clone()),end=root.worldToLocal(b.clone());
      const middle=start.clone().lerp(end,.5);
      if(wire.id==='hat-zero'){middle.y-=.012;middle.x-=.008;}else if(wire.id==='battery-hub'){middle.y-=.007;middle.x-=.005;}else{middle.x+=.026;middle.y-=.020;}
      const curve=new T.CatmullRomCurve3([start,middle,end]);
      const geometry=new T.TubeGeometry(curve,24,.00085,6,false);
      wire.mesh.geometry.dispose();wire.mesh.geometry=geometry;
    }
  }
  function updateLabels(){
    view.camera.updateMatrixWorld(true);
    const width=container.clientWidth,height=container.clientHeight;
    components.forEach(component=>{
      const hiddenInHead=component.spec.location==='head'&&coverAmount<.5;
      const point=component.group.localToWorld(new T.Vector3(0,component.height*.50,.006)).project(view.camera);
      component.label.hidden=!component.visible||hiddenInHead||point.z< -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;
      component.label.style.left=`${(point.x+1)*width/2}px`;component.label.style.top=`${(1-point.y)*height/2}px`;
      component.label.style.background=component.id===selected?'#d97b37ed':'#143c36e8';
      component.label.setAttribute('aria-pressed',String(component.id===selected));
    });
    notice.hidden=![...components.values()].some(c=>c.visible)&&!coverOpen&&!wiringVisible;
  }
  function updateCover(now=performance.now()){
    const progress=reducedMotion?1:clamp((now-coverStarted)/360,0,1),ease=progress*progress*(3-2*progress);
    coverAmount=T.MathUtils.lerp(coverFrom,coverTo,ease);
    if(progress===1)coverFrom=coverTo;
    cover.position.copy(coverRest).addScaledVector(coverUp,coverLift*coverAmount);
    // A translucent raised lid lets the viewer read the inside while retaining
    // the real shell and orientation; other head parts remain unchanged.
    cover.material.transparent=coverBaseTransparent||coverAmount>0.001;cover.material.opacity=coverBaseOpacity*T.MathUtils.lerp(1,.32,coverAmount);
    cover.material.depthWrite=coverBaseDepthWrite&&coverAmount<.01;
    cover.updateMatrixWorld(true);
  }
  function highlight(){
    components.forEach(c=>{c.pcb.material.emissive.setHex(c.id===selected?0xc1f577:0);c.pcb.material.emissiveIntensity=c.id===selected?0.50:0;});
  }
  function frame(now=performance.now()){
    if(disposed)return;updateCover(now);updateWires();updateLabels();
  }
  view.update=function(...args){originalUpdate.apply(this,args);coverBaseOpacity=cover.material.opacity;coverBaseTransparent=cover.material.transparent;coverBaseDepthWrite=cover.material.depthWrite;frame();};
  view.advanceFocus=function(now){originalAdvanceFocus.call(this,now);frame(now);};

  let pointerStart=null;
  const down=e=>{pointerStart=e.isPrimary&&e.button===0?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;};
  const cancel=()=>{pointerStart=null;};
  const up=e=>{
    const start=pointerStart;pointerStart=null;
    if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)return;
    const bounds=canvas.getBoundingClientRect(),ray=new T.Raycaster();
    ray.setFromCamera(new T.Vector2((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2),view.camera);
    const candidates=boardTargets.filter(mesh=>{
      const component=components.get(mesh.userData.component);
      return component.visible&&(component.spec.location!=='head'||coverAmount>.5);
    });
    const hit=ray.intersectObjects(candidates,false)[0];if(!hit)return;
    const occluder=ray.intersectObjects(view.actual.parts.filter(mesh=>mesh.visible&&(!mesh.material.transparent||mesh.material.opacity>.6)),false)[0];
    if(occluder&&occluder.distance<hit.distance-.0002)return;
    // DuckView's servo handler is already installed. Keep OrbitControls' pointer
    // lifecycle intact, but omit servo targets for this one board-pick dispatch.
    const previousServos=view.actual.servos,emptyTargets=[];view.actual.servos=emptyTargets;
    queueMicrotask(()=>{if(view.actual.servos===emptyTargets)view.actual.servos=previousServos;});
    const id=hit.object.userData.component;api.select(id);onSelect(id);
  };
  canvas.addEventListener('pointerdown',down,{capture:true});
  canvas.addEventListener('pointercancel',cancel,{capture:true});
  canvas.addEventListener('pointerup',up,{capture:true});

  const api={
    components,wires:ELECTRONICS_WIRES,
    setCoverOpen(open){coverOpen=!!open;coverFrom=coverAmount;coverTo=coverOpen?1:0;coverStarted=performance.now();frame();return coverOpen;},
    setVisible(id,visible){const c=components.get(id);if(!c)return false;c.visible=!!visible;c.group.visible=c.visible;frame();return c.visible;},
    setWiringVisible(visible){wiringVisible=!!visible;wireRoot.visible=wiringVisible;powerNode.visible=wiringVisible&&components.get('hub').visible;frame();return wiringVisible;},
    clearSelection(){selected=null;highlight();frame();},
    select(id){const c=components.get(id);if(!c)return false;selected=id;this.setVisible(id,true);if(c.spec.location==='head')this.setCoverOpen(true);highlight();this.focus(id);frame();return true;},
    focus(id){
      const c=components.get(id);if(!c&&id!=='head')return false;
      root.updateMatrixWorld(true);
      const box=id==='head'?new T.Box3().union(new T.Box3().setFromObject(components.get('hat').group)).union(new T.Box3().setFromObject(components.get('zero').group)):new T.Box3().setFromObject(c.group);
      const target=box.getCenter(new T.Vector3()),radius=box.getBoundingSphere(new T.Sphere()).radius;
      const vertical=T.MathUtils.degToRad(view.camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*view.camera.aspect);
      const distance=Math.max(id==='head'?0.20:0.14,radius/Math.sin(Math.min(vertical,horizontal)/2)*1.5);
      const direction=new T.Vector3(c?.spec.location==='torso'?-.85:.65,-1,.85).normalize();
      view.initialView=null;view.overviewName=null;
      view.focus={start:performance.now(),from:view.camera.position.clone(),fromTarget:view.controls.target.clone(),to:target.clone().addScaledVector(direction,distance),target};return true;
    },
    update:frame,
    dispose(){
      if(disposed)return;disposed=true;
      view.update=originalUpdate;view.advanceFocus=originalAdvanceFocus;
      cover.position.copy(coverRest);cover.material.opacity=coverOpacity;cover.material.transparent=false;cover.material.depthWrite=true;
      canvas.removeEventListener('pointerdown',down,{capture:true});canvas.removeEventListener('pointercancel',cancel,{capture:true});canvas.removeEventListener('pointerup',up,{capture:true});
      components.forEach(c=>{c.label.remove();c.group.removeFromParent();c.group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.map?.dispose();o.material.dispose();}});});
      wires.forEach(w=>{w.mesh.geometry.dispose();w.mesh.material.dispose();});wireRoot.removeFromParent();busAnchor.removeFromParent();powerNode.removeFromParent();powerNode.geometry.dispose();powerNode.material.dispose();notice.remove();
    },
  };
  frame();return api;
}
