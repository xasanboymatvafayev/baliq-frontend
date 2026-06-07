import { useQuery } from '@tanstack/react-query'
import { Icon } from 'leaflet'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'

Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const CENTER = [41.311081, 69.240562]

export function GpsMonitoringPage() {
  usePageTitle('GPS Monitoring')
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['driver-locations'],
    queryFn: () => httpClient.get('/drivers/locations'),
    refetchInterval: 15000,
  })

  return (
    <section className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
        <div>
          <h3 className="text-lg font-bold">Jonli GPS monitoring</h3>
          <p className="text-sm text-slate-500">Haydovchilar lokatsiyasi · {drivers.length} ta faol</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-green-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Jonli
        </span>
      </div>
      <div className="h-[520px]">
        <MapContainer center={CENTER} zoom={11} className="h-full w-full">
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {drivers.map((driver) => (
            driver.lat && driver.lng ? (
              <Marker key={driver.id} position={[driver.lat, driver.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-slate-500">{driver.phone}</p>
                    {driver.last_seen && <p className="text-xs text-slate-400">Oxirgi: {new Date(driver.last_seen).toLocaleTimeString('uz')}</p>}
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
      {drivers.length === 0 && !isLoading && (
        <div className="p-5 text-center text-sm text-slate-500">
          Hozirda faol haydovchi yo'q
        </div>
      )}
    </section>
  )
}
