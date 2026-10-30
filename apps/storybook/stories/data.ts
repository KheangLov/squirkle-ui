// Sample data shared by stories (same fixtures as the docs examples).
import type { ColumnDef } from '@squirkle-ui/datagrid'
import type { MapMarker } from '@squirkle-ui/map'

export const people = ['Alice Johnson', 'Bob Smith', 'Chen Wei', 'Dara Sok', 'Eva Müller', 'Farah Khan', 'Gus Lee', 'Hana Ito']
export const fruits = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon', 'Mango']
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Events around today so every calendar view has something to show. */
export function sampleEvents() {
  const at = (day: number, h: number, m = 0) => {
    const d = new Date()
    d.setDate(d.getDate() + day)
    d.setHours(h, m, 0, 0)
    return d
  }
  return [
    { id: 1, title: 'Design review', start: at(0, 10), end: at(0, 11, 30), color: 'primary' },
    { id: 2, title: 'Standup', start: at(0, 9), end: at(0, 9, 30), color: 'success' },
    { id: 3, title: 'Customer call', start: at(1, 14), end: at(1, 15), color: 'accent' },
    { id: 4, title: 'Sprint planning', start: at(2, 13), end: at(2, 15), color: 'secondary' },
    { id: 5, title: 'Offsite', start: at(5, 9), end: at(6, 17), color: 'warning' },
  ]
}

const departments = ['Design', 'Engineering', 'Sales', 'Support']
export const gridRows = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  name: `${people[i % people.length]} ${i + 1}`,
  department: departments[i % departments.length],
  salary: 40_000 + ((i * 7919) % 60_000),
  active: i % 3 !== 0,
}))
export const gridColumns: ColumnDef[] = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'name', headerName: 'Name', flex: 1, sortable: true, filter: true },
  { field: 'department', headerName: 'Department', sortable: true, filter: 'set' },
  { field: 'salary', headerName: 'Salary', type: 'number', sortable: true, aggFunc: 'avg' },
  { field: 'active', headerName: 'Active', type: 'boolean' },
]

export const places: MapMarker[] = [
  { id: 1, lat: 11.5636, lng: 104.9312, title: 'Royal Palace', popup: 'Pin with label', shape: 'pin', label: '1', color: 'primary' },
  { id: 2, lat: 11.5577, lng: 104.9271, title: 'National Museum', popup: 'Squircle with icon', shape: 'squircle', icon: 'lucide:landmark', color: 'secondary' },
  { id: 3, lat: 11.5696, lng: 104.9211, title: 'Wat Phnom', popup: 'Avatar marker', shape: 'avatar', image: 'https://i.pravatar.cc/80?img=12', color: 'accent' },
  { id: 4, lat: 11.5449, lng: 104.9212, title: 'Independence Monument', popup: 'Dot marker', shape: 'dot', color: 'success' },
]

/** Deterministic scatter around Phnom Penh for the cluster story. */
export function manyPoints(count: number): MapMarker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    lat: 11.56 + Math.sin(i * 12.9898) * 0.08,
    lng: 104.92 + Math.cos(i * 78.233) * 0.1,
    title: `Point ${i + 1}`,
  }))
}
