package be.serkan.writetogether;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;

// We log in with our own JWT filter, so Spring's default in-memory user is not needed.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableAsync
public class WriteTogetherApplication {

    public static void main(String[] args) {
        SpringApplication.run(WriteTogetherApplication.class, args);
    }
}
