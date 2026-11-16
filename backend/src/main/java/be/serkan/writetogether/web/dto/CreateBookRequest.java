package be.serkan.writetogether.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateBookRequest(
        @NotBlank(message = "Geef je boek een titel.")
        @Size(max = 80, message = "De titel mag maximaal 80 tekens lang zijn.")
        String title,

        @NotBlank(message = "Kies een kleur voor de cover.")
        @Pattern(regexp = "#[0-9a-fA-F]{6}", message = "De kleur moet een hex-kleur zijn, zoals #2f6b4f.")
        String coverColor
) {
}
