import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type SummaryProject = {
  project_id: number
  project_name: string
  customer_id: number
  customer_name: string
  hours: number
}

type SummaryCustomer = {
  customer_id: number
  customer_name: string
  hours: number
}

type Project = {
  id: number
  name: string
  customer_id: number
}

type TimeEntry = {
  id: number
  project_id: number
  work_date: string
  hours: number
  description?: string
  billable: boolean
}

export default function Dashboard() {
  const [byProject, setByProject] = useState<SummaryProject[]>([])
  const [byCustomer, setByCustomer] = useState<SummaryCustomer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([])
  const [recent, setRecent] = useState<TimeEntry[]>([])
  const [overviewTab, setOverviewTab] = useState<'project' | 'customer'>('project')

  // Quick add task form state
  const [projectId, setProjectId] = useState<number | ''>('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [hours, setHours] = useState<string>('')
  const [description, setDescription] = useState('')
  const [billable, setBillable] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const canCreate = useMemo(() => !!projectId && !!date && Number(hours) > 0, [projectId, date, hours])

  useEffect(() => {
    Promise.all([
      api<SummaryProject[]>('/reports/by-project'),
      api<SummaryCustomer[]>('/reports/by-customer'),
    ])
      .then(([p, c]) => { setByProject(p); setByCustomer(c) })
      .catch(err => setError(String(err)))
  }, [])

  useEffect(() => {
    Promise.all([
      api<Project[]>('/projects?limit=10000'),
      api<{ id: number; name: string }[]>('/customers?limit=10000'),
      api<TimeEntry[]>('/time-entries?limit=10'),
    ])
      .then(([projs, custs, rec]) => { setProjects(projs); setCustomers(custs); setRecent(rec) })
      .catch(err => setFormError(String(err)))
  }, [])

  async function createQuickTask(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    if (!canCreate) return
    const payload = {
      project_id: Number(projectId),
      work_date: date,
      hours: Number(hours),
      description: description || undefined,
      billable,
    }
    try {
      await api('/time-entries', { method: 'POST', body: JSON.stringify(payload) })
      setProjectId(''); setHours(''); setDescription(''); setBillable(true)
      setFormSuccess('Task logged successfully')
      // refresh summaries
      const [p, c, rec] = await Promise.all([
        api<SummaryProject[]>('/reports/by-project'),
        api<SummaryCustomer[]>('/reports/by-customer'),
        api<TimeEntry[]>('/time-entries?limit=10'),
      ])
      setByProject(p); setByCustomer(c); setRecent(rec)
    } catch (e) {
      setFormError(String(e))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {error && <div className="text-red-600">{error}</div>}

      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-medium text-gray-700 mb-3">Quick add task</h2>
        {formError && <div className="text-red-600 mb-2">{formError}</div>}
        {formSuccess && <div className="text-green-700 mb-2">{formSuccess}</div>}
        <form onSubmit={createQuickTask} className="grid gap-3 md:grid-cols-5">
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
            <button disabled={!canCreate} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">Log Task</button>
          </div>
        </form>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="font-medium text-gray-700">Overview</h2>
            <div className="flex rounded-md overflow-hidden border">
              <button type="button" className={`px-3 py-1 text-sm ${overviewTab === 'project' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`} onClick={() => setOverviewTab('project')}>By Project</button>
              <button type="button" className={`px-3 py-1 text-sm ${overviewTab === 'customer' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`} onClick={() => setOverviewTab('customer')}>By Customer</button>
            </div>
          </div>
          <ul className="divide-y">
            {overviewTab === 'project' && (
              (byProject.slice(0, 5)).map(item => (
                <li key={item.project_id} className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-gray-500 truncate">{item.customer_name}</div>
                      <div className="font-medium truncate">{item.project_name}</div>
                    </div>
                    <div className="text-primary-700 font-semibold whitespace-nowrap">{item.hours.toFixed(2)} h</div>
                  </div>
                </li>
              ))
            )}
            {overviewTab === 'customer' && (
              (byCustomer.slice(0, 5)).map(item => (
                <li key={item.customer_id} className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium truncate">{item.customer_name}</div>
                    <div className="text-primary-700 font-semibold whitespace-nowrap">{item.hours.toFixed(2)} h</div>
                  </div>
                </li>
              ))
            )}
            {overviewTab === 'project' && byProject.length === 0 && (
              <li className="px-3 py-2 text-gray-500 text-sm">No data yet. Create a project and log time.</li>
            )}
            {overviewTab === 'customer' && byCustomer.length === 0 && (
              <li className="px-3 py-2 text-gray-500 text-sm">No data yet.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg border">
          <h2 className="font-medium text-gray-700 mb-2">Recent time logs</h2>
          <div className="overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Project</th>
                  <th className="text-left p-2">H</th>
                  <th className="text-left p-2">B</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(e => {
                  const proj = projects.find(p => p.id === e.project_id)
                  const custName = proj ? (customers.find(c => c.id === proj.customer_id)?.name ?? '') : ''
                  return (
                    <tr key={e.id} className="border-t">
                      <td className="p-2">{new Date(e.work_date).toLocaleDateString()}</td>
                      <td className="p-2">{custName || '—'}</td>
                      <td className="p-2">{proj?.name || e.project_id}</td>
                      <td className="p-2">{e.hours.toFixed(2)}</td>
                      <td className="p-2">{e.billable ? 'Y' : 'N'}</td>
                      <td className="p-2 truncate max-w-[16rem]">{e.description || '—'}</td>
                    </tr>
                  )
                })}
                {recent.length === 0 && (
                  <tr><td className="p-3 text-gray-500" colSpan={6}>No recent entries.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
