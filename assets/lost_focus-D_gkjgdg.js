import{V as v,S as T,aA as R,i as B,j as b,k as M,ad as _,aB as z,aC as L,N,$ as k,Z as P}from"./three.module-BbQ0mWiG.js";const q="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",E=`uniform sampler2D tColor;uniform vec2 uTexel,uFocusUv;
uniform float uAmount,uAspect,uRadius;varying vec2 vUv;
void main(){
 vec4 center=texture2D(tColor,vUv);
 vec2 away=(vUv-uFocusUv)*vec2(uAspect,1.);
 float peripheral=smoothstep(.14,.58,length(away));
 float blend=uAmount*.45*peripheral*peripheral;
 vec2 r=uTexel*uRadius*(.55+.45*peripheral);
 vec4 soft=center*.25;
 soft+=texture2D(tColor,vUv+vec2(r.x,0.))*.125;
 soft+=texture2D(tColor,vUv-vec2(r.x,0.))*.125;
 soft+=texture2D(tColor,vUv+vec2(0.,r.y))*.125;
 soft+=texture2D(tColor,vUv-vec2(0.,r.y))*.125;
 soft+=texture2D(tColor,vUv+r)*.0625;
 soft+=texture2D(tColor,vUv-r)*.0625;
 soft+=texture2D(tColor,vUv+vec2(r.x,-r.y))*.0625;
 soft+=texture2D(tColor,vUv+vec2(-r.x,r.y))*.0625;
 // Framebuffer pixels are already display encoded; deliberately no chunks.
 gl_FragColor=mix(center,soft,blend);
}`;function F(e,m){const t=new L(e,m);return t.name="迷失 · 原画面颜色快照",t.colorSpace=N,t.minFilter=t.magFilter=k,t.flipY=!1,t.generateMipmaps=!1,t}function j(e,m={}){let t=F(1,1),i=!1;const r={tColor:{value:t},uTexel:{value:new v(1,1)},uFocusUv:{value:new v(.5,.5)},uAmount:{value:0},uAspect:{value:1},uRadius:{value:1.35}},d=new T({uniforms:r,vertexShader:q,fragmentShader:E,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:R}),u=new B;u.setAttribute("position",new b([-1,-1,0,3,-1,0,-1,3,0],3)),u.setAttribute("uv",new b([0,0,2,0,0,2],2));const h=new M(u,d);h.frustumCulled=!1;const l=new _;l.add(h);const x=new z(-1,1,1,-1,0,1),c=new v,o={technique:"original framebuffer copy + encoded-color peripheral soft focus",depthBased:!1,width:0,height:0,extraDrawCalls:1,colorSamples:9,depthSamples:0,renderTargets:0,framebufferCopies:1,msaaSamples:0,amount:0,focusDistance:0,focusDistanceUsedForBlur:!1,maxRadiusCssPixels:1.35,colorSpace:"original displayed encoding preserved; no tone mapping or output conversion",disposed:!1};function p(){if(i)return;e.getDrawingBufferSize(c);const a=Math.max(1,Math.floor(c.x)),s=Math.max(1,Math.floor(c.y));(a!==t.image.width||s!==t.image.height)&&(t.dispose(),t=F(a,s),r.tColor.value=t),r.uTexel.value.set(1/a,1/s),r.uAspect.value=a/s,r.uRadius.value=1.35*(e.getPixelRatio?.()||1),o.width=a,o.height=s,o.estimatedTextureBytes=a*s*4}function D(a,s,{focusDistance:g=80,amount:y=0,focusNdc:n}={}){if(i)throw Error("Lost focus has been disposed");const f=Number.isFinite(y)?P.clamp(y,0,1):0;if(o.amount=f,o.focusDistance=Number.isFinite(g)?g:0,o.lastBypass=null,f<=1e-4||e.getRenderTarget()!==null){o.lastBypass=f<=1e-4?"zero-amount":"non-default-target",e.render(a,s);return}p(),r.uAmount.value=f;const C=n?.x??n?.[0]??0,w=n?.y??n?.[1]??0;r.uFocusUv.value.set(Number.isFinite(C)?C*.5+.5:.5,Number.isFinite(w)?w*.5+.5:.5);const S=e.autoClear,U=e.info.autoReset;U&&e.info.reset(),e.info.autoReset=!1;try{e.render(a,s),e.copyFramebufferToTexture(t),e.autoClear=!1,e.render(l,x)}finally{e.autoClear=S,e.info.autoReset=U}}async function A(a,s){if(i)throw Error("Lost focus has been disposed");p(),e.initTexture?.(t),await e.compileAsync(l,x),o.prepared=!0}return{render:D,prepare:A,resize:p,stat:o,dispose(){i||(i=!0,t.dispose(),d.dispose(),u.dispose(),l.clear(),o.disposed=!0)}}}export{j as createLostFocus};
