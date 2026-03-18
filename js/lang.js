var LANG='es';
var TR={'Quiénes somos':{'en':'About Us','pt':'Sobre Nós'},'Catálogo':{'en':'Catalog','pt':'Catálogo'},'Contacto':{'en':'Contact','pt':'Contato'},'Teléfono':{'en':'Phone','pt':'Telefone'},'Email':{'en':'Email','pt':'Email'},'Instagram':{'en':'Instagram','pt':'Instagram'},'Explorá nuestro catálogo completo.':{'en':'Explore our complete catalog.','pt':'Explore nosso catálogo completo.'},'Estamos para ayudarte.':{'en':'We are here to help you.','pt':'Estamos aqui para ajudá-lo.'},'+45 años':{'en':'45+ years','pt':'45+ anos'},'Calidad certificada':{'en':'Certified quality','pt':'Qualidade certificada'},'Distribución nacional':{'en':'National distribution','pt':'Distribuição nacional'},'Caballito, CABA':{'en':'Caballito, Buenos Aires','pt':'Caballito, Buenos Aires'},'Todos':{'en':'All','pt':'Todos'},'Ver Productos':{'en':'View Products','pt':'Ver Produtos'},'Contactanos':{'en':'Contact Us','pt':'Contato'},'Ingresar':{'en':'Login','pt':'Entrar'},'Líneas':{'en':'Product Lines','pt':'Linhas'},'Categorías':{'en':'Categories','pt':'Categorias'},'Importados':{'en':'Imported','pt':'Importados'},'Sin Lactosa':{'en':'Lactose Free','pt':'Sem Lactose'},'Orgánicos':{'en':'Organic','pt':'Orgânicos'},'Vegano':{'en':'Vegan','pt':'Vegano'},'Próximamente':{'en':'Coming Soon','pt':'Em breve'},'Descargas':{'en':'Downloads','pt':'Downloads'},'Archivos y catálogos':{'en':'Files and catalogs','pt':'Arquivos e catálogos'},'Descargá nuestros catálogos y materiales.':{'en':'Download our catalogs and materials.','pt':'Baixe nossos catálogos e materiais.'},'Nuevas líneas en camino':{'en':'New product lines coming','pt':'Novas linhas a caminho'},};
function setLang(lang){
  LANG=lang;
  var flags=document.querySelectorAll('.lang-flag');
  for(var i=0;i<flags.length;i++){flags[i].classList.toggle('active',flags[i].getAttribute('data-lang')===lang)}
  // Translate ALL elements with data-es attribute
  var els=document.querySelectorAll('[data-es]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    var txt=lang==='es'?el.getAttribute('data-es'):lang==='pt'?(el.getAttribute('data-pt')||el.getAttribute('data-es')):(el.getAttribute('data-en')||el.getAttribute('data-es'));
    if(el.tagName==='INPUT'){el.placeholder=txt}else{el.textContent=txt}
  }
  // Nav links
  var navAs=document.querySelectorAll('.nav-menu > li > a:not(.nav-cat-trigger)');
  var navTR={'Descargas':{'en':'Downloads','pt':'Downloads'},'Quiénes Somos':{'en':'About Us','pt':'Sobre Nós'},'Novedades':{'en':'News','pt':'Novidades'},'Contáctenos':{'en':'Contact Us','pt':'Contato'}};
  for(var i=0;i<navAs.length;i++){
    var a=navAs[i];
    if(!a.getAttribute('data-es')){a.setAttribute('data-es',a.textContent)}
    var t=a.getAttribute('data-es');
    var tr=navTR[t]||{};
    a.setAttribute('data-en',tr.en||t);
    a.setAttribute('data-pt',tr.pt||t);
    a.textContent=lang==='es'?t:lang==='pt'?(tr.pt||t):(tr.en||t);
  }
  // Section labels, titles, descs, feats
  var sels=document.querySelectorAll('.section-label,.section-desc,.cat-col-title,.feat,.nov-date,.nov-card h3,.nov-card p,.c-card h3,.footer-copy');
  var TR2=window.TR||{};
  for(var i=0;i<sels.length;i++){
    var el=sels[i];
    if(el.getAttribute('data-es'))continue;
    if(el.childElementCount>0)continue;
    var t=el.textContent.trim();
    el.setAttribute('data-es',t);
    var tr=TR2[t]||{};
    el.setAttribute('data-en',tr.en||t);
    el.setAttribute('data-pt',tr.pt||t);
    el.textContent=lang==='es'?t:lang==='pt'?(tr.pt||t):(tr.en||t);
  }
  // Buttons and pills
  var btns=document.querySelectorAll('.btn,.pill');
  for(var i=0;i<btns.length;i++){
    var b=btns[i];
    if(!b.getAttribute('data-es')){
      b.setAttribute('data-es',b.textContent);
      var t=b.textContent.trim();
      var tr=TR2[t]||{};
      b.setAttribute('data-en',tr.en||t);
      b.setAttribute('data-pt',tr.pt||t);
    }
    b.textContent=lang==='es'?b.getAttribute('data-es'):lang==='pt'?(b.getAttribute('data-pt')||b.getAttribute('data-es')):(b.getAttribute('data-en')||b.getAttribute('data-es'));
  }
  // Catalog trigger
  var ct=document.querySelector('.nav-cat-trigger');
  if(ct){var span=ct.childNodes[0];if(span&&span.nodeType===3){span.textContent=lang==='es'?'Catálogo ':lang==='pt'?'Catálogo ':'Catalog '}}
  // Search placeholder
  var si=document.getElementById('searchInput');
  if(si)si.placeholder=lang==='es'?'Buscar productos, marcas...':lang==='pt'?'Buscar produtos, marcas...':'Search products, brands...';
}