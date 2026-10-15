package com.udea.lab12026p;

import com.udea.lab12026p.dto.TransactionDTO;
import com.udea.lab12026p.entity.Customer;
import com.udea.lab12026p.entity.Transaction;
import com.udea.lab12026p.repository.CustomerRepository;
import com.udea.lab12026p.repository.TransactionRepository;
import com.udea.lab12026p.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    private static final LocalDateTime TIMESTAMP = LocalDateTime.of(2026, 10, 15, 10, 30);

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void transferMoneyShouldUpdateBalancesAndReturnSavedTransaction() {
        Customer sender = customer("1001", 1000.0);
        Customer receiver = customer("1002", 200.0);
        TransactionDTO input = transfer();
        when(customerRepository.findByAccountNumber("1001")).thenReturn(Optional.of(sender));
        when(customerRepository.findByAccountNumber("1002")).thenReturn(Optional.of(receiver));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        TransactionDTO result = transactionService.transferMoney(input);

        assertEquals(750.0, sender.getBalance());
        assertEquals(450.0, receiver.getBalance());
        verify(customerRepository).save(sender);
        verify(customerRepository).save(receiver);
        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        Transaction persisted = captor.getValue();
        assertEquals("1001", persisted.getSenderAccountNumber());
        assertEquals("1002", persisted.getReceiverAccountNumber());
        assertEquals(250.0, persisted.getAmount());
        assertEquals(TIMESTAMP, persisted.getTimestamp());
        assertTransactionDTO(persisted, result);
        assertEquals(7L, result.getId());
    }

    @Test
    void transferMoneyShouldRejectNullSenderAccountNumber() {
        TransactionDTO input = transfer();
        input.setSenderAccountNumber(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> transactionService.transferMoney(input));

        assertEquals("Los números de cuenta del remitente y receptor son obligatorios.", exception.getMessage());
        verifyNoInteractions(customerRepository, transactionRepository);
    }

    @Test
    void transferMoneyShouldRejectMissingSender() {
        when(customerRepository.findByAccountNumber("1001")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> transactionService.transferMoney(transfer()));

        assertEquals("La cuenta del remitente no existe.", exception.getMessage());
        verify(customerRepository, never()).findByAccountNumber("1002");
        verify(customerRepository, never()).save(any(Customer.class));
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void transferMoneyShouldRejectMissingReceiver() {
        Customer sender = customer("1001", 1000.0);
        when(customerRepository.findByAccountNumber("1001")).thenReturn(Optional.of(sender));
        when(customerRepository.findByAccountNumber("1002")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> transactionService.transferMoney(transfer()));

        assertEquals("La cuenta del receptor no existe.", exception.getMessage());
        assertEquals(1000.0, sender.getBalance());
        verify(customerRepository, never()).save(any(Customer.class));
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void transferMoneyShouldRejectInsufficientBalance() {
        Customer sender = customer("1001", 100.0);
        Customer receiver = customer("1002", 200.0);
        when(customerRepository.findByAccountNumber("1001")).thenReturn(Optional.of(sender));
        when(customerRepository.findByAccountNumber("1002")).thenReturn(Optional.of(receiver));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> transactionService.transferMoney(transfer()));

        assertEquals("Saldo insuficiente en la cuenta del remitente.", exception.getMessage());
        assertEquals(100.0, sender.getBalance());
        assertEquals(200.0, receiver.getBalance());
        verify(customerRepository, never()).save(any(Customer.class));
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void getTransactionsForAccountShouldConvertEveryEntityToDTO() {
        Transaction outgoing = new Transaction(7L, "1001", "1002", 250.0, TIMESTAMP);
        Transaction incoming = new Transaction(8L, "1003", "1001", 125.0, TIMESTAMP.plusHours(1));
        when(transactionRepository.findBySenderAccountNumberOrReceiverAccountNumber("1001", "1001"))
                .thenReturn(List.of(outgoing, incoming));

        List<TransactionDTO> result = transactionService.getTransactionsForAccount("1001");

        assertEquals(2, result.size());
        assertTransactionDTO(outgoing, result.get(0));
        assertTransactionDTO(incoming, result.get(1));
        verify(transactionRepository).findBySenderAccountNumberOrReceiverAccountNumber("1001", "1001");
        verifyNoInteractions(customerRepository);
    }

    private static Customer customer(String accountNumber, double balance) {
        Customer customer = new Customer();
        customer.setAccountNumber(accountNumber);
        customer.setBalance(balance);
        return customer;
    }

    private static TransactionDTO transfer() {
        return new TransactionDTO(null, "1001", "1002", 250.0, TIMESTAMP);
    }

    private static void assertTransactionDTO(Transaction expected, TransactionDTO actual) {
        assertEquals(expected.getId(), actual.getId());
        assertEquals(expected.getSenderAccountNumber(), actual.getSenderAccountNumber());
        assertEquals(expected.getReceiverAccountNumber(), actual.getReceiverAccountNumber());
        assertEquals(expected.getAmount(), actual.getAmount());
        assertEquals(expected.getTimestamp(), actual.getTimestamp());
    }
}
