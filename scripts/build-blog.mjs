// Builds /blogs from a Hashnode RSS feed, the only feed Hashnode serves without a Pro plan.
//
//   node scripts/build-blog.mjs                      uses the snapshot in content/hashnode-rss.xml
//   node scripts/build-blog.mjs --feed <url>          fetches a fresh feed and refreshes the snapshot
//
// Writes public/blogs/, public/blogs/<slug>/, public/blogs/rss.xml, public/_redirects,
// public/404.html, and the three newest posts into public/index.html.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const snapshot = join(root, 'content', 'hashnode-rss.xml');
const SITE = 'https://techswitch.in';

const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };

async function loadFeed() {
  const feed = arg('--feed');
  if (!feed) return readFile(snapshot, 'utf8');
  if (/^https?:/.test(feed)) {
    const res = await fetch(feed, { headers: { 'user-agent': 'techswitch-site-build' } });
    if (!res.ok) throw new Error(`feed ${feed}: HTTP ${res.status}`);
    const xml = await res.text();
    await writeFile(snapshot, xml);
    return xml;
  }
  return readFile(feed, 'utf8');
}

const unwrap = (s) => s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`)); return m ? unwrap(m[1]) : ''; };
const tags = (xml, name) => [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'g'))].map((m) => unwrap(m[1]));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parse(xml) {
  return xml.split('<item>').slice(1).map((chunk) => {
    const item = chunk.split('</item>')[0];
    const link = tag(item, 'link');
    const html = tag(item, 'content:encoded');
    const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return {
      title: decode(tag(item, 'title')),
      brief: decode(tag(item, 'description')),
      slug: new URL(link).pathname.replace(/^\/+|\/+$/g, ''),
      date: new Date(tag(item, 'pubDate')),
      tags: tags(item, 'category').map(decode),
      cover: (item.match(/<enclosure[^>]*url="([^"]+)"/) || [])[1] || '',
      minutes: Math.max(1, Math.round(words / 200)),
      html: clean(html),
    };
  }).filter((p) => p.slug).sort((a, b) => b.date - a.date);
}

// The posts are our own writing, but strip anything executable before it is served from our domain.
function clean(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/href="\s*javascript:[^"]*"/gi, 'href="#"')
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')
    .replace(/<pre>/gi, '<pre tabindex="0">')
    .replace(/href="https:\/\/techswitch\.in\/(?!blogs\/)([a-z0-9-]+)"/gi, 'href="/blogs/$1/"');
}

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const day = (d) => `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const iso = (d) => d.toISOString().slice(0, 10);

function page({ title, description, canonical, body, image }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonical}">
<link rel="icon" href="/img/techswitch-mark.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="TechSwitch blog" href="/blogs/rss.xml">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${canonical}">${image ? `\n<meta property="og:image" content="${esc(image)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500&family=Onest:wght@350;400;500&family=JetBrains+Mono&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css">
<script>document.documentElement.classList.add('js'); try { const m = localStorage.getItem('mode'); if (m === 'dark' || m === 'light') document.documentElement.dataset.mode = m; } catch {}</script>
<script src="/mode.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${chrome.nav}
<main id="main">
${body}
</main>
${chrome.footer}
<script>document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });</script>
</body>
</html>
`;
}

const cover = (p, cls, priority) => p.cover
  ? `<figure class="${cls}" data-slot="cover-${p.slug}" data-alt="Cover for ${esc(p.title)}"><img src="${esc(p.cover)}?w=1600&amp;auto=compress,format" alt="" width="1600" height="900"${priority ? ' fetchpriority="high"' : ' loading="lazy"'}></figure>`
  : '';

function indexPage(posts) {
  const rows = posts.map((p, i) => `      <li class="feed__row${i === 0 ? ' feed__row--lead' : ''}">
        ${i === 0 ? cover(p, 'cover', true) : ''}
        <time datetime="${iso(p.date)}">${day(p.date)}</time>
        <h2><a href="/blogs/${p.slug}/">${esc(p.title)}</a></h2>
        <p class="feed__brief">${esc(p.brief)}</p>
        <p class="feed__min">${p.minutes} min read</p>
      </li>`).join('\n');
  return page({
    title: 'Blogs: TechSwitch',
    description: 'Notes on DevSecOps, GitHub Actions, Python and the JVM from TechSwitch.',
    canonical: '/blogs/',
    body: `  <section class="container banner" aria-labelledby="blog-title">
    <div class="banner__grid">
      <h1 id="blog-title">the techswitch blog</h1>
      <p class="lead">Notes on pipelines, Python and the JVM, written while doing the work.</p>
    </div>
  </section>
  <div class="container">
    <ol class="feed">
${rows}
    </ol>
  </div>`,
  });
}

function postPage(p) {
  return page({
    title: `${p.title}: TechSwitch`,
    description: p.brief || p.title,
    canonical: `/blogs/${p.slug}/`,
    image: p.cover,
    body: `  <article class="container article">
    <header class="article__head">
      <a class="link" href="/blogs/">all posts</a>
      <h1>${esc(p.title)}</h1>
      <div class="article__meta">
        <time datetime="${iso(p.date)}">${day(p.date)}</time>
        <span>${p.minutes} min read</span>
      </div>
      ${p.tags.length ? `<ul class="tags" aria-label="Tags">${p.tags.map((t) => `<li>${esc(t.toLowerCase())}</li>`).join('')}</ul>` : ''}
    </header>
    ${cover(p, 'article__cover', true)}
    <div class="prose">
${p.html}
    </div>
    <p class="article__back"><a class="link" href="/blogs/">back to all posts</a></p>
  </article>`,
  });
}

function rss(posts) {
  const items = posts.map((p) => `<item><title><![CDATA[${p.title}]]></title><link>${SITE}/blogs/${p.slug}/</link><guid isPermaLink="true">${SITE}/blogs/${p.slug}/</guid><description><![CDATA[${p.brief}]]></description><pubDate>${p.date.toUTCString()}</pubDate>${p.tags.map((t) => `<category><![CDATA[${t}]]></category>`).join('')}<content:encoded><![CDATA[${p.html}]]></content:encoded></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>TechSwitch blog</title><link>${SITE}/blogs/</link><description>Notes on DevSecOps, cloud and Python from TechSwitch.</description><language>en</language><atom:link href="${SITE}/blogs/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>\n`;
}

function homeCards(posts) {
  return `<ol class="posts">
${posts.slice(0, 3).map((p) => `      <li class="post-card">
        ${cover(p, 'cover', false)}
        <time datetime="${iso(p.date)}">${day(p.date)}</time>
        <h3><a href="/blogs/${p.slug}/">${esc(p.title)}</a></h3>
      </li>`).join('\n')}
    </ol>`;
}

const notFound = () => page({
  title: 'Not found: TechSwitch',
  description: 'This page is not on techswitch.in.',
  canonical: '/404',
  body: `  <section class="container lost" aria-labelledby="lost-title">
    <h1 id="lost-title">nothing at this address</h1>
    <p class="lead">The page may have moved when the blog came to /blogs.</p>
    <div class="actions"><a class="btn btn--primary" href="/blogs/">all posts</a><a class="btn btn--secondary" href="/">home</a></div>
  </section>`,
});

// nav and footer come from index.html, so the pages never drift apart
const home = await readFile(join(pub, 'index.html'), 'utf8');
const between = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b) + b.length);
const chrome = {
  nav: between(home, '<!-- chrome:nav -->', '<!-- /chrome:nav -->'),
  footer: between(home, '<!-- chrome:footer -->', '<!-- /chrome:footer -->'),
};

const posts = parse(await loadFeed());
if (!posts.length) throw new Error('the feed has no posts');

await rm(join(pub, 'blogs'), { recursive: true, force: true });
await mkdir(join(pub, 'blogs'), { recursive: true });
await writeFile(join(pub, 'blogs', 'index.html'), indexPage(posts));
for (const p of posts) {
  await mkdir(join(pub, 'blogs', p.slug), { recursive: true });
  await writeFile(join(pub, 'blogs', p.slug, 'index.html'), postPage(p));
}
await writeFile(join(pub, 'blogs', 'rss.xml'), rss(posts));
await writeFile(join(pub, '404.html'), notFound());

// old Hashnode addresses keep working
const redirects = [
  '# generated by scripts/build-blog.mjs',
  '/rss.xml /blogs/rss.xml 301',
  '/archive /blogs/ 301',
  '/blog /blogs/ 301',
  '/blog/* /blogs/:splat 301',
  ...posts.map((p) => `/${p.slug} /blogs/${p.slug}/ 301`),
];
await writeFile(join(pub, '_redirects'), redirects.join('\n') + '\n');

const start = '<!-- posts:start -->', end = '<!-- posts:end -->';
await writeFile(join(pub, 'index.html'), home.slice(0, home.indexOf(start) + start.length) + '\n    ' + homeCards(posts) + '\n    ' + home.slice(home.indexOf(end)));

console.log(`built ${posts.length} posts: ${posts.map((p) => p.slug).join(', ')}`);
