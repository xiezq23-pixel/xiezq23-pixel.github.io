import{V as g,S as H,aA as B,i as O,j as U,k as F,ad as M,aB as P,aC as N,N as k,$ as z,Z as R}from"./three.module-BbQ0mWiG.js";const _=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,L=`
uniform sampler2D tColor;
uniform vec2 uTexel,uHeroUv;
uniform float uAmount,uAspect,uSoftRadius,uHaloRadius,uBreath,uCabin;
varying vec2 vUv;
vec3 lightOnly(vec3 color){
 // Halos can only come from existing rendered light. There are no generated
 // discs, stars, bubbles, or independently animated screen-space particles.
 float brightness=max(color.r,max(color.g,color.b));
 return color*smoothstep(.60,.95,brightness);
}
void main(){
 vec4 center=texture2D(tColor,vUv);
 vec2 away=(vUv-uHeroUv)*vec2(uAspect,1.);
 float distanceToHero=length(away);
 float clearHero=1.-smoothstep(.07,.26,distanceToHero);
 float peripheral=smoothstep(.14,.56,distanceToHero);
 vec2 r=uTexel*uSoftRadius*(.65+.35*peripheral);
 vec3 s0=texture2D(tColor,vUv+vec2(r.x,0.)).rgb;
 vec3 s1=texture2D(tColor,vUv-vec2(r.x,0.)).rgb;
 vec3 s2=texture2D(tColor,vUv+vec2(0.,r.y)).rgb;
 vec3 s3=texture2D(tColor,vUv-vec2(0.,r.y)).rgb;
 vec3 soft=center.rgb*.5+(s0+s1+s2+s3)*.125;
 vec3 color=mix(center.rgb,soft,uAmount*.38*peripheral*peripheral);

 vec2 h=uTexel*uHaloRadius;
 vec2 d=h*.70710678;
 vec3 halo=lightOnly(center.rgb)*.25;
 halo+=(lightOnly(s0)+lightOnly(s1)+lightOnly(s2)+lightOnly(s3))*.0625;
 halo+=lightOnly(texture2D(tColor,vUv+vec2(h.x,0.)).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv-vec2(h.x,0.)).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv+vec2(0.,h.y)).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv-vec2(0.,h.y)).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv+d).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv-d).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv+vec2(d.x,-d.y)).rgb)*.0625;
 halo+=lightOnly(texture2D(tColor,vUv+vec2(-d.x,d.y)).rgb)*.0625;

 float luminance=dot(center.rgb,vec3(.2126,.7152,.0722));
 float warmLight=smoothstep(.40,.82,luminance)*smoothstep(-.025,.13,center.r-center.b);
 float protection=max(clearHero,warmLight*.85);
 vec2 edge=(vUv-.5)*2.;
 float vignette=smoothstep(.42,1.30,length(edge));
 // A broad, almost imperceptible falloff, with no fixed black ring. The hero's
 // original brightness remains intact even when it is away from screen center.
 float dimming=(.46*(1.-protection)+.105*vignette*(1.-clearHero))*(1.-uCabin*.12);
 color*=1.-uAmount*dimming;
 float muted=dot(color,vec3(.2126,.7152,.0722));
 color=mix(color,vec3(muted),uAmount*.035*(1.-protection));
 // Screen-like, bounded light scatter: at most 5.5% of remaining headroom.
 // Very slow modulation affects only the faint halo, never scene brightness.
 float scatter=uAmount*.055*uBreath*(1.-clearHero*.85);
 color+=(1.-color)*halo*scatter;
 gl_FragColor=vec4(color,center.a);
}`;function T(e,a){const o=new N(e,a);return o.name="喘息 · 原画面光学快照",o.colorSpace=k,o.minFilter=o.magFilter=z,o.flipY=!1,o.generateMipmaps=!1,o}function q(e){let a=T(1,1),o=!1;const r={tColor:{value:a},uTexel:{value:new g(1,1)},uHeroUv:{value:new g(.5,.5)},uAmount:{value:0},uAspect:{value:1},uSoftRadius:{value:1.25},uHaloRadius:{value:7},uBreath:{value:1},uCabin:{value:0}},d=new H({uniforms:r,vertexShader:_,fragmentShader:L,depthTest:!1,depthWrite:!1,toneMapped:!1,blending:B}),n=new O;n.setAttribute("position",new U([-1,-1,0,3,-1,0,-1,3,0],3)),n.setAttribute("uv",new U([0,0,2,0,0,2],2));const p=new F(n,d);p.frustumCulled=!1;const u=new M;u.add(p);const x=new P(-1,1,1,-1,0,1),h=new g,t={technique:"original framebuffer copy + encoded-color dimming, peripheral softness and highlight-derived optical halo",depthBased:!1,generatedParticles:0,width:0,height:0,extraDrawCalls:1,colorSamples:13,depthSamples:0,renderTargets:0,framebufferCopies:1,estimatedTextureBytes:4,maxRadiusCssPixels:1.25,haloRadiusCssPixels:7,amount:0,cabin:0,time:0,colorSpace:"original displayed encoding preserved; no tone mapping or output conversion",prepared:!1,disposed:!1,lastBypass:null};function m(){if(o)return;e.getDrawingBufferSize(h);const s=Math.max(1,Math.floor(h.x)),l=Math.max(1,Math.floor(h.y));(s!==a.image.width||l!==a.image.height)&&(a.dispose(),a=T(s,l),r.tColor.value=a);const i=e.getPixelRatio?.()||1;r.uTexel.value.set(1/s,1/l),r.uAspect.value=s/l,r.uSoftRadius.value=t.maxRadiusCssPixels*i,r.uHaloRadius.value=t.haloRadiusCssPixels*i,t.width=s,t.height=l,t.estimatedTextureBytes=s*l*4}function A(s,l,{amount:i=0,heroNdc:c,time:b=0,cabin:f=!1}={}){if(o)throw Error("Rest focus has been disposed");const v=Number.isFinite(i)?R.clamp(i,0,1):0;if(t.amount=v,t.time=Number.isFinite(b)?b:0,t.cabin=f===!0?1:Number.isFinite(f)?R.clamp(f,0,1):0,t.lastBypass=null,v<=1e-4||e.getRenderTarget()!==null){t.lastBypass=v<=1e-4?"zero-amount":"non-default-target",e.render(s,l);return}m(),r.uAmount.value=v,r.uCabin.value=t.cabin,r.uBreath.value=1+.025*Math.sin(t.time*Math.PI/12);const y=c?.x??c?.[0]??0,C=c?.y??c?.[1]??0;r.uHeroUv.value.set(Number.isFinite(y)?y*.5+.5:.5,Number.isFinite(C)?C*.5+.5:.5);const D=e.autoClear,w=e.info.autoReset;w&&e.info.reset(),e.info.autoReset=!1;try{e.render(s,l),e.copyFramebufferToTexture(a),e.autoClear=!1,e.render(u,x)}finally{e.autoClear=D,e.info.autoReset=w}}async function S(s,l){if(o)throw Error("Rest focus has been disposed");m(),e.initTexture?.(a),await e.compileAsync(u,x),t.prepared=!0}return{render:A,prepare:S,resize:m,stat:t,dispose(){o||(o=!0,a.dispose(),d.dispose(),n.dispose(),u.clear(),t.disposed=!0)}}}export{q as createRestFocus};
