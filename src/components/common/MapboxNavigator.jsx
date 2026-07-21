import { useEffect, useRef, useState, useCallback } from 'react'
import { Navigation, X, Volume2, VolumeX, Loader2, CheckCircle2, Plus, Minus, Maximize2 } from 'lucide-react'
import { useT } from '../../store/i18nStore.js'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

// ─── Masofa (km) ─────────────────────────────────────────────────
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ─── Ovozli yo'riqnoma ────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ru-RU'; u.rate = 0.95; u.volume = 1
  window.speechSynthesis.speak(u)
}

function fmtDist(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`
}
function fmtTime(s) {
  const m = Math.round(s/60)
  return m < 60 ? `${m} daq` : `${Math.floor(m/60)}h ${m%60}daq`
}
function translate(t = '') {
  return t
    .replace(/Turn left/gi, 'Chapga buriling')
    .replace(/Turn right/gi, "O'ngga buriling")
    .replace(/Turn slight left/gi, 'Biroz chapga')
    .replace(/Turn slight right/gi, "Biroz o'ngga")
    .replace(/Turn sharp left/gi, 'Keskin chapga')
    .replace(/Turn sharp right/gi, "Keskin o'ngga")
    .replace(/Continue straight/gi, "To'g'ri boring")
    .replace(/Keep left/gi, 'Chapda qoling')
    .replace(/Keep right/gi, "O'ngda qoling")
    .replace(/Arrive at/gi, 'Manzilga yetdingiz')
    .replace(/You have arrived/gi, 'Manzilga yetib keldingiz!')
    .replace(/Head (north|south|east|west)/gi, "Yo'lni boshlang")
    .replace(/Roundabout/gi, 'Aylanma')
    .replace(/on the right/gi, "o'ng tomonda")
    .replace(/on the left/gi, 'chap tomonda')
}

async function fetchRoute(fLat, fLng, tLat, tLng) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fLng},${fLat};${tLng},${tLat}?steps=true&geometries=geojson&language=en&access_token=${MAPBOX_TOKEN}`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.routes?.length) throw new Error("Yo'l topilmadi")
  return data.routes[0]
}

async function geocodeAddress(address) {
  if (!address || !MAPBOX_TOKEN) return null
  const encoded = encodeURIComponent(address)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=uz`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}

export function MapboxNavigator({ toLat: toLatProp, toLng: toLngProp, toAddress, isFarm = false, onClose, onArrivalConfirm }) {
  const t = useT()
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)
  const markerRef    = useRef(null)
  const watchRef     = useRef(null)
  const lastSentRef  = useRef(0)
  const [loading, setLoading]           = useState(true)
  const loadedRef = useRef(false)
  const [error, setError]               = useState('')
  const [gpsWarning, setGpsWarning]     = useState('')
  const [route, setRoute]               = useState(null)
  const [currentStep, setCurrentStep]   = useState(0)
  const [myPos, setMyPos]               = useState(null)
  const [soundOn, setSoundOn]           = useState(true)
  const [arrived, setArrived]           = useState(false)
  const [nearFarm, setNearFarm]         = useState(false)
  const [confirmed, setConfirmed]       = useState(false)
  const [distToTarget, setDistToTarget] = useState(null)
  const [resolvedCoords, setResolvedCoords] = useState(
    toLatProp && toLngProp ? { lat: toLatProp, lng: toLngProp } : null
  )
  const soundRef = useRef(true)
  useEffect(() => { soundRef.current = soundOn }, [soundOn])

  const toLat = resolvedCoords?.lat ?? toLatProp
  const toLng = resolvedCoords?.lng ?? toLngProp

  useEffect(() => {
    let destroyed = false

    const init = async () => {
      try {
        if (!MAPBOX_TOKEN) {
          setError("Xarita sozlanmagan (VITE_MAPBOX_TOKEN yo'q)")
          setLoading(false)
          return
        }

        // Agar koordinatalar yo'q bo'lsa, manzildan geocoding qilamiz
        if (!toLat || !toLng) {
          if (toAddress) {
            const geocoded = await geocodeAddress(toAddress)
            if (!destroyed && geocoded) {
              setResolvedCoords(geocoded)
              return  // useEffect qayta ishlaydi resolvedCoords o'zgarganda
            } else if (!destroyed) {
              setError(`"${toAddress}" ${t.navAddressNotFound}`)
              setLoading(false)
              return
            }
          } else {
            setError(t.navNoAddress)
            setLoading(false)
            return
          }
        }

        // CSS ni <link> orqali yuklaymiz
        if (!document.getElementById('mapbox-gl-css')) {
          const link = document.createElement('link')
          link.id = 'mapbox-gl-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/dist/mapbox-gl.css'
          document.head.appendChild(link)
        }

        // mapbox-gl UMD bundle - <script> tegi orqali yuklaymiz (dynamic import ESM emasligi sabab ishlamaydi)
        const mapboxgl = await new Promise((resolve, reject) => {
          if (window.mapboxgl) {
            resolve(window.mapboxgl)
            return
          }
          const existing = document.getElementById('mapbox-gl-script')
          if (existing) {
            existing.addEventListener('load', () => resolve(window.mapboxgl))
            existing.addEventListener('error', () => reject(new Error(t.navMapScriptError)))
            return
          }
          const script = document.createElement('script')
          script.id = 'mapbox-gl-script'
          script.src = 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/dist/mapbox-gl.js'
          script.async = true
          script.onload = () => {
            if (window.mapboxgl) resolve(window.mapboxgl)
            else reject(new Error(t.navMapGlobalError))
          }
          script.onerror = () => reject(new Error("Mapbox skripti yuklanmadi - internetni tekshiring"))
          document.head.appendChild(script)
        })

        if (destroyed || !mapContainer.current) return
        if (!mapboxgl || typeof mapboxgl.Map !== 'function') {
          throw new Error(t.navMapInvalidLoad)
        }

        mapboxgl.accessToken = MAPBOX_TOKEN

        // Hozirgi joylashuv — 3 bosqichli fallback
        // 1) Aniq GPS (8s) → 2) Network GPS (8s) → 3) GPS'siz faqat manzilni ko'rsat
        const getPosition = () => new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 })
        )
        const getPositionLow = () => new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 })
        )

        let lat = null, lng = null
        let noGps = false
        try {
          const pos = await getPosition().catch(async (err) => {
            if (err?.code === 1) throw err  // Ruxsat yo'q — fallback ham ishlamaydi
            return getPositionLow()          // Timeout/signal → network GPS ga o'tish
          })
          lat = pos.coords.latitude
          lng = pos.coords.longitude
          setMyPos({ lat, lng })
        } catch (err) {
          if (err?.code === 1) {
            // Foydalanuvchi GPS ruxsatini rad etgan — xarita ochiladi, lekin route yo'q
            noGps = true
          } else {
            // Ikki urinish ham muvaffaqiyatsiz — GPS'siz davom etamiz
            noGps = true
          }
        }
        if (destroyed) return

        // Yo'l (faqat GPS mavjud bo'lsa)
        let routeData = null
        if (!noGps && lat !== null) {
          try {
            routeData = await fetchRoute(lat, lng, toLat, toLng)
            if (!destroyed) setRoute(routeData)
          } catch (_) {
            // Yo'l topilmasa ham xarita ochiladi
          }
        }
        if (destroyed) return

        // Xarita — to'liq ekran, sidebar YO'Q
        const mapCenter = (!noGps && lat !== null) ? [lng, lat] : [toLng, toLat]
        const mapZoom   = (!noGps && lat !== null) ? 15 : 13
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: mapCenter,
          zoom: mapZoom,
          pitch: 45,
          attributionControl: false,
          logoPosition: 'bottom-right',
        })
        mapRef.current = map

        // Agar style/load 10 soniyada kelmasa - xato ko'rsatamiz
        const loadTimeout = setTimeout(() => {
          if (!destroyed && !loadedRef.current) {
            setError(t.navMapError)
            setLoading(false)
          }
        }, 10000)

        map.on('load', () => {
          clearTimeout(loadTimeout)
          loadedRef.current = true
          if (destroyed) return
          try {

          // Yo'l (GPS mavjud bo'lsa)
          if (routeData) {
            map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: routeData.geometry } })
            map.addLayer({ id: 'route-bg', type: 'line', source: 'route', paint: { 'line-color': '#1e3a5f', 'line-width': 10, 'line-opacity': 0.6 } })
            map.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#7c3aed', 'line-width': 6 } })
          }

          // Driver markeri (faqat GPS bor bo'lsa)
          if (!noGps && lat !== null) {
            const el = document.createElement('div')
            el.innerHTML = `<div style="font-size:28px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">🚚</div>`
            markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
          }

          // Manzil markeri — har doim ko'rsatiladi
          const destEl = document.createElement('div')
          destEl.innerHTML = `<div style="font-size:32px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">${isFarm ? '🏡' : '📍'}</div>`
          new mapboxgl.Marker({ element: destEl }).setLngLat([toLng, toLat]).addTo(map)

          setLoading(false)

          if (noGps) {
            // GPS yo'q — xarita ochiq, faqat banner ko'rsatiladi
            setGpsWarning(t.navGpsWarning)
          } else if (routeData) {
            const firstStep = translate(routeData.legs[0]?.steps[0]?.maneuver?.instruction || '')
            if (firstStep && soundRef.current) speak(firstStep)
          }
          } catch (e) {
            setError(t.navMapLoadError)
          }
        })

        map.on('error', () => {
          if (!loadedRef.current) {
            clearTimeout(loadTimeout)
            if (!destroyed) {
              setError(t.navMapGeneralError)
              setLoading(false)
            }
          }
        })

        // GPS kuzatish
        watchRef.current = navigator.geolocation.watchPosition(
          (p) => {
            if (destroyed) return
            const { latitude: la, longitude: lo } = p.coords
            setMyPos({ lat: la, lng: lo })
            markerRef.current?.setLngLat([lo, la])
            map.easeTo({ center: [lo, la], duration: 800 })

            // Backend ga joylashuvni yuborish (har 3 soniyada)
            const now = Date.now()
            if (now - lastSentRef.current > 3000) {
              lastSentRef.current = now
              const token = (() => {
              try {
                const raw = localStorage.getItem('baliq-auth-session') || sessionStorage.getItem('baliq-auth-session')
                return raw ? JSON.parse(raw)?.token : null
              } catch { return null }
            })()
              if (token) {
                fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/drivers/location`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ lat: la, lng: lo }),
                }).catch(() => {})
              }
            }

            // Manzilga masofa
            const d = distKm(la, lo, toLat, toLng) * 1000
            setDistToTarget(Math.round(d))

            // Fermaga 100m
            if (isFarm && d <= 100 && !nearFarm && !confirmed) {
              setNearFarm(true)
              if (soundRef.current) speak(t.navFarmArrivalSpeak)
            }

            // Manzilga 50m — yetib keldi
            if (d <= 50 && !arrived) {
              setArrived(true)
              if (soundRef.current) speak(t.navArrivedSpeak)
            }

            // Qadam yangilash
            setCurrentStep((prev) => {
              const steps = routeData.legs[0]?.steps || []
              if (prev >= steps.length - 1) return prev
              const end = steps[prev].geometry?.coordinates?.slice(-1)[0]
              if (!end) return prev
              const sd = distKm(la, lo, end[1], end[0]) * 1000
              if (sd < 30) {
                const next = prev + 1
                const txt = translate(steps[next]?.maneuver?.instruction || '')
                if (txt && soundRef.current) speak(txt)
                return next
              }
              return prev
            })
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 3000 }
        )
      } catch (e) {
        if (!destroyed) { setError(e.message || 'Xato'); setLoading(false) }
      }
    }

    init()
    return () => {
      destroyed = true
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      window.speechSynthesis?.cancel()
    }
  }, [toLat, toLng, isFarm, resolvedCoords])

  const handleZoom = (direction) => {
    const map = mapRef.current
    if (!map) return
    direction === 'in' ? map.zoomIn() : map.zoomOut()
  }

  const handleFarmArrival = () => {
    setConfirmed(true)
    setNearFarm(false)
    onArrivalConfirm?.()
  }

  const steps  = route?.legs[0]?.steps || []
  const step   = steps[currentStep]
  const instr  = translate(step?.maneuver?.instruction || '')

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Xarita — to'liq ekran */}
      <div ref={mapContainer} style={{ flex: 1, width: '100%' }} />

      {/* ── Yuqori panel ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: arrived ? 'rgba(20,83,45,0.97)' : nearFarm ? 'rgba(146,64,14,0.97)' : 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(12px)',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: arrived ? '#16a34a' : nearFarm ? '#d97706' : '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            {arrived ? '✅' : nearFarm ? '🏡' : '🗺️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading
              ? <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>{t.navCalculating}</p>
              : error
              ? <p style={{ color: '#f87171', margin: 0, fontSize: 14 }}>⚠️ {error}</p>
              : gpsWarning
              ? <p style={{ color: '#fbbf24', margin: 0, fontSize: 13, fontWeight: 700 }}>{gpsWarning}</p>
              : arrived
              ? <p style={{ color: '#86efac', fontWeight: 900, margin: 0, fontSize: 16 }}>{t.navArrived}</p>
              : nearFarm
              ? <p style={{ color: '#fcd34d', fontWeight: 900, margin: 0, fontSize: 15 }}>{t.navNearFarm}</p>
              : <p style={{ color: 'white', fontWeight: 800, margin: 0, fontSize: 15, lineHeight: 1.3 }}>
                  {instr || t.navStart}
                </p>
            }
            {route && !loading && !arrived && !nearFarm && (
              <p style={{ color: '#a78bfa', fontSize: 11, margin: '2px 0 0', fontWeight: 600 }}>
                {distToTarget != null ? fmtDist(distToTarget) + ' qoldi' : ''} · {toAddress?.slice(0, 35)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => setSoundOn(v => !v)} style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: soundOn ? '#4c1d95' : '#334155',
              color: soundOn ? '#c4b5fd' : '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: '#334155', color: '#94a3b8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Masofa/vaqt */}
        {route && !loading && (
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[
              {label: t.navDistance, value: fmtDist(route.distance) },
              { label: t.navTime,   value: fmtTime(route.duration) },
              { label: t.navStep,  value: `${currentStep+1}/${steps.length}` },
              ...(distToTarget != null ? [{ label: t.navRemaining, value: fmtDist(distToTarget) }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 8,
                padding: '4px 10px', textAlign: 'center',
              }}>
                <p style={{ color: '#a78bfa', fontSize: 9, margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 900, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FERMAGA KELDIM tugmasi (100m da) ── */}
      {nearFarm && !confirmed && (
        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, width: 'calc(100% - 32px)', maxWidth: 400,
        }}>
          <button
            onClick={handleFarmArrival}
            style={{
              width: '100%', padding: '16px 24px',
              borderRadius: 20, border: 'none',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: 'white', fontWeight: 900, fontSize: 18,
              cursor: 'pointer', boxShadow: '0 8px 32px rgba(217,119,6,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              animation: 'pulse 1.5s infinite',
            }}
          >
            {t.navFarmArrival}
          </button>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
            {t.navFarmArrivalHint}
          </p>
        </div>
      )}

      {/* ── Zoom tugmalari (chap pastda) ── */}
      {!loading && (
        <div style={{
          position: 'absolute', right: 16, bottom: 120, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <button onClick={() => handleZoom('in')} style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: 'rgba(30,41,59,0.92)', color: 'white',
            cursor: 'pointer', fontSize: 20, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <Plus size={20} />
          </button>
          <button onClick={() => handleZoom('out')} style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: 'rgba(30,41,59,0.92)', color: 'white',
            cursor: 'pointer', fontSize: 20, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <Minus size={20} />
          </button>
          <button onClick={() => {
            const map = mapRef.current
            if (!map || !myPos) return
            map.flyTo({ center: [myPos.lng, myPos.lat], zoom: 16, pitch: 45 })
          }} style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: 'rgba(124,58,237,0.85)', color: 'white',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          }}>
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {/* ── Keyingi qadamlar (pastki panel) ── */}
      {!loading && !error && steps.length > 0 && !nearFarm && !arrived && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {steps.slice(currentStep, currentStep + 3).map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px',
              background: i === 0 ? 'rgba(124,58,237,0.15)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{i === 0 ? '👉' : '▸'}</span>
              <span style={{ color: i === 0 ? '#e2e8f0' : '#475569', fontSize: 12, flex: 1 }}>
                {translate(s.maneuver?.instruction || '')}
              </span>
              <span style={{ color: '#334155', fontSize: 11, flexShrink: 0 }}>{fmtDist(s.distance)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {loading && !error && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
          zIndex: 20,
        }}>
          <div style={{ fontSize: 48 }}>🗺️</div>
          <Loader2 size={36} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{t.navCalculating}</p>
        </div>
      )}

      {/* Xato overlay — qayta urinish bilan */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.96)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          zIndex: 20, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ color: '#fca5a5', fontSize: 15, fontWeight: 700, maxWidth: 320 }}>{error}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                setError('')
                setLoading(true)
                loadedRef.current = false
                // toLat/toLng o'zgarmagani uchun useEffect qayta ishga tushishi uchun key trick kerak emas —
                // shunchaki sahifani yopib qayta ochish eng ishonchli yo'l
                onClose?.()
              }}
              style={{
                padding: '12px 24px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              }}
            >
              {t.navCloseRetry}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.8;transform:translateX(-50%) scale(1.02)} }
      `}</style>
    </div>
  )
}
