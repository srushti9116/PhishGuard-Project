package com.phishguard.controller;

import com.phishguard.model.AnalysisResult;
import com.phishguard.model.ScanResult;
import com.phishguard.repository.ScanResultRepository;
import com.phishguard.service.DetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST,
    RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class UrlController {

    @Autowired
    private DetectionService detectionService;

    @Autowired
    private ScanResultRepository repository;

    // POST /api/scan
    @PostMapping("/scan")
    public ResponseEntity<?> scan(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "URL is required");
            return ResponseEntity.badRequest().body(err);
        }

        AnalysisResult result = detectionService.analyze(url.trim());

        ScanResult record = new ScanResult();
        record.setUrl(url.trim());
        record.setVerdict(result.getVerdict());
        record.setRiskScore(result.getScore());
        record.setFlaggedSignals(String.join(", ", result.getFlags()));
        record.setScannedAt(LocalDateTime.now());
        repository.save(record);

        return ResponseEntity.ok(result);
    }

    // GET /api/history
    @GetMapping("/history")
    public ResponseEntity<List<ScanResult>> history() {
        return ResponseEntity.ok(repository.findAllByOrderByScannedAtDesc());
    }

    // GET /api/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> s = new HashMap<>();
        s.put("totalScans",      repository.count());
        s.put("maliciousCount",  repository.countByVerdict("MALICIOUS"));
        s.put("suspiciousCount", repository.countByVerdict("SUSPICIOUS"));
        s.put("safeCount",       repository.countByVerdict("SAFE"));
        return ResponseEntity.ok(s);
    }

    // GET /api/health
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> h = new HashMap<>();
        h.put("status",  "UP");
        h.put("service", "PhishGuard AI");
        return ResponseEntity.ok(h);
    }

    // DELETE /api/history/{id}
    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteOne(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        Map<String, String> r = new HashMap<>();
        r.put("message", "Deleted");
        return ResponseEntity.ok(r);
    }

    // DELETE /api/history
    @DeleteMapping("/history")
    public ResponseEntity<?> deleteAll() {
        repository.deleteAll();
        Map<String, String> r = new HashMap<>();
        r.put("message", "All records cleared");
        return ResponseEntity.ok(r);
    }
}