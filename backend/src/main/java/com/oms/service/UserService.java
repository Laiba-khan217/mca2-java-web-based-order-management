package com.oms.service;

import com.oms.dto.UserCreateDTO;
import com.oms.dto.UserDTO;
import com.oms.entity.Role;

import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO createUser(UserCreateDTO userCreateDTO);
    UserDTO updateUser(Long id, UserDTO userDTO);
    void toggleUserStatus(Long id);
    List<Role> getAllRoles();
}
