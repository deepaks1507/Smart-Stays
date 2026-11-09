import React, { useState } from "react";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import { useNavigate } from "react-router-dom";

const SERVICES = [
  {
    img: "./assets/images/ac.png",
    title: "Air Conditioning",
    desc: "Individually controlled in-room A/C keeps you cool and comfortable all day and night.",
  },
  {
    img: "./assets/images/mini-bar.png",
    title: "Mini Bar",
    desc: "Complimentary selection of beverages and snacks stocked fresh in every room.",
  },
  {
    img: "./assets/images/parking.png",
    title: "Free Parking",
    desc: "On-site parking for all guests with valet options available on request.",
  },
  {
    img: "./assets/images/wifi.png",
    title: "High-Speed Wi-Fi",
    desc: "Complimentary gigabit Wi-Fi in all guest rooms and common areas.",
  },
];

const STATS = [
  { value: "500+", label: "Rooms" },
  { value: "4.8★", label: "Guest Rating" },
  { value: "20+", label: "Room Types" },
  { value: "24/7", label: "Support" },
];

const HomePage = () => {
  const [roomSearchResults, setRoomSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearchResult = (results) => {
    setRoomSearchResults(results);
  };

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <img
          src="./assets/images/hotel.webp"
          alt="SmartStays"
          className="hero-img"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">Welcome to SmartStays</p>
          <h1 className="hero-title">
            Your Perfect Stay <br />
            <span className="hero-accent">Awaits You</span>
          </h1>
          <p className="hero-sub">
            Hotels · PG · Hostels · Lodges · Banquet Halls · Auditoriums
          </p>
          <button
            className="hero-cta"
            onClick={() => navigate("/rooms")}
          >
            Explore All Rooms
          </button>
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <div className="home-search-wrapper">
        <RoomSearch handleSearchResult={handleSearchResult} />
      </div>

      {/* ── SEARCH RESULTS ── */}
      {roomSearchResults.length > 0 && (
        <section className="home-search-results">
          <h2 className="section-title">Available Rooms</h2>
          <RoomResult roomSearchResults={roomSearchResults} />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <a className="view-rooms-home" href="/rooms">
              View all rooms →
            </a>
          </div>
        </section>
      )}

      {/* ── STATS STRIP ── */}
      <section className="stats-strip">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── SERVICES ── */}
      <section className="services-section">
        <div className="section-header">
          <p className="section-eyebrow">What we offer</p>
          <h2 className="section-title">
            Amenities &amp; <span className="phegon-color">Services</span>
          </h2>
          <p className="section-sub">
            Every stay comes with the comforts that matter most.
          </p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div key={s.title} className="service-card">
              <div className="service-icon-wrap">
                <img src={s.img} alt={s.title} />
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-description">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Ready for an unforgettable stay?</h2>
          <p>Browse our full collection of rooms and book in minutes.</p>
          <button className="cta-banner-btn" onClick={() => navigate("/rooms")}>
            Browse Rooms
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
