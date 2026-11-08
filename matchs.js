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
function nm(t){return t.replace(/ (FC|AFC|CF)$/,'')}
function line(r){return '<b>'+esc(nm(r.team))+'</b> : '+ord(r.rank)+', '+r.pts+' pts, '+f2(r.gf/r.played)+' marqués et '+f2(r.ga/r.played)+' encaissés par match'}
function why(row,h,a,hn,an){
  var m=null;
  row.querySelectorAll('.meta').forEach(function(x){if(x.textContent.indexOf('Meilleure cote')>-1)m=x});
  if(!m)return '';
  var best=null;
  m.textContent.split('Meilleure cote')[0].split(' · ').forEach(function(s){
    var x=s.trim().match(/^(.*) (\d+) %$/);
    if(x&&(!best||+x[2]>best.p))best={n:x[1].trim(),p:+x[2]};
  });
  if(!best||best.n==='Nul')return '';
  var homeFav=best.n===hn,F=homeFav?h:a,O=homeFav?a:h;
  var s='<b>'+esc(nm(F.team))+'</b> est favori'+(homeFav?' et joue à domicile.':' malgré le déplacement.');
  if(F.rank<O.rank){
    s+=' Il est '+ord(F.rank)+' au classement contre '+ord(O.rank)+', avec '+f2(F.pts/F.played)+' pts par match contre '+f2(O.pts/O.played)+'. Il marque '+f2(F.gf/F.played)+' buts par match et son adversaire en encaisse '+f2(O.ga/O.played)+'.';
  }else{
    s+=' Les stats de la saison avantagent plutôt '+esc(nm(O.team))+' ('+ord(O.rank)+' contre '+ord(F.rank)+'). Le marché tient peut-être compte de facteurs absents ici, comme les blessures ou la forme récente.';
  }
  s+=' Saison en cours : '+Math.min(F.played,O.played)+' matchs joués, donc ces chiffres bougent encore.';
  return '<div style="margin:6px 0 4px;padding:8px 10px;background:var(--bg);border-radius:10px;font-size:13px;color:var(--mute)">'+s+'</div>';
}
function enrich(){
  var L=document.getElementById('ml');if(!S||!L)return;
  L.querySelectorAll('.row').forEach(function(row){
    if(row.getAttribute('data-e'))return;row.setAttribute('data-e','1');
    var meta=row.querySelector('.meta'),nme=row.querySelector('.name');if(!meta||!nme)return;
    var key=LG[meta.textContent.split(',')[0].trim()],T=key&&S.leagues&&S.leagues[key];if(!T)return;
    var p=nme.textContent.split(' vs ');if(p.length!==2)return;
    var h=find(p[0],T),a=find(p[1],T);if(!h||!a||!h.played||!a.played)return;
    meta.insertAdjacentHTML('afterend','<div class="meta" style="margin:2px 0 4px">'+line(h)+'<br>'+line(a)+'</div>'+why(row,h,a,p[0],p[1]));
  });
}
var L=document.getElementById('ml');
if(L)new MutationObserver(enrich).observe(L,{childList:true});
fetch('stats.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){S=j;enrich()}).catch(function(){});
})();
