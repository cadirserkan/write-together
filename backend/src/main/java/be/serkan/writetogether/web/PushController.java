package be.serkan.writetogether.web;

import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.service.PushNotificationService;
import be.serkan.writetogether.web.dto.PushKeyDto;
import be.serkan.writetogether.web.dto.PushSubscriptionRequest;
import be.serkan.writetogether.web.dto.UnsubscribeRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/push")
public class PushController {

    private final PushNotificationService pushNotificationService;

    public PushController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    // Empty when the server has no VAPID keys; the frontend then hides the notification button.
    @GetMapping("/public-key")
    public PushKeyDto publicKey() {
        return new PushKeyDto(pushNotificationService.getPublicKey());
    }

    @PostMapping("/subscriptions")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void subscribe(@AuthenticationPrincipal User user,
                          @Valid @RequestBody PushSubscriptionRequest request) {
        pushNotificationService.subscribe(user, request);
    }

    @PostMapping("/unsubscribe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unsubscribe(@AuthenticationPrincipal User user,
                            @Valid @RequestBody UnsubscribeRequest request) {
        pushNotificationService.unsubscribe(user, request.endpoint());
    }
}
