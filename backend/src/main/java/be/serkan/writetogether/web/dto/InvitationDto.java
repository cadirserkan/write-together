package be.serkan.writetogether.web.dto;

import be.serkan.writetogether.domain.Invitation;
import be.serkan.writetogether.domain.InvitationStatus;

public record InvitationDto(String code, Long bookId, String bookTitle, String invitedBy, InvitationStatus status) {

    public static InvitationDto from(Invitation invitation) {
        return new InvitationDto(
                invitation.getCode(),
                invitation.getBook().getId(),
                invitation.getBook().getTitle(),
                invitation.getInvitedBy().getUsername(),
                invitation.getStatus());
    }
}
