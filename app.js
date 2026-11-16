const records=[...document.querySelectorAll('.record')];
const host=document.getElementById('spotifyHost');
const layoutKey='fiveSidesLayout';
const layoutItems=[
 ...records.map((element,index)=>({key:`record-${index}`,element,handle:element})),
 ...[
  ['clock',document.querySelector('.clock-block')],
  ['todo',document.querySelector('.todo-paper')],
  ['calendar',document.querySelector('.calendar')]
 ].map(([key,element])=>({key,element,handle:element})),
 {key:'spotify',element:host,handle:null}
];
const desktop=document.getElementById('desktop');
const layoutStatus=document.getElementById('layoutStatus');
let active=-1, controller=null, dragState=null, draggedRecord=null, customizing=false;

function readLayout(){
 try{
  const saved=JSON.parse(localStorage.getItem(layoutKey)||'{}');
  if(!saved||typeof saved!=='object'||Array.isArray(saved))return {};
  return saved;
 }catch(error){
  console.warn('Could not load the saved wallpaper layout.',error);
  return {};
 }
}
const positions=readLayout();
layoutItems.forEach(item=>{
 item.handle=item.handle||item.element;
 const position=positions[item.key];
 if(position&&Number.isFinite(position.x)&&Number.isFinite(position.y)){
  item.x=position.x;item.y=position.y;
  item.element.style.setProperty('--drag-x',`${item.x}px`);
  item.element.style.setProperty('--drag-y',`${item.y}px`);
 }else{item.x=0;item.y=0}
});
function saveLayout(){
 const saved={};
 layoutItems.forEach(({key,x,y})=>{if(x||y)saved[key]={x,y}});
 try{localStorage.setItem(layoutKey,JSON.stringify(saved))}
 catch(error){console.warn('Could not save the wallpaper layout.',error)}
}
function resetLayout(){
 layoutItems.forEach(item=>{
  item.x=0;item.y=0;
  item.element.style.removeProperty('--drag-x');
  item.element.style.removeProperty('--drag-y');
 });
 try{localStorage.removeItem(layoutKey)}
 catch(error){console.warn('Could not reset the saved wallpaper layout.',error)}
 setCustomizing(false);
}
function startDrag(item,event){
 if(!customizing||event.button!==0||event.target instanceof Element&&event.target.closest('textarea,input,[contenteditable="true"]'))return;
 dragState={item,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,startRect:item.element.getBoundingClientRect(),x:item.x,y:item.y,moved:false};
 event.currentTarget.setPointerCapture(event.pointerId);
}
function moveDrag(event){
 if(!dragState||event.pointerId!==dragState.pointerId)return;
 const dx=event.clientX-dragState.startX,dy=event.clientY-dragState.startY;
 if(!dragState.moved&&Math.hypot(dx,dy)<4)return;
 dragState.moved=true;
 const {item,startRect}=dragState;
 const x=Math.max(-startRect.left,Math.min(window.innerWidth-startRect.right,dx));
 const y=Math.max(-startRect.top,Math.min(window.innerHeight-startRect.bottom,dy));
 item.x=dragState.x+x;item.y=dragState.y+y;
 item.element.style.setProperty('--drag-x',`${item.x}px`);
 item.element.style.setProperty('--drag-y',`${item.y}px`);
 item.element.classList.add('is-dragging');
}
function endDrag(event){
 if(!dragState||event.pointerId!==dragState.pointerId)return;
 const {item,moved}=dragState;
 item.element.classList.remove('is-dragging');
 if(moved){
  saveLayout();
  if(item.key.startsWith('record-')){
   draggedRecord=item.element;
   setTimeout(()=>{if(draggedRecord===item.element)draggedRecord=null},500);
  }
 }
 dragState=null;
}
function setCustomizing(enabled){
 customizing=enabled;
 if(!enabled&&dragState){
  dragState.item.element.classList.remove('is-dragging');
  if(dragState.item.key.startsWith('record-')&&dragState.moved){
   const record=dragState.item.element;
   draggedRecord=record;
   setTimeout(()=>{if(draggedRecord===record)draggedRecord=null},500);
  }
  dragState=null;
 }
 desktop.classList.toggle('is-customizing',enabled);
 layoutStatus.setAttribute('aria-hidden',String(!enabled));
}
layoutItems.forEach(item=>{
 if(item.key==='spotify')return;
 item.handle.addEventListener('pointerdown',event=>startDrag(item,event));
 item.handle.addEventListener('pointermove',moveDrag);
 item.handle.addEventListener('pointerup',endDrag);
 item.handle.addEventListener('pointercancel',endDrag);
});

function fuzzyTime(){
 const d=new Date(),h=d.getHours(),m=d.getMinutes();
 const words=['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
 const current=words[h%12],next=words[(h+1)%12];let phrase;
 if(m<4)phrase=`It's just after ${current}`;
 else if(m<9)phrase=`It's five past ${current}`;
 else if(m<14)phrase=`It's ten past ${current}`;
 else if(m<19)phrase=`It's a quarter past ${current}`;
 else if(m<24)phrase=`It's twenty past ${current}`;
 else if(m<29)phrase=`It's nearly half past ${current}`;
 else if(m<34)phrase=`It's half past ${current}`;
 else if(m<39)phrase=`It's just gone half past ${current}`;
 else if(m<44)phrase=`It's twenty to ${next}`;
 else if(m<49)phrase=`It's a quarter to ${next}`;
 else if(m<54)phrase=`It's ten to ${next}`;
 else if(m<58)phrase=`It's five to ${next}`;
 else phrase=`It's nearly ${next}`;
 document.getElementById('fuzzyTime').textContent=phrase;
 document.getElementById('month').textContent=d.toLocaleDateString('en-US',{month:'long'}).toUpperCase();
 document.getElementById('year').textContent=d.getFullYear();
 document.getElementById('day').textContent=String(d.getDate()).padStart(2,'0');
 document.getElementById('weekday').textContent=d.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase();
}
fuzzyTime();setInterval(fuzzyTime,30000);
const todo=document.getElementById('todo');todo.value=localStorage.getItem('fiveSidesTodo')||'';todo.addEventListener('input',()=>localStorage.setItem('fiveSidesTodo',todo.value));
function spotifyId(url){try{const u=new URL(url);if(!u.hostname.endsWith('spotify.com'))return null;const m=u.pathname.match(/\/(playlist|album)\/([A-Za-z0-9]+)/);return m?{type:m[1],id:m[2]}:null}catch{return null}}
function setActive(index){records.forEach((r,i)=>r.classList.toggle('active',i===index));active=index;}
function stop(){if(controller){try{controller.pause()}catch{}}host.replaceChildren();controller=null;setActive(-1);}
let pendingPlayback=null;
function mountSpotify(index,parsed){
 host.replaceChildren();host.classList.remove('is-hidden');host.setAttribute('aria-hidden','false');host.inert=false;controller=null;setActive(index);
 const handle=document.createElement('button');
 handle.type='button';handle.className='spotify-drag-handle';handle.textContent='MOVE';handle.setAttribute('aria-label','Drag Spotify player');handle.title='Drag to move player when layout is unlocked';
 const item=layoutItems.find(layoutItem=>layoutItem.key==='spotify');
 handle.addEventListener('pointerdown',event=>startDrag(item,event));
 handle.addEventListener('pointermove',moveDrag);
 handle.addEventListener('pointerup',endDrag);
 handle.addEventListener('pointercancel',endDrag);
 host.appendChild(handle);
 if(!window.IFrameAPI){pendingPlayback={index,parsed};return}
 const mount=document.createElement('div');mount.className='spotify-mount';host.appendChild(mount);
 window.IFrameAPI.createController(mount,{uri:`spotify:${parsed.type}:${parsed.id}`},c=>{controller=c;c.play();});
}
window.addEventListener('keydown',event=>{
 const target=event.target;
 if(!event.repeat&&event.altKey&&!event.ctrlKey&&!event.metaKey&&event.key.toLowerCase()==='r'){
  event.preventDefault();setCustomizing(!customizing);return;
 }
 if(!event.repeat&&customizing&&event.altKey&&!event.ctrlKey&&!event.metaKey&&event.key.toLowerCase()==='q'){
  event.preventDefault();resetLayout();return;
 }
 if(target instanceof HTMLElement&&target.isContentEditable||target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement)return;
 if(event.repeat||!event.shiftKey||event.key.toLowerCase()!=='k')return;
 if(!host.firstElementChild)return;
 event.preventDefault();
 const hidden=!host.classList.contains('is-hidden');
 host.classList.toggle('is-hidden',hidden);
 host.setAttribute('aria-hidden',String(hidden));
 host.inert=hidden;
});
function playRecord(index){
 const urls=window.PLAYLISTS||[];const parsed=spotifyId(urls[index]||'');
 if(!parsed){console.warn(`Add a Spotify URL for record ${index+1} in playlists.js`);return}
 if(active===index&&controller){controller.pause();controller=null;setActive(-1);host.replaceChildren();return}
 mountSpotify(index,parsed);
}
records.forEach((r,i)=>r.addEventListener('click',event=>{
 if(customizing||draggedRecord===r){draggedRecord=null;event.preventDefault();return}
 playRecord(i);
}));
// Spotify Embed iframe API. Browser/Spotify account settings may still require an initial consent or play action.
window.onSpotifyIframeApiReady=api=>{window.IFrameAPI=api;if(pendingPlayback){const p=pendingPlayback;pendingPlayback=null;mountSpotify(p.index,p.parsed);}};
const apiScript=document.createElement('script');apiScript.src='https://open.spotify.com/embed/iframe-api/v1';document.head.appendChild(apiScript);
