import{I as n}from"./p-d84b1c8a.js";import{m as e,n as o,h as r,o as t,e as c,p as s}from"./p-b018976f.js";const i=(n,e=1)=>new Promise(((o,r)=>{const t=new Image,c=()=>{delete t.onload,delete t.onerror,t.naturalWidth>=e?o(t):r(t)};Object.assign(t,{onload:c,onerror:c,src:n})})),d=(n,e,o=s)=>{var r;const t=document.createElement("script");t.src=n,t.onload=e,t.onerror=o;const c=document.getElementsByTagName("script")[0];null===(r=c.parentNode)||void 0===r||r.insertBefore(t,c)},w=n=>{var t;if(!o(t=n)&&(e(t)||r(t)&&t.startsWith("{")))return(n=>e(n)?n:function(n){if(r(n))try{return JSON.parse(n)}catch(n){return}}(n))(n)},u=(e,o="")=>{if(!n)return o;try{return window.decodeURIComponent(e)}catch(n){return o}},a=/(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g,f=(e,o="preconnect",r)=>{if(!n)return!1;const t=document.createElement("link");return t.rel=o,t.href=e,c(r)||(t.as=r),t.crossOrigin="true",document.head.append(t),!0},m=(n,r)=>((n,e)=>{if(c(e)||0===e.length)return n;const o=n.split("?",2);return o[0]+(c(o[1])?`?${e}`:`?${o[1]}&${e}`)})(n,e(r)?(n=>{const e=[],r=(n,o)=>{e.push(`${encodeURIComponent(n)}=${encodeURIComponent(o)}`)};return Object.keys(n).forEach((e=>{const c=n[e];o(c)||(t(c)?c.forEach((n=>r(e,n))):r(e,c))})),e.join("&")})(r):r),l=n=>{if(r(n))return(n=>{const e=Object.create(null);if(c(n))return e;let o;for(;o=a.exec(n);){const n=u(o[1],o[1]).replace("[]",""),c=r(o[2])?u(o[2].replace(/\+/g," "),o[2]):"",s=e[n];s&&!t(s)&&(e[n]=[s]),s?e[n].push(c):e[n]=c}return e})(n)},p={},j=(n,e,o,r=(()=>!0),t=d)=>{const s=n=>c(window[n])?window.exports&&window.exports[n]?window.exports[n]:window.module&&window.module.exports&&window.module.exports[n]?window.module.exports[n]:void 0:window[n],i=s(e);return i&&r(i)?Promise.resolve(i):new Promise(((r,i)=>{if(!c(p[n]))return void p[n].push({resolve:r,reject:i});p[n]=[{resolve:r,reject:i}];const d=e=>{p[n].forEach((n=>n.resolve(e)))};if(!c(o)){const n=window[o];window[o]=function(){c(n)||n(),d(s(e))}}t(n,(()=>{c(o)&&d(s(e))}),(e=>{p[n].forEach((n=>{n.reject(e)})),delete p[n]}))}))};export{w as a,i as b,m as c,l as d,j as l,f as p}