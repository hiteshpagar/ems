package com.ems.controller;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.DashboardStatsDTO;
import com.ems.service.DashboardService;
import com.ems.dto.AttendanceStatsDTO;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDTO getDashboardStats(org.springframework.security.core.Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return dashboardService.getDashboardStats(userEmail);
    }
    
    @GetMapping("/attendance-stats")
    public AttendanceStatsDTO getAttendanceStats(org.springframework.security.core.Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return dashboardService.getAttendanceStats(userEmail);
    }
}