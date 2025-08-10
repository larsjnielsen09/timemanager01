import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'

type Customer = { id: number; name: string }

type Department = {
  id: number
  name: string
  customer_id: number
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [name, setName] = useState('')
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const canCreate = useMemo(() => !!name.trim() && !!customerId, [name, customerId])

  async function load() {
    try {
      const [d, c] = await Promise.all([
        api<Department[]>('/departments?limit=1000'),
        api<Customer[]>('/customers?limit=1000&active=true'),
      ])
      setDepartments(d)
      setCustomers(c)
    } catch (e) { setError(String(e)) }
  }

  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !customerId) return
    const payload = { name: name.trim(), customer_id: Number(customerId) }
    try {
      await api<Department>('/departments', { method: 'POST', body: JSON.stringify(payload) })
      setName(''); setCustomerId('')
      load()
    } catch (e) { setError(String(e)) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Departments</h1>
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={create} className="bg-white border rounded-lg p-4 grid gap-3 md:grid-cols-4">
        <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select className="border rounded px-3 py-2" value={customerId} onChange={e => setCustomerId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Select customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="md:col-span-4">
          <button disabled={!canCreate} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">Add Department</button>
        </div>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Customer</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{customers.find(c => c.id === d.customer_id)?.name || d.customer_id}</td>
              </tr>
            ))}
            {departments.length === 0 && <tr><td className="p-3 text-gray-500" colSpan={2}>No departments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
