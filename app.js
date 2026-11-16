'use strict';
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const vows = [
 ['To nurture each other.','To build a home filled with care, comfort, and love.'],
 ['To be each other’s strength.','To stand together with courage, through every season of life.'],
 ['To grow side by side.','To share our dreams and build a beautiful life together.'],
 ['To choose joy, together.','To fill ordinary days with laughter, gratitude, and kindness.'],
 ['To cherish our family.','To honour our loved ones and nurture the bonds that hold us.'],
 ['To walk through every season.','To care for one another, in sunshine and in rain.'],
 ['To be best friends, always.','Seven steps. Two hearts. A friendship that lasts a lifetime.']
];
const pheraSection = document.querySelector('.pheras-section');
const sticky = document.querySelector('.pheras-sticky');
const dots = [...document.querySelectorAll('.vow-dots button')];
const progress = document.querySelector('.page-progress');
const ringSection = document.querySelector('.ring-section');
let activeVow = -1, ticking = false;
const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
function setVow(index){
 if(index===activeVow)return; activeVow=index;
 document.querySelector('#vow-number').textContent=String(index+1).padStart(2,'0');
 document.querySelector('#vow-title').textContent=vows[index][0];
 document.querySelector('#vow-text').textContent=vows[index][1];
 dots.forEach((dot,i)=>{if(i===index)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');dot.classList.toggle('passed',i<index)});
 const copy=document.querySelector('.vow-copy');copy.classList.remove('changing');void copy.offsetWidth;copy.classList.add('changing');
}
function updateScroll(){
 const maxScroll=document.documentElement.scrollHeight-innerHeight;
 progress.style.width=`${maxScroll>0?scrollY/maxScroll*100:0}%`;
 const rect=pheraSection.getBoundingClientRect();
 const journey=Math.max(1,pheraSection.offsetHeight-sticky.offsetHeight);
 const p=clamp(-rect.top/journey,0,1);
 setVow(Math.min(6,Math.floor(p*7)));
 if(!reducedMotion.matches){sticky.style.setProperty('--p',p);const ring=ringSection.getBoundingClientRect();ringSection.style.setProperty('--ring',clamp((ring.top-innerHeight*.2)/innerHeight,0,1));}
 ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}},{passive:true});
addEventListener('resize',updateScroll);
dots.forEach((dot,i)=>dot.addEventListener('click',()=>{
 const start=pheraSection.getBoundingClientRect().top+scrollY;
 const journey=pheraSection.offsetHeight-sticky.offsetHeight;
 window.scrollTo({top:start+journey*((i+.3)/7),behavior:reducedMotion.matches?'instant':'smooth'});
}));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
if(!reducedMotion.matches){const petalBox=document.querySelector('.petals');for(let i=0;i<9;i++){const petal=document.createElement('i');petal.className='petal';petal.style.cssText=`left:${6+i*11}%;animation-duration:${14+i%4*3}s;animation-delay:-${i*2.2}s;`;petalBox.append(petal)}}
const music=document.querySelector('#wedding-music'),musicButton=document.querySelector('#music-button');music.volume=.5;
function updateMusic(){musicButton.setAttribute('aria-pressed',String(!music.paused));musicButton.setAttribute('aria-label',music.paused?'Play invitation music':'Pause invitation music');document.querySelector('#music-label').textContent=music.paused?'Music off':'Music on'}
musicButton.addEventListener('click',async()=>{if(music.paused){try{await music.play()}catch{toast('Music could not play. Please tap to try again.')}}else music.pause();updateMusic()});
music.addEventListener('pause',updateMusic);music.addEventListener('play',updateMusic);
let toastTimer;function toast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),4500)}
const events={22:[['Ring Ceremony','20261122T124500Z'],['Sangeet Sandhya','20261122T133000Z']],23:[['Carnival','20261123T060000Z'],['Barat on Wheels','20261123T110000Z'],['Reception & Dinner','20261123T120000Z']]};
function escapeICS(s){return s.replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
document.querySelectorAll('[data-calendar]').forEach(button=>button.addEventListener('click',()=>{
 const day=button.dataset.calendar;
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mewara Wedding//Invitation//EN','CALSCALE:GREGORIAN'];
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 events[day].forEach(([name,time],i)=>lines.push('BEGIN:VEVENT',`UID:ak-202611${day}-${i}@mewara-wedding`,`DTSTAMP:${stamp}`,`DTSTART:${time}`,`SUMMARY:${escapeICS(`Abhishek & Khushi — ${name}`)}`,`LOCATION:${escapeICS('Kogta Paradise, Sanjaynagar Road, Bijainagar')}`,`DESCRIPTION:${escapeICS('Join the Mewara families to celebrate Abhishek and Khushi. Times shown in the invitation are Indian Standard Time.')}`,'END:VEVENT'));
 lines.push('END:VCALENDAR');
 const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Abhishek-Khushi-${day}-November-2026.ics`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Calendar invitation downloaded. Open it to add the events.');
}));
document.querySelector('#share-invitation').addEventListener('click',async()=>{
 const data={title:'Abhishek & Khushi | Wedding Invitation',text:'Join us to celebrate Abhishek & Khushi, 22–23 November 2026 at Kogta Paradise, Bijainagar.',url:location.origin+location.pathname};
 try{if(navigator.share){await navigator.share(data)}else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);toast('Invitation link copied. Site access permissions still apply.')}else{toast('Copy this page’s address to share the invitation.')}}catch(e){if(e.name!=='AbortError')toast('Copy this page’s address to share the invitation.')}
});
updateScroll();
