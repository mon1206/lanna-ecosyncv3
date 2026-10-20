/* Lanna EcoSync — offline interaction demo. Not production authentication or a shared backend. */
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const KEY = 'lanna_eco_revamp_3'; // retain local demo data from the previous edition
const PHOTO = {
  longan:'assets/asset-11.webp', leaftrays:'assets/asset-12.webp', bowl:'assets/asset-13.webp',
  workshop:'assets/asset-06.webp', community:'assets/asset-08.webp'
};
const seedProducts = [
  {id:'leaf-bowl',name:'ถ้วยใบตองตึง',description:'ภาชนะใบตองตึงขึ้นรูป สามารถทดลองเลือกสกรีนโลโก้หรือติดฉลากแบรนด์ใน B2B Studio',kind:'craft',price:145,stock:110,unit:'ชิ้น',badge:'CUSTOMIZABLE',image:'bowl'},
  {id:'longan',name:'ลำไยอบแห้ง',description:'ผลิตภัณฑ์เกษตรแปรรูปจากชุมชน เหมาะกับการสั่งจองล่วงหน้า',kind:'agri',price:250,stock:80,unit:'กก.',badge:'PRE-ORDER',image:'longan'},
  {id:'leaf-tray',name:'ถาดใบตองตึง',description:'ภาชนะจากวัสดุป่าชุมชน ต่อยอดเป็นบรรจุภัณฑ์ Eco ได้',kind:'craft',price:180,stock:95,unit:'ชิ้น',badge:'HANDCRAFTED',image:'leaftrays'},
  {id:'leaf-plate',name:'จานใบตองตึง',description:'จานขึ้นรูปจากใบตองตึง สำหรับร้านอาหาร กิจกรรม และงานองค์กร',kind:'craft',price:120,stock:140,unit:'ชิ้น',badge:'ECO PRODUCT',image:'workshop'},
  {id:'gift',name:'ชุดผลิตภัณฑ์ชุมชน',description:'รวมสินค้าหัตถกรรมและผลิตภัณฑ์แปรรูปสำหรับมอบเป็นของขวัญ',kind:'craft',price:520,stock:28,unit:'ชุด',badge:'B2B GIFT',image:'community'}
];
function pseudoHash(str){let h=2166136261; for(const c of 'LannaPrototype:'+str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return String(h>>>0)}
function read(){try{let o=JSON.parse(localStorage.getItem(KEY)); if(o&&Array.isArray(o.products)&&Array.isArray(o.users))return o;}catch{}return null}
let db=read() || {products:structuredClone(seedProducts),users:[
  {id:'seller-1',name:'ผู้ดูแลร้านค้าทดลอง',email:'seller@lanna.demo',pass:pseudoHash('seller123'),role:'seller'},
  {id:'buyer-1',name:'ลูกค้าตัวอย่าง',email:'buyer@lanna.demo',pass:pseudoHash('buyer123'),role:'buyer'}],orders:[],custom:[],bookings:[],session:null};
for(const key of ['products','users','orders','custom','bookings']) if(!Array.isArray(db[key]))db[key]=[];
if(!db.products.some(p=>p.id==='leaf-bowl'))db.products.splice(1,0,structuredClone(seedProducts[0]));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch{toast('เบราว์เซอร์บันทึกข้อมูลไม่ได้');return false}}
persist();
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(v){return '฿'+Math.round(Number(v)||0).toLocaleString('th-TH')}
function timeNow(){return new Date().toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'})}
function uid(prefix){return prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)}
function user(){return db.users.find(u=>u.id===db.session)||null}
function isSeller(){return user()?.role==='seller'}
let toastTimeout;
function toast(message){const e=$('#toast');if(!e)return;e.textContent=message;e.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>e.classList.remove('visible'),3100)}
function dialog(html){$('#dialogContent').innerHTML=html;$('#dialogBackdrop').hidden=false;$('#dialogClose').focus();document.body.style.overflow='hidden'}
function closeDialog(){$('#dialogBackdrop').hidden=true;document.body.style.overflow=''}
$('#dialogClose').onclick=closeDialog;
$('#dialogBackdrop').addEventListener('click',e=>{if(e.target===$('#dialogBackdrop'))closeDialog()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#dialogBackdrop').hidden)closeDialog()});

function loginView(mode='login'){
  const isReg=mode==='register';
  dialog(`<h2 id="dialogTitle">${isReg?'สร้างบัญชีสมาชิก':'ยินดีต้อนรับกลับมา'}</h2><p class="tip">Lanna EcoSync · ระบบสมาชิกเพื่อทดลองในเบราว์เซอร์</p>
  <div class="dialog-tabs"><button type="button" id="tabLogin" class="${!isReg?'is-on':''}">เข้าสู่ระบบ</button><button type="button" id="tabRegister" class="${isReg?'is-on':''}">สมัครสมาชิก</button></div>
  <form id="identityForm">
  ${isReg?'<div class="field"><label for="regName">ชื่อที่แสดง</label><input id="regName" maxlength="90" required></div>':''}
  <div class="field"><label for="regEmail">อีเมล</label><input id="regEmail" type="email" required autocomplete="email"></div>
  <div class="field"><label for="regPassword">รหัสผ่านทดลอง</label><input id="regPassword" type="password" minlength="6" required autocomplete="${isReg?'new-password':'current-password'}"></div>
  <button class="solid full" type="submit">${isReg?'สมัครสมาชิก':'เข้าสู่ระบบ'}</button></form>
  <p class="tip">* ระบบต้นแบบ ไม่ควรใช้รหัสผ่านจริง และไม่มีฐานข้อมูลกลางหรือระบบยืนยันอีเมล</p>
  <div class="login-help">บัญชีผู้ขายทดลอง: seller@lanna.demo / seller123<br>บัญชีผู้ซื้อทดลอง: buyer@lanna.demo / buyer123</div>`);
  $('#tabLogin').onclick=()=>loginView('login');$('#tabRegister').onclick=()=>loginView('register');
  $('#identityForm').addEventListener('submit',e=>{
    e.preventDefault();
    const email=$('#regEmail').value.trim().toLowerCase();const pass=$('#regPassword').value;
    if(isReg){
      const name=$('#regName').value.trim();
      if(!name){toast('กรุณาระบุชื่อ');return}
      if(db.users.some(u=>u.email===email)){toast('อีเมลนี้มีบัญชีแล้ว');return}
      const record={id:uid('u'),name,email,pass:pseudoHash(pass),role:'buyer'};
      db.users.push(record);db.session=record.id;persist();closeDialog();refresh();toast('สร้างบัญชีสมาชิกทดลองแล้ว');
    }else{
      const matched=db.users.find(u=>u.email===email&&u.pass===pseudoHash(pass));
      if(!matched){toast('อีเมลหรือรหัสผ่านไม่ถูกต้อง');return}
      db.session=matched.id;persist();closeDialog();refresh();toast('เข้าสู่ระบบแล้ว');
    }
  });
}
function gate(){if(user())return true;loginView('login');toast('เข้าสู่ระบบเพื่อส่งคำขอ');return false}
function refresh(){
  const u=user();
  const btn=$('#authButton');btn.textContent=u?u.name:'เข้าสู่ระบบ';
  btn.onclick=()=>u?accountView():loginView('login');
  if($('#sellerArea'))$('#sellerArea').hidden=!isSeller();
  if($('#sellerGate'))$('#sellerGate').hidden=isSeller();
  if($('#sellerLink'))$('#sellerLink').hidden=!isSeller();
  $$('[data-adminlink]').forEach(el=>el.hidden=!isSeller());
  const count=u?[...db.orders,...db.custom,...db.bookings].filter(x=>x.userId===u.id).length:0;
  $('#requestCount').textContent=count;
  if($('#productGrid'))renderProducts();
  if($('#bookingList'))renderBookings();
  if(isSeller()&&$('#inventoryList')){renderAdmin();renderAdminBookings();}
}
function accountView(){const u=user();dialog(`<h2 id="dialogTitle">บัญชีของฉัน</h2><p>สวัสดีคุณ <strong>${esc(u.name)}</strong></p><p class="tip">${esc(u.email)} · ${u.role==='seller'?'ผู้ขาย/แอดมินทดลอง':'ผู้ซื้อ'}</p><button type="button" class="solid full" id="seeMyRequests">ดูรายการคำขอของฉัน</button><button type="button" class="outline-dark full" style="margin-top:9px" id="signOut">ออกจากระบบ</button>`);$('#seeMyRequests').onclick=showRequests;$('#signOut').onclick=()=>{db.session=null;persist();closeDialog();refresh();toast('ออกจากระบบแล้ว')}}
$('#requestsButton').onclick=()=>gate()&&showRequests();
function recordLine(kind,heading,detail,state){return `<div class="record"><div><strong>${esc(heading)}</strong><small>${esc(kind)} · ${esc(detail)}</small></div><span>${esc(state)}</span></div>`}
function showRequests(){if(!gate())return;let u=user();const all=[
  ...db.orders.filter(o=>o.userId===u.id).map(o=>({k:'คำขอสั่งสินค้า',name:o.productName,desc:`${o.quantity} ${o.unit} · ${o.date}`,status:o.status})),
  ...db.custom.filter(o=>o.userId===u.id).map(o=>({k:'คำขอผลิตสินค้า B2B',name:o.productName,desc:`${o.quantity} ชิ้น · ${o.date}`,status:o.status})),
  ...db.bookings.filter(o=>o.userId===u.id).map(o=>({k:'คำขอจองโรงอบ',name:o.purpose,desc:`${o.date} · ${o.slot}`,status:o.status}))];
  dialog(`<h2 id="dialogTitle">คำขอของฉัน</h2><p class="tip">บันทึกอยู่เฉพาะเบราว์เซอร์นี้</p><div class="list-stack">${all.length?all.map(o=>recordLine(o.k,o.name,o.desc,o.status)).join(''):'<p class="empty-record">คุณยังไม่มีคำขอทดลอง</p>'}</div>`)
}

let catalogFilter='all';
function renderProducts(){
  if(!$('#productGrid'))return;
  const q=$('#searchProduct').value.trim().toLocaleLowerCase('th-TH');
  const arr=db.products.filter(p=>!p.archived&&(catalogFilter==='all'||p.kind===catalogFilter)&&(p.name+' '+p.description).toLocaleLowerCase('th-TH').includes(q));
  const grid=$('#productGrid');$('#emptyProducts').hidden=!!arr.length;
  grid.innerHTML=arr.map(p=>`<article class="product-card"><div class="product-photo"><img loading="lazy" src="${PHOTO[p.image]||PHOTO.leaftrays}" alt="${esc(p.name)}"><span class="product-flag">${esc(p.badge||'COMMUNITY PRODUCT')}</span></div><div class="product-body"><div class="product-meta"><span>${p.kind==='agri'?'สินค้าเกษตร':'งานคราฟต์'}</span><span>คงเหลือ ${esc(p.stock)} ${esc(p.unit)}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-purchase"><div><strong>${money(p.price)}</strong><span> / ${esc(p.unit)}</span></div><button type="button" ${p.stock<1?'disabled':''} data-order="${esc(p.id)}">${p.stock<1?'สินค้าหมด':'สั่งจอง ↗'}</button></div></div></article>`).join('');
  $$('[data-order]',grid).forEach(b=>b.addEventListener('click',()=>orderProduct(b.dataset.order)));
}
$$('.filter').forEach(btn=>btn.onclick=()=>{catalogFilter=btn.dataset.filter;$$('.filter').forEach(b=>b.classList.toggle('is-on',b===btn));renderProducts()});
if($('#searchProduct'))$('#searchProduct').oninput=renderProducts;
function orderProduct(id){const p=db.products.find(x=>x.id===id&&!x.archived);if(!p)return;if(!gate())return;
  dialog(`<h2 id="dialogTitle">ส่งคำขอสั่งจองสินค้า</h2><p>${esc(p.name)} · ราคาสาธิต ${money(p.price)} / ${esc(p.unit)}</p>
  <form id="placeOrder"><div class="field"><label for="orderQty">จำนวน (สูงสุด ${p.stock})</label><input id="orderQty" type="number" min="1" max="${p.stock}" value="1" required></div><p class="tip">คำขอจะรอผู้ขายอนุมัติ เมื่ออนุมัติแล้วจึงปรับสต็อกในเครื่องนี้</p><button class="solid full" type="submit">บันทึกคำขอ</button></form>`);
  $('#placeOrder').onsubmit=e=>{e.preventDefault();const n=Number($('#orderQty').value);const fresh=db.products.find(x=>x.id===id);if(!Number.isInteger(n)||n<1||n>fresh.stock){toast('จำนวนสินค้าไม่ถูกต้อง');return}db.orders.unshift({id:uid('o'),userId:user().id,productId:id,productName:fresh.name,quantity:n,unit:fresh.unit,date:timeNow(),status:'รอผู้ขายอนุมัติ'});persist();closeDialog();refresh();toast('บันทึกคำขอสั่งซื้อทดลองแล้ว')};
}

const customData={bowl:{name:'ถ้วยใบตองตึง',image:'bowl',base:42},tray:{name:'ถาดใบตองตึง',image:'leaftrays',base:45},plate:{name:'จานใบตองตึง',image:'workshop',base:36},gift:{name:'ชุดของขวัญชุมชน',image:'community',base:165}};
const sizeFactor={s:1,m:1.2,l:1.55};
if($('#bowlCanvas')){
let logoURL='', customLogo=null, printMethod='screen';
const bowlImage=new Image(),brandSample=new Image();
let bowlLoaded=false, brandLoaded=false;
bowlImage.onload=()=>{bowlLoaded=true;renderBowl()};bowlImage.src='assets/asset-13.webp';
brandSample.onload=()=>{brandLoaded=true;renderBowl()};brandSample.src='assets/asset-14.png';
const previewCanvas=$('#bowlCanvas'), pctx=previewCanvas.getContext('2d', {willReadFrequently:false});
function getLogoDrawImage(){return customLogo || (brandLoaded?brandSample:null)}
function logoPosition(){return {x:724+Number($('#logoMoveX').value||0)*3.2,y:711+Number($('#logoMoveY').value||0)*2.1,scale:Number($('#logoScale').value||90)/100}}
function roundedPath(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function fittedRect(image,x,y,w,h){let scale=Math.min(w/image.naturalWidth,h/image.naturalHeight);const nw=image.naturalWidth*scale,nh=image.naturalHeight*scale;return {x:x+(w-nw)/2,y:y+(h-nh)/2,w:nw,h:nh};}
// Offscreen ink mask turns customer artwork into a single-tone print while removing white photo backgrounds.
function makeInk(image){
 const c=document.createElement('canvas');c.width=440;c.height=260;const a=c.getContext('2d',{willReadFrequently:true});
 const r=fittedRect(image,0,0,c.width,c.height);a.drawImage(image,r.x,r.y,r.w,r.h);
 let pix=a.getImageData(0,0,c.width,c.height),d=pix.data;
 const index=(x,y)=>(Math.floor(y)*c.width+Math.floor(x))*4+3;
 const transparentSample=[index(r.x+3,r.y+3),index(r.x+r.w-3,r.y+3),index(r.x+3,r.y+r.h-3)].some(idx=>d[idx]<100);
 for(let i=0;i<d.length;i+=4){
   const prior=d[i+3]/255;
   const lum=(.24*d[i]+.68*d[i+1]+.08*d[i+2])/255;
   const newAlpha=transparentSample?prior:prior*Math.min(1,Math.max(0,(.99-lum)*5.5));
   d[i]=69;d[i+1]=40;d[i+2]=22;d[i+3]=Math.round(newAlpha*218);
 }
 a.putImageData(pix,0,0);return c;
}
function renderBowl(){
 if(!bowlLoaded)return;
 const W=previewCanvas.width,H=previewCanvas.height;
 pctx.clearRect(0,0,W,H);pctx.drawImage(bowlImage,0,0,W,H);
 if(!$('#addLogo').checked)return;
 const logo=getLogoDrawImage();if(!logo || !logo.naturalWidth)return;
 const pos=logoPosition();
 const cx=pos.x,cy=pos.y;
 if(printMethod==='sticker'){
   const ww=355*pos.scale,hh=205*pos.scale,x=cx-ww/2,y=cy-hh/2;
   pctx.save();pctx.shadowColor='rgba(75,44,25,.28)';pctx.shadowBlur=19;pctx.shadowOffsetY=10;
   roundedPath(pctx,x,y,ww,hh,Math.max(8,12*pos.scale));pctx.fillStyle='#f9f4e9';pctx.fill();pctx.restore();
   pctx.save();roundedPath(pctx,x,y,ww,hh,Math.max(8,12*pos.scale));pctx.strokeStyle='rgba(96,65,36,.31)';pctx.lineWidth=2;pctx.stroke();
   // Print photo itself on neutral label; less distortion, maintain original colors.
   const r=fittedRect(logo,x+ww*.075,y+hh*.075,ww*.85,hh*.85);
   pctx.drawImage(logo,r.x,r.y,r.w,r.h);pctx.restore();
 }else{
   const c=makeInk(logo);
   const w=395*pos.scale,h=202*pos.scale, n=90;
   pctx.save();pctx.globalCompositeOperation='multiply';
   // Slight cylinder/leaf surface deformation; preserve natural material beneath ink.
   for(let i=0;i<n;i++){
     const t=(i+.5)/n,edge=Math.abs(t-.5)*2;
     const colX=cx-w/2+i*w/n;
     const colH=h*(1-.16*Math.pow(edge,2));
     const colY=cy-colH/2+11*Math.pow(edge,2);
     pctx.drawImage(c,i*c.width/n,0,c.width/n+1,c.height,colX,colY,w/n+1,colH);
   }
   pctx.restore();
 }
}
function customEstimate(){
 const type=$('#customProduct').value,qty=Math.max(10,parseInt($('#customQty').value,10)||10),size=$('#customSize').value,withLogo=$('#addLogo').checked;
 const price=Math.round(customData[type].base*sizeFactor[size]),base=price*qty;
 const extra=withLogo?(printMethod==='screen'?850+3*qty:450+2*qty):0;
 $('#baseAmount').textContent=money(base);$('#logoAmount').textContent=money(extra);$('#totalAmount').textContent=money(base+extra);
 $('#logoFeeLabel').textContent=printMethod==='screen'?'ค่าสกรีนโลโก้ (สมมติ)':'ค่าสติกเกอร์ (สมมติ)';
 $('#mockupLabel').textContent=withLogo?(printMethod==='screen'?'สกรีนลงเนื้อวัสดุ':'ติดสติกเกอร์แบรนด์'):'ถ้วยเปล่า · ไม่ใส่โลโก้';
 $('#mockupProductTitle').textContent=customData[type].name;
 $('#mockupDesc').textContent=type==='bowl'?'ภาพถ้วยใบตองตึงพร้อมตำแหน่งโลโก้จำลอง':'ภาพตัวอย่างวิธีวางโลโก้บนถ้วยใบตองตึง เพื่อประกอบการสั่งผลิตสินค้าอื่น';
 renderBowl();return{type,qty,size,logo:withLogo,method:printMethod,price,base,extra,total:base+extra};
}
['customProduct','customSize','customQty','addLogo'].forEach(id=>$('#'+id).addEventListener('input',customEstimate));
$$('[data-print]').forEach(b=>b.onclick=()=>{
 printMethod=b.dataset.print;$$('[data-print]').forEach(x=>{x.classList.toggle('is-on',x===b);x.setAttribute('aria-pressed',String(x===b))});
 $('#addLogo').checked=true;customEstimate();
});
for(const id of ['logoScale','logoMoveX','logoMoveY'])$('#'+id).addEventListener('input',()=>{$('#logoScaleOutput').textContent=$('#logoScale').value+'%';renderBowl()});
$('#resetLogoPosition').onclick=()=>{for(const id of ['logoMoveX','logoMoveY'])$('#'+id).value='0';$('#logoScale').value='90';$('#logoScaleOutput').textContent='90%';renderBowl()};
$('#downloadMockup').onclick=()=>{
 renderBowl();const link=document.createElement('a');link.href=previewCanvas.toDataURL('image/png');link.download='Lanna-EcoSync-Bowl-Mockup.png';link.click();toast('บันทึกภาพตัวอย่างแล้ว');
};
$('#clientLogo').onchange=e=>{
 const f=e.target.files?.[0];if(logoURL){URL.revokeObjectURL(logoURL);logoURL=''}
 customLogo=null;if(!f){customEstimate();return}
 if(f.size>2*1024*1024||!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(f.type)){toast('รองรับ PNG, JPG, WebP, SVG ไม่เกิน 2 MB');e.target.value='';customEstimate();return}
 logoURL=URL.createObjectURL(f);const img=new Image();img.onload=()=>{customLogo=img;$('#addLogo').checked=true;customEstimate();toast('อัปเดตตัวอย่างโลโก้บนถ้วยแล้ว')};img.onerror=()=>{toast('อ่านไฟล์โลโก้ไม่ได้');URL.revokeObjectURL(logoURL);logoURL='';customEstimate()};img.src=logoURL;
};
$('#customForm').onsubmit=e=>{
 e.preventDefault();if(!gate())return;const est=customEstimate();
 const o={id:uid('c'),userId:user().id,productName:customData[est.type].name,quantity:est.qty,size:est.size,withLogo:est.logo,logoName:$('#clientLogo').files[0]?.name||'โลโก้ตัวอย่าง Lanna EcoSync',position:'ถ้วยด้านหน้า',method:est.logo?printMethod:'none',note:$('#customNotes').value.trim(),estimate:est.total,date:timeNow(),status:'รอเสนอราคา'};
 db.custom.unshift(o);persist();refresh();toast('บันทึกคำขอสั่งผลิต B2B ทดลองแล้ว');
};
customEstimate();
}
const carbonRates={tray:.12,plate:.08,gift:.18};
if($('#carbonProduct')){
function calculateCarbon(){const type=$('#carbonProduct').value,qty=Math.max(0,Number($('#carbonQty').value)||0),rate=carbonRates[type];$('#carbonResult').textContent=(rate*qty).toLocaleString('th-TH',{maximumFractionDigits:2,minimumFractionDigits:1});$('#carbonFactor').textContent=`อัตราสมมติ ${rate} kgCO₂e ต่อชิ้น · ไม่ใช่ข้อมูลตรวจวัด`;return {type,qty,rate,total:rate*qty}}
$('#carbonProduct').onchange=calculateCarbon;$('#carbonQty').oninput=calculateCarbon;
$('#exportCarbon').onclick=()=>{const o=calculateCarbon();const text=`Lanna EcoSync | ตัวอย่างรายงานการลดคาร์บอน\nประเภทสินค้า: ${customData[o.type].name}\nจำนวน: ${o.qty}\nตัวเลขการลดตามสมมติฐาน: ${o.total} kgCO2e\nสมมติฐานต่อหน่วย: ${o.rate} kgCO2e\n\nสำคัญ: เอกสารนี้เป็นผลจำลอง ไม่ใช่ใบรับรอง ESG หรือ Carbon Credit`;const blob=new Blob([text],{type:'text/plain;charset=utf-8'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Lanna-EcoSync-Carbon-Demo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};

calculateCarbon();
}
// One shared dryer in this offline prototype; pending bookings also hold the timeslot.
const ALL_SLOTS=['09:00–12:00','13:00–16:00','16:00–19:00'];
const BUSY_STATUSES=['รอยืนยัน','รออนุมัติ','อนุมัติแล้ว','ยืนยันทดลองแล้ว','กำลังใช้งาน'];
let slotSelected='09:00–12:00';
const dateInput=$('#bookingDate');
function localISO(date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
function startOfToday(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
const today=startOfToday();if(dateInput)dateInput.min=localISO(today);
let selectedDate=localISO(today),calendarView=new Date(today.getFullYear(),today.getMonth(),1);
function activeBooking(b){return BUSY_STATUSES.includes(b.status)}
function slotBusy(date,slot,excludeId=''){return db.bookings.some(b=>b.id!==excludeId&&b.date===date&&b.slot===slot&&activeBooking(b))}
function isDateFull(date){return ALL_SLOTS.every(slot=>slotBusy(date,slot))}
function renderCalendar(){
 if(!dateInput)return;
 $('#calendarMonth').textContent=calendarView.toLocaleDateString('th-TH',{month:'long',year:'numeric'});
 const grid=$('#calendarDays');grid.innerHTML='';
 const before=new Date(calendarView.getFullYear(),calendarView.getMonth(),1).getDay();
 for(let i=0;i<before;i++){const el=document.createElement('span');el.className='calendar-empty';grid.appendChild(el)}
 const end=new Date(calendarView.getFullYear(),calendarView.getMonth()+1,0).getDate();
 for(let day=1;day<=end;day++){
  const d=new Date(calendarView.getFullYear(),calendarView.getMonth(),day),iso=localISO(d),past=d<today,full=isDateFull(iso);
  const btn=document.createElement('button');btn.type='button';btn.className='calendar-day';btn.textContent=String(day);
  if(iso===selectedDate)btn.classList.add('selected');if(full)btn.classList.add('full');
  btn.disabled=past;btn.title=past?'วันที่ผ่านมาแล้ว':full?'เต็มทุกช่วงเวลา':'ยังมีเวลาว่าง';
  btn.setAttribute('aria-label',`${day} ${$('#calendarMonth').textContent}${full?' เต็มแล้ว':' ยังมีคิวว่าง'}`);
  btn.onclick=()=>{selectedDate=iso;dateInput.value=iso;renderCalendar();renderSlots()};grid.appendChild(btn);
 }
 const prevMonthEnd=new Date(calendarView.getFullYear(),calendarView.getMonth()+1,0);
 $('#calendarPrev').disabled=prevMonthEnd<today;
}
function renderSlots(){
 if(!dateInput)return;
 if(!selectedDate){dateInput.value='';return}
 const free=ALL_SLOTS.filter(slot=>!slotBusy(selectedDate,slot));
 if(!free.includes(slotSelected))slotSelected=free[0]||'';
 $$('#slots .slot').forEach(btn=>{let busy=slotBusy(selectedDate,btn.dataset.slot);btn.disabled=busy;btn.classList.toggle('is-on',slotSelected===btn.dataset.slot&&!busy);btn.title=busy?'ช่วงเวลานี้มีการจองแล้ว':'ยังจองได้';btn.setAttribute('aria-pressed',String(slotSelected===btn.dataset.slot&&!busy));});
 $('#bookingSubmit').disabled=free.length===0;
 $('#slotAvailability').textContent=free.length?`วันที่ ${new Date(selectedDate+'T12:00').toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'})} · ว่าง ${free.length} ช่วงเวลา`:'วันนี้เต็มแล้ว กรุณาเลือกวันอื่น';
}
$$('#slots .slot').forEach(b=>b.onclick=()=>{if(b.disabled)return;slotSelected=b.dataset.slot;renderSlots()});
if($('#calendarPrev'))$('#calendarPrev').onclick=()=>{calendarView=new Date(calendarView.getFullYear(),calendarView.getMonth()-1,1);renderCalendar()};
if($('#calendarNext'))$('#calendarNext').onclick=()=>{calendarView=new Date(calendarView.getFullYear(),calendarView.getMonth()+1,1);renderCalendar()};
if(dateInput)dateInput.addEventListener('change',()=>{
 if(!dateInput.value)return;
 const parsed=new Date(dateInput.value+'T12:00');if(parsed<today){toast('ไม่สามารถจองวันที่ผ่านมาแล้ว');dateInput.value=selectedDate;return}
 selectedDate=dateInput.value;calendarView=new Date(parsed.getFullYear(),parsed.getMonth(),1);renderCalendar();renderSlots();
});
if($('#bookingForm'))$('#bookingForm').onsubmit=e=>{
 e.preventDefault();if(!gate())return;
 const date=dateInput.value,name=$('#bookingName').value.trim(),purpose=$('#bookingPurpose').value,kg=Number($('#bookingWeight').value),notes=$('#bookingNotes').value.trim();
 if(!name||!date||!Number.isFinite(kg)||kg<1){toast('กรุณากรอกข้อมูลจองให้ครบ');return}
 if(date<localISO(today)){toast('เลือกวันที่ตั้งแต่วันนี้เป็นต้นไป');return}
 if(!slotSelected||slotBusy(date,slotSelected)){toast('ช่วงเวลานี้ไม่ว่างแล้ว กรุณาเลือกช่วงใหม่');renderSlots();return}
 const req={id:uid('b'),userId:user().id,name,date,slot:slotSelected,purpose,weightKg:kg,notes,status:'รอยืนยัน',createdAt:new Date().toISOString()};
 db.bookings.unshift(req);persist();$('#bookingName').value='';$('#bookingNotes').value='';$('#bookingWeight').value='30';
 renderCalendar();renderSlots();refresh();toast('บันทึกคำขอจองแล้ว รอผู้ขายอนุมัติ');
};
function cancelOwnBooking(id){const u=user();const b=db.bookings.find(v=>v.id===id&&v.userId===u?.id);if(!b||!['รอยืนยัน','รออนุมัติ','อนุมัติแล้ว','ยืนยันทดลองแล้ว'].includes(b.status))return;
 if(!confirm('ยืนยันยกเลิกคำขอจองนี้?'))return;
 b.status='ยกเลิก';persist();refresh();toast('ยกเลิกคำขอและคืนคิวแล้ว');
}
function renderBookings(){
 if(!$('#bookingList'))return;
 const u=user(),list=$('#bookingList'),arr=u?db.bookings.filter(b=>b.userId===u.id):[];
 list.innerHTML=arr.length?arr.slice(0,10).map(b=>`<div class="record booking-record"><div><strong>${esc(b.purpose)}</strong><small>${esc(b.date)} · ${esc(b.slot)} · ${esc(b.weightKg||'—')} กก.</small><span class="status-pill">${esc(b.status)}</span></div>${['รอยืนยัน','รออนุมัติ','อนุมัติแล้ว','ยืนยันทดลองแล้ว'].includes(b.status)?`<button type="button" class="booking-cancel" data-cancel-booking="${esc(b.id)}">ยกเลิกคิว</button>`:''}</div>`).join(''):'<p class="empty-record">เข้าสู่ระบบเพื่อดูรายการจองและสถานะอนุมัติของคุณ</p>';
 $$('[data-cancel-booking]',list).forEach(btn=>btn.onclick=()=>cancelOwnBooking(btn.dataset.cancelBooking));
 renderCalendar();renderSlots();if(isSeller())renderAdminBookings();
}
function updateBooking(id,action){
 if(!isSeller())return;
 const b=db.bookings.find(v=>v.id===id);if(!b)return;
 const transitions={'approve':[['รอยืนยัน','รออนุมัติ'],'อนุมัติแล้ว'],'reject':[['รอยืนยัน','รออนุมัติ'],'ปฏิเสธ'],'start':[['อนุมัติแล้ว','ยืนยันทดลองแล้ว'],'กำลังใช้งาน'],'complete':[['กำลังใช้งาน'],'เสร็จสิ้น'],'cancel':[['รอยืนยัน','รออนุมัติ','อนุมัติแล้ว','ยืนยันทดลองแล้ว','กำลังใช้งาน'],'ยกเลิก']};
 const t=transitions[action];if(!t||!t[0].includes(b.status)){toast('ไม่สามารถเปลี่ยนสถานะนี้ได้');return}
 if(action==='approve'&&slotBusy(b.date,b.slot,b.id)){toast('มีคิวชนกัน ไม่สามารถอนุมัติได้');return}
 b.status=t[1];persist();refresh();toast('อัปเดตสถานะโรงอบแล้ว');
}
function renderAdminBookings(){
 const wrap=$('#adminBookingList');if(!wrap)return;
 const bookings=[...db.bookings].sort((a,b)=>a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot));
 wrap.innerHTML=bookings.length?bookings.map(b=>{
  const opts= ['รอยืนยัน','รออนุมัติ'].includes(b.status)?[['approve','อนุมัติ'],['reject','ปฏิเสธ']]:['อนุมัติแล้ว','ยืนยันทดลองแล้ว'].includes(b.status)?[['start','เริ่มใช้งาน'],['cancel','ยกเลิก']]:b.status==='กำลังใช้งาน'?[['complete','เสร็จสิ้น'],['cancel','ยกเลิก']]:[];
  return `<article class="booking-admin-row"><div><strong>${esc(b.name)} · ${esc(b.purpose)}</strong><small>${esc(b.date)} | ${esc(b.slot)} | ${esc(b.weightKg||'—')} กก.</small>${b.notes?`<small>${esc(b.notes)}</small>`:''}<span class="status-pill">${esc(b.status)}</span></div><div class="booking-admin-buttons">${opts.map(([act,label])=>`<button type="button" data-booking-action="${act}" data-booking-id="${esc(b.id)}">${label}</button>`).join('')}</div></article>`;
 }).join(''):'<p class="empty-record">ยังไม่มีคำขอจองโรงอบ</p>';
 $$('[data-booking-action]',wrap).forEach(btn=>btn.onclick=()=>updateBooking(btn.dataset.bookingId,btn.dataset.bookingAction));
}
if(dateInput){dateInput.value=selectedDate;renderCalendar();renderSlots();}
function renderAdmin(){if(!isSeller()||!$('#inventoryList'))return;
  const list=$('#inventoryList');list.innerHTML=db.products.filter(p=>!p.archived).map(p=>`<div class="stock-row"><div><strong>${esc(p.name)}</strong><small>${money(p.price)} / ${esc(p.unit)} · ${p.kind==='agri'?'สินค้าเกษตร':'งานคราฟต์'}</small></div><div class="stock-actions"><button type="button" data-stock="${esc(p.id)}" data-delta="-1" aria-label="ลดสต็อก">−</button><output>${p.stock}</output><button type="button" data-stock="${esc(p.id)}" data-delta="1" aria-label="เพิ่มสต็อก">+</button><button type="button" class="edit" data-edit="${esc(p.id)}">แก้ไข</button><button type="button" class="delete" data-archive="${esc(p.id)}" aria-label="ซ่อนสินค้า">×</button></div></div>`).join('');
  $$('[data-stock]',list).forEach(b=>b.onclick=()=>{const p=db.products.find(x=>x.id===b.dataset.stock);if(!p)return;p.stock=Math.max(0,p.stock+Number(b.dataset.delta));persist();refresh();toast('อัปเดตสต็อกแล้ว')});
  $$('[data-edit]',list).forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));
  $$('[data-archive]',list).forEach(b=>b.onclick=()=>{if(!window.confirm('ซ่อนสินค้านี้จากหน้าตลาดทดลอง?'))return;const p=db.products.find(x=>x.id===b.dataset.archive);if(p){p.archived=true;persist();refresh();toast('ซ่อนสินค้าแล้ว')}});
  const requests=[...db.orders.map(o=>({...o,kind:'order'})),...db.custom.map(o=>({...o,kind:'custom'}))];
  requests.sort((a,b)=>b.id.localeCompare(a.id));
  $('#sellerRequests').innerHTML=requests.length?requests.slice(0,12).map(o=>`<div class="record"><div><strong>${esc(o.productName||o.purpose)}</strong><small>${o.kind==='order'?'สินค้า':o.kind==='custom'?'B2B':'โรงอบ'} · ${esc(o.quantity||'')} ${esc(o.date)} · ${esc(o.status)}</small></div>${['รอผู้ขายอนุมัติ','รอเสนอราคา','รอยืนยัน'].includes(o.status)?`<div class="record-actions"><button data-approve="${esc(o.kind)}" data-id="${esc(o.id)}">รับเรื่อง</button><button data-reject="${esc(o.kind)}" data-id="${esc(o.id)}">ปฏิเสธ</button></div>`:''}</div>`).join(''):'<p class="empty-record">ยังไม่มีคำขอทดลอง</p>';
  $$('[data-approve]').forEach(b=>b.onclick=()=>processRequest(b.dataset.approve,b.dataset.id,true));
  $$('[data-reject]').forEach(b=>b.onclick=()=>processRequest(b.dataset.reject,b.dataset.id,false));
}
function processRequest(kind,id,approve){if(!isSeller())return;const arr=kind==='order'?db.orders:kind==='custom'?db.custom:db.bookings;const r=arr.find(x=>x.id===id);if(!r)return;
  if(approve&&kind==='order'){
    const product=db.products.find(p=>p.id===r.productId);
    if(!product||product.stock<r.quantity){toast('สต็อกไม่พอ กรุณาปรับจำนวนก่อน');return}
    product.stock-=r.quantity;
  }
  r.status=approve?(kind==='order'?'อนุมัติแล้ว':kind==='custom'?'รับเรื่องแล้ว':'อนุมัติแล้ว'):'ปฏิเสธ';persist();refresh();toast(approve?'อัปเดตสถานะคำขอแล้ว':'ปฏิเสธคำขอแล้ว')
}
function editProduct(id){const p=db.products.find(x=>x.id===id);if(!p||!isSeller())return;dialog(`<h2 id="dialogTitle">แก้ไขสินค้า</h2><form id="editForm"><div class="field"><label for="editName">ชื่อสินค้า</label><input id="editName" required value="${esc(p.name)}"></div><div class="fields-2"><div class="field"><label for="editPrice">ราคา</label><input id="editPrice" type="number" min="1" required value="${p.price}"></div><div class="field"><label for="editStock">สต็อก</label><input id="editStock" type="number" min="0" required value="${p.stock}"></div></div><button class="solid full">บันทึกการแก้ไข</button></form>`);$('#editForm').onsubmit=e=>{e.preventDefault();p.name=$('#editName').value.trim();p.price=Number($('#editPrice').value);p.stock=Number($('#editStock').value);if(!p.name||p.price<=0||p.stock<0){toast('ตรวจสอบข้อมูลสินค้า');return}persist();closeDialog();refresh();toast('แก้ไขสินค้าแล้ว')}}
if($('#addProductForm'))$('#addProductForm').onsubmit=e=>{e.preventDefault();if(!isSeller())return;const name=$('#newProductName').value.trim(),price=Number($('#newProductPrice').value),stock=Number($('#newProductStock').value);if(!name||price<=0||stock<0||!Number.isInteger(stock)){toast('กรุณากรอกข้อมูลสินค้าให้ถูกต้อง');return}db.products.unshift({id:uid('p'),name,description:'สินค้าใหม่ที่เพิ่มผ่านหลังบ้านทดลอง',kind:$('#newProductCategory').value,price,stock,unit:'ชิ้น',badge:'NEW',image:$('#newProductImage').value});persist();e.target.reset();refresh();toast('เพิ่มสินค้าใหม่แล้ว')};
$('#menuToggle').onclick=()=>{let nav=$('#mainNav');const open=nav.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open))};
$$('#mainNav a').forEach(a=>a.onclick=()=>{$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')});
$('#year').textContent=new Date().getFullYear();
refresh();

if($('#sellerLoginButton'))$('#sellerLoginButton').addEventListener('click',()=>loginView('login'));
