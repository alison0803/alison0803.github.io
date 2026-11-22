const cities=['台北市','新北市','基隆市','桃園市','新竹市','新竹縣','苗栗縣','台中市','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','台南市','高雄市','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣','連江縣'];let index=0;const $=s=>document.querySelector(s),carousel=$('#carousel'),select=$('#city-list'),map=$('#map');cities.forEach((city,i)=>{
 select.add(new Option(city,i));
 const card=document.createElement('button');card.className='citycard';card.type='button';card.dataset.cityIndex=i;
 const count=window.CANDIDATES.filter(person=>person.city===city).length;
 card.innerHTML=`<div class="cardcenter"><h3>${city}</h3><p>${count} 人</p></div><div class="cardbottom"><span>開啟檔案 ↗</span></div>`;
 card.onclick=()=>i===index?openCity():setCity(i);carousel.appendChild(card);
});
function render(){
 carousel.querySelectorAll('.citycard').forEach((card,i)=>{
  let distance=(i-index+cities.length)%cities.length;if(distance>cities.length/2)distance-=cities.length;
  const abs=Math.abs(distance);card.dataset.offset=Math.sign(distance);card.style.transform=`translateX(${distance*55}%) scale(${Math.max(.62,1-abs*.16)})`;
  card.style.opacity=abs===0?'1':abs===1?'.60':abs===2?'.32':'0';card.style.zIndex=String(10-Math.min(abs,9));
  card.style.pointerEvents=abs<=2?'auto':'none';card.tabIndex=abs<=2?0:-1;
  card.setAttribute('aria-label',distance?`切換至${cities[i]}`:`查看${cities[i]}檔案`);
 });
 select.value=index;
 map.querySelectorAll('path').forEach(p=>p.classList.toggle('active',p.dataset.city===cities[index]));
}
function setCity(i){index=(i+cities.length)%cities.length;render()}
$('#prev').onclick=()=>setCity(index-1);$('#next').onclick=()=>setCity(index+1);
select.onchange=()=>setCity(+select.value);
let scrollAnimation=0;
function scrollToPage(target,duration=1300){
 cancelAnimationFrame(scrollAnimation);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:target,behavior:'instant'});return}
 const from=window.scrollY,delta=target-from,start=performance.now();
 function step(now){const p=Math.min(1,(now-start)/duration),ease=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;window.scrollTo({top:from+delta*ease,behavior:'instant'});if(p<1)scrollAnimation=requestAnimationFrame(step)}
 scrollAnimation=requestAnimationFrame(step);
}
function openCity(){$('#archive-city').textContent=cities[index];$('#archive').hidden=false;renderDrawer(cities[index]);scrollToPage($('#archive').getBoundingClientRect().top+window.scrollY)}
$('#back').onclick=()=>{const explorer=$('#explore');const top=explorer.getBoundingClientRect().top+window.scrollY;const target=Math.max(top,hero.offsetHeight-window.innerHeight+1);scrollToPage(target,1000)};
let startX;carousel.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});carousel.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40)setCity(index+(dx<0?1:-1))},{passive:true});let hoverTimer=null,hoverDirection=0;
function stopHover(){clearInterval(hoverTimer);hoverTimer=null;hoverDirection=0}
carousel.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const card=e.target.closest('.citycard');const direction=card?Number(card.dataset.offset):0;if(direction===hoverDirection)return;stopHover();if(!direction)return;hoverDirection=direction;setCity(index+direction);hoverTimer=setInterval(()=>setCity(index+direction),2400)});
carousel.addEventListener('pointerleave',stopHover);
render();
const drawer=document.querySelector('.drawer'),drawerTabs=drawer.querySelector('.drawer-tabs'),drawerStack=drawer.querySelector('.drawer-stack');
let drawerCards=[],selectedFile=null,dragStart=null;
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function renderDrawer(city){
 selectedFile=null;drawerCards=window.CANDIDATES.filter(person=>person.city===city);drawerTabs.replaceChildren();drawerStack.replaceChildren();const stats=window.CANDIDATE_STATS[city]||{total:0,offices:{},statuses:{}};const office=n=>stats.offices[n]||0;const stage=n=>stats.statuses[n]||0;document.querySelector('#city-stats').textContent=`縣市長 ${office('縣市長')} 人、\n議員 ${office('議員')} 人、\n里長 ${office('里長')} 人。\n依名單最高階段分為起訴 ${stage('已起訴')} 人、\n判刑 ${stage('已判刑')} 人、\n定讞 ${stage('已定讞')} 人，\n合計 ${stats.total} 人。`;
 drawer.querySelector('.drawer-navigation').hidden=!drawerCards.length;
 if(!drawerCards.length){drawerStack.append(node('div','drawer-empty','此份名單目前沒有符合範圍的資料。未列入不代表沒有其他紀錄。'));return}
 drawerCards.forEach((person,i)=>{const tab=node('button','drawer-tab',person.name);tab.type='button';tab.style.setProperty('--slot',i);tab.setAttribute('aria-pressed','false');tab.addEventListener('click',()=>showFile(i));drawerTabs.append(tab)});
}
function showFile(i){
 if(!drawerCards.length)return;selectedFile=(i+drawerCards.length)%drawerCards.length;
 [...drawerTabs.children].forEach((tab,n)=>{tab.setAttribute('aria-pressed',String(n===selectedFile));tab.classList.toggle('selected',n===selectedFile)});
 const old=drawerStack.querySelector('.drawer-card.selected');if(old){old.classList.remove('selected');old.classList.add('returning');setTimeout(()=>old.remove(),800)}
 const person=drawerCards[selectedFile],card=node('article','drawer-card');
 const content=node('div','filecontent'),portrait=node('div','portrait');
 const placeholder=(message='尚無公開照片資料')=>portrait.replaceChildren(node('small',null,message));
 const photo=window.PORTRAITS?.[`${person.city}|${person.name}`];if(photo){const img=node('img','candidate-portrait');img.src=photo;img.alt=`${person.name}照片`;img.loading='lazy';img.addEventListener('error',()=>placeholder('照片載入失敗'));portrait.append(img)}else placeholder();
 const info=node('div','candidate-content');info.append(node('p','candidate-label',`${person.office}・${person.district}`),node('h3','candidate-name',person.name),node('p','candidate-party',person.party),node('p','candidate-status',person.tags));
 const caseHeading=node('p','case-heading','各案案由與狀況'),caseList=node('ol','candidate-cases');if(person.cases.length===1)caseList.classList.add('single');person.cases.forEach(entry=>{const name=entry.replace(/^\d+\.\s*/,'').split(/[：:]/,1)[0].trim();caseList.append(node('li',null,name))});info.append(caseHeading,caseList);const sourceList=node('div','candidate-sources');person.urls.forEach((url,k)=>{const link=node('a',null,`來源 ${k+1}`);link.href=url;link.target='_blank';link.rel='noopener noreferrer';sourceList.append(link)});info.append(sourceList);content.append(portrait,info);card.append(content);drawerStack.append(card);
 requestAnimationFrame(()=>requestAnimationFrame(()=>card.classList.add('selected')));
 card.addEventListener('pointerdown',e=>{if(e.target.closest('a, .candidate-content'))return;dragStart={y:e.clientY,time:performance.now(),card};card.setPointerCapture(e.pointerId)});
 card.addEventListener('pointermove',e=>{if(!dragStart||dragStart.card!==card)return;card.style.setProperty('--drag',`${Math.max(-65,Math.min(65,(e.clientY-dragStart.y)*.5))}px`)});
 const finish=e=>{if(!dragStart||dragStart.card!==card)return;const delta=e.clientY-dragStart.y,velocity=delta/Math.max(1,performance.now()-dragStart.time);card.style.removeProperty('--drag');dragStart=null;if(Math.abs(delta)>55||Math.abs(velocity)>.55)showFile(selectedFile+(delta>0?1:-1))};
 card.addEventListener('pointerup',finish);card.addEventListener('pointercancel',finish);
}
document.querySelector('#file-prev').onclick=()=>showFile(selectedFile===null?drawerCards.length-1:selectedFile-1);
document.querySelector('#file-next').onclick=()=>showFile(selectedFile===null?0:selectedFile+1);
const hero=document.querySelector('.hero'),heroTitle=document.querySelector('.hero-title'),glyph=document.querySelector('.portal-glyph');
window.addEventListener('scroll',()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;let p=Math.max(0,Math.min(1,scrollY/(hero.offsetHeight-innerHeight)));if(p===0){document.querySelector('.hero-sticky').style.opacity='1';heroTitle.style.transform='';heroTitle.style.opacity='';document.querySelector('.portal-view').style.opacity='0';return}const x=glyph.offsetLeft+glyph.offsetWidth/2,y=glyph.offsetTop+glyph.offsetHeight/2;heroTitle.style.transformOrigin=`${x}px ${y}px`;let scale=1+Math.pow(p,2)*30;const dx=innerWidth/2-(heroTitle.offsetLeft+x),dy=innerHeight/2-(heroTitle.offsetTop+y);heroTitle.style.transform=`translate(${dx*p}px,${dy*p}px) scale(${scale})`;document.querySelector('.portal-view').style.opacity=String(Math.min(1,Math.max(0,(p-.08)/.22)));document.querySelector('.hero-sticky').style.opacity=String(p>.72?Math.max(0,(1-p)/.28):1);heroTitle.style.opacity=p>.7?String((1-p)/.3):'1'}, {passive:true});
Promise.resolve(window.TAIWAN_GEO).then(geo=>{let features=geo.features.map(f=>{if(f.properties.name_traditional_chinese!=='金門縣')return f;function shift(a){return typeof a[0]==='number'?[a[0]+1.0,a[1]]:a.map(shift)}return {...f,geometry:{...f.geometry,coordinates:shift(f.geometry.coordinates)}}});let points=features.flatMap(f=>{let arr=[];function walk(x){if(typeof x[0]==='number')arr.push(x);else x.forEach(walk)}walk(f.geometry.coordinates);return arr});let xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);let minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);let scale=Math.min(350/(maxX-minX),500/(maxY-minY));let project=p=>[(p[0]-minX)*scale+20,(maxY-p[1])*scale+20];let svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${(maxX-minX)*scale+40} ${(maxY-minY)*scale+40}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','台灣縣市地圖');features.forEach(f=>{let name=(f.properties.COUNTYNAME||f.properties.name_traditional_chinese||f.properties.name||f.properties.NAME_1||'').replace('臺','台').replace('桃園縣','桃園市');if(!cities.includes(name))return;let path=document.createElementNS('http://www.w3.org/2000/svg','path');let polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;let d=polys.map(poly=>poly.map(ring=>ring.map((p,i)=>{let [x,y]=project(p);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`}).join('')+'Z').join('')).join('');path.setAttribute('d',d);path.dataset.city=name;path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',name);path.onclick=()=>{setCity(cities.indexOf(name));openCity()};path.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();path.onclick()}};svg.appendChild(path)});if(!svg.children.length)throw Error();map.replaceChildren(svg);const mini=document.querySelector('.portal-map');mini.replaceChildren(svg.cloneNode(true));mini.querySelectorAll('path').forEach(path=>{path.removeAttribute('tabindex');path.removeAttribute('role')});render()}).catch(()=>{map.innerHTML='<p>地圖暫時無法載入，請使用右側縣市清單。</p>'});
const reflectionHeading=document.querySelector('.reflection h2');
const typing=document.querySelector('.typing-text');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const headingLines=[['交出選票前',false],['我們能看見多少？',true]],lines=['民主需要的，','不只是投票那一天的選擇，','還有選擇之前持續追問、查證與理解的權利。'];
 reflectionHeading.setAttribute('aria-label',headingLines.map(line=>line[0]).join(''));reflectionHeading.replaceChildren();let charIndex=0;
 headingLines.forEach(([text,accent],i)=>{if(i)reflectionHeading.append(document.createElement('br'));const group=document.createElement(accent?'em':'span');group.setAttribute('aria-hidden','true');for(const char of text){const span=document.createElement('span');span.className='blur-letter';span.textContent=char;span.style.setProperty('--letter-delay',`${charIndex++*.07}s`);group.append(span)}reflectionHeading.append(group)});
 reflectionHeading.classList.add('prepared');typing.textContent='';document.querySelector('.typing-cursor').classList.add('waiting');
 let started=false;const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting||started)return;started=true;observer.disconnect();reflectionHeading.classList.add('is-visible');setTimeout(()=>{document.querySelector('.typing-cursor').classList.remove('waiting');let line=0,char=0;function type(){if(line>=lines.length){document.querySelector('.typing-cursor').classList.add('finished');return}if(char<lines[line].length){typing.append(document.createTextNode(lines[line][char++]));setTimeout(type,60)}else{line++;char=0;if(line<lines.length)setTimeout(()=>{typing.append(document.createElement('br'));type()},1000);else type()}}type()},(charIndex-1)*70+800)}, {threshold:0});observer.observe(document.querySelector('#reflection'));if(document.querySelector('#reflection').getBoundingClientRect().top < window.innerHeight && document.querySelector('#reflection').getBoundingClientRect().bottom > 0){reflectionHeading.classList.add('is-visible')}
}
/* 反思頁停留時，頁尾背景與文字一同漸入 */
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const reflectionSection=document.querySelector('#reflection'),footer=document.querySelector('#declaration');
 footer.classList.add('footer-overlay');let pending=false;
 function updateFooterFade(){pending=false;const bottom=reflectionSection.getBoundingClientRect().bottom,height=window.innerHeight;const progress=Math.max(0,Math.min(1,(height*1.8-bottom)/(height*.8)));footer.style.setProperty('--footer-progress',String(progress))}
 window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updateFooterFade)}},{passive:true});window.addEventListener('resize',updateFooterFade);updateFooterFade();
}
