package com.oms.service;

import com.oms.dto.SalesOrderCreateDTO;
import com.oms.dto.SalesOrderDTO;
import java.util.List;

public interface SalesOrderService {
    List<SalesOrderDTO> getAllOrders();
    SalesOrderDTO getOrderById(Long id);
    SalesOrderDTO createOrder(SalesOrderCreateDTO dto, Long userId);
    SalesOrderDTO updateOrderStatus(Long id, String status);
    void deleteOrder(Long id);
}
