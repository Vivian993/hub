const DEMO_STATIONS=[
 {id:"aimall",name:"愛買附近站牌",distance:"約 2 分鐘",routes:["示範路線 A","示範路線 B"],direction:"往桃園農工方向"},
 {id:"longan",name:"龍安街附近站牌",distance:"約 5 分鐘",routes:["示範路線 A"],direction:"往桃園農工方向"},
 {id:"school",name:"桃園農工／成功路附近",distance:"—",routes:["示範路線 A"],direction:"往市區方向"},
 {id:"other",name:"附近另一站牌",distance:"約 7 分鐘",routes:["示範路線 C"],direction:"往桃園方向"}
];

const TIMETABLE=[
 {time:"15:50",route:"示範路線 A",board:"愛買附近站牌",direction:"往桃園農工方向",alight:"桃園農工／成功路附近"},
 {time:"16:10",route:"示範路線 A",board:"愛買附近站牌",direction:"往桃園農工方向",alight:"桃園農工／成功路附近"},
 {time:"16:25",route:"示範路線 A",board:"愛買附近站牌",direction:"往桃園農工方向",alight:"桃園農工／成功路附近",recommended:true},
 {time:"16:45",route:"示範路線 A",board:"愛買附近站牌",direction:"往桃園農工方向",alight:"桃園農工／成功路附近"},
 {time:"17:05",route:"示範路線 A",board:"桃園農工／成功路附近",direction:"往愛買方向",alight:"愛買附近站牌"},
 {time:"17:25",route:"示範路線 A",board:"桃園農工／成功路附近",direction:"往愛買方向",alight:"愛買附近站牌"}
];

const KEY="busHelperFavorites";
let favorites=JSON.parse(localStorage.getItem(KEY)||"[]");
let currentMode="school";

const $=id=>document.getElementById(id);
function todayText(){const d=new Date();const w=["日","一","二","三","四","五","六"];return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${w[d.getDay()]}`;}
$("dateText").textContent=todayText();

function nextBus(mode="school"){
 const now=new Date(); const mins=now.getHours()*60+now.getMinutes();
 const rows=TIMETABLE.filter(x=>{
   const [h,m]=x.time.split(":").map(Number); const t=h*60+m;
   return t>=mins && (mode==="school" ? x.direction.includes("桃園農工") : x.direction.includes("愛買"));
 });
 return rows[0]||null;
}
function renderNext(mode){
 currentMode=mode;
 const bus=nextBus(mode);
 $("greeting").textContent=mode==="school"?"準備去學校囉！":"準備回家囉！";
 if(!bus){$("nextRide").innerHTML='<div class="ride-detail">今天沒有可用的示範班次</div>';return;}
 $("nextRide").innerHTML=`<div class="route-number">${bus.route}</div><div><div class="ride-time">${bus.time}</div><div class="ride-detail">${bus.recommended?"⭐ 建議搭乘｜":""}下一班可搭班次</div></div>`;
 $("boardStop").textContent=bus.board;$("direction").textContent=bus.direction;$("alightStop").textContent=bus.alight;
}
renderNext("school");

function openModal(title,body){$("modalTitle").textContent=title;$("modalBody").innerHTML=body;$("modal").classList.remove("hidden");$("modal").setAttribute("aria-hidden","false");}
function closeModal(){$("modal").classList.add("hidden");$("modal").setAttribute("aria-hidden","true");}
$("closeModal").onclick=closeModal;
$("modal").onclick=e=>{if(e.target===$("modal"))closeModal();};

function stationHTML(s){
 const fav=favorites.includes(s.id);
 return `<div class="station"><div class="station-row"><div><div class="station-name">🚌 ${s.name}</div><div class="station-meta">🚶 ${s.distance}　｜　${s.routes.join("、")}</div><div class="station-meta">➡️ ${s.direction}</div></div><button class="heart" onclick="toggleFav('${s.id}')">${fav?"❤️":"♡"}</button></div><button class="secondary full" style="margin-top:10px" onclick="showStation('${s.id}')">查看班次</button></div>`;
}
window.toggleFav=function(id){
 favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];
 localStorage.setItem(KEY,JSON.stringify(favorites));
 showNearby();
};
window.showStation=function(id){
 const s=DEMO_STATIONS.find(x=>x.id===id);
 const rows=TIMETABLE.filter(x=>x.board===s.name||x.alight===s.name);
 openModal(`🚌 ${s.name}`,rows.length?rows.map(x=>`<div class="time-row"><div><b>${x.time}</b><br><small>${x.direction}</small></div><span>${x.route}</span></div>`).join(""):`<p class="muted">目前沒有示範班次資料。</p>`);
};

function showNearby(){
 openModal("📍 附近站牌",`<p class="muted">以下為 V1 示範資料。正式版會改由桃園市公車資料服務提供站牌與即時資訊。</p>${DEMO_STATIONS.map(stationHTML).join("")}`);
}
function showFavorites(){
 const list=DEMO_STATIONS.filter(s=>favorites.includes(s.id));
 openModal("❤️ 我的常用站牌",list.length?list.map(stationHTML).join(""):'<p class="muted">目前還沒有收藏。到「附近站牌」按 ♡ 就可以加入。</p>');
}
function showToday(){
 openModal("📅 今天班次",`<p class="muted">去學校與回家方向的示範班次。</p>${TIMETABLE.map(x=>`<div class="time-row ${x.recommended?"recommended":""}"><div><b>${x.time}</b> ${x.recommended?"⭐":""}<br><small>${x.board} → ${x.alight}</small></div><span>${x.route}</span></div>`).join("")}`);
}
function showRoutes(){
 openModal("⭐ 我的常用路線",`<div class="station"><div class="station-name">🏫 家附近 → 桃園農工</div><div class="station-meta">目前起點可從附近站牌選擇。</div><button class="primary full" style="margin-top:10px" onclick="renderNext('school');closeModal()">查看下一班</button></div><div class="station"><div class="station-name">🏠 桃園農工 → 家附近</div><div class="station-meta">回程自動尋找往愛買方向的班次。</div><button class="primary full" style="margin-top:10px" onclick="renderNext('home');closeModal()">查看下一班</button></div>`);
}
function settings(){
 openModal("⚙️ 家長設定",`<div class="setting"><label>🏫 學校目的地</label><input value="桃園農工／成功路附近" id="schoolInput"></div><div class="setting"><label>🏠 常用家附近站牌</label><input value="愛買附近站牌" id="homeInput"></div><div class="setting"><label>🔔 提前提醒（分鐘）</label><input type="number" value="15" id="alertInput"></div><button class="primary full" onclick="saveSettings()">儲存設定</button><p class="muted">V1 先將設定保存在這台裝置。正式版可再加入家長模式與雲端同步。</p>`);
}
window.saveSettings=function(){localStorage.setItem("busSchool",$("schoolInput").value);localStorage.setItem("busHome",$("homeInput").value);localStorage.setItem("busAlert",$("alertInput").value);closeModal();alert("設定已儲存");};

$("schoolBtn").onclick=()=>renderNext("school");
$("homeBtn").onclick=()=>renderNext("home");
$("nearbyBtn").onclick=showNearby;
$("todayBtn").onclick=showToday;
$("favoritesBtn").onclick=showFavorites;
$("routesBtn").onclick=showRoutes;
$("settingsBtn").onclick=settings;
$("rideBtn").onclick=()=>openModal("🚌 這就是你要搭的公車",`<div class="recommended"><h3>⭐ 請確認</h3><p>上車：<b>${$("boardStop").textContent}</b></p><p>方向：<b>${$("direction").textContent}</b></p><p>下車：<b>${$("alightStop").textContent}</b></p></div><button class="primary full" onclick="closeModal()">知道了</button>`);

$("locateBtn").onclick=()=>{
 if(!navigator.geolocation){$("locationStatus").textContent="此裝置不支援定位";return;}
 $("locationStatus").textContent="正在取得位置…";
 navigator.geolocation.getCurrentPosition(
  p=>$("locationStatus").textContent=`已定位（${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}）`,
  ()=>$("locationStatus").textContent="定位失敗，請確認已允許定位"
 );
};

document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>{
 document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));n.classList.add("active");
 if(n.dataset.target==="nearby")showNearby();
 if(n.dataset.target==="favorites")showFavorites();
 if(n.dataset.target==="home")window.scrollTo({top:0,behavior:"smooth"});
});

if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
