package com.example.cafeposbackend.floor;

import com.example.cafeposbackend.common.enums.OrderStatus;
import com.example.cafeposbackend.common.exception.ResourceNotFoundException;
import com.example.cafeposbackend.floor.FloorDtos.*;
import com.example.cafeposbackend.order.Order;
import com.example.cafeposbackend.order.OrderRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FloorServiceImpl implements FloorService {
  private final FloorRepository floorRepository;
  private final RestaurantTableRepository tableRepository;
  private final OrderRepository orderRepository;

  public FloorServiceImpl(
      FloorRepository floorRepository,
      RestaurantTableRepository tableRepository,
      OrderRepository orderRepository) {
    this.floorRepository = floorRepository;
    this.tableRepository = tableRepository;
    this.orderRepository = orderRepository;
  }

  @Override
  public FloorResponse create(FloorRequest request) {
    Floor floor = new Floor();
    floor.setName(request.name().trim());
    return map(floorRepository.save(floor));
  }

  @Override
  @Transactional(readOnly = true)
  public List<FloorResponse> getAll() {
    return floorRepository.findAll().stream().map(this::map).toList();
  }

  @Override
  public FloorResponse update(Long id, FloorRequest request) {
    Floor floor = findFloor(id);
    floor.setName(request.name().trim());
    return map(floorRepository.save(floor));
  }

  @Override
  public void delete(Long id) {
    floorRepository.delete(findFloor(id));
  }

  @Override
  public TableResponse createTable(Long floorId, TableRequest request) {
    RestaurantTable table = new RestaurantTable();
    table.setFloor(findFloor(floorId));
    apply(table, request);
    return map(tableRepository.save(table));
  }

  @Override
  public List<TableResponse> getTables(Long floorId) {
    findFloor(floorId);
    return tableRepository.findByFloorId(floorId).stream().map(this::map).toList();
  }

  @Override
  public TableResponse updateTable(Long id, TableRequest request) {
    RestaurantTable table = findTable(id);
    apply(table, request);
    return map(tableRepository.save(table));
  }

  @Override
  public void deleteTable(Long id) {
    tableRepository.delete(findTable(id));
  }

  @Override
  public TableStatusResponse getTableStatus(Long id) {
    findTable(id);
    Order active =
        orderRepository.findAll().stream()
            .filter(order -> order.getTable() != null && order.getTable().getId().equals(id))
            .filter(order -> order.getStatus() == OrderStatus.DRAFT)
            .findFirst()
            .orElse(null);
    return new TableStatusResponse(id, active != null, active == null ? null : active.getId());
  }

  private void apply(RestaurantTable table, TableRequest request) {
    table.setTableNumber(request.tableNumber().trim());
    table.setSeats(request.seats());
    table.setActive(request.active() == null || request.active());
  }

  private Floor findFloor(Long id) {
    return floorRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Floor", id));
  }

  private RestaurantTable findTable(Long id) {
    return tableRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Table", id));
  }

  private FloorResponse map(Floor floor) {
    return new FloorResponse(floor.getId(), floor.getName(), getTables(floor.getId()));
  }

  private TableResponse map(RestaurantTable table) {
    return new TableResponse(
        table.getId(),
        table.getFloor().getId(),
        table.getTableNumber(),
        table.getSeats(),
        table.isActive());
  }
}
