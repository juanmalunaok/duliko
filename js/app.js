var HERO_IMG='assets/hero.jpg';
var DEMO=[]
var allProducts=[],activeTag='todos',activeBrand='todas',currentUser=null;
var customTags=["Sin TACC","Kosher","Importados","Orgánicos","Sin Lactosa","Vegano"];
var customBrands=["ALL RICE","Autenta Foods","Clic-Clac","Dame maní","Edemy","El Celta","Farfalej","Frisbix","Green Crops","Lulemúu","Magla","Mixme","Natural Pop","Osem - Nestle","Rodez","Yin Yang"];

function loadProducts(){
  if(db){db.collection('products').orderBy('createdAt','desc').onSnapshot(function(s){allProducts=s.docs.map(function(d){var o=d.data();o.id=d.id;return o});render()},function(){allProducts=DEMO;render()})}
  else{allProducts=DEMO;render()}
}

function render(){
  var g=document.getElementById('productsGrid');
  var c=document.getElementById('productsCount');
  var q=(document.getElementById('searchInput').value||'').toLowerCase().trim();
  var f=[];
  for(var i=0;i<allProducts.length;i++){
    var p=allProducts[i];
    var ms=!q||p.name.toLowerCase().indexOf(q)>=0||p.category.toLowerCase().indexOf(q)>=0||(p.description&&p.description.toLowerCase().indexOf(q)>=0);
    var mt=activeTag==='todos'||(p.tags&&p.tags.indexOf(activeTag)>=0);
    var mb=activeBrand==='todas'||p.category.indexOf(activeBrand)>=0;
    if(ms&&mt&&mb)f.push(p);
  }
  if(c){
    var cText=f.length+' producto'+(f.length!==1?'s':'')+(activeTag!=='todos'?' \u00b7 '+activeTag:'');
    if(activeBrand!=='todas'){
      c.innerHTML='<span>'+cText+' en <strong>'+activeBrand+'</strong></span>'
        +'<a href="categoria.html?cat='+encodeURIComponent(activeBrand)+'" class="ver-cat-link">Ver catálogo completo \u2192</a>';
    } else {
      c.textContent=cText;
    }
  }
  if(!f.length){g.innerHTML='<div class="no-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><h3 style="margin-bottom:6px">No encontramos productos</h3><p>Probá con otros términos</p></div>';return}
  var h='';
  window._fp=f;
    for(var i=0;i<f.length;i++){
    var p=f[i];var b='';
    if(p.tags){for(var j=0;j<p.tags.length;j++){var t=p.tags[j];var cl=t==='Kosher'?'tag-kosher':t==='Sin TACC'?'tag-sintacc':t==='Vegano'?'tag-vegano':'tag-importado';b+='<span class="p-tag '+cl+'">'+t+'</span>'}}
    h+='<div class="p-card" style="cursor:pointer" data-pidx="'+i+'"><div class="p-card-img"><img src="'+(p.image||HERO_IMG)+'" alt="'+p.name+'" loading="lazy">'+b+'</div><div class="p-card-body"><div class="p-card-cat">'+p.category+'</div><h3 class="p-card-name">'+p.name+'</h3><p class="p-card-desc">'+(p.description||'')+'</p></div></div>';
  }
  g.innerHTML=h;
  // Attach click handlers to product cards
  var cards=g.querySelectorAll('.p-card');
  for(var ci=0;ci<cards.length;ci++){
    (function(idx){
      cards[idx].addEventListener('click',function(){
        openProductDetail(idx);
      });
    })(ci);
  }

  // Scroll-triggered entrance animation (NK-style)
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var el=e.target;
        el.classList.add('in-view');
        setTimeout(function(){el.style.transitionDelay='';},900);
        io.unobserve(el);
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -24px 0px'});
  for(var ri=0;ri<cards.length;ri++){
    cards[ri].style.transitionDelay=(ri*0.07)+'s';
    io.observe(cards[ri]);
  }
}

function setBrand(b){
  activeBrand=b;
  document.getElementById('brandLabel').textContent=b==='todas'?'Todas las marcas':b;
  var btn=document.getElementById('brandSelBtn');
  if(b!=='todas'){btn.classList.add('active')}else{btn.classList.remove('active')}
  var opts=document.querySelectorAll('.brand-opt');
  for(var i=0;i<opts.length;i++){if(opts[i].getAttribute('data-brand')===b){opts[i].classList.add('active')}else{opts[i].classList.remove('active')}}
  render();
}

function loadNovedades(){
  if(!db)return;
  db.collection('novedades').orderBy('date','desc').limit(4).onSnapshot(function(s){
    var grid=document.getElementById('novedadesGrid');
    if(!grid)return;
    if(s.empty){grid.innerHTML='<div class="nov-card"><div class="nov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" style="width:32px;height:32px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><span class="nov-date">Próximamente</span><h3>Nuevas líneas en camino</h3><p>Estamos incorporando nuevas líneas de productos.</p></div>';return}
    var h='';s.forEach(function(doc){var n=doc.data();h+='<div class="nov-card">'+(n.image?'<div class="nov-img" style="background-image:url('+n.image+')"></div>':'<div class="nov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" style="width:32px;height:32px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>')+'<span class="nov-date">'+(n.date?new Date(n.date.seconds*1000).toLocaleDateString('es-AR'):'')+'</span><h3>'+n.title+'</h3><p>'+(n.description||'')+'</p></div>'});
    grid.innerHTML=h;
  });
}

function loadFiles(){
  if(!db)return;
  var grid=document.getElementById('filesGrid');
  if(!grid)return;
  db.collection('archivos').orderBy('date','desc').onSnapshot(function(s){
    if(s.empty){grid.innerHTML='<p style="text-align:center;padding:32px;color:var(--text2)">No hay archivos disponibles.</p>';return}
    var h='';
    s.forEach(function(doc){
      var f=doc.data();
      h+='<a href="'+f.url+'" target="_blank" class="file-card" download><div class="file-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div><span class="file-title">'+f.title+'</span><span class="file-download">Descargar PDF</span></a>';
    });
    grid.innerHTML=h;
  });
}

function openProductDetail(idx){
  console.log('Opening product',idx,window._fp?window._fp[idx]:null);
  var product=window._fp[idx];
  if(!product)return;
  var modal=document.getElementById('productDetail');
  if(!modal)return;
  document.getElementById('pdImg').src=product.image||HERO_IMG;
  document.getElementById('pdCat').textContent=product.category||'';
  document.getElementById('pdName').textContent=product.name||'';
  document.getElementById('pdDesc').textContent=product.description||'';
  var tagsHtml='';
  if(product.tags&&product.tags.length){
    for(var i=0;i<product.tags.length;i++){
      tagsHtml+='<span class="pd-tag">'+product.tags[i]+'</span>';
    }
  }
  document.getElementById('pdTags').innerHTML=tagsHtml;
  var msg=encodeURIComponent('Hola, ¿cómo estás? Vi este producto en la Web y me interesaría tener más información. ¿Me podrías contar un poco más? Gracias.');
  document.getElementById('pdWhatsApp').href='https://wa.me/5491157044003?text='+msg;
  modal.classList.add('show');
  document.body.style.overflow='hidden';
}

function closeProductDetail(){
  document.getElementById('productDetail').classList.remove('show');
  document.body.style.overflow='';
}

function updateCatalogMenu(){
  var col=document.querySelector('.cat-col');
  if(!col)return;
  var links=col.querySelectorAll('a');
  // Rebuild brand links
  var h='<h4 class="cat-col-title">Líneas</h4><a href="#productos" data-brand="todas">Ver todas</a>';
  for(var i=0;i<customBrands.length;i++){
    h+='<div class="cat-brand-row">'
      +'<a href="#productos" data-brand="'+customBrands[i]+'">'+customBrands[i]+'</a>'
      +'<a href="categoria.html?cat='+encodeURIComponent(customBrands[i])+'" class="cat-vermas">Ver más</a>'
      +'</div>';
  }
  col.innerHTML=h;
  // Re-attach filter click handlers (only on data-brand links, not on cat-vermas)
  var newLinks=col.querySelectorAll('a[data-brand]');
  for(var i=0;i<newLinks.length;i++){(function(a){a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();setBrand(a.getAttribute('data-brand'));document.querySelector('.nav-cat').classList.remove('open');document.getElementById('navMenu').classList.remove('open');document.getElementById('productos').scrollIntoView({behavior:'smooth'})})})(newLinks[i])}
}

function updateFilterPills(){
  var catCol=document.querySelectorAll('.cat-col')[1];
  if(catCol){
    var h='<h4 class="cat-col-title">Categorías</h4>';
    for(var i=0;i<customTags.length;i++){
      h+='<a href="#productos" data-tag="'+customTags[i]+'">'+customTags[i]+'</a>';
    }
    catCol.innerHTML=h;
    // Re-attach tag click handlers
    var tagLinks=catCol.querySelectorAll('a[data-tag]');
    for(var i=0;i<tagLinks.length;i++){(function(a){a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();activeTag=a.getAttribute('data-tag');render();document.querySelector('.nav-cat').classList.remove('open');document.getElementById('navMenu').classList.remove('open');document.getElementById('productos').scrollIntoView({behavior:'smooth'})})})(tagLinks[i])}
  }
  // Update pills in products bar
  var bar=document.querySelector('.products-bar .pills');
  // Also update brand dropdown
  var bsel=document.getElementById('brandSelOpts');
  if(bsel){
    var bh='<div class="brand-opt active" data-brand="todas">Todas</div>';
    for(var i=0;i<customBrands.length;i++){
      bh+='<div class="brand-opt" data-brand="'+customBrands[i]+'">'+customBrands[i]+'</div>';
    }
    bsel.innerHTML=bh;
  }
}

function loadMeta(){
  if(!db)return;
  db.collection('meta').doc('config').get().then(function(doc){
    if(doc.exists){var d=doc.data();if(d.tags&&d.tags.length)customTags=d.tags;if(d.brands&&d.brands.length)customBrands=d.brands;}
    updateCatalogMenu();
    updateFilterPills();
  }).catch(function(){});
}

document.addEventListener('DOMContentLoaded',function(){
  var nav=document.getElementById('nav');

  // ── Hero logo: parallax + bloom + tilt on scroll ────────────────────────
  var heroLogo=document.querySelector('.hero-logo');
  var heroSection=document.querySelector('.hero');
  var logoTilt=0, logoPrevY=0, logoRaf=false;

  function applyLogoScroll(){
    if(!heroLogo||!heroSection){logoRaf=false;return;}
    var sy=window.scrollY;
    var heroH=heroSection.offsetHeight;
    var p=Math.min(Math.max(sy/heroH,0),1);

    // Scale: bloom to 1.28 at p≈0.18, then shrink to 0.58 at p=1
    var scale=p<=0.18
      ?1+(p/0.18)*0.28
      :1.28-((p-0.18)/0.82)*0.70;
    scale=Math.max(0.58,scale);

    // Parallax: logo floats up at 48% of scroll speed
    var ty=-(sy*0.48);

    // Direction tilt (±5°) — eases in/out with scroll momentum
    var delta=sy-logoPrevY;
    logoTilt+=(delta*0.12-logoTilt)*0.14;
    logoTilt=Math.max(-5,Math.min(5,logoTilt));
    logoPrevY=sy;

    // Opacity: full until p=0.50, then fades to 0 at p=0.90
    var opacity=p<0.50?1:Math.max(0,1-(p-0.50)/0.40);

    // Glow: intensifies at peak scale, then dims
    var gi=p<=0.18?p/0.18:Math.max(0,1-(p-0.18)/0.35);
    var gpx=(30+gi*90).toFixed(0);
    var ga=(0.12+gi*0.45).toFixed(2);

    heroLogo.style.transform=
      'translateY('+ty.toFixed(1)+'px) '+
      'scale('+scale.toFixed(4)+') '+
      'rotate('+logoTilt.toFixed(2)+'deg)';
    heroLogo.style.opacity=opacity.toFixed(3);
    heroLogo.style.filter='drop-shadow(0 0 '+gpx+'px rgba(200,149,108,'+ga+'))';
    logoRaf=false;
  }

  window.addEventListener('scroll',function(){
    nav.classList.toggle('compact',window.scrollY>60);
    if(!logoRaf){logoRaf=true;requestAnimationFrame(applyLogoScroll);}
  },{passive:true});

  applyLogoScroll(); // set initial state on page load

  // Hamburger
  document.getElementById('hamburger').addEventListener('click',function(){var m=document.getElementById('navMenu');m.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':''});
  document.getElementById('navClose').addEventListener('click',function(){document.getElementById('navMenu').classList.remove('open');document.body.style.overflow=''});

  // Language flags
  var langFlags=document.querySelectorAll('.lang-flag');
  for(var i=0;i<langFlags.length;i++){(function(f){f.addEventListener('click',function(){
    for(var j=0;j<langFlags.length;j++)langFlags[j].classList.remove('active');
    f.classList.add('active');
    setLang(f.getAttribute('data-lang'));
  })})(langFlags[i])}

  // Custom confirm handlers
  var cy=document.getElementById('confirmYes');if(cy)cy.addEventListener('click',function(){
    var cm=document.getElementById('confirmModal');if(cm)cm.classList.remove('show');
    if(confirmCallback)confirmCallback();confirmCallback=null;
  });
  var cn=document.getElementById('confirmNo');if(cn)cn.addEventListener('click',function(){
    var cm=document.getElementById('confirmModal');if(cm)cm.classList.remove('show');
    confirmCallback=null;
  });

  // Close mobile menu on non-catalog link click
  var menuAs=document.querySelectorAll('.nav-menu > li > a:not(.nav-cat-trigger)');
  for(var i=0;i<menuAs.length;i++){menuAs[i].addEventListener('click',function(){document.getElementById('navMenu').classList.remove('open');document.body.style.overflow=''})}

  // Catalogo dropdown toggle
  var navCat=document.querySelector('.nav-cat');
  document.querySelector('.nav-cat-trigger').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();navCat.classList.toggle('open')});
  document.addEventListener('click',function(e){if(!e.target.closest('.nav-cat'))navCat.classList.remove('open')});

  // Catalog brand links
  var catLinks=document.querySelectorAll('.nav-cat-menu a[data-brand]');
  for(var i=0;i<catLinks.length;i++){(function(a){a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();setBrand(a.getAttribute('data-brand'));navCat.classList.remove('open');document.getElementById('navMenu').classList.remove('open');document.getElementById('productos').scrollIntoView({behavior:'smooth'})})})(catLinks[i])}

  // Category tag links
  var tagLinks=document.querySelectorAll('.nav-cat-menu a[data-tag]');
  for(var i=0;i<tagLinks.length;i++){(function(a){a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var tag=a.getAttribute('data-tag');activeTag=tag;var pills=document.querySelectorAll('.pill[data-tag]');for(var j=0;j<pills.length;j++){pills[j].classList.remove('active');if(pills[j].getAttribute('data-tag')===tag)pills[j].classList.add('active')}render();navCat.classList.remove('open');document.getElementById('navMenu').classList.remove('open');document.getElementById('productos').scrollIntoView({behavior:'smooth'})})})(tagLinks[i])}

  // Search
  document.getElementById('searchInput').addEventListener('input',render);

  // Tag pills
  var pills=document.querySelectorAll('.pill[data-tag]');
  for(var i=0;i<pills.length;i++){(function(p){p.addEventListener('click',function(){for(var j=0;j<pills.length;j++)pills[j].classList.remove('active');p.classList.add('active');activeTag=p.getAttribute('data-tag');render()})})(pills[i])}

  // Brand dropdown
  var bs=document.getElementById('brandSel');
  document.getElementById('brandSelBtn').addEventListener('click',function(e){e.stopPropagation();bs.classList.toggle('open')});
  var opts=document.querySelectorAll('.brand-opt');
  for(var i=0;i<opts.length;i++){(function(o){o.addEventListener('click',function(){setBrand(o.getAttribute('data-brand'));bs.classList.remove('open')})})(opts[i])}
  document.addEventListener('click',function(e){if(!e.target.closest('.brand-sel'))bs.classList.remove('open')});

  // Admin login button — navigate to admin.html
  var loginBtn=document.getElementById('loginBtn');
  if(loginBtn)loginBtn.addEventListener('click',function(e){e.preventDefault();window.location.href='admin.html'});

  loadProducts();
  loadNovedades();
  loadFiles();
  loadMeta();
});