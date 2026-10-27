package employee_management_system_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import employee_management_system_backend.entity.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    Optional<Company> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
