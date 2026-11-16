package be.serkan.writetogether.service;

import be.serkan.writetogether.domain.Book;
import be.serkan.writetogether.domain.BookMember;
import be.serkan.writetogether.domain.Entry;
import be.serkan.writetogether.domain.MemberRole;
import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.exception.ConflictException;
import be.serkan.writetogether.exception.ForbiddenException;
import be.serkan.writetogether.exception.NotFoundException;
import be.serkan.writetogether.exception.NotYourTurnException;
import be.serkan.writetogether.repository.BookMemberRepository;
import be.serkan.writetogether.repository.BookRepository;
import be.serkan.writetogether.repository.EntryRepository;
import be.serkan.writetogether.web.dto.BookDetailDto;
import be.serkan.writetogether.web.dto.BookSummaryDto;
import be.serkan.writetogether.web.dto.CreateBookRequest;
import be.serkan.writetogether.web.dto.EntryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    // Version 1 keeps it at two writers per book. The data model (BookMember) already
    // allows more, so opening this up later only means changing this number
    // and deciding in which order a group takes turns.
    public static final int MAX_WRITERS = 2;

    private final BookRepository bookRepository;
    private final BookMemberRepository memberRepository;
    private final EntryRepository entryRepository;
    private final PushNotificationService pushNotificationService;

    public BookService(BookRepository bookRepository,
                       BookMemberRepository memberRepository,
                       EntryRepository entryRepository,
                       PushNotificationService pushNotificationService) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.entryRepository = entryRepository;
        this.pushNotificationService = pushNotificationService;
    }

    @Transactional
    public BookSummaryDto createBook(User user, CreateBookRequest request) {
        // Whoever starts the book also writes the first piece.
        Book book = bookRepository.save(new Book(request.title().trim(), request.coverColor().toLowerCase(), user));
        memberRepository.save(new BookMember(book, user, MemberRole.OWNER));

        return new BookSummaryDto(book.getId(), book.getTitle(), book.getCoverColor(), book.getStatus(),
                true, null, 0);
    }

    // The bookshelf is not a table of its own: it is every book the user is a member of.
    @Transactional(readOnly = true)
    public List<BookSummaryDto> getBookshelf(User user) {
        return memberRepository.findByUserOrderByJoinedAtDesc(user).stream()
                .map(member -> toSummary(member.getBook(), user))
                .toList();
    }

    @Transactional(readOnly = true)
    public BookDetailDto getBook(Long bookId, User user) {
        Book book = findBook(bookId);
        List<BookMember> members = memberRepository.findByBook(book);
        BookMember me = requireMember(members, user);

        List<EntryDto> entries = entryRepository.findByBookOrderByPositionAsc(book).stream()
                .map(EntryDto::from)
                .toList();

        return new BookDetailDto(
                book.getId(),
                book.getTitle(),
                book.getCoverColor(),
                book.getStatus(),
                me.isOwner(),
                book.isTurnOf(user),
                book.getCurrentTurn() == null ? null : book.getCurrentTurn().getUsername(),
                findPartner(members, user).map(User::getUsername).orElse(null),
                entries);
    }

    // Saving the piece and passing the turn happen in one transaction:
    // either both succeed or neither does, so a book can never end up half updated.
    @Transactional
    public EntryDto writeEntry(Long bookId, User author, String text) {
        Book book = findBook(bookId);
        List<BookMember> members = memberRepository.findByBook(book);
        requireMember(members, author);

        if (book.isFinished()) {
            throw new ConflictException("Dit boek is af, er kan niets meer bij.");
        }
        if (!book.isTurnOf(author)) {
            throw new NotYourTurnException();
        }

        int position = (int) entryRepository.countByBook(book) + 1;
        Entry entry = entryRepository.save(new Entry(book, author, text.strip(), position));

        // Pass the turn to the other writer. If nobody has joined yet, nobody is up:
        // the owner writes the opening and then waits for a second writer.
        Optional<User> partner = findPartner(members, author);
        book.setCurrentTurn(partner.orElse(null));

        partner.ifPresent(nextWriter -> pushNotificationService.send(
                nextWriter,
                book.getTitle(),
                author.getUsername() + " heeft geschreven. Jij bent aan de beurt!",
                "/books/" + book.getId()));

        return EntryDto.from(entry);
    }

    @Transactional
    public void finishBook(Long bookId, User user) {
        Book book = findBook(bookId);
        List<BookMember> members = memberRepository.findByBook(book);
        BookMember me = requireMember(members, user);

        if (!me.isOwner()) {
            throw new ForbiddenException("Alleen wie het boek startte kan het afsluiten.");
        }
        if (book.isFinished()) {
            return;
        }

        book.finish();

        findPartner(members, user).ifPresent(partner -> pushNotificationService.send(
                partner,
                book.getTitle(),
                user.getUsername() + " heeft het boek afgesloten. Lees nu het hele verhaal.",
                "/books/" + book.getId()));
    }

    private Book findBook(Long bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Dit boek bestaat niet."));
    }

    // Someone who is not a writer of the book gets the same answer as for a book
    // that does not exist, so ids of other people's books cannot be guessed.
    private BookMember requireMember(List<BookMember> members, User user) {
        return members.stream()
                .filter(member -> member.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Dit boek bestaat niet."));
    }

    private Optional<User> findPartner(List<BookMember> members, User user) {
        return members.stream()
                .map(BookMember::getUser)
                .filter(other -> !other.getId().equals(user.getId()))
                .findFirst();
    }

    private BookSummaryDto toSummary(Book book, User user) {
        List<BookMember> members = memberRepository.findByBook(book);

        return new BookSummaryDto(
                book.getId(),
                book.getTitle(),
                book.getCoverColor(),
                book.getStatus(),
                book.isTurnOf(user),
                findPartner(members, user).map(User::getUsername).orElse(null),
                entryRepository.countByBook(book));
    }
}
