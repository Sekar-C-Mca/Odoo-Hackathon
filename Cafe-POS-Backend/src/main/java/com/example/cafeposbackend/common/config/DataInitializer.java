package com.example.cafeposbackend.common.config;

import com.example.cafeposbackend.common.enums.PaymentMethodType;
import com.example.cafeposbackend.paymentmethod.PaymentMethod;
import com.example.cafeposbackend.paymentmethod.PaymentMethodRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {
  private final PaymentMethodRepository paymentMethodRepository;

  public DataInitializer(PaymentMethodRepository paymentMethodRepository) {
    this.paymentMethodRepository = paymentMethodRepository;
  }

  @Override
  public void run(ApplicationArguments args) {
    for (PaymentMethodType type : PaymentMethodType.values()) {
      paymentMethodRepository
          .findByType(type)
          .orElseGet(
              () -> {
                PaymentMethod method = new PaymentMethod();
                method.setType(type);
                method.setEnabled(type == PaymentMethodType.CASH);
                return paymentMethodRepository.save(method);
              });
    }
  }
}
