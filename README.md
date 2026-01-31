# 🕌 Jummah Finder - Bengaluru

A beautiful, mobile-first web app to find Jummah (Friday prayer) timings at masjids in Bengaluru, India.

## ✨ Features

- **Interactive Map** - Browse masjids on a clean, modern map
- **Smart Markers** - See next Jummah time at a glance (shows "1st of N" for multiple shifts)
- **Detailed Popups** - View full schedule, facilities info, and get directions
- **Search** - Find masjids by name with instant dropdown results
- **Fly-to Animation** - Smooth map transitions when selecting a masjid
- **Report Feature** - Users can report incorrect timings directly to developers
- **Mobile Responsive** - Works beautifully on all devices

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
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
src/
├── components/
│   ├── JummahMap.jsx        # Main map component with markers
│   └── MarkerComponents.jsx # Custom marker icons
├── data/
│   └── masjids.json         # Masjid data (times, facilities, coordinates)
├── App.jsx                  # Main app with search, modals, and layout
├── index.css                # Global styles and Tailwind config
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
    "parking": true
  }
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
