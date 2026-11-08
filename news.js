(function(){
var N=null,cat='impact';
function g(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ago(d){var m=Math.round((Date.now()-new Date(d))/60000);if(isNaN(m))return '';if(m<60)return 'il y a '+Math.max(m,1)+' min';var h=Math.round(m/60);if(h<24)return 'il y a '+h+' h';return 'il y a '+Math.round(h/24)+' j'}
var tabs=document.querySelector('.tabs');
var b=document.createElement('button');b.id='tN';b.textContent='News';tabs.appendChild(b);
var sec=document.createElement('section');sec.id='pN';sec.className='hide';
g('pS').insertAdjacentElement('afterend',sec);
tabs.addEventListener('click',function(e){
  var btn=e.target.closest('button');if(!btn)return;
  if(btn.id==='tN'){
    ['pM','pA','pS','pE'].forEach(function(i){var el=g(i);if(el)el.classList.add('hide')});
    tabs.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});
    btn.classList.add('on');sec.classList.remove('hide');window.scrollTo(0,0);
  }else{sec.classList.add('hide');b.classList.remove('on')}
});
sec.onclick=function(e){var k=e.target.getAttribute('data-c');if(k!==null){cat=k;render()}};
function render(){
  var items=((N&&N.items)||[]).filter(function(x){
    if(!/^https?:\/\//.test(x.u))return false;
    if(cat==='impact')return x.k&&x.k.length;
    return !cat||x.c===cat;
  });
  var h='<p class="meta">Titres en anglais. Les étiquettes viennent d’un filtre automatique par mots-clés : il peut rater des nouvelles ou en signaler des peu utiles. Vérifie la source avant de miser.'+(N?' Mis à jour le '+new Date(N.updated).toLocaleString('fr-CA',{dateStyle:'medium',timeStyle:'short'})+'.':'')+'</p><div class="chips">';
  [['impact','Peut affecter les paris'],['','Tout'],['foot','Foot'],['nba','NBA']].forEach(function(c){h+='<button data-c="'+c[0]+'" aria-pressed="'+(cat===c[0])+'">'+c[1]+'</button>'});
  h+='</div><div class="card">';
  if(!items.length){
    h+='<p class="meta">Aucun titre pour ce filtre.'+(N&&N.errors?'<br>'+N.errors.map(esc).join('<br>'):' Lance la mise à jour dans GitHub (onglet Actions).')+'</p>';
  }else{
    items.slice(0,40).forEach(function(x){
      var tg=(x.k||[]).map(function(k){return '<span class="tag" style="background:var(--wnbg);color:var(--wn);margin-right:4px">'+esc(k)+'</span>'}).join('');
      h+='<div style="padding:10px 0;border-top:1px solid var(--line)"><a href="'+esc(x.u)+'" target="_blank" rel="noopener" style="color:var(--ink);font-weight:700;text-decoration:none">'+esc(x.t)+'</a><div class="meta" style="margin-top:3px">'+tg+esc(x.s)+(x.d?' · '+ago(x.d):'')+'</div></div>';
    });
  }
  sec.innerHTML=h+'</div>';
}
fetch('news.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){N=j;render()}).catch(function(){N=null;render()});
})();
