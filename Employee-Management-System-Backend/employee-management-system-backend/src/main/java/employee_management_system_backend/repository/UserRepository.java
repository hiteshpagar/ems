package employee_management_system_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    User findByEmail(String email);

    java.util.List<User> findByRole(String role);
}
