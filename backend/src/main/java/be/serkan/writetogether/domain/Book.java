package be.serkan.writetogether.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String title;

    @Column(nullable = false, length = 7)
    private String coverColor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookStatus status = BookStatus.IN_PROGRESS;

    // Who may write the next piece. Empty while the owner waits for a second writer,
    // and when the book is finished.
    @ManyToOne
    @JoinColumn(name = "current_turn_id")
    private User currentTurn;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Book() {
        // for JPA
    }

    public Book(String title, String coverColor, User firstWriter) {
        this.title = title;
        this.coverColor = coverColor;
        this.currentTurn = firstWriter;
    }

    public boolean isFinished() {
        return status == BookStatus.FINISHED;
    }

    public boolean isTurnOf(User user) {
        return currentTurn != null && currentTurn.getId().equals(user.getId());
    }

    public void finish() {
        this.status = BookStatus.FINISHED;
        this.currentTurn = null;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCoverColor() {
        return coverColor;
    }

    public BookStatus getStatus() {
        return status;
    }

    public User getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(User currentTurn) {
        this.currentTurn = currentTurn;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
