(function(){
var S=null,cur='P',LG={P:'Premier League',E:'La Liga',I:'Serie A',B:'Bundesliga',F:'Ligue 1'};
function g(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function short(t){return t.replace(/ (FC|AFC|CF)$/,'')}
function f2(x){return x.toLocaleString('fr-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}
var st=document.createElement('style');
st.textContent='.eq{width:100%;border-collapse:collapse;font-size:13px}.eq th{text-align:right;color:var(--mute);font-weight:600;padding:4px 3px}.eq td{text-align:right;padding:8px 3px;border-top:1px solid var(--line)}.eq th:nth-child(2),.eq td:nth-child(2){text-align:left}.eq th:first-child,.eq td:first-child{text-align:left;color:var(--mute);width:24px}.eq td:nth-child(2){font-weight:700}.eq td:last-child{font-weight:800}.tabs button{padding:12px 4px}';
document.head.appendChild(st);
var b=document.createElement('button');b.id='tE';b.textContent='Équipes';b.onclick=showE;
document.querySelector('.tabs').appendChild(b);
var sec=document.createElement('section');sec.id='pE';sec.className='hide';
g('pS').insertAdjacentElement('afterend',sec);
function showE(){
  ['pM','pA','pS'].forEach(function(i){g(i).classList.add('hide')});
  ['tM','tA','tS'].forEach(function(i){g(i).classList.remove('on')});
  g('pE').classList.remove('hide');g('tE').classList.add('on');window.scrollTo(0,0);
}
var t0=window.tab;
window.tab=function(k){g('pE').classList.add('hide');g('tE').classList.remove('on');t0(k)};
sec.onclick=function(e){var k=e.target.getAttribute('data-k');if(k&&LG[k]){cur=k;renderE()}};
function renderE(){
  if(!S||!Object.keys(S.leagues||{}).length){sec.innerHTML='<div class="card"><p class="meta">Pas encore de classements. Lance la mise à jour dans GitHub (onglet Actions).</p></div>';return}
  var T=S.leagues[cur]||[],gf=0,pl=0,att=null,def=null;
  T.forEach(function(r){gf+=r.gf;pl+=r.played;
    if(!att||r.gf/r.played>att.gf/att.played)att=r;
    if(!def||r.ga/r.played<def.ga/def.played)def=r});
  var h='<p class="meta">Classements du '+new Date(S.updated).toLocaleString('fr-CA',{dateStyle:'medium',timeStyle:'short'})+'. Source : football-data.org. La NBA n’est pas incluse.</p><div class="chips">';
  Object.keys(LG).forEach(function(k){h+='<button data-k="'+k+'" aria-pressed="'+(k===cur)+'">'+LG[k]+'</button>'});
  h+='</div><div class="card"><h2>'+LG[cur]+'</h2>';
  if(att)h+='<p class="meta">Buts par match : <b>'+f2(gf/(pl/2))+'</b><br>Meilleure attaque : <b>'+esc(short(att.team))+'</b> ('+f2(att.gf/att.played)+' par match)<br>Meilleure défense : <b>'+esc(short(def.team))+'</b> ('+f2(def.ga/def.played)+' encaissés par match)</p>';
  h+='<table class="eq"><tr><th>#</th><th>Équipe</th><th>J</th><th>V-N-D</th><th>Buts</th><th>Pts</th></tr>';
  T.forEach(function(r){h+='<tr><td>'+r.rank+'</td><td>'+esc(short(r.team))+'</td><td>'+r.played+'</td><td>'+r.w+'-'+r.d+'-'+r.l+'</td><td>'+r.gf+':'+r.ga+'</td><td>'+r.pts+'</td></tr>'});
  sec.innerHTML=h+'</table></div>';
}
function prefill(){
  var host=g('fF');if(!host||g('pf')||!S)return;
  host.insertAdjacentHTML('beforebegin','<div class="card" id="pf"><h2>Pré-remplir avec les vraies stats</h2><div class="g"><label style="grid-column:1/3">Ligue<select id="pfl"></select></label><label>Domicile<select id="pfh"></select></label><label>Extérieur<select id="pfa"></select></label></div><button class="btn" id="pfb">Pré-remplir</button><p class="meta" style="margin-top:8px">Moyennes générales de la saison, sans séparation domicile et extérieur. L’avantage du domicile n’est donc pas compté.</p></div>');
  g('pfl').innerHTML=Object.keys(S.leagues).map(function(k){return '<option value="'+k+'">'+LG[k]+'</option>'}).join('');
  function teams(){
    var T=S.leagues[g('pfl').value]||[],o=T.map(function(r,i){return '<option value="'+i+'">'+esc(short(r.team))+'</option>'}).join('');
    g('pfh').innerHTML=o;g('pfa').innerHTML=o;if(T.length>1)g('pfa').selectedIndex=1;
  }
  g('pfl').onchange=teams;teams();
  g('pfb').onclick=function(){
    var T=S.leagues[g('pfl').value],h=T[+g('pfh').value],a=T[+g('pfa').value];
    if(h===a){alert('Choisis deux équipes différentes.');return}
    if(!h.played||!a.played){alert('Pas assez de matchs joués.');return}
    var gf=0,pl=0;T.forEach(function(r){gf+=r.gf;pl+=r.played});
    function v(id,x){g(id).value=Math.round(x*100)/100}
    v('hs',h.gf/h.played);v('hc',h.ga/h.played);v('as',a.gf/a.played);v('ac',a.ga/a.played);v('lh',gf/pl);v('la',gf/pl);
    if(window.sport)window.sport('F');
  };
}
fetch('stats.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){S=j;renderE();prefill()}).catch(function(){S=null;renderE()});
})();
