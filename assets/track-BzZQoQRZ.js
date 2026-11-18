import{a4 as ee,j as lt,aE as Ut,aF as ht,aG as ne,X as Ct,a7 as Vt,h as st,S as Gt,aH as xt,E as Rt,V as ie,H as wt,k as qt,J as pt,aI as ae,g as se,Z as oe,b as re,R as ce,F as le,O as de,u as fe,v as he,i as ue}from"./three.module-BbQ0mWiG.js";const Bt=new Ct,mt=new st;class Yt extends ee{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],i=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],v=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(v),this.setAttribute("position",new lt(e,3)),this.setAttribute("uv",new lt(i,2))}applyMatrix4(e){const i=this.attributes.instanceStart,v=this.attributes.instanceEnd;return i!==void 0&&(i.applyMatrix4(e),v.applyMatrix4(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));const v=new Ut(i,6,1);return this.setAttribute("instanceStart",new ht(v,3,0)),this.setAttribute("instanceEnd",new ht(v,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));const v=new Ut(i,6,1);return this.setAttribute("instanceColorStart",new ht(v,3,0)),this.setAttribute("instanceColorEnd",new ht(v,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new ne(e.geometry)),this}fromLineSegments(e){const i=e.geometry;return this.setPositions(i.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ct);const e=this.attributes.instanceStart,i=this.attributes.instanceEnd;e!==void 0&&i!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Bt.setFromBufferAttribute(i),this.boundingBox.union(Bt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vt),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,i=this.attributes.instanceEnd;if(e!==void 0&&i!==void 0){const v=this.boundingSphere.center;this.boundingBox.getCenter(v);let h=0;for(let g=0,E=e.count;g<E;g++)mt.fromBufferAttribute(e,g),h=Math.max(h,v.distanceToSquared(mt)),mt.fromBufferAttribute(i,g),h=Math.max(h,v.distanceToSquared(mt));this.boundingSphere.radius=Math.sqrt(h),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}wt.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ie(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};xt.line={uniforms:Rt.merge([wt.common,wt.fog,wt.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class Kt extends Gt{static get type(){return"LineMaterial"}constructor(e){super({uniforms:Rt.clone(xt.line.uniforms),vertexShader:xt.line.vertexShader,fragmentShader:xt.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const zt=new pt,Wt=new st,Ot=new st,V=new pt,G=new pt,nt=new pt,kt=new st,_t=new se,R=new ae,Ft=new st,vt=new Ct,gt=new Vt,it=new pt;let at,dt;function jt(t,e,i){return it.set(0,0,-e,1).applyMatrix4(t.projectionMatrix),it.multiplyScalar(1/it.w),it.x=dt/i.width,it.y=dt/i.height,it.applyMatrix4(t.projectionMatrixInverse),it.multiplyScalar(1/it.w),Math.abs(Math.max(it.x,it.y))}function pe(t,e){const i=t.matrixWorld,v=t.geometry,h=v.attributes.instanceStart,g=v.attributes.instanceEnd,E=Math.min(v.instanceCount,h.count);for(let S=0,c=E;S<c;S++){R.start.fromBufferAttribute(h,S),R.end.fromBufferAttribute(g,S),R.applyMatrix4(i);const z=new st,k=new st;at.distanceSqToSegment(R.start,R.end,k,z),k.distanceTo(z)<dt*.5&&e.push({point:k,pointOnLine:z,distance:at.origin.distanceTo(k),object:t,face:null,faceIndex:S,uv:null,uv1:null})}}function me(t,e,i){const v=e.projectionMatrix,g=t.material.resolution,E=t.matrixWorld,S=t.geometry,c=S.attributes.instanceStart,z=S.attributes.instanceEnd,k=Math.min(S.instanceCount,c.count),U=-e.near;at.at(1,nt),nt.w=1,nt.applyMatrix4(e.matrixWorldInverse),nt.applyMatrix4(v),nt.multiplyScalar(1/nt.w),nt.x*=g.x/2,nt.y*=g.y/2,nt.z=0,kt.copy(nt),_t.multiplyMatrices(e.matrixWorldInverse,E);for(let L=0,j=k;L<j;L++){if(V.fromBufferAttribute(c,L),G.fromBufferAttribute(z,L),V.w=1,G.w=1,V.applyMatrix4(_t),G.applyMatrix4(_t),V.z>U&&G.z>U)continue;if(V.z>U){const H=V.z-G.z,O=(V.z-U)/H;V.lerp(G,O)}else if(G.z>U){const H=G.z-V.z,O=(G.z-U)/H;G.lerp(V,O)}V.applyMatrix4(v),G.applyMatrix4(v),V.multiplyScalar(1/V.w),G.multiplyScalar(1/G.w),V.x*=g.x/2,V.y*=g.y/2,G.x*=g.x/2,G.y*=g.y/2,R.start.copy(V),R.start.z=0,R.end.copy(G),R.end.z=0;const rt=R.closestPointToPointParameter(kt,!0);R.at(rt,Ft);const D=oe.lerp(V.z,G.z,rt),Y=D>=-1&&D<=1,J=kt.distanceTo(Ft)<dt*.5;if(Y&&J){R.start.fromBufferAttribute(c,L),R.end.fromBufferAttribute(z,L),R.start.applyMatrix4(E),R.end.applyMatrix4(E);const H=new st,O=new st;at.distanceSqToSegment(R.start,R.end,O,H),i.push({point:O,pointOnLine:H,distance:at.origin.distanceTo(O),object:t,face:null,faceIndex:L,uv:null,uv1:null})}}}class ve extends qt{constructor(e=new Yt,i=new Kt({color:Math.random()*16777215})){super(e,i),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,i=e.attributes.instanceStart,v=e.attributes.instanceEnd,h=new Float32Array(2*i.count);for(let E=0,S=0,c=i.count;E<c;E++,S+=2)Wt.fromBufferAttribute(i,E),Ot.fromBufferAttribute(v,E),h[S]=S===0?0:h[S-1],h[S+1]=h[S]+Wt.distanceTo(Ot);const g=new Ut(h,2,1);return e.setAttribute("instanceDistanceStart",new ht(g,1,0)),e.setAttribute("instanceDistanceEnd",new ht(g,1,1)),this}raycast(e,i){const v=this.material.worldUnits,h=e.camera;h===null&&!v&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const g=e.params.Line2!==void 0&&e.params.Line2.threshold||0;at=e.ray;const E=this.matrixWorld,S=this.geometry,c=this.material;dt=c.linewidth+g,S.boundingSphere===null&&S.computeBoundingSphere(),gt.copy(S.boundingSphere).applyMatrix4(E);let z;if(v)z=dt*.5;else{const U=Math.max(h.near,gt.distanceToPoint(at.origin));z=jt(h,U,c.resolution)}if(gt.radius+=z,at.intersectsSphere(gt)===!1)return;S.boundingBox===null&&S.computeBoundingBox(),vt.copy(S.boundingBox).applyMatrix4(E);let k;if(v)k=dt*.5;else{const U=Math.max(h.near,vt.distanceToPoint(at.origin));k=jt(h,U,c.resolution)}vt.expandByScalar(k),at.intersectsBox(vt)!==!1&&(v?pe(this,i):me(this,h,i))}onBeforeRender(e){const i=this.material.uniforms;i&&i.resolution&&(e.getViewport(zt),this.material.uniforms.resolution.value.set(zt.z,zt.w))}}const It={ring:{w:22,col:[.5,.93,1],glow:1,speed:64,half:7.5,fog:.16,rim:1,y:.35,W:26,T:2.6,bank:5,bankMax:.07},express:{w:15,col:[.62,.74,1],glow:.85,speed:58,half:5,fog:.2,rim:.55,y:.35,W:19,T:2.3,bank:6,bankMax:.09},ramp:{w:8,col:[1,.74,.42],glow:1,speed:46,half:2.6,fog:.26,rim:.35,y:.3,W:10,T:1.7,bank:9,bankMax:.2},under:{w:6,col:[1,.82,.6],glow:.8,speed:60,half:6.2,fog:.45,rim:.2,y:.3},arterial:{w:8,col:[1,.62,.32],glow:.78,speed:60,half:3,fog:.45,rim:.14,y:.3},aux:{w:7,col:[.95,.6,.36],glow:.66,speed:56,half:2.6,fog:.5,rim:.1,y:.3},street:{w:5.5,col:[.85,.66,.5],glow:.52,speed:48,half:2.2,fog:.55,rim:.06,y:.3}},ge=7,Ht=t=>Math.atan2(Math.sin(t),Math.cos(t)),Dt=(t,e,i)=>{const v=Math.max(0,Math.min(1,(i-t)/(e-t)));return v*v*(3-2*v)},Xt=256,Jt=64,yt=Xt*Jt;function Me(t,{stations:e=[]}={}){const i=ye({extent:t.extent,stats:t.stats}),[v,h,g,E]=t.extent,S=t.nodes.map(([k,U,L],j)=>({id:j,x:k,h:U,z:L,border:Math.min(k-v,g-k,L-h,E-L)<30})),c=i.addEdges(S,t.edges).edges;i.mesh=i.makeMesh(c,!1);const z={};for(const k of c){const U=z[k.cls]||=[],L=6+(k.deck?2:0);for(let j=1;j<k.n;j++)U.push(k.x[j-1],L,k.z[j-1],k.x[j],L,k.z[j])}return i.mapLines=i.makeMapLines(z),e.length&&i.assignStations(e),i}function ye({extent:t=null,stats:e=null}={}){const i={},v=[],h={stations:[],nodes:i,edges:v,extent:t,stats:e,mapLines:[]},g=(n,r)=>{let a,d;if(r===0)for(a=0,d=1;d<n.n-1&&n.cum[d]<22;)d++;else for(a=n.n-1,d=n.n-2;d>0&&n.len-n.cum[d]<22;)d--;return Math.atan2(n.x[d]-n.x[a],n.z[d]-n.z[a])};function E(n){const r=n.pts.length,a=new Float32Array(r),d=new Float32Array(r),o=new Float32Array(r),f=new Float32Array(r);let s=0;n.pts.forEach((w,m)=>{a[m]=w[0],d[m]=w[1],o[m]=w[2],s=Math.max(s,w[1]),m&&(f[m]=f[m-1]+Math.hypot(a[m]-a[m-1],o[m]-o[m-1]))});const y=It[n.cls]||It.street,p={id:n.id,gid:n.gid??n.id,a:n.a,b:n.b,cls:n.cls,roadClass:n.roadClass,name:n.name,flow:n.flow||0,x:a,y:d,z:o,cum:f,n:r,len:f[r-1]||.1,C:y,maxY:s};if(p.farawayExit=n.farawayExit||null,p.deck=p.cls==="ring"||p.cls==="express",p.el=p.deck||p.cls==="ramp",p.station=-1,p.road={id:p.id,el:p.el&&s>3,mainline:p.deck,n:n.name,c:n.cls,station:-1},p.bank=new Float32Array(r),p.vcap=new Float32Array(r).fill(999),p.el){const w=new Float32Array(r);for(let m=0;m<r;m++){const l=Math.max(0,m-3),T=Math.min(r-1,m+3);if(T-l<2)continue;const B=a[m]-a[l],A=o[m]-o[l],N=a[T]-a[m],et=o[T]-o[m],W=Math.hypot(B,A)||1,Q=Math.hypot(N,et)||1,$=(B*et-A*N)/(W*Q),ct=Math.asin(Math.max(-1,Math.min(1,$)))/((W+Q)/2);w[m]=Math.max(-y.bankMax,Math.min(y.bankMax,-ct*y.bank)),p.vcap[m]=Math.max(18,Math.sqrt(ge/Math.max(1e-4,Math.abs(ct))))}for(let m=0;m<r;m++){let l=0,T=0;for(let A=-3;A<=3;A++){const N=m+A;N>=0&&N<r&&(l+=w[N],T++)}const B=Math.min(f[m],p.len-f[m]);p.bank[m]=l/T*Dt(0,18,B)}}return p.dirA=g(p,0),p.dirB=g(p,1),p}const S=40,c=new Map,z=(n,r)=>n*73856093+r;function k(n){n.cells=[];for(let r=0;r<n.n;r+=2){const a=z(Math.floor(n.x[r]/S),Math.floor(n.z[r]/S));let d=c.get(a);d||c.set(a,d=[]),d.push([n,r]),n.cells[n.cells.length-1]!==a&&n.cells.push(a)}}function U(n){for(const r of new Set(n.cells)){const a=c.get(r);if(!a)continue;const d=a.filter(o=>o[0]!==n);d.length?c.set(r,d):c.delete(r)}}function L(n,r,a,d){const o=Math.floor((n-a)/S),f=Math.floor((n+a)/S),s=Math.floor((r-a)/S),y=Math.floor((r+a)/S);for(let p=o;p<=f;p++)for(let w=s;w<=y;w++){const m=c.get(z(p,w));if(m)for(const l of m)d(l[0],l[1])}}function j(n,r,a=()=>!0,d=400){let o=null;for(let f=60;f<=d&&!o;f*=2)L(n,r,f,(s,y)=>{if(!a(s))return;const p=Math.hypot(s.x[y]-n,s.z[y]-r);(!o||p<o.d)&&(o={e:s,s:s.cum[y],d:p,x:s.x[y],y:s.y[y],z:s.z[y]})});if(!o){for(const f of v)if(a(f))for(let s=0;s<f.n;s+=2){const y=Math.hypot(f.x[s]-n,f.z[s]-r);(!o||y<o.d)&&(o={e:f,s:f.cum[s],d:y,x:f.x[s],y:f.y[s],z:f.z[s]})}}return o}function ot(n,r){const a=[],d=(s,y,p,w,m={})=>{let l=i[s];l||(l=i[s]={id:s,x:y,h:p,z:w,inc:[],refs:0,border:!!m.border,portal:!!m.portal,exit:!!m.exit}),l.refs++,a.push(s)},o=new Set;for(const s of n)d(s.id,s.x,s.h,s.z,s),o.add(s.id);const f=r.map(E);for(const s of f){o.has(s.a)||(d(s.a,s.x[0],s.y[0],s.z[0]),o.add(s.a)),o.has(s.b)||(d(s.b,s.x[s.n-1],s.y[s.n-1],s.z[s.n-1]),o.add(s.b)),i[s.a].inc.push({e:s,end:0}),i[s.b].inc.push({e:s,end:1}),k(s),v.push(s);const y=s.id*4;F[y]=F[y+1]=F[y+2]=0,F[y+3]=-1,q[s.id]=0}return h.stations.length&&D(h.stations,f),J.clear(),I=!0,{edges:f,nodeIds:a}}function rt(n,r){const a=new Set(n);for(const o of n){for(const s of[o.a,o.b]){const y=i[s];y&&(y.inc=y.inc.filter(p=>!a.has(p.e)))}U(o);const f=o.id*4;F[f]=F[f+1]=F[f+2]=0,F[f+3]=-1,q[o.id]=0}let d=0;for(let o=0;o<v.length;o++)a.has(v[o])||(v[d++]=v[o]);v.length=d;for(const o of r){const f=i[o];f&&--f.refs<=0&&delete i[o]}J.clear(),I=!0}function D(n,r=v){h.stations=n;for(const a of r){if(!a.el)continue;let d=-1,o=1/0;for(const f of n){const s=a.deck?[a.n>>1]:Array.from({length:Math.ceil(a.n/3)},(y,p)=>p*3);for(const y of s){const p=Math.hypot(a.x[y]-f.x,a.z[y]-f.z);p<f.R*(a.deck?.9:1.1)&&p<o&&(o=p,d=f.id)}}a.station=a.road.station=d}}function Y(n,r,a){r=r<0?0:r>n.len?n.len:r;const d=n.cum;let o=0,f=n.n-1;for(;f-o>1;){const l=o+f>>1;d[l]<=r?o=l:f=l}const s=d[f]-d[o]||1,y=(r-d[o])/s;a.x=n.x[o]+(n.x[f]-n.x[o])*y,a.y=n.y[o]+(n.y[f]-n.y[o])*y,a.z=n.z[o]+(n.z[f]-n.z[o])*y,a.b=n.bank[o]+(n.bank[f]-n.bank[o])*y;const p=n.x[f]-n.x[o],w=n.z[f]-n.z[o],m=Math.hypot(p,w)||1;return a.tx=p/m,a.tz=w/m,a.i=o,a}const J=new Map;function H(n,r){const a=n.id*2+r;if(J.has(a))return J.get(a);const d=r?n.b:n.a,o=i[d],f=Ht((r?n.dirB:n.dirA)+Math.PI);let s=[];for(const l of o?o.inc:[]){if(l.e===n&&l.end===r)continue;const T=l.end===0?l.e.dirA:l.e.dirB,B=Ht(T-f);let A=-1e9,N=1e9;for(let Q=0;Q<l.e.n;Q++){const $=l.end===0?Q:l.e.n-1-Q;if((l.end===0?l.e.cum[$]:l.e.len-l.e.cum[$])>140)break;A=Math.max(A,l.e.y[$]),N=Math.min(N,l.e.y[$])}const et=A>o.h+4?"up":N<o.h-4?"down":"";let W=Math.abs(B)*40;l.e.cls!==n.cls&&(W+=10),et==="up"&&Math.abs(B)<1&&(W-=16),n.deck&&!l.e.deck&&(W+=14),s.push({e:l.e,end:l.end,a:B,climb:et,cost:W,name:l.e.name,lane:l.e})}const y=s.filter(l=>Math.abs(l.a)<2.7);y.length&&(s=y),s.sort((l,T)=>T.a-l.a);let p=0;s.forEach((l,T)=>{l.cost<s[p].cost&&(p=T)});const w=s.length>1&&s.some(l=>l.climb||l.e.el!==n.el),m={list:s,def:p,key:w,node:d};return J.set(a,m),m}function O(n,r,a){const d=Math.sin(n.heading),o=Math.cos(n.heading),f=Math.min(46,12+Math.abs(n.v)*.45),s=n.pos.x+d*f,y=n.pos.z+o*f;let p=null;return L(s,y,60,(w,m)=>{if(w===n.edge)return;const l=w.y[m]-a;if(r>0?l<4.5||l>30:l>-4.5)return;const T=Math.hypot(w.x[m]-s,w.z[m]-y);if(T>60)return;const B=Math.min(w.n-1,m+1),A=Math.max(0,B-1),N=w.x[B]-w.x[A],et=w.z[B]-w.z[A],W=Math.hypot(N,et)||1,Q=(N*d+et*o)/W,$=T+(1-Math.abs(Q))*45+Math.abs(l)*.4-(w.deck?8:0);(!p||$<p.score)&&(p={e:w,s:w.cum[m],dir:Q>=0?1:-1,dy:l,score:$})}),p}const F=new Float32Array(yt*4),P=new re(F,Xt,Jt,ce,le);for(let n=0;n<yt;n++)F[n*4+3]=-1;P.needsUpdate=!0;const q=new Float32Array(yt);let I=!0,ft=[];const Z=new Gt({uniforms:{uTime:{value:0},uDensity:{value:.002},uNight:{value:1},uHi:{value:P},uFish:{value:new st},uDay:{value:0}},vertexShader:xe,fragmentShader:we,transparent:!0,depthWrite:!1,blending:he,blendSrc:fe,blendDst:de});function ut(n,r=!0){const a=[],d=[],o=[],f=[],s=[],y=[],p=(l,T,B)=>{const A=l.C,N=B?A.W*.28:A.w/2,et=a.length/3;for(let W=0;W<l.n;W++){const Q=Math.max(0,W-1),$=Math.min(l.n-1,W+1);let ct=l.x[$]-l.x[Q],St=l.z[$]-l.z[Q];const Tt=Math.hypot(ct,St)||1;ct/=Tt,St/=Tt;const Zt=-St,$t=ct,Pt=l.y[W]+T,te=B?0:Math.sin(l.bank[W]);for(const tt of[-1,1])a.push(l.x[W]+Zt*N*tt,Pt+tt*N*te,l.z[W]+$t*N*tt),d.push(l.cum[W],tt),o.push(l.id),f.push(A.col[0],A.col[1],A.col[2],A.glow),s.push(l.flow,A.fog,A.rim,B?1:0);if(W){const tt=et+(W-1)*2;y.push(tt,tt+1,tt+2,tt+1,tt+3,tt+2)}}};for(const l of n)p(l,l.C.y,!1),l.el&&l.maxY>5&&p(l,-l.C.T-.12,!0);const w=new ue;w.setAttribute("position",new lt(a,3)),w.setAttribute("aUV",new lt(d,2)),w.setAttribute("aE",new lt(o,1)),w.setAttribute("aC",new lt(f,4)),w.setAttribute("aP",new lt(s,4)),w.setIndex(y),w.computeBoundingSphere();const m=new qt(w,Z);return m.frustumCulled=r,m.renderOrder=3,m}const u={ring:[8385791,3.4,1],express:[11123967,2.4,.95],ramp:[16760944,1.4,.9],under:[15255712,1.2,.5],arterial:[14207152,1.2,.55],aux:[11575440,1,.4],street:[9470064,.9,.35]};function b(n){const r=[];for(const[a,[d,o,f]]of Object.entries(u)){if(!n[a]||!n[a].length)continue;const s=new Yt;s.setPositions(n[a]);const y=new Kt({color:d,linewidth:o,transparent:!0,opacity:f,depthTest:!1,depthWrite:!1});y.resolution.set(innerWidth,innerHeight);const p=new ve(s,y);p.userData.o=f,p.renderOrder=a==="ring"?12:10,p.frustumCulled=!1,r.push(p)}return r}function M(n){for(const r of ft)F[r*4]=0;for(const[r,a,d]of n)F[r*4]=a,F[r*4+1]=d;ft=n.map(r=>r[0]),I=!0}function x(n,r=-1){for(const a of n)F[a*4+2]=1,r>=0&&(F[a*4+3]=r),q[a]=1;I=!0}function _(n,r){Z.uniforms.uTime.value=n,Z.uniforms.uFish.value.copy(r.pos);const a=r.hint,d=[];a&&!r.conn&&a.opt.list.forEach((f,s)=>d.push([f.e.id,s===a.choice?1:.3,f.end===0?1:0]));const o=d.map(f=>f.join(",")).join("|");o!==M.key&&(M.key=o,M(d)),I&&(P.needsUpdate=!0,I=!1)}function C(n,r){for(const a of h.mapLines)a.material.resolution.set(n,r)}function K(n,r){const a=j(n,r,f=>f.deck,120),d=a&&a.d<110?a:j(n,r,f=>f.cls!=="ramp");if(!d)return null;const o=Y(d.e,d.s,{});return{x:o.x,y:o.y,z:o.z,edge:d.e,s:d.s,lane:d.e}}function X(n,r,a){let d=null;return L(n,r,40,(o,f)=>{if(!(o.el||a&&a(o)))for(const s of[f-1,f]){if(s<0||s>=o.n-1)continue;const y=o.x[s],p=o.z[s],w=o.x[s+1]-y,m=o.z[s+1]-p,l=w*w+m*m||1,T=Math.sqrt(l),B=Math.max(0,Math.min(1,((n-y)*w+(r-p)*m)/l)),A=Math.hypot(y+w*B-n,p+m*B-r);(!d||A<d.d)&&(d={d:A,ux:w/T,uz:m/T,hw:o.C.w/2+1.5,cls:o.cls})}}),d}return Object.assign(h,{at:Y,query:L,nearest:j,options:H,findLeap:O,mat:Z,update:_,light:x,lit:q,resize:C,pickStart:K,groundNear:X,assignStations:D,addEdges:ot,removeEdges:rt,makeMesh:ut,makeMapLines:b,SLOTS:yt}),h}const xe=`
      attribute vec2 aUV; attribute float aE; attribute vec4 aC; attribute vec4 aP;
      varying vec2 vUV; varying float vE; varying vec4 vC; varying vec4 vP; varying float vDepth; varying vec3 vW;
      void main() {
        vUV = aUV; vE = aE; vC = aC; vP = aP;
        vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz;
        vec4 mv = viewMatrix * wp; vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,we=`
      precision highp float;
      uniform float uTime, uDensity, uNight, uDay; uniform sampler2D uHi; uniform vec3 uFish;
      varying vec2 vUV; varying float vE; varying vec4 vC; varying vec4 vP; varying float vDepth; varying vec3 vW;
      float h1(float n) { return fract(sin(n) * 43758.5453123); }
      float n1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
      vec3 hsv(float h) { vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); return mix(vec3(1.0), k, 0.55); }
      void main() {
        float v = vUV.y, av = abs(v), u = vUV.x, t = uTime;
        int id = int(vE + 0.5);
        vec4 hi = texelFetch(uHi, ivec2(id % 256, id / 256), 0);
        // 水流：双向的路分两股（靠右行），单向的匝道整幅顺着走
        float fl = vP.x != 0.0 ? vP.x : (v > 0.0 ? 1.0 : -1.0);
        float glow = vC.a, spd = 5.0 + glow * 10.0;
        // 细细的水纹：横向分成若干股细线，每股各自在流
        float lanes = 7.0 + glow * 6.0;
        float lv = (v * 0.5 + 0.5) * lanes, li = floor(lv), lf = fract(lv);
        float thread = exp(-pow((lf - 0.5) / 0.11, 2.0));
        float s1 = smoothstep(0.66, 0.98, n1(u * 0.045 - fl * t * spd * 0.045 + li * 13.7));
        float s2 = smoothstep(0.72, 1.0, n1(u * 0.12 - fl * t * spd * 0.12 + li * 5.3 + 40.0)) * 0.65;
        float streak = max(s1, s2) * thread;
        // 水面的波光：两组斜向的细波交叉
        float cau = pow(0.5 + 0.5 * sin(u * 0.31 - fl * t * 4.0 + v * 7.0) * sin(u * 0.23 + fl * t * 2.2 - v * 9.0), 3.0);
        float body = 1.0 - smoothstep(0.3, 1.0, av);
        float core = exp(-v * v * 14.0);
        float rim = smoothstep(0.78, 0.9, av) * (1.0 - smoothstep(0.9, 1.0, av)) * vP.z;
        float shimmer = 0.72 + 0.28 * sin(u * 0.17 - fl * t * 2.6 + v * 5.0);
        vec3 col = vC.rgb;
        float I = glow * (0.1 * body * shimmer + 1.2 * streak * body + 0.16 * cau * body + 0.16 * core) + rim * 0.75;
        // 选中的岔路：一串光往前流（hi.r 强度，hi.g 方向）
        float pul = 0.0;
        if (hi.r > 0.01) {
          float d = hi.g > 0.5 ? 1.0 : -1.0;
          float ph = fract(u * 0.028 - d * t * 1.7);
          float chev = smoothstep(0.0, 0.1, ph) * (1.0 - smoothstep(0.1, 0.42, ph));
          pul = hi.r * (0.45 + 1.7 * chev) * (body * 0.8 + core * 0.6);
        }
        // 骑过 / 点亮的立交：染上这座桥的颜色
        float lit = hi.b;
        vec3 hue = hi.a >= 0.0 ? hsv(hi.a) : col;
        vec3 c = col * I * (1.0 + lit * 0.9) + vec3(1.0, 0.96, 0.86) * pul + hue * lit * 0.45 * body * shimmer;
        // 鱼身边的水更亮一点
        c += col * exp(-pow(distance(vW.xz, uFish.xz) / 22.0, 2.0)) * 0.35 * body;
        float fog = 1.0 - exp(-pow(uDensity * vP.y * vDepth, 2.0));
        float k = (1.0 - fog) * (0.42 + 0.36 * uNight);
        // 白天：光带下面压暗一点（像一条深色的水道），亮纹才看得出来
        float a = body * (0.18 + 0.3 * uDay) * (1.0 - fog);
        if (vP.w > 0.5) { c *= 0.8; a = 0.0; } // 桥腹下的那条：只发光，不压暗
        gl_FragColor = vec4(c * k, a);
      }`,Qt={},Lt={},At={},bt=(t,e,i,v,h)=>{const g=1-h;return g*g*g*t+3*g*g*h*e+3*g*h*h*i+h*h*h*v},Nt=(t,e,i,v,h)=>{const g=1-h;return 3*g*g*(e-t)+6*g*h*(i-e)+3*h*h*(v-i)};function Se(t,e,i,v,h){const g=e.at(i,v,Qt);h===void 0&&(h=1),t.edge=t.lane=i,t.s=v,t.dir=h,t.lat=0,t.alt=t.altWant=1.8,t.v=20,t.gv=t.yo=t.yv=0,t.conn=null,t.choices.clear(),t.offEdge=!1,t.place(g.x,g.y+t.alt,g.z,Math.atan2(g.tx*h,g.tz*h)),t.visits.clear(),Mt(t,i,!1)}function Mt(t,e,i=!0){t.edge=t.lane=e,i&&(t.justEntered=e,t.visits.set(e.id,(t.visits.get(e.id)||0)+1))}function ze(t,e,i,v,h,g={}){const E=Qt;t.jumpCd-=e;const S=i.z<0;S&&(t.sT+=e),!S&&t.sWas&&(t.sT<.3&&!g.locked&&(t.wantU=1),t.sT=0),t.sWas=S,t.up=S&&t.sT>=.3&&!t.conn&&!g.locked,i.burst&&!t.spaceWas&&!g.locked&&(t.anchor=!t.anchor),t.spaceWas=i.burst,(i.z>0||t.up)&&(t.anchor=!1),g.anchor&&(t.anchor=!0),t.wantU>0&&!t.conn&&!t.offEdge&&(t.dir=-t.dir,t.wantU=0,t.v=Math.min(t.v,24),t.choices.clear());let c=t.edge;const z=i.x,k=z!==0&&z!==t.keyX;t.idleT=i.x||i.y||i.z||i.burst?0:(t.idleT||0)+e,t.intentT=Math.max(0,(t.intentT||0)-e),t.grace&&(t.grace.d+=Math.abs(t.v)*e);let U=!1;if(k&&t.grace&&t.grace.d<40&&!t.conn&&!t.offEdge&&!g.locked){const u=t.grace,b=Math.max(0,Math.min(u.list.length-1,u.idx+z));if(b!==u.idx){const M=u.list[b],x=M.end===0;t.dir=x?1:-1,t.s=x?Math.min(u.d,M.e.len):Math.max(0,M.e.len-u.d),Mt(t,M.e,!1),c=M.e,u.idx=b,U=!0,t.pressed=(t.pressed||0)+1}}k&&!U&&(t.intent=z,t.intentT=3.2);const L=h.at(c,t.s,E).y;t.scanT-=e,t.scanT<=0&&!t.conn&&!t.offEdge&&(t.scanT=.15,t.leapUp=h.findLeap(t,1,L),t.leapDown=h.findLeap(t,-1,L),t.canUp=!!t.leapUp,t.canDown=!!t.leapDown);const j=!g.locked&&!t.conn&&!t.offEdge&&t.jumpCd<=0&&(i.y>0&&t.canUp||i.y<0&&t.canDown);j&&Et(t,h,i.y>0?t.leapUp:t.leapDown,i.y>0?1:-1),t.hint=null;const ot=Math.sign(t.v||1),rt=Math.max(240,Math.abs(t.v)*4.8);let D=null;if(!t.conn&&!t.offEdge&&ot>0){let u=c,b=t.dir,M=b>0?u.len-t.s:t.s;for(let x=0;x<14&&M<rt;x++){const _=b>0?1:0,C=h.options(u,_);if(C.list.length>1){D={e:u,endArr:_,opt:C,dist:M};break}if(!C.list.length)break;const K=C.list[0];u=K.e,b=K.end===0?1:-1,M+=u.len}}t.deckT=c.deck?(t.deckT||0)+e:0,t.skyT=c.el?(t.skyT||0)+e:0,c.el&&(t.leftDeck=!0),t.groundT=c.el?0:(t.groundT||0)+e;const Y=(u,b)=>{const M=h.options(u,b),x=t.choices.get(u.id*2+b);if(x!==void 0)return Math.min(x,M.list.length-1);if(!t.goal||M.list.length<2)return M.def;const _=h.nodes[M.node],C=t.goal.x-_.x,K=t.goal.z-_.z,X=Math.hypot(C,K)||1;let n=0,r=1/0;const a=(u.deck?16:34)+40*(1-Dt(300,1300,X));return M.list.forEach((d,o)=>{const f=h.at(d.e,d.end===0?Math.min(d.e.len,160):Math.max(0,d.e.len-160),Lt),s=f.x-_.x,y=f.z-_.z,p=Math.hypot(s,y)||1,w=(s*C+y*K)/(p*X),m=u.deck&&!d.e.deck?Math.min(60,Math.max(0,t.deckT-12)*2.5)*(.6+.4*Math.max(0,w)):0,l=(t.visits.get(d.e.id)||0)*22,T=!u.deck&&d.climb==="up"&&t.groundT<35&&t.leftDeck?30:0,B=!u.deck&&d.climb==="up"&&!t.leftDeck?-30:0,A=d.cost+(1-w)*a-m+l+T+B;A<r&&(r=A,n=o)}),n};if(D){let u=Y(D.e,D.endArr);const b=D.e.id*2+D.endArr,M=D.opt.list.length;let x=0;D.opt.list.forEach((_,C)=>{Math.abs(_.a)<Math.abs(D.opt.list[x].a)&&(x=C)}),!U&&t.intentT>0&&!t.choices.has(b)?(u=Math.max(0,Math.min(M-1,x+t.intent)),t.choices.set(b,u),t.intentT=0,t.pressed=(t.pressed||0)+1,t.keyRep=.45):!U&&z!==0&&!k&&t.keyRep<=0?(u=Math.max(0,Math.min(M-1,u+z)),t.choices.set(b,u),t.keyRep=.45):!U&&k&&t.choices.has(b)&&(u=Math.max(0,Math.min(M-1,u+z)),t.choices.set(b,u),t.intentT=0,t.keyRep=.45),z!==0&&(t.keyRep-=e),t.choice=u,t.hint={lane:D.e.id*2+D.endArr,opt:D.opt,choice:u,dist:D.dist,key:D.opt.key}}t.keyX=i.x,!g.locked&&!t.conn&&!t.offEdge&&t.jumpCd<=0&&t.idleT>3&&(!c.el&&t.canUp&&!t.leftDeck&&t.leapUp?Et(t,h,t.leapUp,1):c.el&&t.skyT>50&&t.canDown&&t.leapDown&&(Et(t,h,t.leapDown,-1),t.skyT=0));const J=c.C,H=g.railMotion?.flowSpeed?.(c),O=Number.isFinite(H)&&H>0;let F=0,P=0;if(c.el&&!t.conn&&!t.offEdge&&t.s>8&&t.s<c.len-8){const u=h.at(c,t.s,At).y,b=h.at(c,t.s+8*t.dir,At).y,M=h.at(c,t.s-8*t.dir,At).y;F=(b-M)/16,P=(b-2*u+M)/64*t.v*t.v}t.gv=O?0:Math.max(-18,Math.min(20,(t.gv||0)+(-9.8*14*F-.35*(t.gv||0))*e)),t.yv=(t.yv||0)+(-3.2*2.2*Math.tanh(P/2.2)-4*(t.yo||0)-2.4*(t.yv||0))*e,t.yo=Math.max(-2.5,Math.min(2.5,(t.yo||0)+t.yv*e));let q=O?H:J.speed;if(!O&&c.cls==="ramp"&&c.station>=0&&h.stations[c.station]){const u=h.stations[c.station],b=Math.hypot(t.pos.x-u.x,t.pos.z-u.z)/u.R;q*=.72+.28*Dt(.5,1.4,b)}if(c.el&&!O){const u=t.dir>0?1:-1,b=h.at(c,t.s,Lt).i;let M=999;for(let x=0;x<22;x++){const _=b+u*x;if(_<0||_>=c.n||Math.abs(c.cum[_]-t.s)>80)break;const C=Math.abs(c.cum[_]-t.s);M=Math.min(M,Math.sqrt(c.vcap[_]*c.vcap[_]+2*12*C))}q=Math.min(q,M)}let I=t.anchor?0:t.up?-10:q*(i.z>0?1.5:1);if(!O&&I>0&&!t.conn&&!t.offEdge){const u=t.dir>0?1:0,b=h.options(c,u),M=t.dir>0?c.len-t.s:t.s;if(b.list.length){const x=Math.abs(b.list[Y(c,u)].a),_=x<.3?999:24+56*Math.max(0,1-x/1.5);I=Math.min(I,Math.sqrt(_*_+2*34*Math.max(0,M)))}}if(!O&&I>0&&D&&c.el&&t.choices.get(D.e.id*2+D.endArr)===void 0){const u=34*(i.z>0?1.3:1);I=Math.min(I,Math.sqrt(u*u+2*16*Math.max(0,D.dist-30)))}g.speedK!==void 0&&(I*=g.speedK),I>0&&(I=Math.max(6,I+t.gv));const ft=Number.isFinite(g.coastSpeed);if(ft?t.v=g.coastSpeed:t.v+=(I-t.v)*Math.min(1,e*(t.anchor?5:I<t.v?2.2:1.1)),t.pace=q,t.conn){const u=t.conn;u.u+=(ft?Math.abs(t.v):Math.max(24,Math.abs(t.v)))*e/u.len;const b=Math.min(1,u.u),M=b*b*(3-2*b)*.3+b*.7,x=u.P,_=bt(x[0][0],x[1][0],x[2][0],x[3][0],M),C=bt(x[0][1],x[1][1],x[2][1],x[3][1],M),K=bt(x[0][2],x[1][2],x[2][2],x[3][2],M),X=Nt(x[0][0],x[1][0],x[2][0],x[3][0],M),n=Nt(x[0][2],x[1][2],x[2][2],x[3][2],M);t._target(_,C,K,Math.atan2(X,n),e,26),u.u>=1&&(t.conn=null,t.s=u.to.s,t.dir=u.to.dir,t.lat=0,t.alt=t.altWant=1.8,t.choices.clear(),Mt(t,u.to.e,!1),c=u.to.e,ft||(t.v=Math.max(t.v,26)))}else if(t.offEdge){const u=Math.sin(t.heading),b=Math.cos(t.heading);t._target(t.pos.x+u*t.v*e*4,t.pos.y,t.pos.z+b*t.v*e*4,t.heading,e,6)}else{t.s+=t.dir*t.v*e;for(let u=0;u<6&&(t.s>c.len||t.s<0);u++){const b=t.s>c.len?1:0,M=b?t.s-c.len:-t.s,x=h.options(c,b);if(!x.list.length){const a=h.nodes[b?c.b:c.a]||{};if(a.portal&&!a.border){t.s=b?c.len:0,t.v=Math.min(t.v,3),t.waitTile=!0;break}if(a.border&&!c.el&&(i.z>0||a.exit)){t.offEdge=!0,t.s=b?c.len:0;break}a.border&&(t.bounced=!c.el),t.dir=-t.dir,t.s=b?c.len-M:M;continue}const _=b===1==t.dir>0,C=_?Y(c,b):x.def,K=x.list[C];t.grace=_&&x.list.length>1?{list:x.list,idx:C,d:M}:null,t.choices.delete(c.id*2+b);const X=K.e,n=K.end===0,r=n?1:-1;t.dir=_?r:-r,t.s=n?M:X.len-M,Mt(t,X),c=X}if(!t.offEdge){const u=h.at(c,t.s,E),b=u.tx*t.dir,M=u.tz*t.dir,x=-M,_=b,C=c.C.half;if(t.hint){const r=t.hint.opt.list[t.hint.choice],a=Math.max(-1,Math.min(1,-r.a))*C*.6;t.lat+=(a-t.lat)*Math.min(1,e*1.8)}else t.lat+=i.x*11*e,i.x||(t.lat*=1-Math.min(1,e*.35));t.lat=Math.max(-C,Math.min(C,t.lat));const K=g.altMax??7;j||(t.altWant=Math.max(.7,Math.min(K,t.altWant+i.y*6*e))),i.y||(t.altWant+=(1.8-t.altWant)*Math.min(1,e*.25)),t.alt+=(t.altWant-t.alt)*Math.min(1,e*4);const X=Math.sin(t.phase*.21)*.25,n=(t.lat+X)*Math.sin(u.b)*t.dir;t._target(u.x+x*(t.lat+X),u.y+J.y+n+t.alt+t.yo+Math.sin(t.phase*.13)*.2,u.z+_*(t.lat+X),Math.atan2(b,M),e,13)}}const Z=v.sample(t.pos.x,t.pos.y,t.pos.z,t.flow),ut=h.at(c,t.s,E);return Z.vx=ut.tx*t.dir*c.C.speed,Z.vz=ut.tz*t.dir*c.C.speed,Z.vy=0,Z.w=1,Z.lane=c,Z.onDeck=ut.y>3,t._after(e,i),Z}function Et(t,e,i,v,h){if(!i)return;const g=Math.max(20,Math.abs(t.v)*.75),E=Math.max(0,Math.min(i.e.len,i.s+i.dir*g)),S=e.at(i.e,E,Lt),c=[t.pos.x,t.pos.y,t.pos.z],z=[S.x,S.y+i.e.C.y+1.8,S.z],k=Math.hypot(z[0]-c[0],z[2]-c[2]),U=z[1]-c[1],L=Math.sin(t.heading),j=Math.cos(t.heading),ot=Math.max(10,k*.4),rt=S.tx*i.dir,D=S.tz*i.dir,Y=[c,[c[0]+L*ot,c[1]+(v>0?U*.8+9:5),c[2]+j*ot],[z[0]-rt*ot,z[1]+(v>0?7:-U*.3+3),z[2]-D*ot],z];let J=0,H=c;for(let O=1;O<=12;O++){const F=O/12,P=[0,1,2].map(q=>bt(Y[0][q],Y[1][q],Y[2][q],Y[3][q],F));J+=Math.hypot(P[0]-H[0],P[1]-H[1],P[2]-H[2]),H=P}t.conn={jump:v>0?"up":"down",P:Y,len:Math.max(6,J),u:0,to:{e:i.e,s:E,dir:i.dir}},t.jumpCd=.9,t.up=!1,t.anchor=!1,t.hint=null}export{It as C,Yt as L,ve as a,Kt as b,ye as c,Me as d,Se as p,ze as u};
