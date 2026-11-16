package be.serkan.writetogether.web.dto;

import be.serkan.writetogether.domain.Entry;

import java.time.LocalDateTime;

public record EntryDto(Long id, String author, String text, int position, LocalDateTime createdAt) {

    public static EntryDto from(Entry entry) {
        return new EntryDto(
                entry.getId(),
                entry.getAuthor().getUsername(),
                entry.getText(),
                entry.getPosition(),
                entry.getCreatedAt());
    }
}
