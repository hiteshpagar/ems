package com.ems.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ems.entity.Hr;

public interface HrRepository extends JpaRepository<Hr, Long> {

    Hr findByEmail(String email);

    Hr findByEmailIgnoreCase(String email);

    Hr findByUserId(Long userId);

    List<Hr> findByCompanyId(Long companyId);

    long countByCompanyId(Long companyId);

    long countByCompanyIdAndActive(Long companyId, Boolean active);

    void deleteByUserId(Long userId);
}
