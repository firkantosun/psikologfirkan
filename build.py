#!/usr/bin/env python3
"""psikologfirkan.com statik site derleyicisi.

Tek kaynak: src/template.html (tüm sayfaları içeren tasarım) ve src/posts.json (blog).
Çıktı: dist/ — her sayfa kendi adresinde, blog yazıları önceden oluşturulmuş HTML olarak.
Kullanım: python3 build.py
"""
import html
import json
import os
import re
import shutil
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
DIST = os.path.join(ROOT, "dist")
SITE = "https://psikologfirkan.com"
NAME = "Muhammed Furkan Tosun"
EMAIL = "furkantosunoficial@gmail.com"
INSTAGRAM = "https://www.instagram.com/psikologfirkan/"
MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]

PAGES = {
    "home": {"path": "/", "title": "Psikolog Muhammed Furkan Tosun | Psikolog Firkan",
             "desc": "Psikolog Muhammed Furkan Tosun (@psikologfirkan). Kaygı, panik, stres, ruh hâli ve iş hayatına dair zorluklarda bilişsel davranışçı terapi temelli online ve yüz yüze görüşme."},
    "hikaye": {"path": "/hikayem/", "title": "Hikâyem | Psikolog Muhammed Furkan Tosun",
               "desc": "Yurtlarda geçen bir çocukluktan, okuma yazma kursundan psikolojiye uzanan yol: Psikolog Muhammed Furkan Tosun'un hikâyesi, kısa bir film gibi."},
    "yaklasim": {"path": "/terapi-yaklasimim/", "title": "Terapi Yaklaşımım: Bilişsel Davranışçı Terapi | Psikolog Firkan",
                 "desc": "Bilişsel Davranışçı Terapi (BDT) nedir, terapi nasıl ilerler, seanslarda neler yapılır? Psikolog Muhammed Furkan Tosun'un terapi yaklaşımı ve kısa bir düşünce çalışması."},
    "ozgecmis": {"path": "/ozgecmis/", "title": "Özgeçmiş | Psikolog Muhammed Furkan Tosun",
                 "desc": "Psikolog Muhammed Furkan Tosun'un eğitimi ve deneyimi: İstanbul Kent Üniversitesi Psikoloji, Marmara Üniversitesi Endüstri ve Örgüt Psikolojisi Yüksek Lisansı, BDT uygulayıcı sertifikası."},
    "blog": {"path": "/blog/", "title": "Blog: Psikoloji Yazıları | Psikolog Firkan",
             "desc": "Kaygı, panik, depresyon, stres ve gündelik hayata dair bilimsel temelli, Türkiye odaklı psikoloji yazıları. Psikolog Muhammed Furkan Tosun."},
    "randevu": {"path": "/randevu/", "title": "Randevu Al | Psikolog Muhammed Furkan Tosun",
                "desc": "Psikolog Muhammed Furkan Tosun ile online ya da yüz yüze görüşme için randevu al. Hafta içi 17:00–21:00, pazar 10:00–16:00."},
    "iletisim": {"path": "/iletisim/", "title": "İletişim | Psikolog Muhammed Furkan Tosun",
                 "desc": "Psikolog Muhammed Furkan Tosun ile iletişim: e-posta ve Instagram."},
}
HREFS = {"#basla": "/", "#film": "/hikayem/", "#yaklasim": "/terapi-yaklasimim/", "#ozgecmis": "/ozgecmis/",
         "#blog": "/blog/", "#iletisim": "/iletisim/", "#randevu": "/randevu/"}

esc = lambda s: html.escape(str(s), quote=True)


def fmt_date(d):
    y, m, dd = d.split("-")
    return f"{int(dd)} {MONTHS[int(m) - 1]} {y}"


def between(s, a, b, start=0):
    i = s.index(a, start)
    j = s.index(b, i)
    return s[i:j], j


def parse_template():
    t = open(os.path.join(SRC, "template.html"), encoding="utf-8").read()
    css = t[t.index("<style>") + 7:t.index("</style>")]
    fonts = "\n".join(re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*>', t[:t.index("<style>")]))
    nav = t[t.index('<nav class="top">'):t.index("</nav>") + 6]
    hud = t[t.index('<div class="hud"'):t.index('<div class="view')]
    views = {}
    starts = [m.start() for m in re.finditer(r'<div class="view', t)]
    foot = t.index("<footer>")
    for k, st in enumerate(starts):
        end = starts[k + 1] if k + 1 < len(starts) else foot
        block = t[st:end]
        name = re.search(r'data-view="([a-z]+)"', block).group(1)
        block = re.sub(r'(<div class="view[^"]*" data-view="[a-z]+") hidden>', r'\1>', block, count=1)
        views[name] = block
    footer = t[foot:t.index("</footer>") + 9]
    lightbox = t[t.index('<div class="lightbox"'):t.index("<script>")]
    js = t[t.index("<script>") + 8:t.rindex("</script>")]
    return css, fonts, nav, hud, views, footer, lightbox, js


def fix_links(s):
    for k, v in HREFS.items():
        s = s.replace(f'href="{k}"', f'href="{v}"')
    s = s.replace('src="img/', 'src="/img/').replace('data-src="img/', 'data-src="/img/')
    return s


def build_js(js):
    def cut(a, b=None):
        i = js.index(a)
        j = js.index(b, i) if b else len(js)
        return js[i:j]
    prelude = js[:js.index("  /* harfler ve toz */")].replace("(function () {", "", 1)
    home = cut("  /* harfler ve toz */", "  /* yöntem: bilişsel model */")
    yontem = cut("  /* yöntem: bilişsel model */", "  /* blog */")
    tr = cut("  /* düşünce kaydı (kısa) */", "  /* randevu */")
    randevu = cut("  /* randevu */", "  /* kopyala */")
    copy = cut("  /* kopyala */")
    copy = copy[:copy.rindex("})();")]
    lb_a = "  var lb = document.getElementById('lightbox')"
    lb_b = "  photos.forEach(function (p, i) {"
    lb = home[home.index(lb_a):home.index(lb_b)]
    home = home.replace(lb, "")
    dsrc = re.search(r"  document\.querySelectorAll\('\[data-src\]'\)[^\n]*\n", home).group(0)
    home = home.replace(dsrc, "")
    home = home.replace("img.src = 'img/'", "img.src = '/img/'")
    tr = tr.replace("l.href = '#randevu'", "l.href = '/randevu/'")
    mk = "  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }\n"
    common = f"""
  var PAGE = document.body.getAttribute('data-page');
{mk}
{lb}
{dsrc}
  var fade = document.getElementById('jumpfade');
  function fadeThen(fn) {{
    if (reduce || !fade) {{ fn(); return; }}
    fade.classList.add('on');
    setTimeout(function () {{ fn(); requestAnimationFrame(function () {{ requestAnimationFrame(function () {{ fade.classList.remove('on'); }}); }}); }}, 300);
  }}
  document.addEventListener('click', function (e) {{
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="/"]'); if (!a || a.target) return;
    var u = new URL(a.href, location.href);
    if (u.pathname === location.pathname) return;
    e.preventDefault(); fadeThen(function () {{ location.href = a.href; }});
  }});
  var navCur = document.querySelector('nav.top ul [aria-current]');
  if (navCur) {{ var ul = navCur.closest('ul'); ul.scrollLeft = Math.max(0, navCur.offsetLeft - ul.offsetLeft - 24); }}
  window.addEventListener('pageshow', function () {{ if (fade) fade.classList.remove('on'); }});
  var bf = document.getElementById('bFilters');
  if (bf) bf.addEventListener('click', function (e) {{
    var b = e.target.closest('button'); if (!b) return;
    var c = b.getAttribute('data-cat');
    Array.prototype.forEach.call(bf.children, function (x) {{ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }});
    document.querySelectorAll('#bGrid .b-card').forEach(function (card, i) {{
      card.hidden = !(c === 'Tümü' || card.getAttribute('data-cat') === c);
      card.classList.toggle('lead', c === 'Tümü' && i === 0);
    }});
  }});
"""
    home_extra = """
  document.getElementById('hudHome').addEventListener('click', function () { fadeThen(function () { location.href = '/'; }); });
  document.getElementById('hudSkip').addEventListener('click', function () { fadeThen(function () { location.href = '/terapi-yaklasimim/'; }); });
"""
    return ("(function () {\n" + prelude + common +
            "  if (PAGE === 'hikaye') {\n" + home + home_extra + "  }\n" +
            "  if (PAGE === 'yaklasim') {\n" + yontem + tr + "  }\n" +
            "  if (PAGE === 'randevu') {\n" + randevu + "  }\n" +
            copy + "})();\n")


def person_ld():
    return {
        "@context": "https://schema.org", "@type": "Person", "name": NAME, "alternateName": "Psikolog Firkan",
        "jobTitle": "Psikolog", "url": SITE + "/", "image": SITE + "/img/portre.jpg", "email": "mailto:" + EMAIL,
        "sameAs": [INSTAGRAM],
        "alumniOf": [{"@type": "CollegeOrUniversity", "name": "İstanbul Kent Üniversitesi"},
                     {"@type": "CollegeOrUniversity", "name": "Marmara Üniversitesi"}],
        "knowsAbout": ["Bilişsel Davranışçı Terapi", "Endüstri ve Örgüt Psikolojisi", "Kaygı", "Panik", "Depresyon"],
    }


def head(title, desc, path, ld, fonts, og_type="website", image="/img/portre.jpg"):
    url = SITE + path
    return f"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="author" content="{NAME}">
<meta property="og:type" content="{og_type}">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="Psikolog Firkan">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#133A3E">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
{fonts}
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
"""


def page(name, body_view, ctx, title=None, desc=None, path=None, ld=None, og_type="website", image="/img/portre.jpg"):
    css, fonts, nav, hud, views, footer, lightbox, js = ctx
    p = PAGES[name]
    title, desc, path = title or p["title"], desc or p["desc"], path or p["path"]
    navx = fix_links(nav)
    cur = PAGES[name]["path"]
    navx = navx.replace(f'<li><a href="{cur}"', f'<li><a aria-current="page" href="{cur}"', 1)
    cls = "" if name == "hikaye" else ' class="on-page"'
    out = head(title, desc, path, ld or person_ld(), fonts, og_type, image)
    out += f'<body data-page="{name}"{cls}>\n' + navx + "\n"
    out += fix_links(hud) if name == "hikaye" else '<div class="jumpfade" id="jumpfade" aria-hidden="true"></div>\n'
    out += fix_links(body_view) + fix_links(footer) + "\n" + lightbox
    out += '<script src="/assets/site.js" defer></script>\n</body>\n</html>\n'
    return out


def block_html(b):
    if "h" in b:
        return f"<h2>{esc(b['h'])}</h2>"
    if "p" in b:
        return f"<p>{esc(b['p'])}</p>"
    if "ul" in b:
        return "<ul>" + "".join(f"<li>{esc(x)}</li>" for x in b["ul"]) + "</ul>"
    return ""


def card(p, lead=False):
    return (f'<a class="b-card{" lead" if lead else ""}" href="/blog/{esc(p["slug"])}/" data-cat="{esc(p["category"])}">'
            f'<div class="b-cm"><span class="b-cat">{esc(p["category"])}</span><span>{fmt_date(p["date"])} · {int(p["minutes"])} dk</span></div>'
            f'<h3>{esc(p["title"])}</h3><p>{esc(p["excerpt"])}</p><span class="b-read">Oku →</span></a>')


def blog_list(posts):
    cats = ["Tümü"] + sorted({p["category"] for p in posts}, key=lambda c: [p["category"] for p in posts].index(c))
    filters = "".join(f'<button type="button" data-cat="{esc(c)}" aria-pressed="{"true" if i == 0 else "false"}">{esc(c)}</button>' for i, c in enumerate(cats))
    cards = "".join(card(p, i == 0) for i, p in enumerate(posts)) or '<p class="b-empty">Henüz yazı yok.</p>'
    return f"""<div class="view page" data-view="blog">
<section class="blog" id="p-blog">
  <div class="wrap">
    <div class="b-list">
      <div class="b-head">
        <div class="label">Blog</div>
        <h1 style="font-size: clamp(30px, 4.4vw, 48px)">Psikoloji üzerine yazılar</h1>
        <p>Türkiye'de sık yaşanan psikolojik zorluklar, gündelik hayat ve terapi odasından; bilimsel temelli, anlaşılır yazılar.</p>
      </div>
      <div class="b-filters" id="bFilters" role="group" aria-label="Kategori">{filters}</div>
      <div class="b-grid" id="bGrid">{cards}</div>
    </div>
  </div>
</section>
</div>
"""


def blog_post(p, posts):
    body = "\n".join(block_html(b) for b in p.get("body", []))
    srcs = [s for s in p.get("sources", []) if str(s.get("url", "")).startswith("https://")]
    src_html = ""
    if srcs:
        src_html = '<div class="b-src"><div class="label">Kaynaklar</div><ol>' + "".join(
            f'<li><a href="{esc(s["url"])}" target="_blank" rel="noopener">{esc(s.get("title") or s["url"])}</a></li>' for s in srcs) + "</ol></div>"
    others = [x for x in posts if x["slug"] != p["slug"]][:2]
    more = ('<div class="b-more"><div class="label">Diğer yazılar</div><div class="b-grid two">' + "".join(card(x) for x in others) + "</div></div>") if others else ""
    upd = p.get("updated") or p["date"]
    return f"""<div class="view page" data-view="blog">
<section class="blog" id="p-blog">
  <div class="wrap">
    <article class="b-post">
      <a class="b-back" href="/blog/">← Tüm yazılar</a>
      <div class="b-meta"><span class="b-cat">{esc(p["category"])}</span><span><time datetime="{p["date"]}">{fmt_date(p["date"])}</time> · {int(p["minutes"])} dk okuma</span></div>
      <h1>{esc(p["title"])}</h1>
      <div class="b-by"><img src="/img/portre.jpg" alt=""><span>Psikolog {NAME}</span></div>
      <div class="b-body">
{body}
      </div>
      {src_html}
      <p class="b-disc">Bu yazı bilgilendirme amaçlıdır; tanı ya da tedavi yerine geçmez. Acil bir durumdaysan 112'yi ara.<br>Son güncelleme: {fmt_date(upd)} · Editör: Psikolog {NAME} · {EMAIL}</p>
      <div class="b-cta"><p>Bu konuda destek almak istersen randevu alabilirsin.</p><a class="btn primary dark" href="/randevu/">Randevu al</a></div>
      {more}
    </article>
  </div>
</section>
</div>
"""


def main():
    ctx = parse_template()
    css, fonts, nav, hud, views, footer, lightbox, js = ctx
    posts = json.load(open(os.path.join(SRC, "posts.json"), encoding="utf-8"))["posts"]
    posts.sort(key=lambda p: p["date"], reverse=True)
    slugs = [p["slug"] for p in posts]
    assert len(slugs) == len(set(slugs)), "Aynı slug iki kez kullanılmış"
    for p in posts:
        assert re.fullmatch(r"[a-z0-9-]+", p["slug"]), "Geçersiz slug: " + p["slug"]

    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(os.path.join(DIST, "assets"))
    shutil.copytree(os.path.join(SRC, "img"), os.path.join(DIST, "img"))
    static = os.path.join(SRC, "static")
    if os.path.isdir(static):
        for f in os.listdir(static):
            shutil.copy(os.path.join(static, f), os.path.join(DIST, f))
    for f in ["favicon.svg", "apple-touch-icon.png"]:
        if os.path.exists(os.path.join(SRC, f)):
            shutil.copy(os.path.join(SRC, f), os.path.join(DIST, f))

    base = "body { margin: 0; }\nimg { max-width: 100%; }\n:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }\n"
    open(os.path.join(DIST, "assets", "site.css"), "w", encoding="utf-8").write(base + fix_links(css))
    open(os.path.join(DIST, "assets", "site.js"), "w", encoding="utf-8").write(build_js(js))

    def write(path, content):
        full = os.path.join(DIST, path.strip("/"), "index.html") if path != "/" else os.path.join(DIST, "index.html")
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, "w", encoding="utf-8").write(content)

    latest = "".join(card(p) for p in posts[:3])
    write("/", page("home", views["home"].replace("<!--SON-YAZILAR-->", latest), ctx))
    write("/hikayem/", page("hikaye", views["hikaye"], ctx))
    write("/terapi-yaklasimim/", page("yaklasim", views["yaklasim"], ctx))
    write("/ozgecmis/", page("ozgecmis", views["ozgecmis"], ctx))
    write("/iletisim/", page("iletisim", views["iletisim"], ctx))
    write("/randevu/", page("randevu", views["randevu"], ctx))
    blog_ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Psikolog Firkan Blog", "url": SITE + "/blog/",
               "author": person_ld()}
    write("/blog/", page("blog", blog_list(posts), ctx, ld=blog_ld))
    for p in posts:
        path = f"/blog/{p['slug']}/"
        ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p["excerpt"],
              "datePublished": p["date"], "dateModified": p.get("updated") or p["date"], "inLanguage": "tr-TR",
              "mainEntityOfPage": SITE + path, "image": SITE + "/img/portre.jpg",
              "author": {"@type": "Person", "name": NAME, "jobTitle": "Psikolog", "url": SITE + "/"},
              "publisher": {"@type": "Person", "name": NAME, "url": SITE + "/"},
              "articleSection": p["category"]}
        write(path, page("blog", blog_post(p, posts), ctx, title=f'{p["title"]} | Psikolog Firkan', desc=p["excerpt"],
                         path=path, ld=ld, og_type="article"))

    nf = page("iletisim", '<div class="view page"><section class="sec"><div class="wrap" style="padding-block:120px"><div class="label">404</div><h1 style="font-size:clamp(30px,4vw,46px);margin:12px 0 16px">Bu sayfa bulunamadı.</h1><p style="margin-bottom:24px">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.</p><a class="btn primary dark" href="/">Ana sayfaya dön</a></div></section></div>\n', ctx,
              title="Sayfa bulunamadı | Psikolog Firkan", desc="Sayfa bulunamadı.", path="/404")
    nf = nf.replace('aria-current="page" ', "").replace('<link rel="canonical" href="https://psikologfirkan.com/404">\n', '<meta name="robots" content="noindex">\n')
    open(os.path.join(DIST, "404.html"), "w", encoding="utf-8").write(nf)

    today = date.today().isoformat()
    urls = [("/", today), ("/hikayem/", today), ("/terapi-yaklasimim/", today), ("/ozgecmis/", today), ("/blog/", posts[0]["date"] if posts else today), ("/iletisim/", today), ("/randevu/", today)]
    urls += [(f"/blog/{p['slug']}/", p.get("updated") or p["date"]) for p in posts]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{d}</lastmod></url>\n" for u, d in urls) + "</urlset>\n"
    open(os.path.join(DIST, "sitemap.xml"), "w", encoding="utf-8").write(sm)
    open(os.path.join(DIST, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    open(os.path.join(DIST, "CNAME"), "w").write("psikologfirkan.com\n")
    open(os.path.join(DIST, ".nojekyll"), "w").write("")
    print(f"Derlendi: {len(posts)} yazı, {len(urls)} adres → dist/")


if __name__ == "__main__":
    main()
