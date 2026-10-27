import * as T from './vendor/three.module.min.js?demo=20261013';

// Display-only cable routing. The actual case geometry and joint transforms are
// untouched. Each case is conservatively enclosed in its own oriented box.
const CLEARANCE=.0009,EPS=1e-9,SAMPLE_STEP=.0004;
const p0=new T.Vector3(),p1=new T.Vector3();
const coordinates=['x','y','z'];
function slab(a,b,box){
 let near=0,far=1;
 for(const key of coordinates){
  const delta=b[key]-a[key],low=box.min[key]+EPS,high=box.max[key]-EPS;
  if(Math.abs(delta)<1e-14){if(a[key]<low||a[key]>high)return false;continue;}
  let enter=(low-a[key])/delta,exit=(high-a[key])/delta;
  if(enter>exit)[enter,exit]=[exit,enter];
  near=Math.max(near,enter);far=Math.min(far,exit);if(near>far)return false;
 }
 return far>=0&&near<=1;
}
function corners(box,matrix){
 const result=[];
 for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z])result.push(new T.Vector3(x,y,z).applyMatrix4(matrix));
 return result;
}
function onLead(point,start,end){
 const direction=end.clone().sub(start),length=direction.lengthSq();
 if(length<1e-18)return point.distanceToSquared(start)<1e-16;
 const t=point.clone().sub(start).dot(direction)/length;
 return t>=-1e-7&&t<=1+1e-7&&point.distanceToSquared(start.clone().addScaledVector(direction,t))<1e-16;
}
function roundedPath(points,radius){
 const curve=new T.CurvePath();let current=points[0].clone();
 const addLine=end=>{if(current.distanceToSquared(end)>1e-18)curve.add(new T.LineCurve3(current.clone(),end.clone()));current=end.clone();};
 for(let i=1;i<points.length-1;i++){
  const previous=points[i-1],corner=points[i],next=points[i+1];
  const before=corner.distanceTo(previous),after=corner.distanceTo(next);
  const trim=Math.min(radius,before*.24,after*.24,i===1||i===points.length-2?.0007:Infinity);
  if(trim<1e-9){addLine(corner);continue;}
  const entry=corner.clone().lerp(previous,trim/before),exit=corner.clone().lerp(next,trim/after);
  addLine(entry);curve.add(new T.QuadraticBezierCurve3(entry,corner.clone(),exit));current=exit;
 }
 addLine(points.at(-1));curve.arcLengthDivisions=Math.max(200,Math.ceil(curve.getLength()/SAMPLE_STEP));return curve;
}

export function createWireRouter(root,servoMeshes){
 const meshes=[...servoMeshes],graphs=new Map();let signature='',obstacles=[],lastFailure=null;
 function segmentHits(a,b,ignore=null){
  for(const obstacle of obstacles){
   if(obstacle.mesh===ignore||!slab(a,b,obstacle.broad))continue;
   p0.copy(a).applyMatrix4(obstacle.toLocal);p1.copy(b).applyMatrix4(obstacle.toLocal);
   if(slab(p0,p1,obstacle.box))return obstacle;
  }
  return null;
 }
 const clear=(a,b)=>!segmentHits(a,b);
 function outside(point){return !segmentHits(point,point);}
 function update(){
  root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert();
  const frames=meshes.map(mesh=>({mesh,matrix:new T.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld)}));
  const next=frames.map(({matrix})=>matrix.elements.map(value=>value.toFixed(7)).join(',')).join(';');
  if(next===signature)return false;signature=next;graphs.clear();
  obstacles=frames.map(({mesh,matrix})=>{
   if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
   const box=mesh.geometry.boundingBox.clone().expandByScalar(CLEARANCE),vertices=corners(box,matrix),broad=new T.Box3().setFromPoints(vertices);
   return{mesh,box,broad,toRoot:matrix,toLocal:matrix.clone().invert()};
  });
  return true;
 }
 function graphFor(lane){
  const key=Math.max(-1,Math.min(1,Math.round(lane)));if(graphs.has(key))return graphs.get(key);
  // Separate stand-offs stop the three conductors from sharing every corner.
  const standOff=.001+(key+1)*.00065,points=[];
  for(const obstacle of obstacles){
   const box=obstacle.box.clone().expandByScalar(standOff);
   for(const point of corners(box,obstacle.toRoot))if(outside(point))points.push(point);
  }
  const outer=new T.Box3();obstacles.forEach(obstacle=>outer.union(obstacle.broad));outer.expandByScalar(.012+(key+1)*.001);
  for(const point of corners(outer,new T.Matrix4()))if(outside(point))points.push(point);
  const edges=points.map(()=>[]);
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if(clear(points[i],points[j])){
   const distance=points[i].distanceTo(points[j]);edges[i].push([j,distance]);edges[j].push([i,distance]);
  }
  const graph={points,edges};graphs.set(key,graph);return graph;
 }
 function middlePath(start,end,lane){
  if(!outside(start)||!outside(end))return null;
  if(clear(start,end))return[start.clone(),end.clone()];
  const graph=graphFor(lane),count=graph.points.length,startIndex=count,endIndex=count+1;
  const points=[...graph.points,start,end],edges=[...graph.edges.map(row=>[...row]),[],[]];
  for(let i=0;i<count;i++)for(const index of[startIndex,endIndex])if(clear(points[index],points[i])){
   const distance=points[index].distanceTo(points[i]);edges[index].push([i,distance]);edges[i].push([index,distance]);
  }
  const distances=new Float64Array(count+2);distances.fill(Infinity);distances[startIndex]=0;
  const previous=new Int32Array(count+2);previous.fill(-1);const done=new Uint8Array(count+2);
  for(let visit=0;visit<count+2;visit++){
   let index=-1,best=Infinity;
   for(let i=0;i<count+2;i++)if(!done[i]&&distances[i]<best){index=i;best=distances[i];}
   if(index<0)break;if(index===endIndex)break;done[index]=1;
   for(const[next,distance]of edges[index])if(!done[next]&&best+distance<distances[next]){distances[next]=best+distance;previous[next]=index;}
  }
  if(!Number.isFinite(distances[endIndex]))return null;
  const path=[];for(let at=endIndex;at!==-1;at=previous[at])path.push(points[at].clone());path.reverse();
  // Remove graph detours that became redundant after the shortest-path search.
  const compact=[path[0]];let at=0;
  while(at<path.length-1){let next=path.length-1;while(next>at+1&&!clear(path[at],path[next]))next--;compact.push(path[next]);at=next;}
  return compact;
 }
 function validate(curve,{start,leadA,leadB,end,fromServo,toServo}){
  for(const segment of curve.curves){
   const divisions=Math.max(1,Math.ceil(segment.getLength()/SAMPLE_STEP));let a=segment.getPoint(0);
   for(let i=1;i<=divisions;i++){
    const b=segment.getPoint(i/divisions);
    for(const obstacle of obstacles){
     if(obstacle.mesh===fromServo&&onLead(a,start,leadA)&&onLead(b,start,leadA))continue;
     if(obstacle.mesh===toServo&&onLead(a,end,leadB)&&onLead(b,end,leadB))continue;
     if(!slab(a,b,obstacle.broad))continue;
     p0.copy(a).applyMatrix4(obstacle.toLocal);p1.copy(b).applyMatrix4(obstacle.toLocal);
     if(slab(p0,p1,obstacle.box))return obstacle;
    }
    a=b;
   }
  }
  return null;
 }
 function separatedDirectPaths({leadA,leadB,fromServo,toServo,lane=0}){
  if(Math.abs(lane)<.1)return null;
  const direction=leadB.clone().sub(leadA).normalize();
  const owners=[fromServo,toServo].map(mesh=>obstacles.find(obstacle=>obstacle.mesh===mesh)).filter(Boolean);
  // When the contact row and cable run are collinear, three different pins can
  // otherwise produce almost the same line. Fan those cores apart after the
  // socket exits, keeping the original terminal straight segments intact.
  if(!owners.some(owner=>Math.abs(new T.Vector3(0,0,1).transformDirection(owner.toRoot).dot(direction))>.94))return null;
  const axes=[];
  for(const owner of owners)for(const axis of[new T.Vector3(1,0,0),new T.Vector3(0,1,0)])axes.push(axis.transformDirection(owner.toRoot));
  axes.push(new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1));
  const perpendiculars=[];
  for(const axis of axes){
   const perpendicular=axis.addScaledVector(direction,-axis.dot(direction));
   if(perpendicular.lengthSq()<1e-8)continue;perpendicular.normalize();
   if(perpendiculars.some(previous=>Math.abs(previous.dot(perpendicular))>.999))continue;
   perpendiculars.push(perpendicular);
  }
  const paths=[];
  for(const distance of[.0014,.0011,.0008])for(const perpendicular of perpendiculars)for(const side of[1,-1]){
   const offset=perpendicular.clone().multiplyScalar(lane*distance*side);
   const points=[leadA.clone(),leadA.clone().lerp(leadB,1/3).add(offset),leadA.clone().lerp(leadB,2/3).add(offset),leadB.clone()];
   if(points.slice(1).every((point,index)=>clear(points[index],point)))paths.push(points);
  }
  return paths;
 }
 function route(spec){
  if(!signature)update();lastFailure=null;
  const{start,leadA,leadB,end,lane=0}=spec;
  const middle=middlePath(leadA,leadB,lane);
  if(!middle){lastFailure={reason:'no-clear-external-path'};return null;}
  const separated=middle.length===2?separatedDirectPaths(spec):null;
  if(separated&&separated.length===0){lastFailure={reason:'no-separated-direct-path'};return null;}
  for(const candidate of separated||[middle]){
   const points=[start.clone(),...candidate,end.clone()];
   for(const radius of[.0015,.00075,.0003,0]){
    const curve=roundedPath(points,radius),hit=validate(curve,spec);
    if(!hit)return{curve,points,clearance:CLEARANCE,bendRadius:radius,length:curve.getLength(),signature,laneSeparated:!!separated};
    lastFailure={reason:'terminal-or-bend-clearance',servo:hit.mesh.userData?.hd1910Assembly?.id??hit.mesh.name};
   }
  }
  return null;
 }
 return{update,route,clearSegment:clear,segmentHits,get signature(){return signature;},get obstacles(){return obstacles;},get lastFailure(){return lastFailure;},clearance:CLEARANCE};
}
