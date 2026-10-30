# psikologfirkan.com

Psikolog Muhammed Furkan Tosun'un kişisel web sitesi.

- `src/template.html`: Tüm sayfaların tasarımı ve içeriği (tek kaynak).
- `src/posts.json`: Blog yazıları. Yeni yazı eklemek için bu dosyaya ekleme yapıp `main` dalına göndermek yeterli.
- `src/img/`: Görseller. Çocukların yer aldığı fotoğrafların yalnızca yüzleri bulanıklaştırılmış hâlleri bulunur.
- `build.py`: `dist/` klasörüne her sayfa için ayrı HTML, blog yazıları, `sitemap.xml`, `robots.txt` ve `CNAME` üretir.

`main` dalına her gönderimde GitHub Actions siteyi derleyip GitHub Pages'te yayınlar.

Yerelde denemek için: `python3 build.py && python3 -m http.server -d dist 8000`
