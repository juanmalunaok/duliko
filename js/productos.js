var HERO_IMG='assets/hero.jpg';
var defaultBrands=["ALL RICE","Autenta Foods","Clic-Clac","Dame maní","Edemy","El Celta","Farfalej","Frisbix","Green Crops","Lulemúu","Magla","Mixme","Natural Pop","Osem - Nestle","Rodez","Yin Yang"];

document.addEventListener('DOMContentLoaded',function(){
  var nav=document.getElementById('nav');
  window.addEventListener('scroll',function(){
    nav.classList.toggle('compact',window.scrollY>60);
  },{passive:true});

  loadBrands();
});

function loadBrands(){
  var grid=document.getElementById('brandsGrid');
  if(!db){
    renderBrandsStatic(defaultBrands,{},grid);
    return;
  }
  // Load meta config for brand list, then load all products to get images + counts
  db.collection('meta').doc('config').get().then(function(doc){
    var brands=defaultBrands;
    if(doc.exists&&doc.data().brands&&doc.data().brands.length){
      brands=doc.data().brands;
    }
    return db.collection('products').get().then(function(snap){
      // Group by brand: {brandName: {count, image}}
      var brandData={};
      brands.forEach(function(b){brandData[b]={count:0,image:''};});
      snap.forEach(function(d){
        var p=d.data();
        var cat=p.category||'';
        brands.forEach(function(b){
          if(cat.indexOf(b)>=0){
            brandData[b].count++;
            if(!brandData[b].image&&p.image)brandData[b].image=p.image;
          }
        });
      });
      renderBrandsStatic(brands,brandData,grid);
    });
  }).catch(function(){
    renderBrandsStatic(defaultBrands,{},grid);
  });
}

function renderBrandsStatic(brands,brandData,grid){
  if(!brands.length){
    grid.innerHTML='<div class="brands-loading">No hay marcas disponibles.</div>';
    return;
  }
  var h='';
  for(var i=0;i<brands.length;i++){
    var b=brands[i];
    var data=brandData[b]||{count:0,image:''};
    var img=data.image||HERO_IMG;
    var count=data.count;
    var countText=count>0?(count+' producto'+(count!==1?'s':'')):'';
    h+='<div class="brand-card">'
      +'<div class="brand-card-img"><img src="'+img+'" alt="'+b+'" loading="lazy"></div>'
      +'<div class="brand-card-body">'
      +'<div class="brand-card-name">'+b+'</div>'
      +(countText?'<div class="brand-card-count">'+countText+'</div>':'')
      +'<a href="categoria.html?cat='+encodeURIComponent(b)+'" class="brand-card-btn">'
      +'Ver más <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
      +'</a>'
      +'</div>'
      +'</div>';
  }
  grid.innerHTML=h;

  // Scroll entrance animation
  var cards=grid.querySelectorAll('.brand-card');
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        setTimeout(function(){e.target.style.transitionDelay='';},900);
        io.unobserve(e.target);
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -20px 0px'});
  for(var i=0;i<cards.length;i++){
    cards[i].style.transitionDelay=(i*0.06)+'s';
    io.observe(cards[i]);
  }
}
