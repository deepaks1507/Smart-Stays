import axios from "axios"

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default class ApiService {

    static BASE_URL = "http://localhost:4040"

    static getHeader() {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    /**AUTH */

    /* This  register a new user */
    static async registerUser(registration) {
        const response = await axios.post(`${this.BASE_URL}/auth/register`, registration)
        return response.data
    }

    /* This  login a registered user */
    static async loginUser(loginDetails) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginDetails)
        return response.data
    }

    /***USERS */


    /*  This is  to get the user profile */
    static async getAllUsers() {
        const response = await axios.get(`${this.BASE_URL}/users/all`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async getUserProfile() {
        const response = await axios.get(`${this.BASE_URL}/users/get-logged-in-profile-info`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /* This is the  to get a single user */
    static async getUser(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/get-by-id/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /* This is the  to get user bookings by the user id */
    static async getUserBookings(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/get-user-bookings/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /* This is to delete a user */
    static async deleteUser(userId) {
        const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /**ROOM */
    /* This  adds a new room room to the database */
    static async addRoom(formData) {
        const result = await axios.post(`${this.BASE_URL}/rooms/add`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }

    /* This  gets all availavle rooms */
    static async getAllAvailableRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all-available-rooms`)
        return result.data
    }

    /* This gets available room counts grouped by room type */
    static async getRoomAvailabilitySummary() {
        const result = await axios.get(`${this.BASE_URL}/rooms/availability-summary`)
        return result.data
    }


    /* This  gets all availavle by dates rooms from the database with a given date and a room type */
    static async getAvailableRoomsByDateAndType(checkInDate, checkOutDate, roomType) {
        const result = await axios.get(
            `${this.BASE_URL}/rooms/available-rooms-by-date-and-type?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}`
        )
        return result.data
    }

    /* This  gets all room types from thee database */
    static async getRoomTypes() {
        const response = await axios.get(`${this.BASE_URL}/rooms/types`)
        return response.data
    }
    /* This  gets all rooms from the database */
    static async getAllRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all`)
        return result.data
    }
    /* This funcction gets a room by the id */
    static async getRoomById(roomId) {
        const result = await axios.get(`${this.BASE_URL}/rooms/room-by-id/${roomId}`)
        return result.data
    }

    /* This  deletes a room by the Id */
    static async deleteRoom(roomId) {
        const result = await axios.delete(`${this.BASE_URL}/rooms/delete/${roomId}`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /* This updates a room */
    static async updateRoom(roomId, formData) {
        const result = await axios.put(`${this.BASE_URL}/rooms/update/${roomId}`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }


    /**BOOKING */
    /* This  saves a new booking to the databse */
    static async bookRoom(roomId, userId, booking) {
        const response = await axios.post(`${this.BASE_URL}/bookings/book-room/${roomId}/${userId}`, booking, {
            headers: this.getHeader()
        })
        return response.data
    }

    /* This  gets alll bokings from the database */
    static async getAllBookings() {
        const result = await axios.get(`${this.BASE_URL}/bookings/all`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /* This  get booking by the cnfirmation code */
    static async getBookingByConfirmationCode(bookingCode) {
        const result = await axios.get(`${this.BASE_URL}/bookings/get-by-confirmation-code/${bookingCode}`)
        return result.data
    }

    /* This is the  to cancel user booking */
    static async cancelBooking(bookingId) {
        const result = await axios.delete(`${this.BASE_URL}/bookings/cancel/${bookingId}`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /**REVIEWS */
    static async addReview(bookingId, userId, reviewData) {
        const response = await axios.post(
            `${this.BASE_URL}/reviews/add/${bookingId}?userId=${userId}`,
            reviewData,
            { headers: this.getHeader() }
        )
        return response.data
    }

    static async getReviewsByRoom(roomId) {
        const response = await axios.get(`${this.BASE_URL}/reviews/room/${roomId}`)
        return response.data
    }

    static async getReviewsByUser(userId) {
        const response = await axios.get(`${this.BASE_URL}/reviews/user/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async addAdminReply(reviewId, reply) {
        const response = await axios.put(
            `${this.BASE_URL}/reviews/admin-reply/${reviewId}`,
            null,
            { headers: this.getHeader(), params: { reply } }
        )
        return response.data
    }

    /**WISHLIST */
    static async toggleWishlist(userId, roomId) {
        const response = await axios.post(
            `${this.BASE_URL}/wishlist/toggle?userId=${userId}&roomId=${roomId}`,
            null,
            { headers: this.getHeader() }
        )
        return response.data
    }

    static async getUserWishlist(userId) {
        const response = await axios.get(`${this.BASE_URL}/wishlist/user/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /**COUPONS */
    static async validateCoupon(code, amount) {
        const response = await axios.get(
            `${this.BASE_URL}/coupons/validate?code=${encodeURIComponent(code)}&amount=${amount}`
        )
        return response.data
    }

    static async getAllCoupons() {
        const response = await axios.get(`${this.BASE_URL}/coupons/all`, { headers: this.getHeader() })
        return response.data
    }

    static async createCoupon(coupon) {
        const response = await axios.post(`${this.BASE_URL}/coupons/create`, coupon, { headers: this.getHeader() })
        return response.data
    }

    static async deleteCoupon(couponId) {
        const response = await axios.delete(`${this.BASE_URL}/coupons/delete/${couponId}`, { headers: this.getHeader() })
        return response.data
    }

    static async toggleCouponActive(couponId) {
        const response = await axios.put(`${this.BASE_URL}/coupons/toggle/${couponId}`, null, { headers: this.getHeader() })
        return response.data
    }

    /**MEAL PLANS */
    static async getAllMealPlans() {
        const response = await axios.get(`${this.BASE_URL}/meal-plans/all`)
        return response.data
    }

    static async createMealPlan(mealPlan) {
        const response = await axios.post(`${this.BASE_URL}/meal-plans/create`, mealPlan, { headers: this.getHeader() })
        return response.data
    }

    static async deleteMealPlan(id) {
        const response = await axios.delete(`${this.BASE_URL}/meal-plans/delete/${id}`, { headers: this.getHeader() })
        return response.data
    }

    /**NOTIFICATIONS */
    static async getUserNotifications(userId) {
        const response = await axios.get(`${this.BASE_URL}/notifications/user/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async markNotificationsRead(userId) {
        const response = await axios.put(
            `${this.BASE_URL}/notifications/mark-read/${userId}`,
            null,
            { headers: this.getHeader() }
        )
        return response.data
    }

    static async getUnreadNotificationCount(userId) {
        const response = await axios.get(
            `${this.BASE_URL}/notifications/unread-count/${userId}`,
            { headers: this.getHeader() }
        )
        return response.data
    }

    /**PRICING RULES */
    static async getEffectivePrice(roomId, checkIn, checkOut) {
        const response = await axios.get(
            `${this.BASE_URL}/pricing-rules/effective-price/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}`
        )
        return response.data
    }

    /**LOCATIONS */
    static async getLocations() {
        const response = await axios.get(`${this.BASE_URL}/locations/all`)
        return response.data
    }

    static async getAdminLocations() {
        const response = await axios.get(`${this.BASE_URL}/locations/admin/all`, { headers: this.getHeader() })
        return response.data
    }

    static async addLocation(location) {
        const response = await axios.post(`${this.BASE_URL}/locations/add`, location, { headers: this.getHeader() })
        return response.data
    }

    static async toggleLocation(id) {
        const response = await axios.put(`${this.BASE_URL}/locations/toggle/${id}`, null, { headers: this.getHeader() })
        return response.data
    }

    static async deleteLocation(id) {
        const response = await axios.delete(`${this.BASE_URL}/locations/delete/${id}`, { headers: this.getHeader() })
        return response.data
    }

    /**PAYMENTS */
    static async getPaymentReport() {
        const response = await axios.get(`${this.BASE_URL}/payments/report`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async getPaymentAnalytics() {
        const response = await axios.get(`${this.BASE_URL}/payments/analytics`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async getAllPayments() {
        const response = await axios.get(`${this.BASE_URL}/payments/all`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /**AUTHENTICATION CHECKER */
    static logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    }

    static isAdmin() {
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }

    static isUser() {
        const role = localStorage.getItem('role')
        return role === 'USER'
    }
}