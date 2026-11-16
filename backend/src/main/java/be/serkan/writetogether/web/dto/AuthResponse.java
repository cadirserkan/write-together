package be.serkan.writetogether.web.dto;

public record AuthResponse(String token, UserDto user) {
}
