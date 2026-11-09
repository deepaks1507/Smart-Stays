import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';
import RoomResult from '../common/RoomResult';
import RoomSearch from '../common/RoomSearch';

const ROOMS_PER_PAGE = 8;

const AllRoomsPage = () => {
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchResult = (results) => {
    setFilteredRooms(results);
    setSelectedRoomType('');
    setSelectedLocation('');
    setIsSearchActive(true);
    setCurrentPage(1);
  };

  useEffect(() => {
    Promise.all([ApiService.getAllRooms(), ApiService.getRoomTypes(), ApiService.getLocations()])
      .then(([roomsRes, types, locsRes]) => {
        setAllRooms(roomsRes.roomList);
        setFilteredRooms(roomsRes.roomList);
        setRoomTypes(types);
        setLocations((locsRes.locationList || []).map(l => l.name));
      })
      .catch((err) => console.error('Error fetching rooms:', err.message));
  }, []);

  const applyFilters = (type, location, rooms) => {
    let result = rooms;
    if (type) result = result.filter(r => r.roomType === type);
    if (location) result = result.filter(r => r.location === location);
    return result;
  };

  const handleRoomTypeChange = (type) => {
    setSelectedRoomType(type);
    setIsSearchActive(false);
    setCurrentPage(1);
    setFilteredRooms(applyFilters(type, selectedLocation, allRooms));
  };

  const handleLocationChange = (e) => {
    const loc = e.target.value;
    setSelectedLocation(loc);
    setIsSearchActive(false);
    setCurrentPage(1);
    setFilteredRooms(applyFilters(selectedRoomType, loc, allRooms));
  };

  const handleClearSearch = () => {
    setFilteredRooms(applyFilters(selectedRoomType, selectedLocation, allRooms));
    setIsSearchActive(false);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * ROOMS_PER_PAGE;
  const currentRooms = filteredRooms.slice(indexOfLast - ROOMS_PER_PAGE, indexOfLast);

  return (
    <div className='all-rooms'>
      <div className="all-rooms-header">
        <h2>All Rooms</h2>
        <span className="rooms-count">
          {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
          {selectedRoomType ? ` · ${selectedRoomType}` : ''}
          {selectedLocation ? ` · ${selectedLocation}` : ''}
          {isSearchActive ? ' · date search' : ''}
        </span>
      </div>

      {/* Filters row: type pills + location dropdown */}
      <div className="all-rooms-filters">
        <div className="room-type-filter-buttons">
          <button
            className={`room-type-btn ${selectedRoomType === '' && !isSearchActive ? 'active' : ''}`}
            onClick={() => handleRoomTypeChange('')}
          >
            All Types
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

        <select
          className="location-filter-select"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Date + type search */}
      <RoomSearch handleSearchResult={handleSearchResult} />

      {isSearchActive && (
        <div className="search-active-banner">
          Showing date availability results —{' '}
          <button className="clear-search-link" onClick={handleClearSearch}>Clear</button>
        </div>
      )}

      <RoomResult roomSearchResults={currentRooms} />

      <Pagination
        roomsPerPage={ROOMS_PER_PAGE}
        totalRooms={filteredRooms.length}
        currentPage={currentPage}
        paginate={page => setCurrentPage(page)}
      />
    </div>
  );
};

export default AllRoomsPage;
