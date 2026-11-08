(function(){
var fmt='us';
try{fmt=localStorage.getItem('rv_fmt')||'us'}catch(e){}
function g(i){return document.getElementById(i)}
function num(s){return parseFloat(String(s).replace(',','.'))}
function am(d){if(!(d>1))return '';return d>=2?'+'+Math.round((d-1)*100):'-'+Math.round(100/(d-1))}
function dec(a){a=parseFloat(String(a).replace(',','.').replace(/\s/g,''));if(!a||Math.abs(a)<100)return null;return a>0?1+a/100:1+100/Math.abs(a)}
function fd(d){return d.toLocaleString('fr-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}
function show(d){return fmt==='us'?am(d):fd(d)}
function scan(root){
  root.querySelectorAll('.mc').forEach(function(e){
    if(e.querySelector('.od'))return;
    var m=e.textContent.match(/^cote (\d+,\d{2})$/);
    if(m)e.innerHTML='cote <span class="od" data-d="'+num(m[1])+'"></span>';
  });
  root.querySelectorAll('b').forEach(function(b){
    if(b.classList.contains('od')||!/^\d+,\d{2}$/.test(b.textContent))return;
    if(b.parentNode.textContent.indexOf('Meilleure cote')<0)return;
    b.classList.add('od');b.setAttribute('data-d',num(b.textContent));
  });
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],n;
  while(n=w.nextNode())nodes.push(n);
  nodes.forEach(function(t){
    var m=t.nodeValue.match(/(Meilleure cote : |à )(\d+,\d{2})(?= chez|\s*$)/);
    if(!m)return;
    var i=m.index+m[1].length,sp=document.createElement('span');
    sp.className='od';sp.setAttribute('data-d',num(m[2]));
    var after=t.splitText(i+m[2].length);
    t.nodeValue=t.nodeValue.slice(0,i);
    t.parentNode.insertBefore(sp,after);
  });
}
function apply(){
  document.querySelectorAll('.od').forEach(function(e){
    var d=parseFloat(e.getAttribute('data-d'));if(!d)return;
    var v=show(d);if(e.textContent!==v)e.textContent=v;
  });
}
var busy=false;
function run(){
  if(busy)return;busy=true;
  requestAnimationFrame(function(){busy=false;['ml','hero'].forEach(function(i){var r=g(i);if(r)scan(r)});apply()});
}
['ml','hero'].forEach(function(i){var r=g(i);if(r)new MutationObserver(run).observe(r,{childList:true,subtree:true})});
var seg=document.createElement('div');seg.className='seg';
seg.innerHTML='<button data-f="us">Cotes américaines</button><button data-f="dec">Cotes décimales</button>';
if(g('up'))g('up').insertAdjacentElement('afterend',seg);
function mark(){seg.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-f')===fmt)})}
seg.onclick=function(e){
  var f=e.target.getAttribute('data-f');if(!f)return;
  fmt=f;try{localStorage.setItem('rv_fmt',f)}catch(x){}
  mark();apply();
};
mark();
function info(d){g('cvr').textContent=d?'Probabilité implicite (avec la marge du bookmaker) : '+(100/d).toLocaleString('fr-CA',{minimumFractionDigits:1,maximumFractionDigits:1})+' %':''}
var pa=g('pA');
if(pa){
  pa.insertAdjacentHTML('afterbegin','<div class="card"><h2>Convertisseur de cotes</h2><div class="g"><label>Américaine (ex. +150, -200)<input id="cva" type="text" placeholder="-110" autocomplete="off"></label><label>Décimale (ex. 1,91)<input id="cvd" type="text" inputmode="decimal" placeholder="1,91" autocomplete="off"></label></div><p class="meta" id="cvr" style="margin-top:8px"></p></div>');
  g('cva').oninput=function(){var d=dec(this.value);g('cvd').value=d?fd(d):'';info(d)};
  g('cvd').oninput=function(){var d=num(this.value);g('cva').value=d>1?am(d):'';info(d>1?d:null)};
}
run();
})();
