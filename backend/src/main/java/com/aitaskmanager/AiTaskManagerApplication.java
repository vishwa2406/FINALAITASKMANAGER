package com.aitaskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ============================================================
 * APPLICATION ENTRY POINT
 * ============================================================
 * This is a SPRING MVC application. The architecture is:
 *
 *   Client (React)
 *        │  HTTP Request (JSON)
 *        ▼
 *   ┌─────────────────────────────────────────────┐
 *   │  CONTROLLER  (controller/*)                  │
 *   │  Receives HTTP requests, delegates to Service │
 *   └───────────────────┬───────────────────────────┘
 *                        │ calls
 *                        ▼
 *   ┌─────────────────────────────────────────────┐
 *   │  SERVICE  (service/*)                         │
 *   │  Business logic. Talks to Model + builds View │
 *   └───────────────────┬───────────────────────────┘
 *                        │ uses
 *           ┌────────────┴─────────────┐
 *           ▼                          ▼
 *   ┌───────────────┐         ┌─────────────────────┐
 *   │  MODEL         │        │  VIEW                │
 *   │  (model/*)     │        │  (view/dto/*)         │
 *   │  JPA Entities  │        │  Request/Response DTOs│
 *   │  = source of   │        │  = what client sees   │
 *   │    truth in DB │        │    (JSON shape)        │
 *   └───────────────┘         └─────────────────────┘
 *
 * In a REST API, "View" isn't HTML — it's the JSON
 * representation returned to the client. Spring still calls
 * this pattern "Spring MVC" because the same Controller →
 * Service → Model flow applies; only the rendering technology
 * (JSON instead of JSP/Thymeleaf) differs.
 * ============================================================
 */
@SpringBootApplication
public class AiTaskManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiTaskManagerApplication.class, args);
        System.out.println("====================================");
        System.out.println("  AI Task Manager (Spring MVC) Started!");
        System.out.println("  API available at: http://localhost:8080/api");
        System.out.println("====================================");
    }
}
