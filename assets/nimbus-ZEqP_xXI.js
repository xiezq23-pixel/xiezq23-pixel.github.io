import{a4 as P,j as F,a5 as _,r as g,V as z,S as V,A as E,k as L}from"./three.module-BbQ0mWiG.js";const f=12,c=n=>{const e=Math.sin(n*127.1+311.7)*43758.5453;return e-Math.floor(e)},T=n=>Math.max(0,Math.min(1,n)),U=`
  attribute vec4 iLayer;
  uniform float uTime;
  uniform float uLevel;
  uniform float uVisible;
  uniform vec2 uCenter;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vUv = uv; vSeed = iLayer.w;
    float radius = mix(120.0, 900.0, uLevel);
    float angle = iLayer.w * 6.2831853;
    vec3 p = vec3(uCenter.x + iLayer.x * radius, mix(550.0,700.0,uLevel) + iLayer.y * radius * 0.16, uCenter.y + iLayer.z * radius);
    p.x += radius * 0.02 * sin(uTime * 0.022 + angle);
    p.z += radius * 0.02 * cos(uTime * 0.018 + angle);
    vec4 view = modelViewMatrix * vec4(p,1.0);
    float scale = radius * mix(1.25, 1.7, iLayer.w);
    float turn = sin(uTime * 0.012 + angle) * 0.04;
    mat2 rotation = mat2(cos(turn), -sin(turn), sin(turn), cos(turn));
    view.xy += rotation * (position.xy * vec2(scale, scale * 0.42));
    vAlpha = (0.024 + iLayer.w * 0.012) * uVisible * (0.4 + 0.6 * uLevel);
    gl_Position = projectionMatrix * view;
    // 只压缩远裁面深度，仍开启depthTest，因此近处路面/鱼群照常挡住云。
    if (gl_Position.w > 0.0) gl_Position.z = min(gl_Position.z, gl_Position.w * 0.99999);
  }
`,k=`
  uniform sampler2D uHaze;
  uniform float uTime;
  uniform float uGrowAt;
  uniform float uEnding;
  uniform float uBrightness;
  uniform vec3 uGold;
  uniform vec3 uPeach;
  uniform vec3 uMoon;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec4 art = texture2D(uHaze, vUv);
    float mask = art.a * max(art.r, max(art.g, art.b));
    float blend = 0.5 + 0.5 * sin(uTime * 0.16 + vSeed * 2.8 + vUv.x * 1.2);
    vec3 tint = mix(uGold, uPeach, blend);
    tint = mix(tint, uMoon, 0.12 + 0.04 * sin(uTime * 0.09 + vSeed * 6.0));
    tint = mix(tint, vec3(0.94,0.86,0.74), uEnding * 0.6);
    // 到达时的宽柔亮波仅调制真实纹理；不画光环或另造云轮廓。
    float age = max(0.0, uTime - uGrowAt);
    float distanceFromMiddle = length((vUv - 0.5) * vec2(1.0,1.4));
    float wave = exp(-pow((distanceFromMiddle - age * 0.12) / 0.3, 2.0))
      * smoothstep(0.0,0.7,age) * (1.0-smoothstep(2.8,5.0,age));
    float slowBreath = 0.98 + 0.02 * sin(uTime * 0.19 + vSeed * 3.0);
    gl_FragColor = vec4(tint, mask * vAlpha * slowBreath * (1.0 + 0.16 * wave) * uBrightness);
    #include <colorspace_fragment>
  }
`;function I(n,e,{hazeTexture:b,brightness:w=1}={}){if(!b?.isTexture||!n?.add||typeof e?.on!="function")throw Error("createNimbus requires scene, LG and the shared Lux haze texture");const r=new P;r.setAttribute("position",new F([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),r.setAttribute("uv",new F([0,0,1,0,1,1,0,1],2)),r.setIndex([0,1,2,0,2,3]);const o=new Float32Array(f*4);for(let i=0;i<f;i++){const d=c(i+931);o[i*4]=(c(i+401)-.5)*.8,o[i*4+1]=(c(i+521)-.5)*.6,o[i*4+2]=(c(i+631)-.5)*.8,o[i*4+3]=d}r.setAttribute("iLayer",new _(o,4)),r.instanceCount=f;const v=e.rivers?.center,s={uTime:{value:0},uLevel:{value:0},uVisible:{value:0},uGrowAt:{value:-100},uEnding:{value:0},uCenter:{value:new z(Number.isFinite(v?.[0])?v[0]:0,Number.isFinite(v?.[1])?v[1]:0)},uHaze:{value:b},uBrightness:{value:Math.max(0,Number.isFinite(w)?w:1)},uGold:{value:new g("#f0cf72")},uPeach:{value:new g("#f4cdd6")},uMoon:{value:new g("#cfe3ee")}},y=new V({uniforms:s,vertexShader:U,fragmentShader:k,transparent:!0,depthWrite:!1,depthTest:!0,blending:E,toneMapped:!1}),t=new L(r,y);t.name="lg_final_nimbus",t.frustumCulled=!1,t.renderOrder=5,t.visible=!1,n.add(t);const a={ready:!0,disposed:!1,layers:f,drawCalls:0,level:0,radius:120,height:550,arrivalWaves:0};let p=!1,l=Number.isFinite(e.time)?e.time:0,m=0,u=0;const x=e.on("nimbusGrow",()=>{s.uGrowAt.value=Number.isFinite(e.time)?e.time:l,a.arrivalWaves++});function C(i,d=null){if(p||!Number.isFinite(i)||i<0)return;l=Number.isFinite(e.time)?e.time:l+i,s.uTime.value=l;const A=e.stat?.phase??e.phase,S=T(Number.isFinite(e.stat?.nimbusLevel)?e.stat.nimbusLevel:0),B=(A==="nimbus"||A==="ending")&&d?.enabled!==!1&&d?.off!==!0&&!e.disposed;u+=(S-u)*(1-Math.exp(-i/3)),m+=((B?1:0)-m)*(1-Math.exp(-i/1.6)),s.uLevel.value=u,s.uVisible.value=m;const M=e.weather?.nimbus?.completeAt;s.uEnding.value=Number.isFinite(M)?T((l-M)/12):0,t.visible=m>.001,a.drawCalls=t.visible?1:0,a.level=u,a.radius=120+780*u,a.height=550+150*u}function N(){p||(p=!0,a.disposed=!0,a.drawCalls=0,typeof x=="function"&&x(),n.remove(t),r.dispose(),y.dispose())}const h={ready:null,update:C,stat:a,dispose:N};return h.ready=Promise.resolve(h),h}export{I as createNimbus};
