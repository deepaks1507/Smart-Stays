import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const EditRoomPage = () => {
    const { roomId } = useParams();
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
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        Promise.all([ApiService.getRoomById(roomId), ApiService.getLocations()])
            .then(([response, locsRes]) => {
                setRoomDetails({
                    roomPhotoUrl: response.room.roomPhotoUrl,
                    roomType: response.room.roomType,
                    roomName: response.room.roomName || '',
                    roomPrice: response.room.roomPrice,
                    roomDescription: response.room.roomDescription,
                    totalInventory: response.room.totalInventory,
                    location: response.room.location || '',
                });
                setLocations((locsRes.locationList || []).map(l => l.name));
            })
            .catch(err => setError(err.response?.data?.message || err.message));
    }, [roomId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
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


    const handleUpdate = async () => {
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

            const result = await ApiService.updateRoom(roomId, formData);
            if (result.statusCode === 200) {
                setSuccess('Room updated successfully.');

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

    const handleDelete = async () => {
        if (window.confirm('Do you want to delete this room?')) {
            try {
                const result = await ApiService.deleteRoom(roomId);
                if (result.statusCode === 200) {
                    setSuccess('Room Deleted successfully.');
                    
                    setTimeout(() => {
                        setSuccess('');
                        navigate('/admin/manage-rooms');
                    }, 3000);
                }
            } catch (error) {
                setError(error.response?.data?.message || error.message);
                setTimeout(() => setError(''), 5000);
            }
        }
    };

    return (
        <div className="edit-room-container">
            <h2>Edit Room</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="edit-room-form">
                <div className="form-group">
                    {preview ? (
                        <img src={preview} alt="Room Preview" className="room-photo-preview" />
                    ) : (
                        roomDetails.roomPhotoUrl && (
                            <img src={roomDetails.roomPhotoUrl} alt="Room" className="room-photo" />
                        )
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
                    <input
                        type="text"
                        name="roomType"
                        value={roomDetails.roomType}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Property Name <span style={{color:'#888', fontWeight:'normal'}}>(optional, e.g. "Sunrise PG")</span></label>
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
                <button className="update-button" onClick={handleUpdate}>Update Room</button>
                <button className="delete-button" onClick={handleDelete}>Delete Room</button>
            </div>
        </div>
    );
};

export default EditRoomPage;
