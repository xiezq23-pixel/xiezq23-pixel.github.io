import{G as be,h as re,V as Me,y as Ce,N as se,a9 as K,z as ie,aa as oe,$ as J,av as Te,S as ne,O as ze,u as ke,aw as Se,v as Fe,D as De,k as Z,a4 as _e,j as O,a5 as Q,a6 as G,b as Be,R as Pe,i as Re,r as We}from"./three.module-BbQ0mWiG.js";import{createRiverDust as Ae,createMotes as Ee}from"./motes-C1wfvyVs.js";import{createWeather as Ne}from"./mist-Do_4HeQE.js";import"./rain-CjrgI1ic.js";import"./nimbus-ZEqP_xXI.js";const I=300,N=1024,le=1400,Ue=1800,j=(h,c,l)=>Math.max(c,Math.min(l,h)),ue=h=>(h=j(h,0,1),h*h*(3-2*h)),de=()=>new Promise(h=>setTimeout(h,0)),ce=h=>(h==="gold"?["#8a6a2a","#a39a72","#baae7a","#c9a54e","#f0cf72","#fff1c2"]:["#9c7f86","#b5989e","#c697a4","#d9a6b3","#f4cdd6","#fff4f2"]).map(c=>new We(c)),he={transparent:!0,depthWrite:!1,depthTest:!0,side:De,blending:Fe,blendEquation:Se,blendSrc:ke,blendDst:ze,toneMapped:!1},Le=`
  attribute vec4 aRiver; // s, lateral [-1,1], layer (3=far, 4=soft halo), chunk index
  varying vec4 vRiver; varying vec3 vWorld;
  void main() {
    vRiver = aRiver; vWorld = (modelMatrix * vec4(position,1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld,1.0);
    // The existing camera far stays unchanged. Only the faint 4km guide strip is
    // depth-clamped to the far plane; foreground scene depth still occludes it.
    if (aRiver.z > 2.5 && aRiver.z < 3.5 && gl_Position.w > 0.0)
      gl_Position.z = min(gl_Position.z, gl_Position.w * 0.9998);
  }
`,$e=`
  uniform sampler2D uFlow, uBrush, uReveal, uLoaded;
  uniform float uTime, uNight, uLength, uChunks, uBrightness, uSoftness;
  uniform vec3 uFish, uCamera; uniform vec2 uFishDir; uniform vec3 uPalette[6];
  varying vec4 vRiver; varying vec3 vWorld;
  void main() {
    float s=vRiver.x, lat=vRiver.y, layer=vRiver.z;
    bool farLine=layer>2.5 && layer<3.5;
    bool halo=layer>3.5;
    vec4 reveal=texture2D(uReveal,vec2(clamp(s/uLength,0.0,1.0),0.5));
    float open=(farLine || halo) ? reveal.r : (layer<0.5 ? reveal.r : (layer<1.5 ? reveal.g : reveal.b));
    if(open<0.002) discard;
    float distanceToEye=length(vWorld.xz-uCamera.xz);
    float loaded=texture2D(uLoaded,vec2((floor(vRiver.w+0.001)+0.5)/uChunks,0.5)).r;
    float nearWeight=(1.0-smoothstep(1200.0,1400.0,distanceToEye))*loaded;
    float lod=farLine ? 1.0-nearWeight : nearWeight;
    if(lod<0.002 || distanceToEye>4100.0) discard;
    float speed=halo ? 4.0 : (layer<0.5 ? 7.0 : (layer<1.5 ? 11.2 : 14.0));
    vec2 flowUV=vec2((s-uTime*speed)/256.0,lat*0.37+0.5+layer*0.131);
    vec3 flow=texture2D(uFlow,flowUV).rgb;
    float transverse=clamp(lat*0.5+0.5+(flow.b-0.5)*0.035,0.0,1.0);
    float brush=texture2D(uBrush,vec2(fract(s/340.0+layer*0.23+uTime*0.003),transverse)).r;
    float edge=1.0-smoothstep(mix(0.66,0.30,clamp(uSoftness-0.5,0.0,1.0)),1.0,abs(lat));
    float density=(0.56+flow.r*0.44)*mix(0.30,1.0,brush)*edge;
    vec3 col=layer<0.5 ? mix(uPalette[0],uPalette[1],flow.r)
      : (layer<1.5 ? mix(uPalette[2],uPalette[3],flow.r) : mix(uPalette[4],uPalette[5],flow.g*0.13));
    vec3 d=vWorld-uFish; float ahead=dot(d.xz,uFishDir);
    d.xz-=uFishDir*clamp(ahead,0.0,60.0)*0.55; d.y*=2.0;
    float dd=length(d), fish=exp(-pow(dd/34.0,2.0))*0.40+exp(-pow(dd/110.0,2.0))*0.18;
    // Keep the two coloured routes readable against the clearer daytime sky.
    float day=0.9+0.1*uNight;
    float opacity=layer<0.5 ? 0.24 : (layer<1.5 ? 0.30 : 0.27);
    // Real Lux fine-grain channel, subdued so crossing a grain cannot flash.
    float dust=layer>1.5 ? flow.g*0.045 : 0.0;
    float fog=exp(-pow(distanceToEye*(farLine?0.00015:0.00043),2.0));
    float alpha=density*opacity*open*lod*fog;
    float light=(1.0+fish+dust)*day*uBrightness;
    if(halo) {
      // The added width reuses the Lux paint and flow samples. Its low contrast
      // makes a broad, continuous glow; no bloom pass, sparkle or extra draw.
      float softEdge=pow(1.0-smoothstep(0.0,1.0,abs(lat)),2.0);
      float paint=(0.90+0.10*flow.r)*(0.88+0.12*brush);
      alpha=softEdge*paint*0.24*open*lod*fog;
      col=mix(uPalette[3],uPalette[4],0.72);
      gl_FragColor=vec4(col*alpha*day*uBrightness*1.65,alpha*0.20);
      return;
    }
    if(farLine) {
      float core=1.0-smoothstep(0.08,0.32,abs(lat));
      float haloEdge=pow(1.0-smoothstep(0.0,1.0,abs(lat)),2.0);
      col=mix(uPalette[3],uPalette[4],0.58);
      alpha=(haloEdge*0.16+core*0.24)*(0.9+0.1*flow.r)*open*lod*fog*(1.0-smoothstep(3600.0,4100.0,distanceToEye));
      light=day*uBrightness*1.25;
    }
    // Gently luminous premultiplied paint: retain atmosphere behind the ribbon.
    gl_FragColor=vec4(col*alpha*light*1.25,alpha*0.58);
  }
`,qe=`
  attribute vec3 iCenter; attribute vec4 iShape; attribute vec2 iData;
  varying vec2 vUv; varying vec3 vWorld; varying vec2 vData;
  void main() {
    vec2 axis=iShape.xy, normal=vec2(-axis.y,axis.x);
    vec2 xz=iCenter.xz+axis*position.x*iShape.z+normal*position.y*iShape.w;
    vWorld=vec3(xz.x,iCenter.y,xz.y); vUv=uv; vData=iData;
    gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);
  }
`,Ie=`
  uniform sampler2D uCaustic, uBrush, uReveal; uniform float uTime,uLength,uNight,uBrightness;
  uniform vec3 uCamera,uTint;
  varying vec2 vUv; varying vec3 vWorld; varying vec2 vData;
  void main() {
    float reveal=texture2D(uReveal,vec2(vData.x/uLength,0.5)).r;
    float d=length(vWorld.xz-uCamera.xz), fade=1.0-smoothstep(950.0,1400.0,d);
    vec2 p=vUv*2.0-1.0;
    float mask=(1.0-smoothstep(0.15,1.0,abs(p.x)))*(1.0-smoothstep(0.2,1.0,abs(p.y)));
    float tex=texture2D(uBrush,vec2(fract(vData.x/330.0),vUv.y)).r;
    if(vData.y>0.5) tex=0.35+0.4*texture2D(uCaustic,vUv*1.3+vec2(uTime*0.012,uTime*0.006)).r
      +0.25*texture2D(uCaustic,vUv*0.85+vec2(-uTime*0.008,uTime*0.004)).r;
    float a=mask*tex*reveal*fade*(vData.y>0.5?0.18:0.11)*(0.7+uNight*0.3)*uBrightness;
    if(a<0.001) discard;
    gl_FragColor=vec4(uTint*a*1.3,a*0.25);
  }
`;function fe(h,c){const l=new Be(h,c,1,Pe);return l.minFilter=l.magFilter=J,l.generateMipmaps=!1,l.needsUpdate=!0,l}function pe(h,c,l){const f=new Re;return f.setAttribute("position",new O(h,3)),f.setAttribute("aRiver",new O(c,4)),f.setIndex(l),f.computeBoundingSphere(),f}function*je(h,c,l){const f=[],U=[],w=[],z=Math.ceil((l.end-l.start)/4),g=7,W=4;for(let k=0;k<=z;k++){const x=l.start+(l.end-l.start)*k/z,M=h.sample(c.id,x);for(let m=0;m<W;m++)for(let b=0;b<g;b++){const y=b/(g-1)*2-1,A=M.w*[1.15,.9,.45,2.15][m]*.5;if(f.push(M.x-M.tz*y*A,M.y+[.15,.6,1.2,.1][m],M.z+M.tx*y*A),U.push(x,y,m===3?4:m,l.index),k<z&&b<g-1){const D=k*g*W+m*g+b,_=D+g*W;w.push(D,_,D+1,D+1,_,_+1)}}k%8===7&&(yield)}return pe(f,U,w)}function Ke(h,c,l={}){if(!c?.sample||!c?.rivers?.rivers)throw Error("流光 C 需要真实 LG.rivers 和 sample");const f=new be;f.name="liuguang_C_river_fx",h.add(f);const U=[],w=[],z=new Set,g=new re,W=new re,k=new Me(0,1);let x=!1,M=null,m=null,b=null,y=null,A=0,D=0,_=0,V=0,B=l.brightness??1,$=l.softness??1,H=1;const u={ready:!1,scope:"two rain-formed rivers + motes + final accumulating light haze",nearChunks:0,chunkCandidates:0,farDraws:0,bleedPatches:0,bridgePatches:0,bridgePending:0,buildSlices:0,maxBuildSliceMs:0,cpuMeanMs:0,cpuMaxMs:0,textureSources:null,weatherSources:null,textureBytes:0,errors:[],deferred:[],halo:{nearWidthScale:2.15,farWidthScale:1.9,nearLayers:4,extraDrawCalls:0,dayBrightness:.9}};function P(t){return U.push(t),t}function me(t,s){return{uTime:{value:0},uNight:{value:1},uLength:{value:t.length},uChunks:{value:t.chunks.length},uBrightness:{value:B},uSoftness:{value:$},uFish:{value:W},uFishDir:{value:k},uCamera:{value:g},uPalette:{value:ce(t.id)},uFlow:{value:s[`flow_${t.id}`]},uBrush:{value:s.brush_lut},uReveal:{value:t.revealTexture},uLoaded:{value:t.loadedTexture}}}const ve=(async()=>{try{const t=await fetch("/tex/liuguang/c_manifest.json");if(!t.ok)throw Error(`流光 C 来源清单 HTTP ${t.status}`);const s=await t.json();u.textureSources=s;const r=new Ce,n={};await Promise.all(["flow_gold","flow_peach","brush_lut","bokeh_atlas","bridge_caustic"].map(async a=>{if(!s.textures?.[a])throw Error(`Lux3D 清单缺 ${a}`);const e=await r.loadAsync(`/tex/liuguang/${a}.png`);if(x){e.dispose();return}e.colorSpace=se,e.wrapS=a==="bokeh_atlas"?K:ie,e.wrapT=a.startsWith("flow")||a==="bridge_caustic"?ie:K,e.minFilter=oe,e.magFilter=J,n[a]=P(e),u.textureBytes+=s.textures[a].bytes??0}));const p=await fetch("/tex/liuguang/weather_manifest.json");if(!p.ok)throw Error(`雨云来源清单 HTTP ${p.status}`);const d=await p.json();if(u.weatherSources=d,await Promise.all(["cloud_haze","rain_drop"].map(async a=>{const e=d.textures?.[a];if(!e?.taskId)throw Error(`缺少雨云 Lux 来源 ${a}`);const i=await r.loadAsync(e.file);if(x){i.dispose();return}i.colorSpace=se,i.wrapS=i.wrapT=K,i.minFilter=oe,i.magFilter=J,n[a]=P(i),u.textureBytes+=e.bytes??0})),x)return;for(const a of c.rivers.rivers){const e=a.cum.at(-1),i=Math.ceil(e/I),o={id:a.id,source:a,length:e,chunks:[],reveal:new Uint8Array(N*4),onset:new Float64Array(N).fill(NaN),loaded:new Uint8Array(i*4),patches:[],patchMeshes:[],bridgeDone:new Set};for(let T=0;T<i;T++){const R=T*I,S=Math.min(e,R+I),L=c.sample(o.id,(R+S)/2);o.chunks.push({r:o,index:T,start:R,end:S,x:L.x,z:L.z,radius:(S-R)/2+40,mesh:null,fade:0})}o.revealTexture=P(fe(o.reveal,N)),o.loadedTexture=P(fe(o.loaded,i)),o.loadedTexture.minFilter=o.loadedTexture.magFilter=Te,o.material=P(new ne({...he,uniforms:me(o,n),vertexShader:Le,fragmentShader:$e})),o.material.name=`Lux3D_liuguang_${o.id}`;const C=[],v=[],E=[],X=Math.ceil(e/24);for(let T=0;T<=X;T++){const R=e*T/X,S=c.sample(o.id,R),L=S.w*.95;for(let F=0;F<2;F++){const Y=F*2-1;C.push(S.x-S.tz*Y*L,S.y+.18,S.z+S.tx*Y*L),v.push(R,Y,3,Math.min(i-1,Math.floor(R/I)))}if(T<X){const F=T*2;E.push(F,F+2,F+1,F+1,F+2,F+3)}if(T%400===399&&await de(),x)return}const q=new Z(P(pe(C,v,E)),o.material);q.name=`lg_${o.id}_far`,q.frustumCulled=!1,q.renderOrder=6,f.add(q),u.farDraws++;const we={uCaustic:{value:n.bridge_caustic},uBrush:{value:n.brush_lut},uReveal:{value:o.revealTexture},uLength:{value:e},uTime:{value:0},uNight:{value:1},uBrightness:{value:B},uCamera:{value:g},uTint:{value:ce(o.id)[3]}};o.patchMaterial=P(new ne({...he,uniforms:we,vertexShader:qe,fragmentShader:Ie})),w.push(o)}for(const a of w)for(let e=0;e<N;e++)if(ee(a,e),e%128===127&&await de(),x)return;if(m=Ae(f,c,{bokehTexture:n.bokeh_atlas,revealTextures:Object.fromEntries(w.map(a=>[a.id,a.revealTexture])),brightness:B}),await m.ready,x){m.dispose();return}if(M=Ee(f,c,{bokehTexture:n.bokeh_atlas,capacity:64}),u.motes=M.stat,u.dust=m.stat,b=Ne(f,c,{hazeTexture:n.cloud_haze,rainTexture:n.rain_drop,bokehTexture:n.bokeh_atlas,renderer:l.renderer,camera:l.camera,sound:l.sound}),await b.ready,x){b.dispose();return}u.weather=b.stat;for(const a of w)a.tex=n,a.patchCursor=0,a.patchCount=0,a.patchCandidates=[...(a.source.junctions??[]).filter(e=>e.with==="road").map(e=>({s:e.s,node:e.node,bridge:!1})),...(a.source.underDeck??[]).map(([e,i])=>({s:(e+i)/2,bridge:!0}))].map(e=>({...e,...c.sample(a.id,e.s)})),te(a,[]);u.ready=!0}catch(t){throw u.errors.push(t.message),x||ae(),t}})();function ee(t,s){const r=j(c.revealAt(t.id,t.length*s/(N-1)),0,1),n=c.time??_;if(r<=0)t.onset[s]=NaN;else if(r<1&&!Number.isFinite(t.onset[s])){const d=.5-Math.sin(Math.asin(1-2*r)/3);t.onset[s]=n-d*3}const p=s*4;t.reveal[p]=Math.round(r*255);for(let d=1;d<3;d++)t.reveal[p+d]=Math.round((Number.isFinite(t.onset[s])?ue((n-t.onset[s]-d*.4)/3):r)*255);t.reveal[p+3]=255}function te(t,s){if(t.patchGeometry){const d=t.patchGeometry;for(const a of s){const e=t.patchCount++;d.attributes.iCenter.setXYZ(e,a.x,a.y,a.z),d.attributes.iShape.setXYZW(e,a.tx,a.tz,a.length,a.width),d.attributes.iData.setXY(e,a.s,a.bridge?1:0)}d.instanceCount=t.patchCount;for(const a of["iCenter","iShape","iData"])d.attributes[a].needsUpdate=!0;return}const r=P(new _e);r.setAttribute("position",new O([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),r.setAttribute("uv",new O([0,0,1,0,1,1,0,1],2)),r.setIndex([0,1,2,0,2,3]);const n=t.patchCandidates.length||1;r.setAttribute("iCenter",new Q(new Float32Array(n*3),3).setUsage(G)),r.setAttribute("iShape",new Q(new Float32Array(n*4),4).setUsage(G)),r.setAttribute("iData",new Q(new Float32Array(n*2),2).setUsage(G)),r.instanceCount=0;const p=new Z(r,t.patchMaterial);p.frustumCulled=!1,p.renderOrder=8,f.add(p),t.patchMeshes.push(p),t.patchGeometry=r}function ge(t){const s=l.track;if(!s?.query||!t.patchCandidates.length)return;let r;for(let e=0;e<t.patchCandidates.length;e++){const i=t.patchCandidates[t.patchCursor++%t.patchCandidates.length];if(!i.attached&&Math.hypot(i.x-g.x,i.z-g.z)<le){r=i;break}}if(!r)return;let n=null,p=r.bridge?65:35;if(s.query(r.x,r.z,r.bridge?100:60,(e,i)=>{if(e.cls?.startsWith("lg_")||(r.bridge?!e.el||e.y[i]<5:e.y[i]>5))return;const o=Math.hypot(e.x[i]-r.x,e.z[i]-r.z);o<p&&(p=o,n={e,s:e.cum[i]})}),!n)return;const d=s.at(n.e,n.s,{}),a=r.bridge?{x:r.x,y:d.y-(n.e.C?.T??0)-.3,z:r.z,tx:r.tx,tz:r.tz,length:(n.e.C?.W??20)+10,width:r.w,s:r.s,bridge:!0}:{x:r.x,y:Math.max(r.y,d.y)+.12,z:r.z,tx:d.tx,tz:d.tz,length:60,width:r.w*.9,s:r.s,bridge:!1};te(t,[a]),r.attached=!0,r.bridge?u.bridgePatches++:u.bleedPatches++}function xe(t,s={}){if(!u.ready||x)return;const r=performance.now();_+=Math.max(0,t),V++;const n=s.player?.pos??s.player?.position;n&&W.copy(n),g.copy(s.camera?.position??l.camera?.position??W);const p=s.player?.dir,d=s.player?.heading??s.player?.yaw;Number.isFinite(p?.x)&&Number.isFinite(p?.z)?k.set(p.x,p.z).normalize():Number.isFinite(d)&&k.set(Math.sin(d),Math.cos(d)),H=l.track?.mat?.uniforms?.uNight?.value??(Number.isFinite(s.hour)?1-ue((Math.cos((s.hour-12)/24*Math.PI*2)+.1)/.6):1);for(const e of w){e.material.uniforms.uTime.value=_,e.material.uniforms.uNight.value=H,e.patchMaterial.uniforms.uTime.value=_,e.patchMaterial.uniforms.uNight.value=H;for(let i=0;i<32;i++)ee(e,(D+i)%N);e.revealTexture.needsUpdate=!0}if(D=(D+32)%N,A-=t,A<=0){A=.25;let e=null,i=1/0,o=0;for(const C of w)for(const v of C.chunks){const E=Math.hypot(v.x-g.x,v.z-g.z)-v.radius;v.mesh&&E>Ue&&(f.remove(v.mesh),v.mesh.geometry.dispose(),z.delete(v),v.mesh=null,v.fade=0,C.loaded[v.index*4]=0,C.loadedTexture.needsUpdate=!0),!v.mesh&&E<le&&(o++,E<i&&(i=E,e=v))}u.chunkCandidates=o,!y&&e&&(y={chunk:e,generator:je(c,e.r,e)})}if(y){const e=performance.now(),i=y.generator.next();if(u.buildSlices++,i.done){const o=y.chunk,C=new Z(i.value,o.r.material);C.name=`lg_${o.r.id}_${o.index}`,C.renderOrder=7,f.add(C),o.mesh=C,z.add(o),y=null,A=0}u.maxBuildSliceMs=Math.max(u.maxBuildSliceMs,performance.now()-e)}for(const e of z)e.fade<1&&(e.fade=Math.min(1,e.fade+t/.9),e.r.loaded[e.index*4]=Math.round(e.fade*255),e.r.loadedTexture.needsUpdate=!0);V%2===1&&ge(w[Math.floor(V/2)%w.length]),u.nearChunks=z.size,u.building=y?`${y.chunk.r.id}:${y.chunk.index}`:null,M.update(t,s),m.update(t,s),b.update(t,s);const a=performance.now()-r;u.cpuMeanMs=u.cpuMeanMs*.98+a*.02,u.cpuMaxMs=Math.max(u.cpuMaxMs,a)}function ye(t={}){B=j(t.brightness??B,.1,2),$=j(t.softness??$,.5,1.5);for(const s of w)s.material.uniforms.uBrightness.value=B,s.material.uniforms.uSoftness.value=$,s.patchMaterial.uniforms.uBrightness.value=B;m?.setStyle?.({brightness:B})}function ae(){if(!x){x=!0,u.ready=!1,y=null,M?.dispose(),m?.dispose(),b?.dispose();for(const t of z)t.mesh.geometry.dispose();z.clear();for(const t of U)t.dispose();U.length=0,f.clear(),h.remove(f)}}return{ready:ve,update:xe,stat:u,setStyle:ye,dispose:ae}}export{Ke as createLgFx};
