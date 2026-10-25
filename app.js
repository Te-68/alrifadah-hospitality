'use strict';
const $ = (id) => document.getElementById(id);
let site = {
  branding: { nameAr: 'الرفادة مسار الضيافة للسفر والسياحة', welcomeAr: 'أصالة الضيافة السعودية بمعايير عالمية. شريككم الموثوق لتجارب سفر وسياحة استثنائية.' },
  about: {},
  services: [
    {id:'s1',nameAr:'الاستقبال',shortAr:'خدمات استقبال منظمة لتوفير بداية مريحة للرحلة.'},
    {id:'s2',nameAr:'التوديع',shortAr:'مساندة المسافرين وتنظيم إجراءات المغادرة.'},
    {id:'s3',nameAr:'الطيران',shortAr:'تنسيق خيارات الرحلات الجوية حسب احتياجات العملاء.'},
    {id:'s4',nameAr:'الفنادق',shortAr:'خيارات إقامة متنوعة تراعي الراحة والموقع وجودة الخدمة.'},
    {id:'s5',nameAr:'وسائل النقل',shortAr:'خدمات نقل منظمة للوصول إلى الوجهات براحة.'},
    {id:'s6',nameAr:'السياحة الداخلية',shortAr:'تجارب لاكتشاف الوجهات الطبيعية والتراثية والثقافية بالمملكة.'}
  ]
};
function showMsg(el, text, error=false){ el.textContent=text; el.style.color=error?'#b42318':'#0a3828'; }
function render(){
  $('year').textContent = new Date().getFullYear();
  $('servicesGrid').replaceChildren();
  site.services.forEach(s=>{
    const card=document.createElement('article'); card.className='card';
    const h=document.createElement('h3'); h.textContent=s.nameAr || 'خدمة';
    const p=document.createElement('p'); p.className='muted'; p.textContent=s.shortAr || '';
    card.append(h,p); $('servicesGrid').append(card);
  });
  document.querySelector('.hero h1').textContent = 'أهلاً بكم في ' + (site.branding.nameAr || 'الرفادة');
  document.querySelector('.hero p').textContent = site.branding.welcomeAr || '';
  $('editName').value = site.branding.nameAr || '';
  $('editWelcome').value = site.branding.welcomeAr || '';
  $('aboutText').textContent = site.about.whoWeAreAr || $('aboutText').textContent;
}
async function api(url, options={}) {
  const res = await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || 'تعذر إكمال الطلب');
  return data;
}
async function loadSite(){ try { const data=await api('/api/site'); if(data.branding) site=data; } catch(e) { /* fallback to default content */ } render(); }
async function refreshAdmin(){ try { const s=await api('/api/admin/session'); $('adminPanel').classList.toggle('hidden',!s.authenticated); $('adminOpen').classList.toggle('hidden',s.authenticated); } catch(e){} }
document.querySelectorAll('[data-scroll]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.scroll).scrollIntoView({behavior:'smooth'})));
$('adminOpen').addEventListener('click',()=>{ $('loginModal').classList.add('open'); $('loginMsg').textContent=''; $('email').focus(); });
$('closeModal').addEventListener('click',()=> $('loginModal').classList.remove('open'));
$('loginModal').addEventListener('click',e=>{if(e.target===$('loginModal')) $('loginModal').classList.remove('open')});
$('loginForm').addEventListener('submit',async e=>{
 e.preventDefault(); showMsg($('loginMsg'),'جارٍ التحقق…');
 try { await api('/api/admin/login',{method:'POST',body:JSON.stringify({email:$('email').value,password:$('password').value})}); $('loginModal').classList.remove('open'); $('password').value=''; await refreshAdmin(); showMsg($('adminMsg'),'تم تسجيل الدخول بأمان.'); }
 catch(err){showMsg($('loginMsg'),err.message,true);}
});
$('saveSite').addEventListener('click',async()=>{
 site.branding.nameAr=$('editName').value.trim().slice(0,180);
 site.branding.welcomeAr=$('editWelcome').value.trim().slice(0,1500);
 try{await api('/api/admin/site',{method:'PUT',body:JSON.stringify(site)}); showMsg($('adminMsg'),'تم حفظ التعديلات.'); render();}
 catch(err){showMsg($('adminMsg'),err.message,true);}
});
$('logout').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST',body:'{}'});}catch(e){} await refreshAdmin(); $('adminPanel').classList.add('hidden');});
loadSite(); refreshAdmin();
