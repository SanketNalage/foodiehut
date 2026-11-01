package com.foodiehut.websocket;

import com.foodiehut.dto.OrderDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);
    private final SimpMessagingTemplate messagingTemplate;

    public OrderEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishOrderCreated(OrderDto order) {
        OrderEvent event = new OrderEvent("ORDER_CREATED", order.getOrderNumber(), order.getStatus(), order);

        // Notify canteen topic
        String canteenTopic = "/topic/canteen/" + order.getCanteenCode() + "/orders";
        log.info("Publishing ORDER_CREATED event to {}", canteenTopic);
        messagingTemplate.convertAndSend(canteenTopic, event);

        // Notify student topic
        String studentTopic = "/topic/student/" + order.getStudentCode() + "/orders";
        log.info("Publishing ORDER_CREATED event to {}", studentTopic);
        messagingTemplate.convertAndSend(studentTopic, event);
    }

    public void publishOrderStatusUpdated(OrderDto order) {
        OrderEvent event = new OrderEvent("ORDER_STATUS_UPDATED", order.getOrderNumber(), order.getStatus(), order);

        // Notify canteen topic
        String canteenTopic = "/topic/canteen/" + order.getCanteenCode() + "/orders";
        log.info("Publishing ORDER_STATUS_UPDATED event to {}", canteenTopic);
        messagingTemplate.convertAndSend(canteenTopic, event);

        // Notify student topic
        String studentTopic = "/topic/student/" + order.getStudentCode() + "/orders";
        log.info("Publishing ORDER_STATUS_UPDATED event to {}", studentTopic);
        messagingTemplate.convertAndSend(studentTopic, event);

        // Notify specific order topic
        String orderTopic = "/topic/orders/" + order.getOrderNumber();
        messagingTemplate.convertAndSend(orderTopic, event);
    }
}
