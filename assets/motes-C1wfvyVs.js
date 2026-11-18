import{S as H,A as J,k as K,h as ie,a4 as Q,j as X,a5 as R,a6 as re,r as G}from"./three.module-BbQ0mWiG.js";const ee=new G("#e7c783"),te=new G("#edc8d3"),W=u=>u&&Number.isFinite(u.x)&&Number.isFinite(u.y??0)&&Number.isFinite(u.z),$=(u,t,x)=>Math.max(t,Math.min(x,u)),E=u=>{const t=Math.sin(u*127.1+311.7)*43758.5453;return t-Math.floor(t)},ae=`
  attribute vec3 iFrom;
  attribute vec4 iTarget;
  attribute vec4 iLife;
  attribute vec4 iTint;
  attribute float part;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vAlpha;
  varying float vPart;
  varying vec2 vTile;

  vec3 cubic(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
    float q = 1.0 - t;
    return q*q*q*a + 3.0*q*q*t*b + 3.0*q*t*t*c + t*t*t*d;
  }
  vec3 flight(float age) {
    float launch = smoothstep(0.0, 0.6, age);
    vec3 lifted = iFrom + vec3(0.0, 2.5, 0.0);
    if (age <= 0.6) return iFrom + vec3(0.0, 2.5 * launch, 0.0);
    float t = clamp((age - 0.6) / max(0.1, iLife.y - 0.6), 0.0, 1.0);
    vec3 delta = iTarget.xyz - lifted;
    float distance = length(delta);
    vec3 destination = iTarget.xyz;
    if (iTarget.w > 0.5) {
      vec2 direction = delta.xz / max(length(delta.xz), 1.0);
      destination = lifted + vec3(direction.x * 22.0, 54.0, direction.y * 22.0);
      delta = destination - lifted;
      distance = length(delta);
    }
    vec3 control1 = lifted + vec3(delta.x * 0.08, clamp(distance * 0.1, 12.0, 130.0), delta.z * 0.08);
    vec3 control2 = destination - delta * 0.16 + vec3(0.0, clamp(distance * 0.025, 6.0, 35.0), 0.0);
    vec3 p = cubic(lifted, control1, control2, destination, t);
    float envelope = sin(t * 3.14159265); envelope *= envelope;
    float seed = iLife.z * 6.2831853;
    float amplitude = clamp(distance * 0.0015, 0.3, 1.5) * envelope;
    // 低频、固定种子的柔和卷流；不是按帧随机抖动。
    p += amplitude * vec3(sin(t * 5.2 + seed), 0.25 * sin(t * 3.1 + seed), cos(t * 4.3 + seed));
    return p;
  }
  void main() {
    vUv = uv; vPart = part;
    float tile = floor(clamp(iLife.z, 0.0, 0.999999) * 16.0);
    vTile = vec2(mod(tile, 4.0), 3.0 - floor(tile / 4.0));
    float age = max(0.0, uTime - iLife.x);
    float progress = clamp(age / max(iLife.y, 0.1), 0.0, 1.0);
    float fade = smoothstep(0.0, 0.65, age) * (1.0 - smoothstep(iLife.y - 0.8, iLife.y, age));
    vTint = mix(vec3(0.624, 0.768, 0.855), iTint.rgb, iTint.a > 0.5 ? smoothstep(0.05, 0.8, progress) : 1.0);
    float sampledAge = age;
    if (part > 1.5) {
      float speed = length(flight(age + 0.02) - flight(max(0.0, age - 0.02))) / 0.04;
      float trailLength = mix(10.0, 20.0, iLife.z);
      sampledAge = max(0.0, age - min(age, trailLength / max(speed, 1.0)) * uv.y);
    }
    vec4 view = modelViewMatrix * vec4(flight(sampledAge), 1.0);
    if (part > 1.5) {
      vec4 ahead = modelViewMatrix * vec4(flight(sampledAge + 0.025), 1.0);
      vec4 behind = modelViewMatrix * vec4(flight(max(0.0, sampledAge - 0.025)), 1.0);
      vec2 tangent = ahead.xy - behind.xy;
      vec2 normal = vec2(-tangent.y, tangent.x) / max(length(tangent), 0.0001);
      view.xy += normal * position.x * 0.075 * (1.0 - 0.8 * uv.y);
      vAlpha = 0.035 * pow(1.0 - uv.y, 2.0) * smoothstep(0.0, 0.12, uv.y);
    } else {
      float size = part < 0.5 ? 0.25 : 1.5;
      float stretch = 1.0 + iTarget.w * smoothstep(0.45, 1.0, progress) * (part < 0.5 ? 5.0 : 0.5);
      view.xy += position.xy * size * vec2(1.0, stretch);
      vAlpha = part < 0.5 ? 0.7 : 0.12;
    }
    vAlpha *= fade * iLife.w;
    gl_Position = projectionMatrix * view;
    if (iLife.w < 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  }
`,oe=`
  uniform sampler2D uBokeh;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vAlpha;
  varying float vPart;
  varying vec2 vTile;
  void main() {
    vec2 sampleUv = vPart > 1.5 ? vec2(vUv.x, 0.5) : vUv;
    // Lux atlas为4×4，每格128px；只取一个固定种子的格并内缩，避免串入邻格。
    vec2 tileUv = mix(vec2(1.5 / 128.0), vec2(1.0 - 1.5 / 128.0), sampleUv);
    vec4 texel = texture2D(uBokeh, (vTile + tileUv) * 0.25);
    float mask = texel.a * max(texel.r, max(texel.g, texel.b));
    gl_FragColor = vec4(vTint, mask * vAlpha);
    #include <colorspace_fragment>
  }
`;function se(u){const t=[],x=[],p=[],T=[];function M(e){const i=t.length/3;t.push(-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0),x.push(0,0,1,0,1,1,0,1),p.push(e,e,e,e),T.push(i,i+1,i+2,i,i+2,i+3)}M(0),M(1);const n=t.length/3;for(let e=0;e<=8;e++)if(t.push(-1,0,0,1,0,0),x.push(0,e/8,1,e/8),p.push(2,2),e<8){const i=n+e*2;T.push(i,i+1,i+3,i,i+3,i+2)}const g=new Q;g.setAttribute("position",new X(t,3)),g.setAttribute("uv",new X(x,2)),g.setAttribute("part",new X(p,1)),g.setIndex(T);for(const[e,i]of[["iFrom",3],["iTarget",4],["iLife",4],["iTint",4]])g.setAttribute(e,new R(new Float32Array(u*i),i).setUsage(re));return g.instanceCount=u,g}function de(u,t,{bokehTexture:x,capacity:p=64,enabled:T=!0}={}){if(!x?.isTexture)throw new Error("createMotes requires the shared Lux3D bokehTexture");if(!u?.add||!t?.on||!t?.arrive||!t?.cancel)throw new Error("createMotes requires scene and Liuguang state");p=$(Math.floor(Number(p)||64),1,64);const M=se(p),n=M.attributes,g=new H({uniforms:{uTime:{value:0},uBokeh:{value:x}},vertexShader:ae,fragmentShader:oe,transparent:!0,depthTest:!0,depthWrite:!1,blending:J,toneMapped:!1}),e=new K(M,g);e.name="lg_motes",e.frustumCulled=!1,e.renderOrder=5,e.visible=!1,u.add(e);const i=new Uint8Array(p),q=new Array(p).fill(null),j=new Map,s={active:0,peak:0,capacity:p,drawCalls:1,spawned:0,arrived:0,cancelled:0,dropped:0,rejected:0,errors:0,disposed:!1,lastError:null};let D=0,I=0,m=!1,f=!T;function l(r){try{t.cancel(r),s.cancelled++}catch(c){s.errors++,s.lastError=String(c?.message||c)}}function w(r){const c=q[r];return i[r]=0,q[r]=null,j.delete(c),n.iLife.array[r*4+3]=0,n.iLife.needsUpdate=!0,s.active--,c}function B(){for(let r=0;r<p;r++)i[r]&&l(w(r));e.visible=!1}function V(r){const c=r?.motId??r?.id;if(!c||j.has(c))return;if(m||f||t.disposed){l(c);return}let d=-1;for(let a=0;a<p;a++)if(!i[a]){d=a;break}if(d<0){s.dropped++,l(c);return}try{const a=r.from,o=r.target;if(!W(a)||!o)throw new Error("mote event has no finite source/target");const N=E(++I);let A,v,b;if(o.type==="river"){const h=W(o)?o:t.slots?.(o.id)?.[o.slot];if(!W(h))throw new Error("river mote has no finite reserved slot");A=h.x,v=h.y??0,b=h.z}else if(o.type==="nimbus"){const h=t.rivers?.center;A=Number.isFinite(h?.[0])?h[0]:0,b=Number.isFinite(h?.[1])?h[1]:0,v=530+N*80}else throw new Error("unknown mote target");const Y=Math.hypot(A-a.x,v-(a.y??0),b-a.z),Z=Y>1500,L=Z?2.5:3+4*$(Y/1500,0,1),S=o.id==="peach"||o.type==="nimbus"&&N>.5?te:ee;n.iFrom.setXYZ(d,a.x,a.y??0,a.z),n.iTarget.setXYZW(d,A,v,b,Z?1:0),n.iLife.setXYZW(d,D,L,N,1),n.iTint.setXYZW(d,S.r,S.g,S.b,r.kind==="fish"?1:0),n.iFrom.needsUpdate=n.iTarget.needsUpdate=n.iLife.needsUpdate=n.iTint.needsUpdate=!0,q[d]=c,i[d]=1,j.set(c,d),s.active++,s.spawned++,s.peak=Math.max(s.peak,s.active),e.visible=!0}catch(a){s.errors++,s.lastError=String(a?.message||a),l(c)}}const y=t.on("mote",V);function P(r,c=null){if(!m){if(f=!T||c?.enabled===!1||c?.off===!0||!!t.disposed,f){s.active&&B();return}if(!(!Number.isFinite(r)||r<0)){D+=r,g.uniforms.uTime.value=D;for(let d=0;d<p;d++)if(i[d]&&D-n.iLife.array[d*4]+1e-7>=n.iLife.array[d*4+1]){const a=w(d);try{t.arrive(a)===!1?s.rejected++:s.arrived++}catch(o){s.errors++,s.lastError=String(o?.message||o),l(a)}}e.visible=s.active>0}}}function _(){m||(m=!0,s.disposed=!0,typeof y=="function"&&y(),B(),u.remove(e),M.dispose(),g.dispose())}return{update:P,stat:s,dispose:_}}const ne=`
  attribute vec3 iBefore;
  attribute vec3 iMiddle;
  attribute vec3 iAfter;
  attribute vec4 iShape;
  attribute vec4 iFlow;
  uniform float uTime;
  uniform vec3 uCamera;
  uniform sampler2D uReveal;
  varying vec2 vUv;
  varying vec2 vTile;
  varying float vAlpha;
  void main() {
    vUv = uv;
    float seed = iFlow.w;
    float tile = floor(clamp(seed, 0.0, 0.999999) * 16.0);
    vTile = vec2(mod(tile, 4.0), 3.0 - floor(tile / 4.0));
    float period = mix(90.0, 150.0, seed);
    float phase = fract(uTime / period + iFlow.z);
    float q = 1.0 - phase;
    vec3 control = 2.0 * iMiddle - 0.5 * (iBefore + iAfter);
    vec3 p = q*q*iBefore + 2.0*q*phase*control + phase*phase*iAfter;
    p.y += iShape.y + 0.1 * sin(uTime * 0.08 + seed * 18.0);
    float distanceToCamera = distance(p, uCamera);
    float reveal = texture2D(uReveal, vec2(fract(iFlow.x + (phase - 0.5) * iFlow.y), 0.5)).r;
    float envelope = smoothstep(0.0, 1.6, phase * period) * smoothstep(0.0, 1.6, (1.0 - phase) * period);
    float rangeFade = 1.0 - smoothstep(1050.0, 1400.0, distanceToCamera);
    vAlpha = iShape.z * envelope * rangeFade * smoothstep(0.0, 1.6, uTime) * smoothstep(0.0, 1.0, reveal);
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    view.xy += position.xy * iShape.x;
    gl_Position = projectionMatrix * view;
    if (distanceToCamera > 1400.0 || reveal < 0.001) { vAlpha = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }
  }
`,le=`
  uniform sampler2D uBokeh;
  uniform vec3 uTint;
  uniform float uBrightness;
  varying vec2 vUv;
  varying vec2 vTile;
  varying float vAlpha;
  void main() {
    vec2 tileUv = mix(vec2(1.5 / 128.0), vec2(1.0 - 1.5 / 128.0), vUv);
    vec4 texel = texture2D(uBokeh, (vTile + tileUv) * 0.25);
    float mask = texel.a * max(texel.r, max(texel.g, texel.b));
    gl_FragColor = vec4(uTint, mask * vAlpha * uBrightness);
    #include <colorspace_fragment>
  }
`,O=()=>new Promise(u=>setTimeout(u,0));function ue(u,t,{bokehTexture:x,revealTextures:p,brightness:T=1}={}){if(!x?.isTexture||!p?.gold?.isTexture||!p?.peach?.isTexture)throw new Error("createRiverDust requires shared Lux bokeh and gold/peach reveal textures");if(!u?.add||typeof t?.sample!="function")throw new Error("createRiverDust requires scene and LG.sample");const M=Array.isArray(t.rivers)?t.rivers:t.rivers?.rivers;if(!Array.isArray(M))throw new Error("createRiverDust requires river data");const n=[],g=new ie,e={ready:!1,disposed:!1,bokeh:0,dust:0,particles:0,drawCalls:0,maxBuildSliceMs:0,buildMs:0,error:null};let i=!1,q=0;function j(m,f=null){if(!(i||!Number.isFinite(m)||m<0)){q+=m,f?.camera?.getWorldPosition?f.camera.getWorldPosition(g):f?.camera?.position&&g.copy(f.camera.position);for(let l=0;l<n.length;l++){const w=n[l];w.material.uniforms.uTime.value=q,w.mesh.visible=f?.enabled!==!1&&f?.off!==!0&&!t.disposed}}}function s(){if(!i){i=!0,e.disposed=!0;for(let m=0;m<n.length;m++){const f=n[m];u.remove(f.mesh),f.geometry.dispose(),f.material.dispose()}n.length=0,e.drawCalls=0}}async function D(){const m=performance.now();await O();let f=performance.now();for(const l of M){if(i)return;if(l.id!=="gold"&&l.id!=="peach")continue;const w=l.cum?.at(-1);if(!Number.isFinite(w)||w<=0)throw new Error(`invalid dust river length: ${l.id}`);const B=Math.ceil(w/45),V=Math.ceil(w/20),y=B+V,P=new Float32Array(y*3),_=new Float32Array(y*3),r=new Float32Array(y*3),c=new Float32Array(y*4),d=new Float32Array(y*4),a=l.id==="gold"?1071:5237;for(let v=0;v<y;v++){if(i)return;const b=v<B,Y=b?v:v-B,Z=b?B:V,L=E(v+a),S=(Y+L)/Z*w,h=(E(v+a+19)-.5)*.55,U=t.sample(l.id,S-60),F=t.sample(l.id,S),k=t.sample(l.id,S+60);if(!W(U)||!W(F)||!W(k)||!Number.isFinite(F.w))throw new Error(`invalid dust sample: ${l.id}`);const z=v*3;P[z]=U.x-U.tz*h*U.w,P[z+1]=U.y,P[z+2]=U.z+U.tx*h*U.w,_[z]=F.x-F.tz*h*F.w,_[z+1]=F.y,_[z+2]=F.z+F.tx*h*F.w,r[z]=k.x-k.tz*h*k.w,r[z+1]=k.y,r[z+2]=k.z+k.tx*h*k.w;const C=v*4;c[C]=b?.6+1.4*L:.04+.08*L,c[C+1]=b?1+3*E(v+a+37):.3+2.2*E(v+a+37),c[C+2]=b?.025+.025*E(v+a+71):.1,c[C+3]=b?1:0,d[C]=S/w,d[C+1]=120/w,d[C+2]=E(v+a+101),d[C+3]=L,(v&31)===31&&performance.now()-f>=4&&(e.maxBuildSliceMs=Math.max(e.maxBuildSliceMs,performance.now()-f),await O(),f=performance.now())}if(i)return;const o=new Q;o.setAttribute("position",new X([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),o.setAttribute("uv",new X([0,0,1,0,1,1,0,1],2)),o.setIndex([0,1,2,0,2,3]),o.setAttribute("iBefore",new R(P,3)),o.setAttribute("iMiddle",new R(_,3)),o.setAttribute("iAfter",new R(r,3)),o.setAttribute("iShape",new R(c,4)),o.setAttribute("iFlow",new R(d,4)),o.instanceCount=y;const N=new H({uniforms:{uTime:{value:q},uCamera:{value:g},uReveal:{value:p[l.id]},uBokeh:{value:x},uTint:{value:l.id==="gold"?ee:te},uBrightness:{value:Number.isFinite(T)?Math.max(0,T):1}},vertexShader:ne,fragmentShader:le,transparent:!0,depthTest:!0,depthWrite:!1,blending:J,toneMapped:!1}),A=new K(o,N);A.name=`lg_river_dust_${l.id}`,A.frustumCulled=!1,A.renderOrder=4,u.add(A),n.push({mesh:A,geometry:o,material:N}),e.bokeh+=B,e.dust+=V,e.particles+=y,e.drawCalls=n.length,e.maxBuildSliceMs=Math.max(e.maxBuildSliceMs,performance.now()-f),await O(),f=performance.now()}e.buildMs=performance.now()-m,e.ready=!i}const I={ready:null,update:j,stat:e,dispose:s};return I.ready=D().then(()=>I).catch(m=>{throw e.error=String(m?.message||m),s(),m}),I}export{de as createMotes,ue as createRiverDust};
