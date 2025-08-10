import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'

type Customer = {
  id: number
  name: string
  contact_email?: string
  notes?: string
  active: boolean
  created_at: string
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate = useMemo(() => name.trim().length > 0, [name])

  async function load() {
    try {
      const data = await api<Customer[]>('/customers?limit=1000')
      setCustomers(data)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = { name: name.trim(), contact_email: email || undefined, notes: notes || undefined, active }
    try {
      await api<Customer>('/customers', { method: 'POST', body: JSON.stringify(payload) })
      setName(''); setEmail(''); setNotes(''); setActive(true)
      load()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={create} className="bg-white border rounded-lg p-4 grid gap-3 md:grid-cols-4">
        <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex items-center gap-2">
          <input id="active" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          <label htmlFor="active">Active</label>
        </div>
        <div className="md:col-span-4">
          <button disabled={!canCreate} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">Add Customer</button>
        </div>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.contact_email || '—'}</td>
                <td className="p-2">{c.active ? 'Yes' : 'No'}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td className="p-3 text-gray-500" colSpan={4}>No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
