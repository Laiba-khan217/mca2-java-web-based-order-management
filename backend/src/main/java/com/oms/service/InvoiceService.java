package com.oms.service;

import com.oms.dto.InvoiceCreateDTO;
import com.oms.dto.InvoiceDTO;
import java.util.List;

public interface InvoiceService {
    List<InvoiceDTO> getAllInvoices();
    InvoiceDTO getInvoiceById(Long id);
    InvoiceDTO createInvoiceFromOrder(InvoiceCreateDTO dto, Long userId);
    InvoiceDTO updateStatus(Long id, String status);
    void deleteInvoice(Long id);
}
