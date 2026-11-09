import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';

const ManageMealPlansPage = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', name: '', description: '', pricePerPersonPerDay: '' });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchMealPlans = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllMealPlans();
            setMealPlans(res.mealPlanList || []);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMealPlans(); }, []);

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleCreate = async () => {
        setFormError('');
        if (!form.code.trim() || !form.name.trim() || !form.pricePerPersonPerDay) {
            setFormError('Code, name and price are required.');
            return;
        }
        setSaving(true);
        try {
            await ApiService.createMealPlan({
                code: form.code.trim().toUpperCase(),
                name: form.name.trim(),
                description: form.description.trim(),
                pricePerPersonPerDay: parseFloat(form.pricePerPersonPerDay),
            });
            setShowForm(false);
            setForm({ code: '', name: '', description: '', pricePerPersonPerDay: '' });
            fetchMealPlans();
        } catch (e) {
            setFormError(e.response?.data?.message || e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this meal plan?')) return;
        try {
            await ApiService.deleteMealPlan(id);
            fetchMealPlans();
        } catch (_) {}
    };

    const MEAL_ICONS = { RO: '🏨', BB: '☕', HB: '🍽️', FB: '🍱', AI: '🎉' };

    return (
        <div className="admin-manage-page">
            <div className="admin-manage-header">
                <h2>Manage Meal Plans</h2>
                <button className="admin-add-btn" onClick={() => setShowForm(s => !s)}>
                    {showForm ? 'Cancel' : '+ New Meal Plan'}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {showForm && (
                <div className="admin-form-card">
                    <h3>Create Meal Plan</h3>
                    {formError && <p className="error-message">{formError}</p>}
                    <div className="admin-form-grid">
                        <div className="form-group">
                            <label>Code (e.g. BB, HB, FB)</label>
                            <input type="text" value={form.code} onChange={e => handleChange('code', e.target.value.toUpperCase())} placeholder="BB" maxLength={5} />
                        </div>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Bed & Breakfast" />
                        </div>
                        <div className="form-group">
                            <label>Price per Person per Night (₹)</label>
                            <input type="number" value={form.pricePerPersonPerDay} onChange={e => handleChange('pricePerPersonPerDay', e.target.value)} placeholder="350" />
                        </div>
                        <div className="form-group" style={{gridColumn:'1/-1'}}>
                            <label>Description</label>
                            <input type="text" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Includes breakfast for all guests" />
                        </div>
                    </div>
                    <button className="admin-save-btn" onClick={handleCreate} disabled={saving}>
                        {saving ? 'Creating…' : 'Create Meal Plan'}
                    </button>
                </div>
            )}

            {loading ? (
                <p className="admin-loading">Loading meal plans…</p>
            ) : mealPlans.length === 0 ? (
                <div className="admin-empty">No meal plans yet. Create one above!</div>
            ) : (
                <div className="meal-plan-cards">
                    {mealPlans.map(mp => (
                        <div key={mp.id} className="meal-plan-admin-card">
                            <div className="meal-plan-admin-icon">
                                {MEAL_ICONS[mp.code] || '🍽️'}
                            </div>
                            <div className="meal-plan-admin-info">
                                <div className="meal-plan-admin-code">{mp.code}</div>
                                <h4>{mp.name}</h4>
                                {mp.description && <p>{mp.description}</p>}
                                <strong className="meal-plan-admin-price">₹{mp.pricePerPersonPerDay} / person / night</strong>
                            </div>
                            <button className="admin-delete-btn" onClick={() => handleDelete(mp.id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageMealPlansPage;
