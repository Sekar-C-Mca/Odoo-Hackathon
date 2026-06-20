package com.example.cafeposbackend.customer; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface CustomerRepository extends JpaRepository<Customer,Long>{List<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(String name,String email,String phone);}
