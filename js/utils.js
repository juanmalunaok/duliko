// Override alert to use in-page toast
window._origAlert=window.alert;
window.alert=function(msg){if(typeof showToast==='function')showToast(msg,'error');else window._origAlert(msg)};

var confirmCallback=null;

function showToast(msg,type){
  var t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;
  t.className='toast'+(type?' '+type:'');
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},3000);
}

function customConfirm(msg,cb){
  document.getElementById('confirmMsg').textContent=msg;
  confirmCallback=cb;
  var cm=document.getElementById('confirmModal');if(cm)cm.classList.add('show');
}

function openLightbox(src){
  var lb=document.getElementById('lightbox');
  var li=document.getElementById('lightboxImg');if(li)li.src=src;
  lb.classList.add('show');
}
function closeLightbox(){document.getElementById('lightbox').classList.remove('show')}