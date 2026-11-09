import { Link } from 'react-router-dom';

const FooterComponent = () => {
    return (
        <footer className="my-footer">
            <span>SmartStays | All Rights Reserved &copy; {new Date().getFullYear()}</span>
            <span className="footer-divider">·</span>
            <Link to="/find-booking" className="footer-link">Find my Booking</Link>
        </footer>
    );
};

export default FooterComponent;
