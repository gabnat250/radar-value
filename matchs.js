(function(){
var S=null,LG={'Premier League':'P','La Liga':'E','Serie A':'I','Bundesliga':'B','Ligue 1':'F'};
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
function ord(r){return r===1?'1er':r+'e'}
function f2(x){return x.toLocaleString('fr-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function line(r){return '<b>'+esc(r.team.replace(/ (FC|AFC|CF)$/,''))+'</b> : '+ord(r.rank)+', '+r.pts+' pts, '+f2(r.gf/r.played)+' marqués et '+f2(r.ga/r.played)+' encaissés par match'}
function enrich(){
  var L=document.getElementById('ml');if(!S||!L)return;
  L.querySelectorAll('.row').forEach(function(row){
    if(row.getAttribute('data-e'))return;row.setAttribute('data-e','1');
    var meta=row.querySelector('.meta'),nm=row.querySelector('.name');if(!meta||!nm)return;
    var key=LG[meta.textContent.split(',')[0].trim()],T=key&&S.leagues&&S.leagues[key];if(!T)return;
    var p=nm.textContent.split(' vs ');if(p.length!==2)return;
    var h=find(p[0],T),a=find(p[1],T);if(!h||!a||!h.played||!a.played)return;
    meta.insertAdjacentHTML('afterend','<div class="meta" style="margin:2px 0 4px">'+line(h)+'<br>'+line(a)+'</div>');
  });
}
var L=document.getElementById('ml');
if(L)new MutationObserver(enrich).observe(L,{childList:true});
fetch('stats.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){S=j;enrich()}).catch(function(){});
})();
