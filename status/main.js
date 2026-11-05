(()=>{var X="openchamber.sdk",I=1;var n_=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [data-oc-scrolling] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [data-oc-scrolling] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [data-oc-scrolling]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [data-oc-scrolling] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function uT(_){let E=_.documentElement;if(E.hasAttribute("data-oc-scrollbar-activity"))return;E.setAttribute("data-oc-scrollbar-activity","");let U=new WeakMap;_.addEventListener("scroll",(V)=>{let D=V.target===_?E:V.target;if(!(D instanceof Element))return;if(!D.hasAttribute("data-oc-scrolling"))D.setAttribute("data-oc-scrolling","");let F=U.get(D);if(F!==void 0)clearTimeout(F);U.set(D,setTimeout(()=>{U.delete(D),D.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var bS=`(${uT.toString()})(document);`;var a_=128,i_=65536;var $_=128;var L_=65536;var iT=/^[a-z][a-z0-9-]{0,39}$/;var lT=(_)=>Object(_)===_&&!Array.isArray(_),o_=(_,E)=>Object.keys(_).every((U)=>E.includes(U)),nT=(_)=>String(_)===_&&_.length>=1&&_.length<=60,aT=(_)=>String(_)===_&&_.length>=1&&_.length<=80,oT=(_)=>{if(!Array.isArray(_)||_.length>4)return!1;let E=new Set;for(let U of _){if(!lT(U)||!iT.test(U.id)||!nT(U.label))return!1;if(U.disabled!==void 0&&U.disabled!==!0&&U.disabled!==!1)return!1;if(E.has(U.id))return!1;if(E.add(U.id),U.kind==="button"){if(!o_(U,["kind","id","label","disabled"]))return!1;continue}if(U.kind!=="select"||!o_(U,["kind","id","label","value","options","disabled"]))return!1;if(!aT(U.value)||!Array.isArray(U.options)||U.options.length<1||U.options.length>16)return!1;let V=new Set;for(let D of U.options){if(!lT(D)||!o_(D,["value","label"])||!aT(D.value)||!nT(D.label)||V.has(D.value))return!1;V.add(D.value)}if(!V.has(U.value))return!1}return!0};var rT=["{id}","{segment}","{segments+}"];var GE=new Set(rT);var sT=["turn-finished","turn-failed","permission-asked","question-asked"];var XE=new Set(sT);var Y_=20000000,f_=256;var r_=(_)=>("bytes"in _)?_.bytes.byteLength:_.content.length,tT=(_,E)=>{if(_.path!==E.path||_.readOnly!==E.readOnly)return!1;if(_.encoding==="text"||E.encoding==="text")return _.encoding==="text"&&E.encoding==="text"&&_.content===E.content;if(_.bytes.byteLength!==E.bytes.byteLength)return!1;for(let U=0;U<_.bytes.byteLength;U+=1)if(_.bytes[U]!==E.bytes[U])return!1;return!0};var eT=/^[A-Za-z0-9_-]{1,80}$/;var _S=["left","right","top","bottom"];var TS=(_,E=0,U={remaining:16000})=>{if(--U.remaining<0||E>=32)return!1;if(_===null)return!0;let V=Array.isArray(_)?_:Object(_)===_?Object.values(_):[];for(let D of V)if(!TS(D,E+1,U))return!1;return!0},s_=(_)=>{if(_===null||_===!0||_===!1)return!0;if(Array.isArray(_))return Object.keys(_).every((E)=>/^(0|[1-9]\d*)$/.test(E)&&Number(E)<_.length)&&_.every(s_);if(Object(_)===_){let E=Object.getPrototypeOf(_);return(E===null||E===Object.prototype)&&Object.values(_).every(s_)}return String(_)===_||Number.isFinite(_)},t_=(_)=>{try{if(String(_.id)!==_.id||!eT.test(_.id)||!Number.isFinite(_.anchor.x)||Math.abs(_.anchor.x)>1e5||!Number.isFinite(_.anchor.y)||Math.abs(_.anchor.y)>1e5||!Number.isFinite(_.anchor.width)||!Number.isFinite(_.anchor.height)||_.anchor.width<=0||_.anchor.height<=0||_.anchor.width>1e5||_.anchor.height>1e5||!Number.isInteger(_.width)||_.width<160||_.width>640||!Number.isInteger(_.height)||_.height<48||_.height>480||_.side!==void 0&&!_S.includes(_.side)||_.focus!==void 0&&_.focus!==!0&&_.focus!==!1||!TS(_.data)||!s_(_.data))return!1;return JSON.stringify(_.data).length<=16000}catch{return!1}};var ES=["file","directory","other","missing"],_T=(_)=>Boolean(_&&"sessionId"in _),TT=(_)=>Boolean(_&&"sent"in _&&!("sessionId"in _));var OS=/^[0-9a-f]{7,64}$/i,ST=(_)=>OS.test(_),Q_=500,Z_=32000,US=16000,AS=128,MS=200,RS=2000,CS=16000,GS=80,DS=200,XS=16000;var IS=2000;var ET=20000,k_=1024,z_=2000000;var F_=64000,J_=8000,OT=4000;var UT=960000;var VS=999,NS=1e4,C_=500,WS=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],PS=["stopped","starting","ready","failed"],yS=new Set(WS),$S=(_)=>yS.has(_),LS=(_)=>_&&$S(_)?_:"HOST_REJECTED",r=(_)=>{if(_===void 0)return!1;if(_===null||_===!0||_===!1)return!0;if(String(_)===_)return!0;if(Number(_)===_)return Number.isFinite(_);if(Array.isArray(_))return _.every(r);if(Object(_)===_)return Object.values(_).every(r);return!1},YS=(_)=>r(_)&&JSON.stringify(_).length<=XS,SS=(_)=>_?.trim().slice(0,DS)??"",s=(_)=>{let E=_.id.trim().slice(0,AS),U=_.title.trim().slice(0,MS),V=_.url.trim().slice(0,RS),D=_.text?.trim().slice(0,CS),F=_.author?.trim().slice(0,GS),c=_.kind==="pull"?"pull":"issue",x={providerId:_.providerId.trim(),id:E,title:U||E,url:V,kind:c};if(D)x.text=D;if(F)x.author=F;if(c==="pull"){let d=SS(_.branches?.head),p=SS(_.branches?.base);if(d&&p)x.branches={head:d,base:p}}if(YS(_.data))x.data=_.data;return x},AT=(_)=>{let E=s(_);if(_.projectId)E.projectId=_.projectId;if(_.navigation)E.navigation=_.navigation;if(_.worktree)E.worktree=_.worktree;return E},MT=(_)=>{let E={text:_.text.trim().slice(0,US)};if(_.send)E.send=!0;return E},RT=(_)=>{if(_===null||!Number.isFinite(_))return null;return Math.min(VS,Math.max(0,Math.round(_)))},CT=(_)=>{if(!Number.isFinite(_))return 0;return Math.min(NS,Math.max(0,Math.ceil(_)))};var t=(_)=>_.length>0&&_.length<=k_&&!_.includes("\x00")&&!_.includes("\\");var B_=(_)=>{if(!_.startsWith("/")||_.includes("\x00")||_.includes("\\")||_.includes("://"))return!1;if(_.length>IS)return!1;return!_.split("/").some((U)=>U==="."||U==="..")},hS=new Set(PS),GT=(_)=>Boolean(_&&"status"in _&&hS.has(String(_.status))&&!("body"in _)),K_=(_)=>Boolean(_&&"status"in _&&"body"in _&&Number.isInteger(_.status)),DT=(_)=>Boolean(_&&"content"in _&&String(_.content)===_.content),XT=(_)=>Boolean(_&&"written"in _&&_.written===!0),IT=(_)=>Boolean(_&&"entries"in _&&Array.isArray(_.entries)),gS=new Set(ES),VT=(_)=>Boolean(_&&"kind"in _&&"size"in _&&gS.has(String(_.kind))&&Number.isFinite(_.size)),NT=(_)=>Boolean(_&&"text"in _&&String(_.text)===_.text&&!("status"in _)),mS=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),cS=(_)=>Object(_)===_?_:null,e_=(_)=>String(_)===_&&_.length>0,dS=(_)=>{if(!e_(_.id))return null;if(_.ok===!0){let E={channel:X,v:I,type:"result",id:_.id,ok:!0};if(Object(_.payload)===_.payload)E.payload=_.payload;return E}if(_.ok===!1&&e_(_.error))return{channel:X,v:I,type:"result",id:_.id,ok:!1,error:_.error,code:LS(e_(_.code)?_.code:void 0)};return null},WT=(_)=>{let E=cS(_);if(!E||E.channel!==X||E.v!==I)return null;if(E.type==="result")return dS(E);if(!mS.has(String(E.type))||Object(E.payload)!==E.payload)return null;return E};var fS=(_)=>("key"in _)&&("metaKey"in _)&&("ctrlKey"in _),pS=(_)=>(_.metaKey||_.ctrlKey)&&!_.altKey&&!_.shiftKey&&_.key.toLowerCase()==="s";class M extends Error{code;constructor(_,E){super(E);this.name="HostRequestError",this.code=_}}var QS=()=>Promise.reject(new M("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),j_=()=>Promise.reject(new M("BAD_PATH",`File path must be 1 to ${k_} characters without NUL or backslash.`)),w_=(_)=>{if(_===void 0)return;if(Object(_)!==_||Array.isArray(_)||_.scope!==void 0&&_.scope!=="instance"&&_.scope!=="device")throw new M("HOST_REJECTED",'Storage scope must be "instance" or "device".');return _.scope==="device"?"device":void 0},G=(_)=>{return _.value+=1,`oc-${_.value}`},PT=(_={})=>{let E=_.target??("window"in globalThis?window:null);if(!E)throw new M("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let U=_.acceptSource??((T)=>T===E.parent),V=_.requestTimeoutMs??ET,D=new Set,F=new Set,c=new Set,x=new Set,d=new Set,p=new Set,S_=new Set,D_=new Set,X_=new Set,n=new Set,d_=[],E_=null,O_=null,I_=new Set,V_=new Set,U_=null,A_=null,p_=!1,a=new Map,i=new Map,o=new Map,q=!1,C={value:0},R=null,y=null,M_=!1,R_=!1,xT=null,HT=(T)=>{if(!T)return null;return{sessionId:T.id,phase:T.busy?"started":"completed"}},j=(T)=>{E.parent.postMessage(T,"*")},bT=()=>{if(q||E.parent===E||n.size===0||R?.features?.lateGenerateResults!==!0)return;j({channel:X,v:I,type:"generate-late-listen"})},Y=(T,S)=>{for(let O of T)try{O(S)}catch(A){console.error(A)}},qT=(T)=>{if(!(T instanceof MessageEvent))return;if(!U(T.source))return;let S=WT(T.data);if(!S)return;if(S.type==="workspace"){let A=i.get(S.payload.subscriptionId);if(A)Y([A],S.payload.snapshot);return}if(S.type==="shells"){let A=o.get(S.payload.subscriptionId);if(A)Y([A],S.payload.snapshot);return}if(S.type==="ready"){if(R=S.payload,y=HT(S.payload.session),Y(D,S.payload),Y(F,S.payload.directory),Y(c,S.payload.session),y)Y(x,y);Y(d,S.payload.connection),Y(p,S.payload.settings),Y(S_,S.payload.item),bT();return}if(S.type==="generate-late"){if(n.size===0)d_.push(S.payload);else Y(n,S.payload);return}if(S.type==="directory"){if(R)R={...R,directory:S.payload.directory};Y(F,S.payload.directory);return}if(S.type==="session"){if(R)R={...R,session:S.payload.session};if(!S.payload.session)y=null;else if(y?.sessionId!==S.payload.session.id)y=HT(S.payload.session);Y(c,S.payload.session);return}if(S.type==="session-lifecycle"){y=S.payload,Y(x,S.payload);return}if(S.type==="connection"){if(R)R={...R,connection:S.payload.connection};Y(d,S.payload.connection);return}if(S.type==="settings"){if(R)R={...R,settings:S.payload.settings};Y(p,S.payload.settings);return}if(S.type==="item"){if(R)R={...R,item:S.payload.item};Y(S_,S.payload.item);return}if(S.type==="status-control-event"){Y(D_,S.payload);return}if(S.type==="popover-closed"){Y(X_,S.payload);return}if(S.type==="action"){let A=(N)=>{if(!q)j({channel:X,v:I,type:"action-result",id:S.id,payload:N})},W=O_;if(!W){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>W(S.payload)).then(()=>A({ok:!0}),(N)=>{let Z=(N instanceof Error?N.message:String(N)).trim();A({ok:!1,error:(Z||"Action failed.").slice(0,C_)})});return}if(S.type==="file-open"){let A=S.payload;if(A_&&tT(A_,A))return;A_=A,Y(I_,S.payload);return}if(S.type==="file-saved"){Y(V_,S.payload.version);return}if(S.type==="file-snapshot"){let A=(Z)=>{if(!q)j({channel:X,v:I,type:"file-snapshot-result",id:S.id,payload:Z})},W=(Z)=>A({error:(Z.trim()||"Could not read the edited file.").slice(0,C_)}),N=U_;if(!N){W("This extension does not edit files.");return}Promise.resolve().then(()=>N(S.payload.purpose)).then((Z)=>{if(r_(Z)>Y_){W(`The file is over ${Y_} ${"bytes"in Z?"bytes":"characters"}.`);return}if(Z.version.length>f_){W(`The snapshot version is over ${f_} characters.`);return}A({snapshot:"bytes"in Z?{bytes:Z.bytes,version:Z.version}:{content:Z.content,version:Z.version}})},(Z)=>W(Z instanceof Error?Z.message:String(Z)));return}if(S.type==="resolve"){let A=(N)=>{j({channel:X,v:I,type:"resolve-result",id:S.id,payload:N})},W=E_;if(!W){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>W(S.payload)).then((N)=>A({item:N?s(N):null}),(N)=>{let Z=(N instanceof Error?N.message:String(N)).trim();A({error:(Z||"Command failed.").slice(0,C_)})});return}let O=a.get(S.id);if(!O)return;if(clearTimeout(O.timer),a.delete(S.id),S.ok){O.resolve(S.payload);return}O.reject(new M(S.code,S.error))};E.addEventListener("message",qT),j({channel:X,v:I,type:"hello"});let k=(T,S=V)=>{if(q||E.parent===E)return Promise.reject(new M("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((O,A)=>{let W=setTimeout(()=>{a.delete(T.id),A(new M("HOST_TIMEOUT","Host did not answer in time."))},S);a.set(T.id,{resolve:O,reject:A,timer:W}),j(T)})},f=(T)=>k(T).then(()=>{return}),Q={channel:X,v:I},v_=(T)=>{if(!q&&E.parent!==E)j(T)},yT=()=>v_({...Q,type:"file-save"}),hT=(T)=>{if(!fS(T)||!pS(T))return;T.preventDefault(),yT()},gT=(T)=>{if(!fS(T)||T.key!=="Escape"||R?.surface!=="popover"||!R.popover)return;T.preventDefault(),pT(R.popover.id,"escape").catch(()=>{return})},N_=()=>{let T=R?.surface==="popover"?R.popover:void 0;if(!T)return;let S=M_||R_;if(xT===S)return;xT=S,vT(T.id,S).catch(()=>{return})},W_=()=>{if(R?.surface!=="popover"||M_)return;M_=!0,N_()},mT=(T)=>{if(R?.surface!=="popover"||T.relatedTarget!==null||!M_)return;M_=!1,N_()},cT=()=>{if(R?.surface!=="popover"||R_)return;R_=!0,N_()},dT=()=>{if(R?.surface!=="popover"||!R_)return;R_=!1,N_()},H=(T,S=1024)=>{if(!T.trim()||T.length>S)throw new M("HOST_REJECTED",`Identity must contain 1 to ${S} characters.`)},u_=async(T)=>{if(T.kind!=="projects")H(T.projectId);let S=await k({...Q,type:"workspace-read",id:G(C),payload:T});if(!S||!("kind"in S)||!("state"in S)||S.kind!==T.kind)throw new M("HOST_REJECTED","Host did not return workspace data.");return S},l_=async(T,S)=>{if(T.kind!=="projects")H(T.projectId);let O=G(C);i.set(O,S);try{await f({...Q,type:"workspace-subscribe",id:G(C),payload:{subscriptionId:O,query:T}})}catch(A){if(i.delete(O),!q)j({...Q,type:"workspace-unsubscribe",id:G(C),payload:{subscriptionId:O}});throw A}return()=>{if(!i.delete(O)||q)return;j({...Q,type:"workspace-unsubscribe",id:G(C),payload:{subscriptionId:O}})}},HS=async(T,S)=>{if(T.kind==="session")H(T.sessionId);if(T.kind==="project")H(T.projectId);let O=G(C);o.set(O,S);try{await f({...Q,type:"shells-subscribe",id:G(C),payload:{subscriptionId:O,scope:T}})}catch(A){if(o.delete(O),!q)j({...Q,type:"shells-unsubscribe",id:G(C),payload:{subscriptionId:O}});throw A}return()=>{if(!o.delete(O)||q)return;j({...Q,type:"shells-unsubscribe",id:G(C),payload:{subscriptionId:O}})}},P_=async(T)=>{if("key"in T&&(T.key.length===0||T.key.length>a_))throw new M("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(T.op==="set"&&!r(T.value))throw new M("HOST_REJECTED","Storage values must be JSON.");if(T.op==="set"&&new TextEncoder().encode(JSON.stringify(T.value)).length>i_)throw new M("HOST_REJECTED","Storage value exceeds 64 KiB.");if(T.scope==="device"&&R?.features?.deviceStorage!==!0)throw new M("UNSUPPORTED","This host does not support device storage.");let S=await k({...Q,type:"storage",id:G(C),payload:T});if(!S||!("storage"in S)||S.op!==T.op)throw new M("HOST_REJECTED","Host did not return storage data.");return S},pT=(T,S)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===T)?Promise.reject(new M("UNSUPPORTED","This host does not support popovers.")):f({...Q,type:"popover-close",id:G(C),payload:S?{id:T,reason:S}:{id:T}}),vT=(T,S)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===T)?Promise.reject(new M("UNSUPPORTED","This host does not support popovers.")):f({...Q,type:"popover-anchor",id:G(C),payload:{id:T,active:S}});return E.addEventListener("keydown",gT,!0),E.addEventListener("pointerover",W_),E.addEventListener("pointermove",W_),E.addEventListener("pointerout",mT),E.addEventListener("focus",cT),E.addEventListener("blur",dT),{onAction:(T)=>{return O_=T,()=>{if(O_===T)O_=null}},listProjects:async()=>{let T=await u_({kind:"projects"});if(T.kind!=="projects")throw new M("HOST_REJECTED","Expected projects.");return T},listWorktrees:async(T)=>{let S=await u_({kind:"worktrees",projectId:T});if(S.kind!=="worktrees")throw new M("HOST_REJECTED","Expected worktrees.");return S},listSessions:async(T)=>{let S=await u_({kind:"sessions",projectId:T});if(S.kind!=="sessions")throw new M("HOST_REJECTED","Expected sessions.");return S},onProjects:(T)=>l_({kind:"projects"},(S)=>{if(S.kind==="projects")T(S)}),onWorktrees:(T,S)=>l_({kind:"worktrees",projectId:T},(O)=>{if(O.kind==="worktrees")S(O)}),onSessions:(T,S)=>l_({kind:"sessions",projectId:T},(O)=>{if(O.kind==="sessions")S(O)}),onRunningShells:(T,S)=>HS(T,S),readShellOutput:async(T,S)=>{H(T,$_);let O=S?.cursor;if(O!==void 0&&(!Number.isInteger(O)||O<0))throw new M("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=S?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>L_))throw new M("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${L_}.`);let N=await k({...Q,type:"shell-output",id:G(C),payload:{shellId:T,cursor:O,tailBytes:A}});if(!N||typeof N.output!=="string"||!Number.isFinite(N.cursor))throw new M("HOST_REJECTED","Host did not return shell output.");return N},stopShell:async(T)=>{if(H(T,$_),(await k({...Q,type:"shell-stop",id:G(C),payload:{shellId:T}}))?.stopped!==!0)throw new M("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(T)=>{H(T),await f({...Q,type:"open-session",id:G(C),payload:{sessionId:T}})},storage:{get:async(T,S)=>{let O=w_(S),A={op:"get",key:T};if(O)A.scope=O;let W=await P_(A);return W.op==="get"&&W.found?W.value:void 0},set:async(T,S,O)=>{let A=w_(O),W={op:"set",key:T,value:S};if(A)W.scope=A;await P_(W)},delete:async(T,S)=>{let O=w_(S),A={op:"delete",key:T};if(O)A.scope=O;await P_(A)},keys:async(T)=>{let S=w_(T),O={op:"keys"};if(S)O.scope=S;let A=await P_(O);if(A.op!=="keys")throw new M("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:(T)=>{if(D.add(T),R)T(R);return()=>{D.delete(T)}},onDirectory:(T)=>{if(F.add(T),R)T(R.directory);return()=>{F.delete(T)}},onSession:(T)=>{if(c.add(T),R)T(R.session);return()=>{c.delete(T)}},onSessionLifecycle:(T)=>{if(x.add(T),y)T(y);return()=>{x.delete(T)}},onConnection:(T)=>{if(d.add(T),R)T(R.connection);return()=>{d.delete(T)}},onSettings:(T)=>{if(p.add(T),R)T(R.settings);return()=>{p.delete(T)}},onItem:(T)=>{if(S_.add(T),R)T(R.item);return()=>{S_.delete(T)}},onStatusControl:(T)=>{return D_.add(T),()=>{D_.delete(T)}},onPopoverClosed:(T)=>{return X_.add(T),()=>{X_.delete(T)}},setStatusControls:(T)=>{if(R?.features?.statusControls!==!0)return Promise.reject(new M("UNSUPPORTED","This host does not support status controls."));if(!oT(T))return Promise.reject(new M("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return f({...Q,type:"status-controls",id:G(C),payload:{controls:T}})},openPopover:(T)=>{if(R?.features?.popovers!==!0)return Promise.reject(new M("UNSUPPORTED","This host does not support popovers."));if(!t_(T))return Promise.reject(new M("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return f({...Q,type:"popover-open",id:G(C),payload:T})},closePopover:pT,setPopoverAnchorActive:vT,onResolve:(T)=>{return E_=T,()=>{if(E_===T)E_=null}},toast:(T)=>{let S=T.message.trim();if(!S||S.length>Q_)return Promise.reject(new M("HOST_REJECTED",`Toast message must contain 1 to ${Q_} characters.`));if(T.copy&&T.copy!==!0&&(!T.copy.text.length||T.copy.text.length>Z_))return Promise.reject(new M("HOST_REJECTED",`Toast copy text must contain 1 to ${Z_} characters.`));return f({channel:X,v:I,type:"toast",id:G(C),payload:{...T,message:S}})},openUrl:(T)=>f({channel:X,v:I,type:"open-url",id:G(C),payload:{url:T}}),openCommit:(T)=>ST(T)?f({channel:X,v:I,type:"open-commit",id:G(C),payload:{sha:T}}):Promise.reject(new M("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:(T)=>f({channel:X,v:I,type:"open-surface",id:G(C),payload:{surfaceId:T}}),writeClipboard:(T)=>f({channel:X,v:I,type:"clipboard-write",id:G(C),payload:{text:T}}),compose:(T)=>f({channel:X,v:I,type:"compose",id:G(C),payload:T}),attach:(T)=>f({channel:X,v:I,type:"attach",id:G(C),payload:s(T)}),startSession:async(T)=>{if(T.projectId!==void 0)H(T.projectId);let S=T.worktree;if(S&&S!==!0)if(S.kind==="existing")H(S.directory);else{if(S.name!==void 0)H(S.name,200);if(S.baseBranch!==void 0)H(S.baseBranch,200)}let O=await k({channel:X,v:I,type:"start-session",id:G(C),payload:AT(T)},_.requestTimeoutMs??180000);if(!_T(O))throw new M("HOST_REJECTED","Host did not return a session.");return O},prompt:(T)=>k({channel:X,v:I,type:"prompt",id:G(C),payload:MT(T)}).then((S)=>{if(!TT(S))throw new M("HOST_REJECTED","Host did not return a prompt result.");return S}),sessionLink:(T)=>f({channel:X,v:I,type:"session-link",id:G(C),payload:s(T)}),close:()=>f({channel:X,v:I,type:"close",id:G(C)}),oauthStart:()=>f({channel:X,v:I,type:"oauth-start",id:G(C)}),oauthDisconnect:()=>f({channel:X,v:I,type:"oauth-disconnect",id:G(C)}),request:(T)=>(B_(T.path)?k({channel:X,v:I,type:"request",id:G(C),payload:T}):QS()).then((S)=>{if(!K_(S))throw new M("HOST_REJECTED","Host request result was empty.");return S}),serviceRequest:(T)=>(B_(T.path)?k({channel:X,v:I,type:"service-request",id:G(C),payload:T}):QS()).then((S)=>{if(!K_(S))throw new M("HOST_REJECTED","Host service request result was empty.");return S}),serviceStatus:()=>k({channel:X,v:I,type:"service-status",id:G(C)}).then((T)=>{if(!GT(T))throw new M("HOST_REJECTED","Host did not return service status.");return T}),readFile:(T)=>(t(T)?k({channel:X,v:I,type:"file-read",id:G(C),payload:{path:T}}):j_()).then((S)=>{if(!DT(S))throw new M("HOST_REJECTED","Host did not return file content.");return S}),writeFile:(T,S)=>{if(!t(T))return j_();if(S.length>z_)return Promise.reject(new M("FILE_TOO_LARGE",`Content is over ${z_} characters.`));return k({channel:X,v:I,type:"file-write",id:G(C),payload:{path:T,content:S}}).then((O)=>{if(!XT(O))throw new M("HOST_REJECTED","Host did not confirm the write.");return O})},listDir:(T)=>(t(T)?k({channel:X,v:I,type:"file-list",id:G(C),payload:{path:T}}):j_()).then((S)=>{if(!IT(S))throw new M("HOST_REJECTED","Host did not return directory entries.");return S}),stat:(T)=>(t(T)?k({channel:X,v:I,type:"file-stat",id:G(C),payload:{path:T}}):j_()).then((S)=>{if(!VT(S))throw new M("HOST_REJECTED","Host did not return file status.");return S}),generate:(T)=>{let S=T.prompt.trim(),O=T.system?.trim();if(S.length===0||S.length>F_)return Promise.reject(new M("HOST_REJECTED",`Prompt must be 1 to ${F_} characters.`));if(O!==void 0&&(O.length===0||O.length>J_))return Promise.reject(new M("HOST_REJECTED",`System prompt must be 1 to ${J_} characters.`));let A=T.maxOutputTokens===void 0?void 0:Math.min(OT,Math.max(1,Math.floor(T.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new M("HOST_REJECTED","maxOutputTokens must be a number."));let W={prompt:S};if(O!==void 0)W.system=O;if(A!==void 0)W.maxOutputTokens=A;return k({channel:X,v:I,type:"generate",id:G(C),payload:W},_.requestTimeoutMs??UT).then((N)=>{if(!NT(N))throw new M("HOST_REJECTED","Host did not return generated text.");return N})},onLateGenerateResult:(T)=>{n.add(T);for(let S of d_.splice(0))Y([T],S);return bT(),()=>{n.delete(T)}},setBadge:(T)=>f({channel:X,v:I,type:"badge",id:G(C),payload:{count:RT(T)}}),setHeight:(T)=>f({channel:X,v:I,type:"resize",id:G(C),payload:{height:CT(T)}}),onFileOpen:(T)=>{if(I_.add(T),!p_)p_=!0,E.addEventListener("keydown",hT,!0);if(A_)T(A_);return()=>{I_.delete(T)}},onFileSnapshot:(T)=>{return U_=T,()=>{if(U_===T)U_=null}},onFileSaved:(T)=>{return V_.add(T),()=>{V_.delete(T)}},reportFileChange:(T)=>v_({...Q,type:"file-change",payload:{dirty:T.dirty,edited:T.edited}}),requestFileSave:yT,reportFileUnsupported:()=>v_({...Q,type:"file-unsupported"}),dispose:()=>{for(let T of i.keys())j({...Q,type:"workspace-unsubscribe",id:G(C),payload:{subscriptionId:T}});i.clear();for(let T of o.keys())j({...Q,type:"shells-unsubscribe",id:G(C),payload:{subscriptionId:T}});if(o.clear(),q=!0,E_=null,O_=null,U_=null,I_.clear(),V_.clear(),p_)E.removeEventListener("keydown",hT,!0);E.removeEventListener("message",qT),E.removeEventListener("keydown",gT,!0),E.removeEventListener("pointerover",W_),E.removeEventListener("pointermove",W_),E.removeEventListener("pointerout",mT),E.removeEventListener("focus",cT),E.removeEventListener("blur",dT);for(let T of a.values())clearTimeout(T.timer),T.reject(new M("HOST_UNAVAILABLE","Host client was disposed."));a.clear(),D.clear(),F.clear(),c.clear(),x.clear(),d.clear(),p.clear(),S_.clear(),D_.clear(),X_.clear(),n.clear(),d_.length=0}}};var ZS=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var FE=new Set(ZS);var kS=["none","agent","user"];var BE=new Set(kS);var vS=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],uS=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],zS=(_,E)=>{E.style.colorScheme=_.mode;for(let[U,V]of vS)E.style.setProperty(U,_.tokens[V]);for(let[U,V,D]of uS){let F=_.tokens[D]??"";E.style.setProperty(U,F),E.style.setProperty(V,F)}E.style.setProperty("font-family",_.tokens.font),E.style.setProperty("font-size","0.875rem"),E.style.setProperty("line-height","1.45"),E.style.setProperty("color",_.tokens.foreground)},$T=(_,E)=>{if(zS(_.theme,E),E.dataset)E.dataset.ocSurface=_.surface,E.dataset.ocTheme=_.theme.mode};var lS={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},P=(_,E)=>`var(--${_}, var(--oc-${lS[_]}, ${E}))`,g=P("surface-background","transparent"),H_=P("surface-elevated","transparent"),e=P("surface-elevated-foreground","inherit"),w=P("surface-foreground","inherit"),$=P("surface-muted-foreground","gray"),nS=P("surface-muted","transparent"),u=P("interactive-border","currentColor"),J=P("interactive-hover","transparent"),l=P("interactive-active","transparent"),LT=P("interactive-selection","transparent"),YT=P("interactive-selection-foreground","inherit"),h=P("primary","currentColor"),fT=P("primary-text","inherit"),QT=P("error-text","inherit"),aS=P("font-sans","inherit"),ZT=P("font-mono","monospace"),KS=P("radius","9px"),kT=`calc(${KS} - 2px)`,FS=`calc(${KS} - 4px)`,L=(_,E,U="transparent")=>`color-mix(in srgb, ${_} ${E}%, ${U})`,JS=`background-image: linear-gradient(${J}, ${J});`,zT=(_,E="0.5px")=>`box-shadow: inset 0 0 0 ${E} ${_}, var(--oc-sdk-field-lift);`,FT="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",BS="box-shadow: var(--oc-sdk-lit);",JT=`inset 0 0.5px 0 0 ${L(w,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,iS=`
:root {
  --oc-sdk-edge: ${L(w,16)};
  --oc-sdk-field-bg: ${H_};
  --oc-sdk-raised-bg: ${g};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${L(w,14)};
  --oc-sdk-field-bg: ${L(g,50,H_)};
  --oc-sdk-raised-bg: ${H_};
  --oc-sdk-field-lift: ${JT};
  --oc-sdk-raised-lift: ${JT};
  --oc-sdk-lit: ${JT};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,x_=(_)=>{let E=P(`status-${_}`,"currentColor");return`
.oc-sdk[data-tone="${_}"], .oc-sdk [data-tone="${_}"] { --oc-sdk-tone: ${E}; --oc-sdk-tone-text: ${P(`${_}-text`,"inherit")}; }`},oS=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: 2px; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`,jS=`${iS}
.oc-sdk { color: ${w}; font-family: ${aS}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${JS} }
.oc-sdk-mono { font-family: ${ZT}; }
.oc-sdk-muted { color: ${$}; }
${x_("success")}${x_("warning")}${x_("error")}${x_("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${h}; --oc-sdk-tone-text: ${fT}; }

.oc-sdk-btn { border-radius: ${kT}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${FS}; }
.oc-sdk-btn[data-variant="default"] { color: ${fT}; background: ${L(h,10,g)}; border-color: ${L(h,12)}; ${BS} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${L(h,16,g)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${L(h,22,g)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${nS}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${l}, ${l}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${e}; ${FT} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${l}, ${l}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${J}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${l}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${P("status-error","red")}; color: ${QT}; background: ${L("var(--oc-sdk-tone)",7,g)}; border-color: ${L("var(--oc-sdk-tone)",12)}; ${BS} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${L("var(--oc-sdk-tone)",9,g)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${L("var(--oc-sdk-tone)",11,g)}; box-shadow: none; }

.oc-sdk-field-note { color: ${$}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${QT}; }
.oc-sdk-input { border-radius: ${kT}; background: var(--oc-sdk-field-bg); color: ${e}; ${zT("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${$}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${zT(L(w,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${zT(P("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${ZT}; }

.oc-sdk-search-icon { color: ${$}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${h}; }
.oc-sdk-search-clear { border-radius: ${FS}; color: ${$}; }
.oc-sdk-search-clear:hover { background: ${J}; color: ${w}; }

.oc-sdk-trigger { border-radius: ${kT}; background: var(--oc-sdk-raised-bg); color: ${e}; ${FT} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${l}, ${l}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${$}; }
.oc-sdk-trigger-chevron { color: ${$}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${e}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${H_}; background-clip: padding-box; color: ${e}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${J}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${LT}; color: ${YT}; }
.oc-sdk-option-check { color: ${w}; }
.oc-sdk-option[data-destructive="true"] { color: ${QT}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${L(P("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${$}; }
.oc-sdk-popup-empty { color: ${$}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${u}; border-radius: 4px; color: ${w}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${L(w,60,u)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${u}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${g}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${h}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${JS} }
.oc-sdk-check-desc { color: ${$}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${L(w,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${$}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${w}; }
.oc-sdk-tab[aria-selected="true"] { color: ${YT}; background: ${LT}; border-color: ${u}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${e}; background: var(--oc-sdk-raised-bg); ${FT} }
.oc-sdk-tab-count { color: ${$}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${L(w,6)}; color: ${$}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${L("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${J}; }
.oc-sdk-row[aria-selected="true"] { background: ${LT}; color: ${YT}; }
.oc-sdk-row-lead { font-family: ${ZT}; color: ${$}; }
.oc-sdk-row-sub { color: ${$}; }
.oc-sdk-row-meta { color: ${$}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${$}; }

.oc-sdk-empty-body { color: ${$}; }

.oc-sdk-spinner { color: ${$}; }
.oc-sdk-spinner-ring { border-color: ${u}; border-top-color: ${h}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${L("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${$}; }

.oc-sdk-separator { color: ${$}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${L(u,40)}; }

.oc-sdk-progress-label { color: ${$}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${L(w,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${h}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${P("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${P("success-text","inherit")}; }

.oc-sdk-text a { color: ${fT}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${L(u,60)}; }
`,z=`
${n_}
${oS}
${jS}`;var b=PT(),c_=document.querySelector("#root");if(!c_)throw Error("Missing #root");c_.innerHTML=`<style>
body{margin:0;font:12px/1.5 system-ui,sans-serif}
#root{padding:2px 4px;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.m{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;justify-content:space-between;align-items:center;gap:8px}
.m .l{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m .r{flex:none;font-size:11px;opacity:.65;font-weight:400}
.m b{font-size:13px}
.row{display:flex;gap:4px;align-items:center}
#t{font-size:10.5px;opacity:.65;white-space:nowrap}
button{flex:1;padding:1px 4px;font-size:11.5px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:6px;background:var(--oc-elevated,inherit);color:var(--oc-fg,inherit);cursor:pointer;white-space:nowrap}
button.on{border-color:var(--primary,#3574f0);color:var(--primary,#3574f0);font-weight:700}
</style><div class="m" id="m">禅道: …</div><div class="row"><button id="btn-r" title="手动刷新">↻ 刷新</button><button id="btn-a" title="定时刷新开关（60秒）">⏱ 关</button></div>`;var v=document.querySelector("#m"),T_=document.querySelector("#btn-r"),KT=document.querySelector("#btn-a");c_.onclick=(_)=>{if(_.target.tagName==="BUTTON")return;b.openSurface("plugin:zentao-bugs").catch(()=>{return})};var jT=!1,g_=null,wS=(_)=>{if(_===null){v.style.cssText="",v.textContent="禅道: 待登录（面板⚙连接）",b.setBadge(null).catch(()=>{return});return}v.style.cssText=_>0?"background:#7f1d1d55;border:1px solid #f8717166;border-radius:8px;padding:0 6px;":"",v.innerHTML="";let E=document.createElement("span");E.className="l";let U=document.createElement("span");U.textContent="禅道: \uD83D\uDC1E ",E.appendChild(U);let V=document.createElement("b");if(V.textContent=String(_),_>0){V.style.color="#f87171";let D=document.createElement("span");D.textContent=" 待办",D.style.cssText="background:#7f1d1d55;border:1px solid #f87171;border-radius:8px;padding:0 6px;font-weight:700;color:#f87171",E.append(U,V,document.createTextNode(" "),D)}else E.append(U,V);if(v.appendChild(E),m_){let D=document.createElement("span");D.className="r",D.textContent=m_,D.title="最后刷新时间",v.appendChild(D)}b.setBadge(_>0?_:null).catch(()=>{return})},m_="",_E=()=>{let _=new Date,E=(U)=>String(U).padStart(2,"0");return`${E(_.getHours())}:${E(_.getMinutes())}:${E(_.getSeconds())}`},wT=async()=>{if(document.hidden)return;T_.disabled=!0,T_.textContent="↻…";try{let _=await b.serviceRequest({method:"GET",path:"/count?days=7"}),E=JSON.parse(_.body);if(!E.ok&&E.error==="need-config")try{let V=await b.storage.get("ztb-cfg",{scope:"device"});if(V?.base&&V?.account&&V?.password)await b.serviceRequest({method:"POST",path:"/login",body:JSON.stringify({baseUrl:V.base,account:V.account,password:V.password})}),_=await b.serviceRequest({method:"GET",path:"/count?days=7"}),E=JSON.parse(_.body)}catch{}if(!E.ok){if(E.error==="need-config")wS(null);else v.textContent="禅道: 不可用";return}m_=_E(),wS(E.total),T_.title=`手动刷新（上次 ${m_}）`;let U=Math.ceil(c_.getBoundingClientRect().height);b.setHeight(U).catch(()=>{return})}catch{v.textContent="禅道: 未启用本地服务"}finally{T_.disabled=!1,T_.textContent="↻ 刷新"}},xS=(_)=>{if(jT=_,KT.textContent=_?"⏱ 开":"⏱ 关",KT.classList.toggle("on",_),g_)clearInterval(g_),g_=null;if(_)g_=setInterval(()=>void wT(),60000)};T_.onclick=(_)=>{_.stopPropagation(),wT()};KT.onclick=(_)=>{_.stopPropagation(),xS(!jT);try{b.storage.set("ztb-autoref",jT?"1":"",{scope:"device"})}catch{}};b.onReady((_)=>{$T(_,document.documentElement),(async()=>{try{if(await b.storage.get("ztb-autoref",{scope:"device"})==="1")xS(!0)}catch{}})(),wT()});})();
