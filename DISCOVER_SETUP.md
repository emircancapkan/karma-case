# Discover Sayfası Kurulum Özeti

## Yapılan Değişiklikler

### 1. MapMarker Component'i Güncellendi
- Görseldeki tasarıma uygun stil iyileştirmeleri yapıldı
- Marker boyutları optimize edildi (170x56px)
- Avatar boyutu küçültüldü (44px)
- Shadow ve border radius değerleri ayarlandı
- `resizeMode="cover"` eklendi

**Dosya:** `src/components/custom/MapMarker.tsx`

### 2. useExplore Hook Optimize Edildi
- İlk render'da otomatik fetch kaldırıldı
- Böylece kullanıcı konumu alındıktan sonra tek bir fetch yapılıyor
- Gereksiz API çağrıları önlendi

**Dosya:** `src/hooks/useExplore.ts`

### 3. DiscoverScreen React Native Maps Kullanımına Geçti
- `expo-maps` custom marker desteği olmadığı için `react-native-maps` kullanıma alındı
- `expo-router` dependency kaldırıldı (proje react-navigation kullanıyor)
- Platform-specific map yerine universal MapView kullanıldı
- Marker'lar doğru şekilde render ediliyor

**Dosya:** `src/screens/DiscoverScreen.tsx`

### 4. react-native-maps Paketi Kuruldu
```bash
npm install react-native-maps
```

### 5. app.json Güncellendi
- Android için Google Maps API key konfigürasyonu eklendi

## Gerekli Adımlar

### Android İçin Google Maps API Key
Android'de haritaların çalışması için Google Maps API key'e ihtiyacınız var:

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. "APIs & Services" > "Credentials" bölümüne gidin
4. "CREATE CREDENTIALS" > "API key" seçin
5. Oluşturulan API key'i kopyalayın
6. `app.json` dosyasındaki `android.config.googleMaps.apiKey` alanına yapıştırın

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

### iOS İçin
iOS'ta Apple Maps kullanıldığı için ekstra bir API key gerekmez.

## Kullanım

### API Response Formatı
Explore endpoint'inden dönen JSON formatı:

```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "_id": "6529a6a6a6a6a6a6a6a6a6",
      "username": "john_doe",
      "url": "https://example.com/image.jpg",
      "latitude": 37.774929,
      "longitude": -122.419416,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Haritada Gösterilen Bilgiler
Her marker'da:
- Kullanıcı adı (@username formatında)
- Yüklenme zamanı (örn: "27 minutes ago", "17 hours ago")
- Kullanıcının yüklediği görsel (avatar olarak)

## Test

Uygulamayı çalıştırın:

```bash
# iOS
npm run ios

# Android
npm run android
```

## Özellikler

✅ Kullanıcı konumu otomatik alınıyor
✅ Explore API'ye konum ve radius (10km) gönderiliyor
✅ Haritada custom marker'lar gösteriliyor
✅ Header'da logo, credits ve settings butonu var
✅ Sol altta filter butonu var
✅ Loading state gösteriliyor

## Sorun Giderme

### Harita Görünmüyorsa
1. Google Maps API key'in doğru girildiğinden emin olun
2. Konum izinlerinin verildiğinden emin olun
3. Internet bağlantısını kontrol edin

### Marker'lar Görünmüyorsa
1. Explore API'den data döndüğünden emin olun
2. Her image objesinde `latitude` ve `longitude` olduğundan emin olun
3. Console'da hata mesajlarını kontrol edin

## Notlar

- expo-maps custom marker component'leri desteklemediği için react-native-maps kullanıldı
- Her iki paket de aynı altyapıyı (Google Maps/Apple Maps) kullandığı için çakışma olmaz
- MapMarker component'i tamamen özelleştirilmiş ve görseldeki tasarıma uygun

