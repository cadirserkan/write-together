package be.serkan.writetogether.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Vul je gebruikersnaam in.")
        String username,

        @NotBlank(message = "Vul je wachtwoord in.")
        String password
) {
}
