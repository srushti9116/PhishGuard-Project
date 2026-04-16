package com.phishguard.service;

import com.phishguard.model.AnalysisResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class DetectionService {

    private static final List<String> PHISHING_KEYWORDS = List.of(
        "login", "verify", "secure", "account", "update",
        "banking", "confirm", "suspend", "unlock", "password",
        "signin", "paypal", "amazon", "microsoft", "credential"
    );

    private static final List<String> RISKY_TLDS = List.of(
        ".tk", ".xyz", ".ru", ".ml", ".ga", ".cf", ".gq", ".top", ".click", ".work"
    );

    private static final Pattern IP_PATTERN =
        Pattern.compile(".*\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}.*");

    public AnalysisResult analyze(String url) {
        int score = 0;
        List<String> flags = new ArrayList<>();

        if (url == null || url.isBlank()) {
            return new AnalysisResult("SAFE", 0, flags);
        }

        String lower = url.toLowerCase().trim();

        // Rule 1: No HTTPS
        if (!lower.startsWith("https://")) {
            score += 20;
            flags.add("No HTTPS encryption");
        }

        // Rule 2: Long URL
        if (url.length() > 75) {
            score += 15;
            flags.add("Very long URL (" + url.length() + " characters)");
        }

        // Rule 3: @ symbol
        if (lower.contains("@")) {
            score += 25;
            flags.add("@ symbol found (credential spoofing trick)");
        }

        // Rule 4: IP address as domain
        if (IP_PATTERN.matcher(lower).matches()) {
            score += 30;
            flags.add("IP address used instead of domain name");
        }

        // Rule 5: Phishing keywords
        for (String kw : PHISHING_KEYWORDS) {
            if (lower.contains(kw)) {
                score += 20;
                flags.add("Phishing keyword detected: '" + kw + "'");
                break;
            }
        }

        // Rule 6: Risky TLD
        for (String tld : RISKY_TLDS) {
            if (lower.contains(tld)) {
                score += 25;
                flags.add("High-risk TLD: " + tld);
                break;
            }
        }

        // Rule 7: Hyphen in domain
        String domain = extractDomain(lower);
        if (domain.contains("-")) {
            score += 10;
            flags.add("Hyphen in domain name");
        }

        // Rule 8: Too many subdomains
        long dots = domain.chars().filter(c -> c == '.').count();
        if (dots >= 3) {
            score += 20;
            flags.add("Excessive subdomains (" + dots + " dots)");
        }

        // Rule 9: URL encoded characters
        if (lower.contains("%") || lower.contains("0x")) {
            score += 15;
            flags.add("URL-encoded or obfuscated characters");
        }

        // Rule 10: Double slash in path
        String path = lower.replaceFirst("https?://", "");
        if (path.contains("//")) {
            score += 10;
            flags.add("Double slash in URL path");
        }

        score = Math.min(score, 100);

        String verdict = score >= 60 ? "MALICIOUS"
                       : score >= 30 ? "SUSPICIOUS"
                       : "SAFE";

        return new AnalysisResult(verdict, score, flags);
    }

    private String extractDomain(String url) {
        try {
            String s = url.replaceFirst("https?://", "");
            int slash = s.indexOf('/');
            return slash > 0 ? s.substring(0, slash) : s;
        } catch (Exception e) {
            return url;
        }
    }
}