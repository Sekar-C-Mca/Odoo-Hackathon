package com.example.cafeposbackend.selfordering;

import com.example.cafeposbackend.common.enums.OrderStatus;
import com.example.cafeposbackend.common.enums.SelfOrderingMode;
import com.example.cafeposbackend.common.enums.SessionStatus;
import com.example.cafeposbackend.common.exception.BusinessRuleException;
import com.example.cafeposbackend.common.exception.ResourceNotFoundException;
import com.example.cafeposbackend.common.util.PDFUtil;
import com.example.cafeposbackend.common.util.QRCodeUtil;
import com.example.cafeposbackend.floor.*;
import com.example.cafeposbackend.order.*;
import com.example.cafeposbackend.product.*;
import com.example.cafeposbackend.product.ProductDtos.ProductResponse;
import com.example.cafeposbackend.selfordering.SelfOrderDtos.*;
import com.example.cafeposbackend.session.PosSession;
import com.example.cafeposbackend.session.PosSessionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SelfOrderServiceImpl implements SelfOrderService {
  private final SelfOrderingConfigRepository configRepository;
  private final RestaurantTableRepository tableRepository;
  private final TableQrCodeRepository qrRepository;
  private final ProductService productService;
  private final ProductRepository productRepository;
  private final PosSessionRepository sessionRepository;
  private final OrderRepository orderRepository;
  private final OrderLineRepository lineRepository;
  private final QRCodeUtil qrCodeUtil;
  private final PDFUtil pdfUtil;
  private final String publicBaseUrl;

  public SelfOrderServiceImpl(
      SelfOrderingConfigRepository configRepository,
      RestaurantTableRepository tableRepository,
      TableQrCodeRepository qrRepository,
      ProductService productService,
      ProductRepository productRepository,
      PosSessionRepository sessionRepository,
      OrderRepository orderRepository,
      OrderLineRepository lineRepository,
      QRCodeUtil qrCodeUtil,
      PDFUtil pdfUtil,
      @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl) {
    this.configRepository = configRepository;
    this.tableRepository = tableRepository;
    this.qrRepository = qrRepository;
    this.productService = productService;
    this.productRepository = productRepository;
    this.sessionRepository = sessionRepository;
    this.orderRepository = orderRepository;
    this.lineRepository = lineRepository;
    this.qrCodeUtil = qrCodeUtil;
    this.pdfUtil = pdfUtil;
    this.publicBaseUrl = publicBaseUrl;
  }

  @Override
  public SelfOrderConfigResponse getConfig() {
    return map(configRepository.findById(1L).orElseGet(this::defaultConfig));
  }

  @Override
  public SelfOrderConfigResponse updateConfig(SelfOrderConfigRequest request) {
    SelfOrderingConfig config = configRepository.findById(1L).orElseGet(this::defaultConfig);
    if (request.mode() != null) config.setMode(request.mode());
    if (request.enabled() != null) config.setEnabled(request.enabled());
    config.setBackgroundColor(request.backgroundColor());
    config.setBackgroundImageUrl(request.backgroundImageUrl());
    return map(configRepository.save(config));
  }

  @Override
  public String generateTableQr(Long tableId) {
    TableQrCode qr = qr(tableId);
    return qrCodeUtil.base64(publicBaseUrl + "/s/" + qr.getToken());
  }

  @Override
  public byte[] downloadQrPdf(Long tableId) {
    TableQrCode qr = qr(tableId);
    return pdfUtil.qrDocument(
        "Table " + qr.getTable().getTableNumber(),
        qrCodeUtil.png(publicBaseUrl + "/s/" + qr.getToken(), 420));
  }

  @Override
  public TableTokenResponse resolveToken(String token) {
    TableQrCode qr =
        qrRepository
            .findByToken(token)
            .orElseThrow(() -> new ResourceNotFoundException("Table token", token));
    return new TableTokenResponse(qr.getTable().getId(), qr.getTable().getTableNumber(), token);
  }

  @Override
  public List<ProductResponse> getMenu(String token) {
    resolveToken(token);
    return productService.getAll(Pageable.unpaged(), null, null).getContent();
  }

  @Override
  @Transactional
  public SelfOrderResponse placeOrder(String token, SelfOrderRequest request) {
    if (!getConfig().enabled()) {
      throw new BusinessRuleException("Self ordering is disabled");
    }
    TableTokenResponse tableToken = resolveToken(token);
    RestaurantTable table =
        tableRepository
            .findById(tableToken.tableId())
            .orElseThrow(() -> new ResourceNotFoundException("Table", tableToken.tableId()));
    PosSession session =
        sessionRepository
            .findFirstByStatusOrderByOpenedAtDesc(SessionStatus.OPEN)
            .orElseThrow(() -> new BusinessRuleException("Cafe is not accepting orders"));
    Order order = new Order();
    order.setOrderNumber("SELF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    order.setSession(session);
    order.setTable(table);
    order.setEmployee(session.getEmployee());
    order.setStatus(OrderStatus.DRAFT);
    order = orderRepository.save(order);
    BigDecimal subtotal = BigDecimal.ZERO;
    BigDecimal tax = BigDecimal.ZERO;
    for (OrderDtos.OrderLineRequest requestLine : request.lines()) {
      Product product =
          productRepository
              .findById(requestLine.productId())
              .orElseThrow(() -> new ResourceNotFoundException("Product", requestLine.productId()));
      BigDecimal total =
          product.getPrice().multiply(requestLine.quantity()).setScale(2, RoundingMode.HALF_UP);
      OrderLine line = new OrderLine();
      line.setOrder(order);
      line.setProduct(product);
      line.setQuantity(requestLine.quantity());
      line.setUnitPrice(product.getPrice());
      line.setLineTotal(total);
      lineRepository.save(line);
      subtotal = subtotal.add(total);
      if (product.getTax() != null) {
        tax =
            tax.add(
                total
                    .multiply(product.getTax().getRatePercent())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
      }
    }
    order.setSubtotal(subtotal);
    order.setTaxTotal(tax);
    order.setDiscountTotal(BigDecimal.ZERO);
    order.setTotalAmount(subtotal.add(tax));
    orderRepository.save(order);
    return new SelfOrderResponse(
        order.getId(),
        order.getOrderNumber(),
        table.getId(),
        order.getTotalAmount(),
        order.getStatus());
  }

  @Override
  public OrderStatusResponse trackOrder(Long orderId) {
    Order order =
        orderRepository
            .findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    return new OrderStatusResponse(order.getId(), order.getOrderNumber(), order.getStatus());
  }

  private SelfOrderingConfig defaultConfig() {
    SelfOrderingConfig config = new SelfOrderingConfig();
    config.setMode(SelfOrderingMode.QR_MENU);
    config.setEnabled(false);
    return configRepository.save(config);
  }

  private TableQrCode qr(Long tableId) {
    return qrRepository
        .findByTableId(tableId)
        .orElseGet(
            () -> {
              RestaurantTable table =
                  tableRepository
                      .findById(tableId)
                      .orElseThrow(() -> new ResourceNotFoundException("Table", tableId));
              TableQrCode qr = new TableQrCode();
              qr.setTable(table);
              qr.setToken(UUID.randomUUID().toString());
              return qrRepository.save(qr);
            });
  }

  private SelfOrderConfigResponse map(SelfOrderingConfig config) {
    return new SelfOrderConfigResponse(
        config.getId(),
        config.getMode(),
        config.isEnabled(),
        config.getBackgroundColor(),
        config.getBackgroundImageUrl());
  }
}
