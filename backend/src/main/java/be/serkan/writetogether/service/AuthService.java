package be.serkan.writetogether.service;

import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.exception.ConflictException;
import be.serkan.writetogether.exception.InvalidLoginException;
import be.serkan.writetogether.repository.UserRepository;
import be.serkan.writetogether.security.JwtService;
import be.serkan.writetogether.web.dto.AuthResponse;
import be.serkan.writetogether.web.dto.LoginRequest;
import be.serkan.writetogether.web.dto.RegisterRequest;
import be.serkan.writetogether.web.dto.UserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Deze gebruikersnaam is al bezet.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Er bestaat al een account met dit e-mailadres.");
        }

        // Never store the password itself, only the BCrypt hash.
        String passwordHash = passwordEncoder.encode(request.password());
        User user = userRepository.save(new User(request.username(), email, passwordHash));

        return new AuthResponse(jwtService.createToken(user), UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Same error for an unknown username and a wrong password,
        // so nobody can find out which usernames exist.
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(InvalidLoginException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidLoginException();
        }

        return new AuthResponse(jwtService.createToken(user), UserDto.from(user));
    }
}
