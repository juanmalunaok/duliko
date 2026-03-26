var LANG='es';
var TR={
  'Quiénes somos':{'en':'About Us','pt':'Sobre Nós'},
  'Catálogo':{'en':'Catalog','pt':'Catálogo'},
  'Novedades':{'en':'News','pt':'Novidades'},
  'Contacto':{'en':'Contact','pt':'Contato'},
  'Teléfono':{'en':'Phone','pt':'Telefone'},
  'Email':{'en':'Email','pt':'Email'},
  'Instagram':{'en':'Instagram','pt':'Instagram'},
  'WhatsApp':{'en':'WhatsApp','pt':'WhatsApp'},
  'Explorá nuestro catálogo completo.':{'en':'Explore our complete catalog.','pt':'Explore nosso catálogo completo.'},
  'Estamos para ayudarte.':{'en':'We are here to help you.','pt':'Estamos aqui para ajudá-lo.'},
  'Todos':{'en':'All','pt':'Todos'},
  'Ver Productos':{'en':'View Products','pt':'Ver Produtos'},
  'Contactanos':{'en':'Contact Us','pt':'Contato'},
  'Ingresar':{'en':'Login','pt':'Entrar'},
  'Líneas':{'en':'Product Lines','pt':'Linhas'},
  'Categorías':{'en':'Categories','pt':'Categorias'},
  'Importados':{'en':'Imported','pt':'Importados'},
  'Sin Lactosa':{'en':'Lactose Free','pt':'Sem Lactose'},
  'Orgánicos':{'en':'Organic','pt':'Orgânicos'},
  'Vegano':{'en':'Vegan','pt':'Vegano'},
  'Próximamente':{'en':'Coming Soon','pt':'Em breve'},
  'Seguinos':{'en':'Follow us','pt':'Siga-nos'},
  'Descargas':{'en':'Downloads','pt':'Downloads'},
  'Archivos y catálogos':{'en':'Files and catalogs','pt':'Arquivos e catálogos'},
  'Nuevas líneas en camino':{'en':'New product lines coming','pt':'Novas linhas a caminho'},
  '@duliko.ok en Instagram':{'en':'@duliko.ok on Instagram','pt':'@duliko.ok no Instagram'},
  'Quiénes Somos':{'en':'About Us','pt':'Sobre Nós'},
};
function setLang(lang){
  LANG=lang;
  document.documentElement.lang=lang==='es'?'es':lang==='pt'?'pt':'en';
  var titles={es:'Duliko SRL \u2014 Desde 1979',en:'Duliko SRL \u2014 Since 1979',pt:'Duliko SRL \u2014 Desde 1979'};
  document.title=titles[lang]||titles.es;
  if(window._heroUpdateLang)window._heroUpdateLang(lang);
  var flags=document.querySelectorAll('.lang-flag');
  for(var i=0;i<flags.length;i++){flags[i].classList.toggle('active',flags[i].getAttribute('data-lang')===lang)}
  // Elements with data-es (text only)
  var els=document.querySelectorAll('[data-es]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    if(el.getAttribute('data-i18n-html'))continue;
    var txt=lang==='es'?el.getAttribute('data-es'):lang==='pt'?(el.getAttribute('data-pt')||el.getAttribute('data-es')):(el.getAttribute('data-en')||el.getAttribute('data-es'));
    if(el.tagName==='INPUT'){el.placeholder=txt}else{el.textContent=txt}
  }
  // Elements with HTML content (contain links etc)
  var htmlEls=document.querySelectorAll('[data-i18n-html]');
  for(var i=0;i<htmlEls.length;i++){
    var el=htmlEls[i];
    var txt=lang==='es'?el.getAttribute('data-es'):lang==='pt'?(el.getAttribute('data-pt')||el.getAttribute('data-es')):(el.getAttribute('data-en')||el.getAttribute('data-es'));
    if(txt)el.innerHTML=txt;
  }
  // Nav links (that don't have data-es set in HTML)
  var navAs=document.querySelectorAll('.nav-menu > li > a:not(.nav-cat-trigger)');
  var navTR={'Descargas':{'en':'Downloads','pt':'Downloads'},'Quiénes Somos':{'en':'About Us','pt':'Sobre Nós'},'Novedades':{'en':'News','pt':'Novidades'},'Contáctenos':{'en':'Contact Us','pt':'Contato'}};
  for(var i=0;i<navAs.length;i++){
    var a=navAs[i];
    if(a.getAttribute('data-en'))continue;
    if(!a.getAttribute('data-es')){a.setAttribute('data-es',a.textContent.trim())}
    var t=a.getAttribute('data-es');
    var tr=navTR[t]||{};
    a.setAttribute('data-en',tr.en||t);
    a.setAttribute('data-pt',tr.pt||t);
    a.textContent=lang==='es'?t:lang==='pt'?(tr.pt||t):(tr.en||t);
  }
  // Section labels, dates, card headings (text-only nodes)
  var sels=document.querySelectorAll('.section-label,.section-desc,.cat-col-title,.feat,.nov-date,.nov-card h3,.c-card h3,.footer-copy');
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
      b.setAttribute('data-es',b.textContent.trim());
      var t=b.textContent.trim();
      var tr=TR2[t]||{};
      b.setAttribute('data-en',tr.en||t);
      b.setAttribute('data-pt',tr.pt||t);
    }
    b.textContent=lang==='es'?b.getAttribute('data-es'):lang==='pt'?(b.getAttribute('data-pt')||b.getAttribute('data-es')):(b.getAttribute('data-en')||b.getAttribute('data-es'));
  }
  // Catalog trigger label
  var ct=document.querySelector('.nav-cat-trigger');
  if(ct){var span=ct.childNodes[0];if(span&&span.nodeType===3){span.textContent=lang==='es'?'Cat\u00e1logo ':lang==='pt'?'Cat\u00e1logo ':'Catalog '}}
  // Search placeholder
  var si=document.getElementById('searchInput');
  if(si)si.placeholder=lang==='es'?'Buscar productos, marcas...':lang==='pt'?'Buscar produtos, marcas...':'Search products, brands...';
  // Brand label (when "all brands" selected)
  var bl=document.getElementById('brandLabel');
  if(bl&&(bl.getAttribute('data-brand-all')||bl.textContent.trim()==='Todas las marcas'||bl.textContent.trim()==='All brands'||bl.textContent.trim()==='Todas as marcas')){
    var blt={es:'Todas las marcas',en:'All brands',pt:'Todas as marcas'};
    bl.textContent=blt[lang]||blt.es;
    bl.setAttribute('data-brand-all','1');
  }
  // Re-render products to update dynamic translated text
  if(typeof render==='function')render();
}
