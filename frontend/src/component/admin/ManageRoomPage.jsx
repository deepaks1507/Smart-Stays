import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';
import RoomResult from '../common/RoomResult';

const ROOMS_PER_PAGE = 8;

const ManageRoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([ApiService.getAllRooms(), ApiService.getRoomTypes()])
      .then(([roomsRes, types]) => {
        setRooms(roomsRes.roomList);
        setFilteredRooms(roomsRes.roomList);
        setRoomTypes(types);
      })
      .catch((err) => console.error('Error fetching rooms:', err.message));
  }, []);

  const handleRoomTypeChange = (type) => {
    setSelectedRoomType(type);
    setCurrentPage(1);
    setFilteredRooms(type === '' ? rooms : rooms.filter(r => r.roomType === type));
  };

  const indexOfLast = currentPage * ROOMS_PER_PAGE;
  const currentRooms = filteredRooms.slice(indexOfLast - ROOMS_PER_PAGE, indexOfLast);

  return (
    <div className="admin-manage-page">
      <div className="admin-manage-header">
        <div>
          <h2>Manage Rooms</h2>
          <span className="rooms-count">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
            {selectedRoomType ? ` · ${selectedRoomType}` : ''}
          </span>
        </div>
        <button className="admin-add-btn" onClick={() => navigate('/admin/add-room')}>
          + Add Room
        </button>
      </div>

      {/* Type filter pills */}
      <div className="room-type-filter-buttons">
        <button
          className={`room-type-btn ${selectedRoomType === '' ? 'active' : ''}`}
          onClick={() => handleRoomTypeChange('')}
        >
          All
        </button>
        {roomTypes.map(type => (
          <button
            key={type}
            className={`room-type-btn ${selectedRoomType === type ? 'active' : ''}`}
            onClick={() => handleRoomTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <RoomResult roomSearchResults={currentRooms} layout="grid" />

      <Pagination
        roomsPerPage={ROOMS_PER_PAGE}
        totalRooms={filteredRooms.length}
        currentPage={currentPage}
        paginate={page => setCurrentPage(page)}
      />
    </div>
  );
};

export default ManageRoomPage;
