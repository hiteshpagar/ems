package employee_management_system_backend.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.User;
import employee_management_system_backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {

        return userRepository.save(user);
    }

    public User login(
            String email,
            String password
    ) {

        User user =
                userRepository.findByEmail(email);

        if(user != null &&
           user.getPassword().equals(password)) {

            return user;
        }

        return null;
    }
    
    public User loginUser(
            User user
    ) {

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (
            existingUser != null
            &&
            existingUser.getPassword()
                .equals(user.getPassword())
        ) {

            return existingUser;
        }

        throw new RuntimeException(
                "Invalid Email or Password"
        );
    }
}
