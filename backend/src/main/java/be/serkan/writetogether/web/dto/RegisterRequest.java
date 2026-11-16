package be.serkan.writetogether.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Kies een gebruikersnaam.")
        @Size(min = 3, max = 30, message = "Je gebruikersnaam moet tussen 3 en 30 tekens lang zijn.")
        @Pattern(regexp = "[A-Za-z0-9_.-]*", message = "Gebruik alleen letters, cijfers, punt, streepje of underscore.")
        String username,

        @NotBlank(message = "Vul je e-mailadres in.")
        @Email(message = "Dit is geen geldig e-mailadres.")
        String email,

        @NotBlank(message = "Kies een wachtwoord.")
        @Size(min = 8, max = 100, message = "Je wachtwoord moet minstens 8 tekens lang zijn.")
        String password
) {
}
