package employee_management_system_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import employee_management_system_backend.dto.AuditLogResponse;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditLog;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.AuditLogRepository;
import employee_management_system_backend.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void log(AuditAction action, AuditModule module, String entityId, String description) {
        try {
            User currentUser = getCurrentAuthenticatedUser();
            String ipAddress = getClientIpAddress();

            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setModule(module);
            log.setEntityId(entityId);
            log.setDescription(description);
            log.setIpAddress(ipAddress);
            log.setCreatedAt(LocalDateTime.now());

            if (currentUser != null) {
                log.setUserId(currentUser.getId());
                log.setPerformedBy(currentUser.getFullName());
                log.setPerformedByEmail(currentUser.getEmail());
                log.setPerformedByRole(currentUser.getRole());
            } else {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                    log.setPerformedByEmail(auth.getName());
                    log.setPerformedBy(auth.getName());
                } else {
                    log.setPerformedBy("SYSTEM");
                    log.setPerformedByRole("SYSTEM");
                }
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to persist audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void log(AuditAction action, AuditModule module, String entityId, String description, User user) {
        try {
            String ipAddress = getClientIpAddress();

            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setModule(module);
            log.setEntityId(entityId);
            log.setDescription(description);
            log.setIpAddress(ipAddress);
            log.setCreatedAt(LocalDateTime.now());

            if (user != null) {
                log.setUserId(user.getId());
                log.setPerformedBy(user.getFullName());
                log.setPerformedByEmail(user.getEmail());
                log.setPerformedByRole(user.getRole());
            } else {
                log.setPerformedBy("SYSTEM");
                log.setPerformedByRole("SYSTEM");
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to persist audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(
            int page,
            int size,
            AuditModule module,
            AuditAction action,
            Long userId,
            String search,
            LocalDate startDate,
            LocalDate endDate
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (module != null) {
                predicates.add(cb.equal(root.get("module"), module));
            }

            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }

            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(LocalTime.MAX)));
            }

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate searchDesc = cb.like(cb.lower(root.get("description")), term);
                Predicate searchName = cb.like(cb.lower(root.get("performedBy")), term);
                Predicate searchEmail = cb.like(cb.lower(root.get("performedByEmail")), term);
                predicates.add(cb.or(searchDesc, searchName, searchEmail));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findAll(spec, pageRequest).map(AuditLogResponse::from);
    }

    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(Long id) {
        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log entry not found with id: " + id));
        return AuditLogResponse.from(log);
    }

    private User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName());
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
