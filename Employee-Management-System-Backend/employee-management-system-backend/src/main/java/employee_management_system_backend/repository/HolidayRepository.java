package employee_management_system_backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Holiday;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    boolean existsByHolidayDate(LocalDate holidayDate);

    boolean existsByHolidayDateAndIdNot(LocalDate holidayDate, Long id);

    List<Holiday> findAllByOrderByHolidayDateAsc();
}
