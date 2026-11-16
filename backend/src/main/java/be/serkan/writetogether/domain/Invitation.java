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
@Table(name = "invitations")
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(optional = false)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    // The code is part of the link the owner shares with the other writer.
    @Column(unique = true, nullable = false, length = 12)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvitationStatus status = InvitationStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Invitation() {
        // for JPA
    }

    public Invitation(Book book, User invitedBy, String code) {
        this.book = book;
        this.invitedBy = invitedBy;
        this.code = code;
    }

    public boolean isOpen() {
        return status == InvitationStatus.OPEN;
    }

    public Long getId() {
        return id;
    }

    public Book getBook() {
        return book;
    }

    public User getInvitedBy() {
        return invitedBy;
    }

    public String getCode() {
        return code;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
