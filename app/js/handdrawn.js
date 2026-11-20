/* ---- hand-drawn vector outlines: crisp at any zoom, no raster filters ---- */
(function(){
  var NS='http://www.w3.org/2000/svg';
  var BOX='.cat-card,.hero,.today,.side-note,.guide-grid article,.guide-note,.identity-poster,.primary,.secondary,.location-chip,.search,.icon-btn,.locate-btn,.cond-tiles label,.need-options.tiles>label.nt,.switch,.update-box,.given-card,.bubble,.nearby-warning,.status-badge.going,.view-switch,.need-big>div,.all-good,.going-banner,.detail-data,.location-picker-wrap,.form-error,.hero-speech,.toast,.map-wrap,.upload,.empty';
  var DASH='.upload,.empty,.status-badge.going';
  var RED='.form-error,.status-badge.going';
  var LINES=[['.topbar','bottom'],['footer','top'],['.sidebar','left']];
  var BASE='position:absolute;margin:0;padding:0;transform:none;animation:none;transition:none;filter:none;opacity:1;display:block;max-width:none;max-height:none;',PS='fill:none;stroke-linecap:round;stroke-linejoin:round;animation:none;transition:none;';
  var seedOf=new WeakMap(), seedN=1;
  function rnd(seed){var t=seed>>>0;return function(){t+=0x6D2B79F5;var r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return((r^r>>>14)>>>0)/4294967296}}
  function f(n){return Math.round(n*100)/100}
  function smooth(p,closed){ // Catmull-Rom -> cubic bezier
    var d='M'+f(p[0][0])+' '+f(p[0][1]), n=p.length;
    for(var i=0;i<n-1;i++){
      var p0=p[i-1]||p[i], p1=p[i], p2=p[i+1], p3=p[i+2]||p2;
      d+='C'+f(p1[0]+(p2[0]-p0[0])/6)+' '+f(p1[1]+(p2[1]-p0[1])/6)+' '+f(p2[0]-(p3[0]-p1[0])/6)+' '+f(p2[1]-(p3[1]-p1[1])/6)+' '+f(p2[0])+' '+f(p2[1]);
    }
    return d;
  }
  function wobble(R){ // low-frequency hand wobble
    var a=R()*6.28,b=R()*6.28,fa=.035+R()*.03,fb=.11+R()*.05;
    return function(s,amp){return amp*(.7*Math.sin(s*fa+a)+.3*Math.sin(s*fb+b))};
  }
  function wobbleP(R,P){ // periodic over the perimeter: start meets end with no seam
    var a=R()*6.28,b=R()*6.28,k1=Math.max(1,Math.round(P*.035/6.283)),k2=Math.max(2,Math.round(P*.12/6.283));
    var fa=6.283*k1/P,fb=6.283*k2/P;
    return function(s,amp){return amp*.5*(1+.7*Math.sin(s*fa+a)+.3*Math.sin(s*fb+b))}; // outward only: fill never peeks past the line
  }
  function smoothClosed(p){
    var n=p.length,d='M'+f(p[0][0])+' '+f(p[0][1]);
    for(var i=0;i<n;i++){
      var p0=p[(i-1+n)%n],p1=p[i],p2=p[(i+1)%n],p3=p[(i+2)%n];
      d+='C'+f(p1[0]+(p2[0]-p0[0])/6)+' '+f(p1[1]+(p2[1]-p0[1])/6)+' '+f(p2[0]-(p3[0]-p1[0])/6)+' '+f(p2[1]-(p3[1]-p1[1])/6)+' '+f(p2[0])+' '+f(p2[1]);
    }
    return d+'Z';
  }
  function rectPath(w,h,r,inset,R){
    var W=wobbleP(R,2*((w-2*inset)+(h-2*inset))-(8-2*Math.PI)*Math.max(0,Math.min(r-inset,(w-2*inset)/2,(h-2*inset)/2))), amp=Math.min(1.1,Math.max(.45,Math.min(w,h)/40));
    var x0=inset,y0=inset,x1=w-inset,y1=h-inset; r=Math.max(0,Math.min(r-inset,(x1-x0)/2,(y1-y0)/2)); /* concentric with the box corner */
    var segs=[], pts=[], step=16;
    // perimeter, clockwise, starting near top-right corner (RTL hand)
    function line(ax,ay,bx,by,nx,ny){segs.push({t:'l',ax:ax,ay:ay,bx:bx,by:by,nx:nx,ny:ny})}
    function arc(cx,cy,a0){segs.push({t:'a',cx:cx,cy:cy,a0:a0})}
    line(x1-r,y0,x0+r,y0,0,-1); arc(x0+r,y0+r,-Math.PI/2);
    line(x0,y0+r,x0,y1-r,-1,0); arc(x0+r,y1-r,Math.PI);
    line(x0+r,y1,x1-r,y1,0,1); arc(x1-r,y1-r,Math.PI/2);
    line(x1,y1-r,x1,y0+r,1,0); arc(x1-r,y0+r,0);
    var s=0;
    segs.forEach(function(g){
      if(g.t==='l'){
        var L=Math.hypot(g.bx-g.ax,g.by-g.ay), n=Math.max(1,Math.round(L/step));
        for(var i=0;i<n;i++){var k=i/n,o=W(s+k*L,amp);pts.push([g.ax+(g.bx-g.ax)*k+g.nx*o,g.ay+(g.by-g.ay)*k+g.ny*o])}
        s+=L;
      }else if(r>0){
        var n2=Math.max(2,Math.round(r*1.57/step)+1);
        for(var j=0;j<n2;j++){var t=g.a0-(j/n2)*Math.PI/2,o2=W(s,amp);pts.push([g.cx+Math.cos(t)*(r+o2),g.cy+Math.sin(t)*(r+o2)]);s+=r*1.57/n2}
      }
    });
    return smoothClosed(pts);
  }
  function linePath(len,R,vertical){
    var W=wobble(R), p=[], n=Math.max(2,Math.round(len/22));
    for(var i=0;i<=n;i++){var s=i/n*len,o=W(s,1.1);p.push(vertical?[o,s]:[s,o])}
    return smooth(p);
  }
  function seed(el){var v=seedOf.get(el);if(!v){v=(seedN++*2654435761)>>>0;seedOf.set(el,v)}return v}
  function own(el){for(var c=el.lastElementChild;c;c=c.previousElementSibling){if(c.classList&&c.classList.contains('sk'))return c}return null}
  function draw(el){
    if(!el.matches(BOX)){var o=own(el);if(o)o.remove();el.classList.remove('sk-on');el._sk=0;ro.unobserve(el);return}
    var w=el.offsetWidth,h=el.offsetHeight; if(!w||!h){return}
    var svg=own(el);
    if(!svg){svg=document.createElementNS(NS,'svg');svg.setAttribute('class','sk');svg.setAttribute('aria-hidden','true');svg.appendChild(document.createElementNS(NS,'path'));el.appendChild(svg)}
    var key=w+'x'+h+' '+el.className.replace(' sk-on','');
    if(svg._k===key)return; svg._k=key;
    var cs=getComputedStyle(el), bw=parseFloat(cs.borderTopWidth)||0;
    var r=parseFloat(cs.borderTopLeftRadius)||0; if(cs.borderTopLeftRadius.indexOf('%')>-1)r=Math.min(w,h)/2;
    var big=Math.min(w,h)>60, sw=big?2.3:2, off=-bw;
    if(cs.overflow!=='visible'&&bw){off=0;w-=2*bw;h-=2*bw;r=Math.max(0,r-bw)}
    svg.style.cssText=BASE+'left:'+off+'px;top:'+off+'px;width:'+w+'px;height:'+h+'px';
    svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox','0 0 '+w+' '+h);
    svg.classList.toggle('red',el.matches(RED));
    var p=svg.firstChild;
    p.style.cssText=PS+'stroke:var('+(el.matches(RED)?'--red':'--ink')+')';
    p.setAttribute('d',rectPath(w,h,r,sw/2+.15,rnd(seed(el)+(el._boil||0)*7919)));
    p.setAttribute('stroke-width',sw);
    if(el.matches(DASH))p.setAttribute('stroke-dasharray',big?'9 7':'5 4');else p.removeAttribute('stroke-dasharray');
    if(!el.classList.contains('sk-on'))el.classList.add('sk-on');
  }
  function drawLine(el,side){
    var w=el.offsetWidth,h=el.offsetHeight; if(!w||!h)return;
    var svg=own(el);
    if(!svg){svg=document.createElementNS(NS,'svg');svg.setAttribute('class','sk ln');svg.setAttribute('aria-hidden','true');svg.appendChild(document.createElementNS(NS,'path'));el.appendChild(svg)}
    var v=side==='left', len=v?h:w, key=side+len; if(svg._k===key)return; svg._k=key;
    var p=svg.firstChild; p.style.cssText=PS+'stroke:var(--ink)'; p.setAttribute('d',linePath(len,rnd(seed(el)),v));p.setAttribute('stroke-width',2.3);
    if(v){svg.setAttribute('width',4);svg.setAttribute('height',h);svg.style.cssText=BASE+'left:0px;top:0;height:'+h+'px;width:4px';svg.setAttribute('viewBox','-2 0 4 '+h)}
    else{svg.setAttribute('width',w);svg.setAttribute('height',4);svg.style.cssText=BASE+'left:0;width:'+w+'px;height:4px;'+(side==='bottom'?'top:auto;bottom:-3px':'top:-2px');svg.setAttribute('viewBox','0 -2 '+w+' 4')}
    if(!el.classList.contains('sk-on'))el.classList.add('sk-on');
  }
  var ro=new ResizeObserver(function(es){es.forEach(function(e){var t=e.target;if(t._skLine)drawLine(t,t._skLine);else draw(t)})});
  function attach(el){if(el._sk)return;el._sk=1;ro.observe(el);draw(el)}
  function scan(root){
    if(root.matches&&root.matches(BOX))attach(root);
    if(root.querySelectorAll)root.querySelectorAll(BOX).forEach(attach);
  }
  LINES.forEach(function(x){document.querySelectorAll(x[0]).forEach(function(el){el._skLine=x[1];ro.observe(el);drawLine(el,x[1])})});
  scan(document.body);
  var pend=new Set(),raf=0;
  new MutationObserver(function(ms){
    ms.forEach(function(m){
      if(m.type==='attributes'){var t=m.target;if(t._sk){pend.add(t)}else if(t.matches&&t.matches(BOX))pend.add(t);return}
      m.addedNodes.forEach(function(n){if(n.nodeType===1&&!(n.classList&&n.classList.contains('sk')))pend.add(n)});
      if(m.target.nodeType===1)pend.add(m.target);
    });
    if(!raf)raf=requestAnimationFrame(function(){raf=0;pend.forEach(function(n){scan(n);if(n._sk){draw(n)}else if(n._skLine&&!own(n)){drawLine(n,n._skLine)}});pend.clear()});
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  // hand-drawn 'boil': the outline is re-sketched a few times on hover
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.addEventListener('pointerover',function(e){
      var el=e.target.closest&&e.target.closest(BOX); if(!el||!el._sk||el._boiling)return;
      el._boiling=1; var k=0;
      (function tick(){var s=own(el); k++; el._boil=k<4?k:0; if(s)s._k=null; draw(el);
        if(k<4)setTimeout(tick,95); else setTimeout(function(){el._boiling=0},400)})();
    },{passive:true});
  }
})();
/* ---- playful interactions ---- */
(function(){
  // chip row fade hint (RTL: content continues to the left)
  document.querySelectorAll('.filter-chips').forEach(function(fc){
    function upd(){var max=fc.scrollWidth-fc.clientWidth;fc.classList.toggle('more',max>2&&Math.abs(fc.scrollLeft)<max-2)}
    fc.addEventListener('scroll',upd,{passive:true});new ResizeObserver(upd).observe(fc);upd();
  });
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM)return;
  // headline words bounce in
  function words(h){
    if(h._w)return;h._w=1;var n=0;
    [].slice.call(h.childNodes).forEach(function(nd){
      if(nd.nodeType===3){var parts=nd.textContent.split(/(\s+)/);var f=document.createDocumentFragment();
        parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p))}else{var s=document.createElement('i');s.className='w-in';s.style.fontStyle='normal';s.style.setProperty('--w',n++);s.textContent=p;f.appendChild(s)}});
        h.replaceChild(f,nd)}
      else if(nd.nodeType===1){nd.classList.add('w-in');nd.style.setProperty('--w',n++)}
    });
  }
  function animHeads(){document.querySelectorAll('.page:not([hidden]) .heading h1').forEach(function(h){words(h);h.querySelectorAll('.w-in').forEach(function(e){e.style.animation='none';e.offsetWidth;e.style.animation=''})})}
  animHeads();
  new MutationObserver(function(ms){ms.forEach(function(m){if(m.attributeName==='hidden'&&!m.target.hidden)animHeads()})}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
  // accent word wiggles when clicked
  document.addEventListener('click',function(e){var s=e.target.closest('.heading h1 span');if(s){s.classList.remove('wig');void s.offsetWidth;s.classList.add('wig');setTimeout(function(){s.classList.remove('wig')},750)}});
  // cards tilt gently toward the pointer
  if(matchMedia('(hover:hover)').matches){
    document.addEventListener('pointermove',function(e){
      var c=e.target.closest&&e.target.closest('.cat-card,.guide-grid article');
      if(window._tc&&window._tc!==c){window._tc.style.transform='';window._tc.classList.remove('tilt')}
      window._tc=c; if(!c)return;
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.classList.add('tilt');c.style.transform='perspective(700px) rotateY('+(x*6).toFixed(2)+'deg) rotateX('+(-y*6).toFixed(2)+'deg) translateY(-4px)';
    },{passive:true});
  }
  // logo hops
  var brand=document.querySelector('.sidebar .brand');
  if(brand)brand.addEventListener('click',function(){var w=brand.querySelector('.brand-word')||brand;w.classList.remove('hop');void w.offsetWidth;w.classList.add('hop')});
  // little paw burst on primary actions
  var PAW='<i class="spr spr-paw" style="width:24px;height:24px"></i>';
  function burst(x,y,n){
    for(var i=0;i<n;i++){var d=document.createElement('span');d.className='paw-burst';d.innerHTML=PAW;
      var a=Math.random()*Math.PI*2,dist=40+Math.random()*40;
      d.style.left=(x-11)+'px';d.style.top=(y-11)+'px';d.style.setProperty('--dx',Math.cos(a)*dist+'px');d.style.setProperty('--dy',(Math.sin(a)*dist-20)+'px');d.style.setProperty('--r',(Math.random()*120-60)+'deg');
      document.body.appendChild(d);setTimeout(function(el){el.remove()}.bind(null,d),950)}
  }
  window.psBurst=burst;
  document.addEventListener('click',function(e){var b=e.target.closest('.primary,.chip,.nt,.cond-tiles label');if(b&&e.clientX)burst(e.clientX,e.clientY,b.classList.contains('primary')?5:3)});
})();

/* ---- the PsPs cat: looks at you, blinks, purrs, leads you to the button ---- */
(function(){
  var hc=document.querySelector('.hc'); if(!hc)return;
  var hero=hc.closest('.hero'), cta=hero.querySelector('.primary'), sp=hc.querySelector('.hero-speech');
  var eyes=[].slice.call(hc.querySelectorAll('.hc-eye')), title=hero.querySelector('h2 em');
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(hover:hover)').matches;
  var busy=0, last=Date.now();
  function cls(c,ms){hc.classList.remove(c);void hc.offsetWidth;hc.classList.add(c);setTimeout(function(){hc.classList.remove(c)},ms)}
  // eyes follow a point
  function look(x,y){
    eyes.forEach(function(e){var r=e.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1,m=Math.min(1,d/160)*r.width*.42;
      e.style.setProperty('--ex',(dx/d*m).toFixed(2)+'px');e.style.setProperty('--ey',(dy/d*m).toFixed(2)+'px')});
  }
  function center(){eyes.forEach(function(e){e.style.setProperty('--ex','0px');e.style.setProperty('--ey','0px')})}
  // blink
  if(!RM)(function blink(){setTimeout(function(){if(!hc.classList.contains('happy')){cls('blink',150);if(Math.random()<.25)setTimeout(function(){cls('blink',140)},260)}blink()},2400+Math.random()*3200)})();
  // speech
  var words=['PsPs!','Meow!','Psst!','Hi!','Mrrp?'],wi=0;
  function say(t){sp.textContent=t||words[wi=(wi+1)%words.length];sp.classList.remove('pop');void sp.offsetWidth;sp.classList.add('pop')}
  // paw prints walk from the cat to the button
  function trail(){
    if(RM||!cta)return;
    var hr=hero.getBoundingClientRect(),a=hc.getBoundingClientRect(),b=cta.getBoundingClientRect();
    var x0=a.left+a.width*.45-hr.left,y0=a.top+a.height*.92-hr.top,x1=b.left+b.width/2-hr.left,y1=b.top+b.height/2-hr.top;
    if(Math.abs((a.left+a.width/2)-(hr.left+hr.width/2))<hr.width*.12){ // stacked layout: walk down the free left margin
      x0=x1=Math.max(18,hr.width*.07);y0=a.bottom-hr.top-10;y1=b.top-hr.top-8;}
    var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),n=Math.max(3,Math.min(7,Math.round(L/70))),ang=Math.atan2(dy,dx)*180/Math.PI+90,nx=-dy/L,ny=dx/L;
    for(var i=1;i<=n;i++){(function(i){setTimeout(function(){
      var t=i/(n+1),side=i%2?1:-1,el=document.createElement('span');el.className='trail'+(i===n?' red':'');
      el.style.left=(x0+dx*t+nx*side*11)+'px';el.style.top=(y0+dy*t+ny*side*11)+'px';el.style.setProperty('--r',ang.toFixed(0)+'deg');
      hero.appendChild(el);setTimeout(function(){el.remove()},1600)},i*150)})(i)}
    setTimeout(function(){if(title){title.classList.add('nudge');setTimeout(function(){title.classList.remove('nudge')},500)}cta.animate([{transform:'none'},{transform:'scale(1.07) rotate(-2deg)'},{transform:'none'}],{duration:450,easing:'cubic-bezier(.34,1.56,.64,1)'})},(n+1)*150);
  }
  hc.addEventListener('click',function(){
    if(busy)return;busy=1;setTimeout(function(){busy=0},800);
    if(!RM){cls('jump',760);cls('excite',620)}
    hc.classList.add('happy');setTimeout(function(){hc.classList.remove('happy')},900);
    say();trail();
  });
  // pet the cat: rest the pointer on it
  var petT;
  hc.addEventListener('pointerenter',function(e){if(e.pointerType!=='mouse')return;clearTimeout(petT);petT=setTimeout(function(){if(busy)return;hc.classList.add('happy');if(!RM)cls('purr',1500);say('Purr~');setTimeout(function(){hc.classList.remove('happy')},1500)},1100)});
  hc.addEventListener('pointerleave',function(){clearTimeout(petT)});
  // the cat watches the button when you are about to press it
  if(cta){
    function eyeCta(){if(!RM)cls('excite',620)}
    cta.addEventListener('pointerenter',eyeCta);cta.addEventListener('focus',eyeCta);
  }
})();

/* ---- light / dark switch ---- */
(function(){
  var b=document.getElementById('themeBtn'); if(!b)return;
  var meta=document.querySelector('meta[name="theme-color"]');
  function apply(t,anim){
    var h=document.documentElement;
    if(anim){h.classList.add('theme-fade');setTimeout(function(){h.classList.remove('theme-fade')},450)}
    h.setAttribute('data-theme',t);
    b.setAttribute('aria-pressed',t==='dark');b.setAttribute('aria-label',t==='dark'?'حالت روشن':'حالت تیره');b.title=b.getAttribute('aria-label');
    if(meta)meta.setAttribute('content',t==='dark'?'#1A1916':'#F3EAD9');
  }
  apply(document.documentElement.getAttribute('data-theme')||'light');
  b.addEventListener('click',function(){
    var t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    apply(t,true);try{localStorage.setItem('psps-theme',t)}catch(e){}
  });
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){if(!localStorage.getItem('psps-theme'))apply(e.matches?'dark':'light',true)})}catch(e){}
})();
