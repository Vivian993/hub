// 戰鬥陀螺對戰台 — 離線快取
// 這個檔案要跟 beyblade-vs.html 放在「同一個資料夾」才會生效。
//
// 之後如果你（或 Claude）又更新了 beyblade-vs.html，記得把下面這個版本號
// （CACHE_VERSION）改成不一樣的字串再重新上傳，手機才會知道要抓新版本，
// 不然瀏覽器可能會一直顯示舊的快取版本。
const CACHE_VERSION = 'beyblade-vs-v1';

// 只快取「這個網頁本身所在的資料夾」裡的檔案，用相對路徑寫，
// 這樣不管實際部署在哪個網址底下都能正確運作。
// 另外也預先快取字型和 QR Code 套件這兩個外部資源，這樣離線時
// 對戰／圖鑑／賽程／統計／我的這幾個分頁的畫面跟功能都能正常使用
// （只有「開啟外部連結」這種本來就需要連到別的網站的功能，離線時沒辦法用）。
const APP_SHELL = [
  './',
  './beyblade-vs.html',
  './custom-icon.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return Promise.all(
        APP_SHELL.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 網頁本身：先試著連網路拿最新版，連不到（離線）才改用快取裡存的版本。
// 外部資源（字型、QR code 套件等）：能連網路就順便更新快取，連不到就直接用快取，
// 都沒有快取的話就讓它失敗（畫面會少了字型或 QR code，但計分板本身仍可正常使用）。
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isAppFile = req.url.includes('beyblade-vs.html') || req.url.endsWith('/');

  if (isAppFile) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./beyblade-vs.html')))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
