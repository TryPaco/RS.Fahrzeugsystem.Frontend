import { useEffect, useState } from 'react';
import { getLabels } from '../api/labelsApi';
import { PageHeader } from '../components/PageHeader';
import type { Label } from '../types/label';

export function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getLabels();
        setLabels(data);
      } catch {
        setError('Labels konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <>
      <PageHeader title="Labels" subtitle="RS- und B-QR-Codes verwalten" />
      <section className="card">
        {loading ? <p>Lade Labels…</p> : null}
        {error ? <div className="error-box">{error}</div> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Prefix</th>
                <th>Nummer</th>
                <th>Status</th>
                <th>Fahrzeug</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => (
                <tr key={label.id}>
                  <td>{label.code}</td>
                  <td>{label.prefix}</td>
                  <td>{label.codeNumber}</td>
                  <td>{label.status}</td>
                  <td>{label.vehicleId ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
