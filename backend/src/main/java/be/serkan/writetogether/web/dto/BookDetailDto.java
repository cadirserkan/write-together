package be.serkan.writetogether.web.dto;

import be.serkan.writetogether.domain.BookStatus;

import java.util.List;

// Everything the book page needs: the book itself, whose turn it is and all pieces in order.
public record BookDetailDto(
        Long id,
        String title,
        String coverColor,
        BookStatus status,
        boolean owner,
        boolean myTurn,
        String currentTurn,
        String partner,
        List<EntryDto> entries
) {
}
