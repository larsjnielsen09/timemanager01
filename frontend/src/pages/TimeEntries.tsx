import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'

type Project = { id: number; name: string }

type TimeEntry = {
  id: number
  project_id: number
  work_date: string
  hours: number
  description?: string
  billable: boolean
}

export default function TimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<number | ''>('')
  const [date, setDate] = useState<string>('')
  const [hours, setHours] = useState<string>('')
  const [description, setDescription] = useState('')
  const [billable, setBillable] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate = useMemo(() => !!projectId && !!date && Number(hours) > 0, [projectId, date, hours])

  async function load() {
    try {
      const [e, p] = await Promise.all([
        api<TimeEntry[]>('/time-entries?limit=1000'),
        api<Project[]>('/projects?limit=1000&active=true'),
      ])
      setEntries(e)
      setProjects(p)
    } catch (e) { setError(String(e)) }
  }

  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = {
      project_id: Number(projectId),
      work_date: date,
      hours: Number(hours),
      description: description || undefined,
      billable,
    }
    try {
      await api<TimeEntry>('/time-entries', { method: 'POST', body: JSON.stringify(payload) })
      setProjectId(''); setDate(''); setHours(''); setDescription(''); setBillable(true)
      load()
    } catch (e) { setError(String(e)) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Time Tracking</h1>
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={create} className="bg-white border rounded-lg p-4 grid gap-3 md:grid-cols-5">
        <select className="border rounded px-3 py-2" value={projectId} onChange={e => setProjectId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Select project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="date" className="border rounded px-3 py-2" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" step="0.25" min="0" className="border rounded px-3 py-2" placeholder="Hours" value={hours} onChange={e => setHours(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex items-center gap-2">
          <input id="billable" type="checkbox" checked={billable} onChange={e => setBillable(e.target.checked)} />
          <label htmlFor="billable">Billable</label>
        </div>
        <div className="md:col-span-5">
          <button disabled={!canCreate} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">Log Time</button>
        </div>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Project</th>
              <th className="text-left p-2">Hours</th>
              <th className="text-left p-2">Billable</th>
              <th className="text-left p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{new Date(e.work_date).toLocaleDateString()}</td>
                <td className="p-2">{projects.find(p => p.id === e.project_id)?.name || e.project_id}</td>
                <td className="p-2">{e.hours.toFixed(2)}</td>
                <td className="p-2">{e.billable ? 'Yes' : 'No'}</td>
                <td className="p-2">{e.description || '—'}</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td className="p-3 text-gray-500" colSpan={5}>No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
