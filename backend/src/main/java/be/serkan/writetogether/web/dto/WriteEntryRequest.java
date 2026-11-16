package be.serkan.writetogether.web.dto;

import be.serkan.writetogether.domain.Entry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WriteEntryRequest(
        @NotBlank(message = "Schrijf eerst iets.")
        @Size(max = Entry.MAX_LENGTH, message = "Je stuk mag maximaal 2000 tekens lang zijn.")
        String text
) {
}
