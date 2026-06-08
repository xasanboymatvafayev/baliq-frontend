import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Navigation } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import { FileUpload } from '../../components/forms/FileUpload.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { httpClient } from '../../services/api/index.js'

const schema = z.object({
  firstName: z.string().min(2, 'Ism kiriting'),
  lastName: z.string().min(2, 'Familiya kiriting'),
  phone: z.string().min(9, 'Telefon kiriting'),
  password: z.string().min(6, 'Parol kiriting'),
  farmName: z.string().min(2, 'Ferma nomi kiriting'),
  region: z.string().min(2, 'Viloyat kiriting'),
  district: z.string().min(2, 'Tuman kiriting'),
  stir: z.string().min(9, 'STIR kiriting'),
})

// Leaflet xarita komponenti — faqat GPS koordinata tanlash uchun
function LocationPicker({ value, onChange }) {
  const mapRef = useRef(null)
  const leafletMapRef = useRef(null)
  const markerRef = useRef(null)
  const [coords, setCoords] = useState(value ? parseCoords(value) : { lat: 41.2995, lng: 69.2401 })

  function parseCoords(str) {
    const parts = str.split(',').map((s) => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] }
    }
    return { lat: 41.2995, lng: 69.2401 }
  }

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    // Leaflet CDN dan yuklaymiz
    const linkEl = document.createElement('link')
    linkEl.rel = 'stylesheet'
    linkEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(linkEl)

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => {
      const L = window.L
      const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      const icon = L.divIcon({
        html: `<div style="background:#0ea5e9;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: '',
      })

      const marker = L.marker([coords.lat, coords.lng], { icon, draggable: true }).addTo(map)
      markerRef.current = marker

      const updateCoords = (lat, lng) => {
        const rounded = { lat: Math.round(lat * 1000000) / 1000000, lng: Math.round(lng * 1000000) / 1000000 }
        setCoords(rounded)
        onChange(`${rounded.lat}, ${rounded.lng}`)
      }

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        updateCoords(lat, lng)
      })

      map.on('click', (e) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng])
        updateCoords(e.latlng.lat, e.latlng.lng)
      })

      leafletMapRef.current = map
    }
    document.head.appendChild(script)

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([lat, lng], 15)
        markerRef.current.setLatLng([lat, lng])
      }
      const rounded = { lat: Math.round(lat * 1000000) / 1000000, lng: Math.round(lng * 1000000) / 1000000 }
      setCoords(rounded)
      onChange(`${rounded.lat}, ${rounded.lng}`)
    })
  }

  return (
    <div className="md:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-ocean-600" />
          Ferma joylashuvi (xaritada belgilang)
        </span>
        <button
          type="button"
          onClick={useMyLocation}
          className="flex items-center gap-1.5 rounded-xl bg-ocean-50 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-100 dark:bg-ocean-900/30 dark:text-ocean-300"
        >
          <Navigation className="h-3 w-3" />
          Mening joylashuvim
        </button>
      </div>
      <div
        ref={mapRef}
        className="h-64 w-full rounded-2xl border border-slate-200 dark:border-white/10"
        style={{ zIndex: 0 }}
      />
      <p className="mt-2 text-xs text-slate-500">
        Xaritaga bosing yoki markerni torting •{' '}
        <span className="font-mono font-semibold text-ocean-600">
          {coords.lat}, {coords.lng}
        </span>
      </p>
    </div>
  )
}

export function FarmRegistration() {
  const pushToast = useToastStore((state) => state.pushToast)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [gpsLocation, setGpsLocation] = useState('41.2995, 69.2401')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // 1. Avval ro'yxatdan o'tamiz
      const regResult = await httpClient.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
      })
      // 2. OTP tasdiqlanganidan keyin login qilamiz — bu yerda OTP sahifasiga yo'naltiramiz
      // Lekin avval ferma so'rovi yuboramiz (login kerak bo'ladi)
      // User_id saqlaymiz
      const userId = regResult.user_id

      pushToast({
        title: "Ro'yxatdan o'tdingiz!",
        description: 'Telefon raqamingizni tasdiqlang, keyin ferma so\'rovi avtomatik yuboriladi.',
        variant: 'success',
      })
      // Farm ma'lumotlarini localStorage ga saqlaymiz OTP tasdiqlanganidan keyin yuborish uchun
      localStorage.setItem('pending-farm-registration', JSON.stringify({
        farmName: data.farmName,
        region: data.region,
        district: data.district,
        gpsLocation,
        stir: data.stir,
      }))
      navigate('/otp-verification', { state: { phone: data.phone, userId, redirect: '/farm/dashboard', pendingFarm: true } })
    } catch (err) {
      // Agar foydalanuvchi allaqachon mavjud bo'lsa — OTP tasdiqlanganligini tekshiramiz
      if (err.message?.includes('allaqachon')) {
        // Foydalanuvchi oldin ro'yxatdan o'tgan — login qilib ko'ramiz
        try {
          const loginResult = await httpClient.post('/auth/login', { phone: data.phone, password: data.password })
          setSession({ user: loginResult.user, role: loginResult.role, token: loginResult.token })
          // Login muvaffaqiyatli — OTP tasdiqlanganligini anglatadi, ferma so'rovini yuboramiz
          await httpClient.post('/farms', {
            farmName: data.farmName,
            region: data.region,
            district: data.district,
            gpsLocation,
            stir: data.stir,
          })
          pushToast({
            title: "Ferma so'rovi yuborildi!",
            description: "Admin tasdiqlashini kuting. Telegram bot orqali xabar olasiz.",
            variant: 'success',
          })
          navigate('/farm/dashboard')
        } catch (loginErr) {
          // Login xatosi — OTP tasdiqlanmagan bo'lishi mumkin
          if (loginErr.message?.includes('tasdiqlanmagan')) {
            pushToast({ title: 'Avval OTP orqali telefon raqamingizni tasdiqlang', variant: 'warning' })
            navigate('/otp-verification', { state: { phone: data.phone, pendingFarm: true } })
          } else {
            pushToast({ title: loginErr.message, variant: 'error' })
          }
        }
      } else {
        pushToast({ title: err.message, variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">PENDING · APPROVED · REJECTED</p>
            <h1 className="mt-2 text-4xl font-black">Ferma registratsiyasi</h1>
            <p className="mt-1 text-slate-500 text-sm">Ro'yxatdan o'ting va ferma so'rovini yuboring. Admin tasdiqlashini kuting.</p>
          </div>
          <Link className="secondary-button" to="/login">Kirishga qaytish</Link>
        </div>
        <form className="glass-card grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <h3 className="font-bold text-ocean-600 mb-3">👤 Shaxsiy ma'lumotlar</h3>
          </div>
          <FormInput label="Ism" {...register('firstName')} error={formState.errors.firstName?.message} />
          <FormInput label="Familiya" {...register('lastName')} error={formState.errors.lastName?.message} />
          <FormInput label="Telefon" placeholder="+998901234567" {...register('phone')} error={formState.errors.phone?.message} />
          <FormInput label="Parol" type="password" {...register('password')} error={formState.errors.password?.message} />
          <div className="md:col-span-2 border-t border-slate-200 dark:border-white/10 pt-4">
            <h3 className="font-bold text-ocean-600 mb-3">🏡 Ferma ma'lumotlari</h3>
          </div>
          <FormInput label="Ferma nomi" {...register('farmName')} error={formState.errors.farmName?.message} />
          <FormInput label="STIR (INN)" placeholder="123456789" {...register('stir')} error={formState.errors.stir?.message} />
          <FormInput label="Viloyat" placeholder="Toshkent" {...register('region')} error={formState.errors.region?.message} />
          <FormInput label="Tuman" placeholder="Yunusobod" {...register('district')} error={formState.errors.district?.message} />
          <LocationPicker value={gpsLocation} onChange={setGpsLocation} />
          <FileUpload label="Ferma rasmi (ixtiyoriy)" name="farmImage" register={register} />
          <div className="flex items-end">
            <button className="primary-button w-full" type="submit" disabled={loading}>
              {loading ? 'Yuborilmoqda...' : "So'rov yuborish"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
