/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
import { registerRoute, Route } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: __WB_MANIFEST is a placeholder filled by workbox-webpack-plugin with the list of dependencies to be cached
precacheAndRoute(self.__WB_MANIFEST);

// A new route that matches same-origin image/stylesheet requests and handles
// them with the cache-first, falling back to network strategy:
const imageRoute = new Route(({ request }) => {
  return request.destination === 'image' || request.destination === 'style'
}, new CacheFirst({
  cacheName: 'imagesAndStyles'
}));

// Register the new route
registerRoute(imageRoute);

// A new route that matches .html/.xml and handles
// them with the network-first, falling back to cache strategy:
const htmlAndXmlRoute = new Route(({ request }) => {
  return request.destination === 'document'
}, new NetworkFirst({
  cacheName: 'htmlAndMechanics'
}));

// Register the new route
registerRoute(htmlAndXmlRoute);

// A new route that matches fonts and handles
// them with the cache-first, falling back to cache strategy:
const fontsRoute = new Route(({ request }) => {
  return request.destination === 'font'
}, new CacheFirst({
  cacheName: 'fonts'
}));

// Register the new route
registerRoute(fontsRoute);
  
// A new route that matches javascript and handles
// them with the cache-first, falling back to cache strategy:
const extJsRoute = new Route(({ request }) => {
  return request.destination === 'script'
}, new CacheFirst({
  cacheName: 'extJs'
}));

// Register the new route
registerRoute(extJsRoute);

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


  