package com.ems.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.HolidayRequest;
import com.ems.dto.HolidayResponse;
import com.ems.service.HolidayService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/holidays")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PostMapping
    public ResponseEntity<HolidayResponse> createHoliday(
            @Valid @RequestBody HolidayRequest request) {

        return new ResponseEntity<>(
                holidayService.createHoliday(request),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<HolidayResponse>> getAllHolidays() {

        return ResponseEntity.ok(holidayService.getAllHolidays());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HolidayResponse> getHolidayById(@PathVariable Long id) {

        return ResponseEntity.ok(holidayService.getHolidayById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HolidayResponse> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayRequest request) {

        return ResponseEntity.ok(holidayService.updateHoliday(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHoliday(@PathVariable Long id) {

        holidayService.deleteHoliday(id);

        return ResponseEntity.ok("Holiday deleted successfully.");
    }
}
