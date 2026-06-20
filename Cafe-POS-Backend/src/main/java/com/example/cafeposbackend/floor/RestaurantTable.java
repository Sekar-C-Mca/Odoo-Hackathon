package com.example.cafeposbackend.floor;

import com.example.cafeposbackend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_table")
@Getter
@Setter
@NoArgsConstructor
public class RestaurantTable extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "floor_id", nullable = false)
  private Floor floor;

  @Column(name = "table_number", nullable = false)
  private String tableNumber;

  @Column(nullable = false)
  private Integer seats;

  @Column(nullable = false)
  private boolean active = true;
}
