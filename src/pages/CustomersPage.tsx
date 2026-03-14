import { FormEvent, useEffect, useState } from 'react';
import { createCustomer, getCustomers } from '../api/customersApi';
import { PageHeader } from '../components/PageHeader';
import type { Customer, CreateCustomerRequest } from '../types/customer';

const initialForm: CreateCustomerRequest = {
  customerNumber: '',
  companyName: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  street: '',
  zipCode: '',
  city: '',
  country: 'Deutschland',
  notes: '',
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CreateCustomerRequest>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await getCustomers(false);
      setCustomers(data);
    } catch {
      setError('Kunden konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createCustomer(form);
      setForm(initialForm);
      await loadCustomers();
    } catch {
      setError('Kunde konnte nicht angelegt werden.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Kunden" subtitle="Kundenliste und Neuanlage" />

      <div className="two-column-grid">
        <section className="card">
          <h3>Neuen Kunden anlegen</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input placeholder="Kundennummer" value={form.customerNumber} onChange={(e) => setForm({ ...form, customerNumber: e.target.value })} />
            <input placeholder="Firma" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <input placeholder="Vorname" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input placeholder="Nachname" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Straße" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <input placeholder="PLZ" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
            <input placeholder="Stadt" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="Land" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <textarea placeholder="Notizen" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {error ? <div className="error-box">{error}</div> : null}
            <button type="submit" disabled={saving}>{saving ? 'Speichert…' : 'Kunde anlegen'}</button>
          </form>
        </section>

        <section className="card">
          <h3>Kundenliste</h3>
          {loading ? <p>Lade Kunden…</p> : null}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kundennr.</th>
                  <th>Name</th>
                  <th>Firma</th>
                  <th>Telefon</th>
                  <th>Stadt</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customerNumber}</td>
                    <td>{customer.firstName} {customer.lastName}</td>
                    <td>{customer.companyName || '-'}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.city || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
