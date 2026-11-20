package com.oms.service.impl;

import com.oms.dto.PaymentCreateDTO;
import com.oms.dto.PaymentDTO;
import com.oms.entity.Invoice;
import com.oms.entity.Payment;
import com.oms.entity.User;
import com.oms.exception.BadRequestException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.InvoiceRepository;
import com.oms.repository.PaymentRepository;
import com.oms.repository.UserRepository;
import com.oms.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToDTO(payment);
    }

    @Override
    @Transactional
    public PaymentDTO recordPayment(PaymentCreateDTO dto, Long userId) {
        Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", dto.getInvoiceId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if (dto.getAmount().compareTo(invoice.getBalanceDue()) > 0) {
            throw new BadRequestException("Payment amount (Rs " + dto.getAmount() + ") cannot exceed balance due (Rs " + invoice.getBalanceDue() + ")");
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setRecordedBy(user);
        payment.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now());
        payment.setAmount(dto.getAmount());
        payment.setPaymentMode(dto.getPaymentMode().toUpperCase());
        payment.setTransactionReference(dto.getTransactionReference());
        payment.setRemarks(dto.getRemarks());
        payment.setStatus("SUCCESS");

        int year = LocalDate.now().getYear();
        long count = paymentRepository.count() + 1;
        payment.setPaymentNumber(String.format("PAY-%d-%04d", year, count));

        // Update Invoice Balance Due & Status
        BigDecimal newBalance = invoice.getBalanceDue().subtract(dto.getAmount());
        invoice.setBalanceDue(newBalance);
        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("PARTIALLY_PAID");
        }
        invoiceRepository.save(invoice);

        Payment saved = paymentRepository.save(payment);
        return mapToDTO(saved);
    }

    private PaymentDTO mapToDTO(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        dto.setPaymentNumber(p.getPaymentNumber());
        dto.setInvoiceId(p.getInvoice().getId());
        dto.setInvoiceNumber(p.getInvoice().getInvoiceNumber());
        dto.setCustomerName(p.getInvoice().getSalesOrder().getCustomer().getCompanyName());
        dto.setRecordedByUserId(p.getRecordedBy().getId());
        dto.setRecordedByName(p.getRecordedBy().getFirstName() + " " + (p.getRecordedBy().getLastName() != null ? p.getRecordedBy().getLastName() : ""));
        dto.setPaymentDate(p.getPaymentDate());
        dto.setAmount(p.getAmount());
        dto.setPaymentMode(p.getPaymentMode());
        dto.setTransactionReference(p.getTransactionReference());
        dto.setStatus(p.getStatus());
        dto.setRemarks(p.getRemarks());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
