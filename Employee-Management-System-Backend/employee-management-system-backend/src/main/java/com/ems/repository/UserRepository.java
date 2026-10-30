package com.ems.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ems.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    User findByEmail(String email);

    User findByEmailIgnoreCase(String email);

    java.util.List<User> findByRole(String role);

    java.util.List<User> findByCompanyId(Long companyId);

    java.util.List<User> findByCompanyIdAndRole(Long companyId, String role);

    long countByCompanyIdAndRole(Long companyId, String role);

    long countByCompanyIdAndRoleAndActive(Long companyId, String role, Boolean active);
}
