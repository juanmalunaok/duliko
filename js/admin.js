var HERO_IMG='assets/hero.jpg';
var currentUser=null;
var customTags=["Sin TACC","Kosher","Importados","Orgánicos","Sin Lactosa","Vegano"];
var customBrands=["ALL RICE","Autenta Foods","Clic-Clac","Dame maní","Edemy","El Celta","Farfalej","Frisbix","Green Crops","Lulemúu","Magla","Mixme","Natural Pop","Osem - Nestle","Rodez","Yin Yang"];
var selectedTags=[];
var editingProductId=null;
var brandImages={};

function signInWithGoogle(){
  if(!auth){showErr('Firebase no configurado.');return}
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(r){
    if(AUTHORIZED_EMAILS.indexOf(r.user.email)===-1){showErr('Email no autorizado.');auth.signOut();return}
    onAuth(r.user)}).catch(function(e){showErr(e.message)});
}

function onAuth(u){
  currentUser=u;
  document.getElementById('adminLogin').style.display='none';
  document.getElementById('adminDashboard').classList.add('show');
  document.getElementById('adminUser').textContent='Logueado: '+u.email;
  var lbl=document.getElementById('loginBtn');
  if(lbl){lbl.textContent=u.displayName||'Admin';lbl.classList.add('logged-in')}
  loadDashboard();
  loadAdminList();
}

function signOutAdmin(){
  if(auth)auth.signOut();currentUser=null;
  document.getElementById('adminLogin').style.display='block';
  document.getElementById('adminDashboard').classList.remove('show');
  var _lb=document.getElementById('loginBtn');if(_lb)_lb.classList.remove('logged-in');
  var ll=document.getElementById('loginBtn');if(ll)ll.textContent='Ingresar';
}

function showErr(m){var e=document.getElementById('adminError');e.textContent=m;e.style.display='block';setTimeout(function(){e.style.display='none'},5000)}

function switchTab(t){
  var tabs=document.querySelectorAll('.a-tab');for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('active');
  var cs=document.querySelectorAll('.tab-c');for(var i=0;i<cs.length;i++)cs[i].classList.remove('active');
  document.querySelector('.a-tab[data-tab="'+t+'"]').classList.add('active');
  var tabId=t==='dashboard'?'tabDashboard':t==='add'?'tabAdd':t==='novedades'?'tabNovedades':t==='archivos'?'tabArchivos':t==='portadas'?'tabPortadas':'tabList';
  document.getElementById(tabId).classList.add('active');
  if(t==='list'||t==='novedades')loadAdminList();
  if(t==='portadas')loadBrandCovers();
  if(t==='dashboard')loadDashboard();
}

function handlePreview(e){
  var file=e.target.files[0];if(!file)return;
  var r=new FileReader();
  r.onload=function(ev){var old=document.querySelector('.file-up .preview');if(old)old.remove();var img=document.createElement('img');img.src=ev.target.result;img.className='preview';document.getElementById('fileUpload').appendChild(img)};
  r.readAsDataURL(file);
}

function saveProduct(){
  var n=document.getElementById('pName').value.trim();
  var cat=document.getElementById('pCat').value;
  var d=document.getElementById('pDesc').value.trim();
  var tags=selectedTags.slice();
  var imgFile=document.getElementById('pImage').files[0];
  var inStock=document.getElementById('pInStock')?document.getElementById('pInStock').checked:true;
  if(!n||!cat){showToast('Completá nombre y categoría.','error');return}
  if(!db){showToast('Firebase no configurado.','error');return}
  var btn=document.getElementById('saveProductBtn');btn.disabled=true;btn.textContent='Guardando...';

  if(editingProductId){
    // UPDATE existing product
    var p=Promise.resolve(null);
    if(imgFile&&storage){var ref=storage.ref('products/'+Date.now()+'_'+imgFile.name);p=ref.put(imgFile).then(function(){return ref.getDownloadURL()})}
    p.then(function(newUrl){
      var data={name:n,category:cat,description:d,tags:tags,inStock:inStock};
      if(newUrl)data.image=newUrl;
      return db.collection('products').doc(editingProductId).update(data);
    }).then(function(){
      showToast('Producto actualizado!','success');
      cancelEdit();
      loadAdminList();
    }).catch(function(e){showToast('Error: '+e.message,'error')})
    .finally(function(){btn.disabled=false;btn.textContent='Actualizar Producto'});
  } else {
    // CREATE new product
    var p=Promise.resolve('');
    if(imgFile&&storage){var ref=storage.ref('products/'+Date.now()+'_'+imgFile.name);p=ref.put(imgFile).then(function(){return ref.getDownloadURL()})}
    p.then(function(url){return db.collection('products').add({name:n,category:cat,description:d,tags:tags,inStock:inStock,image:url||'',createdAt:firebase.firestore.FieldValue.serverTimestamp(),createdBy:currentUser.email})})
    .then(function(){document.getElementById('pName').value='';document.getElementById('pCat').value='';document.getElementById('pDesc').value='';document.getElementById('pImage').value='';selectedTags=[];renderTagChips();var pv=document.querySelector('.file-up .preview');if(pv)pv.remove();showToast('Producto guardado!','success');loadAdminList()})
    .catch(function(e){showToast('Error: '+e.message,'error')})
    .finally(function(){btn.disabled=false;btn.textContent='Guardar Producto'});
  }
}

function editProduct(id){
  if(!db)return;
  db.collection('products').doc(id).get().then(function(doc){
    if(!doc.exists)return;
    var p=doc.data();
    editingProductId=id;
    switchTab('add');
    document.getElementById('pName').value=p.name||'';
    document.getElementById('pCat').value=p.category||'';
    document.getElementById('pDesc').value=p.description||'';
    var stockEl=document.getElementById('pInStock');
    if(stockEl)stockEl.checked=(p.inStock!==false);
    updateStockLabel();
    selectedTags=p.tags?p.tags.slice():[];
    renderTagChips();
    var banner=document.getElementById('editBanner');
    if(banner){banner.style.display='flex';}
    var btn=document.getElementById('saveProductBtn');
    if(btn)btn.textContent='Actualizar Producto';
    window.scrollTo({top:0,behavior:'smooth'});
  });
}

function cancelEdit(){
  editingProductId=null;
  document.getElementById('pName').value='';
  document.getElementById('pCat').value='';
  document.getElementById('pDesc').value='';
  var stockEl=document.getElementById('pInStock');if(stockEl){stockEl.checked=true;updateStockLabel();}
  document.getElementById('pImage').value='';
  var pv=document.querySelector('.file-up .preview');if(pv)pv.remove();
  selectedTags=[];renderTagChips();
  var banner=document.getElementById('editBanner');if(banner)banner.style.display='none';
  var btn=document.getElementById('saveProductBtn');if(btn)btn.textContent='Guardar Producto';
}

function updateStockLabel(){
  var el=document.getElementById('stockLabel');
  var ck=document.getElementById('pInStock');
  if(el&&ck)el.textContent=ck.checked?'En stock':'Sin stock';
}

function loadAdminList(){
  var l=document.getElementById('adminProductsList');
  if(!db){l.innerHTML='<p style="text-align:center;padding:32px;color:var(--text2)">Conectá Firebase para gestionar productos.</p>';return}
  l.innerHTML='<p style="text-align:center;padding:32px;color:var(--text2)">Cargando...</p>';
  db.collection('products').orderBy('createdAt','desc').get().then(function(s){
    if(s.empty){l.innerHTML='<p style="text-align:center;padding:32px;color:var(--text2)">Sin productos. Agregá uno nuevo.</p>';return}
    var h='';s.forEach(function(doc){var p=doc.data();var stockBadge=p.inStock===false?'<span class="a-stock out">Sin stock</span>':'<span class="a-stock in">En stock</span>';h+='<div class="a-item"><img class="a-thumb" src="'+(p.image||HERO_IMG)+'"><div class="a-info"><h4>'+p.name+stockBadge+'</h4><span>'+p.category+'</span></div><button class="btn-ed" onclick="editProduct(\''+doc.id+'\')" style="margin-right:6px">Editar</button><button class="a-del" onclick="deleteProduct(\''+doc.id+'\')">✕</button></div>'});
    l.innerHTML=h;
  });
  // Load novedades list too
  var nl=document.getElementById('adminNovedadesList');
  if(nl){
    db.collection('novedades').orderBy('date','desc').get().then(function(s){
      if(s.empty){nl.innerHTML='<p style="text-align:center;padding:16px;color:var(--text2)">Sin novedades.</p>';return}
      var h='';s.forEach(function(doc){var n=doc.data();h+='<div class="a-item"><div class="a-info"><h4>'+n.title+'</h4><span>'+(n.description||'').substring(0,60)+'</span></div><button class="a-del" onclick="deleteNovedad(\''+doc.id+'\')">✕</button></div>'});
      nl.innerHTML=h;
    });
  }
  // Load files in admin
  var fl=document.getElementById('adminFilesList');
  if(fl){
    db.collection('archivos').orderBy('date','desc').get().then(function(s){
      if(s.empty){fl.innerHTML='<p style="text-align:center;padding:16px;color:var(--text2)">Sin archivos.</p>';return}
      var h='';s.forEach(function(doc){var f=doc.data();h+='<div class="a-item"><div class="a-info"><h4>'+f.title+'</h4><span>'+f.filename+'</span></div><button class="a-del" onclick="deleteFile(\''+doc.id+'\')">&times;</button></div>'});
      fl.innerHTML=h;
    });
  }
}

function deleteProduct(id){
  customConfirm('¿Eliminar este producto?',function(){
    if(!db)return;
    db.collection('products').doc(id).delete().then(function(){loadAdminList()}).catch(function(e){showToast('Error: '+e.message,'error')});
  });
}

function saveNovedad(){
  if(!db)return;
  var title=document.getElementById('novTitle').value;
  var desc=document.getElementById('novDesc').value;
  var file=document.getElementById('novImage').files[0];
  if(!title){showToast('Completá el título.','error');return}
  var btn=document.querySelector('#tabNovedades button[onclick]');
  if(btn)btn.disabled=true;
  var p=file&&storage?storage.ref('novedades/'+Date.now()+'_'+file.name).put(file).then(function(s){return s.ref.getDownloadURL()}):Promise.resolve('');
  p.then(function(url){
    return db.collection('novedades').add({title:title,description:desc,image:url||'',date:firebase.firestore.FieldValue.serverTimestamp(),createdBy:currentUser.email});
  }).then(function(){
    document.getElementById('novTitle').value='';
    document.getElementById('novDesc').value='';
    document.getElementById('novImage').value='';
    if(btn)btn.disabled=false;
    showToast('Novedad publicada','success');
    loadAdminList();
  }).catch(function(e){showToast('Error: '+e.message,'error');if(btn)btn.disabled=false});
}

function deleteNovedad(id){
  customConfirm('¿Eliminar esta novedad?',function(){
    if(!db)return;
    db.collection('novedades').doc(id).delete().then(function(){loadAdminList()});
  });
}

function renderTagChips(){
  var w=document.getElementById('pTagsWrap');
  if(!w)return;
  var h='';
  for(var i=0;i<customTags.length;i++){
    var t=customTags[i];
    var active=selectedTags.indexOf(t)>=0;
    h+='<span class="tag-chip'+(active?' active':'')+'" onclick="toggleTag(\''+t.replace(/'/g,"\\'")+'\')">'+ t+'<span class="tag-x" onclick="event.stopPropagation();removeTag('+i+')" title="Eliminar">✕</span></span>';
  }
  w.innerHTML=h;
  document.getElementById('pTags').value=selectedTags.join(',');
}

function removeTag(idx){
  var t=customTags[idx];
  customTags.splice(idx,1);
  var si=selectedTags.indexOf(t);
  if(si>=0)selectedTags.splice(si,1);
  saveMeta();
  renderTagChips();
  updateFilterPills();
}

function toggleTag(t){
  var idx=selectedTags.indexOf(t);
  if(idx>=0)selectedTags.splice(idx,1);else selectedTags.push(t);
  renderTagChips();
}

function addTag(){
  var input=document.getElementById('newTagInput');
  var t=input.value.trim();
  if(!t)return;
  if(customTags.indexOf(t)<0){customTags.push(t);saveMeta()}
  if(selectedTags.indexOf(t)<0)selectedTags.push(t);
  input.value='';
  renderTagChips();
  updateFilterPills();
}

function renderBrandSelect(){
  var sel=document.getElementById('pCat');
  if(!sel)return;
  var h='<option value="">Seleccionar línea...</option>';
  for(var i=0;i<customBrands.length;i++){
    h+='<option value="'+customBrands[i]+'">'+customBrands[i]+'</option>';
  }
  sel.innerHTML=h;
  // Render brand list with delete
  var list=document.getElementById('brandsList');
  if(list){
    var bl='';
    for(var i=0;i<customBrands.length;i++){
      bl+='<span class="tag-chip"><span>'+customBrands[i]+'</span><span class="tag-x" onclick="removeBrand('+i+')" title="Eliminar">✕</span></span>';
    }
    list.innerHTML=bl;
  }
}

function removeBrand(idx){
  customConfirm('¿Eliminar la marca '+customBrands[idx]+'?',function(){
    customBrands.splice(idx,1);
    saveMeta();
    renderBrandSelect();
    updateCatalogMenu();
  });
}

function addBrand(){
  var input=document.getElementById('newBrandInput');
  var b=input.value.trim();
  if(!b)return;
  if(customBrands.indexOf(b)<0){customBrands.push(b);saveMeta()}
  input.value='';
  renderBrandSelect();
  updateCatalogMenu();
  document.getElementById('pCat').value=b;
}

function loadDashboard(){
  if(!db)return;
  db.collection('products').get().then(function(s){
    var recent=[];
    s.forEach(function(d){var p=d.data();p._id=d.id;recent.push(p)});
    recent.sort(function(a,b){var ta=a.createdAt?a.createdAt.seconds:0,tb=b.createdAt?b.createdAt.seconds:0;return tb-ta});
    var rl=document.getElementById('dashRecentList');
    if(!rl)return;
    if(!recent.length){rl.innerHTML='<p style="color:var(--ad-text2);font-size:.85rem">Sin productos todavía.</p>';return}
    var h='<table class="dash-recent-table"><thead><tr><th>Producto</th><th>Marca</th><th>Stock</th></tr></thead><tbody>';
    for(var i=0;i<Math.min(8,recent.length);i++){
      var p=recent[i];
      var stockBadge=p.inStock===false?'<span class="a-stock out">Sin stock</span>':'<span class="a-stock in">En stock</span>';
      h+='<tr><td><div class="dash-td-img"><img src="'+(p.image||HERO_IMG)+'" alt=""><span>'+p.name+'</span></div></td><td class="dash-td-cat">'+p.category+'</td><td>'+stockBadge+'</td></tr>';
    }
    h+='</tbody></table>';
    rl.innerHTML=h;
  });
}

// Stubs — these elements exist only on the public page
function updateCatalogMenu(){}
function updateFilterPills(){}
function loadFiles(){} // public Downloads section — no-op on admin.html

function saveMeta(){
  if(!db)return;
  db.collection('meta').doc('config').set({tags:customTags,brands:customBrands},{merge:true});
}

function loadMeta(){
  if(!db)return;
  db.collection('meta').doc('config').get().then(function(doc){
    if(doc.exists){var d=doc.data();if(d.tags&&d.tags.length)customTags=d.tags;if(d.brands&&d.brands.length)customBrands=d.brands;if(d.brandImages)brandImages=d.brandImages;}
    renderTagChips();
    renderBrandSelect();
  }).catch(function(){renderTagChips();renderBrandSelect()});
}

function loadBrandCovers(){
  if(!db){renderBrandCovers();return}
  db.collection('meta').doc('config').get().then(function(doc){
    if(doc.exists&&doc.data().brandImages)brandImages=doc.data().brandImages;
    renderBrandCovers();
  }).catch(function(){renderBrandCovers()});
}

function renderBrandCovers(){
  var c=document.getElementById('tabPortadas');
  if(!c)return;
  var h='<div style="padding:16px"><h3 style="font-family:Space Grotesk,sans-serif;margin-bottom:4px">Portadas de marcas</h3>'
    +'<p style="font-size:.85rem;color:var(--text2);margin-bottom:16px">Estas imágenes se muestran en la página de Nuestros Productos.</p>';
  for(var i=0;i<customBrands.length;i++){
    var b=customBrands[i];
    var img=brandImages[b]||'';
    h+='<div class="brand-cover-row">'
      +'<div class="brand-cover-preview">'+(img?'<img src="'+img+'" alt="'+b+'">':'<span class="no-img">Sin imagen</span>')+'</div>'
      +'<div class="brand-cover-info"><strong>'+b+'</strong>'
      +'<input type="file" accept="image/*" data-brand="'+b+'" onchange="uploadBrandCover(\''+b.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\'   ,this)" style="display:block;margin-top:6px;font-size:.82rem">'
      +(img?'<button onclick="clearBrandCover(\''+b.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')" style="margin-top:4px;background:none;border:none;color:#DC503C;cursor:pointer;font-size:.82rem">✕ Quitar imagen</button>':'')
      +'</div></div>';
  }
  h+='</div>';
  c.innerHTML=h;
}

function uploadBrandCover(brand,input){
  var file=input.files[0];
  if(!file||!storage){showToast('Storage no configurado.','error');return}
  input.disabled=true;
  var ref=storage.ref('brands/'+Date.now()+'_'+file.name);
  ref.put(file).then(function(){return ref.getDownloadURL()}).then(function(url){
    brandImages[brand]=url;
    saveBrandImages();
    renderBrandCovers();
    showToast('Portada actualizada','success');
  }).catch(function(e){showToast('Error: '+e.message,'error');input.disabled=false});
}

function clearBrandCover(brand){
  delete brandImages[brand];
  saveBrandImages();
  renderBrandCovers();
}

function saveBrandImages(){
  if(!db)return;
  db.collection('meta').doc('config').set({brandImages:brandImages},{merge:true});
}

function uploadFile(){
  if(!db||!storage)return;
  var title=document.getElementById('fileTitle').value.trim();
  var file=document.getElementById('fileUploadPDF').files[0];
  if(!title||!file){showToast('Completá nombre y seleccioná un PDF.','error');return}
  var btn=document.querySelector('#tabArchivos button[onclick]');
  if(btn){btn.disabled=true;btn.textContent='Subiendo...';}
  storage.ref('archivos/'+Date.now()+'_'+file.name).put(file).then(function(s){
    return s.ref.getDownloadURL();
  }).then(function(url){
    return db.collection('archivos').add({title:title,url:url,filename:file.name,date:firebase.firestore.FieldValue.serverTimestamp(),createdBy:currentUser.email});
  }).then(function(){
    document.getElementById('fileTitle').value='';
    document.getElementById('fileUploadPDF').value='';
    if(btn){btn.disabled=false;btn.textContent='Subir archivo';}
    showToast('Archivo subido','success');
    loadAdminList();
    loadFiles();
  }).catch(function(e){
    showToast('Error: '+e.message,'error');
    if(btn){btn.disabled=false;btn.textContent='Subir archivo';}
  });
}

function deleteFile(id){
  customConfirm('¿Eliminar este archivo?',function(){
    if(!db)return;
    db.collection('archivos').doc(id).delete().then(function(){loadAdminList();loadFiles()});
  });
}

document.addEventListener('DOMContentLoaded',function(){
  // Dark mode
  var darkBtn=document.getElementById('darkToggle');
  if(localStorage.getItem('adminDark')==='1'){document.body.setAttribute('data-dark','');if(darkBtn)darkBtn.textContent='☀️';}
  if(darkBtn)darkBtn.addEventListener('click',function(){
    if(document.body.hasAttribute('data-dark')){
      document.body.removeAttribute('data-dark');darkBtn.textContent='🌙';localStorage.setItem('adminDark','0');
    }else{
      document.body.setAttribute('data-dark','');darkBtn.textContent='☀️';localStorage.setItem('adminDark','1');
    }
  });

  // Custom confirm handlers
  var cy=document.getElementById('confirmYes');if(cy)cy.addEventListener('click',function(){
    var cm=document.getElementById('confirmModal');if(cm)cm.classList.remove('show');
    if(confirmCallback)confirmCallback();confirmCallback=null;
  });
  var cn=document.getElementById('confirmNo');if(cn)cn.addEventListener('click',function(){
    var cm=document.getElementById('confirmModal');if(cm)cm.classList.remove('show');
    confirmCallback=null;
  });

  // Google sign-in
  var gs=document.getElementById('googleSignIn');if(gs)gs.addEventListener('click',signInWithGoogle);

  // Sign out
  var so=document.getElementById('signOutBtn');if(so)so.addEventListener('click',signOutAdmin);

  // Admin tabs
  var aTabs=document.querySelectorAll('.a-tab');
  for(var i=0;i<aTabs.length;i++){(function(t){t.addEventListener('click',function(){switchTab(t.getAttribute('data-tab'))})})(aTabs[i])}

  // Product image preview
  var pi=document.getElementById('pImage');if(pi)pi.addEventListener('change',handlePreview);
  // Stock toggle label
  var pis=document.getElementById('pInStock');if(pis)pis.addEventListener('change',updateStockLabel);

  // Save product
  var spb=document.getElementById('saveProductBtn');if(spb)spb.addEventListener('click',saveProduct);

  // Auth state
  if(auth&&typeof auth.onAuthStateChanged==='function'){
    auth.onAuthStateChanged(function(u){if(u&&AUTHORIZED_EMAILS.indexOf(u.email)!==-1)onAuth(u)});
  }

  loadMeta();
});