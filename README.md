# Karma Case

Karma Case, React Native ve Expo kullanılarak geliştirilmiş bir mobil uygulamadır. Uygulama, kullanıcıların konum tabanlı içerik paylaşımı yapmasına olanak sağlar.

## 🚀 Özellikler

- 📱 React Native ve Expo tabanlı cross-platform uygulama
- 🗺️ Konum tabanlı harita görünümü
- 📸 Görsel paylaşım ve yönetimi
- 👥 Kullanıcı profili ve arkadaş sistemi
- 🔐 Kimlik doğrulama sistemi
- 📍 Gerçek zamanlı konum servisleri

## 📋 Gereksinimler

### Sistem Gereksinimleri
- Node.js (v18 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS geliştirme için: Xcode (macOS)
- Android geliştirme için: Android Studio

### Mobil Geliştirme Ortamı
- **iOS**: Xcode 14+ ve iOS Simulator
- **Android**: Android Studio ve Android Emulator
- **Fiziksel Cihaz**: Expo Go uygulaması

## 🛠️ Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/emircancapkan/karma-case.git
cd karma-case
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables Ayarlayın
Proje kök dizininde `.env` dosyası oluşturun:
```bash
# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com
```

**Önemli**: `.env` dosyası `.gitignore`'da olduğu için Git'e commit edilmez. Bu sayede API anahtarlarınız güvende kalır.

### 4. Expo CLI'yi Global Olarak Yükleyin (Eğer yüklü değilse)
```bash
npm install -g @expo/cli
```

## 🚀 Çalıştırma

### Geliştirme Sunucusunu Başlatın
```bash
npm start
# veya
expo start
```

### Platform Spesifik Çalıştırma

#### iOS Simulator'da Çalıştırma
```bash
npm run ios
# veya
expo run:ios
```

#### Android Emulator'da Çalıştırma
```bash
npm run android
# veya
expo run:android
```

#### Web'de Çalıştırma
```bash
npm run web
# veya
expo start --web
```

## 🔧 Konfigürasyon

### Google Maps API Key (Android için gerekli)

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. "APIs & Services" > "Credentials" bölümüne gidin
4. "CREATE CREDENTIALS" > "API key" seçin
5. Oluşturulan API key'i kopyalayın
6. `app.json` dosyasındaki `android.config.googleMaps.apiKey` alanına yapıştırın:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

### Ortam Değişkenleri

Uygulama için gerekli ortam değişkenlerini ayarlayın:

```bash
# .env dosyası oluşturun
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## 📱 Cihazda Test Etme

### Expo Go ile Test
1. App Store'dan veya Google Play'den "Expo Go" uygulamasını indirin
2. Geliştirme sunucusunu başlatın (`npm start`)
3. QR kodu Expo Go uygulaması ile tarayın

### Development Build ile Test
```bash
# iOS için
expo run:ios

# Android için
expo run:android
```

## 🏗️ Proje Yapısı

```
src/
├── api/                 # API client ve endpoint'ler
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── common/         # Genel bileşenler
│   ├── custom/         # Özel bileşenler
│   └── layout/         # Layout bileşenleri
├── config/             # Konfigürasyon dosyaları
├── hooks/              # Custom React hooks
├── navigation/         # Navigasyon yapılandırması
├── screens/            # Ekran bileşenleri
├── store/              # Zustand state management
├── theme/              # Tema ve stil tanımları
├── types/              # TypeScript tip tanımları
└── utils/              # Yardımcı fonksiyonlar
```

## 🛠️ Geliştirme

### Linting
```bash
npm run lint
```

### TypeScript Kontrolü
```bash
npx tsc --noEmit
```

### Projeyi Sıfırlama
```bash
npm run reset-project
```

## 📦 Kullanılan Teknolojiler

- **React Native** 0.81.4
- **Expo** ~54.0.13
- **TypeScript** ~5.9.2
- **React Navigation** v7
- **Zustand** (State Management)
- **Formik & Yup** (Form Management)
- **Axios** (HTTP Client)
- **React Native Maps** (Harita)
- **Expo Location** (Konum Servisleri)
- **Expo Image Picker** (Görsel Seçimi)

## 🐛 Sorun Giderme

### Harita Görünmüyorsa
1. Google Maps API key'in doğru girildiğinden emin olun
2. Konum izinlerinin verildiğinden emin olun
3. Internet bağlantısını kontrol edin

### Bağımlılık Sorunları
```bash
# node_modules'ı temizleyin ve yeniden yükleyin
rm -rf node_modules
npm install

# Expo cache'i temizleyin
expo r -c
```

### iOS Build Sorunları
```bash
cd ios
pod install
cd ..
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya iletişime geçebilirsiniz.