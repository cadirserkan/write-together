package be.serkan.writetogether.service;

import be.serkan.writetogether.domain.PushSubscription;
import be.serkan.writetogether.domain.User;
import be.serkan.writetogether.repository.PushSubscriptionRepository;
import be.serkan.writetogether.web.dto.PushSubscriptionRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;
    private final String publicKey;

    // Stays null when no VAPID keys are configured: the app then works without notifications.
    private final PushService pushService;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepository,
                                   ObjectMapper objectMapper,
                                   @Value("${app.push.public-key}") String publicKey,
                                   @Value("${app.push.private-key}") String privateKey,
                                   @Value("${app.push.subject}") String subject) throws GeneralSecurityException {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper = objectMapper;
        this.publicKey = publicKey;

        if (publicKey.isBlank() || privateKey.isBlank()) {
            log.info("No VAPID keys configured, push notifications are switched off.");
            this.pushService = null;
        } else {
            // The web-push library needs BouncyCastle for the encryption of the message.
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }
            this.pushService = new PushService(publicKey, privateKey, subject);
        }
    }

    // The browser needs the public key to create a subscription.
    public String getPublicKey() {
        return publicKey;
    }

    @Transactional
    public void subscribe(User user, PushSubscriptionRequest request) {
        PushSubscription existing = subscriptionRepository.findByEndpoint(request.endpoint()).orElse(null);

        if (existing == null) {
            subscriptionRepository.save(
                    new PushSubscription(user, request.endpoint(), request.p256dh(), request.auth()));
        } else {
            // Same browser as before, maybe with another account logged in now.
            existing.setUser(user);
            existing.setP256dh(request.p256dh());
            existing.setAuth(request.auth());
        }
    }

    @Transactional
    public void unsubscribe(User user, String endpoint) {
        subscriptionRepository.findByEndpoint(endpoint)
                .filter(subscription -> subscription.getUser().getId().equals(user.getId()))
                .ifPresent(subscriptionRepository::delete);
    }

    // @Async: sending happens on another thread, so the writer does not have to wait
    // for the push servers of Google/Apple/Mozilla before getting a response.
    @Async
    public void send(User recipient, String title, String body, String url) {
        if (pushService == null) {
            return;
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of("title", title, "body", body, "url", url));
        } catch (JsonProcessingException e) {
            log.warn("Could not build push message", e);
            return;
        }

        for (PushSubscription subscription : subscriptionRepository.findByUser(recipient)) {
            try {
                var response = pushService.send(new Notification(
                        subscription.getEndpoint(), subscription.getP256dh(), subscription.getAuth(), payload));

                // 404 or 410 means the browser dropped this subscription (app removed,
                // permission withdrawn), so there is no point in keeping it.
                int status = response.getStatusLine().getStatusCode();
                if (status == 404 || status == 410) {
                    subscriptionRepository.delete(subscription);
                }
            } catch (Exception e) {
                // A failed notification must never break writing itself.
                log.warn("Could not send push notification to user {}", recipient.getId(), e);
            }
        }
    }
}
