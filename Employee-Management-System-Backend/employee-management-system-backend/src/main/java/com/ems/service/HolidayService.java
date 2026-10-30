package com.ems.service;

import java.util.List;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.ems.dto.HolidayRequest;
import com.ems.dto.HolidayResponse;
import com.ems.entity.AuditAction;
import com.ems.entity.AuditModule;
import com.ems.entity.Holiday;
import com.ems.exception.ResourceAlreadyExistsException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.HolidayRepository;

@Service
public class HolidayService {

    private final HolidayRepository holidayRepository;
    private final EmployeeService employeeService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    public HolidayService(
            HolidayRepository holidayRepository,
            EmployeeService employeeService,
            EmailService emailService,
            AuditLogService auditLogService) {
        this.holidayRepository = holidayRepository;
        this.employeeService = employeeService;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
    }

    public HolidayResponse createHoliday(HolidayRequest request) {

        validateFutureOrToday(request.getHolidayDate());

        if (holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new ResourceAlreadyExistsException(
                    "Holiday already exists for this date.");
        }

        Holiday holiday = new Holiday();
        applyRequest(holiday, request);

        Holiday savedHoliday = holidayRepository.save(holiday);

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.HOLIDAY,
                savedHoliday.getId() != null ? savedHoliday.getId().toString() : null,
                "Created holiday " + savedHoliday.getName() + " on " + savedHoliday.getHolidayDate()
        );

        employeeService.getAllEmployees()
                .stream()
                .filter(employee -> employee.getEmail() != null)
                .forEach(employee ->
                        emailService.sendHolidayAnnouncement(employee, savedHoliday));

        return convertToResponse(savedHoliday);
    }

    public List<HolidayResponse> getAllHolidays() {

        return holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public HolidayResponse getHolidayById(Long id) {

        Holiday holiday = getHolidayEntity(id);

        return convertToResponse(holiday);
    }

    public HolidayResponse updateHoliday(Long id, HolidayRequest request) {

        validateFutureOrToday(request.getHolidayDate());

        Holiday holiday = getHolidayEntity(id);

        if (holidayRepository.existsByHolidayDateAndIdNot(
                request.getHolidayDate(), id)) {
            throw new ResourceAlreadyExistsException(
                    "Holiday already exists for this date.");
        }

        applyRequest(holiday, request);

        Holiday updatedHoliday = holidayRepository.save(holiday);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.HOLIDAY,
                updatedHoliday.getId().toString(),
                "Updated holiday " + updatedHoliday.getName() + " on " + updatedHoliday.getHolidayDate()
        );

        return convertToResponse(updatedHoliday);
    }

    public void deleteHoliday(Long id) {

        Holiday holiday = getHolidayEntity(id);
        String holidayName = holiday.getName();

        holidayRepository.delete(holiday);

        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.HOLIDAY,
                id.toString(),
                "Deleted holiday " + holidayName + " (ID: " + id + ")"
        );
    }

    private Holiday getHolidayEntity(Long id) {

        return holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Holiday not found."));
    }

    private void applyRequest(Holiday holiday, HolidayRequest request) {

        holiday.setName(request.getName().trim());
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setType(request.getType().trim());
        holiday.setDescription(request.getDescription());
    }

    private void validateFutureOrToday(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Holiday date cannot be in the past.");
        }
    }

    private HolidayResponse convertToResponse(Holiday holiday) {

        return new HolidayResponse(
                holiday.getId(),
                holiday.getName(),
                holiday.getHolidayDate(),
                holiday.getType(),
                holiday.getDescription(),
                holiday.getCreatedAt(),
                holiday.getUpdatedAt());
    }
}
