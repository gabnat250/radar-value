(function(){
var M={'Hawks':'atl','Celtics':'bos','Nets':'bkn','Hornets':'cha','Bulls':'chi','Cavaliers':'cle','Mavericks':'dal','Nuggets':'den','Pistons':'det','Warriors':'gs','Rockets':'hou','Pacers':'ind','Clippers':'lac','Lakers':'lal','Grizzlies':'mem','Heat':'mia','Bucks':'mil','Timberwolves':'min','Pelicans':'no','Knicks':'ny','Thunder':'okc','Magic':'orl','76ers':'phi','Suns':'phx','Trail Blazers':'por','Kings':'sac','Spurs':'sa','Raptors':'tor','Jazz':'utah','Wizards':'wsh'};
function url(n){for(var k in M){if(n.slice(-k.length)===k)return 'https://a.espncdn.com/i/teamlogos/nba/500/'+M[k]+'.png'}return null}
function img(u){var i=document.createElement('img');i.src=u;i.alt='';i.loading='lazy';i.referrerPolicy='no-referrer';i.style.cssText='width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:6px';i.onerror=function(){i.remove()};return i}
function rows(){
  var L=document.getElementById('ml');if(!L)return;
  L.querySelectorAll('.row').forEach(function(row){
    if(row.getAttribute('data-n'))return;
    var nme=row.querySelector('.name'),meta=row.querySelector('.meta');if(!nme||!meta)return;
    if(meta.textContent.split(',')[0].trim()!=='NBA')return;
    var p=nme.textContent.split(' vs ');if(p.length!==2)return;
    row.setAttribute('data-n','1');
    var u=[url(p[0]),url(p[1])];if(!u[0]&&!u[1])return;
    nme.textContent='';
    [0,1].forEach(function(k){if(k)nme.appendChild(document.createTextNode(' vs '));if(u[k])nme.appendChild(img(u[k]));nme.appendChild(document.createTextNode(p[k]))});
  });
}
var L=document.getElementById('ml');if(L)new MutationObserver(rows).observe(L,{childList:true});
rows();
})();
