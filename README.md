# 🕌 Jummah Finder - Bengaluru

A beautiful, mobile-first web app to find Jummah (Friday prayer) timings at masjids in Bengaluru, India.

## ✨ Features

### 🗺️ Interactive Map
- **Modern Map Interface** - Browse all masjids on a clean, responsive map
- **Smart Markers** - See next Jummah time at a glance with shift indicators
- **Marker Clustering** - Clean view even with many masjids nearby
- **Map Position Memory** - Remembers where you left off after refresh

### 📍 Location Features
- **Near Me Button** - Find masjids within 5km of your location
- **GPS Integration** - One-tap location access from map controls
- **Manual Area Selection** - Choose from 16+ Bengaluru areas if GPS unavailable
- **Distance Display** - See how far each masjid is from you

### 🔍 Search & Discovery
- **Instant Search** - Find masjids by name with live dropdown
- **Smart Sorting** - Results sorted by distance when location enabled
- **Fly-to Animation** - Smooth map transitions when selecting a masjid

### 📋 Masjid Details
- **Multiple Shift Support** - View all Jummah timings with languages
- **Facility Badges** - Ladies section, parking, members-only info
- **One-tap Directions** - Open Google Maps navigation instantly
- **Report Incorrect Timing** - Help improve data accuracy

### ☰ Hamburger Menu
- **Add a Masjid** - Submit new masjid details via email
- **Leave Feedback** - Share thoughts and suggestions
- **Share App** - Native share or copy link
- **About** - App info, mission, and contribution guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Leaflet** - Interactive maps
- **React-Leaflet** - React bindings for Leaflet
- **React-Leaflet-Cluster** - Marker clustering
- **Tailwind CSS v4** - Styling

## 📁 Project Structure

```
src/
├── components/
│   ├── JummahMap.jsx        # Main map with markers & controls
│   └── MarkerComponents.jsx # Custom marker icons
├── data/
│   ├── masjids.json         # Masjid data (times, facilities, coordinates)
│   └── config.json          # App configuration & constants
├── utils/
│   └── location.js          # Geolocation & distance utilities
├── App.jsx                  # Main app with search, modals, menu
├── index.css                # Global styles and animations
└── main.jsx                 # App entry point
```

## 📊 Data Format

Each masjid in `masjids.json`:

```json
{
  "id": 1,
  "name": "Masjid Name",
  "lat": 12.9259,
  "lng": 77.6766,
  "shifts": [
    { "time": "12:30 PM", "lang": "Urdu" },
    { "time": "1:30 PM", "lang": "English" }
  ],
  "facilities": {
    "ladies": true,
    "parking": true,
    "outsidersAllowed": true
  }
}
```

## ⚙️ Configuration

App settings in `config.json`:

```json
{
  "app": { "name": "Jummah Finder", "email": "jumahfinder@gmail.com" },
  "map": { "defaultCenter": [12.9259, 77.6766], "nearbyRadius": 5 },
  "areas": [{ "name": "Koramangala", "lat": 12.9352, "lng": 77.6245 }]
}
```

## 🤝 Contributing

Found incorrect timing? Use the **Report** button in the app, or:
1. Fork this repo
2. Update `src/data/masjids.json`
3. Submit a pull request

## 📬 Contact

Report issues or suggestions: **jumahfinder@gmail.com**

## 📄 License

MIT License - feel free to use and modify!

---

Made with ❤️ for the Muslim community in Bengaluru
