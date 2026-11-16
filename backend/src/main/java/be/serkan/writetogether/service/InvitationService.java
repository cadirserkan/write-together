package be.serkan.writetogether.service;

import be.serkan.writetogether.domain.Book;
import be.serkan.writetogether.domain.BookMember;
import be.serkan.writetogether.domain.Invitation;
import be.serkan.writetogether.domain.InvitationStatus;
import be.serkan.writetogether.domain.MemberRole;
import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.exception.ConflictException;
import be.serkan.writetogether.exception.ForbiddenException;
import be.serkan.writetogether.exception.NotFoundException;
import be.serkan.writetogether.repository.BookMemberRepository;
import be.serkan.writetogether.repository.BookRepository;
import be.serkan.writetogether.repository.InvitationRepository;
import be.serkan.writetogether.web.dto.InvitationDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class InvitationService {

    // No 0/O, 1/I or L: those are easy to mix up when someone types a code over.
    private static final String CODE_CHARACTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;

    private final InvitationRepository invitationRepository;
    private final BookRepository bookRepository;
    private final BookMemberRepository memberRepository;
    private final PushNotificationService pushNotificationService;
    private final SecureRandom random = new SecureRandom();

    public InvitationService(InvitationRepository invitationRepository,
                             BookRepository bookRepository,
                             BookMemberRepository memberRepository,
                             PushNotificationService pushNotificationService) {
        this.invitationRepository = invitationRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.pushNotificationService = pushNotificationService;
    }

    @Transactional
    public InvitationDto createInvitation(Long bookId, User user) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Dit boek bestaat niet."));
        List<BookMember> members = memberRepository.findByBook(book);

        BookMember me = members.stream()
                .filter(member -> member.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Dit boek bestaat niet."));

        if (!me.isOwner()) {
            throw new ForbiddenException("Alleen wie het boek startte kan iemand uitnodigen.");
        }
        if (book.isFinished()) {
            throw new ConflictException("Dit boek is al af.");
        }
        if (members.size() >= BookService.MAX_WRITERS) {
            throw new ConflictException("Dit boek heeft al twee schrijvers.");
        }

        // Reuse an invitation that is still open, so a link that was already shared keeps working.
        Invitation invitation = invitationRepository.findFirstByBookAndStatus(book, InvitationStatus.OPEN)
                .orElseGet(() -> invitationRepository.save(new Invitation(book, user, newCode())));

        return InvitationDto.from(invitation);
    }

    @Transactional(readOnly = true)
    public InvitationDto getInvitation(String code) {
        return InvitationDto.from(findByCode(code));
    }

    @Transactional
    public InvitationDto accept(String code, User user) {
        Invitation invitation = findByCode(code);
        Book book = invitation.getBook();
        List<BookMember> members = memberRepository.findByBook(book);

        boolean alreadyMember = members.stream()
                .anyMatch(member -> member.getUser().getId().equals(user.getId()));
        if (alreadyMember) {
            throw new ConflictException("Je schrijft al mee aan dit boek.");
        }
        if (!invitation.isOpen()) {
            throw new ConflictException("Deze uitnodiging is niet meer geldig.");
        }
        if (members.size() >= BookService.MAX_WRITERS) {
            throw new ConflictException("Dit boek heeft al twee schrijvers.");
        }

        memberRepository.save(new BookMember(book, user, MemberRole.WRITER));
        invitation.setStatus(InvitationStatus.ACCEPTED);

        // The owner already wrote the opening and was waiting: the new writer continues.
        if (book.getCurrentTurn() == null && !book.isFinished()) {
            book.setCurrentTurn(user);
        }

        pushNotificationService.send(
                invitation.getInvitedBy(),
                book.getTitle(),
                user.getUsername() + " schrijft nu met je mee.",
                "/books/" + book.getId());

        return InvitationDto.from(invitation);
    }

    @Transactional
    public void decline(String code, User user) {
        Invitation invitation = findByCode(code);

        if (invitation.getInvitedBy().getId().equals(user.getId())) {
            throw new ConflictException("Je kan je eigen uitnodiging niet weigeren.");
        }
        if (!invitation.isOpen()) {
            throw new ConflictException("Deze uitnodiging is niet meer geldig.");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
    }

    private Invitation findByCode(String code) {
        return invitationRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new NotFoundException("Deze uitnodiging bestaat niet."));
    }

    private String newCode() {
        String code;
        do {
            StringBuilder builder = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                builder.append(CODE_CHARACTERS.charAt(random.nextInt(CODE_CHARACTERS.length())));
            }
            code = builder.toString();
        } while (invitationRepository.existsByCode(code));
        return code;
    }
}
