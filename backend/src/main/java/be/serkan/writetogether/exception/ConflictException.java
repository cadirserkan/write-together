package be.serkan.writetogether.exception;

// The request itself is valid, but it does not fit the current state
// (username already taken, book already full, ...).
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
