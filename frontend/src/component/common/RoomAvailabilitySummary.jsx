import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';

const RoomAvailabilitySummary = ({ onTypeSelect, selectedType }) => {
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ApiService.getRoomAvailabilitySummary()
            .then((res) => {
                if (res.statusCode === 200) {
                    setSummary(res.roomAvailabilitySummary || {});
                }
            })
            .catch((err) => console.error('Error fetching availability summary:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    const total = Object.values(summary).reduce((sum, count) => sum + count, 0);

    return (
        <div className="availability-summary">
            <h3>Room Availability</h3>
            <div className="availability-cards">
                <div
                    className={`availability-card ${!selectedType ? 'active' : ''}`}
                    onClick={() => onTypeSelect('')}
                >
                    <span className="avail-count">{total}</span>
                    <span className="avail-label">All Rooms</span>
                    <span className="avail-status">Available</span>
                </div>
                {Object.entries(summary).map(([type, count]) => (
                    <div
                        key={type}
                        className={`availability-card ${selectedType === type ? 'active' : ''}`}
                        onClick={() => onTypeSelect(type)}
                    >
                        <span className="avail-count">{count}</span>
                        <span className="avail-label">{type}</span>
                        <span className="avail-status">Available</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomAvailabilitySummary;
