import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';

const ManageCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        code: '', discountType: 'PERCENT', discountValue: '', minBookingAmount: '',
        maxDiscountCap: '', validFrom: '', validUntil: '', usageLimit: '', active: true,
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllCoupons();
            setCoupons(res.couponList || []);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleCreate = async () => {
        setFormError('');
        if (!form.code.trim() || !form.discountValue || !form.validFrom || !form.validUntil) {
            setFormError('Code, discount value, valid from and until are required.');
            return;
        }
        if (new Date(form.validUntil) <= new Date(form.validFrom)) {
            setFormError('Valid until date must be after valid from date.');
            return;
        }
        setSaving(true);
        try {
            await ApiService.createCoupon({
                code: form.code.trim().toUpperCase(),
                discountType: form.discountType,
                discountValue: parseFloat(form.discountValue),
                minBookingAmount: form.minBookingAmount ? parseFloat(form.minBookingAmount) : null,
                maxDiscountCap: form.maxDiscountCap ? parseFloat(form.maxDiscountCap) : null,
                validFrom: form.validFrom,
                validUntil: form.validUntil,
                usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
                active: form.active,
            });
            setShowForm(false);
            setForm({ code: '', discountType: 'PERCENT', discountValue: '', minBookingAmount: '', maxDiscountCap: '', validFrom: '', validUntil: '', usageLimit: '', active: true });
            fetchCoupons();
        } catch (e) {
            setFormError(e.response?.data?.message || e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await ApiService.toggleCouponActive(id);
            fetchCoupons();
        } catch (_) {}
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await ApiService.deleteCoupon(id);
            fetchCoupons();
        } catch (_) {}
    };

    return (
        <div className="admin-manage-page">
            <div className="admin-manage-header">
                <h2>Manage Coupons</h2>
                <button className="admin-add-btn" onClick={() => setShowForm(s => !s)}>
                    {showForm ? 'Cancel' : '+ New Coupon'}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {showForm && (
                <div className="admin-form-card">
                    <h3>Create Coupon</h3>
                    {formError && <p className="error-message">{formError}</p>}
                    <div className="admin-form-grid">
                        <div className="form-group">
                            <label>Code</label>
                            <input type="text" value={form.code} onChange={e => handleChange('code', e.target.value.toUpperCase())} placeholder="SUMMER20" />
                        </div>
                        <div className="form-group">
                            <label>Discount Type</label>
                            <select value={form.discountType} onChange={e => handleChange('discountType', e.target.value)}>
                                <option value="PERCENT">Percentage (%)</option>
                                <option value="FLAT">Flat (₹)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Discount Value</label>
                            <input type="number" value={form.discountValue} onChange={e => handleChange('discountValue', e.target.value)} placeholder={form.discountType === 'PERCENT' ? '20' : '500'} />
                        </div>
                        <div className="form-group">
                            <label>Min Booking Amount (₹)</label>
                            <input type="number" value={form.minBookingAmount} onChange={e => handleChange('minBookingAmount', e.target.value)} placeholder="1000" />
                        </div>
                        {form.discountType === 'PERCENT' && (
                            <div className="form-group">
                                <label>Max Discount Cap (₹)</label>
                                <input type="number" value={form.maxDiscountCap} onChange={e => handleChange('maxDiscountCap', e.target.value)} placeholder="500" />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Valid From</label>
                            <input type="date" value={form.validFrom} onChange={e => handleChange('validFrom', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Valid Until</label>
                            <input type="date" value={form.validUntil} onChange={e => handleChange('validUntil', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Usage Limit</label>
                            <input type="number" value={form.usageLimit} onChange={e => handleChange('usageLimit', e.target.value)} placeholder="100" />
                        </div>
                    </div>
                    <button className="admin-save-btn" onClick={handleCreate} disabled={saving}>
                        {saving ? 'Creating…' : 'Create Coupon'}
                    </button>
                </div>
            )}

            {loading ? (
                <p className="admin-loading">Loading coupons…</p>
            ) : coupons.length === 0 ? (
                <div className="admin-empty">No coupons yet. Create one above!</div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th><th>Type</th><th>Value</th><th>Min Amt</th>
                                <th>Valid Until</th><th>Used / Limit</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.code}</strong></td>
                                    <td>{c.discountType}</td>
                                    <td>{c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                                    <td>{c.minBookingAmount ? `₹${c.minBookingAmount}` : '—'}</td>
                                    <td>{c.validUntil}</td>
                                    <td>{c.timesUsed} / {c.usageLimit ?? '∞'}</td>
                                    <td>
                                        <span className={`coupon-status-badge ${c.active ? 'status-active' : 'status-inactive'}`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="admin-table-actions">
                                        <button className="admin-toggle-btn" onClick={() => handleToggle(c.id)}>
                                            {c.active ? 'Disable' : 'Enable'}
                                        </button>
                                        <button className="admin-delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageCouponsPage;
