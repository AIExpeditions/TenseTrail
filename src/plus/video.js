/* ---- In-site video window ----
 Any link to a YouTube video (youtube.com/watch, youtu.be, /shorts, /embed) opens in a window on
 this page instead of leaving the site. It plays through youtube-nocookie.com, so YouTube sets no
 tracking cookies until the learner presses play. Ctrl/Cmd/Shift/middle click still opens YouTube
 in a new tab. Close with the button, Esc, or a click on the dark backdrop. */
function ytId(u){try{var a=new URL(u,location.href),h=a.hostname.replace(/^(www|m|music)\./,""),m;
 if(h=="youtu.be")m=a.pathname.slice(1);else if(h=="youtube.com"||h=="youtube-nocookie.com")m=a.searchParams.get("v")||(a.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)||[])[1];
 return m&&/^[\w-]{6,20}$/.test(m)?m:null}catch(e){return null}}
var YTL=null;
function ytOpen(id,ti,ch,href){var o=$("#ytw");if(!o){o=document.createElement("div");o.id="ytw";o.className="ytw";o.hidden=true;
  o.innerHTML='<div class="ytbk" data-ytx></div><div class="ytbox" role="dialog" aria-modal="true" aria-labelledby="ytti"><div class="ythd"><div class="ytmeta"><b id="ytti"></b><small id="ytch"></small></div><a class="ytout" id="ytout" target="_blank" rel="noopener noreferrer">YouTube ↗</a><button class="ytx" data-ytx aria-label="Close video">✕</button></div><div class="ytfr" id="ytfr"></div><p class="ytnote">Tip: pause at the examples and say them aloud. Turn on subtitles (CC) if the teacher speaks fast.</p></div>';
  document.body.appendChild(o);o.addEventListener("click",function(e){if(e.target.closest("[data-ytx]"))ytClose()})}
 YTL=document.activeElement;if(typeof cvKill=="function")try{cvKill()}catch(e){}
 $("#ytti").textContent=ti||"Video";$("#ytch").textContent=ch||"";$("#ytch").hidden=!ch;$("#ytout").href=href||"https://www.youtube.com/watch?v="+id;
 $("#ytfr").innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&cc_load_policy=0" title="'+sxH(ti||"YouTube video")+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
 o.hidden=false;document.documentElement.classList.add("ytlock");requestAnimationFrame(function(){o.classList.add("in")});$(".ytx",o).focus()}
function ytClose(){var o=$("#ytw");if(!o||o.hidden)return;o.classList.remove("in");$("#ytfr").innerHTML="";o.hidden=true;document.documentElement.classList.remove("ytlock");if(YTL&&YTL.focus)try{YTL.focus()}catch(e){}YTL=null}
document.addEventListener("click",function(e){if(e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.closest("#ytw"))return;var id=ytId(a.getAttribute("href"));if(!id)return;
 e.preventDefault();ytOpen(id,a.dataset.ytt||(a.querySelector("b")||a).textContent.trim(),a.dataset.ytc||"",a.href)});
document.addEventListener("keydown",function(e){var o=$("#ytw");if(!o||o.hidden)return;if(e.key=="Escape"){e.preventDefault();e.stopPropagation();ytClose();return}
 if(e.key=="Tab"){var f=$$("a[href],button,iframe",o.querySelector(".ytbox")),i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i==f.length-1){e.preventDefault();f[0].focus()}}},true);
addEventListener("hashchange",ytClose);
