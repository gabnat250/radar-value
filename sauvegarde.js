(function(){
var KEYS=['rv_bets','rv_fav','rv_bk','rv_kf','rv_fmt'];
function g(i){return document.getElementById(i)}
function rd(k){try{var v=localStorage.getItem(k);return v===null?null:JSON.parse(v)}catch(e){return null}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function ok(b){return b&&typeof b.d==='string'&&+b.o>1&&+b.m>0&&['P','W','L','V'].indexOf(b.r)>-1}
var sec=g('pS');if(!sec)return;
sec.insertAdjacentHTML('beforeend','<div class="card"><h2>Sauvegarde</h2><p class="meta" id="bkinfo"></p><button class="btn" id="bkx">Exporter mes données</button><button class="mini" id="bki" style="width:100%;padding:10px">Importer une sauvegarde</button><input type="file" id="bkf" accept=".json,application/json" style="display:none"><p class="meta" style="margin-top:8px">Ton suivi est gardé seulement dans ce navigateur. Si tu vides les données du site ou si tu changes d’appareil, il disparaît. Exporte de temps en temps et garde le fichier en lieu sûr.</p></div>');
function info(){
  var n=(rd('rv_bets')||[]).length,l=rd('rv_lastbk');
  g('bkinfo').innerHTML=n+' pari'+(n>1?'s':'')+' dans le suivi. Dernière sauvegarde : <b>'+(l?new Date(l).toLocaleString('fr-CA',{dateStyle:'medium',timeStyle:'short'}):'jamais')+'</b>';
}
info();
new MutationObserver(info).observe(g('list')||sec,{childList:true,subtree:true});
g('bkx').onclick=function(){
  var o={app:'radar-value',v:1,date:new Date().toISOString(),data:{}};
  KEYS.forEach(function(k){var v=rd(k);if(v!==null)o.data[k]=v});
  var blob=new Blob([JSON.stringify(o,null,1)],{type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='radar-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},3000);
  wr('rv_lastbk',new Date().toISOString());info();
};
g('bki').onclick=function(){g('bkf').click()};
g('bkf').onchange=function(){
  var f=this.files[0],inp=this;if(!f)return;
  if(f.size>1000000){alert('Fichier trop gros.');inp.value='';return}
  var r=new FileReader();
  r.onload=function(){
    var o;try{o=JSON.parse(r.result)}catch(e){alert('Fichier illisible.');return}
    if(!o||o.app!=='radar-value'||!o.data){alert('Ce fichier n’est pas une sauvegarde de Radar de value.');return}
    var d=o.data,clean=(Array.isArray(d.rv_bets)?d.rv_bets:[]).filter(ok).slice(0,2000).map(function(b){return{d:String(b.d).slice(0,200),o:+b.o,m:+b.m,r:b.r}});
    if(!confirm('Remplacer tes données actuelles par cette sauvegarde ('+clean.length+' paris)?'))return;
    wr('rv_bets',clean);
    if(Array.isArray(d.rv_fav))wr('rv_fav',d.rv_fav.filter(function(x){return typeof x==='string'&&x.length<3}));
    if(typeof d.rv_bk==='number'&&isFinite(d.rv_bk))wr('rv_bk',d.rv_bk);
    if(['0.1','0.25','0.5'].indexOf(d.rv_kf)>-1)wr('rv_kf',d.rv_kf);
    if(d.rv_fmt==='us'||d.rv_fmt==='dec')wr('rv_fmt',d.rv_fmt);
    location.reload();
  };
  r.readAsText(f);inp.value='';
};
})();
