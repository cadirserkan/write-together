package be.serkan.writetogether.repository;

import be.serkan.writetogether.domain.Book;
import be.serkan.writetogether.domain.Invitation;
import be.serkan.writetogether.domain.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByCode(String code);

    Optional<Invitation> findFirstByBookAndStatus(Book book, InvitationStatus status);

    boolean existsByCode(String code);
}
