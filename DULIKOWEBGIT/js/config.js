var FIREBASE_CONFIG={apiKey:"AIzaSyA05tUk_mB7yapeo08UHg0txPF0UPgsyzQ",authDomain:"dulikoweb.firebaseapp.com",projectId:"dulikoweb",storageBucket:"dulikoweb.firebasestorage.app",messagingSenderId:"410626691489",appId:"1:410626691489:web:261378308a529cf9f73be0"};
var AUTHORIZED_EMAILS=["info@dulikosrl.com","juanma.lunaok@gmail.com","dulikorep@gmail.com"];
var db=null,auth=null,storage=null;
try{if(typeof firebase!=='undefined'&&FIREBASE_CONFIG.apiKey!=="TU_API_KEY"){firebase.initializeApp(FIREBASE_CONFIG);db=firebase.firestore();auth=firebase.auth();storage=firebase.storage()}}catch(e){}