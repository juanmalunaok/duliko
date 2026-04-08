// ─── Catálogo estático ────────────────────────────────────────────────────
// Carga data/products.json del mismo servidor (mucho más rápido que Firestore)
// Para deshabilitar: quitar <script src="js/catalog-static.js"> en index.html
// ─────────────────────────────────────────────────────────────────────────

var STATIC_CATALOG_URL = '/data/products.json';
var STATIC_CATALOG_SECRET = 'dul1k0pub_2024';

// Carga productos desde el archivo estático del servidor
// onSuccess(products[]) si hay datos, onFail() si está vacío o hay error
function loadStaticCatalog(onSuccess, onFail) {
  fetch(STATIC_CATALOG_URL + '?_=' + Date.now(), { cache: 'no-store' })
    .then(function(r) { if (!r.ok) throw new Error('no ok'); return r.json(); })
    .then(function(arr) {
      if (arr && arr.length > 0) { onSuccess(arr); } else { onFail(); }
    })
    .catch(function() { onFail(); });
}

// Publica el catálogo actual de Firestore al servidor estático
// Llamar solo desde el panel admin (requiere db inicializado)
function publishStaticCatalog(onDone, onError) {
  if (!db) { if (onError) onError('Firebase no disponible'); return; }
  db.collection('products').get().then(function(s) {
    var prods = [];
    s.forEach(function(doc) {
      var p = doc.data();
      prods.push({
        id: doc.id,
        name: p.name || '',
        category: p.category || '',
        description: p.description || '',
        image: p.image || '',
        tags: p.tags || [],
        inStock: p.inStock !== false,
        order: p.order != null ? p.order : 99999
      });
    });
    prods.sort(function(a, b) { return a.order - b.order; });
    return fetch('/api/publish.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: STATIC_CATALOG_SECRET, products: prods })
    });
  }).then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.ok) { if (onDone) onDone(res.count); }
    else { if (onError) onError(res.error || 'Error desconocido'); }
  })
  .catch(function(e) { if (onError) onError(e.message); });
}
