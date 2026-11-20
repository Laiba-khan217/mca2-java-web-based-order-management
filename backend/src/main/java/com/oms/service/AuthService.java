package com.oms.service;

import com.oms.dto.JwtAuthResponse;
import com.oms.dto.LoginRequest;
import com.oms.dto.UserDTO;

public interface AuthService {
    JwtAuthResponse login(LoginRequest loginRequest);
    UserDTO getCurrentUser();
}
