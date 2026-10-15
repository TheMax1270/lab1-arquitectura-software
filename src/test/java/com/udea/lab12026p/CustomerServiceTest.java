package com.udea.lab12026p;

import com.udea.lab12026p.dto.CustomerDTO;
import com.udea.lab12026p.entity.Customer;
import com.udea.lab12026p.mapper.CustomerMapper;
import com.udea.lab12026p.repository.CustomerRepository;
import com.udea.lab12026p.service.CustomerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void createCustomerShouldReturnSavedCustomer() {
        CustomerDTO inputDTO = new CustomerDTO();
        inputDTO.setFirstName("Max");
        inputDTO.setLastName("Perez");
        inputDTO.setAccountNumber("26462415");
        inputDTO.setBalance(1000.0);

        Customer customer = new Customer(
                null,
                "26462415",
                "Max",
                "Perez",
                1000.0
        );

        Customer savedCustomer = new Customer(
                1L,
                "26462415",
                "Max",
                "Perez",
                1000.0
        );

        CustomerDTO outputDTO = new CustomerDTO();
        outputDTO.setId(1L);
        outputDTO.setFirstName("Max");
        outputDTO.setLastName("Perez");
        outputDTO.setAccountNumber("26462415");
        outputDTO.setBalance(1000.0);

        when(customerMapper.toEntity(inputDTO)).thenReturn(customer);
        when(customerRepository.save(customer)).thenReturn(savedCustomer);
        when(customerMapper.toDTO(savedCustomer)).thenReturn(outputDTO);

        CustomerDTO result = customerService.createCustomer(inputDTO);

        assertEquals(1L, result.getId());
        assertEquals("Max", result.getFirstName());
        assertEquals("Perez", result.getLastName());
        assertEquals("26462415", result.getAccountNumber());
        assertEquals(1000.0, result.getBalance());
    }

    @Test
    void getCustomerByIdShouldReturnCustomer() {
        Customer customer = new Customer(
                1L,
                "26462415",
                "Max",
                "Perez",
                1000.0
        );

        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setId(1L);
        customerDTO.setFirstName("Max");
        customerDTO.setLastName("Perez");
        customerDTO.setAccountNumber("26462415");
        customerDTO.setBalance(1000.0);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerMapper.toDTO(customer)).thenReturn(customerDTO);

        CustomerDTO result = customerService.getCustomerById(1L);

        assertEquals(1L, result.getId());
        assertEquals("Max", result.getFirstName());
        assertEquals("Perez", result.getLastName());
    }
}
