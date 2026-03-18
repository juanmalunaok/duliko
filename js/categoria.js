var HERO_IMG='assets/hero.jpg';
var catProducts=[];
var catParam=new URLSearchParams(window.location.search).get('cat')||'';

document.addEventListener('DOMContentLoaded',function(){
  var nav=document.getElementById('nav');

  // Set page title + heading from URL param
  if(catParam){
    document.getElementById('catTitle').textContent=catParam;
    document.title=catParam+' — Duliko SRL';
  } else {
    document.getElementById('catTitle').textContent='Catálogo completo';
    document.title='Catálogo — Duliko SRL';
  }

  // Compact nav on scroll
  window.addEventListener('scroll',function(){
    nav.classList.toggle('compact',window.scrollY>60);
  },{passive:true});

  if(!catParam){
    document.getElementById('catGrid').innerHTML='<p style="text-align:center;padding:60px;color:var(--text2);grid-column:1/-1">No se especificó una categoría.</p>';
    return;
  }

  loadCatProducts();
});

function loadCatProducts(){
  var g=document.getElementById('catGrid');
  if(!db){
    g.innerHTML='<p style="text-align:center;padding:60px;color:var(--text2);grid-column:1/-1">No se pudo conectar con la base de datos.</p>';
    return;
  }
  db.collection('products').get().then(function(snap){
    var products=[];
    snap.forEach(function(doc){
      var p=doc.data();p.id=doc.id;
      if(p.category&&p.category.indexOf(catParam)>=0)products.push(p);
    });
    catProducts=products;
    renderCatProducts(products,g);
  }).catch(function(){
    g.innerHTML='<p style="text-align:center;padding:60px;color:var(--text2);grid-column:1/-1">Error al cargar los productos.</p>';
  });
}

function renderCatProducts(products,g){
  var countEl=document.getElementById('catCount');
  if(countEl)countEl.textContent=products.length+' producto'+(products.length!==1?'s':'');

  if(!products.length){
    g.innerHTML='<div class="no-results" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><h3 style="margin-bottom:6px">Sin productos en esta categoría</h3><p>Intentá con otra categoría</p></div>';
    return;
  }

  var h='';
  for(var i=0;i<products.length;i++){
    var p=products[i];var b='';
    if(p.tags){for(var j=0;j<p.tags.length;j++){b+='<span class="p-tag">'+p.tags[j]+'</span>';}}
    h+='<div class="p-card" style="cursor:pointer" data-idx="'+i+'">'
      +'<div class="p-card-img"><img src="'+(p.image||HERO_IMG)+'" alt="'+p.name+'" loading="lazy">'+b+'</div>'
      +'<div class="p-card-body"><div class="p-card-cat">'+p.category+'</div>'
      +'<h3 class="p-card-name">'+p.name+'</h3>'
      +'<p class="p-card-desc">'+(p.description||'')+'</p></div></div>';
  }
  g.innerHTML=h;

  // Click handlers
  var cards=g.querySelectorAll('.p-card');
  for(var ci=0;ci<cards.length;ci++){
    (function(idx){
      cards[idx].addEventListener('click',function(){openCatDetail(idx);});
    })(ci);
  }

  // NK-style scroll entrance animation
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

function openCatDetail(idx){
  var product=catProducts[idx];
  if(!product)return;
  var modal=document.getElementById('productDetail');
  if(!modal)return;
  document.getElementById('pdImg').src=product.image||HERO_IMG;
  document.getElementById('pdCat').textContent=product.category||'';
  document.getElementById('pdName').textContent=product.name||'';
  document.getElementById('pdDesc').textContent=product.description||'';
  var tagsHtml='';
  if(product.tags&&product.tags.length){
    for(var i=0;i<product.tags.length;i++){tagsHtml+='<span class="pd-tag">'+product.tags[i]+'</span>';}
  }
  document.getElementById('pdTags').innerHTML=tagsHtml;
  var msg=encodeURIComponent('Hola, ¿cómo estás? Vi este producto en la Web y me interesaría tener más información. ¿Me podrías contar un poco más? Gracias.');
  document.getElementById('pdWhatsApp').href='https://wa.me/5491157044003?text='+msg;
  modal.classList.add('show');
  document.body.style.overflow='hidden';
}

function closeCatDetail(){
  document.getElementById('productDetail').classList.remove('show');
  document.body.style.overflow='';
}
