'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "637a1e24686e819685a9767ee925ae62",
"assets/FontManifest.json": "339820700b4951e17c6bd86b8bf4a986",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "1aea4dbecf1077f326ff42bbbbc68e10",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "b00363533ebe0bfdb95f3694d7647f6d",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "0a94bab8e306520dc6ae14c2573972ad",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "9cda082bd7cc5642096b56fa8db15b45",
"assets/res/assets/fonts/iran_nastaliq.ttf": "8d7d8fa0b9ddb8ec258ad6b8b9b6d254",
"assets/res/assets/fonts/iran_sans.ttf": "bab5e043e4fc4bcce51699f943003c85",
"assets/res/assets/images/dummy_user.png": "bdd9aaee8c129b1d0a7180512c6f7ae5",
"assets/res/assets/images/dummy_user_women.jpg": "d5da980ca1c88105be0a453595c028a0",
"assets/res/assets/images/intro/01.png": "8fbfb83ba8f45a44a2c154c20b1ef393",
"assets/res/assets/images/intro/02.png": "3ab9e8fb2a9e45428735c8e989450cf3",
"assets/res/assets/images/intro/03.png": "d0671c2b40e2abb6f7c2e703f1d119d4",
"assets/res/assets/images/intro/04.png": "c8ff09aa609427c2c86c79a8aafe5940",
"assets/res/assets/images/intro/05.png": "3dfe0ad8ff560c1a552a7c549d60e92b",
"assets/res/assets/images/intro/06.png": "19b5266cb5614768df1ac2e1f83f4a97",
"assets/res/assets/images/intro/07.png": "c4ddc813bbda6c5481f6df18e9047b46",
"assets/res/assets/images/intro/08.png": "0fd8dc13846d23d755b8fd7efba7fb91",
"assets/res/assets/images/intro/09.png": "7d3280c8997a3ba9dd22e0c2beba27c6",
"assets/res/assets/images/intro/10.png": "8a422d6e209f8801d579344711c4867f",
"assets/res/assets/images/intro/11.png": "52fe4fc471c58b0f424c8c4df2fdac5d",
"assets/res/assets/images/intro/12.png": "78820bb6925ddb2cd54f9f1a1039da51",
"assets/res/assets/images/intro/13.png": "093464a25de4eb27b3ce348f1e5f33cd",
"assets/res/assets/images/logo.png": "50819f82dbbf16e015d09990f0431d13",
"assets/res/assets/images/logo_dark.png": "9a6535f65f4e1993a7a680f5f8b00077",
"assets/res/assets/images/no_image.jpg": "94c0c57d53b1ee9771925957f29d149c",
"favicon.png": "63dbed3ee0e781d9d410d1edc38bc540",
"icons/Icon-192.png": "84def77307f01e499db258bc1cb3feda",
"icons/Icon-512.png": "d2d36b6e6ec9848361f75180a6f1d2b5",
"icons/Icon-maskable-192.png": "84def77307f01e499db258bc1cb3feda",
"icons/Icon-maskable-512.png": "d2d36b6e6ec9848361f75180a6f1d2b5",
"index.html": "1b2db1af08cebe8cf9678d5492953ccc",
"/": "1b2db1af08cebe8cf9678d5492953ccc",
"main.dart.js": "aa812c27a19943e8eabec33e1d7f2da8",
"manifest.json": "6818dc0048f086a6849c17ab04b5b189",
"version.json": "9ae991499c16d0396b9a0b7788c4d7a4"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
