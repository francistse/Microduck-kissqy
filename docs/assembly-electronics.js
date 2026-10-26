import * as T from './vendor/three.module.min.js?demo=20261013';
import {createBoardModel} from './assembly-board-models.js?v=20261026-layout2';

// Board footprints are documented; mounting offsets are assembly-reference
// placements, not a mechanical clearance or connector pin-direction drawing.
export const ELECTRONICS_LAYOUT=Object.freeze({
  hat:Object.freeze({name:'HAT',width:.065,height:.0309,color:0x208778,location:'face',outline:'documented'}),
  zero:Object.freeze({name:'ZERO 3W',width:.065,height:.030,color:0x286d9a,location:'face',outline:'documented'}),
  imu:Object.freeze({name:'IMU',width:.0227,height:.0256,color:0x8b61a5,location:'battery-back',outline:'documented'}),
  hub:Object.freeze({name:'HUB',width:.023,height:.034,color:0xb78142,location:'hip-center',outline:'documented'}),
});
const wire=(id,from,to,label,color,region)=>Object.freeze({id,from,to,label,color,region});
export const ELECTRONICS_WIRES=Object.freeze([
  wire('hat-zero','hat','zero','HAT J4 ↔ ZERO 3W · 40 针配对','#8e82c3','face'),
  wire('hat-34','hat','servo34','HAT → 34','#e4aa66','face'),
  ...[[34,33],[33,32],[32,31],[31,30]].map(([a,b])=>wire(`servo-${a}-${b}`,`servo${a}`,`servo${b}`,`${a} → ${b}`,'#e4aa66','neck')),
  wire('30-hub','servo30','hub','30 → HUB · 躯干分线','#e4aa66','trunk'),
  wire('hub-20','hub','servo20','HUB → 左腿 20','#96c474','left'),
  ...[[20,21],[21,22],[22,23],[23,24]].map(([a,b])=>wire(`servo-${a}-${b}`,`servo${a}`,`servo${b}`,`${a} → ${b}`,'#96c474','left')),
  wire('hub-10','hub','servo10','HUB → 右腿 10','#7eadd7','right'),
  ...[[10,11],[11,12],[12,13],[13,14]].map(([a,b])=>wire(`servo-${a}-${b}`,`servo${a}`,`servo${b}`,`${a} → ${b}`,'#7eadd7','right')),
  wire('hub-imu','hub','imu','HUB → 电池仓背面 IMU','#78beb7','battery'),
  wire('battery-hub','battery','hub','电池电源 → HUB CN1','#db8e83','battery'),
]);

const COVER_MESH_INDEX=21,FACE_MESH_INDEX=19,STL_URL=new URL('./assets/assembly-battery-holder.stl',import.meta.url);
const SERVO_INDEX=Object.freeze({20:0,21:1,22:2,23:3,24:4,30:5,31:6,32:7,33:8,34:9,10:10,11:11,12:12,13:13,14:14});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const basisQuaternion=(x,y,z)=>new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));
const vector=(x,y,z)=>new T.Vector3(x,y,z);
const objectCenter=object=>new T.Box3().setFromObject(object).getCenter(new T.Vector3());

export function parseBatterySTL(buffer){
  const data=new DataView(buffer);if(data.byteLength<84)throw Error('电池仓 STL 不完整');
  const count=data.getUint32(80,true);if(count<1||count>200000||84+count*50!==data.byteLength)throw Error('电池仓 STL 格式不符');
  const positions=new Float32Array(count*9),normals=new Float32Array(count*9);
  for(let i=0;i<count;i++){
    const offset=84+i*50,n=[data.getFloat32(offset,true),data.getFloat32(offset+4,true),data.getFloat32(offset+8,true)];
    for(let j=0;j<3;j++)for(let axis=0;axis<3;axis++){
      const value=data.getFloat32(offset+12+j*12+axis*4,true);if(!Number.isFinite(value))throw Error('电池仓 STL 顶点无效');
      positions[i*9+j*3+axis]=value*.001;normals[i*9+j*3+axis]=n[axis];
    }
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(normals,3));geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

function createHubModel(spec){
  const group=new T.Group(),pcb=new T.Mesh(new T.BoxGeometry(spec.width,spec.height,.0016),new T.MeshStandardMaterial({color:0x286a5b,roughness:.65,metalness:.08}));group.add(pcb);
  const box=(w,h,d,x,y,z,color)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.55,metalness:color===0xc8b575?.55:.05}));mesh.position.set(x,y,z);group.add(mesh);return mesh;};
  // Source-backed 2P power + four 3P bus ports; packages/placement simplified.
  box(.008,.005,.005,0,.011,.0033,0xe4e2d8);
  for(const x of [-.008,.008])for(const y of [-.003,.006]){
    box(.005,.008,.005,x,y,.0033,0xe4e2d8);
    for(let i=0;i<3;i++)box(.001,.001,.0015,x,y+(i-1)*.002,.0063,0xc8b575);
  }
  const cap=new T.Mesh(new T.CylinderGeometry(.004,.004,.012,20),new T.MeshStandardMaterial({color:0x283f46,roughness:.45,metalness:.15}));cap.rotation.x=Math.PI/2;cap.position.set(0,-.008,-.0067);group.add(cap);
  for(const x of [-.0095,.0095])for(const y of [-.015,.015]){
    const ring=new T.Mesh(new T.RingGeometry(.0012,.0019,16),new T.MeshStandardMaterial({color:0xc8b575,metalness:.6,roughness:.4,side:T.DoubleSide}));ring.position.set(x,y,.00085);group.add(ring);
    const hole=new T.Mesh(new T.CircleGeometry(.0012,16),new T.MeshBasicMaterial({color:0x0d1113,side:T.DoubleSide}));hole.position.set(x,y,.0009);group.add(hole);
  }
  return{group,pcb,width:spec.width,height:spec.height};
}

/** Add read-only electronics in their described assembly regions. No robot I/O. */
export async function attachElectronics(view,onSelect=()=>{}){
  if(!view?.actual?.parts||!view?.model?.parts)throw Error('装配结构模型尚未加载');
  const root=view.actual.root,container=view.container,canvas=view.renderer.domElement,trunk=view.actual.bodies[0];
  const coverIndex=view.model.parts.findIndex(p=>p.mesh===COVER_MESH_INDEX),faceIndex=view.model.parts.findIndex(p=>p.mesh===FACE_MESH_INDEX);
  const cover=view.actual.parts[coverIndex],face=view.actual.parts[faceIndex];
  if(!cover||!face||view.model.parts[coverIndex].body!==9||view.model.parts[faceIndex].body!==9)throw Error('头盖或鸭脸定位与冻结模型不一致');
  root.updateMatrixWorld(true);
  const headParent=face.parent,coverRest=cover.position.clone(),coverOpacity=cover.material.opacity;
  const coverWorldBox=new T.Box3().setFromObject(cover),headSize=coverWorldBox.getSize(new T.Vector3()),faceBox=new T.Box3().setFromObject(face),faceCenter=faceBox.getCenter(new T.Vector3());
  const leftHip=view.actual.servos[SERVO_INDEX[20]],rightHip=view.actual.servos[SERVO_INDEX[10]];
  const leftHipBox=new T.Box3().setFromObject(leftHip),rightHipBox=new T.Box3().setFromObject(rightHip);
  const hipCenter=objectCenter(leftHip).add(objectCenter(rightHip)).multiplyScalar(.5);
  // HUB stays on the 10/20 centreline, just behind their housings, where the
  // real holder's 19×30 mm clamping rows can support the board.
  const hubCenter=vector(Math.min(leftHipBox.min.x,rightHipBox.min.x)-.003,hipCenter.y,hipCenter.z);
  // Actual STL axes: raw X = width, raw +Y = battery-rail side, raw Z = up.
  // Map raw X→robot Y, raw Y→robot -X. HUB rows at raw Z40/70 set its height.
  const batteryMount=new T.Group();batteryMount.name='assembly-battery-holder-mount';trunk.add(batteryMount);
  const holderOffset=vector(hubCenter.x+.017,hipCenter.y,hubCenter.z-.055);
  batteryMount.position.copy(trunk.worldToLocal(holderOffset.clone()));
  batteryMount.quaternion.copy(trunk.getWorldQuaternion(new T.Quaternion()).invert()).multiply(new T.Quaternion().setFromAxisAngle(vector(0,0,1),Math.PI/2));
  let batteryMesh=null,batteryError=null;
  try{
    const response=await fetch(STL_URL);if(!response.ok)throw Error('电池仓模型读取失败');
    const geometry=parseBatterySTL(await response.arrayBuffer());
    batteryMesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:0xc4c9c8,roughness:.73,metalness:.04,side:T.DoubleSide}));
    batteryMesh.name='电池仓_M2.5螺丝_HUB组合.stl';batteryMount.add(batteryMesh);
  }catch(error){batteryError=error?.message||'电池仓模型未加载';}
  const faceOrientation=basisQuaternion(vector(0,-1,0),vector(0,0,1),vector(-1,0,0));
  const rearBoardOrientation=basisQuaternion(vector(0,1,0),vector(0,0,1),vector(1,0,0));
  const facePositions={
    zero:vector(faceBox.min.x-.006,faceCenter.y,faceCenter.z),
    hat:vector(faceBox.min.x-.017,faceCenter.y,faceCenter.z),
  };
  const components=new Map(),boardTargets=[];
  const originalUpdate=view.update,originalAdvanceFocus=view.advanceFocus;
  let disposed=false,selected=null,wiringVisible=false,batteryVisible=true,coverOpen=false,coverAmount=0,coverFrom=0,coverTo=0,coverStarted=0;
  let coverBaseOpacity=coverOpacity,coverBaseTransparent=cover.material.transparent,coverBaseDepthWrite=cover.material.depthWrite;
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const coverUp=vector(0,0,1).applyQuaternion(headParent.getWorldQuaternion(new T.Quaternion()).invert()).normalize();
  const coverLift=clamp(headSize.z*1.3,.045,.075);
  const cutawayIndices=[1,2,3,4,5],cutawayBase=new Map();
  const captureCutaway=()=>cutawayIndices.forEach(index=>{const m=view.actual.parts[index].material;cutawayBase.set(index,{opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});});captureCutaway();

  for(const [id,spec]of Object.entries(ELECTRONICS_LAYOUT)){
    const built=id==='hub'?createHubModel(spec):createBoardModel(id,spec),component={id,spec,...built,visible:true,label:null};
    component.group.name=`assembly-${id}`;component.group.userData.component=id;
    const parent=spec.location==='face'?headParent:spec.location==='battery-back'?batteryMount:trunk;parent.add(component.group);
    if(spec.location==='face'){
      component.group.position.copy(parent.worldToLocal(facePositions[id].clone()));
      component.group.quaternion.copy(parent.getWorldQuaternion(new T.Quaternion()).invert()).multiply(faceOrientation);
    }else if(id==='hub'){
      component.group.position.copy(parent.worldToLocal(hubCenter.clone()));
      component.group.quaternion.copy(parent.getWorldQuaternion(new T.Quaternion()).invert()).multiply(rearBoardOrientation);
    }else{
      // Lower backplate has the IMU's four through-hole region (raw Z16.6/36.2).
      component.group.position.set(0,.017,.0264);
      component.group.quaternion.copy(parent.getWorldQuaternion(new T.Quaternion()).invert()).multiply(rearBoardOrientation);
    }
    component.group.traverse(object=>{if(object.isMesh){object.userData.component=id;boardTargets.push(object);}});
    const label=document.createElement('button');label.type='button';label.className='electronics-label';label.textContent=spec.name;label.setAttribute('aria-label',`查看 ${id==='zero'?'Radxa ZERO 3W':spec.name}`);
    Object.assign(label.style,{position:'absolute',zIndex:'3',transform:'translate(-50%,-50%)',font:'650 10px system-ui,sans-serif',whiteSpace:'nowrap',cursor:'pointer'});
    label.addEventListener('click',()=>{api.select(id);onSelect(id);});container.append(label);component.label=label;components.set(id,component);
  }
  root.updateMatrixWorld(true);
  const powerNode=new T.Mesh(new T.SphereGeometry(.0021,10,8),new T.MeshBasicMaterial({color:0xdb8e83}));powerNode.position.set(0,.034,.011);batteryMount.add(powerNode);powerNode.visible=false;
  const wireRoot=new T.Group();wireRoot.name='assembly-wiring-route-reference';root.add(wireRoot);wireRoot.visible=false;
  const wires=ELECTRONICS_WIRES.map(spec=>{const mesh=new T.Mesh(new T.BufferGeometry(),new T.MeshStandardMaterial({color:spec.color,roughness:.55,metalness:.08}));mesh.name=spec.id;wireRoot.add(mesh);return {...spec,mesh,last:null};});
  const notice=document.createElement('span');notice.className='electronics-scene-note';notice.textContent=batteryError?'电池仓暂未加载；板卡位置按装配区显示':'按装配位置展示；线束弯曲为参考';container.append(notice);
  const batteryLabel=document.createElement('button');batteryLabel.type='button';batteryLabel.className='electronics-label';batteryLabel.textContent='电池仓';batteryLabel.setAttribute('aria-label','查看电池仓');Object.assign(batteryLabel.style,{position:'absolute',zIndex:'3',transform:'translate(-50%,-50%)',font:'650 10px system-ui,sans-serif',whiteSpace:'nowrap',cursor:'pointer'});batteryLabel.addEventListener('click',()=>api.focus('battery'));container.append(batteryLabel);

  function endpoint(id){
    if(id==='battery')return powerNode.getWorldPosition(new T.Vector3());
    if(id.startsWith('servo'))return objectCenter(view.actual.servos[SERVO_INDEX[Number(id.slice(5))]]);
    return components.get(id).group.getWorldPosition(new T.Vector3());
  }
  function endpointVisible(id){return id.startsWith('servo')||id==='battery'||components.get(id)?.visible;}
  function updateWires(){
    if(!wiringVisible)return;root.updateMatrixWorld(true);
    powerNode.visible=components.get('hub').visible&&batteryVisible;
    for(const item of wires){
      item.mesh.visible=endpointVisible(item.from)&&endpointVisible(item.to);const a=endpoint(item.from),b=endpoint(item.to);
      const signature=[...a.toArray(),...b.toArray()].map(x=>x.toFixed(6)).join(',');if(signature===item.last)continue;item.last=signature;
      const start=root.worldToLocal(a.clone()),end=root.worldToLocal(b.clone()),mid=start.clone().lerp(end,.5);
      if(item.region==='left')mid.y+=.009;else if(item.region==='right')mid.y-=.009;
      else if(item.region==='neck'){mid.y-=.014;mid.x-=.003;}
      else if(item.region==='trunk'){mid.y-=.033;mid.x-=.007;}
      else if(item.region==='battery')mid.x-=.010;else{mid.y-=.006;mid.z+=.003;}
      const curve=new T.CatmullRomCurve3([start,mid,end]);const geometry=new T.TubeGeometry(curve,18,.0006,5,false);item.mesh.geometry.dispose();item.mesh.geometry=geometry;
    }
  }
  function applyCutaway(){
    cutawayIndices.forEach(index=>{const mesh=view.actual.parts[index],base=cutawayBase.get(index);if(!base)return;const cutting=selected==='hub'||selected==='imu';const opacity=selected==='hub'?((index===3||index===4)?.24:.12):.12;mesh.material.opacity=cutting?Math.min(base.opacity,opacity):base.opacity;mesh.material.transparent=base.transparent||cutting;mesh.material.depthWrite=base.depthWrite&&!cutting;});
    if(batteryMesh){batteryMesh.material.transparent=selected==='imu';batteryMesh.material.opacity=selected==='imu'?.24:1;batteryMesh.material.depthWrite=selected!=='imu';}
  }
  function positionLabel(label,world,visible){const point=world.project(view.camera),width=container.clientWidth,height=container.clientHeight;label.hidden=!visible||point.z< -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1;label.style.left=`${(point.x+1)*width/2}px`;label.style.top=`${(1-point.y)*height/2}px`;}
  function updateLabels(){
    view.camera.updateMatrixWorld(true);
    components.forEach(component=>{positionLabel(component.label,component.group.localToWorld(vector(0,component.height*.55,.007)),component.visible&&(component.spec.location!=='face'||coverAmount>.5));component.label.setAttribute('aria-pressed',String(component.id===selected));});
    positionLabel(batteryLabel,batteryMount.localToWorld(vector(.026,.025,.050)),batteryVisible&&!!batteryMesh);
    notice.hidden=![...components.values()].some(c=>c.visible)&&!coverOpen&&!wiringVisible&&!batteryVisible;
  }
  function updateCover(now=performance.now()){
    const progress=reducedMotion?1:clamp((now-coverStarted)/360,0,1),ease=progress*progress*(3-2*progress);coverAmount=T.MathUtils.lerp(coverFrom,coverTo,ease);if(progress===1)coverFrom=coverTo;
    cover.position.copy(coverRest).addScaledVector(coverUp,coverLift*coverAmount);cover.material.transparent=coverBaseTransparent||coverAmount>.001;cover.material.opacity=coverBaseOpacity*T.MathUtils.lerp(1,.25,coverAmount);cover.material.depthWrite=coverBaseDepthWrite&&coverAmount<.01;cover.updateMatrixWorld(true);
  }
  function highlight(){components.forEach(c=>{c.pcb.material.emissive.setHex(c.id===selected?0xc1f577:0);c.pcb.material.emissiveIntensity=c.id===selected?.45:0;});}
  function frame(now=performance.now()){if(disposed)return;updateCover(now);applyCutaway();updateWires();updateLabels();}
  view.update=function(...args){originalUpdate.apply(this,args);coverBaseOpacity=cover.material.opacity;coverBaseTransparent=cover.material.transparent;coverBaseDepthWrite=cover.material.depthWrite;captureCutaway();frame();};
  view.advanceFocus=function(now){originalAdvanceFocus.call(this,now);frame(now);};
  let pointerStart=null;
  const down=e=>{pointerStart=e.isPrimary&&e.button===0?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;};
  const cancel=()=>{pointerStart=null;};
  const up=e=>{
    const start=pointerStart;pointerStart=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)return;
    const bounds=canvas.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2),view.camera);
    const candidates=boardTargets.filter(mesh=>{const c=components.get(mesh.userData.component);return c.visible&&(c.spec.location!=='face'||coverAmount>.5);});const hit=ray.intersectObjects(candidates,false)[0];if(!hit)return;
    const occluder=ray.intersectObjects([...view.actual.parts,...(batteryMesh?[batteryMesh]:[])].filter(mesh=>mesh.visible&&(!mesh.material.transparent||mesh.material.opacity>.6)),false)[0];if(occluder&&occluder.distance<hit.distance-.0002)return;
    const previousServos=view.actual.servos,empty=[];view.actual.servos=empty;queueMicrotask(()=>{if(view.actual.servos===empty)view.actual.servos=previousServos;});const id=hit.object.userData.component;api.select(id);onSelect(id);
  };
  canvas.addEventListener('pointerdown',down,{capture:true});canvas.addEventListener('pointercancel',cancel,{capture:true});canvas.addEventListener('pointerup',up,{capture:true});
  const api={
    components,wires:ELECTRONICS_WIRES,batteryHolder:{group:batteryMount,mesh:batteryMesh,error:batteryError},
    setCoverOpen(open){coverOpen=!!open;coverFrom=coverAmount;coverTo=coverOpen?1:0;coverStarted=performance.now();frame();return coverOpen;},
    setVisible(id,visible){const c=components.get(id);if(!c)return false;c.visible=!!visible;c.group.visible=c.visible;frame();return c.visible;},
    setBatteryVisible(visible){batteryVisible=!!visible;if(batteryMesh)batteryMesh.visible=batteryVisible;frame();return batteryVisible;},
    setWiringVisible(visible){wiringVisible=!!visible;wireRoot.visible=wiringVisible;powerNode.visible=wiringVisible&&components.get('hub').visible&&batteryVisible;frame();return wiringVisible;},
    clearSelection(){selected=null;highlight();frame();},
    select(id){const c=components.get(id);if(!c)return false;selected=id;this.setVisible(id,true);if(c.spec.location==='face')this.setCoverOpen(true);if(id==='imu')this.setBatteryVisible(true);highlight();this.focus(id);frame();return true;},
    focus(id){
      const c=components.get(id);if(!c&&!['head','battery'].includes(id))return false;root.updateMatrixWorld(true);
      const box=id==='head'?new T.Box3().union(new T.Box3().setFromObject(components.get('hat').group)).union(new T.Box3().setFromObject(components.get('zero').group)):id==='battery'?new T.Box3().setFromObject(batteryMount):new T.Box3().setFromObject(c.group);
      const target=box.getCenter(new T.Vector3()),radius=box.getBoundingSphere(new T.Sphere()).radius;const vertical=T.MathUtils.degToRad(view.camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*view.camera.aspect);const distance=Math.max((id==='head'||id==='battery')?.18:.12,radius/Math.sin(Math.min(vertical,horizontal)/2)*1.45);
      // Face boards are viewed from the opened interior, not through the face.
      const direction=id==='head'||c?.spec.location==='face'?vector(-1,-.45,.9):id==='hub'?vector(.9,-.45,.75):id==='imu'?vector(1,-.30,.2):vector(-1,-.7,.4);
      view.initialView=null;view.overviewName=null;view.focus={start:performance.now(),from:view.camera.position.clone(),fromTarget:view.controls.target.clone(),to:target.clone().addScaledVector(direction.normalize(),distance),target};return true;
    },
    update:frame,
    dispose(){
      if(disposed)return;selected=null;applyCutaway();disposed=true;view.update=originalUpdate;view.advanceFocus=originalAdvanceFocus;cover.position.copy(coverRest);cover.material.opacity=coverOpacity;cover.material.transparent=false;cover.material.depthWrite=true;
      canvas.removeEventListener('pointerdown',down,{capture:true});canvas.removeEventListener('pointercancel',cancel,{capture:true});canvas.removeEventListener('pointerup',up,{capture:true});
      const geometries=new Set(),materials=new Set();const release=object=>object.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>materials.add(m));else materials.add(o.material);}});
      components.forEach(c=>{c.label.remove();c.group.removeFromParent();release(c.group);});wires.forEach(w=>release(w.mesh));release(batteryMount);release(powerNode);geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});wireRoot.removeFromParent();batteryMount.removeFromParent();notice.remove();batteryLabel.remove();
    },
  };
  frame();return api;
}
