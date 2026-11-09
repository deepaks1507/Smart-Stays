import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const AddRoomPage = () => {
    const navigate = useNavigate();
    const [roomDetails, setRoomDetails] = useState({
        roomPhotoUrl: '',
        roomType: '',
        roomName: '',
        roomPrice: '',
        roomDescription: '',
        totalInventory: '',
        location: '',
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [roomTypes, setRoomTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [newRoomType, setNewRoomType] = useState(false);

    useEffect(() => {
        Promise.all([ApiService.getRoomTypes(), ApiService.getLocations()])
            .then(([types, locsRes]) => {
                setRoomTypes(types);
                setLocations((locsRes.locationList || []).map(l => l.name));
            })
            .catch(err => console.error('Error fetching form data:', err.message));
    }, []);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };


    const handleRoomTypeChange = (e) => {
        if (e.target.value === 'new') {
            setNewRoomType(true);
            setRoomDetails(prevState => ({ ...prevState, roomType: '' }));
        } else {
            setNewRoomType(false);
            setRoomDetails(prevState => ({ ...prevState, roomType: e.target.value }));
        }
    };


    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setFile(null);
            setPreview(null);
        }
    };


    const addRoom = async () => {
        if (!roomDetails.roomType || !roomDetails.roomPrice || !roomDetails.roomDescription || !roomDetails.totalInventory) {
            setError('All room details must be provided.');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (!window.confirm('Do you want to add this room?')) {
            return
        }

        try {
            const formData = new FormData();
            formData.append('roomType', roomDetails.roomType);
            if (roomDetails.roomName) formData.append('roomName', roomDetails.roomName);
            formData.append('roomPrice', roomDetails.roomPrice);
            formData.append('roomDescription', roomDetails.roomDescription);
            formData.append('totalInventory', roomDetails.totalInventory);
            if (roomDetails.location) formData.append('location', roomDetails.location);

            if (file) {
                formData.append('photo', file);
            }

            const result = await ApiService.addRoom(formData);
            if (result.statusCode === 200) {
                setSuccess('Room Added successfully.');
                
                setTimeout(() => {
                    setSuccess('');
                    navigate('/admin/manage-rooms');
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="edit-room-container">
            <h2>Add New Room</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="edit-room-form">
                <div className="form-group">
                    {preview && (
                        <img src={preview} alt="Room Preview" className="room-photo-preview" />
                    )}
                    <input
                        type="file"
                        name="roomPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="form-group">
                    <label>Room Type</label>
                    <select value={roomDetails.roomType} onChange={handleRoomTypeChange}>
                        <option value="">Select a room type</option>
                        {roomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                        <option value="new">Other (please specify)</option>
                    </select>
                    {newRoomType && (
                        <input
                            type="text"
                            name="roomType"
                            placeholder="Enter new room type"
                            value={roomDetails.roomType}
                            onChange={handleChange}
                        />
                    )}
                </div>
                <div className="form-group">
                    <label>Property Name <span style={{color:'#888', fontWeight:'normal'}}>(optional, e.g. "Sunrise PG" or "City Backpackers Hostel")</span></label>
                    <input
                        type="text"
                        name="roomName"
                        placeholder="e.g. Sunrise PG"
                        value={roomDetails.roomName}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Room Price</label>
                    <input
                        type="text"
                        name="roomPrice"
                        value={roomDetails.roomPrice}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Room Description</label>
                    <textarea
                        name="roomDescription"
                        value={roomDetails.roomDescription}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Total Inventory (number of rooms of this type)</label>
                    <input
                        type="number"
                        name="totalInventory"
                        min="1"
                        value={roomDetails.totalInventory}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <select name="location" value={roomDetails.location} onChange={handleChange}>
                        <option value="">Select a location</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
                <button className="update-button" onClick={addRoom}>Add Room</button>
            </div>
        </div>
    );
};

export default AddRoomPage;
