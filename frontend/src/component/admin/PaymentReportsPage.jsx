import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';

const STATUS_COLORS = {
    SUCCESS:  { bg: '#d1fae5', color: '#065f46' },
    PENDING:  { bg: '#fef9c3', color: '#854d0e' },
    FAILED:   { bg: '#fee2e2', color: '#991b1b' },
    REFUNDED: { bg: '#e0e7ff', color: '#3730a3' },
};

const CHART_COLORS = ['#007F86','#FF7F50','#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6'];

const fmt = (v) =>
    v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';

const fmtDate = (dt) =>
    dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/* ── Pure-CSS horizontal bar chart ── */
const BarChart = ({ data, colorFn }) => {
    if (!data || data.length === 0) return <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No data</p>;
    const max = Math.max(...data.map(d => Number(d.value)));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map((d, i) => (
                <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '13px' }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{d.label}</span>
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>{d.formatted}</span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: max > 0 ? `${(Number(d.value) / max) * 100}%` : '0%',
                            background: colorFn ? colorFn(i) : CHART_COLORS[i % CHART_COLORS.length],
                            height: '100%',
                            borderRadius: '6px',
                            transition: 'width 0.6s ease',
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ── Vertical bar chart for monthly revenue ── */
const MonthlyBarChart = ({ data }) => {
    if (!data || data.length === 0) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No monthly data yet. Make some bookings to see revenue here.
        </div>
    );
    const max = Math.max(...data.map(d => Number(d.amount)));
    return (
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', minWidth: `${data.length * 68}px`, height: '200px', padding: '0 4px' }}>
                {data.map((d, i) => {
                    const pct = max > 0 ? (Number(d.amount) / max) * 100 : 0;
                    return (
                        <div key={i} style={{ flex: '0 0 58px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', fontWeight: 600 }}>
                                {fmt(d.amount)}
                            </span>
                            <div
                                title={`${d.label}: ${fmt(d.amount)}`}
                                style={{
                                    width: '42px',
                                    height: `${Math.max(pct, 2)}%`,
                                    background: 'linear-gradient(to top, #005f65, #007F86)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.6s ease',
                                    cursor: 'pointer',
                                }}
                            />
                            <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                {d.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ── Donut-style status ring (pure CSS) ── */
const StatusDonut = ({ statusBreakdown }) => {
    const entries = Object.entries(statusBreakdown || {});
    const total = entries.reduce((s, [, v]) => s + Number(v), 0);
    const COLOR_MAP = { SUCCESS: '#10b981', PENDING: '#f59e0b', FAILED: '#ef4444', REFUNDED: '#6366f1' };
    if (total === 0) return <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No data</p>;
    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {entries.map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLOR_MAP[status] || '#9ca3af', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#374151', flex: 1 }}>{status}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{count}</span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>({((Number(count) / total) * 100).toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsCard = ({ title, children, style }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px 24px',
        ...style,
    }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>{title}</h4>
        {children}
    </div>
);

const PaymentReportsPage = () => {
    const [tab, setTab] = useState('overview');
    const [payments, setPayments] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [monthRange, setMonthRange] = useState(12);

    useEffect(() => {
        Promise.all([
            ApiService.getPaymentReport(),
            ApiService.getPaymentAnalytics(),
        ]).then(([reportRes, analyticsRes]) => {
            setPayments(reportRes.paymentList || []);
            setAnalytics(analyticsRes.analyticsData || null);
        }).catch(() => setError('Failed to load payment data.'))
          .finally(() => setLoading(false));
    }, []);

    const filtered = payments.filter(p => {
        const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            (p.bookingConfirmationCode || '').toLowerCase().includes(q) ||
            (p.userName || '').toLowerCase().includes(q) ||
            (p.userEmail || '').toLowerCase().includes(q) ||
            (p.gatewayTxnId || '').toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    if (loading) return <div className="admin-page"><p>Loading…</p></div>;
    if (error)   return <div className="admin-page"><p style={{ color: 'red' }}>{error}</p></div>;

    const a = analytics || {};
    const monthlySliced = (a.monthlyRevenue || []).slice(-(monthRange));
    const revenueByType = Object.entries(a.revenueByType || {}).map(([k, v]) => ({ label: k, value: v, formatted: fmt(v) })).sort((a, b) => Number(b.value) - Number(a.value));
    const revenueByLoc  = Object.entries(a.revenueByLocation || {}).map(([k, v]) => ({ label: k, value: v, formatted: fmt(v) })).sort((a, b) => Number(b.value) - Number(a.value));

    return (
        <div className="admin-page">
            {/* Summary stat strip */}
            <div className="admin-stat-cards" style={{ marginBottom: '24px' }}>
                {[
                    { icon: '💰', value: fmt(a.totalRevenue || 0), label: 'Total Revenue' },
                    { icon: '📄', value: a.totalTxns ?? payments.length, label: 'Transactions' },
                    { icon: '✅', value: a.successTxns ?? 0, label: 'Successful' },
                    { icon: '❌', value: a.failedTxns ?? 0, label: 'Failed' },
                    { icon: '🔄', value: a.refundTxns ?? 0, label: 'Refunded' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <span className="admin-stat-card-icon">{s.icon}</span>
                        <div>
                            <div className="admin-stat-card-value">{s.value}</div>
                            <div className="admin-stat-card-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
                {[['overview','📊 Overview'], ['transactions','🧾 Transactions']].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        style={{
                            padding: '9px 20px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '14px',
                            borderBottom: tab === key ? '3px solid #007F86' : '3px solid transparent',
                            color: tab === key ? '#007F86' : '#6b7280',
                            marginBottom: '-2px',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Monthly revenue chart */}
                    <AnalyticsCard title="Monthly Revenue">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '6px' }}>
                            {[3, 6, 12].map(n => (
                                <button key={n} onClick={() => setMonthRange(n)} style={{
                                    padding: '4px 12px', borderRadius: '16px', border: '1.5px solid',
                                    borderColor: monthRange === n ? '#007F86' : '#d1d5db',
                                    background: monthRange === n ? '#007F86' : '#fff',
                                    color: monthRange === n ? '#fff' : '#6b7280',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                }}>Last {n}M</button>
                            ))}
                        </div>
                        <MonthlyBarChart data={monthlySliced} />
                    </AnalyticsCard>

                    {/* 2-column row: room type + location */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <AnalyticsCard title="Revenue by Room Type">
                            <BarChart data={revenueByType} />
                        </AnalyticsCard>
                        <AnalyticsCard title="Revenue by Location">
                            <BarChart data={revenueByLoc} colorFn={(i) => CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                        </AnalyticsCard>
                    </div>

                    {/* 2-column row: status breakdown + top guests */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <AnalyticsCard title="Transaction Status Breakdown">
                            <StatusDonut statusBreakdown={a.statusBreakdown} />
                        </AnalyticsCard>
                        <AnalyticsCard title="Top Guests by Spend">
                            {(a.topGuests || []).length === 0
                                ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No data</p>
                                : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {(a.topGuests || []).map((g, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: CHART_COLORS[i % CHART_COLORS.length],
                                                    color: '#fff', fontWeight: 700, fontSize: '13px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}>{i + 1}</div>
                                                <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#374151' }}>{g.name}</span>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#007F86' }}>{fmt(g.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </AnalyticsCard>
                    </div>

                    {/* Monthly summary table */}
                    <AnalyticsCard title="Monthly Revenue Summary">
                        {(a.monthlyRevenue || []).length === 0
                            ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No monthly data yet.</p>
                            : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb' }}>
                                                <th style={th}>Month</th>
                                                <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
                                                <th style={{ ...th, textAlign: 'right' }}>vs Prev Month</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...(a.monthlyRevenue || [])].reverse().map((m, i, arr) => {
                                                const prev = arr[i + 1];
                                                const curr = Number(m.amount);
                                                const prevAmt = prev ? Number(prev.amount) : null;
                                                const diff = prevAmt != null ? curr - prevAmt : null;
                                                const pct  = prevAmt && prevAmt > 0 ? ((diff / prevAmt) * 100).toFixed(1) : null;
                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={td}>{m.label}</td>
                                                        <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmt(curr)}</td>
                                                        <td style={{ ...td, textAlign: 'right' }}>
                                                            {diff !== null ? (
                                                                <span style={{ color: diff >= 0 ? '#059669' : '#dc2626', fontWeight: 600, fontSize: '13px' }}>
                                                                    {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))} ({pct}%)
                                                                </span>
                                                            ) : <span style={{ color: '#9ca3af' }}>—</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                    </AnalyticsCard>
                </div>
            )}

            {/* ── TRANSACTIONS TAB ── */}
            {tab === 'transactions' && (
                <>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Search by booking code, name, email, txn ID…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', flex: '1', minWidth: '200px' }}
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                        <span style={{ alignSelf: 'center', fontSize: '13px', color: '#6b7280' }}>
                            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {filtered.length === 0 ? (
                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>No payments found.</p>
                    ) : (
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                                        <th style={th}>ID</th>
                                        <th style={th}>Booking Code</th>
                                        <th style={th}>Guest</th>
                                        <th style={th}>Room Type</th>
                                        <th style={th}>Location</th>
                                        <th style={th}>Amount</th>
                                        <th style={th}>Gateway</th>
                                        <th style={th}>Status</th>
                                        <th style={th}>Paid At</th>
                                        <th style={th}>Refund</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(p => {
                                        const badge = STATUS_COLORS[p.status] || { bg: '#f3f4f6', color: '#374151' };
                                        return (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }} onMouseEnter={e => e.currentTarget.style.background='#f9fafb'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                                                <td style={td}>{p.id}</td>
                                                <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px' }}>{p.bookingConfirmationCode || '—'}</td>
                                                <td style={td}>
                                                    <div style={{ fontWeight: 500 }}>{p.userName || '—'}</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.userEmail || ''}</div>
                                                </td>
                                                <td style={td}>{p.roomType || '—'}</td>
                                                <td style={td}>{p.roomLocation || '—'}</td>
                                                <td style={{ ...td, fontWeight: 700, color: '#007F86' }}>{fmt(p.amount)}</td>
                                                <td style={td}>{p.paymentGateway || '—'}</td>
                                                <td style={td}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td style={{ ...td, fontSize: '12px' }}>{fmtDate(p.paidAt)}</td>
                                                <td style={td}>
                                                    {p.refundAmount
                                                        ? <><div style={{ fontWeight: 600 }}>{fmt(p.refundAmount)}</div><div style={{ fontSize: '11px', color: '#6b7280' }}>{fmtDate(p.refundedAt)}</div></>
                                                        : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const th = { padding: '10px 14px', fontWeight: 600, fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' };
const td = { padding: '10px 14px', color: '#374151', verticalAlign: 'top' };

export default PaymentReportsPage;
