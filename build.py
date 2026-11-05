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
EMAIL = "psikologfurkantosun@gmail.com"
PHONE = "+905384840141"
PHONE_TXT = "0538 484 01 41"
BIZ_NAME = "Psikolog Muhammed Furkan Tosun"
HOURS = [(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "17:00", "21:00"), (["Sunday"], "10:00", "16:00")]
MAP_Q = "Koşuyolu, Kadıköy, İstanbul"
INSTAGRAM = "https://www.instagram.com/psikologfirkan/"
MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]

PAGES = {
    "home": {"path": "/", "title": "Psikolog Muhammed Furkan Tosun | Psikolog Firkan",
             "desc": "Psikolog Muhammed Furkan Tosun: kaygı, panik, stres ve iş hayatına dair zorluklarda BDT temelli yüz yüze (Kadıköy) ve online görüşme."},
    "hikaye": {"path": "/hikayem/", "title": "Hikâyem | Psikolog Muhammed Furkan Tosun",
               "desc": "Yurtlarda geçen bir çocukluktan, okuma yazma kursundan psikolojiye uzanan yol: Psikolog Muhammed Furkan Tosun'un hikâyesi, kısa bir film gibi."},
    "yaklasim": {"path": "/terapi-yaklasimim/", "title": "Terapi Yaklaşımım: Bilişsel Davranışçı Terapi (BDT)",
                 "desc": "Bilişsel davranışçı terapi (BDT) nedir, terapi nasıl ilerler, seanslarda neler yapılır? Terapi yaklaşımım ve kısa bir düşünce çalışması."},
    "ozgecmis": {"path": "/ozgecmis/", "title": "Özgeçmiş | Psikolog Muhammed Furkan Tosun",
                 "desc": "Psikolog Muhammed Furkan Tosun'un eğitimi ve deneyimi: İstanbul Kent Üniversitesi Psikoloji, Marmara Üniversitesi Endüstri ve Örgüt Psikolojisi YL."},
    "blog": {"path": "/blog/", "title": "Blog: Psikoloji Yazıları | Psikolog Firkan",
             "desc": "Kaygı, panik, depresyon, stres ve gündelik hayata dair bilimsel temelli, Türkiye odaklı psikoloji yazıları. Psikolog Muhammed Furkan Tosun."},
    "randevu": {"path": "/randevu/", "title": "Randevu Al | Psikolog Muhammed Furkan Tosun",
                "desc": "Psikolog Muhammed Furkan Tosun ile online ya da yüz yüze görüşme için randevu al. Hafta içi 17:00–21:00, pazar 10:00–16:00."},
    "iletisim": {"path": "/iletisim/", "title": "İletişim | Psikolog Muhammed Furkan Tosun",
                 "desc": "Psikolog Muhammed Furkan Tosun ile iletişim: telefon, e-posta ve Instagram. Kadıköy Koşuyolu'nda yüz yüze ve online görüşme."},
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
    randevu = cut("  /* randevu */", "  /* anlat */")
    anlat = cut("  /* anlat */", "  /* kopyala */")
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
  var sc = document.getElementById('stickyCta');
  if (sc) {{
    var scEnd = document.querySelector('.contact, .b-cta');
    var scTick = function () {{
      var past = window.scrollY > 480;
      var nearEnd = scEnd && scEnd.getBoundingClientRect().top < window.innerHeight - 40;
      var anEl = document.getElementById('an'), inAn = false;
      if (anEl) {{ var r = anEl.getBoundingClientRect(); inAn = r.top < window.innerHeight && r.bottom > 80; }}
      sc.classList.toggle('show', past && !nearEnd && !inAn);
    }};
    window.addEventListener('scroll', scTick, {{ passive: true }}); scTick();
  }}
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
            "  if (PAGE === 'home') {\n" + anlat + "  }\n" +
            copy + "})();\n")


def business_ld():
    return {
        "@context": "https://schema.org", "@type": "MedicalBusiness", "@id": SITE + "/#isletme",
        "name": BIZ_NAME, "alternateName": "Psikolog Firkan", "url": SITE + "/", "image": SITE + "/img/portre.jpg",
        "telephone": PHONE, "email": EMAIL, "sameAs": [INSTAGRAM],
        "description": "Bilişsel davranışçı terapi temelli yüz yüze (Kadıköy) ve online psikolojik danışmanlık.",
        "address": {"@type": "PostalAddress", "addressLocality": "Kadıköy", "addressRegion": "İstanbul", "addressCountry": "TR"},
        "areaServed": [{"@type": "City", "name": "İstanbul"}, {"@type": "AdministrativeArea", "name": "Kadıköy"}],
        "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": d, "opens": o, "closes": c} for d, o, c in HOURS],
        "founder": {"@id": SITE + "/#psikolog"},
    }


def crumbs_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(items)]}


def faq_ld(pairs):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]}


def person_ld():
    return {
        "@context": "https://schema.org", "@type": "Person", "@id": SITE + "/#psikolog", "name": NAME, "alternateName": "Psikolog Firkan",
        "jobTitle": "Psikolog", "url": SITE + "/", "image": SITE + "/img/portre.jpg", "email": "mailto:" + EMAIL, "telephone": PHONE,
        "worksFor": {"@id": SITE + "/#isletme"},
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
<meta property="og:image:alt" content="Psikolog Muhammed Furkan Tosun">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{SITE}{image}">
<meta name="theme-color" content="#133A3E">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
{fonts}
<link rel="stylesheet" href="/assets/site.css">
{"".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False).replace("</", "<\\/") + '</script>' + chr(10) for x in (ld if isinstance(ld, list) else [ld]))}
</head>
"""


def page(name, body_view, ctx, title=None, desc=None, path=None, ld=None, og_type="website", image="/img/portre.jpg"):
    css, fonts, nav, hud, views, footer, lightbox, js = ctx
    p = PAGES.get(name, {})
    title, desc, path = title or p["title"], desc or p["desc"], path or p["path"]
    navx = fix_links(nav)
    cur = p.get("path", path)
    navx = navx.replace(f'<li><a href="{cur}"', f'<li><a aria-current="page" href="{cur}"', 1)
    cls = "" if name == "hikaye" else ' class="on-page"'
    out = head(title, desc, path, ld or person_ld(), fonts, og_type, image)
    out += f'<body data-page="{name}"{cls}>\n' + navx + "\n"
    out += fix_links(hud) if name == "hikaye" else '<div class="jumpfade" id="jumpfade" aria-hidden="true"></div>\n'
    out += fix_links(body_view) + fix_links(footer) + "\n" + lightbox
    if name not in ("randevu", "hikaye"):
        out += '<a class="sticky-cta" id="stickyCta" href="/randevu/">Randevu al <small>· online / yüz yüze</small></a>\n'
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
    rest = [x for x in posts if x["slug"] != p["slug"]]
    others = ([x for x in rest if x["category"] == p["category"]] + [x for x in rest if x["category"] != p["category"]])[:3]
    lp = LANDING_FOR.get(p["category"], LANDING_DEFAULT)
    rel = (f'<div class="b-rel"><div class="label">Görüşme</div><a href="{lp[0]}">{esc(lp[1])}</a><p>{esc(lp[2])}</p></div>')
    more = ('<div class="b-more"><div class="label">İlgili yazılar</div><div class="b-grid">' + "".join(card(x) for x in others) + "</div></div>") if others else ""
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
      <div class="b-cta"><div><p>Bunu okurken kendini tanıdın mı?</p><span>Bu konuda birlikte çalışabiliriz. Takvimden sana uygun saati seçmen yeterli; online ya da yüz yüze.</span></div><a class="btn primary dark" href="/randevu/">Uygun saatleri gör</a></div>
      {rel}
      {more}
    </article>
  </div>
</section>
</div>
"""


LANDING_DEFAULT = ("/kadikoy-psikolog/", "Kadıköy'de yüz yüze ya da online görüşme", "Koşuyolu'ndaki ofiste ya da görüntülü görüşmeyle; görüşmelerin nasıl ilerlediğini bu sayfada anlattım.")
LANDING_FOR = {
    "İş yaşamı": ("/online-psikolog/", "Yoğun tempoda online görüşme", "Mesai ve yol süresi düzenli görüşmeyi zorlaştırıyorsa online görüşme nasıl yürüyor, nasıl hazırlanılır?"),
    "Stres": ("/online-psikolog/", "Yoğun tempoda online görüşme", "Mesai ve yol süresi düzenli görüşmeyi zorlaştırıyorsa online görüşme nasıl yürüyor, nasıl hazırlanılır?"),
    "Yalnızlık": ("/istanbul-psikolog/", "İstanbul'da yüz yüze ya da online görüşme", "Büyük şehrin temposunda sana uygun görüşme biçimini seçmek için."),
    "Gençlik": ("/istanbul-psikolog/", "İstanbul'da yüz yüze ya da online görüşme", "Şehrin neresinde olursan ol, sana uygun görüşme biçimini seçmek için."),
}


def seo_title(t):
    if len(t) > 60:
        m = re.match(r"^(.+?[?:])\s", t)
        if m and len(m.group(1)) >= 20:
            t = m.group(1).rstrip(":")
    if len(t) > 60:
        t = t[:58].rsplit(" ", 1)[0] + "…"
    return t + " | Psikolog Firkan" if len(t) + 17 <= 60 else t


def seo_desc(d):
    d = d.strip()
    return d if len(d) <= 155 else d[:153].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def landing_html(pg, all_pages):
    def blocks(bs):
        return "\n".join(block_html(b) for b in bs)
    faq = "".join(f"<details><summary>{esc(f['q'])}</summary><p>{esc(f['a'])}</p></details>" for f in pg["faq"])
    mp = ""
    if pg.get("map"):
        q = html.escape(MAP_Q.replace(" ", "+"))
        mp = (f'<div class="lp-map"><iframe title="Koşuyolu, Kadıköy haritası" loading="lazy" referrerpolicy="no-referrer-when-downgrade" '
              f'src="https://www.google.com/maps?q={q}&amp;z=15&amp;output=embed"></iframe></div>'
              f'<p class="lp-note">Harita semtin konumunu gösterir; açık adres randevu onayıyla iletilir.</p>')
    others = "".join(f'<a href="{o["path"]}">{esc(o["h1"])} →</a>' for o in all_pages if o["key"] != pg["key"])
    return f"""<div class="view page" data-view="lp">
<section class="lp">
  <div class="wrap">
    <nav class="crumbs" aria-label="Sayfa yolu"><a href="/">Ana sayfa</a> › <span>{esc(pg["crumb"])}</span></nav>
    <div class="lp-head"><div class="label">{esc(pg["label"])}</div><h1>{esc(pg["h1"])}</h1><p>{esc(pg["lead"])}</p>
      <div class="cta" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn primary dark" href="/randevu/">Randevu al</a><a class="btn ghost-dark" href="tel:{PHONE}">Ara: {PHONE_TXT}</a></div></div>
    <div class="lp-grid">
      <div class="lp-body">
{blocks(pg["body"])}
        <h2>Sık sorulan sorular</h2>
        <div class="faq">{faq}</div>
        <h2>İletişim ve randevu</h2>
        <p>Randevunu takvimden seçebilir ya da aklındaki soruları önce telefon veya e-postayla sorabilirsin. Acil bir durumdaysan 112'yi ara.</p>
        <div class="lp-more">{others}<a href="/terapi-yaklasimim/">Terapi yaklaşımım →</a></div>
      </div>
      <aside class="lp-side" aria-label="İletişim bilgileri">
        <h2>{BIZ_NAME}</h2>
        <dl><dt>Konum</dt><dd>Koşuyolu, Kadıköy / İstanbul</dd><dt>Görüşme</dt><dd>Yüz yüze ve online</dd>
        <dt>Saatler</dt><dd>Hafta içi 17:00–21:00<br>Pazar 10:00–16:00<br>Cumartesi kapalı</dd>
        <dt>Telefon</dt><dd><a href="tel:{PHONE}">{PHONE_TXT}</a></dd><dt>E-posta</dt><dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd></dl>
        <a class="btn primary dark" href="/randevu/">Randevu al</a>
        {mp}
      </aside>
    </div>
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

    written = []

    def write(path, content, lastmod=None):
        written.append((path, lastmod or date.today().isoformat()))
        full = os.path.join(DIST, path.strip("/"), "index.html") if path != "/" else os.path.join(DIST, "index.html")
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, "w", encoding="utf-8").write(content)

    latest = "".join(card(p) for p in posts[:3])
    home_faq = [(html.unescape(re.sub(r"<[^>]+>", "", q)), html.unescape(re.sub(r"<[^>]+>", "", a)))
                for q, a in re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", views["home"], re.S)]
    website = {"@context": "https://schema.org", "@type": "WebSite", "name": "Psikolog Firkan", "url": SITE + "/", "inLanguage": "tr-TR"}
    write("/", page("home", views["home"].replace("<!--SON-YAZILAR-->", latest), ctx,
                    ld=[person_ld(), business_ld(), website] + ([faq_ld(home_faq)] if home_faq else [])))
    for key, crumb in [("hikaye", "Hikâyem"), ("yaklasim", "Terapi yaklaşımım"), ("ozgecmis", "Özgeçmiş"), ("iletisim", "İletişim"), ("randevu", "Randevu al")]:
        write(PAGES[key]["path"], page(key, views[key], ctx, ld=[person_ld(), crumbs_ld([("Ana sayfa", "/"), (crumb, PAGES[key]["path"])])]))
    landing = json.load(open(os.path.join(SRC, "landing.json"), encoding="utf-8"))["pages"]
    for pg in landing:
        lds = [person_ld(), crumbs_ld([("Ana sayfa", "/"), (pg["crumb"], pg["path"])]), faq_ld([(f["q"], f["a"]) for f in pg["faq"]])]
        if pg["key"] == "kadikoy":
            lds.insert(1, business_ld())
        write(pg["path"], page("lp", landing_html(pg, landing), ctx, title=pg["title"], desc=pg["desc"], path=pg["path"], ld=lds))
    blog_ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Psikolog Firkan Blog", "url": SITE + "/blog/",
               "author": person_ld()}
    write("/blog/", page("blog", blog_list(posts), ctx, ld=[blog_ld, crumbs_ld([("Ana sayfa", "/"), ("Blog", "/blog/")])]),
          posts[0]["date"] if posts else None)
    for p in posts:
        path = f"/blog/{p['slug']}/"
        ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p["excerpt"],
              "datePublished": p["date"], "dateModified": p.get("updated") or p["date"], "inLanguage": "tr-TR",
              "mainEntityOfPage": SITE + path, "image": SITE + "/img/portre.jpg",
              "author": {"@type": "Person", "name": NAME, "jobTitle": "Psikolog", "url": SITE + "/"},
              "publisher": {"@type": "Person", "name": NAME, "url": SITE + "/"},
              "articleSection": p["category"]}
        write(path, page("blog", blog_post(p, posts), ctx, title=p.get("seo_title") or seo_title(p["title"]), desc=seo_desc(p.get("seo_desc") or p["excerpt"]),
                         path=path, ld=[ld, crumbs_ld([("Ana sayfa", "/"), ("Blog", "/blog/"), (p["title"], path)])], og_type="article"),
              p.get("updated") or p["date"])

    nf = page("iletisim", '<div class="view page"><section class="sec"><div class="wrap" style="padding-block:120px"><div class="label">404</div><h1 style="font-size:clamp(30px,4vw,46px);margin:12px 0 16px">Bu sayfa bulunamadı.</h1><p style="margin-bottom:24px">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.</p><a class="btn primary dark" href="/">Ana sayfaya dön</a></div></section></div>\n', ctx,
              title="Sayfa bulunamadı | Psikolog Firkan", desc="Sayfa bulunamadı.", path="/404")
    nf = nf.replace('aria-current="page" ', "").replace('<link rel="canonical" href="https://psikologfirkan.com/404">\n', '<meta name="robots" content="noindex">\n')
    open(os.path.join(DIST, "404.html"), "w", encoding="utf-8").write(nf)

    today = date.today().isoformat()
    urls = written
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{d}</lastmod></url>\n" for u, d in urls) + "</urlset>\n"
    open(os.path.join(DIST, "sitemap.xml"), "w", encoding="utf-8").write(sm)
    open(os.path.join(DIST, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    open(os.path.join(DIST, "CNAME"), "w").write("psikologfirkan.com\n")
    open(os.path.join(DIST, ".nojekyll"), "w").write("")
    print(f"Derlendi: {len(posts)} yazı, {len(urls)} adres → dist/")


if __name__ == "__main__":
    main()
