package com.oms.service;

import com.oms.dto.PaymentCreateDTO;
import com.oms.dto.PaymentDTO;
import java.util.List;

public interface PaymentService {
    List<PaymentDTO> getAllPayments();
    PaymentDTO getPaymentById(Long id);
    PaymentDTO recordPayment(PaymentCreateDTO dto, Long userId);
}
