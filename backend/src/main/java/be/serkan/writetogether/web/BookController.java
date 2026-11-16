package be.serkan.writetogether.web;

import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.service.BookService;
import be.serkan.writetogether.service.InvitationService;
import be.serkan.writetogether.web.dto.BookDetailDto;
import be.serkan.writetogether.web.dto.BookSummaryDto;
import be.serkan.writetogether.web.dto.CreateBookRequest;
import be.serkan.writetogether.web.dto.EntryDto;
import be.serkan.writetogether.web.dto.InvitationDto;
import be.serkan.writetogether.web.dto.WriteEntryRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final InvitationService invitationService;

    public BookController(BookService bookService, InvitationService invitationService) {
        this.bookService = bookService;
        this.invitationService = invitationService;
    }

    @GetMapping
    public List<BookSummaryDto> bookshelf(@AuthenticationPrincipal User user) {
        return bookService.getBookshelf(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookSummaryDto createBook(@AuthenticationPrincipal User user,
                                     @Valid @RequestBody CreateBookRequest request) {
        return bookService.createBook(user, request);
    }

    @GetMapping("/{id}")
    public BookDetailDto getBook(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return bookService.getBook(id, user);
    }

    @PostMapping("/{id}/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public EntryDto writeEntry(@PathVariable Long id,
                               @AuthenticationPrincipal User user,
                               @Valid @RequestBody WriteEntryRequest request) {
        return bookService.writeEntry(id, user, request.text());
    }

    @PostMapping("/{id}/finish")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void finishBook(@PathVariable Long id, @AuthenticationPrincipal User user) {
        bookService.finishBook(id, user);
    }

    @PostMapping("/{id}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationDto invite(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return invitationService.createInvitation(id, user);
    }
}
