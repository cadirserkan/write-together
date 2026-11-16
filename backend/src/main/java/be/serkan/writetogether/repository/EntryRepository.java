package be.serkan.writetogether.repository;

import be.serkan.writetogether.domain.Book;
import be.serkan.writetogether.domain.Entry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EntryRepository extends JpaRepository<Entry, Long> {

    List<Entry> findByBookOrderByPositionAsc(Book book);

    long countByBook(Book book);
}
