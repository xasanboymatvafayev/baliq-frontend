import { useEffect, useRef, useState } from 'react'
import { X, Volume2, VolumeX, Loader2 } from 'lucide-react'

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF0dmFmYWV2diIsImEiOiJjbXFjYWZ2dHMwanVqMnNzOWJza3hyeXRpIn0.yHH0ptxDfhCOdKIXhSrm5w'

// ─── Ovozli yo'riqnoma ───────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'ru-RU'
  utt.rate = 0.95
  utt.volume = 1
  window.speechSynthesis.speak(utt)
}

// ─── Masofa hisoblash (Haversine formulasi) ─────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Masofa formatlash ───────────────────────────────────────────
function fmtDist(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function fmtTime(seconds) {
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} daq`
  return `${Math.floor(m / 60)}h ${m % 60}daq`
}

// ─── Yo'riqnoma matnini o'zbekchaga o'girish ────────────────────
function translateInstruction(text) {
  if (!text) return ''
  return text
    .replace(/Turn left/gi, 'Chapga buriling')
    .replace(/Turn right/gi, "O'ngga buriling")
    .replace(/Turn slight left/gi, 'Biroz chapga')
    .replace(/Turn slight right/gi, "Biroz o'ngga")
    .replace(/Turn sharp left/gi, 'Keskin chapga')
    .replace(/Turn sharp right/gi, "Keskin o'ngga")
    .replace(/Continue straight/gi, "To'g'ri boring")
    .replace(/Keep left/gi, 'Chapda qoling')
    .replace(/Keep right/gi, "O'ngda qoling")
    .replace(/Arrive at/gi, 'Manzilga yetib keldingiz')
    .replace(/You have arrived/gi, 'Manzilga yetib keldingiz!')
    .replace(/Head (north|south|east|west)/gi, "Yo'lni boshlang")
    .replace(/Roundabout/gi, 'Aylanma')
    .replace(/on the right/gi, "o'ng tomonda")
    .replace(/on the left/gi, 'chap tomonda')
}

// ─── Mapbox dan yo'l olish ───────────────────────────────────────
async function fetchRoute(fromLat, fromLng, toLat, toLng) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?steps=true&geometries=geojson&language=en&access_token=${MAPBOX_TOKEN}`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.routes?.length) throw new Error("Yo'l topilmadi")
  return data.routes[0]
}

// ─── Asosiy komponent ────────────────────────────────────────────
export function MapboxNavigator({ toLat, toLng, toAddress, onClose }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const watchRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [route, setRoute] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [myPos, setMyPos] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const [arrived, setArrived] = useState(false)

  // ─── Mapbox GL JS yuklash ───────────────────────────────────
  useEffect(() => {
    let destroyed = false
    let map = null
    let watchId = null

    const init = async () => {
      try {
        if (!document.getElementById('mapbox-gl-css')) {
          const link = document.createElement('link')
          link.id = 'mapbox-gl-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/dist/mapbox-gl.css'
          document.head.appendChild(link)
        }

        const mapboxgl = (await import('https://esm.sh/mapbox-gl@2.15.0')).default

        if (destroyed || !mapContainer.current) return
        mapboxgl.accessToken = MAPBOX_TOKEN

        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { 
            enableHighAccuracy: true,   // ✅ Aniq GPS lokatsiya
            timeout: 15000,              // 15 soniya
            maximumAge: 0                // ✅ Har doim YANGI lokatsiya, kesh yo'q!
          })
        )
        if (destroyed) return

        const { latitude: lat, longitude: lng } = pos.coords
        setMyPos({ lat, lng })

        const routeData = await fetchRoute(lat, lng, toLat, toLng)
        if (destroyed) return
        setRoute(routeData)

        map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/navigation-night-v1',
          center: [lng, lat],
          zoom: 15,
          pitch: 45,
        })
        mapRef.current = map

        const onLoad = () => {
          if (destroyed) return

          map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', geometry: routeData.geometry },
          })
          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: { 'line-color': '#7c3aed', 'line-width': 6, 'line-opacity': 0.9 },
          })

          const el = document.createElement('div')
          el.innerHTML = '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚚</div>'
          markerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map)

          new mapboxgl.Marker({ color: '#10b981' })
            .setLngLat([toLng, toLat])
            .setPopup(new mapboxgl.Popup().setHTML(`<b>📍 Manzil</b><br/>${toAddress || ''}`))
            .addTo(map)

          setLoading(false)

          if (soundOn && routeData.legs[0]?.steps[0]) {
            const txt = translateInstruction(routeData.legs[0].steps[0].maneuver?.instruction || '')
            if (txt) speak(txt)
          }
        }

        map.on('load', onLoad)

        watchId = navigator.geolocation.watchPosition(
          (p) => {
            if (destroyed) return
            const { latitude: la, longitude: lo } = p.coords

            markerRef.current?.setLngLat([lo, la])
            map?.easeTo({ center: [lo, la], duration: 1000 })

            const distToDest = calculateDistance(la, lo, toLat, toLng)
            if (distToDest < 50 && !arrived) {
              setArrived(true)
              if (soundOn) speak('Manzilga yetib keldingiz!')
            }

            setCurrentStep((prev) => {
              const steps = routeData.legs[0]?.steps || []
              if (prev >= steps.length - 1) return prev
              const step = steps[prev]
              const stepEnd = step.geometry?.coordinates?.slice(-1)[0]
              if (!stepEnd) return prev
              const stepDistance = calculateDistance(la, lo, stepEnd[1], stepEnd[0])
              if (stepDistance < 30) {
                const next = prev + 1
                const nextTxt = translateInstruction(steps[next]?.maneuver?.instruction || '')
                if (nextTxt && soundOn) speak(nextTxt)
                return next
              }
              return prev
            })
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 0 }  // ✅ Har doim yangi lokatsiya
        )
        watchRef.current = watchId

      } catch (e) {
        if (!destroyed) setError(e.message || 'Xato yuz berdi')
        setLoading(false)
      }
    }

    init()

    return () => {
      destroyed = true
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      window.speechSynthesis?.cancel()
    }
  }, [toLat, toLng, toAddress])

  const steps = route?.legs[0]?.steps || []
  const step = steps[currentStep]
  const instruction = translateInstruction(step?.maneuver?.instruction || '')
  const distToNext = step?.distance ? fmtDist(step.distance) : ''

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      background: '#0f172a', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: arrived ? '#14532d' : '#1e1b4b',
        padding: '12px 16px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: arrived ? '#16a34a' : '#7c3aed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              {arrived ? '✅' : '🗺️'}
            </div>
            <div style={{ minWidth: 0 }}>
              {loading ? (
                <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Yo'l hisoblanmoqda...</p>
              ) : error ? (
                <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>⚠️ {error}</p>
              ) : arrived ? (
                <p style={{ color: '#86efac', fontSize: 16, fontWeight: 800, margin: 0 }}>Manzilga yetib keldingiz! 🎉</p>
              ) : (
                <>
                  <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
                    {instruction || "Yo'lni boshlang"}
                  </p>
                  <p style={{ color: '#a78bfa', fontSize: 12, margin: '2px 0 0', fontWeight: 600 }}>
                    {distToNext && `${distToNext} •`} {toAddress?.slice(0, 40)}
                  </p>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => { setSoundOn(v => !v); window.speechSynthesis?.cancel() }}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: soundOn ? '#4c1d95' : '#334155',
                color: soundOn ? '#c4b5fd' : '#64748b',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: '#334155', color: '#94a3b8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {route && !loading && (
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
              <p style={{ color: '#a78bfa', fontSize: 10, margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Masofa</p>
              <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>{fmtDist(route.distance)}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
              <p style={{ color: '#a78bfa', fontSize: 10, margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Vaqt</p>
              <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>{fmtTime(route.duration)}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
              <p style={{ color: '#a78bfa', fontSize: 10, margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Qadam</p>
              <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>{currentStep + 1}/{steps.length}</p>
            </div>
          </div>
        )}
      </div>

      <div ref={mapContainer} style={{ flex: 1 }} />

      {loading && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <Loader2 size={40} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>GPS va yo'nalish hisoblanmoqda...</p>
        </div>
      )}

      {!loading && !error && steps.length > 0 && (
        <div style={{
          background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 120, overflowY: 'auto', flexShrink: 0,
        }}>
          {steps.slice(currentStep, currentStep + 3).map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px',
              background: i === 0 ? 'rgba(124,58,237,0.15)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>
                {i === 0 ? '👉' : '▸'}
              </span>
              <span style={{ color: i === 0 ? '#e2e8f0' : '#64748b', fontSize: 12, flex: 1 }}>
                {translateInstruction(s.maneuver?.instruction || '')}
              </span>
              <span style={{ color: '#475569', fontSize: 11, flexShrink: 0 }}>
                {fmtDist(s.distance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


