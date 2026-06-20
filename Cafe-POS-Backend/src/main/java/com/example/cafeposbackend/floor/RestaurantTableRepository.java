package com.example.cafeposbackend.floor;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
  List<RestaurantTable> findByFloorId(Long floorId);

  boolean existsByFloorId(Long floorId);
}
