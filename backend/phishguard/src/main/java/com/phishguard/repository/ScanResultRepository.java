package com.phishguard.repository;

import com.phishguard.model.ScanResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScanResultRepository extends JpaRepository<ScanResult, Long> {
    List<ScanResult> findAllByOrderByScannedAtDesc();
    long countByVerdict(String verdict);
}