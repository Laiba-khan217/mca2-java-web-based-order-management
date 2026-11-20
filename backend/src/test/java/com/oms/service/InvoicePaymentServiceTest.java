package com.oms.service;

import com.oms.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class InvoicePaymentServiceTest {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private PaymentService paymentService;

    @Test
    @DisplayName("Should generate invoice from sales order, apply GST, and deduct balance on payment")
    void testInvoiceAndPaymentFlow() {
        // Create an Invoice from Sales Order 1
        InvoiceCreateDTO createDTO = new InvoiceCreateDTO();
        createDTO.setSalesOrderId(1L);
        createDTO.setInvoiceDate(LocalDate.now());
        createDTO.setDueDate(LocalDate.now().plusDays(30));

        InvoiceDTO invoice = invoiceService.createInvoiceFromOrder(createDTO, 1L);

        assertNotNull(invoice);
        assertNotNull(invoice.getInvoiceNumber());
        assertTrue(invoice.getGrandTotal().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(invoice.getGrandTotal(), invoice.getBalanceDue());
        assertEquals("ISSUED", invoice.getStatus());

        // Verify Indian GST breakdown
        if ("Maharashtra".equalsIgnoreCase(invoice.getCustomerState())) {
            assertTrue(invoice.getCgstAmount().compareTo(BigDecimal.ZERO) > 0, "Intrastate should have CGST");
            assertTrue(invoice.getSgstAmount().compareTo(BigDecimal.ZERO) > 0, "Intrastate should have SGST");
            assertEquals(BigDecimal.ZERO, invoice.getIgstAmount(), "Intrastate should have 0 IGST");
        } else {
            assertTrue(invoice.getIgstAmount().compareTo(BigDecimal.ZERO) > 0, "Interstate should have IGST");
        }

        // Record Partial Payment
        BigDecimal paymentAmt = new BigDecimal("50000.00");
        PaymentCreateDTO payDTO = new PaymentCreateDTO();
        payDTO.setInvoiceId(invoice.getId());
        payDTO.setAmount(paymentAmt);
        payDTO.setPaymentMode("NEFT");
        payDTO.setTransactionReference("TEST-UTR-" + System.currentTimeMillis());
        payDTO.setRemarks("Academic unit test payment");

        PaymentDTO payment = paymentService.recordPayment(payDTO, 1L);
        assertNotNull(payment);
        assertEquals("SUCCESS", payment.getStatus());

        // Check updated invoice balance
        InvoiceDTO updatedInv = invoiceService.getInvoiceById(invoice.getId());
        BigDecimal expectedBalance = invoice.getGrandTotal().subtract(paymentAmt);
        assertEquals(0, expectedBalance.compareTo(updatedInv.getBalanceDue()));
        assertEquals("PARTIALLY_PAID", updatedInv.getStatus());
    }
}
