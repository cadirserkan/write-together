package be.serkan.writetogether.web;

import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.service.InvitationService;
import be.serkan.writetogether.web.dto.InvitationDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping("/{code}")
    public InvitationDto getInvitation(@PathVariable String code) {
        return invitationService.getInvitation(code);
    }

    @PostMapping("/{code}/accept")
    public InvitationDto accept(@PathVariable String code, @AuthenticationPrincipal User user) {
        return invitationService.accept(code, user);
    }

    @PostMapping("/{code}/decline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decline(@PathVariable String code, @AuthenticationPrincipal User user) {
        invitationService.decline(code, user);
    }
}
