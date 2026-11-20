package com.oms.service;

import com.oms.dto.GoodsReceiptDTO;
import com.oms.dto.PurchaseOrderCreateDTO;
import com.oms.dto.PurchaseOrderDTO;
import java.util.List;

public interface PurchaseOrderService {
    List<PurchaseOrderDTO> getAllPurchaseOrders();
    PurchaseOrderDTO getPurchaseOrderById(Long id);
    PurchaseOrderDTO createPurchaseOrder(PurchaseOrderCreateDTO dto, Long userId);
    PurchaseOrderDTO updateStatus(Long id, String status);
    PurchaseOrderDTO receiveGoods(Long id, GoodsReceiptDTO receiptDTO);
    void deletePurchaseOrder(Long id);
}
