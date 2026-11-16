package be.serkan.writetogether.repository;

import be.serkan.writetogether.domain.Book;
import be.serkan.writetogether.domain.BookMember;
import be.serkan.writetogether.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookMemberRepository extends JpaRepository<BookMember, Long> {

    List<BookMember> findByBook(Book book);

    // The bookshelf of a user: every book they are a member of.
    List<BookMember> findByUserOrderByJoinedAtDesc(User user);
}
