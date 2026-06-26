import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

export function LanForm({ onJoin }) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!address) {
      setError('Please enter an address.');
      return;
    }
    onJoin(address);
  };

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-bold">Join LAN Party</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Enter the IP address of the host.
      </p>
      <div className="mt-5 space-y-3">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., 192.168.1.100:8080"
          className="h-12 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--composer-bg)] px-4 outline-none"
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] font-bold">
          <FiSearch />
          <span>Join</span>
        </button>
      </div>
    </form>
  );
}