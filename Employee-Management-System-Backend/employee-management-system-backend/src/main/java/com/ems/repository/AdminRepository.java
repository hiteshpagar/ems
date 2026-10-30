package com.ems.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ems.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Admin findByEmail(String email);

    Admin findByEmailIgnoreCase(String email);

    Admin findByUserId(Long userId);

    List<Admin> findByCompanyId(Long companyId);

    long countByCompanyId(Long companyId);

    long countByCompanyIdAndActive(Long companyId, Boolean active);

    void deleteByUserId(Long userId);
}
