import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';

const ManageLocationsPage = () => {
    const [locations, setLocations] = useState([]);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchLocations = () => {
        setLoading(true);
        ApiService.getAdminLocations()
            .then(res => setLocations(res.locationList || []))
            .catch(() => setError('Failed to load locations.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchLocations(); }, []);

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name) { setError('Location name cannot be empty.'); return; }
        if (locations.some(l => l.name.toLowerCase() === name.toLowerCase())) {
            setError('A location with this name already exists.');
            return;
        }
        try {
            await ApiService.addLocation({ name });
            setNewName('');
            setSuccess(`"${name}" added successfully.`);
            setTimeout(() => setSuccess(''), 3000);
            fetchLocations();
        } catch {
            setError('Failed to add location.');
        }
    };

    const handleToggle = async (id, currentActive, name) => {
        try {
            await ApiService.toggleLocation(id);
            setSuccess(`"${name}" ${currentActive ? 'deactivated' : 'activated'}.`);
            setTimeout(() => setSuccess(''), 3000);
            fetchLocations();
        } catch {
            setError('Failed to toggle location.');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await ApiService.deleteLocation(id);
            setSuccess(`"${name}" deleted.`);
            setTimeout(() => setSuccess(''), 3000);
            fetchLocations();
        } catch {
            setError('Failed to delete location. It may be in use by existing rooms.');
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="admin-page">

            {/* Add new location */}
            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: '24px',
            }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>
                    Add New Location
                </h3>
                {error   && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
                {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '10px' }}>{success}</p>}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="e.g. Wakad, Pune"
                        value={newName}
                        onChange={e => { setNewName(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        style={{
                            flex: 1, minWidth: '220px',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #e5e7eb',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleAdd}
                        style={{
                            padding: '9px 20px',
                            background: '#007F86',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        + Add Location
                    </button>
                </div>
            </div>

            {/* Locations list */}
            {loading ? (
                <p style={{ color: '#9ca3af' }}>Loading…</p>
            ) : locations.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>No locations yet.</p>
            ) : (
                <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={th}>#</th>
                                <th style={th}>Location Name</th>
                                <th style={{ ...th, textAlign: 'center' }}>Status</th>
                                <th style={{ ...th, textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((loc, i) => (
                                <tr
                                    key={loc.id}
                                    style={{ borderBottom: '1px solid #f3f4f6' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    <td style={{ ...td, color: '#9ca3af', width: '48px' }}>{i + 1}</td>
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        📍 {loc.name}
                                    </td>
                                    <td style={{ ...td, textAlign: 'center' }}>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            background: loc.isActive ? '#dcfce7' : '#f3f4f6',
                                            color: loc.isActive ? '#15803d' : '#6b7280',
                                        }}>
                                            {loc.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ ...td, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleToggle(loc.id, loc.isActive, loc.name)}
                                                style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '6px',
                                                    border: '1.5px solid',
                                                    borderColor: loc.isActive ? '#d1d5db' : '#007F86',
                                                    background: '#fff',
                                                    color: loc.isActive ? '#6b7280' : '#007F86',
                                                    fontWeight: 600,
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {loc.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loc.id, loc.name)}
                                                style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '6px',
                                                    border: '1.5px solid #fee2e2',
                                                    background: '#fff',
                                                    color: '#dc2626',
                                                    fontWeight: 600,
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                Only <strong>Active</strong> locations appear in room booking and admin forms.
                Deactivating a location hides it from dropdowns without deleting existing room data.
            </p>
        </div>
    );
};

const th = { padding: '10px 16px', fontWeight: 600, fontSize: '13px', color: '#374151', textAlign: 'left' };
const td = { padding: '12px 16px', color: '#374151', verticalAlign: 'middle' };

export default ManageLocationsPage;
