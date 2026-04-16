package com.phishguard.model;

import java.util.List;

public class AnalysisResult {

    private String verdict;
    private int score;
    private List<String> flags;
    private String message;

    public AnalysisResult(String verdict, int score, List<String> flags) {
        this.verdict = verdict;
        this.score   = score;
        this.flags   = flags;
        this.message = switch (verdict) {
            case "MALICIOUS"   -> "High threat! Risk score: " + score + "/100. Do NOT visit this URL.";
            case "SUSPICIOUS"  -> "Suspicious signals found. Risk score: " + score + "/100. Be careful.";
            default            -> "URL appears safe. Risk score: " + score + "/100.";
        };
    }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public List<String> getFlags() { return flags; }
    public void setFlags(List<String> flags) { this.flags = flags; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}