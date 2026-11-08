(function(){
var D=null,LGN={P:'Premier League',E:'La Liga',I:'Serie A',B:'Bundesliga',F:'Ligue 1',N:'NBA',C:'Ligue des champions',U:'Europa League'};
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function f(x,d){return x.toLocaleString('fr-CA',{minimumFractionDigits:d,maximumFractionDigits:d})}
function enrich(){
  var L=document.getElementById('ml');if(!D||!L)return;
  L.querySelectorAll('.row').forEach(function(row){
    if(row.getAttribute('data-u'))return;row.setAttribute('data-u','1');
    var nme=row.querySelector('.name'),bar=row.querySelector('.bar'),meta=row.querySelector('.meta');
    if(!nme||!bar||!meta)return;
    var lg=meta.textContent.split(',')[0].trim(),p=nme.textContent.split(' vs ');
    var m=p.length===2&&D.matches.filter(function(x){return x.home===p[0]&&x.away===p[1]&&LGN[x.league]===lg})[0];
    if(m){
      var outs=[m.home,'Draw',m.away].map(function(n){return m.outcomes.filter(function(o){return o.name===n})[0]}).filter(Boolean);
      var top=outs.reduce(function(a,b){return b.p>a.p?b:a});
      bar.insertAdjacentHTML('beforebegin','<div class="mk">'+outs.map(function(o){
        return '<div class="mo'+(o===top?' fav':'')+(o.ev>.02?' mv':'')+'"><span class="ml">'+esc(o.name==='Draw'?'Nul':o.name)+'</span><b>'+f(o.p*100,0)+' %</b><span class="mc">cote '+f(o.best,2)+'</span></div>';
      }).join('')+'</div>');
    }
    bar.classList.add('dt');
    var pm=bar.nextElementSibling;if(pm&&pm.classList.contains('meta'))pm.classList.add('dt');
    var bt=document.createElement('button');bt.className='dtb';bt.textContent='Détails';
    bt.onclick=function(){var o=row.classList.toggle('open');bt.textContent=o?'Masquer':'Détails'};
    row.appendChild(bt);
  });
}
var L=document.getElementById('ml');
if(L)new MutationObserver(enrich).observe(L,{childList:true});
fetch('data.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){D=j;enrich()}).catch(function(){});
})();
