package com.phishguard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_results")
public class ScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String url;

    private String verdict;

    private int riskScore;

    @Column(columnDefinition = "TEXT")
    private String flaggedSignals;

    private LocalDateTime scannedAt;

    public ScanResult() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getFlaggedSignals() { return flaggedSignals; }
    public void setFlaggedSignals(String flaggedSignals) { this.flaggedSignals = flaggedSignals; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}