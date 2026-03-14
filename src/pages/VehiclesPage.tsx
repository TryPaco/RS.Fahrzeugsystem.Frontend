import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getCustomers } from '../api/customersApi';
import { createVehicle, getVehicles } from '../api/vehiclesApi';
import { PageHeader } from '../components/PageHeader';
import type { Customer } from '../types/customer';
import type { CreateVehicleRequest, Vehicle } from '../types/vehicle';

const initialForm: CreateVehicleRequest = {
  customerId: '',
  internalNumber: '',
  fin: '',
  licensePlate: '',
  brand: '',
  model: '',
  modelVariant: '',
  buildYear: undefined,
  engineCode: '',
  transmission: '',
  fuelType: '',
  color: '',
  currentKm: 0,
  stockPowerHp: undefined,
  currentPowerHp: undefined,
  softwareStage: '',
  notes: '',
};

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CreateVehicleRequest>(initialForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [vehicleData, customerData] = await Promise.all([
        getVehicles(false, search),
        getCustomers(false),
      ]);
      setVehicles(vehicleData);
      setCustomers(customerData);
    } catch {
      setError('Fahrzeuge konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const customerOptions = useMemo(() => customers, [customers]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createVehicle({
        ...form,
        buildYear: form.buildYear ? Number(form.buildYear) : undefined,
        currentKm: Number(form.currentKm),
        stockPowerHp: form.stockPowerHp ? Number(form.stockPowerHp) : undefined,
        currentPowerHp: form.currentPowerHp ? Number(form.currentPowerHp) : undefined,
      });
      setForm(initialForm);
      await loadData();
    } catch {
      setError('Fahrzeug konnte nicht angelegt werden.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSearch() {
    setLoading(true);
    try {
      const data = await getVehicles(false, search);
      setVehicles(data);
    } catch {
      setError('Fahrzeugsuche fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Fahrzeuge" subtitle="Fahrzeuge anlegen und durchsuchen" />

      <div className="two-column-grid">
        <section className="card">
          <h3>Neues Fahrzeug anlegen</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Kunde wählen</option>
              {customerOptions.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customerNumber} - {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
            <input placeholder="Interne Fahrzeugnummer" value={form.internalNumber} onChange={(e) => setForm({ ...form, internalNumber: e.target.value })} />
            <input placeholder="FIN" value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })} />
            <input placeholder="Kennzeichen" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
            <input placeholder="Marke" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <input placeholder="Modell" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <input placeholder="Modellvariante" value={form.modelVariant} onChange={(e) => setForm({ ...form, modelVariant: e.target.value })} />
            <input placeholder="Baujahr" type="number" value={form.buildYear ?? ''} onChange={(e) => setForm({ ...form, buildYear: e.target.value ? Number(e.target.value) : undefined })} />
            <input placeholder="Motorcode" value={form.engineCode} onChange={(e) => setForm({ ...form, engineCode: e.target.value })} />
            <input placeholder="Getriebe" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} />
            <input placeholder="Kraftstoff" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} />
            <input placeholder="Farbe" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            <input placeholder="KM-Stand" type="number" value={form.currentKm} onChange={(e) => setForm({ ...form, currentKm: Number(e.target.value) })} />
            <input placeholder="Serie PS" type="number" value={form.stockPowerHp ?? ''} onChange={(e) => setForm({ ...form, stockPowerHp: e.target.value ? Number(e.target.value) : undefined })} />
            <input placeholder="Aktuell PS" type="number" value={form.currentPowerHp ?? ''} onChange={(e) => setForm({ ...form, currentPowerHp: e.target.value ? Number(e.target.value) : undefined })} />
            <input placeholder="Software / Stage" value={form.softwareStage} onChange={(e) => setForm({ ...form, softwareStage: e.target.value })} />
            <textarea placeholder="Notizen" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {error ? <div className="error-box">{error}</div> : null}
            <button type="submit" disabled={saving}>{saving ? 'Speichert…' : 'Fahrzeug anlegen'}</button>
          </form>
        </section>

        <section className="card">
          <div className="row-between">
            <h3>Fahrzeugliste</h3>
            <div className="search-row">
              <input placeholder="Suche nach FIN, Kennzeichen, Modell…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" onClick={handleSearch}>Suchen</button>
            </div>
          </div>
          {loading ? <p>Lade Fahrzeuge…</p> : null}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Intern</th>
                  <th>Kunde</th>
                  <th>Fahrzeug</th>
                  <th>Kennzeichen</th>
                  <th>FIN</th>
                  <th>KM</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.internalNumber}</td>
                    <td>{vehicle.customerName ?? '-'}</td>
                    <td>{vehicle.brand} {vehicle.model}</td>
                    <td>{vehicle.licensePlate || '-'}</td>
                    <td>{vehicle.fin || '-'}</td>
                    <td>{vehicle.currentKm.toLocaleString('de-DE')}</td>
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
