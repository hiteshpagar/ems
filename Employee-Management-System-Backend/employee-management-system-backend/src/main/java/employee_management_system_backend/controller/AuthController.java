package employee_management_system_backend.controller;



import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import employee_management_system_backend.entity.User;
import employee_management_system_backend.security.jwt.JwtUtil;
import employee_management_system_backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public User register(
            @RequestBody User user
    ) {

        return userService.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> loginUser(
            @RequestBody User user
    ) {

        User existingUser =
                userService.loginUser(user);

        String token =
                jwtUtil.generateToken(
                        existingUser.getEmail()
                );

        Map<String, String> response =
                new HashMap<>();

        response.put("token", token);

        return response;
    }
}