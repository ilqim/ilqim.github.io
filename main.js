(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* dil */
  var langBtns=document.querySelectorAll('.langsw button');
  var onLang=[];
  function setLang(l){
    root.setAttribute('data-lang',l); root.lang=l;
    langBtns.forEach(function(b){var on=b.getAttribute('data-l')===l; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on)});
    try{localStorage.setItem('lang',l)}catch(e){}
    onLang.forEach(function(f){f(l)});
  }
  var saved=null; try{saved=localStorage.getItem('lang')}catch(e){}
  var startLang=saved||((navigator.language||'tr').slice(0,2)==='tr'?'tr':'en');
  langBtns.forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-l'))})});

  /* isim ve unvanlar: yazılıp silinir */
  var typed=document.getElementById('typed');
  if(typed){
    var words={
      tr:['İlkim Eren','Simülasyon Geliştiricisi','Gömülü Sistem Geliştiricisi','Proje Yöneticisi','Oyun Tasarımcısı','Oyun Programcısı','Web Geliştiricisi'],
      en:['İlkim Eren','Simulation Developer','Embedded Systems Developer','Project Manager','Game Designer','Game Programmer','Web Developer']
    };
    var timer=null;
    function type(l){
      clearTimeout(timer);
      var list=words[l], wi=0, ci=list[0].length, del=false;
      typed.textContent=list[0];
      if(reduce) return;
      timer=setTimeout(function step(){
        var w=list[wi];
        ci+=del?-1:1;
        typed.textContent=w.slice(0,ci);
        var wait=del?40:85;
        if(!del&&ci===w.length){del=true;wait=wi===0?2600:1700}
        else if(del&&ci===0){del=false;wi=(wi+1)%list.length;wait=350}
        timer=setTimeout(step,wait);
      },2600);
      del=true;
    }
    onLang.push(type);
  }
  setLang(startLang);

  /* yıldızlı arka plan */
  var c=document.getElementById('stars');
  if(c){
    var ctx=c.getContext('2d'), stars=[], dpr=Math.min(window.devicePixelRatio||1,2);
    function size(){
      c.width=innerWidth*dpr; c.height=innerHeight*dpr;
      c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px';
      var n=Math.round(innerWidth*innerHeight/9000);
      stars=[];
      for(var i=0;i<n;i++) stars.push({x:Math.random()*c.width,y:Math.random()*c.height,r:(Math.random()*1.2+.3)*dpr,
        p:Math.random()*Math.PI*2,s:.4+Math.random()*1.2,b:Math.random()<.12});
    }
    function draw(t){
      ctx.clearRect(0,0,c.width,c.height);
      for(var i=0;i<stars.length;i++){
        var s=stars[i], a=reduce?.6:.35+.45*Math.sin(t/1000*s.s+s.p);
        ctx.fillStyle=s.b?'rgba(110,150,255,'+a+')':'rgba(255,255,255,'+a+')';
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.283); ctx.fill();
      }
      if(!reduce) requestAnimationFrame(draw);
    }
    size(); addEventListener('resize',size); requestAnimationFrame(draw);
  }

  /* mouse ışığı */
  var glow=document.querySelector('.glow'), dot=document.querySelector('.glow-dot');
  if(glow&&dot&&window.matchMedia('(pointer: fine)').matches){
    var mx=innerWidth/2,my=innerHeight/2,gx=mx,gy=my,dx=mx,dy=my;
    addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;document.body.classList.add('has-mouse')});
    document.addEventListener('mouseleave',function(){document.body.classList.remove('has-mouse')});
    (function loop(){
      var k=reduce?1:.12, kd=reduce?1:.35;
      gx+=(mx-gx)*k; gy+=(my-gy)*k; dx+=(mx-dx)*kd; dy+=(my-dy)*kd;
      glow.style.transform='translate('+gx+'px,'+gy+'px)';
      dot.style.transform='translate('+dx+'px,'+dy+'px)';
      requestAnimationFrame(loop);
    })();
  }


  /* menüde bulunulan bölümü vurgula */
  var navLinks=document.querySelectorAll('#nav a[data-spy]');
  if(navLinks.length){
    var ids=['hakkimda','deneyim'];
    function spy(){
      var cur='top', y=window.scrollY+140;
      ids.forEach(function(id){var el=document.getElementById(id); if(el&&el.offsetTop<=y) cur=id});
      if(cur==='deneyim'){var nxt=document.getElementById('yetenekler'); if(nxt&&nxt.offsetTop<=y) cur='deneyim'}
      navLinks.forEach(function(a){a.classList.toggle('active',a.getAttribute('data-spy')===cur)});
    }
    addEventListener('scroll',spy,{passive:true}); addEventListener('hashchange',spy); spy();
  }

  /* YouTube önizleme: tıklayınca kartın içinde oynar */
  document.querySelectorAll('.ytv').forEach(function(box){
    box.addEventListener('click',function(){
      if(box.classList.contains('playing')) return;
      var id=box.dataset.id;
      /* Bilgisayardan dosya olarak açılınca (file://) YouTube gömülü oynatıcıya izin vermez; yeni sekmede aç */
      if(location.protocol==='file:'){window.open('https://www.youtube.com/watch?v='+id,'_blank','noopener');return}
      var f=document.createElement('iframe');
      f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&origin='+encodeURIComponent(location.origin);
      f.referrerPolicy='strict-origin-when-cross-origin';
      f.title=box.getAttribute('aria-label')||'YouTube';
      f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen=true;
      box.innerHTML=''; box.appendChild(f); box.classList.add('playing');
    });
    box.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();box.click()}});
  });

  /* kaydırınca beliren kartlar */
  var items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
    items.forEach(function(el){io.observe(el)});
  } else items.forEach(function(el){el.classList.add('in')});
})();
