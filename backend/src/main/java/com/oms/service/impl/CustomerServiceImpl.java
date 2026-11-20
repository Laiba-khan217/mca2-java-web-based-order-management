package com.oms.service.impl;

import com.oms.dto.CustomerDTO;
import com.oms.entity.Customer;
import com.oms.exception.DuplicateResourceException;
import com.oms.exception.ResourceNotFoundException;
import com.oms.repository.CustomerRepository;
import com.oms.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    private CustomerDTO mapToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setCustomerCode(customer.getCustomerCode());
        dto.setCompanyName(customer.getCompanyName());
        dto.setContactPerson(customer.getContactPerson());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setGstin(customer.getGstin());
        dto.setBillingAddress(customer.getBillingAddress());
        dto.setCity(customer.getCity());
        dto.setState(customer.getState());
        dto.setPincode(customer.getPincode());
        dto.setIsActive(customer.getIsActive());
        return dto;
    }

    private Customer mapToEntity(CustomerDTO dto) {
        Customer customer = new Customer();
        customer.setCustomerCode(dto.getCustomerCode());
        customer.setCompanyName(dto.getCompanyName());
        customer.setContactPerson(dto.getContactPerson());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setGstin(dto.getGstin());
        customer.setBillingAddress(dto.getBillingAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setPincode(dto.getPincode());
        customer.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return customer;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToDTO(customer);
    }

    @Override
    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        if (dto.getCustomerCode() == null || dto.getCustomerCode().isBlank()) {
            dto.setCustomerCode("CUST-" + (1000 + customerRepository.count() + 1));
        } else if (customerRepository.existsByCustomerCode(dto.getCustomerCode())) {
            throw new DuplicateResourceException("Customer code '" + dto.getCustomerCode() + "' already exists.");
        }

        Customer customer = mapToEntity(dto);
        Customer saved = customerRepository.save(customer);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customer.setCompanyName(dto.getCompanyName());
        customer.setContactPerson(dto.getContactPerson());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setGstin(dto.getGstin());
        customer.setBillingAddress(dto.getBillingAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setPincode(dto.getPincode());
        if (dto.getIsActive() != null) customer.setIsActive(dto.getIsActive());

        Customer updated = customerRepository.save(customer);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setIsActive(false);
        customerRepository.save(customer);
    }
}
