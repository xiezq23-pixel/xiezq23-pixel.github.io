import{a4 as ie,j,a5 as S,a6 as ae,h as ne,r as oe,S as re,A as se,k as le}from"./three.module-BbQ0mWiG.js";const Z=64,q=30,g=Z*q,U=["gold","peach"],_=s=>{const n=Math.sin(s*127.1+311.7)*43758.5453;return n-Math.floor(n)},W=s=>s&&Number.isFinite(s.x)&&Number.isFinite(s.y)&&Number.isFinite(s.z),ue=`
  attribute vec3 iTop;
  attribute vec3 iGround;
  attribute vec4 iLife;
  attribute vec3 iShape;
  uniform float uTime;
  uniform vec3 uCamera;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vUv = uv;
    float age = uTime - iLife.x;
    float duration = max(0.1, (iTop.y - iGround.y) / 8.0);
    float t = clamp(age / duration, 0.0, 1.0);
    vec3 p = mix(iTop, iGround, t);
    // 高度严格为每秒8米，与state的落地/洇开延时相同；横向仅极轻慢摆。
    float envelope = sin(t * 3.14159265);
    p.x += envelope * 0.22 * sin(age * 0.28 + iLife.z * 24.0);
    p.z += envelope * 0.18 * cos(age * 0.23 + iLife.z * 17.0);
    float distanceToCamera = distance(p, uCamera);
    float rangeFade = 1.0 - smoothstep(1300.0, 1800.0, distanceToCamera);
    vAlpha = iShape.z * smoothstep(0.0, 0.7, age)
      * (1.0 - smoothstep(duration - 0.6, duration, age))
      * (1.0 - smoothstep(iLife.y - 1.5, iLife.y, uTime)) * rangeFade;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vec2 up = (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xy;
    up /= max(length(up), 0.001);
    vec2 right = vec2(up.y, -up.x);
    view.xy += right * position.x * iShape.x + up * position.y * iShape.y;
    gl_Position = projectionMatrix * view;
    if (age < 0.0 || age >= duration || uTime >= iLife.y || distanceToCamera > 1800.0) {
      vAlpha = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    }
  }
`,ce=`
  uniform sampler2D uRain;
  uniform vec3 uTint;
  uniform float uBrightness;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    // PNG底部是滴头；TextureLoader默认flipY=true对应uv.y=0。
    // The source droplet occupies six pixels of its padded 64px texture.
    // Crop only the transparent horizontal margin so its real core stays visible.
    vec4 art = texture2D(uRain, vec2(mix(0.4, 0.6, vUv.x), vUv.y));
    float mask = art.a * max(art.r, max(art.g, art.b));
    gl_FragColor = vec4(uTint, mask * vAlpha * uBrightness);
    #include <colorspace_fragment>
  }
`;function de(s,n,{rainTexture:A,camera:V=null,renderer:$=null,sound:y=null,brightness:k=1}={}){if(!A?.isTexture||!s?.add||typeof n?.sample!="function"||typeof n?.slots!="function")throw Error("createRain requires scene, LG and the shared Lux rain texture");const c=new ie;c.setAttribute("position",new j([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),c.setAttribute("uv",new j([0,0,1,0,1,1,0,1],2)),c.setIndex([0,1,2,0,2,3]),c.instanceCount=0;const f={iTop:new S(new Float32Array(g*3),3),iGround:new S(new Float32Array(g*3),3),iLife:new S(new Float32Array(g*4),4),iShape:new S(new Float32Array(g*3),3)};for(const[l,o]of Object.entries(f))o.setUsage(ae),c.setAttribute(l,o);const m=new ne,x=A.clone();x.anisotropy=Math.max(A.anisotropy,Math.min(8,$?.capabilities?.getMaxAnisotropy?.()??4)),x.needsUpdate=!0;const M={uTime:{value:0},uCamera:{value:m},uRain:{value:x},uTint:{value:new oe("#e7c783")},uBrightness:{value:Math.max(0,Number.isFinite(k)?k:1)}},B=new re({uniforms:M,vertexShader:ue,fragmentShader:ce,transparent:!0,depthWrite:!1,depthTest:!0,blending:se,toneMapped:!1}),p=new le(c,B);p.name="lg_completion_rain",p.frustumCulled=!1,p.renderOrder=5,p.visible=!1,s.add(p);const t={ready:!0,disposed:!1,capacity:g,particles:0,slots:0,drawCalls:0,event:null,speed:8,soundCalls:0,maxPopulateMs:0,skippedSlots:0,error:null},d=new Set;let T=!1,r=Number.isFinite(n.time)?n.time:0,D=null,E=null,C=0,I=0,F=!1;function H(l,o){const v=performance.now(),b=n.slots(l);let u=!1;F=!1;for(let e=0;e<b.length;e++){const i=b[e];if(!i.filled||!W(i)||(Math.hypot(i.x-m.x,i.z-m.z)<1400&&(F=!0),d.has(e)))continue;if(t.slots>=Z){t.skippedSlots++,d.add(e);continue}const a=n.sample(l,i.s);if(!W(a)||!Number.isFinite(a.tx)||!Number.isFinite(a.tz)){t.error=`invalid rain ground sample: ${l}/${e}`,d.add(e);continue}const O=Math.max(o.rainStart,(Number.isFinite(i.t)?i.t:o.completeAt)+1.5),Y=(i.y-a.y)/8;if(!(Y>0)){d.add(e);continue}const Q=Math.max(0,Math.min(4.8,o.rainEnd-O-Y)),G=Math.min(18,Math.max(4,(a.w??26)*.65));for(let h=0;h<q;h++){const w=t.particles++,N=_(e*71+h+(l==="gold"?307:911)),P=_(e*41+h+29),R=_(e*53+h+97),L=(P-.5)*G,X=(R-.5)*32,ee=a.x+a.tx*X-a.tz*L,te=a.z+a.tz*X+a.tx*L;f.iTop.setXYZ(w,i.x+(P-.5)*34,i.y,i.z+(R-.5)*34),f.iGround.setXYZ(w,ee,a.y+.05,te),f.iLife.setXYZW(w,O+N*Q,o.rainEnd,N,1),f.iShape.setXYZ(w,.8+.4*N,1+2*R,.22+.12*P)}d.add(e),t.slots++,u=!0}if(u){for(const e of Object.values(f))e.needsUpdate=!0;c.instanceCount=t.particles}t.maxPopulateMs=Math.max(t.maxPopulateMs,performance.now()-v)}function J(l,o=null){if(T||!Number.isFinite(l)||l<0)return;r=Number.isFinite(n.time)?n.time:r+l,M.uTime.value=r;const v=o?.camera??V;v?.getWorldPosition?v.getWorldPosition(m):v?.position?m.copy(v.position):o?.player?.pos&&m.copy(o.player.pos);const b=o?.enabled!==!1&&o?.off!==!0&&!n.disposed;let u=null,e=null;for(let i=0;i<U.length;i++){const a=n.weather?.[U[i]];Number.isFinite(a?.completeAt)&&Number.isFinite(a.rainStart)&&Number.isFinite(a.rainEnd)&&r>=a.completeAt&&r<a.rainEnd&&(u=U[i],e=a)}if((u!==D||e?.completeAt!==E)&&(D=u,E=e?.completeAt??null,t.event=u,t.particles=0,t.slots=0,d.clear(),c.instanceCount=0,C=r,u&&M.uTint.value.set(u==="gold"?"#e7c783":"#edc8d3")),e&&r>=C&&(H(u,e),C=r+.5),p.visible=b&&!!e&&t.particles>0&&r>=e.rainStart,t.drawCalls=p.visible?1:0,p.visible&&F&&r>=I&&r>e.rainStart+2){I=r+1.4;try{typeof y=="function"?(y(),t.soundCalls++):typeof y?.lgRain=="function"&&(y.lgRain(),t.soundCalls++)}catch(i){t.error=String(i?.message||i)}}}function K(){T||(T=!0,t.disposed=!0,t.drawCalls=0,t.particles=0,d.clear(),s.remove(p),c.dispose(),B.dispose(),x.dispose())}const z={ready:null,update:J,stat:t,dispose:K};return z.ready=Promise.resolve(z),z}export{de as createRain};
