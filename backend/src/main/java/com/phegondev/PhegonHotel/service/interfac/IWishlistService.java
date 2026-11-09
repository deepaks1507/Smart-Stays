package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;

public interface IWishlistService {

    Response toggleWishlist(Long userId, Long roomId);

    Response getUserWishlist(Long userId);
}
