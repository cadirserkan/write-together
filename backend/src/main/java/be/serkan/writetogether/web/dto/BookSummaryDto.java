package be.serkan.writetogether.web.dto;

import be.serkan.writetogether.domain.BookStatus;

// What the bookshelf needs to draw one book.
public record BookSummaryDto(
        Long id,
        String title,
        String coverColor,
        BookStatus status,
        boolean myTurn,
        String partner,
        long entryCount
) {
}
