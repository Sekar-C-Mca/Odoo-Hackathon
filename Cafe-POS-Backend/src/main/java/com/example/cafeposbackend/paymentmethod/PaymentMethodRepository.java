package com.example.cafeposbackend.paymentmethod;
import com.example.cafeposbackend.common.enums.PaymentMethodType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByEnabledTrue();
    Optional<PaymentMethod> findByType(PaymentMethodType type);
}
