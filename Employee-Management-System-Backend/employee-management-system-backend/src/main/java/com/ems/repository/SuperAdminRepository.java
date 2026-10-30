package com.ems.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ems.entity.SuperAdmin;

public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {

    SuperAdmin findByEmail(String email);

    SuperAdmin findByEmailIgnoreCase(String email);

    SuperAdmin findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
