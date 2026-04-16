package com.phishguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
 
@SpringBootApplication
public class PhishGuardApplication {
    public static void main(String[] args) {
        SpringApplication.run(PhishGuardApplication.class, args);
        System.out.println("\n==============================================");
        System.out.println("  PhishGuard AI is RUNNING on port 8080!");
        System.out.println("  Test: http://localhost:8080/api/health");
        System.out.println("==============================================\n");
    }
}
 