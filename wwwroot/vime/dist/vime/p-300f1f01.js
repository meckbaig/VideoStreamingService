import{g as t}from"./p-aa8acb66.js";import{j as s,e}from"./p-b018976f.js";const n=new Map(Object.entries({vime:t=>`https://cdn.jsdelivr.net/npm/@vime/core@latest/icons/vime/vm-${t}.svg`,material:t=>`https://cdn.jsdelivr.net/npm/@vime/core@latest/icons/material/md-${t}.svg`})),a=new Set;function i(e){const n=t(e);s(e,(()=>{a.add(n)}),(()=>{a.delete(n)}))}const o=t=>n.get(t);function c(t,s){e(s)||n.set(t,s),a.forEach((s=>{s.library===t&&s.redraw()}))}function m(t){n.delete(t)}export{m as d,o as g,c as r,i as w}