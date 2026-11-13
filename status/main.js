(()=>{var D="openchamber.sdk",X=1;var i_=`
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
`;function nT(_){let E=_.documentElement;if(E.hasAttribute("data-oc-scrollbar-activity"))return;E.setAttribute("data-oc-scrollbar-activity","");let U=new WeakMap;_.addEventListener("scroll",(k)=>{let I=k.target===_?E:k.target;if(!(I instanceof Element))return;if(!I.hasAttribute("data-oc-scrolling"))I.setAttribute("data-oc-scrolling","");let J=U.get(I);if(J!==void 0)clearTimeout(J);U.set(I,setTimeout(()=>{U.delete(I),I.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var mS=`(${nT.toString()})(document);`;var o_=128,r_=65536;var L_=128;var Y_=65536;var sT=/^[a-z][a-z0-9-]{0,39}$/;var iT=(_)=>Object(_)===_&&!Array.isArray(_),s_=(_,E)=>Object.keys(_).every((U)=>E.includes(U)),oT=(_)=>String(_)===_&&_.length>=1&&_.length<=60,rT=(_)=>String(_)===_&&_.length>=1&&_.length<=80,tT=(_)=>{if(!Array.isArray(_)||_.length>4)return!1;let E=new Set;for(let U of _){if(!iT(U)||!sT.test(U.id)||!oT(U.label))return!1;if(U.disabled!==void 0&&U.disabled!==!0&&U.disabled!==!1)return!1;if(E.has(U.id))return!1;if(E.add(U.id),U.kind==="button"){if(!s_(U,["kind","id","label","disabled"]))return!1;continue}if(U.kind!=="select"||!s_(U,["kind","id","label","value","options","disabled"]))return!1;if(!rT(U.value)||!Array.isArray(U.options)||U.options.length<1||U.options.length>16)return!1;let k=new Set;for(let I of U.options){if(!iT(I)||!s_(I,["value","label"])||!rT(I.value)||!oT(I.label)||k.has(I.value))return!1;k.add(I.value)}if(!k.has(U.value))return!1}return!0};var eT=["{id}","{segment}","{segments+}"];var PE=new Set(eT);var _S=["turn-finished","turn-failed","permission-asked","question-asked"];var fE=new Set(_S);var Q_=20000000,k_=256;var t_=(_)=>("bytes"in _)?_.bytes.byteLength:_.content.length,TS=(_,E)=>{if(_.path!==E.path||_.readOnly!==E.readOnly)return!1;if(_.encoding==="text"||E.encoding==="text")return _.encoding==="text"&&E.encoding==="text"&&_.content===E.content;if(_.bytes.byteLength!==E.bytes.byteLength)return!1;for(let U=0;U<_.bytes.byteLength;U+=1)if(_.bytes[U]!==E.bytes[U])return!1;return!0};var SS=/^[A-Za-z0-9_-]{1,80}$/;var ES=["left","right","top","bottom"];var OS=(_,E=0,U={remaining:16000})=>{if(--U.remaining<0||E>=32)return!1;if(_===null)return!0;let k=Array.isArray(_)?_:Object(_)===_?Object.values(_):[];for(let I of k)if(!OS(I,E+1,U))return!1;return!0},e_=(_)=>{if(_===null||_===!0||_===!1)return!0;if(Array.isArray(_))return Object.keys(_).every((E)=>/^(0|[1-9]\d*)$/.test(E)&&Number(E)<_.length)&&_.every(e_);if(Object(_)===_){let E=Object.getPrototypeOf(_);return(E===null||E===Object.prototype)&&Object.values(_).every(e_)}return String(_)===_||Number.isFinite(_)},_T=(_)=>{try{if(String(_.id)!==_.id||!SS.test(_.id)||!Number.isFinite(_.anchor.x)||Math.abs(_.anchor.x)>1e5||!Number.isFinite(_.anchor.y)||Math.abs(_.anchor.y)>1e5||!Number.isFinite(_.anchor.width)||!Number.isFinite(_.anchor.height)||_.anchor.width<=0||_.anchor.height<=0||_.anchor.width>1e5||_.anchor.height>1e5||!Number.isInteger(_.width)||_.width<160||_.width>640||!Number.isInteger(_.height)||_.height<48||_.height>480||_.side!==void 0&&!ES.includes(_.side)||_.focus!==void 0&&_.focus!==!0&&_.focus!==!1||!OS(_.data)||!e_(_.data))return!1;return JSON.stringify(_.data).length<=16000}catch{return!1}};var AS=["file","directory","other","missing"],ST=(_)=>Boolean(_&&"sessionId"in _),ET=(_)=>Boolean(_&&"sent"in _&&!("sessionId"in _));var MS=/^[0-9a-f]{7,64}$/i,OT=(_)=>MS.test(_),Z_=500,z_=32000,RS=16000,CS=128,GS=200,DS=2000,XS=16000,IS=80,VS=200,NS=16000;var WS=2000;var UT=20000,F_=1024,J_=2000000;var B_=64000,K_=8000,AT=4000;var MT=960000;var PS=999,$S=1e4,D_=500,fS=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],LS=["stopped","starting","ready","failed"],dS=new Set(fS),YS=(_)=>dS.has(_),QS=(_)=>_&&YS(_)?_:"HOST_REJECTED",r=(_)=>{if(_===void 0)return!1;if(_===null||_===!0||_===!1)return!0;if(String(_)===_)return!0;if(Number(_)===_)return Number.isFinite(_);if(Array.isArray(_))return _.every(r);if(Object(_)===_)return Object.values(_).every(r);return!1},kS=(_)=>r(_)&&JSON.stringify(_).length<=NS,US=(_)=>_?.trim().slice(0,VS)??"",s=(_)=>{let E=_.id.trim().slice(0,CS),U=_.title.trim().slice(0,GS),k=_.url.trim().slice(0,DS),I=_.text?.trim().slice(0,XS),J=_.author?.trim().slice(0,IS),c=_.kind==="pull"?"pull":"issue",H={providerId:_.providerId.trim(),id:E,title:U||E,url:k,kind:c};if(I)H.text=I;if(J)H.author=J;if(c==="pull"){let d=US(_.branches?.head),p=US(_.branches?.base);if(d&&p)H.branches={head:d,base:p}}if(kS(_.data))H.data=_.data;return H},RT=(_)=>{let E=s(_);if(_.projectId)E.projectId=_.projectId;if(_.navigation)E.navigation=_.navigation;if(_.worktree)E.worktree=_.worktree;return E},CT=(_)=>{let E={text:_.text.trim().slice(0,RS)};if(_.send)E.send=!0;return E},GT=(_)=>{if(_===null||!Number.isFinite(_))return null;return Math.min(PS,Math.max(0,Math.round(_)))},DT=(_)=>{if(!Number.isFinite(_))return 0;return Math.min($S,Math.max(0,Math.ceil(_)))};var t=(_)=>_.length>0&&_.length<=F_&&!_.includes("\x00")&&!_.includes("\\");var j_=(_)=>{if(!_.startsWith("/")||_.includes("\x00")||_.includes("\\")||_.includes("://"))return!1;if(_.length>WS)return!1;return!_.split("/").some((U)=>U==="."||U==="..")},pS=new Set(LS),XT=(_)=>Boolean(_&&"status"in _&&pS.has(String(_.status))&&!("body"in _)),w_=(_)=>Boolean(_&&"status"in _&&"body"in _&&Number.isInteger(_.status)),IT=(_)=>Boolean(_&&"content"in _&&String(_.content)===_.content),VT=(_)=>Boolean(_&&"written"in _&&_.written===!0),NT=(_)=>Boolean(_&&"entries"in _&&Array.isArray(_.entries)),vS=new Set(AS),WT=(_)=>Boolean(_&&"kind"in _&&"size"in _&&vS.has(String(_.kind))&&Number.isFinite(_.size)),PT=(_)=>Boolean(_&&"text"in _&&String(_.text)===_.text&&!("status"in _)),uS=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),lS=(_)=>Object(_)===_?_:null,TT=(_)=>String(_)===_&&_.length>0,aS=(_)=>{if(!TT(_.id))return null;if(_.ok===!0){let E={channel:D,v:X,type:"result",id:_.id,ok:!0};if(Object(_.payload)===_.payload)E.payload=_.payload;return E}if(_.ok===!1&&TT(_.error))return{channel:D,v:X,type:"result",id:_.id,ok:!1,error:_.error,code:QS(TT(_.code)?_.code:void 0)};return null},$T=(_)=>{let E=lS(_);if(!E||E.channel!==D||E.v!==X)return null;if(E.type==="result")return aS(E);if(!uS.has(String(E.type))||Object(E.payload)!==E.payload)return null;return E};var ZS=(_)=>("key"in _)&&("metaKey"in _)&&("ctrlKey"in _),nS=(_)=>(_.metaKey||_.ctrlKey)&&!_.altKey&&!_.shiftKey&&_.key.toLowerCase()==="s";class M extends Error{code;constructor(_,E){super(E);this.name="HostRequestError",this.code=_}}var zS=()=>Promise.reject(new M("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),x_=()=>Promise.reject(new M("BAD_PATH",`File path must be 1 to ${F_} characters without NUL or backslash.`)),H_=(_)=>{if(_===void 0)return;if(Object(_)!==_||Array.isArray(_)||_.scope!==void 0&&_.scope!=="instance"&&_.scope!=="device")throw new M("HOST_REJECTED",'Storage scope must be "instance" or "device".');return _.scope==="device"?"device":void 0},G=(_)=>{return _.value+=1,`oc-${_.value}`},fT=(_={})=>{let E=_.target??("window"in globalThis?window:null);if(!E)throw new M("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let U=_.acceptSource??((T)=>T===E.parent),k=_.requestTimeoutMs??UT,I=new Set,J=new Set,c=new Set,H=new Set,d=new Set,p=new Set,O_=new Set,I_=new Set,V_=new Set,a=new Set,v_=[],U_=null,A_=null,N_=new Set,W_=new Set,M_=null,R_=null,u_=!1,n=new Map,i=new Map,o=new Map,q=!1,C={value:0},R=null,y=null,C_=!1,G_=!1,qT=null,yT=(T)=>{if(!T)return null;return{sessionId:T.id,phase:T.busy?"started":"completed"}},w=(T)=>{E.parent.postMessage(T,"*")},hT=()=>{if(q||E.parent===E||a.size===0||R?.features?.lateGenerateResults!==!0)return;w({channel:D,v:X,type:"generate-late-listen"})},f=(T,S)=>{for(let O of T)try{O(S)}catch(A){console.error(A)}},gT=(T)=>{if(!(T instanceof MessageEvent))return;if(!U(T.source))return;let S=$T(T.data);if(!S)return;if(S.type==="workspace"){let A=i.get(S.payload.subscriptionId);if(A)f([A],S.payload.snapshot);return}if(S.type==="shells"){let A=o.get(S.payload.subscriptionId);if(A)f([A],S.payload.snapshot);return}if(S.type==="ready"){if(R=S.payload,y=yT(S.payload.session),f(I,S.payload),f(J,S.payload.directory),f(c,S.payload.session),y)f(H,y);f(d,S.payload.connection),f(p,S.payload.settings),f(O_,S.payload.item),hT();return}if(S.type==="generate-late"){if(a.size===0)v_.push(S.payload);else f(a,S.payload);return}if(S.type==="directory"){if(R)R={...R,directory:S.payload.directory};f(J,S.payload.directory);return}if(S.type==="session"){if(R)R={...R,session:S.payload.session};if(!S.payload.session)y=null;else if(y?.sessionId!==S.payload.session.id)y=yT(S.payload.session);f(c,S.payload.session);return}if(S.type==="session-lifecycle"){y=S.payload,f(H,S.payload);return}if(S.type==="connection"){if(R)R={...R,connection:S.payload.connection};f(d,S.payload.connection);return}if(S.type==="settings"){if(R)R={...R,settings:S.payload.settings};f(p,S.payload.settings);return}if(S.type==="item"){if(R)R={...R,item:S.payload.item};f(O_,S.payload.item);return}if(S.type==="status-control-event"){f(I_,S.payload);return}if(S.type==="popover-closed"){f(V_,S.payload);return}if(S.type==="action"){let A=(V)=>{if(!q)w({channel:D,v:X,type:"action-result",id:S.id,payload:V})},N=A_;if(!N){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>N(S.payload)).then(()=>A({ok:!0}),(V)=>{let Q=(V instanceof Error?V.message:String(V)).trim();A({ok:!1,error:(Q||"Action failed.").slice(0,D_)})});return}if(S.type==="file-open"){let A=S.payload;if(R_&&TS(R_,A))return;R_=A,f(N_,S.payload);return}if(S.type==="file-saved"){f(W_,S.payload.version);return}if(S.type==="file-snapshot"){let A=(Q)=>{if(!q)w({channel:D,v:X,type:"file-snapshot-result",id:S.id,payload:Q})},N=(Q)=>A({error:(Q.trim()||"Could not read the edited file.").slice(0,D_)}),V=M_;if(!V){N("This extension does not edit files.");return}Promise.resolve().then(()=>V(S.payload.purpose)).then((Q)=>{if(t_(Q)>Q_){N(`The file is over ${Q_} ${"bytes"in Q?"bytes":"characters"}.`);return}if(Q.version.length>k_){N(`The snapshot version is over ${k_} characters.`);return}A({snapshot:"bytes"in Q?{bytes:Q.bytes,version:Q.version}:{content:Q.content,version:Q.version}})},(Q)=>N(Q instanceof Error?Q.message:String(Q)));return}if(S.type==="resolve"){let A=(V)=>{w({channel:D,v:X,type:"resolve-result",id:S.id,payload:V})},N=U_;if(!N){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>N(S.payload)).then((V)=>A({item:V?s(V):null}),(V)=>{let Q=(V instanceof Error?V.message:String(V)).trim();A({error:(Q||"Command failed.").slice(0,D_)})});return}let O=n.get(S.id);if(!O)return;if(clearTimeout(O.timer),n.delete(S.id),S.ok){O.resolve(S.payload);return}O.reject(new M(S.code,S.error))};E.addEventListener("message",gT),w({channel:D,v:X,type:"hello"});let z=(T,S=k)=>{if(q||E.parent===E)return Promise.reject(new M("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((O,A)=>{let N=setTimeout(()=>{n.delete(T.id),A(new M("HOST_TIMEOUT","Host did not answer in time."))},S);n.set(T.id,{resolve:O,reject:A,timer:N}),w(T)})},L=(T)=>z(T).then(()=>{return}),Y={channel:D,v:X},l_=(T)=>{if(!q&&E.parent!==E)w(T)},mT=()=>l_({...Y,type:"file-save"}),cT=(T)=>{if(!ZS(T)||!nS(T))return;T.preventDefault(),mT()},dT=(T)=>{if(!ZS(T)||T.key!=="Escape"||R?.surface!=="popover"||!R.popover)return;T.preventDefault(),lT(R.popover.id,"escape").catch(()=>{return})},P_=()=>{let T=R?.surface==="popover"?R.popover:void 0;if(!T)return;let S=C_||G_;if(qT===S)return;qT=S,aT(T.id,S).catch(()=>{return})},$_=()=>{if(R?.surface!=="popover"||C_)return;C_=!0,P_()},pT=(T)=>{if(R?.surface!=="popover"||T.relatedTarget!==null||!C_)return;C_=!1,P_()},vT=()=>{if(R?.surface!=="popover"||G_)return;G_=!0,P_()},uT=()=>{if(R?.surface!=="popover"||!G_)return;G_=!1,P_()},b=(T,S=1024)=>{if(!T.trim()||T.length>S)throw new M("HOST_REJECTED",`Identity must contain 1 to ${S} characters.`)},a_=async(T)=>{if(T.kind!=="projects")b(T.projectId);let S=await z({...Y,type:"workspace-read",id:G(C),payload:T});if(!S||!("kind"in S)||!("state"in S)||S.kind!==T.kind)throw new M("HOST_REJECTED","Host did not return workspace data.");return S},n_=async(T,S)=>{if(T.kind!=="projects")b(T.projectId);let O=G(C);i.set(O,S);try{await L({...Y,type:"workspace-subscribe",id:G(C),payload:{subscriptionId:O,query:T}})}catch(A){if(i.delete(O),!q)w({...Y,type:"workspace-unsubscribe",id:G(C),payload:{subscriptionId:O}});throw A}return()=>{if(!i.delete(O)||q)return;w({...Y,type:"workspace-unsubscribe",id:G(C),payload:{subscriptionId:O}})}},gS=async(T,S)=>{if(T.kind==="session")b(T.sessionId);if(T.kind==="project")b(T.projectId);let O=G(C);o.set(O,S);try{await L({...Y,type:"shells-subscribe",id:G(C),payload:{subscriptionId:O,scope:T}})}catch(A){if(o.delete(O),!q)w({...Y,type:"shells-unsubscribe",id:G(C),payload:{subscriptionId:O}});throw A}return()=>{if(!o.delete(O)||q)return;w({...Y,type:"shells-unsubscribe",id:G(C),payload:{subscriptionId:O}})}},f_=async(T)=>{if("key"in T&&(T.key.length===0||T.key.length>o_))throw new M("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(T.op==="set"&&!r(T.value))throw new M("HOST_REJECTED","Storage values must be JSON.");if(T.op==="set"&&new TextEncoder().encode(JSON.stringify(T.value)).length>r_)throw new M("HOST_REJECTED","Storage value exceeds 64 KiB.");if(T.scope==="device"&&R?.features?.deviceStorage!==!0)throw new M("UNSUPPORTED","This host does not support device storage.");let S=await z({...Y,type:"storage",id:G(C),payload:T});if(!S||!("storage"in S)||S.op!==T.op)throw new M("HOST_REJECTED","Host did not return storage data.");return S},lT=(T,S)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===T)?Promise.reject(new M("UNSUPPORTED","This host does not support popovers.")):L({...Y,type:"popover-close",id:G(C),payload:S?{id:T,reason:S}:{id:T}}),aT=(T,S)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===T)?Promise.reject(new M("UNSUPPORTED","This host does not support popovers.")):L({...Y,type:"popover-anchor",id:G(C),payload:{id:T,active:S}});return E.addEventListener("keydown",dT,!0),E.addEventListener("pointerover",$_),E.addEventListener("pointermove",$_),E.addEventListener("pointerout",pT),E.addEventListener("focus",vT),E.addEventListener("blur",uT),{onAction:(T)=>{return A_=T,()=>{if(A_===T)A_=null}},listProjects:async()=>{let T=await a_({kind:"projects"});if(T.kind!=="projects")throw new M("HOST_REJECTED","Expected projects.");return T},listWorktrees:async(T)=>{let S=await a_({kind:"worktrees",projectId:T});if(S.kind!=="worktrees")throw new M("HOST_REJECTED","Expected worktrees.");return S},listSessions:async(T)=>{let S=await a_({kind:"sessions",projectId:T});if(S.kind!=="sessions")throw new M("HOST_REJECTED","Expected sessions.");return S},onProjects:(T)=>n_({kind:"projects"},(S)=>{if(S.kind==="projects")T(S)}),onWorktrees:(T,S)=>n_({kind:"worktrees",projectId:T},(O)=>{if(O.kind==="worktrees")S(O)}),onSessions:(T,S)=>n_({kind:"sessions",projectId:T},(O)=>{if(O.kind==="sessions")S(O)}),onRunningShells:(T,S)=>gS(T,S),readShellOutput:async(T,S)=>{b(T,L_);let O=S?.cursor;if(O!==void 0&&(!Number.isInteger(O)||O<0))throw new M("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=S?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>Y_))throw new M("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${Y_}.`);let V=await z({...Y,type:"shell-output",id:G(C),payload:{shellId:T,cursor:O,tailBytes:A}});if(!V||typeof V.output!=="string"||!Number.isFinite(V.cursor))throw new M("HOST_REJECTED","Host did not return shell output.");return V},stopShell:async(T)=>{if(b(T,L_),(await z({...Y,type:"shell-stop",id:G(C),payload:{shellId:T}}))?.stopped!==!0)throw new M("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(T)=>{b(T),await L({...Y,type:"open-session",id:G(C),payload:{sessionId:T}})},storage:{get:async(T,S)=>{let O=H_(S),A={op:"get",key:T};if(O)A.scope=O;let N=await f_(A);return N.op==="get"&&N.found?N.value:void 0},set:async(T,S,O)=>{let A=H_(O),N={op:"set",key:T,value:S};if(A)N.scope=A;await f_(N)},delete:async(T,S)=>{let O=H_(S),A={op:"delete",key:T};if(O)A.scope=O;await f_(A)},keys:async(T)=>{let S=H_(T),O={op:"keys"};if(S)O.scope=S;let A=await f_(O);if(A.op!=="keys")throw new M("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:(T)=>{if(I.add(T),R)T(R);return()=>{I.delete(T)}},onDirectory:(T)=>{if(J.add(T),R)T(R.directory);return()=>{J.delete(T)}},onSession:(T)=>{if(c.add(T),R)T(R.session);return()=>{c.delete(T)}},onSessionLifecycle:(T)=>{if(H.add(T),y)T(y);return()=>{H.delete(T)}},onConnection:(T)=>{if(d.add(T),R)T(R.connection);return()=>{d.delete(T)}},onSettings:(T)=>{if(p.add(T),R)T(R.settings);return()=>{p.delete(T)}},onItem:(T)=>{if(O_.add(T),R)T(R.item);return()=>{O_.delete(T)}},onStatusControl:(T)=>{return I_.add(T),()=>{I_.delete(T)}},onPopoverClosed:(T)=>{return V_.add(T),()=>{V_.delete(T)}},setStatusControls:(T)=>{if(R?.features?.statusControls!==!0)return Promise.reject(new M("UNSUPPORTED","This host does not support status controls."));if(!tT(T))return Promise.reject(new M("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return L({...Y,type:"status-controls",id:G(C),payload:{controls:T}})},openPopover:(T)=>{if(R?.features?.popovers!==!0)return Promise.reject(new M("UNSUPPORTED","This host does not support popovers."));if(!_T(T))return Promise.reject(new M("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return L({...Y,type:"popover-open",id:G(C),payload:T})},closePopover:lT,setPopoverAnchorActive:aT,onResolve:(T)=>{return U_=T,()=>{if(U_===T)U_=null}},toast:(T)=>{let S=T.message.trim();if(!S||S.length>Z_)return Promise.reject(new M("HOST_REJECTED",`Toast message must contain 1 to ${Z_} characters.`));if(T.copy&&T.copy!==!0&&(!T.copy.text.length||T.copy.text.length>z_))return Promise.reject(new M("HOST_REJECTED",`Toast copy text must contain 1 to ${z_} characters.`));return L({channel:D,v:X,type:"toast",id:G(C),payload:{...T,message:S}})},openUrl:(T)=>L({channel:D,v:X,type:"open-url",id:G(C),payload:{url:T}}),openCommit:(T)=>OT(T)?L({channel:D,v:X,type:"open-commit",id:G(C),payload:{sha:T}}):Promise.reject(new M("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:(T)=>L({channel:D,v:X,type:"open-surface",id:G(C),payload:{surfaceId:T}}),writeClipboard:(T)=>L({channel:D,v:X,type:"clipboard-write",id:G(C),payload:{text:T}}),compose:(T)=>L({channel:D,v:X,type:"compose",id:G(C),payload:T}),attach:(T)=>L({channel:D,v:X,type:"attach",id:G(C),payload:s(T)}),startSession:async(T)=>{if(T.projectId!==void 0)b(T.projectId);let S=T.worktree;if(S&&S!==!0)if(S.kind==="existing")b(S.directory);else{if(S.name!==void 0)b(S.name,200);if(S.baseBranch!==void 0)b(S.baseBranch,200)}let O=await z({channel:D,v:X,type:"start-session",id:G(C),payload:RT(T)},_.requestTimeoutMs??180000);if(!ST(O))throw new M("HOST_REJECTED","Host did not return a session.");return O},prompt:(T)=>z({channel:D,v:X,type:"prompt",id:G(C),payload:CT(T)}).then((S)=>{if(!ET(S))throw new M("HOST_REJECTED","Host did not return a prompt result.");return S}),sessionLink:(T)=>L({channel:D,v:X,type:"session-link",id:G(C),payload:s(T)}),close:()=>L({channel:D,v:X,type:"close",id:G(C)}),oauthStart:()=>L({channel:D,v:X,type:"oauth-start",id:G(C)}),oauthDisconnect:()=>L({channel:D,v:X,type:"oauth-disconnect",id:G(C)}),request:(T)=>(j_(T.path)?z({channel:D,v:X,type:"request",id:G(C),payload:T}):zS()).then((S)=>{if(!w_(S))throw new M("HOST_REJECTED","Host request result was empty.");return S}),serviceRequest:(T)=>(j_(T.path)?z({channel:D,v:X,type:"service-request",id:G(C),payload:T}):zS()).then((S)=>{if(!w_(S))throw new M("HOST_REJECTED","Host service request result was empty.");return S}),serviceStatus:()=>z({channel:D,v:X,type:"service-status",id:G(C)}).then((T)=>{if(!XT(T))throw new M("HOST_REJECTED","Host did not return service status.");return T}),readFile:(T)=>(t(T)?z({channel:D,v:X,type:"file-read",id:G(C),payload:{path:T}}):x_()).then((S)=>{if(!IT(S))throw new M("HOST_REJECTED","Host did not return file content.");return S}),writeFile:(T,S)=>{if(!t(T))return x_();if(S.length>J_)return Promise.reject(new M("FILE_TOO_LARGE",`Content is over ${J_} characters.`));return z({channel:D,v:X,type:"file-write",id:G(C),payload:{path:T,content:S}}).then((O)=>{if(!VT(O))throw new M("HOST_REJECTED","Host did not confirm the write.");return O})},listDir:(T)=>(t(T)?z({channel:D,v:X,type:"file-list",id:G(C),payload:{path:T}}):x_()).then((S)=>{if(!NT(S))throw new M("HOST_REJECTED","Host did not return directory entries.");return S}),stat:(T)=>(t(T)?z({channel:D,v:X,type:"file-stat",id:G(C),payload:{path:T}}):x_()).then((S)=>{if(!WT(S))throw new M("HOST_REJECTED","Host did not return file status.");return S}),generate:(T)=>{let S=T.prompt.trim(),O=T.system?.trim();if(S.length===0||S.length>B_)return Promise.reject(new M("HOST_REJECTED",`Prompt must be 1 to ${B_} characters.`));if(O!==void 0&&(O.length===0||O.length>K_))return Promise.reject(new M("HOST_REJECTED",`System prompt must be 1 to ${K_} characters.`));let A=T.maxOutputTokens===void 0?void 0:Math.min(AT,Math.max(1,Math.floor(T.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new M("HOST_REJECTED","maxOutputTokens must be a number."));let N={prompt:S};if(O!==void 0)N.system=O;if(A!==void 0)N.maxOutputTokens=A;return z({channel:D,v:X,type:"generate",id:G(C),payload:N},_.requestTimeoutMs??MT).then((V)=>{if(!PT(V))throw new M("HOST_REJECTED","Host did not return generated text.");return V})},onLateGenerateResult:(T)=>{a.add(T);for(let S of v_.splice(0))f([T],S);return hT(),()=>{a.delete(T)}},setBadge:(T)=>L({channel:D,v:X,type:"badge",id:G(C),payload:{count:GT(T)}}),setHeight:(T)=>L({channel:D,v:X,type:"resize",id:G(C),payload:{height:DT(T)}}),onFileOpen:(T)=>{if(N_.add(T),!u_)u_=!0,E.addEventListener("keydown",cT,!0);if(R_)T(R_);return()=>{N_.delete(T)}},onFileSnapshot:(T)=>{return M_=T,()=>{if(M_===T)M_=null}},onFileSaved:(T)=>{return W_.add(T),()=>{W_.delete(T)}},reportFileChange:(T)=>l_({...Y,type:"file-change",payload:{dirty:T.dirty,edited:T.edited}}),requestFileSave:mT,reportFileUnsupported:()=>l_({...Y,type:"file-unsupported"}),dispose:()=>{for(let T of i.keys())w({...Y,type:"workspace-unsubscribe",id:G(C),payload:{subscriptionId:T}});i.clear();for(let T of o.keys())w({...Y,type:"shells-unsubscribe",id:G(C),payload:{subscriptionId:T}});if(o.clear(),q=!0,U_=null,A_=null,M_=null,N_.clear(),W_.clear(),u_)E.removeEventListener("keydown",cT,!0);E.removeEventListener("message",gT),E.removeEventListener("keydown",dT,!0),E.removeEventListener("pointerover",$_),E.removeEventListener("pointermove",$_),E.removeEventListener("pointerout",pT),E.removeEventListener("focus",vT),E.removeEventListener("blur",uT);for(let T of n.values())clearTimeout(T.timer),T.reject(new M("HOST_UNAVAILABLE","Host client was disposed."));n.clear(),I.clear(),J.clear(),c.clear(),H.clear(),d.clear(),p.clear(),O_.clear(),I_.clear(),V_.clear(),a.clear(),v_.length=0}}};var FS=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var HE=new Set(FS);var JS=["none","agent","user"];var qE=new Set(JS);var iS=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],oS=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],BS=(_,E)=>{E.style.colorScheme=_.mode;for(let[U,k]of iS)E.style.setProperty(U,_.tokens[k]);for(let[U,k,I]of oS){let J=_.tokens[I]??"";E.style.setProperty(U,J),E.style.setProperty(k,J)}E.style.setProperty("font-family",_.tokens.font),E.style.setProperty("font-size","0.875rem"),E.style.setProperty("line-height","1.45"),E.style.setProperty("color",_.tokens.foreground)},LT=(_,E)=>{if(BS(_.theme,E),E.dataset)E.dataset.ocSurface=_.surface,E.dataset.ocTheme=_.theme.mode};var rS={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},W=(_,E)=>`var(--${_}, var(--oc-${rS[_]}, ${E}))`,g=W("surface-background","transparent"),q_=W("surface-elevated","transparent"),e=W("surface-elevated-foreground","inherit"),x=W("surface-foreground","inherit"),P=W("surface-muted-foreground","gray"),sS=W("surface-muted","transparent"),v=W("interactive-border","currentColor"),B=W("interactive-hover","transparent"),u=W("interactive-active","transparent"),YT=W("interactive-selection","transparent"),QT=W("interactive-selection-foreground","inherit"),h=W("primary","currentColor"),kT=W("primary-text","inherit"),ZT=W("error-text","inherit"),tS=W("font-sans","inherit"),zT=W("font-mono","monospace"),xS=W("radius","9px"),FT=`calc(${xS} - 2px)`,KS=`calc(${xS} - 4px)`,$=(_,E,U="transparent")=>`color-mix(in srgb, ${_} ${E}%, ${U})`,jS=`background-image: linear-gradient(${B}, ${B});`,JT=(_,E="0.5px")=>`box-shadow: inset 0 0 0 ${E} ${_}, var(--oc-sdk-field-lift);`,BT="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",wS="box-shadow: var(--oc-sdk-lit);",KT=`inset 0 0.5px 0 0 ${$(x,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,eS=`
:root {
  --oc-sdk-edge: ${$(x,16)};
  --oc-sdk-field-bg: ${q_};
  --oc-sdk-raised-bg: ${g};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${$(x,14)};
  --oc-sdk-field-bg: ${$(g,50,q_)};
  --oc-sdk-raised-bg: ${q_};
  --oc-sdk-field-lift: ${KT};
  --oc-sdk-raised-lift: ${KT};
  --oc-sdk-lit: ${KT};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,b_=(_)=>{let E=W(`status-${_}`,"currentColor");return`
.oc-sdk[data-tone="${_}"], .oc-sdk [data-tone="${_}"] { --oc-sdk-tone: ${E}; --oc-sdk-tone-text: ${W(`${_}-text`,"inherit")}; }`},_E=`
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
`,HS=`${eS}
.oc-sdk { color: ${x}; font-family: ${tS}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${jS} }
.oc-sdk-mono { font-family: ${zT}; }
.oc-sdk-muted { color: ${P}; }
${b_("success")}${b_("warning")}${b_("error")}${b_("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${h}; --oc-sdk-tone-text: ${kT}; }

.oc-sdk-btn { border-radius: ${FT}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${KS}; }
.oc-sdk-btn[data-variant="default"] { color: ${kT}; background: ${$(h,10,g)}; border-color: ${$(h,12)}; ${wS} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${$(h,16,g)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${$(h,22,g)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${sS}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${u}, ${u}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${e}; ${BT} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${u}, ${u}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${B}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${u}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${W("status-error","red")}; color: ${ZT}; background: ${$("var(--oc-sdk-tone)",7,g)}; border-color: ${$("var(--oc-sdk-tone)",12)}; ${wS} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${$("var(--oc-sdk-tone)",9,g)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${$("var(--oc-sdk-tone)",11,g)}; box-shadow: none; }

.oc-sdk-field-note { color: ${P}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${ZT}; }
.oc-sdk-input { border-radius: ${FT}; background: var(--oc-sdk-field-bg); color: ${e}; ${JT("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${P}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${JT($(x,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${JT(W("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${zT}; }

.oc-sdk-search-icon { color: ${P}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${h}; }
.oc-sdk-search-clear { border-radius: ${KS}; color: ${P}; }
.oc-sdk-search-clear:hover { background: ${B}; color: ${x}; }

.oc-sdk-trigger { border-radius: ${FT}; background: var(--oc-sdk-raised-bg); color: ${e}; ${BT} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${u}, ${u}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${P}; }
.oc-sdk-trigger-chevron { color: ${P}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${e}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${q_}; background-clip: padding-box; color: ${e}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${B}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${YT}; color: ${QT}; }
.oc-sdk-option-check { color: ${x}; }
.oc-sdk-option[data-destructive="true"] { color: ${ZT}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${$(W("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${P}; }
.oc-sdk-popup-empty { color: ${P}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${v}; border-radius: 4px; color: ${x}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${$(x,60,v)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${v}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${g}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${h}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${jS} }
.oc-sdk-check-desc { color: ${P}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${$(x,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${P}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${x}; }
.oc-sdk-tab[aria-selected="true"] { color: ${QT}; background: ${YT}; border-color: ${v}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${e}; background: var(--oc-sdk-raised-bg); ${BT} }
.oc-sdk-tab-count { color: ${P}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${$(x,6)}; color: ${P}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${$("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${B}; }
.oc-sdk-row[aria-selected="true"] { background: ${YT}; color: ${QT}; }
.oc-sdk-row-lead { font-family: ${zT}; color: ${P}; }
.oc-sdk-row-sub { color: ${P}; }
.oc-sdk-row-meta { color: ${P}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${P}; }

.oc-sdk-empty-body { color: ${P}; }

.oc-sdk-spinner { color: ${P}; }
.oc-sdk-spinner-ring { border-color: ${v}; border-top-color: ${h}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${$("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${P}; }

.oc-sdk-separator { color: ${P}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${$(v,40)}; }

.oc-sdk-progress-label { color: ${P}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${$(x,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${h}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${W("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${W("success-text","inherit")}; }

.oc-sdk-text a { color: ${kT}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${$(v,60)}; }
`,F=`
${i_}
${_E}
${HS}`;var Z=fT();Z.onStatusControl((_)=>{if(_.id==="refresh")p_();else if(_.id==="count")UE()});var d_=document.querySelector("#root");if(!d_)throw Error("Missing #root");var UE=async()=>{try{await Z.storage.set("ztb-open-refresh",String(Date.now()),{scope:"device"})}catch{}Z.openSurface("plugin:zentao-bugs").catch(()=>{return})};d_.innerHTML=`<style>
body{margin:0;font:12px/1.5 system-ui,sans-serif}
#root{padding:2px 4px;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.m{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;opacity:.75}
.row{display:flex;gap:4px;align-items:center}
button{flex:1;padding:1px 4px;font-size:11.5px;border:1px solid var(--oc-border,var(--border,#8888));border-radius:6px;background:var(--oc-elevated,inherit);color:var(--oc-fg,inherit);cursor:pointer;white-space:nowrap}
button.on{border-color:var(--primary,#3574f0);color:var(--primary,#3574f0);font-weight:700}
button[hidden]{display:none}
</style><div class="row"><button id="btn-r" title="手动刷新" hidden>↻</button><button id="btn-a" title="定时刷新开关（60秒）">定时刷新:关</button></div><div class="m" id="m"></div>`;var T_=document.querySelector("#m"),S_=document.querySelector("#btn-r"),wT=document.querySelector("#btn-a");d_.onclick=(_)=>{if(_.target.tagName==="BUTTON")return;Z.openSurface("plugin:zentao-bugs").catch(()=>{return})};var xT=!1,c_=null,HT=null,l=!1,bS=!1,bT="",AE=()=>{let _=new Date,E=(U)=>String(U).padStart(2,"0");return`${E(_.getHours())}:${E(_.getMinutes())}:${E(_.getSeconds())}`},E_=async()=>{let _=[];if(HT!==null)_.push({kind:"button",id:"count",label:`\uD83D\uDC1E ${HT} 待办`});_.push({kind:"button",id:"refresh",label:l?"↻…":"↻",disabled:l});try{await Z.setStatusControls(_),bS=!0,S_.hidden=!0}catch{bS=!1,S_.hidden=!1,S_.disabled=l,S_.textContent=l?"↻…":"↻"}},ME=()=>{let _=Math.ceil(d_.getBoundingClientRect().height);Z.setHeight(_).catch(()=>{return})},qS=(_)=>{if(HT=_,_===null)T_.textContent="待登录（面板⚙连接）";else T_.textContent=bT?`上次刷新 ${bT}`:"未刷新",T_.style.color=_>0?"#f87171":"",T_.style.fontWeight=_>0?"700":"";E_(),Z.setBadge(_!==null&&_>0?_:null).catch(()=>{return}),ME()},p_=async()=>{if(document.hidden||l)return;l=!0,await E_();try{let _=await Z.serviceRequest({method:"GET",path:"/count?days=7"}),E=JSON.parse(_.body);if(!E.ok&&E.error==="need-config")try{let U=await Z.storage.get("ztb-cfg",{scope:"device"});if(U?.base&&U?.account&&U?.password)await Z.serviceRequest({method:"POST",path:"/login",body:JSON.stringify({baseUrl:U.base,account:U.account,password:U.password})}),_=await Z.serviceRequest({method:"GET",path:"/count?days=7"}),E=JSON.parse(_.body)}catch{}if(!E.ok){if(E.error==="need-config")qS(null);else T_.textContent="禅道不可用",E_();return}bT=AE(),qS(E.total)}catch{T_.textContent="未启用本地服务",E_()}finally{l=!1,await E_()}},hS=(_)=>{if(xT=_,wT.textContent=_?"定时刷新:开":"定时刷新:关",wT.classList.toggle("on",_),c_)clearInterval(c_),c_=null;if(_)c_=setInterval(()=>void p_(),60000)};S_.onclick=(_)=>{_.stopPropagation(),p_()};wT.onclick=(_)=>{_.stopPropagation(),hS(!xT);try{Z.storage.set("ztb-autoref",xT?"1":"",{scope:"device"})}catch{}};var yS=!1;Z.onReady((_)=>{if(LT(_,document.documentElement),_.features?.statusControls!==!0)S_.hidden=!1;else E_();(async()=>{try{if(await Z.storage.get("ztb-autoref",{scope:"device"})==="1")hS(!0)}catch{}try{let E=await Z.storage.get("ztb-cfg",{scope:"device"});if(E?.base&&E?.account&&E?.password)await Z.serviceRequest({method:"POST",path:"/login",body:JSON.stringify({baseUrl:E.base,account:E.account,password:E.password})})}catch{}if(yS)return;yS=!0,p_()})()});})();
