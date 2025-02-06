"use strict";(()=>{var ee=Math.pow;var M=(c=>typeof require!="undefined"?require:typeof Proxy!="undefined"?new Proxy(c,{get:(e,t)=>(typeof require!="undefined"?require:e)[t]}):c)(function(c){if(typeof require!="undefined")return require.apply(this,arguments);throw Error('Dynamic require of "'+c+'" is not supported')});var C=M("three");var f=M("three");var O=class{constructor(){this.startTime=performance.now(),this.previousTime=0,this.currentTime=0,this._delta=0,this._elapsed=0,this._fixedDelta=1e3/60,this.timescale=1,this.useFixedDelta=!1,this._autoReset=!1}get autoReset(){return this._autoReset}set autoReset(e){typeof document!="undefined"&&document.hidden!==void 0&&(e?document.addEventListener("visibilitychange",this):document.removeEventListener("visibilitychange",this),this._autoReset=e)}get delta(){return this._delta*.001}get fixedDelta(){return this._fixedDelta*.001}set fixedDelta(e){this._fixedDelta=e*1e3}get elapsed(){return this._elapsed*.001}update(e){this.useFixedDelta?this._delta=this.fixedDelta:(this.previousTime=this.currentTime,this.currentTime=(e!==void 0?e:performance.now())-this.startTime,this._delta=this.currentTime-this.previousTime),this._delta*=this.timescale,this._elapsed+=this._delta}reset(){this._delta=0,this._elapsed=0,this.currentTime=performance.now()-this.startTime}getDelta(){return this.delta}getElapsed(){return this.elapsed}handleEvent(e){document.hidden||(this.currentTime=performance.now()-this.startTime)}dispose(){this.autoReset=!1}};var g=M("three"),qe=(()=>{let c=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),e=new Float32Array([0,0,2,0,0,2]),t=new g.BufferGeometry;return t.setAttribute("position",new g.BufferAttribute(c,3)),t.setAttribute("uv",new g.BufferAttribute(e,2)),t})(),T=class c{static get fullscreenGeometry(){return qe}constructor(e="Pass",t=new g.Scene,s=new g.Camera){this.name=e,this.renderer=null,this.scene=t,this.camera=s,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(e){if(this.rtt===e){let t=this.fullscreenMaterial;t!==null&&(t.needsUpdate=!0),this.rtt=!e}}set mainScene(e){}set mainCamera(e){}setRenderer(e){this.renderer=e}isEnabled(){return this.enabled}setEnabled(e){this.enabled=e}get fullscreenMaterial(){return this.screen!==null?this.screen.material:null}set fullscreenMaterial(e){let t=this.screen;t!==null?t.material=e:(t=new g.Mesh(c.fullscreenGeometry,e),t.frustumCulled=!1,this.scene===null&&(this.scene=new g.Scene),this.scene.add(t),this.screen=t)}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(e){this.fullscreenMaterial=e}getDepthTexture(){return null}setDepthTexture(e,t=g.BasicDepthPacking){}render(e,t,s,i,n){throw new Error("Render method not implemented!")}setSize(e,t){}initialize(e,t,s){}dispose(){for(let e of Object.keys(this)){let t=this[e];(t instanceof g.WebGLRenderTarget||t instanceof g.Material||t instanceof g.Texture||t instanceof c)&&this[e].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}};var H=class extends T{constructor(){super("ClearMaskPass",null,null),this.needsSwap=!1}render(e,t,s,i,n){let r=e.state.buffers.stencil;r.setLocked(!1),r.setTest(!1)}};var D=M("three");var I=M("three");var te=`#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
uniform float opacity;varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=opacity*texel;
#include <colorspace_fragment>
#include <dithering_fragment>
}`;var se="varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}";var U=class extends I.ShaderMaterial{constructor(){super({name:"CopyMaterial",uniforms:{inputBuffer:new I.Uniform(null),opacity:new I.Uniform(1)},blending:I.NoBlending,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:te,vertexShader:se})}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.uniforms.inputBuffer.value=e}getOpacity(e){return this.uniforms.opacity.value}setOpacity(e){this.uniforms.opacity.value=e}};var k=class extends T{constructor(e,t=!0){super("CopyPass"),this.fullscreenMaterial=new U,this.needsSwap=!1,this.renderTarget=e,e===void 0&&(this.renderTarget=new D.WebGLRenderTarget(1,1,{minFilter:D.LinearFilter,magFilter:D.LinearFilter,stencilBuffer:!1,depthBuffer:!1}),this.renderTarget.texture.name="CopyPass.Target"),this.autoResize=t}get resize(){return this.autoResize}set resize(e){this.autoResize=e}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}setAutoResizeEnabled(e){this.autoResize=e}render(e,t,s,i,n){this.fullscreenMaterial.inputBuffer=t.texture,e.setRenderTarget(this.renderToScreen?null:this.renderTarget),e.render(this.scene,this.camera)}setSize(e,t){this.autoResize&&this.renderTarget.setSize(e,t)}initialize(e,t,s){s!==void 0&&(this.renderTarget.texture.type=s,s!==D.UnsignedByteType?this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1":e!==null&&e.outputColorSpace===D.SRGBColorSpace&&(this.renderTarget.texture.colorSpace=D.SRGBColorSpace))}};var re=M("three");var ie=new re.Color,L=class extends T{constructor(e=!0,t=!0,s=!1){super("ClearPass",null,null),this.needsSwap=!1,this.color=e,this.depth=t,this.stencil=s,this.overrideClearColor=null,this.overrideClearAlpha=-1}setClearFlags(e,t,s){this.color=e,this.depth=t,this.stencil=s}getOverrideClearColor(){return this.overrideClearColor}setOverrideClearColor(e){this.overrideClearColor=e}getOverrideClearAlpha(){return this.overrideClearAlpha}setOverrideClearAlpha(e){this.overrideClearAlpha=e}render(e,t,s,i,n){let r=this.overrideClearColor,o=this.overrideClearAlpha,a=e.getClearAlpha(),d=r!==null,h=o>=0;d?(e.getClearColor(ie),e.setClearColor(r,h?o:a)):h&&e.setClearAlpha(o),e.setRenderTarget(this.renderToScreen?null:t),e.clear(this.color,this.depth,this.stencil),d?e.setClearColor(ie,a):h&&e.setClearAlpha(a)}};var z=class extends T{constructor(e,t){super("MaskPass",e,t),this.needsSwap=!1,this.clearPass=new L(!1,!1,!0),this.inverse=!1}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get inverted(){return this.inverse}set inverted(e){this.inverse=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getClearPass(){return this.clearPass}isInverted(){return this.inverted}setInverted(e){this.inverted=e}render(e,t,s,i,n){let r=e.getContext(),o=e.state.buffers,a=this.scene,d=this.camera,h=this.clearPass,E=this.inverted?0:1,x=1-E;o.color.setMask(!1),o.depth.setMask(!1),o.color.setLocked(!0),o.depth.setLocked(!0),o.stencil.setTest(!0),o.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),o.stencil.setFunc(r.ALWAYS,E,4294967295),o.stencil.setClear(x),o.stencil.setLocked(!0),this.clearPass.enabled&&(this.renderToScreen?h.render(e,null):(h.render(e,t),h.render(e,s))),this.renderToScreen?(e.setRenderTarget(null),e.render(a,d)):(e.setRenderTarget(t),e.render(a,d),e.setRenderTarget(s),e.render(a,d)),o.color.setLocked(!1),o.depth.setLocked(!1),o.stencil.setLocked(!1),o.stencil.setFunc(r.EQUAL,1,4294967295),o.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),o.stencil.setLocked(!0)}};var V=class{constructor(e=null,{depthBuffer:t=!0,stencilBuffer:s=!1,multisampling:i=0,frameBufferType:n}={}){this.renderer=null,this.inputBuffer=this.createBuffer(t,s,n,i),this.outputBuffer=this.inputBuffer.clone(),this.copyPass=new k,this.depthTexture=null,this.passes=[],this.timer=new O,this.autoRenderToScreen=!0,this.setRenderer(e)}get multisampling(){return this.inputBuffer.samples||0}set multisampling(e){let t=this.inputBuffer,s=this.multisampling;s>0&&e>0?(this.inputBuffer.samples=e,this.outputBuffer.samples=e,this.inputBuffer.dispose(),this.outputBuffer.dispose()):s!==e&&(this.inputBuffer.dispose(),this.outputBuffer.dispose(),this.inputBuffer=this.createBuffer(t.depthBuffer,t.stencilBuffer,t.texture.type,e),this.inputBuffer.depthTexture=this.depthTexture,this.outputBuffer=this.inputBuffer.clone())}getTimer(){return this.timer}getRenderer(){return this.renderer}setRenderer(e){if(this.renderer=e,e!==null){let t=e.getSize(new f.Vector2),s=e.getContext().getContextAttributes().alpha,i=this.inputBuffer.texture.type;i===f.UnsignedByteType&&e.outputColorSpace===f.SRGBColorSpace&&(this.inputBuffer.texture.colorSpace=f.SRGBColorSpace,this.outputBuffer.texture.colorSpace=f.SRGBColorSpace,this.inputBuffer.dispose(),this.outputBuffer.dispose()),e.autoClear=!1,this.setSize(t.width,t.height);for(let n of this.passes)n.initialize(e,s,i)}}replaceRenderer(e,t=!0){let s=this.renderer,i=s.domElement.parentNode;return this.setRenderer(e),t&&i!==null&&(i.removeChild(s.domElement),i.appendChild(e.domElement)),s}createDepthTexture(){let e=this.depthTexture=new f.DepthTexture;return this.inputBuffer.depthTexture=e,this.inputBuffer.dispose(),this.inputBuffer.stencilBuffer?(e.format=f.DepthStencilFormat,e.type=f.UnsignedInt248Type):e.type=f.UnsignedIntType,e}deleteDepthTexture(){if(this.depthTexture!==null){this.depthTexture.dispose(),this.depthTexture=null,this.inputBuffer.depthTexture=null,this.inputBuffer.dispose();for(let e of this.passes)e.setDepthTexture(null)}}createBuffer(e,t,s,i){let n=this.renderer,r=n===null?new f.Vector2:n.getDrawingBufferSize(new f.Vector2),o={minFilter:f.LinearFilter,magFilter:f.LinearFilter,stencilBuffer:t,depthBuffer:e,type:s},a=new f.WebGLRenderTarget(r.width,r.height,o);return i>0&&(a.ignoreDepthForMultisampleCopy=!1,a.samples=i),s===f.UnsignedByteType&&n!==null&&n.outputColorSpace===f.SRGBColorSpace&&(a.texture.colorSpace=f.SRGBColorSpace),a.texture.name="EffectComposer.Buffer",a.texture.generateMipmaps=!1,a}setMainScene(e){for(let t of this.passes)t.mainScene=e}setMainCamera(e){for(let t of this.passes)t.mainCamera=e}addPass(e,t){let s=this.passes,i=this.renderer,n=i.getDrawingBufferSize(new f.Vector2),r=i.getContext().getContextAttributes().alpha,o=this.inputBuffer.texture.type;if(e.setRenderer(i),e.setSize(n.width,n.height),e.initialize(i,r,o),this.autoRenderToScreen&&(s.length>0&&(s[s.length-1].renderToScreen=!1),e.renderToScreen&&(this.autoRenderToScreen=!1)),t!==void 0?s.splice(t,0,e):s.push(e),this.autoRenderToScreen&&(s[s.length-1].renderToScreen=!0),e.needsDepthTexture||this.depthTexture!==null)if(this.depthTexture===null){let a=this.createDepthTexture();for(e of s)e.setDepthTexture(a)}else e.setDepthTexture(this.depthTexture)}removePass(e){let t=this.passes,s=t.indexOf(e);if(s!==-1&&t.splice(s,1).length>0){if(this.depthTexture!==null){let r=(a,d)=>a||d.needsDepthTexture;t.reduce(r,!1)||(e.getDepthTexture()===this.depthTexture&&e.setDepthTexture(null),this.deleteDepthTexture())}this.autoRenderToScreen&&s===t.length&&(e.renderToScreen=!1,t.length>0&&(t[t.length-1].renderToScreen=!0))}}removeAllPasses(){let e=this.passes;this.deleteDepthTexture(),e.length>0&&(this.autoRenderToScreen&&(e[e.length-1].renderToScreen=!1),this.passes=[])}render(e){let t=this.renderer,s=this.copyPass,i=this.inputBuffer,n=this.outputBuffer,r=!1,o,a,d;e===void 0&&(this.timer.update(),e=this.timer.getDelta());for(let h of this.passes)h.enabled&&(h.render(t,i,n,e,r),h.needsSwap&&(r&&(s.renderToScreen=h.renderToScreen,o=t.getContext(),a=t.state.buffers.stencil,a.setFunc(o.NOTEQUAL,1,4294967295),s.render(t,i,n,e,r),a.setFunc(o.EQUAL,1,4294967295)),d=i,i=n,n=d),h instanceof z?r=!0:h instanceof H&&(r=!1))}setSize(e,t,s){let i=this.renderer,n=i.getSize(new f.Vector2);(e===void 0||t===void 0)&&(e=n.width,t=n.height),(n.width!==e||n.height!==t)&&i.setSize(e,t,s);let r=i.getDrawingBufferSize(new f.Vector2);this.inputBuffer.setSize(r.width,r.height),this.outputBuffer.setSize(r.width,r.height);for(let o of this.passes)o.setSize(r.width,r.height)}reset(){this.dispose(),this.autoRenderToScreen=!0}dispose(){for(let e of this.passes)e.dispose();this.passes=[],this.inputBuffer!==null&&this.inputBuffer.dispose(),this.outputBuffer!==null&&this.outputBuffer.dispose(),this.deleteDepthTexture(),this.copyPass.dispose(),this.timer.dispose(),T.fullscreenGeometry.dispose()}};var ne=M("three");var w={NONE:0,DEPTH:1,CONVOLUTION:2};var u={FRAGMENT_HEAD:"FRAGMENT_HEAD",FRAGMENT_MAIN_UV:"FRAGMENT_MAIN_UV",FRAGMENT_MAIN_IMAGE:"FRAGMENT_MAIN_IMAGE",VERTEX_HEAD:"VERTEX_HEAD",VERTEX_MAIN_SUPPORT:"VERTEX_MAIN_SUPPORT"};var X=class{constructor(){this.shaderParts=new Map([[u.FRAGMENT_HEAD,null],[u.FRAGMENT_MAIN_UV,null],[u.FRAGMENT_MAIN_IMAGE,null],[u.VERTEX_HEAD,null],[u.VERTEX_MAIN_SUPPORT,null]]),this.defines=new Map,this.uniforms=new Map,this.blendModes=new Map,this.extensions=new Set,this.attributes=w.NONE,this.varyings=new Set,this.uvTransformation=!1,this.readDepth=!1,this.colorSpace=ne.LinearSRGBColorSpace}};var b=M("three"),J=!1,G=class{constructor(e=null){this.originalMaterials=new Map,this.material=null,this.materials=null,this.materialsBackSide=null,this.materialsDoubleSide=null,this.materialsFlatShaded=null,this.materialsFlatShadedBackSide=null,this.materialsFlatShadedDoubleSide=null,this.setMaterial(e),this.meshCount=0,this.replaceMaterial=t=>{if(t.isMesh){let s;if(t.material.flatShading)switch(t.material.side){case b.DoubleSide:s=this.materialsFlatShadedDoubleSide;break;case b.BackSide:s=this.materialsFlatShadedBackSide;break;default:s=this.materialsFlatShaded;break}else switch(t.material.side){case b.DoubleSide:s=this.materialsDoubleSide;break;case b.BackSide:s=this.materialsBackSide;break;default:s=this.materials;break}this.originalMaterials.set(t,t.material),t.isSkinnedMesh?t.material=s[2]:t.isInstancedMesh?t.material=s[1]:t.material=s[0],++this.meshCount}}}cloneMaterial(e){if(!(e instanceof b.ShaderMaterial))return e.clone();let t=e.uniforms,s=new Map;for(let n in t){let r=t[n].value;r.isRenderTargetTexture&&(t[n].value=null,s.set(n,r))}let i=e.clone();for(let n of s)t[n[0]].value=n[1],i.uniforms[n[0]].value=n[1];return i}setMaterial(e){if(this.disposeMaterials(),this.material=e,e!==null){let t=this.materials=[this.cloneMaterial(e),this.cloneMaterial(e),this.cloneMaterial(e)];for(let s of t)s.uniforms=Object.assign({},e.uniforms),s.side=b.FrontSide;t[2].skinning=!0,this.materialsBackSide=t.map(s=>{let i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.side=b.BackSide,i}),this.materialsDoubleSide=t.map(s=>{let i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.side=b.DoubleSide,i}),this.materialsFlatShaded=t.map(s=>{let i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.flatShading=!0,i}),this.materialsFlatShadedBackSide=t.map(s=>{let i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.flatShading=!0,i.side=b.BackSide,i}),this.materialsFlatShadedDoubleSide=t.map(s=>{let i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.flatShading=!0,i.side=b.DoubleSide,i})}}render(e,t,s){let i=e.shadowMap.enabled;if(e.shadowMap.enabled=!1,J){let n=this.originalMaterials;this.meshCount=0,t.traverse(this.replaceMaterial),e.render(t,s);for(let r of n)r[0].material=r[1];this.meshCount!==n.size&&n.clear()}else{let n=t.overrideMaterial;t.overrideMaterial=this.material,e.render(t,s),t.overrideMaterial=n}e.shadowMap.enabled=i}disposeMaterials(){if(this.material!==null){let e=this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);for(let t of e)t.dispose()}}dispose(){this.originalMaterials.clear(),this.disposeMaterials()}static get workaroundEnabled(){return J}static set workaroundEnabled(e){J=e}};var Q=M("three");var l={SKIP:9,SET:30,ADD:0,ALPHA:1,AVERAGE:2,COLOR:3,COLOR_BURN:4,COLOR_DODGE:5,DARKEN:6,DIFFERENCE:7,DIVIDE:8,DST:9,EXCLUSION:10,HARD_LIGHT:11,HARD_MIX:12,HUE:13,INVERT:14,INVERT_RGB:15,LIGHTEN:16,LINEAR_BURN:17,LINEAR_DODGE:18,LINEAR_LIGHT:19,LUMINOSITY:20,MULTIPLY:21,NEGATION:22,NORMAL:23,OVERLAY:24,PIN_LIGHT:25,REFLECT:26,SATURATION:27,SCREEN:28,SOFT_LIGHT:29,SRC:30,SUBTRACT:31,VIVID_LIGHT:32};var oe="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,x+y,opacity);}";var ae="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,y,min(y.a,opacity));}";var ce="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,(x+y)*0.5,opacity);}";var le="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 xHSL=RGBToHSL(x.rgb);vec3 yHSL=RGBToHSL(y.rgb);vec3 z=HSLToRGB(vec3(yHSL.rg,xHSL.b));return vec4(mix(x.rgb,z,opacity),y.a);}";var ue="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=mix(step(0.0,y)*(1.0-min(vec4(1.0),(1.0-x)/y)),vec4(1.0),step(1.0,x));return mix(x,z,opacity);}";var fe="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=step(0.0,x)*mix(min(vec4(1.0),x/max(1.0-y,1e-9)),vec4(1.0),step(1.0,y));return mix(x,z,opacity);}";var he="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,min(x,y),opacity);}";var de="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,abs(x-y),opacity);}";var pe="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,x/max(y,1e-12),opacity);}";var me="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,(x+y-2.0*x*y),opacity);}";var ge="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 a=min(x,1.0),b=min(y,1.0);vec4 z=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,y));return mix(x,z,opacity);}";var xe="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,step(1.0,x+y),opacity);}";var ve="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 xHSL=RGBToHSL(x.rgb);vec3 yHSL=RGBToHSL(y.rgb);vec3 z=HSLToRGB(vec3(yHSL.r,xHSL.gb));return vec4(mix(x.rgb,z,opacity),y.a);}";var Se="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,1.0-y,opacity);}";var Te="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,y*(1.0-x),opacity);}";var Ee="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,max(x,y),opacity);}";var ye="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,clamp(y+x-1.0,0.0,1.0),opacity);}";var Me="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,min(x+y,1.0),opacity);}";var be="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,clamp(2.0*y+x-1.0,0.0,1.0),opacity);}";var Re="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 xHSL=RGBToHSL(x.rgb);vec3 yHSL=RGBToHSL(y.rgb);vec3 z=HSLToRGB(vec3(xHSL.rg,yHSL.b));return vec4(mix(x.rgb,z,opacity),y.a);}";var Ce="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,x*y,opacity);}";var Be="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,1.0-abs(1.0-x-y),opacity);}";var Ae="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,y,opacity);}";var De="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=mix(2.0*y*x,1.0-2.0*(1.0-y)*(1.0-x),step(0.5,x));return mix(x,z,opacity);}";var we="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 y2=2.0*y;vec4 z=mix(mix(y2,x,step(0.5*x,y)),max(vec4(0.0),y2-1.0),step(x,(y2-1.0)));return mix(x,z,opacity);}";var _e="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=mix(min(x*x/max(1.0-y,1e-12),1.0),y,step(1.0,y));return mix(x,z,opacity);}";var Ne="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec3 xHSL=RGBToHSL(x.rgb);vec3 yHSL=RGBToHSL(y.rgb);vec3 z=HSLToRGB(vec3(xHSL.r,yHSL.g,xHSL.b));return vec4(mix(x.rgb,z,opacity),y.a);}";var Ie="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,x+y-min(x*y,1.0),opacity);}";var Le="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 y2=2.0*y;vec4 w=step(0.5,y);vec4 z=mix(x-(1.0-y2)*x*(1.0-x),mix(x+(y2-1.0)*(sqrt(x)-x),x+(y2-1.0)*x*((16.0*x-12.0)*x+3.0),w*(1.0-step(0.25,x))),w);return mix(x,z,opacity);}";var Pe="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return y;}";var Ge="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return mix(x,max(x+y-1.0,0.0),opacity);}";var Fe="vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=mix(max(1.0-min((1.0-x)/(2.0*y),1.0),0.0),min(x/(2.0*(1.0-y)),1.0),step(0.5,y));return mix(x,z,opacity);}";var wt=new Map([[l.ADD,oe],[l.ALPHA,ae],[l.AVERAGE,ce],[l.COLOR,le],[l.COLOR_BURN,ue],[l.COLOR_DODGE,fe],[l.DARKEN,he],[l.DIFFERENCE,de],[l.DIVIDE,pe],[l.DST,null],[l.EXCLUSION,me],[l.HARD_LIGHT,ge],[l.HARD_MIX,xe],[l.HUE,ve],[l.INVERT,Se],[l.INVERT_RGB,Te],[l.LIGHTEN,Ee],[l.LINEAR_BURN,ye],[l.LINEAR_DODGE,Me],[l.LINEAR_LIGHT,be],[l.LUMINOSITY,Re],[l.MULTIPLY,Ce],[l.NEGATION,Be],[l.NORMAL,Ae],[l.OVERLAY,De],[l.PIN_LIGHT,we],[l.REFLECT,_e],[l.SATURATION,Ne],[l.SCREEN,Ie],[l.SOFT_LIGHT,Le],[l.SRC,Pe],[l.SUBTRACT,Ge],[l.VIVID_LIGHT,Fe]]),$=class extends Q.EventDispatcher{constructor(e,t=1){super(),this._blendFunction=e,this.opacity=new Q.Uniform(t)}getOpacity(){return this.opacity.value}setOpacity(e){this.opacity.value=e}get blendFunction(){return this._blendFunction}set blendFunction(e){this._blendFunction=e,this.dispatchEvent({type:"change"})}getBlendFunction(){return this.blendFunction}setBlendFunction(e){this.blendFunction=e}getShaderCode(){return wt.get(this.blendFunction)}};var R=M("three");var K=class extends R.EventDispatcher{constructor(e,t,{attributes:s=w.NONE,blendFunction:i=l.NORMAL,defines:n=new Map,uniforms:r=new Map,extensions:o=null,vertexShader:a=null}={}){super(),this.name=e,this.renderer=null,this.attributes=s,this.fragmentShader=t,this.vertexShader=a,this.defines=n,this.uniforms=r,this.extensions=o,this.blendMode=new $(i),this.blendMode.addEventListener("change",d=>this.setChanged()),this._inputColorSpace=R.LinearSRGBColorSpace,this._outputColorSpace=R.NoColorSpace}get inputColorSpace(){return this._inputColorSpace}set inputColorSpace(e){this._inputColorSpace=e,this.setChanged()}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e,this.setChanged()}set mainScene(e){}set mainCamera(e){}getName(){return this.name}setRenderer(e){this.renderer=e}getDefines(){return this.defines}getUniforms(){return this.uniforms}getExtensions(){return this.extensions}getBlendMode(){return this.blendMode}getAttributes(){return this.attributes}setAttributes(e){this.attributes=e,this.setChanged()}getFragmentShader(){return this.fragmentShader}setFragmentShader(e){this.fragmentShader=e,this.setChanged()}getVertexShader(){return this.vertexShader}setVertexShader(e){this.vertexShader=e,this.setChanged()}setChanged(){this.dispatchEvent({type:"change"})}setDepthTexture(e,t=R.BasicDepthPacking){}update(e,t,s){}setSize(e,t){}initialize(e,t,s){}dispose(){for(let e of Object.keys(this)){let t=this[e];(t instanceof R.WebGLRenderTarget||t instanceof R.Material||t instanceof R.Texture||t instanceof T)&&this[e].dispose()}}};var He=M("three");var Oe="uniform float factor;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(floor(inputColor.rgb*factor+0.5)/factor,inputColor.a);}";var j=class extends K{constructor({blendFunction:e,bits:t=16}={}){super("ColorDepthEffect",Oe,{blendFunction:e,uniforms:new Map([["factor",new He.Uniform(1)]])}),this.bits=0,this.bitDepth=t}get bitDepth(){return this.bits}set bitDepth(e){this.bits=e,this.uniforms.get("factor").value=Math.pow(2,e/3)}getBitDepth(){return this.bitDepth}setBitDepth(e){this.bitDepth=e}};var q=class extends T{constructor(e,t,s=null){super("RenderPass",e,t),this.needsSwap=!1,this.clearPass=new L,this.overrideMaterialManager=s===null?null:new G(s),this.ignoreBackground=!1,this.skipShadowMapUpdate=!1,this.selection=null}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get renderToScreen(){return super.renderToScreen}set renderToScreen(e){super.renderToScreen=e,this.clearPass.renderToScreen=e}get overrideMaterial(){let e=this.overrideMaterialManager;return e!==null?e.material:null}set overrideMaterial(e){let t=this.overrideMaterialManager;e!==null?t!==null?t.setMaterial(e):this.overrideMaterialManager=new G(e):t!==null&&(t.dispose(),this.overrideMaterialManager=null)}getOverrideMaterial(){return this.overrideMaterial}setOverrideMaterial(e){this.overrideMaterial=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getSelection(){return this.selection}setSelection(e){this.selection=e}isBackgroundDisabled(){return this.ignoreBackground}setBackgroundDisabled(e){this.ignoreBackground=e}isShadowMapDisabled(){return this.skipShadowMapUpdate}setShadowMapDisabled(e){this.skipShadowMapUpdate=e}getClearPass(){return this.clearPass}render(e,t,s,i,n){let r=this.scene,o=this.camera,a=this.selection,d=o.layers.mask,h=r.background,E=e.shadowMap.autoUpdate,x=this.renderToScreen?null:t;a!==null&&o.layers.set(a.getLayer()),this.skipShadowMapUpdate&&(e.shadowMap.autoUpdate=!1),(this.ignoreBackground||this.clearPass.overrideClearColor!==null)&&(r.background=null),this.clearPass.enabled&&this.clearPass.render(e,t),e.setRenderTarget(x),this.overrideMaterialManager!==null?this.overrideMaterialManager.render(e,r,o):e.render(r,o),o.layers.mask=d,r.background=h,e.shadowMap.autoUpdate=E}};var p=M("three");var Ue=`#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`;var ke="uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}";var W=class extends p.ShaderMaterial{constructor(e,t,s,i,n=!1){super({name:"EffectMaterial",defines:{THREE_REVISION:p.REVISION.replace(/\D+/g,""),DEPTH_PACKING:"0",ENCODE_OUTPUT:"1"},uniforms:{inputBuffer:new p.Uniform(null),depthBuffer:new p.Uniform(null),resolution:new p.Uniform(new p.Vector2),texelSize:new p.Uniform(new p.Vector2),cameraNear:new p.Uniform(.3),cameraFar:new p.Uniform(1e3),aspect:new p.Uniform(1),time:new p.Uniform(0)},blending:p.NoBlending,toneMapped:!1,depthWrite:!1,depthTest:!1,dithering:n}),e&&this.setShaderParts(e),t&&this.setDefines(t),s&&this.setUniforms(s),this.copyCameraSettings(i)}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.uniforms.inputBuffer.value=e}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(e){this.uniforms.depthBuffer.value=e}get depthPacking(){return Number(this.defines.DEPTH_PACKING)}set depthPacking(e){this.defines.DEPTH_PACKING=e.toFixed(0),this.needsUpdate=!0}setDepthBuffer(e,t=p.BasicDepthPacking){this.depthBuffer=e,this.depthPacking=t}setShaderData(e){this.setShaderParts(e.shaderParts),this.setDefines(e.defines),this.setUniforms(e.uniforms),this.setExtensions(e.extensions)}setShaderParts(e){return this.fragmentShader=Ue.replace(u.FRAGMENT_HEAD,e.get(u.FRAGMENT_HEAD)||"").replace(u.FRAGMENT_MAIN_UV,e.get(u.FRAGMENT_MAIN_UV)||"").replace(u.FRAGMENT_MAIN_IMAGE,e.get(u.FRAGMENT_MAIN_IMAGE)||""),this.vertexShader=ke.replace(u.VERTEX_HEAD,e.get(u.VERTEX_HEAD)||"").replace(u.VERTEX_MAIN_SUPPORT,e.get(u.VERTEX_MAIN_SUPPORT)||""),this.needsUpdate=!0,this}setDefines(e){for(let t of e.entries())this.defines[t[0]]=t[1];return this.needsUpdate=!0,this}setUniforms(e){for(let t of e.entries())this.uniforms[t[0]]=t[1];return this}setExtensions(e){this.extensions={};for(let t of e)this.extensions[t]=!0;return this}get encodeOutput(){return this.defines.ENCODE_OUTPUT!==void 0}set encodeOutput(e){this.encodeOutput!==e&&(e?this.defines.ENCODE_OUTPUT="1":delete this.defines.ENCODE_OUTPUT,this.needsUpdate=!0)}isOutputEncodingEnabled(e){return this.encodeOutput}setOutputEncodingEnabled(e){this.encodeOutput=e}get time(){return this.uniforms.time.value}set time(e){this.uniforms.time.value=e}setDeltaTime(e){this.uniforms.time.value+=e}adoptCameraSettings(e){this.copyCameraSettings(e)}copyCameraSettings(e){e&&(this.uniforms.cameraNear.value=e.near,this.uniforms.cameraFar.value=e.far,e instanceof p.PerspectiveCamera?this.defines.PERSPECTIVE_CAMERA="1":delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}setSize(e,t){let s=this.uniforms;s.resolution.value.set(e,t),s.texelSize.value.set(1/e,1/t),s.aspect.value=e/t}static get Section(){return u}};var _=M("three");function ze(c,e,t){for(let s of e){let i="$1"+c+s.charAt(0).toUpperCase()+s.slice(1),n=new RegExp("([^\\.])(\\b"+s+"\\b)","g");for(let r of t.entries())r[1]!==null&&t.set(r[0],r[1].replace(n,i))}}function Lt(c,e,t){let s=e.getFragmentShader(),i=e.getVertexShader(),n=s!==void 0&&/mainImage/.test(s),r=s!==void 0&&/mainUv/.test(s);if(t.attributes|=e.getAttributes(),s===void 0)throw new Error(`Missing fragment shader (${e.name})`);if(r&&t.attributes&w.CONVOLUTION)throw new Error(`Effects that transform UVs are incompatible with convolution effects (${e.name})`);if(!n&&!r)throw new Error(`Could not find mainImage or mainUv function (${e.name})`);{let o=/\w+\s+(\w+)\([\w\s,]*\)\s*{/g,a=t.shaderParts,d=a.get(u.FRAGMENT_HEAD)||"",h=a.get(u.FRAGMENT_MAIN_UV)||"",E=a.get(u.FRAGMENT_MAIN_IMAGE)||"",x=a.get(u.VERTEX_HEAD)||"",B=a.get(u.VERTEX_MAIN_SUPPORT)||"",A=new Set,S=new Set;if(r&&(h+=`	${c}MainUv(UV);
`,t.uvTransformation=!0),i!==null&&/mainSupport/.test(i)){let v=/mainSupport *\([\w\s]*?uv\s*?\)/.test(i);B+=`	${c}MainSupport(`,B+=v?`vUv);
`:`);
`;for(let y of i.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g))for(let Z of y[1].split(/\s*,\s*/))t.varyings.add(Z),A.add(Z),S.add(Z);for(let y of i.matchAll(o))S.add(y[1])}for(let v of s.matchAll(o))S.add(v[1]);for(let v of e.defines.keys())S.add(v.replace(/\([\w\s,]*\)/g,""));for(let v of e.uniforms.keys())S.add(v);S.delete("while"),S.delete("for"),S.delete("if"),e.uniforms.forEach((v,y)=>t.uniforms.set(c+y.charAt(0).toUpperCase()+y.slice(1),v)),e.defines.forEach((v,y)=>t.defines.set(c+y.charAt(0).toUpperCase()+y.slice(1),v));let P=new Map([["fragment",s],["vertex",i]]);ze(c,S,t.defines),ze(c,S,P),s=P.get("fragment"),i=P.get("vertex");let N=e.blendMode;if(t.blendModes.set(N.blendFunction,N),n){e.inputColorSpace!==null&&e.inputColorSpace!==t.colorSpace&&(E+=e.inputColorSpace===_.SRGBColorSpace?`color0 = sRGBTransferOETF(color0);
	`:`color0 = sRGBToLinear(color0);
	`),e.outputColorSpace!==_.NoColorSpace?t.colorSpace=e.outputColorSpace:e.inputColorSpace!==null&&(t.colorSpace=e.inputColorSpace);let v=/MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;E+=`${c}MainImage(color0, UV, `,t.attributes&w.DEPTH&&v.test(s)&&(E+="depth, ",t.readDepth=!0),E+=`color1);
	`;let y=c+"BlendOpacity";t.uniforms.set(y,N.opacity),E+=`color0 = blend${N.blendFunction}(color0, color1, ${y});

	`,d+=`uniform float ${y};

`}if(d+=s+`
`,i!==null&&(x+=i+`
`),a.set(u.FRAGMENT_HEAD,d),a.set(u.FRAGMENT_MAIN_UV,h),a.set(u.FRAGMENT_MAIN_IMAGE,E),a.set(u.VERTEX_HEAD,x),a.set(u.VERTEX_MAIN_SUPPORT,B),e.extensions!==null)for(let v of e.extensions)t.extensions.add(v)}}var Y=class extends T{constructor(e,...t){super("EffectPass"),this.fullscreenMaterial=new W(null,null,null,e),this.listener=s=>this.handleEvent(s),this.effects=[],this.setEffects(t),this.skipRendering=!1,this.minTime=1,this.maxTime=Number.POSITIVE_INFINITY,this.timeScale=1}set mainScene(e){for(let t of this.effects)t.mainScene=e}set mainCamera(e){this.fullscreenMaterial.copyCameraSettings(e);for(let t of this.effects)t.mainCamera=e}get encodeOutput(){return this.fullscreenMaterial.encodeOutput}set encodeOutput(e){this.fullscreenMaterial.encodeOutput=e}get dithering(){return this.fullscreenMaterial.dithering}set dithering(e){let t=this.fullscreenMaterial;t.dithering=e,t.needsUpdate=!0}setEffects(e){for(let t of this.effects)t.removeEventListener("change",this.listener);this.effects=e.sort((t,s)=>s.attributes-t.attributes);for(let t of this.effects)t.addEventListener("change",this.listener)}updateMaterial(){let e=new X,t=0;for(let o of this.effects)if(o.blendMode.blendFunction===l.DST)e.attributes|=o.getAttributes()&w.DEPTH;else{if(e.attributes&o.getAttributes()&w.CONVOLUTION)throw new Error(`Convolution effects cannot be merged (${o.name})`);Lt("e"+t++,o,e)}let s=e.shaderParts.get(u.FRAGMENT_HEAD),i=e.shaderParts.get(u.FRAGMENT_MAIN_IMAGE),n=e.shaderParts.get(u.FRAGMENT_MAIN_UV),r=/\bblend\b/g;for(let o of e.blendModes.values())s+=o.getShaderCode().replace(r,`blend${o.blendFunction}`)+`
`;e.attributes&w.DEPTH?(e.readDepth&&(i=`float depth = readDepth(UV);

	`+i),this.needsDepthTexture=this.getDepthTexture()===null):this.needsDepthTexture=!1,e.colorSpace===_.SRGBColorSpace&&(i+=`color0 = sRGBToLinear(color0);
	`),e.uvTransformation?(n=`vec2 transformedUv = vUv;
`+n,e.defines.set("UV","transformedUv")):e.defines.set("UV","vUv"),e.shaderParts.set(u.FRAGMENT_HEAD,s),e.shaderParts.set(u.FRAGMENT_MAIN_IMAGE,i),e.shaderParts.set(u.FRAGMENT_MAIN_UV,n);for(let[o,a]of e.shaderParts)a!==null&&e.shaderParts.set(o,a.trim().replace(/^#/,`
#`));this.skipRendering=t===0,this.needsSwap=!this.skipRendering,this.fullscreenMaterial.setShaderData(e)}recompile(){this.updateMaterial()}getDepthTexture(){return this.fullscreenMaterial.depthBuffer}setDepthTexture(e,t=_.BasicDepthPacking){this.fullscreenMaterial.depthBuffer=e,this.fullscreenMaterial.depthPacking=t;for(let s of this.effects)s.setDepthTexture(e,t)}render(e,t,s,i,n){for(let r of this.effects)r.update(e,t,i);if(!this.skipRendering||this.renderToScreen){let r=this.fullscreenMaterial;r.inputBuffer=t.texture,r.time+=i*this.timeScale,e.setRenderTarget(this.renderToScreen?null:s),e.render(this.scene,this.camera)}}setSize(e,t){this.fullscreenMaterial.setSize(e,t);for(let s of this.effects)s.setSize(e,t)}initialize(e,t,s){this.renderer=e;for(let i of this.effects)i.initialize(e,t,s);this.updateMaterial(),s!==void 0&&s!==_.UnsignedByteType&&(this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}dispose(){super.dispose();for(let e of this.effects)e.removeEventListener("change",this.listener),e.dispose()}handleEvent(e){switch(e.type){case"change":this.recompile();break}}};var Ke=M("tweakpane"),je=M("spatial-controls");var Pt=Math.PI/180,Gt=180/Math.PI;function Ve(c,e=16/9){return Math.atan(Math.tan(c*Pt*.5)/e)*Gt*2}var F=class{constructor(){this.fps="0",this.timestamp=0,this.acc=0,this.frames=0}update(e){++this.frames,this.acc+=e-this.timestamp,this.timestamp=e,this.acc>=1e3&&(this.fps=this.frames.toFixed(0),this.acc=0,this.frames=0)}};var m=M("three");function Xe(){return new m.Group}function $e(c){let e=new m.Group,t=new m.MeshStandardMaterial({color:12698049,roughness:0,metalness:1,envMap:c}),s=new m.Matrix4,i=new m.Vector3,n=new m.Vector3,r=new m.Quaternion;r.identity();let o=12,a=24,d=a/o,h=10,E=.3,x=new m.BoxGeometry(1,1,1);x.boundingSphere=new m.Sphere,x.boundingBox=new m.Box3,x.boundingBox.min.set(0,-h,0),x.boundingBox.max.set(a,h,a),x.boundingBox.getBoundingSphere(x.boundingSphere);for(let B=-2;B<2;++B)for(let A=-2;A<2;++A){let S=new m.InstancedMesh(x,t,ee(o,2)*2);for(let P=0,N=0;N<o;++N)for(let v=-1;v<1;++v)for(let y=0;y<o;++y)i.set(d,Math.random()*(h-E),d),n.set(N*d,(v+.5)*h,y*d),S.setMatrixAt(P++,s.compose(n,r,i));S.position.set(a*B,0,a*A),S.instanceMatrix.needsUpdate=!0,S.boundingBox=x.boundingBox,S.boundingSphere=x.boundingSphere,S.frustumCulled=!0,e.add(S)}return e}function Qe(c){return new m.Group}function Ot(){let c=new Map,e=new C.LoadingManager,t=new C.CubeTextureLoader(e),s=document.baseURI+"img/textures/skies/sunset/",i=".png",n=[s+"px"+i,s+"nx"+i,s+"py"+i,s+"ny"+i,s+"pz"+i,s+"nz"+i];return new Promise((r,o)=>{e.onLoad=()=>r(c),e.onError=a=>o(new Error(`Failed to load ${a}`)),t.load(n,a=>{a.colorSpace=C.SRGBColorSpace,c.set("sky",a)})})}window.addEventListener("load",()=>Ot().then(c=>{let e=new C.WebGLRenderer({powerPreference:"high-performance",antialias:!1,stencil:!1,depth:!1});e.debug.checkShaderErrors=window.location.hostname==="localhost";let t=document.querySelector(".viewport");t.prepend(e.domElement);let s=new C.PerspectiveCamera,i=new je.SpatialControls(s.position,s.quaternion,e.domElement),n=i.settings;n.rotation.sensitivity=2.2,n.rotation.damping=.05,n.translation.damping=.1,i.position.set(0,0,1),i.lookAt(0,0,0);let r=new C.Scene;r.fog=new C.FogExp2(3617076,.06),r.background=c.get("sky"),r.add(Xe()),r.add($e(r.background)),r.add(Qe(r.background));let o=new V(e,{multisampling:Math.min(4,e.capabilities.maxSamples)}),a=new j({bits:21});o.addPass(new q(r,s)),o.addPass(new Y(s,a));let d=new F,h=new Ke.Pane({container:t.querySelector(".tp")});h.addBinding(d,"fps",{readonly:!0,label:"FPS"});let E=h.addFolder({title:"Settings"});E.addBinding(a,"bitDepth",{min:1,max:32,step:1}),E.addBinding(a.blendMode.opacity,"value",{label:"opacity",min:0,max:1,step:.01}),E.addBinding(a.blendMode,"blendFunction",{options:l});function x(){let B=t.clientWidth,A=t.clientHeight;s.aspect=B/A,s.fov=Ve(90,Math.max(s.aspect,16/9)),s.updateProjectionMatrix(),o.setSize(B,A)}window.addEventListener("resize",x),x(),requestAnimationFrame(function B(A){d.update(A),i.update(A),o.render(),requestAnimationFrame(B)})}));})();
