import { TrackingMap } from '../../components/gps/TrackingMap.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function GpsMonitoringPage() {
  usePageTitle('GPS Monitoring')
  return <TrackingMap />
}
