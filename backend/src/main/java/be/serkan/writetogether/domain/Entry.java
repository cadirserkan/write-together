package be.serkan.writetogether.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

// One piece of text that a writer added during their turn.
@Entity
@Table(name = "entries")
public class Entry {

    public static final int MAX_LENGTH = 2000;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = MAX_LENGTH)
    private String text;

    // 1 for the first piece of the book, 2 for the second, ...
    @Column(nullable = false)
    private int position;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Entry() {
        // for JPA
    }

    public Entry(Book book, User author, String text, int position) {
        this.book = book;
        this.author = author;
        this.text = text;
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public Book getBook() {
        return book;
    }

    public User getAuthor() {
        return author;
    }

    public String getText() {
        return text;
    }

    public int getPosition() {
        return position;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
