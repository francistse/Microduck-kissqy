import * as T from './vendor/three.module.min.js?demo=20261013';

// Static, geometry-local BVHs are shared by repeated instances. Only instance
// matrices change with pose/explosion. Hollow printed parts retain their holes:
// a whole-part bounding box is a broad phase, never solid material.
const cache=new WeakMap(),axes=['x','y','z'];
const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),q=new T.Vector3();
const triangle=new T.Triangle(),ray=new T.Ray(),direction=new T.Vector3();
const u=new T.Vector3(),v=new T.Vector3(),w=new T.Vector3();

export function segmentBox(start,end,box,padding=0){
 let near=0,far=1;
 for(const axis of axes){
  const delta=end[axis]-start[axis],low=box.min[axis]-padding,high=box.max[axis]+padding;
  if(Math.abs(delta)<1e-14){if(start[axis]<low||start[axis]>high)return false;continue;}
  let enter=(low-start[axis])/delta,exit=(high-start[axis])/delta;
  if(enter>exit)[enter,exit]=[exit,enter];
  near=Math.max(near,enter);far=Math.min(far,exit);if(near>far)return false;
 }
 return true;
}
function segmentDistanceSq(p0,p1,q0,q1){
 u.subVectors(p1,p0);v.subVectors(q1,q0);w.subVectors(p0,q0);
 const aa=u.lengthSq(),bb=u.dot(v),cc=v.lengthSq(),dd=u.dot(w),ee=v.dot(w);
 const pointDistance=(p,start,delta,length)=>q.copy(start).addScaledVector(delta,length?T.MathUtils.clamp(p.clone().sub(start).dot(delta)/length,0,1):0).distanceToSquared(p);
 let distance=Math.min(pointDistance(p0,q0,v,cc),pointDistance(p1,q0,v,cc),pointDistance(q0,p0,u,aa),pointDistance(q1,p0,u,aa));
 const determinant=aa*cc-bb*bb;
 if(determinant>1e-22){const s=(bb*ee-cc*dd)/determinant,t=(aa*ee-bb*dd)/determinant;if(s>=0&&s<=1&&t>=0&&t<=1)distance=Math.min(distance,q.copy(w).addScaledVector(u,s).addScaledVector(v,-t).lengthSq());}
 return distance;
}
function segmentTriangleDistanceSq(start,end){
 direction.subVectors(end,start);const length=direction.length();
 if(length>1e-12){ray.set(start,direction.multiplyScalar(1/length));const hit=ray.intersectTriangle(a,b,c,false,q);if(hit&&hit.distanceToSquared(start)<=length*length+1e-18)return 0;}
 triangle.set(a,b,c);
 return Math.min(triangle.closestPointToPoint(start,q).distanceToSquared(start),triangle.closestPointToPoint(end,q).distanceToSquared(end),segmentDistanceSq(start,end,a,b),segmentDistanceSq(start,end,b,c),segmentDistanceSq(start,end,c,a));
}
export function meshCollider(geometry){
 if(cache.has(geometry))return cache.get(geometry);
 const positions=geometry.getAttribute('position'),indices=geometry.index,count=(indices?indices.count:positions.count)/3;
 const vertex=(tri,corner,target)=>target.fromBufferAttribute(positions,indices?indices.getX(tri*3+corner):tri*3+corner);
 const bounds=Array.from({length:count},(_,i)=>{
  vertex(i,0,a);vertex(i,1,b);vertex(i,2,c);return new T.Box3().setFromPoints([a,b,c]);
 });
 function build(ids){
  const box=new T.Box3();ids.forEach(i=>box.union(bounds[i]));
  if(ids.length<=12)return{box,ids};
  const size=box.getSize(new T.Vector3()),axis=size.x>=size.y&&size.x>=size.z?'x':size.y>=size.z?'y':'z';
  ids.sort((i,j)=>bounds[i].min[axis]+bounds[i].max[axis]-bounds[j].min[axis]-bounds[j].max[axis]);const mid=ids.length>>1;
  return{box,left:build(ids.slice(0,mid)),right:build(ids.slice(mid))};
 }
 const tree=build(Array.from({length:count},(_,i)=>i));
 function hit(start,end,radius){
  const threshold=radius*radius;
  function visit(node){
   if(!segmentBox(start,end,node.box,radius))return false;
   if(!node.ids)return visit(node.left)||visit(node.right);
   for(const i of node.ids){if(!segmentBox(start,end,bounds[i],radius))continue;vertex(i,0,a);vertex(i,1,b);vertex(i,2,c);if(segmentTriangleDistanceSq(start,end)<=threshold+1e-19)return true;}
   return false;
  }
  return visit(tree);
 }
 const result={hit,box:tree.box,triangles:count};cache.set(geometry,result);return result;
}
