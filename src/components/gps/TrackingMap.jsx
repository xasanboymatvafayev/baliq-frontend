import { Icon } from 'leaflet'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { EmptyState } from '../common/EmptyState.jsx'

Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const center = [41.311081, 69.240562]

export function TrackingMap({ drivers = [] }) {
  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-slate-200 p-5 dark:border-white/10">
        <h3 className="text-lg font-bold">Jonli GPS monitoring</h3>
        <p className="text-sm text-slate-500">Haydovchilar lokatsiyasi Leaflet xaritasida ko‘rsatiladi</p>
      </div>
      <div className="h-[520px]">
        <MapContainer center={center} zoom={11} className="h-full w-full">
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {drivers.map((driver) => (
            <Marker key={driver.id} position={[driver.lat, driver.lng]}>
              <Popup>{driver.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {!drivers.length ? (
        <div className="p-5">
          <EmptyState title="Haydovchi lokatsiyalari yo‘q" description="GPS endpoint ma’lumot qaytarganda markerlar xaritada paydo bo‘ladi." />
        </div>
      ) : null}
    </section>
  )
}
