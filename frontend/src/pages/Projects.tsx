import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Customer = { id: number; name: string }
type Department = { id: number; name: string; customer_id: number }

type Project = {
  id: number
  name: string
  customer_id: number
  department_id?: number | null
  active: boolean
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [name, setName] = useState('')
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const [p, c, d] = await Promise.all([
        api<Project[]>('/projects?limit=1000'),
        api<Customer[]>('/customers?limit=1000&active=true'),
        api<Department[]>('/departments?limit=1000'),
      ])
      setProjects(p)
      setCustomers(c)
      setDepartments(d)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !customerId) return
    const payload = { name: name.trim(), customer_id: Number(customerId), department_id: departmentId ? Number(departmentId) : undefined, active }
    try {
      await api<Project>('/projects', { method: 'POST', body: JSON.stringify(payload) })
      setName(''); setCustomerId(''); setDepartmentId(''); setActive(true)
      load()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={create} className="bg-white border rounded-lg p-4 grid gap-3 md:grid-cols-4">
        <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select className="border rounded px-3 py-2" value={customerId} onChange={e => { const v = e.target.value ? Number(e.target.value) : ''; setCustomerId(v); setDepartmentId('') }}>
          <option value="">Select customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2" value={departmentId} onChange={e => setDepartmentId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">No department</option>
          {departments.filter(d => customerId && d.customer_id === Number(customerId)).map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input id="active" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          <label htmlFor="active">Active</label>
        </div>
        <div className="md:col-span-4">
          <button className="bg-primary-600 text-white px-4 py-2 rounded">Add Project</button>
        </div>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Customer</th>
              <th className="text-left p-2">Department</th>
              <th className="text-left p-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{customers.find(c => c.id === p.customer_id)?.name || p.customer_id}</td>
                <td className="p-2">{p.department_id ? (departments.find(d => d.id === p.department_id)?.name || p.department_id) : '—'}</td>
                <td className="p-2">{p.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td className="p-3 text-gray-500" colSpan={4}>No projects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
