import{createRestAtmosphere as g}from"./rest_atmosphere_warm-C_GNE8tZ.js";import{REST_ATMOSPHERE_SOURCES as k}from"./rest_atmosphere_warm-C_GNE8tZ.js";import"./three.module-BbQ0mWiG.js";import"./GLTFLoader-PiM1tl0c.js";const o=Object.freeze({axisStretch:.06,radialLobes:.028,maximumInstanceScale:.65,thicknessMinNm:180,thicknessMaxNm:500,opticalNormalSmoothing:.92,warmSurfaceRadiance:.19,coolSurfaceRadiance:.04}),x=`
 attribute vec4 aFilm;attribute vec3 color;
 uniform float uTime;uniform vec3 uModelCenter;
 varying float vAlpha,vSeed,vTint,vDepth;
 varying vec3 vNormal,vView,vSource,vLocal,vWorldNormal,vWorldPosition;
 void main(){
  vec3 q=position-uModelCenter;vec3 radial=normalize(q);float phase=aFilm.x*6.283185;
  // Each axis mode has a different period and phase. The singular value of
  // this diagonal stretch is bounded by 1.06 at every time and every seed.
  float stretch=.06*sin(uTime*(.083+aFilm.x*.027)+phase);
  vec3 axes=vec3(1.+stretch,1.-stretch*.55,1.-stretch*.45);
  q*=axes;
  // Two broad surface modes. Their combined radial displacement is <= .028
  // in the normalized genuine source mesh; neither creates substitute art.
  float lobe=.018*sin(dot(radial,vec3(1.65,-.70,1.15))+uTime*.119+phase*.71)
             +.010*sin(dot(radial,vec3(-1.15,1.85,.55))-uTime*.073+phase*1.37);
  q+=radial*lobe;
  vec3 p=uModelCenter+q;
  vec3 smoothNormal=normalize(mix(normal,normalize(q/(axes*axes)),.92));
  vec4 world=modelMatrix*instanceMatrix*vec4(p,1.);
  vec4 mv=viewMatrix*world;
  vNormal=normalize(normalMatrix*mat3(instanceMatrix)*smoothNormal);
  vWorldNormal=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*smoothNormal);
  vWorldPosition=world.xyz;vView=-mv.xyz;vDepth=-mv.z;
  vLocal=position-uModelCenter;vSource=color;vAlpha=aFilm.z;vSeed=aFilm.x;vTint=aFilm.w;
  gl_Position=projectionMatrix*mv;
 }`,b=`
 uniform float uTime,uFogDensity,uFocusDistance,uSurfaceWarmGain,uSurfaceCoolGain;
 uniform vec3 uFogColor,uWarm,uCool;
 varying float vAlpha,vSeed,vTint,vDepth;
 varying vec3 vNormal,vView,vSource,vLocal,vWorldNormal,vWorldPosition;
 void main(){
  vec3 N=normalize(vNormal),V=normalize(vView);
  float facing=clamp(abs(dot(N,V)),0.,1.);
  float depthSoft=smoothstep(1.5,7.,abs(vDepth-uFocusDistance));
  float feather=smoothstep(.006,.16+depthSoft*.19,facing);
  vec3 p=normalize(vLocal);float phase=vSeed*6.283185;
  // A slowly advected, seam-free thickness field. Broad domain warping makes
  // the film drift in patches rather than flash as concentric rainbow bands.
  float angle=uTime*(.031+vSeed*.009)+phase;
  float ca=cos(angle),sa=sin(angle);p.xz=mat2(ca,-sa,sa,ca)*p.xz;
  p+=.13*vec3(sin(p.y*1.7+phase+uTime*.039),sin(p.z*1.9-phase*.6-uTime*.027),sin(p.x*1.6+phase*.8+uTime*.033));
  float a=sin(dot(p,vec3(1.75,1.10,.55))+uTime*.071+phase);
  float b=sin(dot(p,vec3(-.90,2.40,1.30))-uTime*.046+phase*.7+a*.58);
  float c=sin(dot(p,vec3(2.70,-1.40,1.80))+uTime*.032+b*.8);
  float thickness=clamp(335.+86.*a+45.*b+20.*c-45.*clamp(.5+.5*p.y,0.,1.),180.,500.);
  // Three representative wavelengths are an art-directed approximation of
  // thin-film interference, not a spectral renderer or a fluid simulation.
  float transmissionCos=sqrt(max(0.,1.-(1.-facing*facing)/(1.333*1.333)));
  vec3 spectrum=.5+.5*cos(16.75186*thickness*transmissionCos/vec3(650.,530.,460.));
  float spectralMean=dot(spectrum,vec3(.333333));
  vec3 interference=(spectrum-vec3(spectralMean))*.055;
  float milk=smoothstep(.24,.91,.5+.5*b);
  // Broad, soft responses to a fixed world-space environment. No cubemap,
  // screen refraction, mirror sparkle, point light, or photographic texture.
  vec3 WN=normalize(vWorldNormal),WV=normalize(cameraPosition-vWorldPosition);
  vec3 R=reflect(-WV,WN);
  float warmPatch=exp(-pow((R.x+.34)*1.65,2.)-pow((R.y-.46)*1.40,2.));
  float coolPatch=exp(-pow((R.z-.48)*1.55,2.)-pow((R.y+.12)*1.80,2.));
  float reflection=(warmPatch*.67+coolPatch*.33)*(.38+.62*milk);
  float grazing=pow(1.-facing,1.55);
  vec3 cream=mix(vec3(.88,.91,.93),uWarm,.52+.10*milk);
  vec3 tint=mix(cream,uCool,.15*coolPatch+.12*vTint);
  vec3 col=tint*(1.10+.25*warmPatch+.15*reflection)+interference;
  // The centre transmits most background light. A broken, broad membrane
  // shoulder takes its visibility from thickness and reflection, never from
  // a hard Fresnel outline or an opaque glowing/stone-like centre.
  float film=.045+.030*milk+.12*grazing*(.50+.50*milk)+.19*reflection;
  float fog=1.-exp(-pow(max(vDepth,0.)*uFogDensity*.7,2.));
  float alpha=vAlpha*film*feather*(1.-fog*.85);
  col=mix(col,uFogColor,fog);
  if(alpha<.001)discard;gl_FragColor=vec4(col,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  // Output-space surface radiance is separate from optical coverage: preserve
  // background transmission instead of turning the whole sphere opaque. This
  // is ordinary premultiplied NormalBlending (ONE, ONE_MINUS_SRC_ALPHA), not an
  // additive pass. Both soft patches share the exact reveal/boundary/fog mask.
  float lightMask=vAlpha*feather*(1.-fog*.85);
  vec3 surfaceLight=(vec3(1.,.87,.66)*uSurfaceWarmGain*warmPatch*(.25+.75*milk)
                   +vec3(.76,.89,.94)*uSurfaceCoolGain*coolPatch*(.20+.80*milk))*lightMask;
  gl_FragColor.rgb=gl_FragColor.rgb*gl_FragColor.a+surfaceLight;
 }`;async function y(d={}){const t=await g(d);let e=null,n=!1;try{let h=function(i={}){if(n)return;const c=i.cabin,f=c?{legal:(m,v)=>c.legal(m,v+s)}:null;if(t.update({...i,cabin:f}),c)for(const m of a.instances)m.radius+=s};if(d.signal?.aborted)throw new DOMException("Rest membrane loading aborted","AbortError");const r=t.group.children.find(i=>i.name==="喘息 · Lux bubble");if(!r?.isInstancedMesh)throw Error("Membrane variant requires the genuine prepared Lux bubble batch");const u=r.material;e=u.clone(),e.uniforms={...u.uniforms,uSurfaceWarmGain:{value:o.warmSurfaceRadiance},uSurfaceCoolGain:{value:o.coolSurfaceRadiance}},e.premultipliedAlpha=!0,e.vertexShader=x,e.fragmentShader=b,e.name="喘息 · 真实 Lux 壳体的流动薄膜",e.userData={...e.userData,style:"membrane",sourceModelTaskId:8207960,sourceGeometryUnchanged:!0},r.material=e;const l=r.geometry.boundingSphere.radius,p=l*(1+o.axisStretch)+o.radialLobes,s=Math.max(0,p-l*1.1)*o.maximumInstanceScale+1e-6,a=t.stat;return a.style="membrane",a.waterStyle="warm-v1",a.deformation={sourceRadius:l,maximumAxisStretch:o.axisStretch,maximumRadialDisplacement:o.radialLobes,maximumDeformedRadius:p,additionalCabinMargin:s,maximumInstanceScale:o.maximumInstanceScale,sourceGeometryUnchanged:!0,periodsSeconds:[57.1,75.7,52.8,86.1]},a.thickness={rangeNm:[180,500],refractiveIndex:1.333,wavelengthsNm:[650,530,460],spectrumChromaAmplitude:.055,method:"bounded slowly advected field and three-wavelength optical approximation; not a fluid solver"},a.optics={blending:"NormalBlending with premultipliedAlpha; ONE / ONE_MINUS_SRC_ALPHA",coverageAlphaUnchanged:!0,surfaceRadiance:[.19,.04],surfaceRadianceSpace:"output display space, after tonemapping/colorspace",fullyFadedRadiance:0,softWorldPatches:!0},a.additionalDrawCalls=0,a.newLuxTasks=0,{group:t.group,stat:a,update:h,dispose(){n||(n=!0,e.dispose(),t.dispose())}}}catch(r){throw e?.dispose(),t.dispose(),r}}export{k as REST_ATMOSPHERE_SOURCES,o as REST_MEMBRANE_LIMITS,y as createRestAtmosphere};
