(function(){
var S=null,flat=[],seen={};
var LG={'Premier League':'P','La Liga':'E','Serie A':'I','Bundesliga':'B','Ligue 1':'F','Ligue des champions':'C'};
var STOP='fc afc acf cf ac as ss ssc us sc sv fsv tsg rc rcd ud ca club de la le the of aj es ogc osc sco stade calcio cfc bc bv fk and'.split(' ');
function tk(s){
  s=s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/rennes/g,'rennais').replace(/[^a-z0-9 ]/g,' ');
  return s.split(/\s+/).filter(function(w){return w&&!/^\d+$/.test(w)&&STOP.indexOf(w)<0});
}
function same(a,b){return a===b||(Math.min(a.length,b.length)>=4&&(a.indexOf(b)===0||b.indexOf(a)===0))}
function score(a,b){var n=0;a.forEach(function(x){if(b.some(function(y){return same(x,y)}))n++});return n/Math.max(a.length,b.length)}
function find(name,T){
  var t=tk(name),best=null,b1=0,b2=0;
  T.forEach(function(r){var s=score(t,tk(r.team));if(s>b1){b2=b1;b1=s;best=r}else if(s>b2)b2=s});
  return b1>=.5&&b1>b2?best:null;
}
function crestFor(name,key){
  var T=key&&S.leagues[key],r=T&&find(name,T);
  if(r&&r.crest)return r.crest;
  r=find(name,flat);
  return r&&r.crest||null;
}
function img(url){
  if(!/^https:\/\//.test(url))return document.createTextNode('');
  var i=document.createElement('img');
  i.src=url;i.alt='';i.loading='lazy';i.referrerPolicy='no-referrer';
  i.style.cssText='width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:6px';
  i.onerror=function(){i.remove()};
  return i;
}
function rows(){
  var L=document.getElementById('ml');if(!S||!L)return;
  L.querySelectorAll('.row').forEach(function(row){
    if(row.getAttribute('data-l'))return;
    var nme=row.querySelector('.name'),meta=row.querySelector('.meta');if(!nme||!meta)return;
    var p=nme.textContent.split(' vs ');if(p.length!==2)return;
    row.setAttribute('data-l','1');
    var key=LG[meta.textContent.split(',')[0].trim()],c=[crestFor(p[0],key),crestFor(p[1],key)];
    if(!c[0]&&!c[1])return;
    nme.textContent='';
    [0,1].forEach(function(k){
      if(k)nme.appendChild(document.createTextNode(' vs '));
      if(c[k])nme.appendChild(img(c[k]));
      nme.appendChild(document.createTextNode(p[k]));
    });
  });
}
function table(){
  var s=document.getElementById('pE');if(!S||!s)return;
  s.querySelectorAll('table.eq tr').forEach(function(tr){
    var td=tr.children[1];if(!td||td.tagName!=='TD'||td.querySelector('img'))return;
    var c=crestFor(td.textContent,null);if(c)td.insertBefore(img(c),td.firstChild);
  });
}
var L=document.getElementById('ml');if(L)new MutationObserver(rows).observe(L,{childList:true});
var E=document.getElementById('pE');if(E)new MutationObserver(table).observe(E,{childList:true});
fetch('stats.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){
  S=j;
  Object.keys(j.leagues||{}).forEach(function(k){j.leagues[k].forEach(function(r){if(!seen[r.team]){seen[r.team]=1;flat.push(r)}})});
  rows();table();
}).catch(function(){});
})();
