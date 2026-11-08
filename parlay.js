(function(){
var D=null,B={},legs=[],stake=10;
var LGN={P:'Premier League',E:'La Liga',I:'Serie A',B:'Bundesliga',F:'Ligue 1',N:'NBA',C:'Ligue des champions',U:'Europa League'};
function g(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fd(x,n){return x.toLocaleString('fr-CA',{minimumFractionDigits:n,maximumFractionDigits:n})}
function fmt(){try{return localStorage.getItem('rv_fmt')||'us'}catch(e){return 'us'}}
function am(d){return d>=2?'+'+Math.round((d-1)*100):'-'+Math.round(100/(d-1))}
function show(d){return fmt()==='us'?am(d):fd(d,2)}
function parse(s){
  s=String(s).trim().replace(',','.').replace(/\s/g,'');
  if(/^[+-]?\d+$/.test(s)){var a=parseFloat(s);if(Math.abs(a)>=100)return a>0?1+a/100:1+100/Math.abs(a)}
  var d=parseFloat(s);return d>1?d:null;
}
var st=document.createElement('style');
st.textContent='.plw{display:flex;gap:6px;margin:8px 0 2px}.plb{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 4px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);font:600 12px \'DM Sans\',system-ui,sans-serif;cursor:pointer}.plb .pn{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mute)}.plb .od{font:800 17px \'Bricolage Grotesque\',system-ui,sans-serif}.plb.on{background:var(--acc);border-color:var(--acc);color:#fff}.plb.on .pn{color:#fff}#plp{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:12;border:0;background:var(--ink);color:var(--bg);font:800 14px \'DM Sans\',system-ui,sans-serif;padding:11px 20px;border-radius:99px;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);cursor:pointer;display:none;white-space:nowrap}#plov{position:fixed;inset:0;z-index:30;background:rgba(5,10,25,.55);display:none;align-items:flex-end;justify-content:center}#plbox{width:100%;max-width:640px;max-height:86vh;overflow:auto;background:var(--card);color:var(--ink);border-radius:22px 22px 0 0;padding:16px 16px calc(20px + env(safe-area-inset-bottom,0px))}.plh{display:flex;justify-content:space-between;align-items:center;font:800 18px \'Bricolage Grotesque\',system-ui,sans-serif}.plx,.plr{border:0;background:none;color:var(--mute);font-size:24px;cursor:pointer;padding:0 6px}.pll{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.pln{font-weight:700}.plo{display:flex;align-items:center;flex:none}.plo input{width:92px;text-align:right;margin:0;padding:8px}.plg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.plg>div{background:var(--bg);border-radius:12px;padding:10px;text-align:center}.plg span{display:block;font-size:11px;color:var(--mute)}.plg b{font:800 22px \'Bricolage Grotesque\',system-ui,sans-serif}.plg small{display:block;font-size:11px;color:var(--mute)}.plm{font-size:13px;margin:6px 0}';
document.head.appendChild(st);
var pill=document.createElement('button');pill.id='plp';document.body.appendChild(pill);
var ov=document.createElement('div');ov.id='plov';ov.innerHTML='<div id="plbox"></div>';document.body.appendChild(ov);
var box=g('plbox');
function calc(){var d=1,p=1;legs.forEach(function(l){d*=l.d;p*=l.p});return{d:d,p:p}}
function close(){ov.style.display='none'}
function refresh(){
  document.querySelectorAll('.plb').forEach(function(b){
    var on=legs.some(function(l){return l.k===b.getAttribute('data-k')});
    b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
  });
  if(!legs.length){pill.style.display='none';close();return}
  pill.style.display='block';pill.textContent='Parlay · '+legs.length+' · '+show(calc().d);
  if(ov.style.display==='flex')render();
}
function toggle(k){
  var x=B[k];if(!x)return;
  var m=x.m,o=x.o,mid=m.league+'|'+m.home+'|'+m.away+'|'+m.start;
  var i=legs.findIndex(function(l){return l.mid===mid});
  if(i>-1&&legs[i].k===k)legs.splice(i,1);
  else{
    var leg={k:k,mid:mid,label:o.name==='Draw'?'Nul':o.name,title:m.home+' vs '+m.away,p:o.p,d:o.best};
    if(i>-1)legs[i]=leg;
    else if(legs.length>=12){alert('12 matchs maximum.');return}
    else legs.push(leg);
  }
  refresh();
}
function sum(){
  var c=calc(),pay=stake*c.d,ev=c.p*c.d-1,inv=1/c.p;
  var other=fmt()==='us'?fd(c.d,2)+' en décimal':am(c.d)+' en américain';
  var note=legs.length<2
    ?'<p class="meta">Ajoute au moins 2 matchs pour faire un parlay.</p>'
    :'<p class="meta">Chaque match ajouté réduit tes chances, et la marge du bookmaker s’accumule : le rendement espéré d’un combiné est en général plus faible que celui de paris simples. Les cotes viennent de bookmakers européens : tape la cote de bet365 dans la case de chaque match pour avoir le vrai résultat.</p>';
  g('plsum').innerHTML='<div class="plg"><div><span>Cote combinée</span><b>'+show(c.d)+'</b><small>'+other+'</small></div><div><span>Gain total</span><b>'+fd(pay,2)+' $</b><small>profit '+fd(pay-stake,2)+' $</small></div></div>'
    +'<div class="plm">Chances réelles de tout gagner (selon le marché) : <b>'+fd(c.p*100,1)+' %</b>, soit environ 1 fois sur '+fd(inv,inv<10?1:0)+'.<br>Rendement espéré avec ces cotes : <b style="color:var(--'+(ev>0?'ok':'no')+')">'+(ev>0?'+':'')+fd(ev*100,1)+' %</b></div>'
    +note+'<button class="btn" data-act="track">Ajouter au suivi</button><button class="mini" data-act="clear" style="width:100%;padding:10px">Vider le parlay</button>';
}
function render(){
  var h='<div class="plh"><span>Mon parlay</span><button class="plx" data-act="close" aria-label="Fermer">×</button></div>';
  legs.forEach(function(l,i){
    h+='<div class="pll"><div><div class="pln">'+esc(l.label)+'</div><div class="meta">'+esc(l.title)+' · marché : '+fd(l.p*100,0)+' %</div></div><div class="plo"><input data-i="'+i+'" value="'+show(l.d)+'" inputmode="text" aria-label="Cote"><button class="plr" data-r="'+i+'" aria-label="Retirer">×</button></div></div>';
  });
  h+='<label style="margin-top:10px">Mise ($)<input id="plst" type="number" step="0.01" inputmode="decimal" value="'+stake+'"></label><div id="plsum"></div>';
  box.innerHTML=h;sum();
}
pill.onclick=function(){ov.style.display='flex';render()};
ov.onclick=function(e){if(e.target===ov)close()};
box.addEventListener('click',function(e){
  var r=e.target.getAttribute('data-r'),a=e.target.getAttribute('data-act');
  if(r!==null){legs.splice(+r,1);refresh();return}
  if(a==='close')close();
  if(a==='clear'){legs=[];refresh()}
  if(a==='track'){
    if(!legs.length||!(stake>0)){alert('Ajoute un match et une mise.');return}
    var c=calc();
    if(window.addB){
      window.addB({d:'Parlay : '+legs.map(function(l){return l.label}).join(', '),o:Math.round(c.d*100)/100,m:stake,r:'P'});
      legs=[];refresh();close();if(window.tab)window.tab('S');
    }else alert('Le suivi n’est pas disponible.');
  }
});
box.addEventListener('input',function(e){if(e.target.id==='plst'){stake=parseFloat(e.target.value)||0;sum()}});
box.addEventListener('change',function(e){
  var i=e.target.getAttribute('data-i');if(i===null)return;
  var v=parse(e.target.value);
  if(!v){alert('Cote invalide. Exemples : -110, +150 ou 1,91.')}else legs[+i].d=v;
  render();refresh();
});
document.addEventListener('click',function(e){
  if(e.target.closest&&e.target.closest('[data-f]'))setTimeout(function(){
    document.querySelectorAll('.plb .od').forEach(function(s){s.textContent=show(parseFloat(s.getAttribute('data-d')))});
    refresh();
  },0);
});
function inject(){
  var L=g('ml');if(!D||!L)return;
  L.querySelectorAll('.row').forEach(function(row){
    if(row.getAttribute('data-p'))return;
    var nme=row.querySelector('.name'),meta=row.querySelector('.meta'),top=row.querySelector('.top');
    if(!nme||!meta||!top)return;
    var lg=meta.textContent.split(',')[0].trim(),p=nme.textContent.split(' vs ');
    var m=p.length===2&&D.matches.filter(function(x){return x.home===p[0]&&x.away===p[1]&&LGN[x.league]===lg})[0];
    row.setAttribute('data-p','1');if(!m)return;
    var outs=[m.home,'Draw',m.away].map(function(n){return m.outcomes.filter(function(o){return o.name===n})[0]}).filter(Boolean);
    var h='<div class="plw">';
    outs.forEach(function(o){
      var k=m.league+'|'+m.home+'|'+m.away+'|'+m.start+'|'+o.name;B[k]={m:m,o:o};
      h+='<button class="plb" data-k="'+esc(k)+'" aria-pressed="false"><span class="pn">'+esc(o.name==='Draw'?'Nul':o.name)+'</span><span class="od" data-d="'+o.best+'">'+show(o.best)+'</span></button>';
    });
    top.insertAdjacentHTML('afterend',h+'</div>');
  });
  refresh();
}
var L=g('ml');
if(L){
  L.addEventListener('click',function(e){var b=e.target.closest('.plb');if(b)toggle(b.getAttribute('data-k'))});
  new MutationObserver(inject).observe(L,{childList:true});
}
fetch('data.json?'+Date.now()).then(function(r){return r.json()}).then(function(j){D=j;inject()}).catch(function(){});
})();
