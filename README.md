# Kenuts

## 🚀 Ne lan bu Kenuts?

Kenuts, kendi protokolümüz KENUTS’u destekleyen bi browser. Modern tarayıcılar gibi popüler değil, ama **tam bizim kafamızda**: hafif, hızlı, delirmiş gibi çalışıyor.

- TCP tabanlı, kendi kafasından gelen KENUTS protokolünü direk destekler.
- Sekmeli, klavye kısayollarıyla uçan browser.
- Electron’la yapılmış ama amiyane tabirle ‘gıcır gıcır’.
- UI bayağı modern, ama kafanı yorma, kodu açar açmaz anlarsın.

## 🎮 Özellikler

- Sekmeler: Ctrl+T yeni sekme aç, Ctrl+W kapat  
- Git gel butonları yerine mouse 4,5 tuşları ile ileri geri  
- Enter’e basınca adres çubuğundaki KENUTS linkine atlar  
- Ctrl+K ile açılan arama ekranı, animasyonlu, ekran kararır  
- Kendi TCP protokolümüzü direk işleyen IPC, socket ve net kullanımı  
- Tam ekran başlatma, tam kafa rahatlığı  
- Hem kodu hem kullanıcı deneyimi deligöt seviyesinde!

## BUG
- Eğer kısayollar çalışmıyorsa sekme tuşuna tıklayın.

## 🛠️ Nasıl Kurulur?

repoyu klonla, içeri gir:

```bash
git clone https://github.com/SansRough/kenuts-browser.git
cd kenuts-browser/browser
```

electron bağımlılıklarını kur:

```bash
npm install
```

electron tarayıcıyı çalıştır:

```bash
npm start
```

başka bir terminal aç, ana dizindeki server'ı çalıştır:

```bash
go run ../server.go
```

şimdi browser'a `kenuts://127.0.0.1:6969` adresini yaz, serverdan içerik gelecek.
