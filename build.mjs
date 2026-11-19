// UNFILTERED CHAOS • no dependencies, static HTML for search engines and speed.
// The private editor (Pages CMS) updates content/site.json in GitHub.
// The hosting service runs `node build.mjs` after each approved change.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const settings = JSON.parse(await readFile(path.join(ROOT, 'content', 'site.json'), 'utf8'));
const escapeHTML = val => String(val ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean = val => String(val ?? '').trim();
const safeUrl = val => {try {const u = new URL(clean(val));return u.protocol === 'https:' ? u.href : null;}catch{return null;}};
const title = clean(settings.site_title) || 'UNFILTERED CHAOS | Beauty & Wellness UK';
const description = clean(settings.meta_description) || 'Beauty, skincare, makeup and wellness from UNFILTERED CHAOS.';
const liveUrl = safeUrl(settings.site_url)?.replace(/\/+$/, '') || null;
const hrefIcon = (icon) => `<span class="action-icon" aria-hidden="true">${icon}</span>`;
const BAG = '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><path d="M6 12h20l-2 16H8L6 12Z"/><path d="M11 13V9a5 5 0 0 1 10 0v4"/></svg>';
function linkCard(label, url, icon, primary=false) {
 const safe=safeUrl(url), name=escapeHTML(clean(label)||'VISIT');
 const cls=`action${primary?' primary':''}${safe?'':' missing'}`;
 const content=`${hrefIcon(icon)}<span class="action-copy"><strong>${name}</strong><small>${safe?'Tap to open ↗':'Link being added'}</small></span><span class="arrow" aria-hidden="true">${safe?'↗':'·'}</span>`;
 if(!safe) return `<div class="${cls}" aria-label="${name}, link not connected yet">${content}</div>`;
 return `<a class="${cls}" href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer" aria-label="${name}, opens an external website in a new tab">${content}</a>`;
}
const cards=[
 linkCard(settings.shop_label,settings.shop_url,BAG,true),
 linkCard(settings.joining_label,settings.joining_url,'♡'),
 linkCard(settings.facebook_label,settings.facebook_url,'f')
];
if(Array.isArray(settings.extra_buttons)) for(const b of settings.extra_buttons.slice(0,8)){
 if(b && b.enabled && clean(b.label)) cards.push(linkCard(b.label,b.url,'↗'));
}
const announcement=clean(settings.announcement);
const canonical=liveUrl ? `<link rel="canonical" href="${escapeHTML(liveUrl)}/">` : '';
const socialImage=liveUrl ? `<meta property="og:image" content="${escapeHTML(liveUrl)}/assets/unfiltered-chaos-original.jpg">` : '';
const robots = settings.indexing_enabled===true ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
const markup=`<!doctype html>
<html lang="en-GB"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#09080c">
<title>${escapeHTML(title)}</title>
<meta name="description" content="${escapeHTML(description)}">
<meta name="robots" content="${robots}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(description)}">
${canonical}${socialImage}
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="preload" href="assets/unfiltered-chaos-original.jpg" as="image">
<style>
:root{color-scheme:dark;--bg:#08070a;--pink:#ff0b8b;--soft:#ff80c9;--text:#fff9fd;--muted:#ecd1e2;--line:#743654}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 100% 23%,#380c26 0%,transparent 32%),radial-gradient(circle at 0% 83%,#26091c 0%,transparent 35%),var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.container{width:min(1100px,100%);margin:auto;padding:0 clamp(18px,4vw,48px)}
header{border-bottom:1px solid #632141;background:#08070af0}.headerline{display:flex;justify-content:space-between;gap:12px;align-items:center;min-height:65px}.smallbrand{font-size:clamp(14px,2vw,18px);font-weight:900;letter-spacing:.06em}.smallbrand em{font-style:normal;color:var(--soft)}.subhead{font-size:clamp(10px,1.7vw,12px);color:#ebcbdc;text-align:right;letter-spacing:.05em}
main{text-align:center;padding-bottom:25px}.banner{margin:23px auto 17px;max-width:1024px;overflow:hidden;border-radius:15px;border:1px solid #5d1e3d;box-shadow:0 18px 55px #000a,0 0 32px #d30a6f33}.banner img{display:block;width:100%;height:auto}
.eyebrow{color:var(--soft);font-size:12px;letter-spacing:.2em;font-weight:800;margin:17px 0 8px}h1{font-size:clamp(26px,4vw,48px);line-height:1.1;letter-spacing:-.035em;margin:0 0 13px;font-weight:850}.lead{max-width:720px;color:var(--muted);font-size:clamp(15px,2vw,18px);line-height:1.6;margin:0 auto 26px}
.actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:0 auto 26px;max-width:930px}.action{display:flex;min-height:95px;align-items:center;gap:11px;padding:18px 17px;text-align:left;text-decoration:none;color:var(--text);border:2px solid #f452a7;border-radius:19px;background:linear-gradient(130deg,#2b0c22,#140a13);box-shadow:inset 0 0 23px #ff0a8c16,0 0 20px #ff0a8c38;transition:transform .17s,box-shadow .17s}.action.primary{background:linear-gradient(130deg,#fd0b8e,#a5005b);border-color:#ff8bce}.action:hover,.action:focus-visible{transform:translateY(-3px);box-shadow:0 0 27px #ff5aab99;outline:2px solid #ffc0e3;outline-offset:3px}.action.missing{filter:saturate(.72);border-color:#9d5277;cursor:default}.action-icon{display:flex;align-items:center;justify-content:center;flex:0 0 43px;font-size:31px;font-weight:900;color:#fff}.action-copy{min-width:0;flex:1}.action-copy strong{display:block;font-size:clamp(17px,2vw,21px);letter-spacing:.01em;line-height:1.2}.action-copy small{display:block;font-size:12px;color:#ffe2f0;margin-top:6px}.arrow{font-size:20px;color:#ffb5dc;font-weight:900}
.notice{max-width:930px;margin:0 auto 23px;padding:13px 18px;border:1px solid #f354a7;border-radius:15px;background:#35152a;color:#fff;font-weight:650;line-height:1.5}
.separator{height:1px;background:linear-gradient(90deg,transparent,#e3007d,transparent);max-width:910px;margin:27px auto}.info{max-width:930px;display:grid;grid-template-columns:1.08fr .92fr;gap:22px;text-align:left;align-items:start;margin:auto}.info h2{font-size:clamp(22px,3vw,31px);letter-spacing:-.02em;margin:0 0 10px}.info h2 span{color:var(--soft)}.info p{color:var(--muted);font-size:15px;line-height:1.6;margin:0}.chips{display:flex;gap:10px;justify-content:flex-start;flex-wrap:wrap}.chip{padding:9px 12px;background:#23101e;color:#fff0f8;border:1px solid #ae4b7e;font-size:12px;border-radius:30px;font-weight:700}
footer{border-top:1px solid #5f2040;background:#0a080b;padding:21px 0 29px;color:#d8bdce;font-size:12px;text-align:center;line-height:1.6}footer strong{color:#fff}details{margin:10px auto 0;max-width:780px;text-align:left}summary{cursor:pointer;color:#ff9ad3;font-weight:750;text-align:center;list-style-position:inside}details p{margin:8px 0 0;color:#ddc0d3}
@media(max-width:720px){.container{padding:0 17px}.headerline{min-height:57px}.subhead{font-size:10px}.banner{margin:18px auto 17px;border-radius:8px}.eyebrow{font-size:10px;margin:17px 0 8px}.lead{margin-bottom:20px}.actions{grid-template-columns:1fr;gap:11px;max-width:480px;margin-bottom:22px}.action{min-height:77px;padding:12px 18px}.action-copy strong{font-size:19px}.info{grid-template-columns:1fr;gap:17px}.separator{margin:22px auto}.chips{gap:7px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;scroll-behavior:auto!important}}
</style></head>
<body>
<header><div class="container headerline"><div class="smallbrand">UNFILTERED <em>CHAOS</em></div><div class="subhead">INDEPENDENT BEAUTY &amp; WELLNESS</div></div></header>
<main class="container"><section aria-labelledby="headline">
<div class="banner"><img src="assets/unfiltered-chaos-original.jpg" alt="UNFILTERED CHAOS. Real people. Real talk. No filter. Just chaos." width="1536" height="661"></div>
<p class="eyebrow">BEAUTY • WELLNESS • REAL TALK</p>
<h1 id="headline">${escapeHTML(settings.headline || 'Beauty, wellness & a little chaos.')}</h1>
<p class="lead">${escapeHTML(settings.intro || '')}</p>
</section>
<section class="actions" aria-label="Explore UNFILTERED CHAOS">${cards.join('\n')}</section>
${announcement?`<div class="notice" role="note">${escapeHTML(announcement)}</div>`:''}
<div class="separator"></div>
<section class="info" aria-label="About UNFILTERED CHAOS"><div><h2>Come for the beauty. <span>Stay for the chaos.</span></h2><p>From everyday skincare and makeup to haircare, fragrances and wellness favourites, explore the range using my official Farmasi shop link. Interested in the opportunity? Find out more through the joining button.</p></div><div class="chips" aria-label="Beauty interests"><span class="chip">Skincare</span><span class="chip">Makeup</span><span class="chip">Haircare</span><span class="chip">Fragrance</span><span class="chip">Wellness</span><span class="chip">Everyday essentials</span></div></section>
</main>
<footer><div class="container"><strong>UNFILTERED CHAOS</strong> is run by an Independent Farmasi Beauty Influencer, not by Farmasi UK.<br>Orders and joining take place on the linked official Farmasi website. No checkout or telephone number is provided here.
<details><summary>Privacy &amp; site information</summary><p>This website does not contain a contact form or payment form, and its own code does not use marketing cookies. Your browser and the hosting provider may process technical access information. If you use an external shopping, joining or Facebook link, that service's own terms and privacy notice apply. This website does not control those external services.</p></details></div></footer>
</body></html>`;
await mkdir(path.join(ROOT, 'dist', 'assets'), {recursive:true});
await writeFile(path.join(ROOT,'dist','index.html'), markup);
await copyFile(path.join(ROOT,'assets','unfiltered-chaos-original.jpg'),path.join(ROOT,'dist','assets','unfiltered-chaos-original.jpg'));
await copyFile(path.join(ROOT,'assets','favicon.svg'),path.join(ROOT,'dist','assets','favicon.svg'));
await copyFile(path.join(ROOT,'robots.txt'),path.join(ROOT,'dist','robots.txt'));
console.log('Built dist/index.html; Google indexing '+(settings.indexing_enabled?'on':'off for testing'));
