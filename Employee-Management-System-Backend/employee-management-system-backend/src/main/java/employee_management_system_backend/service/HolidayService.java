package employee_management_system_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import employee_management_system_backend.dto.HolidayRequest;
import employee_management_system_backend.dto.HolidayResponse;
import employee_management_system_backend.entity.Holiday;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.HolidayRepository;

@Service
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public HolidayResponse createHoliday(HolidayRequest request) {

        if (holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new ResourceAlreadyExistsException(
                    "Holiday already exists for this date.");
        }

        Holiday holiday = new Holiday();
        applyRequest(holiday, request);

        return convertToResponse(holidayRepository.save(holiday));
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

        Holiday holiday = getHolidayEntity(id);

        if (holidayRepository.existsByHolidayDateAndIdNot(
                request.getHolidayDate(), id)) {
            throw new ResourceAlreadyExistsException(
                    "Holiday already exists for this date.");
        }

        applyRequest(holiday, request);

        return convertToResponse(holidayRepository.save(holiday));
    }

    public void deleteHoliday(Long id) {

        Holiday holiday = getHolidayEntity(id);

        holidayRepository.delete(holiday);
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
