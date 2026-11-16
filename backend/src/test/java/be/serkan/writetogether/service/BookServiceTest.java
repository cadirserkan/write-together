package be.serkan.writetogether.service;

import be.serkan.writetogether.domain.Book;
import be.serkan.writetogether.domain.BookMember;
import be.serkan.writetogether.domain.Entry;
import be.serkan.writetogether.domain.MemberRole;
import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.exception.NotFoundException;
import be.serkan.writetogether.exception.NotYourTurnException;
import be.serkan.writetogether.repository.BookMemberRepository;
import be.serkan.writetogether.repository.BookRepository;
import be.serkan.writetogether.repository.EntryRepository;
import be.serkan.writetogether.web.dto.EntryDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    private static final Long BOOK_ID = 10L;

    @Mock
    private BookRepository bookRepository;
    @Mock
    private BookMemberRepository memberRepository;
    @Mock
    private EntryRepository entryRepository;
    @Mock
    private PushNotificationService pushNotificationService;

    @InjectMocks
    private BookService bookService;

    private User serkan;
    private User elif;
    private Book book;

    @BeforeEach
    void setUp() {
        serkan = user(1L, "serkan");
        elif = user(2L, "elif");
        book = new Book("Ons verhaal", "#2f6b4f", serkan);
        ReflectionTestUtils.setField(book, "id", BOOK_ID);
    }

    @Test
    void writingPassesTheTurnToTheOtherWriter() {
        when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));
        when(memberRepository.findByBook(book)).thenReturn(List.of(
                new BookMember(book, serkan, MemberRole.OWNER),
                new BookMember(book, elif, MemberRole.WRITER)));
        when(entryRepository.countByBook(book)).thenReturn(4L);
        when(entryRepository.save(any(Entry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EntryDto entry = bookService.writeEntry(BOOK_ID, serkan, "  Het regende al drie dagen.  ");

        assertEquals("Het regende al drie dagen.", entry.text());
        assertEquals(5, entry.position());
        assertEquals("serkan", entry.author());
        assertEquals(elif, book.getCurrentTurn());
        verify(pushNotificationService).send(any(User.class), any(), any(), any());
    }

    @Test
    void writingWhenItIsNotYourTurnIsRefused() {
        when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));
        when(memberRepository.findByBook(book)).thenReturn(List.of(
                new BookMember(book, serkan, MemberRole.OWNER),
                new BookMember(book, elif, MemberRole.WRITER)));

        // The book was created with serkan as first writer, so elif has to wait.
        assertThrows(NotYourTurnException.class,
                () -> bookService.writeEntry(BOOK_ID, elif, "Ik wil ook iets schrijven."));

        verify(entryRepository, never()).save(any(Entry.class));
        assertEquals(serkan, book.getCurrentTurn());
    }

    @Test
    void afterTheOpeningTheOwnerWaitsForASecondWriter() {
        when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));
        when(memberRepository.findByBook(book)).thenReturn(List.of(
                new BookMember(book, serkan, MemberRole.OWNER)));
        when(entryRepository.countByBook(book)).thenReturn(0L);
        when(entryRepository.save(any(Entry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookService.writeEntry(BOOK_ID, serkan, "Er was eens...");

        assertNull(book.getCurrentTurn());
        verify(pushNotificationService, never()).send(any(), any(), any(), any());
    }

    @Test
    void someoneWhoIsNotAWriterCannotOpenTheBook() {
        User stranger = user(3L, "stranger");
        when(bookRepository.findById(BOOK_ID)).thenReturn(Optional.of(book));
        when(memberRepository.findByBook(book)).thenReturn(List.of(
                new BookMember(book, serkan, MemberRole.OWNER)));

        assertThrows(NotFoundException.class, () -> bookService.getBook(BOOK_ID, stranger));
    }

    private User user(Long id, String username) {
        User user = new User(username, username + "@example.com", "not-a-real-hash");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
